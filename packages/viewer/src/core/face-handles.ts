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
  /** The initial value of box.min[axis] or box.max[axis] at drag start */
  startValue: number;
}

const HANDLE_COLOR = 0xdcd546;
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

  constructor(scene: THREE.Scene, camera: THREE.Camera, domElement: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.group = new THREE.Group();
    this.group.name = "face-handles";
    this.scene.add(this.group);
    this.createHandles();
  }

  private createHandles(): void {
    const axes: FaceAxis[] = ["x", "y", "z"];
    const signs: FaceSign[] = [1, -1];
    const geo = new THREE.SphereGeometry(1, 12, 8);

    for (const axis of axes) {
      for (const sign of signs) {
        const mat = new THREE.MeshBasicMaterial({
          color: HANDLE_COLOR,
          transparent: true,
          opacity: 0.7,
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

    // Handle radius: ~2% of box diagonal, clamped
    const diag = size.length();
    const radius = Math.max(0.05, Math.min(diag * 0.02, 2));

    for (const h of this.handles) {
      const pos = center.clone();
      if (h.sign === 1) {
        pos[h.axis] = this.box.max[h.axis];
      } else {
        pos[h.axis] = this.box.min[h.axis];
      }
      h.mesh.position.copy(pos);
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

    const startValue = handle.sign === 1
      ? this.box.max[handle.axis]
      : this.box.min[handle.axis];

    this.drag = { handle, plane, startIntersect, startValue };
    this.setHandleColor(handle, HANDLE_DRAG_COLOR);
    return true;
  }

  /** Update the box during a drag. Call on pointermove. */
  onPointerMove(clientX: number, clientY: number): void {
    if (!this.drag || !this.box) return;

    this.setRaycasterFromClient(clientX, clientY);
    const currentIntersect = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.drag.plane, currentIntersect)) return;

    // Compute delta along the face axis
    const axis = this.drag.handle.axis;
    const delta = currentIntersect[axis] - this.drag.startIntersect[axis];
    const newValue = this.drag.startValue + delta;

    // Update the correct face, clamping so min < max with a minimum box size
    const MIN_SIZE = 0.1;
    if (this.drag.handle.sign === 1) {
      // Dragging a max face
      this.box.max[axis] = Math.max(this.box.min[axis] + MIN_SIZE, newValue);
    } else {
      // Dragging a min face
      this.box.min[axis] = Math.min(this.box.max[axis] - MIN_SIZE, newValue);
    }

    this.updatePositions();
    this.onChange?.(this.box);
  }

  /** End the drag. Call on pointerup. */
  onPointerUp(): void {
    if (this.drag) {
      this.setHandleColor(this.drag.handle, HANDLE_COLOR);
      this.drag = null;
    }
  }

  /** Update hover highlight. Call on pointermove when not dragging. */
  updateHover(clientX: number, clientY: number): void {
    if (this.drag || !this.box) return;

    const hit = this.hitTest(clientX, clientY);
    if (hit !== this.hoveredHandle) {
      if (this.hoveredHandle) {
        this.setHandleColor(this.hoveredHandle, HANDLE_COLOR);
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
    for (const h of this.handles) {
      h.mesh.geometry.dispose();
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
