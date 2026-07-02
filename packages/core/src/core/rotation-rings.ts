import * as THREE from "three";

type RingAxis = "x" | "y" | "z";

/** Per-axis colors matching the face-handle arrows: X=red, Y=green, Z=blue. */
const RING_COLOR: Record<RingAxis, number> = {
  x: 0xef4444,
  y: 0x22c55e,
  z: 0x3b82f6,
};
const RING_HOVER_COLOR = 0xffffff;
const RING_DRAG_COLOR = 0xf97316;

interface Ring {
  axis: RingAxis;
  /** Visible quarter-circle arc. */
  arc: THREE.Mesh;
  /** Invisible fat torus segment over the SAME quarter — the grab hitbox. */
  picker: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
}

interface RingDrag {
  axis: RingAxis;
  /** Rotation plane through the box center, normal = the (frozen) world axis. */
  plane: THREE.Plane;
  /** World rotation axis at drag start (frozen so the drag is stable). */
  worldAxis: THREE.Vector3;
  startVec: THREE.Vector3;
  startQuat: THREE.Quaternion;
  center: THREE.Vector3;
}

/**
 * Three quarter-circle rotation handles for the clip box, replacing the stock
 * TransformControls rotate gizmo. The stock gizmo's invisible picker tori span
 * (nearly) the full circle, so its hitboxes constantly overlapped the resize
 * handles — here the hitbox is a fat torus over EXACTLY the visible quarter,
 * so the rings can never grab a drag outside what the user sees.
 *
 * The three quarters meet at the box's +X/+Y/+Z corner region (Blender-style
 * corner triad): X-ring spans +Y→+Z, Y-ring +Z→+X, Z-ring +X→+Y. They follow
 * the box's position, size and orientation.
 */
export class RotationRingController {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private group: THREE.Group;
  private rings: Ring[] = [];
  private raycaster = new THREE.Raycaster();
  private drag: RingDrag | null = null;
  private hovered: Ring | null = null;
  private onRotate: ((q: THREE.Quaternion) => void) | null = null;
  private center = new THREE.Vector3();
  private quaternion = new THREE.Quaternion();
  private attached = false;

  constructor(scene: THREE.Scene, camera: THREE.Camera, domElement: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.group = new THREE.Group();
    this.group.name = "clip-rotation-rings";
    this.group.visible = false;
    this.scene.add(this.group);
    this.buildRings();
  }

  private buildRings(): void {
    // Base torus lies in the XY plane, arc from +X counter-clockwise to +Y
    // (quarter). A cyclic axis rotation maps it onto the other two planes so
    // all three quarters share the +corner.
    const arcGeo = new THREE.TorusGeometry(1, 0.012, 8, 48, Math.PI / 2);
    const pickGeo = new THREE.TorusGeometry(1, 0.1, 8, 24, Math.PI / 2);

    // X→Y→Z→X cyclic rotation (120° about the (1,1,1) diagonal).
    const cycle = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 1, 1).normalize(), (2 * Math.PI) / 3,
    );

    const orientations: { axis: RingAxis; q: THREE.Quaternion }[] = [
      { axis: "z", q: new THREE.Quaternion() },                  // XY plane: +X→+Y
      { axis: "x", q: cycle.clone() },                           // YZ plane: +Y→+Z
      { axis: "y", q: cycle.clone().multiply(cycle) },           // ZX plane: +Z→+X
    ];

    for (const { axis, q } of orientations) {
      const material = new THREE.MeshBasicMaterial({
        color: RING_COLOR[axis],
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.95,
      });
      const arc = new THREE.Mesh(arcGeo, material);
      arc.quaternion.copy(q);
      arc.renderOrder = 6;

      const picker = new THREE.Mesh(pickGeo, new THREE.MeshBasicMaterial({
        visible: true, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
      }));
      picker.quaternion.copy(q);
      picker.userData.ringAxis = axis;

      this.group.add(arc, picker);
      this.rings.push({ axis, arc, picker, material });
    }
  }

  /** Show the rings on a box and receive the new orientation while dragging. */
  attach(
    box: THREE.Box3,
    quaternion: THREE.Quaternion,
    onRotate: (q: THREE.Quaternion) => void,
  ): void {
    this.onRotate = onRotate;
    this.attached = true;
    this.group.visible = true;
    this.updatePose(box, quaternion);
  }

  detach(): void {
    this.attached = false;
    this.group.visible = false;
    this.drag = null;
    this.onRotate = null;
    this.setHover(null);
  }

  isAttached(): boolean {
    return this.attached;
  }

  isDragging(): boolean {
    return this.drag !== null;
  }

  /** Show/hide without detaching (outline toggle). */
  setGroupVisible(visible: boolean): void {
    this.group.visible = visible && this.attached;
  }

  /** Follow the box: center, orientation, and a radius just outside the box. */
  updatePose(box: THREE.Box3, quaternion: THREE.Quaternion): void {
    const size = new THREE.Vector3();
    box.getCenter(this.center);
    box.getSize(size);
    this.quaternion.copy(quaternion);

    this.group.position.copy(this.center);
    this.group.quaternion.copy(quaternion);
    // Slightly beyond the largest half-extent so the arcs clear the box faces
    // (and the face arrows mounted on them).
    const radius = Math.max(size.x, size.y, size.z) * 0.62;
    this.group.scale.setScalar(Math.max(radius, 0.3));
  }

  /** Try to start a rotation drag. Returns true if an arc was grabbed. */
  onPointerDown(clientX: number, clientY: number): boolean {
    if (!this.attached || !this.group.visible) return false;
    const ring = this.hitTest(clientX, clientY);
    if (!ring) return false;

    // Freeze the world axis + plane at drag start so the rotation is stable.
    const local = new THREE.Vector3(
      ring.axis === "x" ? 1 : 0,
      ring.axis === "y" ? 1 : 0,
      ring.axis === "z" ? 1 : 0,
    );
    const worldAxis = local.applyQuaternion(this.quaternion).normalize();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(worldAxis, this.center);

    this.setRay(clientX, clientY);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(plane, hit)) return false;

    this.drag = {
      axis: ring.axis,
      plane,
      worldAxis,
      startVec: hit.sub(this.center).normalize(),
      startQuat: this.quaternion.clone(),
      center: this.center.clone(),
    };
    ring.material.color.setHex(RING_DRAG_COLOR);
    return true;
  }

  /** Rotate while dragging: signed angle between start and current plane vector. */
  onPointerMove(clientX: number, clientY: number): void {
    if (!this.drag) return;
    this.setRay(clientX, clientY);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.drag.plane, hit)) return;

    const cur = hit.sub(this.drag.center).normalize();
    const angle = Math.atan2(
      new THREE.Vector3().crossVectors(this.drag.startVec, cur).dot(this.drag.worldAxis),
      this.drag.startVec.dot(cur),
    );
    const q = new THREE.Quaternion()
      .setFromAxisAngle(this.drag.worldAxis, angle)
      .multiply(this.drag.startQuat);
    this.onRotate?.(q);
  }

  onPointerUp(): void {
    if (!this.drag) return;
    const ring = this.rings.find(r => r.axis === this.drag!.axis);
    ring?.material.color.setHex(RING_COLOR[this.drag.axis]);
    this.drag = null;
  }

  /** Hover highlight. Call on pointermove when not dragging. */
  updateHover(clientX: number, clientY: number): void {
    if (this.drag || !this.attached || !this.group.visible) return;
    this.setHover(this.hitTest(clientX, clientY));
  }

  private setHover(ring: Ring | null): void {
    if (ring === this.hovered) return;
    if (this.hovered) this.hovered.material.color.setHex(RING_COLOR[this.hovered.axis]);
    this.hovered = ring;
    if (ring) ring.material.color.setHex(RING_HOVER_COLOR);
  }

  private hitTest(clientX: number, clientY: number): Ring | null {
    this.setRay(clientX, clientY);
    const pickers = this.rings.map(r => r.picker);
    const hits = this.raycaster.intersectObjects(pickers);
    if (hits.length === 0) return null;
    const axis = hits[0].object.userData.ringAxis as RingAxis;
    return this.rings.find(r => r.axis === axis) ?? null;
  }

  private setRay(clientX: number, clientY: number): void {
    const rect = this.domElement.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
  }

  dispose(): void {
    // Arc + picker geometries are shared per kind across the three rings —
    // dispose each shared geometry once, then the per-ring materials.
    this.rings[0]?.arc.geometry.dispose();
    this.rings[0]?.picker.geometry.dispose();
    for (const r of this.rings) {
      r.material.dispose();
      (r.picker.material as THREE.Material).dispose();
    }
    this.rings = [];
    this.scene.remove(this.group);
  }
}
