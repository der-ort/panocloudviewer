import * as THREE from "three";

/** Axis index → human name for cursor logic */
type FaceAxis = "x" | "y" | "z";
type FaceSign = 1 | -1;

interface FaceHandle {
  /** Arrow group: shaft + cone (visible) + an invisible grab sphere (hitbox). */
  group: THREE.Group;
  /** Shared by shaft + cone so hover/drag recoloring hits both. */
  material: THREE.MeshBasicMaterial;
  /** Invisible enlarged hitbox — raycast target. */
  grab: THREE.Mesh;
  /** Orients local +Y onto this handle's outward face direction. */
  localQuat: THREE.Quaternion;
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
 * Manages 6 face-center handles for interactive Box3 resizing, rendered as
 * outward-pointing AXIS ARROWS (shaft + cone) mounted on each face — drag an
 * arrow to push/pull that face. Each arrow carries an invisible grab sphere as
 * its hitbox, kept deliberately tight so the rotation rings never contend with it.
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

  // Shared arrow geometries for all 6 handles — each disposed once in dispose().
  // Local space: arrow points along +Y, base at the origin (mounted on the face).
  private shaftGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.55, 10).translate(0, 0.275, 0);
  private coneGeometry = new THREE.ConeGeometry(0.26, 0.5, 12).translate(0, 0.8, 0);
  private grabGeometry = new THREE.SphereGeometry(0.6, 8, 6).translate(0, 0.65, 0);
  /** One invisible material shared by all grab spheres. */
  private grabMaterial = new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0, depthTest: false, depthWrite: false,
  });

  private createHandles(): void {
    const axes: FaceAxis[] = ["x", "y", "z"];
    const signs: FaceSign[] = [1, -1];
    const UP = new THREE.Vector3(0, 1, 0);

    for (const axis of axes) {
      for (const sign of signs) {
        const material = new THREE.MeshBasicMaterial({
          color: AXIS_COLOR[axis],
          transparent: true,
          opacity: 0.95,
          depthTest: false,
        });
        const shaft = new THREE.Mesh(this.shaftGeometry, material);
        const cone = new THREE.Mesh(this.coneGeometry, material);
        const grab = new THREE.Mesh(this.grabGeometry, this.grabMaterial);
        shaft.renderOrder = cone.renderOrder = 10;

        const arrow = new THREE.Group();
        arrow.add(shaft, cone, grab);
        arrow.visible = false;
        arrow.userData = { faceHandle: true, axis, sign };

        // Local +Y → this face's outward direction (box rotation applied later).
        const dir = new THREE.Vector3(
          axis === "x" ? sign : 0,
          axis === "y" ? sign : 0,
          axis === "z" ? sign : 0,
        );
        const localQuat = new THREE.Quaternion().setFromUnitVectors(UP, dir);

        this.group.add(arrow);
        this.handles.push({ group: arrow, material, grab, localQuat, axis, sign });
      }
    }
  }

  attach(box: THREE.Box3, onChange: (box: THREE.Box3) => void): void {
    this.box = box;
    this.onChange = onChange;
    this.updatePositions();
    for (const h of this.handles) h.group.visible = true;
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
    for (const h of this.handles) h.group.visible = false;
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
    return this.handles.map(h => h.grab);
  }

  /** Update handle positions and sizes to match the current box */
  updatePositions(): void {
    if (!this.box) return;
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    this.box.getCenter(center);
    this.box.getSize(size);

    // Arrow scale: ~6% of box diagonal per local unit (arrow is ~1.3 units
    // long) — proportional at any box size, floored so tiny boxes stay grabbable.
    // No upper clamp: a fixed cap made arrows invisible on large site-scale boxes.
    const diag = size.length();
    const scale = Math.max(0.1, diag * 0.06);

    for (const h of this.handles) {
      // Face-center offset from the box center, in box-local (unrotated) space.
      const offset = new THREE.Vector3();
      if (h.sign === 1) {
        offset[h.axis] = this.box.max[h.axis] - center[h.axis];
      } else {
        offset[h.axis] = this.box.min[h.axis] - center[h.axis];
      }
      // Arrow base sits just off the face, pointing outward along its axis.
      const half = Math.abs(offset[h.axis]);
      offset[h.axis] += h.sign * (half * 0.04 + scale * 0.1);
      // Rotate the offset by the box orientation, then translate by center.
      offset.applyQuaternion(this._quaternion);
      h.group.position.set(center.x + offset.x, center.y + offset.y, center.z + offset.z);
      h.group.scale.setScalar(scale);
      // Box orientation × local face direction — the arrow follows rotation.
      h.group.quaternion.copy(this._quaternion).multiply(h.localQuat);
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
      cameraDir.negate(), handle.group.position.clone()
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
    // Shared geometries/material are disposed once, then each handle's material.
    this.shaftGeometry.dispose();
    this.coneGeometry.dispose();
    this.grabGeometry.dispose();
    this.grabMaterial.dispose();
    for (const h of this.handles) {
      h.material.dispose();
    }
    this.scene.remove(this.group);
  }

  private hitTest(clientX: number, clientY: number): FaceHandle | null {
    if (!this.box) return null;
    this.setRaycasterFromClient(clientX, clientY);
    // Raycast the invisible grab spheres — they envelop the whole arrow.
    const grabs = this.handles.filter(h => h.group.visible).map(h => h.grab);
    const intersects = this.raycaster.intersectObjects(grabs);
    if (intersects.length === 0) return null;
    const hit = intersects[0].object;
    return this.handles.find(h => h.grab === hit) ?? null;
  }

  private setRaycasterFromClient(clientX: number, clientY: number): void {
    const rect = this.domElement.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
  }

  private setHandleColor(handle: FaceHandle, color: number): void {
    handle.material.color.setHex(color);
  }
}
