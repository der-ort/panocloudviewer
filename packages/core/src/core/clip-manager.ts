import * as THREE from "three";
import type { SceneManager } from "./scene-manager";
import { FaceHandleController } from "./face-handles";

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
  /** Move gizmo (translate arrows) — shown together with the rotate gizmo + face handles. */
  private tcMove: unknown = null;
  /** Rotate gizmo (full XYZ rings) — shown together with the move gizmo + face handles. */
  private tcRotate: unknown = null;
  private pivot: THREE.Mesh | null = null;
  private _faceHandles: FaceHandleController | null = null;
  /** Global clipping enable flag. When false, boxes stay visible but no clipping is applied. */
  private _enabled = true;
  /** Whether box outlines / fills / handles render at all (off = clean screenshots). */
  private _outlinesVisible = true;

  onChange?: (boxes: ClipBoxEntry[]) => void;
  onSelectChange?: (id: string | null) => void;

  constructor(sm: SceneManager) {
    this.sm = sm;
  }

  private async initTransformControls(): Promise<void> {
    if (this.tcMove && this.tcRotate) return;
    const { TransformControls } = await import(
      "three/examples/jsm/controls/TransformControls.js"
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeTc = (mode: "translate" | "rotate", size: number): any => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tc = new TransformControls(this.sm.camera, this.sm.renderer.domElement) as any;
      tc.setSpace("world");
      tc.setMode(mode);
      tc.setSize(size);
      tc.addEventListener("change", () => this.syncFromPivot());
      tc.addEventListener("dragging-changed", (e: { value: boolean }) => {
        this.sm.controls.enabled = !e.value;
      });
      this.sm.scene.add(tc.getHelper());
      return tc;
    };

    // Two gizmos on the same pivot so move + rotate are usable simultaneously,
    // alongside the face-resize handles. Rotate shows all three axes (full XYZ).
    this.tcMove = makeTc("translate", 0.8);
    this.tcRotate = makeTc("rotate", 1.1);
    this._raiseGizmo();
  }

  /**
   * Force the TransformControls gizmos to render on top of the point cloud.
   * The gizmos use default materials (depthTest=true, renderOrder=0) so they are
   * occluded by the dense cloud. Traverse each gizmo tree and disable depth
   * testing so the arrows/rings draw through.
   */
  private _raiseGizmo(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const tc of [this.tcMove, this.tcRotate] as any[]) {
      const helper = tc?.getHelper?.();
      if (!helper) continue;
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

    // Detach previous pivot, gizmos, and face handles
    this._detachGizmos();
    if (this.pivot) {
      this.sm.scene.remove(this.pivot);
      this.pivot.geometry.dispose();
      this.pivot = null;
    }
    this._faceHandles?.detach();

    this.selectedId = id;
    this.onSelectChange?.(id);

    if (!id) return;

    const entry = this.entries.find(e => e.id === id);
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

    // Create / attach face handles (box-resize)
    if (!this._faceHandles) {
      this._faceHandles = new FaceHandleController(
        this.sm.scene, this.sm.camera, this.sm.renderer.domElement,
      );
      // While a resize sphere is hovered, disable the move/rotate gizmos so a
      // press can't grab two overlapping handles at once.
      this._faceHandles.onHoverChange = (hovering) => this._setGizmosEnabled(!hovering);
    }
    this._faceHandles.setQuaternion(entry.quaternion);
    this._faceHandles.attach(entry.box, () => {
      this.updateHelper(entry);
      this.applyAll();
      // Sync pivot to match the updated box
      if (this.pivot) {
        const c = new THREE.Vector3();
        const s = new THREE.Vector3();
        entry.box.getCenter(c);
        entry.box.getSize(s);
        this.pivot.position.copy(c);
        this.pivot.scale.copy(s);
      }
      this.onChange?.(this.getBoxes());
    });

    // Show all transform gizmos at once: move arrows + full XYZ rotation rings.
    this._attachGizmos();

    // Honour the global outlines toggle (handles/gizmos hidden for clean shots).
    this._applyOutlineVisibility();

    // Highlight the selected box (bright outline)
    this._highlightHelper(id, true);
  }

  /**
   * @deprecated Transform handles (move, rotate, resize) are now shown together,
   * so there is no single active mode. Kept as a no-op for API compatibility.
   */
  setTransformMode(_mode?: "translate" | "scale" | "rotate"): void {
    /* no-op — all handles are always shown for the selected box */
  }

  /** Get the face handle controller (for viewport event forwarding) */
  get faceHandles(): FaceHandleController | null {
    return this._faceHandles;
  }

  /** Attach both gizmos to the current pivot (move + full-XYZ rotate). */
  private _attachGizmos(): void {
    if (!this.pivot) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const move = this.tcMove as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rotate = this.tcRotate as any;
    if (move) {
      move.attach(this.pivot);
      move.showX = move.showY = move.showZ = true;
    }
    if (rotate) {
      rotate.attach(this.pivot);
      rotate.showX = rotate.showY = rotate.showZ = true; // full 3-axis rotation
    }
    this._raiseGizmo();
  }

  /** Detach both gizmos. */
  private _detachGizmos(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.tcMove as any)?.detach();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.tcRotate as any)?.detach();
  }

  /** Enable/disable picking on both gizmos (never mid-drag). */
  private _setGizmosEnabled(enabled: boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const move = this.tcMove as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rotate = this.tcRotate as any;
    // Flipping enablement mid-drag would break an in-progress move/rotate.
    if (move?.dragging || rotate?.dragging) return;
    if (move) move.enabled = enabled;
    if (rotate) rotate.enabled = enabled;
  }

  /**
   * Reset a box's orientation back to axis-aligned (identity rotation). Targets
   * the given box, or the selected one when omitted.
   */
  resetRotation(id?: string): void {
    const targetId = id ?? this.selectedId;
    if (!targetId) return;
    const entry = this.entries.find(e => e.id === targetId);
    if (!entry) return;
    entry.quaternion.identity();
    if (this.selectedId === targetId) {
      this.pivot?.quaternion.identity();
      this._faceHandles?.setQuaternion(entry.quaternion);
    }
    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  removeBox(id: string): void {
    const idx = this.entries.findIndex(e => e.id === id);
    if (idx === -1) return;
    this.entries.splice(idx, 1);

    const helper = this.helpers.get(id);
    if (helper) {
      this.sm.scene.remove(helper);
      helper.geometry.dispose();
      this.helpers.delete(id);
    }

    const fill = this.fills.get(id);
    if (fill) {
      this.sm.scene.remove(fill);
      fill.geometry.dispose();
      (fill.material as THREE.MeshBasicMaterial).dispose();
      this.fills.delete(id);
    }

    if (this.selectedId === id) {
      this._detachGizmos();
      // Hide the resize handles too, or the six face spheres linger in the
      // scene as an artifact after the box itself is gone.
      this._faceHandles?.detach();
      if (this.pivot) {
        this.sm.scene.remove(this.pivot);
        this.pivot.geometry.dispose();
        this.pivot = null;
      }
      this.selectedId = null;
      this.onSelectChange?.(null);
    }

    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  setBoxMode(id: string, mode: ClipMode): void {
    const entry = this.entries.find(e => e.id === id);
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
    // are off, otherwise restore them for the current selection.
    const selected = show && this.selectedId !== null;
    if (selected) {
      this._attachGizmos();
    } else {
      this._detachGizmos();
    }
    this._faceHandles?.setGroupVisible(selected);
  }

  setBoxVisible(id: string, visible: boolean): void {
    const entry = this.entries.find(e => e.id === id);
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
    const entry = this.entries.find(e => e.id === id);
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
    if (this.draftHelper) {
      this.sm.scene.remove(this.draftHelper);
      this.draftHelper.geometry.dispose();
      this.draftHelper = null;
    }
    if (box && !box.isEmpty()) {
      this.draftHelper = new THREE.Box3Helper(box, new THREE.Color(0xdcd546));
      (this.draftHelper.material as THREE.LineBasicMaterial).transparent = true;
      (this.draftHelper.material as THREE.LineBasicMaterial).opacity = 0.6;
      this.draftHelper.renderOrder = 3;
      this.sm.scene.add(this.draftHelper);
    }
  }

  clear(): void {
    // Detach gizmos
    this._detachGizmos();
    // Hide the resize handles so they don't linger after every box is cleared.
    this._faceHandles?.detach();
    if (this.pivot) {
      this.sm.scene.remove(this.pivot);
      this.pivot.geometry.dispose();
      this.pivot = null;
    }

    for (const [, helper] of this.helpers) {
      this.sm.scene.remove(helper);
      helper.geometry.dispose();
    }
    this.helpers.clear();

    for (const [, fill] of this.fills) {
      this.sm.scene.remove(fill);
      fill.geometry.dispose();
      (fill.material as THREE.MeshBasicMaterial).dispose();
    }
    this.fills.clear();

    this.entries = [];
    this.selectedId = null;

    if (this.draftHelper) {
      this.sm.scene.remove(this.draftHelper);
      this.draftHelper.geometry.dispose();
      this.draftHelper = null;
    }

    this.applyAll();
    this.onChange?.([]);
    this.onSelectChange?.(null);
  }

  dispose(): void {
    this.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const tc of [this.tcMove, this.tcRotate] as any[]) {
      if (!tc) continue;
      this.sm.scene.remove(tc.getHelper());
      tc.dispose();
    }
    this.tcMove = null;
    this.tcRotate = null;
    if (this._faceHandles) {
      this._faceHandles.dispose();
      this._faceHandles = null;
    }
  }

  private syncFromPivot(): void {
    if (!this.pivot || !this.selectedId) return;
    const entry = this.entries.find(e => e.id === this.selectedId);
    if (!entry) return;

    // Move + rotate gizmos share the pivot: center follows its position, full
    // orientation follows its quaternion. Size (pivot.scale) is owned by the
    // face-resize handles and is left untouched here.
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
