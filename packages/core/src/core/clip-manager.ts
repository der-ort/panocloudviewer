import * as THREE from "three";
import type { SceneManager } from "./scene-manager";
import { FaceHandleController } from "./face-handles";
import { RotationRingController } from "./rotation-rings";

export type ClipMode = "outside" | "inside";

export interface ClipBoxEntry {
  id: string;
  name: string;
  box: THREE.Box3;
  mode: ClipMode;
  visible: boolean;
  /** Box orientation (full 3-axis rotation). Defaults to identity. */
  quaternion: THREE.Quaternion;
}

let _nextId = 1;
function genId(): string {
  return `clip_${_nextId++}`;
}

/** Manages multiple named clip boxes with TransformControls support */
export class ClipManager {
  private sm: SceneManager;
  private entries: ClipBoxEntry[] = [];
  private helpers: Map<string, THREE.Box3Helper> = new Map();
  private fills: Map<string, THREE.Mesh> = new Map();
  private draftHelper: THREE.Box3Helper | null = null;
  private selectedId: string | null = null;
  /** Move gizmo (translate arrows at the box center) — three.js TransformControls. */
  private tcMove: unknown = null;
  private pivot: THREE.Mesh | null = null;
  /** Face-mounted resize arrows (scaling). */
  private _faceHandles: FaceHandleController | null = null;
  /** Quarter-circle rotation arcs (custom — exact hitboxes, see RotationRingController). */
  private _rotRings: RotationRingController | null = null;
  /** Active transform mode for the selected box (move / scale / rotate). */
  private _transformMode: "translate" | "scale" | "rotate" = "scale";
  /** Global clipping enable flag. When false, boxes stay visible but no clipping is applied. */
  private _enabled = true;
  /** Whether box outlines / fills / handles render at all (off = clean screenshots). */
  private _outlinesVisible = true;

  onChange?: (boxes: ClipBoxEntry[]) => void;
  onSelectChange?: (id: string | null) => void;

  constructor(sm: SceneManager) {
    this.sm = sm;
  }

  /** Look up a box entry by id. */
  private entryOf(id: string | null | undefined): ClipBoxEntry | undefined {
    return id ? this.entries.find(e => e.id === id) : undefined;
  }

  /**
   * Remove a Box3Helper from the scene and dispose BOTH its geometry and its
   * internally-created LineBasicMaterial. Box3Helper owns its material, so
   * disposing only the geometry (the easy-to-forget half) leaks it.
   */
  private disposeBox3Helper(helper: THREE.Box3Helper | null): void {
    if (!helper) return;
    this.sm.scene.remove(helper);
    helper.geometry.dispose();
    (helper.material as THREE.Material).dispose();
  }

  /** Remove the invisible transform pivot mesh and dispose its geometry + material. */
  private disposePivot(): void {
    if (!this.pivot) return;
    this.sm.scene.remove(this.pivot);
    this.pivot.geometry.dispose();
    (this.pivot.material as THREE.Material).dispose();
    this.pivot = null;
  }

  /** In-flight init promise — guards against concurrent selectBox() double-init. */
  private _initTcPromise: Promise<void> | null = null;

  private initTransformControls(): Promise<void> {
    if (this.tcMove) return Promise.resolve();
    // Reuse the pending promise so two rapid selects don't both run the async
    // body and create two gizmos (the sync guard above can't catch a second
    // call while the dynamic import is still awaiting).
    if (!this._initTcPromise) this._initTcPromise = this._doInitTransformControls();
    return this._initTcPromise;
  }

  private async _doInitTransformControls(): Promise<void> {
    const { TransformControls } = await import(
      "three/examples/jsm/controls/TransformControls.js"
    );

    // Single gizmo: compact translate arrows at the box center. Rotation is
    // handled by the custom RotationRingController (exact quarter-arc hitboxes)
    // and scaling by the face-mounted resize arrows — all three show together.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tc = new TransformControls(this.sm.camera, this.sm.renderer.domElement) as any;
    tc.setSpace("world");
    tc.setMode("translate");
    tc.setSize(0.6);
    tc.addEventListener("change", () => this.syncFromPivot());
    tc.addEventListener("dragging-changed", (e: { value: boolean }) => {
      this.sm.controls.enabled = !e.value;
    });
    this.sm.scene.add(tc.getHelper());
    this.tcMove = tc;
    this._removePlaneHandles(tc);
    this._raiseGizmo();
  }

  /**
   * Strip the translate gizmo's two-axis PLANE quads (children named XY/YZ/XZ)
   * so only the single-axis arrows and the center handle remain — the rotation
   * arcs occupy the mid-region instead. Hiding is NOT enough: the gizmo's
   * updateMatrixWorld forces `visible = true` on every handle each frame, so
   * the quads must be REMOVED from both the visible gizmo and the invisible
   * picker trees. Names are non-unique — collect first, then remove.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _removePlaneHandles(tc: any): void {
    const root = tc?.getHelper?.();
    // The TransformControlsGizmo instance is the root child carrying the
    // gizmo/picker maps; probe defensively so a three upgrade degrades to a no-op.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gz = root?.children?.find((c: any) => c.gizmo && c.picker);
    for (const group of [gz?.gizmo?.translate, gz?.picker?.translate]) {
      if (!group?.children) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const planes = group.children.filter((c: any) =>
        c.name === "XY" || c.name === "YZ" || c.name === "XZ");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const p of planes as any[]) group.remove(p);
    }
  }

  /** Whether the translate gizmo is mid-drag (viewport uses this for ordering). */
  isGizmoDragging(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.tcMove as any)?.dragging === true;
  }

  /**
   * Force the TransformControls gizmos to render on top of the point cloud.
   * The gizmos use default materials (depthTest=true, renderOrder=0) so they are
   * occluded by the dense cloud. Traverse each gizmo tree and disable depth
   * testing so the arrows/rings draw through.
   */
  private _raiseGizmo(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const helper = (this.tcMove as any)?.getHelper?.();
    if (!helper) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    helper.traverse((child: any) => {
      if (!child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of mats) {
        m.depthTest = false;
        m.depthWrite = false;
        m.transparent = true;
      }
      child.renderOrder = 5;
    });
  }

  /**
   * Build an axis-aligned box centered on the current view target, sized to sit
   * comfortably INSIDE the viewport at the current camera distance, then clamped
   * to the cloud bounds. This replaces the old behavior of spanning the whole
   * world box, which routinely extended far outside the viewport (and dwarfed
   * the resize handles). The result is always fully visible and easy to grab.
   */
  makeViewportBox(worldBox?: THREE.Box3): THREE.Box3 {
    const cam = this.sm.camera as THREE.PerspectiveCamera;
    const target = this.sm.controls.target.clone();

    // Visible half-extents (world units) of the view at the target's distance.
    const dist = cam.position.distanceTo(target) || 1;
    const vfov = THREE.MathUtils.degToRad(cam.fov || 50);
    const halfH = Math.tan(vfov / 2) * dist;
    const halfW = halfH * (cam.aspect || 1);

    // ~45% of the smaller visible half-extent → the box footprint fills roughly
    // the central ~90% of the view without touching the edges.
    let half = Math.min(halfH, halfW) * 0.45;
    // Flatter Z slab so it stays within the view and is easy to see/grab.
    let halfZ = half * 0.6;

    if (worldBox && !worldBox.isEmpty()) {
      const ws = new THREE.Vector3();
      worldBox.getSize(ws);
      half = Math.min(half, ws.x * 0.5, ws.y * 0.5);
      halfZ = Math.min(halfZ, ws.z * 0.5);
      target.clamp(worldBox.min, worldBox.max); // keep center inside the cloud
    }

    half = Math.max(half, 0.25);
    halfZ = Math.max(halfZ, 0.15);

    return new THREE.Box3(
      new THREE.Vector3(target.x - half, target.y - half, target.z - halfZ),
      new THREE.Vector3(target.x + half, target.y + half, target.z + halfZ),
    );
  }

  /**
   * Add a clip box sized to fit the current viewport (see {@link makeViewportBox}).
   * Preferred over `addBox(worldBox.clone())` for the "create default box" action.
   */
  addDefaultBox(worldBox?: THREE.Box3, name?: string): ClipBoxEntry {
    return this.addBox(this.makeViewportBox(worldBox), name);
  }

  addBox(box: THREE.Box3, name?: string): ClipBoxEntry {
    const id = genId();
    const entry: ClipBoxEntry = {
      id,
      name: name ?? `Box ${this.entries.length + 1}`,
      box: box.clone(),
      mode: "outside",
      visible: true,
      quaternion: new THREE.Quaternion(),
    };
    this.entries.push(entry);
    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
    return entry;
  }

  async selectBox(id: string | null): Promise<void> {
    // Unhighlight previous (back to the deselected/black outline)
    this._highlightHelper(this.selectedId, false);

    // Detach previous pivot and all selection handles
    this._detachHandles();
    this.disposePivot();

    this.selectedId = id;
    this.onSelectChange?.(id);

    if (!id) return;

    const entry = this.entryOf(id);
    if (!entry) return;

    await this.initTransformControls();

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    entry.box.getCenter(center);
    entry.box.getSize(size);

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ visible: false });
    this.pivot = new THREE.Mesh(geo, mat);
    this.pivot.position.copy(center);
    this.pivot.scale.copy(size);
    this.pivot.quaternion.copy(entry.quaternion);
    this.pivot.userData.clipId = id;
    this.sm.scene.add(this.pivot);

    // Create the resize-arrow and rotation-ring controllers once.
    if (!this._faceHandles) {
      this._faceHandles = new FaceHandleController(
        this.sm.scene, this.sm.camera, this.sm.renderer.domElement,
      );
    }
    if (!this._rotRings) {
      this._rotRings = new RotationRingController(
        this.sm.scene, this.sm.camera, this.sm.renderer.domElement,
      );
    }

    // Show move arrows + rotation arcs + face-resize arrows together.
    this._showSelectionHandles();

    // Honour the global outlines toggle (handles/gizmos hidden for clean shots).
    this._applyOutlineVisibility();

    // Highlight the selected box (bright outline)
    this._highlightHelper(id, true);
  }

  /**
   * @deprecated All handle sets (move / scale / rotate) now show simultaneously
   * — there are no modes to switch. Kept as a no-op for API compatibility.
   */
  setTransformMode(_mode: "translate" | "scale" | "rotate"): void { /* no-op */ }

  /** @deprecated See {@link setTransformMode}. Always returns "scale". */
  getTransformMode(): "translate" | "scale" | "rotate" {
    return this._transformMode;
  }

  /** Get the face handle controller (for viewport event forwarding) */
  get faceHandles(): FaceHandleController | null {
    return this._faceHandles;
  }

  /** Get the rotation-ring controller (for viewport event forwarding). */
  get rotationRings(): RotationRingController | null {
    return this._rotRings;
  }

  /** Attach the face-resize handles to the selected box with the sync callback. */
  private _attachFaceHandles(entry: ClipBoxEntry): void {
    if (!this._faceHandles) return;
    this._faceHandles.setQuaternion(entry.quaternion);
    this._faceHandles.attach(entry.box, () => {
      this.updateHelper(entry);
      this.applyAll();
      // Sync pivot + rotation arcs to match the resized box
      if (this.pivot) {
        const c = new THREE.Vector3();
        const s = new THREE.Vector3();
        entry.box.getCenter(c);
        entry.box.getSize(s);
        this.pivot.position.copy(c);
        this.pivot.scale.copy(s);
      }
      this._rotRings?.updatePose(entry.box, entry.quaternion);
      this.onChange?.(this.getBoxes());
    });
  }

  /**
   * Attach ALL handle sets to the selected box at once — no mode switching:
   * - translate arrows at the center (TransformControls),
   * - 6 face-mounted resize arrows (scaling),
   * - 3 quarter-circle rotation arcs whose hitboxes match the visible arcs
   *   exactly, so they cannot contend with the resize arrows.
   */
  private _showSelectionHandles(): void {
    if (!this.pivot || !this.selectedId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const move = this.tcMove as any;
    const entry = this.entryOf(this.selectedId);

    if (entry) {
      if (!this._faceHandles?.isAttached()) this._attachFaceHandles(entry);
      this._faceHandles?.setGroupVisible(true);
      this._faceHandles?.updatePositions();

      // Rotating an arc feeds the new orientation through the pivot so the
      // regular pivot→entry sync path (helper, clipping, onChange) applies.
      this._rotRings?.attach(entry.box, entry.quaternion, (q) => {
        this.pivot?.quaternion.copy(q);
        this.syncFromPivot();
      });
      this._rotRings?.setGroupVisible(true);
    }
    if (move) { move.attach(this.pivot); move.enabled = true; move.showX = move.showY = move.showZ = true; }
    this._raiseGizmo();
  }

  /** Detach every selection handle set: translate gizmo, resize arrows, rotation arcs. */
  private _detachHandles(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.tcMove as any)?.detach();
    this._faceHandles?.detach();
    this._rotRings?.detach();
  }

  /**
   * Reset a box's orientation back to axis-aligned (identity rotation). Targets
   * the given box, or the selected one when omitted.
   */
  resetRotation(id?: string): void {
    const targetId = id ?? this.selectedId;
    if (!targetId) return;
    const entry = this.entryOf(targetId);
    if (!entry) return;
    entry.quaternion.identity();
    if (this.selectedId === targetId) {
      this.pivot?.quaternion.identity();
      this._faceHandles?.setQuaternion(entry.quaternion);
      this._rotRings?.updatePose(entry.box, entry.quaternion);
    }
    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  removeBox(id: string): void {
    const idx = this.entries.findIndex(e => e.id === id);
    if (idx === -1) return;
    this.entries.splice(idx, 1);

    this.disposeBox3Helper(this.helpers.get(id) ?? null);
    this.helpers.delete(id);

    const fill = this.fills.get(id);
    if (fill) {
      this.sm.scene.remove(fill);
      fill.geometry.dispose();
      (fill.material as THREE.MeshBasicMaterial).dispose();
      this.fills.delete(id);
    }

    if (this.selectedId === id) {
      this._detachHandles();
      this.disposePivot();
      this.selectedId = null;
      this.onSelectChange?.(null);
    }

    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  setBoxMode(id: string, mode: ClipMode): void {
    const entry = this.entryOf(id);
    if (!entry) return;
    entry.mode = mode;
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  /**
   * Set the clip mode for ALL boxes at once. potree-core only supports a single
   * global clip mode, so boxes must never diverge — use this instead of
   * per-box setBoxMode when changing the effective mode.
   */
  setModeAll(mode: ClipMode): void {
    for (const entry of this.entries) {
      entry.mode = mode;
    }
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  /**
   * Globally enable/disable clipping without removing any boxes. When disabled,
   * boxes remain visible as wireframes/fills but no actual clipping is applied.
   */
  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  /**
   * Whether a world-space point survives the current clipping (i.e. is part of
   * the kept/visible region). Used to cull out-of-bounds panorama markers and to
   * reject picks on clipped-away points. Returns true when clipping is off or
   * there are no visible boxes.
   */
  isPointVisible(p: THREE.Vector3): boolean {
    if (!this._enabled) return true;
    const visible = this.entries.filter(e => e.visible);
    if (visible.length === 0) return true;
    const insideAny = visible.some(e => this._pointInBox(p, e));
    // Global mode (potree allows one): "outside" keeps points INSIDE the box,
    // "inside" removes points inside the box.
    return visible[0].mode === "outside" ? insideAny : !insideAny;
  }

  /** Point-in-(rotated)-box test using the entry's center, size and quaternion. */
  private _pointInBox(p: THREE.Vector3, entry: ClipBoxEntry): boolean {
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    entry.box.getCenter(center);
    entry.box.getSize(size);
    const local = p.clone().sub(center).applyQuaternion(entry.quaternion.clone().invert());
    return (
      Math.abs(local.x) <= size.x / 2 &&
      Math.abs(local.y) <= size.y / 2 &&
      Math.abs(local.z) <= size.z / 2
    );
  }

  /**
   * Globally show/hide ALL box outlines, fills, handles and gizmos WITHOUT
   * affecting clipping — clipping stays active so you keep the cropped view but
   * get a clean image (e.g. for screenshots). Per-box visibility still applies
   * when outlines are on.
   */
  setOutlinesVisible(visible: boolean): void {
    this._outlinesVisible = visible;
    this._applyOutlineVisibility();
  }

  areOutlinesVisible(): boolean {
    return this._outlinesVisible;
  }

  /** Apply the global outline flag (and per-box visibility) to all scene objects. */
  private _applyOutlineVisibility(): void {
    const show = this._outlinesVisible;
    for (const entry of this.entries) {
      const helper = this.helpers.get(entry.id);
      if (helper) helper.visible = show && entry.visible;
      const fill = this.fills.get(entry.id);
      if (fill) fill.visible = show && entry.visible;
    }
    // Handles + gizmos belong to the selected box; hide them too when outlines
    // are off, otherwise restore the selection's handles.
    const selected = show && this.selectedId !== null;
    if (selected) {
      this._showSelectionHandles();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.tcMove as any)?.detach();
      this._faceHandles?.setGroupVisible(false);
      this._rotRings?.setGroupVisible(false);
    }
  }

  setBoxVisible(id: string, visible: boolean): void {
    const entry = this.entryOf(id);
    if (!entry) return;
    entry.visible = visible;
    const helper = this.helpers.get(id);
    if (helper) helper.visible = visible && this._outlinesVisible;
    const fill = this.fills.get(id);
    if (fill) fill.visible = visible && this._outlinesVisible;
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  renameBox(id: string, name: string): void {
    const entry = this.entryOf(id);
    if (!entry) return;
    entry.name = name;
    this.onChange?.(this.getBoxes());
  }

  getBoxes(): ClipBoxEntry[] {
    return this.entries.map(e => ({ ...e, box: e.box.clone() }));
  }

  getSelectedId(): string | null {
    return this.selectedId;
  }

  hasBox(): boolean {
    return this.entries.length > 0;
  }

  /** Draft box — live drag preview, no clip applied */
  setDraft(box: THREE.Box3 | null): void {
    this.disposeBox3Helper(this.draftHelper);
    this.draftHelper = null;
    if (box && !box.isEmpty()) {
      this.draftHelper = new THREE.Box3Helper(box, new THREE.Color(0xdcd546));
      (this.draftHelper.material as THREE.LineBasicMaterial).transparent = true;
      (this.draftHelper.material as THREE.LineBasicMaterial).opacity = 0.6;
      this.draftHelper.renderOrder = 3;
      this.sm.scene.add(this.draftHelper);
    }
  }

  clear(): void {
    this._detachHandles();
    this.disposePivot();

    for (const [, helper] of this.helpers) this.disposeBox3Helper(helper);
    this.helpers.clear();

    for (const [, fill] of this.fills) {
      this.sm.scene.remove(fill);
      fill.geometry.dispose();
      (fill.material as THREE.MeshBasicMaterial).dispose();
    }
    this.fills.clear();

    this.entries = [];
    this.selectedId = null;

    this.disposeBox3Helper(this.draftHelper);
    this.draftHelper = null;

    this.applyAll();
    this.onChange?.([]);
    this.onSelectChange?.(null);
  }

  dispose(): void {
    this.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tc = this.tcMove as any;
    if (tc) {
      this.sm.scene.remove(tc.getHelper());
      tc.dispose();
    }
    this.tcMove = null;
    this._initTcPromise = null;
    if (this._faceHandles) {
      this._faceHandles.dispose();
      this._faceHandles = null;
    }
    if (this._rotRings) {
      this._rotRings.dispose();
      this._rotRings = null;
    }
  }

  private syncFromPivot(): void {
    if (!this.pivot || !this.selectedId) return;
    const entry = this.entryOf(this.selectedId);
    if (!entry) return;

    // The move gizmo and rotation arcs share the pivot: center follows its
    // position, orientation its quaternion. Size (pivot.scale) is owned by the
    // face-resize arrows and is left untouched here.
    const center = this.pivot.position.clone();
    const halfSize = new THREE.Vector3(
      Math.abs(this.pivot.scale.x) * 0.5,
      Math.abs(this.pivot.scale.y) * 0.5,
      Math.abs(this.pivot.scale.z) * 0.5,
    );
    entry.box.min.copy(center).sub(halfSize);
    entry.box.max.copy(center).add(halfSize);
    entry.quaternion.copy(this.pivot.quaternion);
    this._faceHandles?.setQuaternion(entry.quaternion);
    this._rotRings?.updatePose(entry.box, entry.quaternion);

    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  /**
   * Set wireframe color: selected → bright yellow; deselected → black so the
   * inactive crop boxes recede (and read cleanly on light point clouds).
   */
  private _highlightHelper(id: string | null, selected: boolean): void {
    if (!id) return;
    const helper = this.helpers.get(id);
    if (helper) {
      (helper.material as THREE.LineBasicMaterial).color.setHex(
        selected ? 0xffff44 : 0x000000
      );
    }
  }

  private updateHelper(entry: ClipBoxEntry): void {
    // ── Wireframe (Box3Helper) ──────────────────────────────────────────────
    // Box3Helper reads entry.box.min/max directly in updateMatrixWorld so it
    // updates in-place each frame — only create it if it doesn't exist yet.
    if (!this.helpers.has(entry.id)) {
      // New boxes start as the deselected/black outline; selectBox brightens it.
      const helper = new THREE.Box3Helper(entry.box, new THREE.Color(0x000000));
      (helper.material as THREE.LineBasicMaterial).linewidth = 1;
      helper.renderOrder = 3;
      helper.visible = entry.visible && this._outlinesVisible;
      this.sm.scene.add(helper);
      this.helpers.set(entry.id, helper);
    }
    // Box3Helper recomputes position/scale from the box each frame but leaves
    // rotation untouched, so set the full orientation to match the clip box.
    const helper = this.helpers.get(entry.id);
    if (helper) helper.quaternion.copy(entry.quaternion);

    // ── Semi-transparent fill ───────────────────────────────────────────────
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    entry.box.getCenter(center);
    entry.box.getSize(size);

    const existingFill = this.fills.get(entry.id);
    if (existingFill) {
      // Update in-place — avoids per-frame geometry allocation during drag
      existingFill.position.copy(center);
      existingFill.scale.copy(size);
      existingFill.quaternion.copy(entry.quaternion);
    } else {
      const fillGeo = new THREE.BoxGeometry(1, 1, 1);
      const fillMat = new THREE.MeshBasicMaterial({
        color: 0xdcd546,
        opacity: 0.08,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      });
      const fillMesh = new THREE.Mesh(fillGeo, fillMat);
      fillMesh.position.copy(center);
      fillMesh.scale.copy(size);
      fillMesh.quaternion.copy(entry.quaternion);
      fillMesh.renderOrder = 2; // behind the wireframe (renderOrder 3)
      fillMesh.visible = entry.visible && this._outlinesVisible;
      this.sm.scene.add(fillMesh);
      this.fills.set(entry.id, fillMesh);
    }
  }

  private applyAll(): void {
    // Globally disabled → clear clipping on every material but keep the boxes
    // (entries/helpers/fills) intact so they still render as wireframes.
    if (!this._enabled) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const pc of this.sm.pointClouds as any[]) {
        const mat = pc.material;
        if (!mat) continue;
        mat.setClipBoxes([]);
        mat.clipMode = 0; // DISABLED
      }
      return;
    }

    const visible = this.entries.filter(e => e.visible);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const pc of this.sm.pointClouds as any[]) {
      const mat = pc.material;
      if (!mat) continue;

      if (visible.length === 0) {
        mat.setClipBoxes([]);
        mat.clipMode = 0; // DISABLED
        continue;
      }

      const clipBoxes = visible.map(entry => {
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        entry.box.getSize(size);
        entry.box.getCenter(center);
        const matrix = new THREE.Matrix4().compose(center, entry.quaternion, size);
        const inverse = matrix.clone().invert();
        return {
          box: entry.box.clone(),
          inverse,
          matrix,
          position: center.clone(),
        };
      });

      mat.setClipBoxes(clipBoxes);
      // potree-core clipMode is global: outside → 1 (keep inside), inside → 2 (remove inside)
      mat.clipMode = visible[0].mode === "outside" ? 1 : 2;
    }
  }
}
