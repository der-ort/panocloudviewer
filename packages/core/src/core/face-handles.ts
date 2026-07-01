import * as THREE from "three";

/** Axis index → human name for cursor logic */
type FaceAxis = "x" | "y" | "z";
type FaceSign = 1 | -1;

interface FaceHandle {
  mesh: THREE.Mesh;
  axis: FaceAxis;
  sign: FaceSign;
}

interface DragState {
  handle: FaceHandle;
  /** Plane perpendicular to camera through the handle, used for raycasting */
  plane: THREE.Plane;
  /** Initial intersection on the drag plane */
  startIntersect: THREE.Vector3;
  /** Box center (world) at drag start. */
  startCenter: THREE.Vector3;
  /** Box size (local dimensions) at drag start. */
  startSize: THREE.Vector3;
  /** World-space unit vector of the box-local face axis (Z-rotated). */
  worldAxis: THREE.Vector3;
}

/** Per-axis base colors: X=red, Y=green, Z=blue. */
const AXIS_COLOR: Record<FaceAxis, number> = {
  x: 0xef4444,
  y: 0x22c55e,
  z: 0x3b82f6,
};
const HANDLE_HOVER_COLOR = 0xffffff;
const HANDLE_DRAG_COLOR = 0xf97316;

/**
 * Manages 6 face-center handles for interactive Box3 resizing.
 * Each handle controls one face of the box (min.x, max.x, min.y, max.y, min.z, max.z).
 */
export class FaceHandleController {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private handles: FaceHandle[] = [];
  private box: THREE.Box3 | null = null;
  private onChange: ((box: THREE.Box3) => void) | null = null;
  private drag: DragState | null = null;
  private hoveredHandle: FaceHandle | null = null;
  private raycaster = new THREE.Raycaster();
  private group: THREE.Group;
  private disposed = false;
  /** Orientation of the box (full 3-axis rotation). */
  private _quaternion = new THREE.Quaternion();

  constructor(scene: THREE.Scene, camera: THREE.Camera, domElement: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.group = new THREE.Group();
    this.group.name = "face-handles";
    this.scene.add(this.group);
    this.createHandles();
  }

  /** Shared sphere geometry for all 6 handles — disposed exactly once in dispose(). */
  private handleGeometry = new THREE.SphereGeometry(1, 12, 8);

  private createHandles(): void {
    const axes: FaceAxis[] = ["x", "y", "z"];
    const signs: FaceSign[] = [1, -1];
    const geo = this.handleGeometry;

    for (const axis of axes) {
      for (const sign of signs) {
        const mat = new THREE.MeshBasicMaterial({
          color: AXIS_COLOR[axis],
          transparent: true,
          opacity: 0.95,
          depthTest: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.renderOrder = 10;
        mesh.visible = false;
        mesh.userData = { faceHandle: true, axis, sign };
        this.group.add(mesh);
        this.handles.push({ mesh, axis, sign });
      }
    }
  }

  attach(box: THREE.Box3, onChange: (box: THREE.Box3) => void): void {
    this.box = box;
    this.onChange = onChange;
    this.updatePositions();
    for (const h of this.handles) h.mesh.visible = true;
  }

  /** Set the box's orientation (full 3-axis) so handles follow it. */
  setQuaternion(q: THREE.Quaternion): void {
    this._quaternion.copy(q);
    if (this.box) this.updatePositions();
  }

  detach(): void {
    this.box = null;
    this.onChange = null;
    this.drag = null;
    this.hoveredHandle = null;
    for (const h of this.handles) h.mesh.visible = false;
  }

  isAttached(): boolean {
    return this.box !== null;
  }

  /** Show/hide the whole handle group without detaching (keeps box binding). */
  setGroupVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  isDragging(): boolean {
    return this.drag !== null;
  }

  getHandleMeshes(): THREE.Mesh[] {
    return this.handles.map(h => h.mesh);
  }

  /** Update handle positions and sizes to match the current box */
  updatePositions(): void {
    if (!this.box) return;
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    this.box.getCenter(center);
    this.box.getSize(size);

    // Handle radius: ~3% of box diagonal, clamped — large enough to read and
    // grab clearly against the wireframe without dominating a small box.
    const diag = size.length();
    const radius = Math.max(0.08, Math.min(diag * 0.03, 3));

    for (const h of this.handles) {
      // Face-center offset from the box center, in box-local (unrotated) space.
      const offset = new THREE.Vector3();
      if (h.sign === 1) {
        offset[h.axis] = this.box.max[h.axis] - center[h.axis];
      } else {
        offset[h.axis] = this.box.min[h.axis] - center[h.axis];
      }
      // Push the handle slightly OFF the face (along its own axis) plus a
      // constant pad so it doesn't sit on top of the move arrows / rotate rings,
      // making each handle easier to grab without catching a neighbour.
      const half = Math.abs(offset[h.axis]);
      offset[h.axis] += h.sign * (half * 0.12 + radius * 1.5);
      // Rotate the offset by the box orientation, then translate by center.
      offset.applyQuaternion(this._quaternion);
      h.mesh.position.set(center.x + offset.x, center.y + offset.y, center.z + offset.z);
      h.mesh.scale.setScalar(radius);
    }
  }

  /**
   * Try to start a drag. Call on pointerdown.
   * Returns true if a handle was grabbed (caller should disable orbit controls).
   */
  onPointerDown(clientX: number, clientY: number): boolean {
    if (!this.box) return false;

    const handle = this.hitTest(clientX, clientY);
    if (!handle) return false;

    // Build a drag plane perpendicular to the camera, passing through the handle
    const cameraDir = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDir);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      cameraDir.negate(), handle.mesh.position.clone()
    );

    // Get the initial intersection
    this.setRaycasterFromClient(clientX, clientY);
    const startIntersect = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(plane, startIntersect)) return false;

    const startCenter = new THREE.Vector3();
    const startSize = new THREE.Vector3();
    this.box.getCenter(startCenter);
    this.box.getSize(startSize);

    this.drag = {
      handle, plane, startIntersect, startCenter, startSize,
      worldAxis: this.worldAxisFor(handle.axis),
    };
    this.setHandleColor(handle, HANDLE_DRAG_COLOR);
    return true;
  }

  /** World-space unit vector for a box-local face axis, rotated by the box orientation. */
  private worldAxisFor(axis: FaceAxis): THREE.Vector3 {
    const local = new THREE.Vector3(
      axis === "x" ? 1 : 0,
      axis === "y" ? 1 : 0,
      axis === "z" ? 1 : 0,
    );
    return local.applyQuaternion(this._quaternion);
  }

  /** Update the box during a drag. Call on pointermove. */
  onPointerMove(clientX: number, clientY: number): void {
    if (!this.drag || !this.box) return;

    this.setRaycasterFromClient(clientX, clientY);
    const currentIntersect = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.drag.plane, currentIntersect)) return;

    // Project the world-space movement onto the (Z-rotated) box-local axis so
    // dragging a face of a rotated box resizes along the box's own axis.
    const axis = this.drag.handle.axis;
    const s = this.drag.handle.sign;
    const worldDelta = currentIntersect.clone().sub(this.drag.startIntersect);
    const delta = worldDelta.dot(this.drag.worldAxis);

    // Recompute from the drag-start state each move (no incremental drift).
    // The grabbed face moves +delta along the local axis: the max face (+1)
    // grows the box, the min face (-1) shrinks it.
    const MIN_SIZE = 0.1;
    const startSizeA = this.drag.startSize[axis];
    const newSizeA = Math.max(MIN_SIZE, startSizeA + s * delta);
    const grow = newSizeA - startSizeA;

    // Keep the opposite face fixed in the box's own frame: shift the center by
    // half the size change ALONG the local axis (its world direction), so a
    // rotated box resizes along its orientation instead of the world axes.
    const center = this.drag.startCenter.clone()
      .addScaledVector(this.drag.worldAxis, (s * grow) / 2);
    const size = this.drag.startSize.clone();
    size[axis] = newSizeA;

    const half = size.clone().multiplyScalar(0.5);
    this.box.min.copy(center).sub(half);
    this.box.max.copy(center).add(half);

    this.updatePositions();
    this.onChange?.(this.box);
  }

  /** End the drag. Call on pointerup. */
  onPointerUp(): void {
    if (this.drag) {
      this.setHandleColor(this.drag.handle, AXIS_COLOR[this.drag.handle.axis]);
      this.drag = null;
    }
  }

  /** Update hover highlight. Call on pointermove when not dragging. */
  updateHover(clientX: number, clientY: number): void {
    if (this.drag || !this.box) return;

    const hit = this.hitTest(clientX, clientY);
    if (hit !== this.hoveredHandle) {
      if (this.hoveredHandle) {
        this.setHandleColor(this.hoveredHandle, AXIS_COLOR[this.hoveredHandle.axis]);
      }
      this.hoveredHandle = hit;
      if (hit) {
        this.setHandleColor(hit, HANDLE_HOVER_COLOR);
      }
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    // All handles share one geometry — dispose it once, then each material.
    this.handleGeometry.dispose();
    for (const h of this.handles) {
      (h.mesh.material as THREE.Material).dispose();
    }
    this.scene.remove(this.group);
  }

  private hitTest(clientX: number, clientY: number): FaceHandle | null {
    if (!this.box) return null;
    this.setRaycasterFromClient(clientX, clientY);
    const meshes = this.handles.filter(h => h.mesh.visible).map(h => h.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);
    if (intersects.length === 0) return null;
    const hitMesh = intersects[0].object;
    return this.handles.find(h => h.mesh === hitMesh) ?? null;
  }

  private setRaycasterFromClient(clientX: number, clientY: number): void {
    const rect = this.domElement.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
  }

  private setHandleColor(handle: FaceHandle, color: number): void {
    (handle.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
  }
}
