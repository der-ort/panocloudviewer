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
  /** Rotation about the world Z axis, in radians. Defaults to 0. */
  rotationZ: number;
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
  private transformControls: unknown = null;
  private pivot: THREE.Mesh | null = null;
  private _faceHandles: FaceHandleController | null = null;
  private _transformMode: "translate" | "scale" | "rotate" = "translate";

  onChange?: (boxes: ClipBoxEntry[]) => void;
  onSelectChange?: (id: string | null) => void;

  constructor(sm: SceneManager) {
    this.sm = sm;
  }

  private async initTransformControls(): Promise<void> {
    if (this.transformControls) return;
    const { TransformControls } = await import(
      "three/examples/jsm/controls/TransformControls.js"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tc = new TransformControls(this.sm.camera, this.sm.renderer.domElement) as any;
    tc.setSpace("world");
    tc.setSize(0.8);
    tc.addEventListener("change", () => this.syncFromPivot());
    tc.addEventListener("dragging-changed", (e: { value: boolean }) => {
      this.sm.controls.enabled = !e.value;
    });
    this.sm.scene.add(tc.getHelper());
    this.transformControls = tc;
    this._raiseGizmo();
  }

  /**
   * Force the TransformControls gizmo to render on top of the point cloud.
   * The gizmo uses default materials (depthTest=true, renderOrder=0) so it is
   * occluded by the dense cloud. Traverse the gizmo tree and disable depth
   * testing so the arrows/rings draw through. Must be re-applied after every
   * setMode() because TransformControls rebuilds its gizmo/picker meshes.
   */
  private _raiseGizmo(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tc = this.transformControls as any;
    const helper = tc?.getHelper?.();
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

  addBox(box: THREE.Box3, name?: string): ClipBoxEntry {
    const id = genId();
    const entry: ClipBoxEntry = {
      id,
      name: name ?? `Box ${this.entries.length + 1}`,
      box: box.clone(),
      mode: "outside",
      visible: true,
      rotationZ: 0,
    };
    this.entries.push(entry);
    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
    return entry;
  }

  async selectBox(id: string | null): Promise<void> {
    // Unhighlight previous
    this._highlightHelper(this.selectedId, false);

    // Detach previous pivot and face handles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tc = this.transformControls as any;
    if (tc) tc.detach();
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = this.transformControls as any;

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    entry.box.getCenter(center);
    entry.box.getSize(size);

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ visible: false });
    this.pivot = new THREE.Mesh(geo, mat);
    this.pivot.position.copy(center);
    this.pivot.scale.copy(size);
    this.pivot.rotation.set(0, 0, entry.rotationZ ?? 0);
    this.pivot.userData.clipId = id;
    this.sm.scene.add(this.pivot);

    controls.attach(this.pivot);
    controls.setMode("translate");

    // Create / attach face handles
    if (!this._faceHandles) {
      this._faceHandles = new FaceHandleController(
        this.sm.scene, this.sm.camera, this.sm.renderer.domElement,
      );
    }
    this._faceHandles.setRotationZ(entry.rotationZ ?? 0);
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
    // Show/hide face handles based on current mode
    this._applyTransformMode();

    // Highlight the selected box
    this._highlightHelper(id, true);
  }

  setTransformMode(mode: "translate" | "scale" | "rotate"): void {
    this._transformMode = mode;
    this._applyTransformMode();
  }

  /** Get the face handle controller (for viewport event forwarding) */
  get faceHandles(): FaceHandleController | null {
    return this._faceHandles;
  }

  private _applyTransformMode(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tc = this.transformControls as any;
    if (this._transformMode === "scale") {
      // Scale mode → use face handles instead of TransformControls
      if (tc) tc.detach();
      // Re-attach face handles to the selected box
      if (this._faceHandles && this.selectedId) {
        const entry = this.entries.find(e => e.id === this.selectedId);
        if (entry && !this._faceHandles.isAttached()) {
          this._faceHandles.setRotationZ(entry.rotationZ ?? 0);
          this._faceHandles.attach(entry.box, () => {
            this.updateHelper(entry);
            this.applyAll();
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
        }
        this._faceHandles.updatePositions();
      }
    } else {
      // Translate/Rotate → use TransformControls, hide face handles
      if (tc && this.pivot) {
        tc.attach(this.pivot);
        tc.setMode(this._transformMode);
        if (this._transformMode === "rotate") {
          // Constrain rotation to a single ring about world Z.
          tc.showX = false;
          tc.showY = false;
          tc.showZ = true;
          tc.setSize(1.0);
        } else {
          tc.showX = true;
          tc.showY = true;
          tc.showZ = true;
          tc.setSize(0.8);
        }
        // TransformControls rebuilds its gizmo meshes on setMode — re-raise.
        this._raiseGizmo();
      }
      this._faceHandles?.detach();
    }
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.transformControls as any)?.detach();
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

  setBoxVisible(id: string, visible: boolean): void {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;
    entry.visible = visible;
    const helper = this.helpers.get(id);
    if (helper) helper.visible = visible;
    const fill = this.fills.get(id);
    if (fill) fill.visible = visible;
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
    // Detach controls
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.transformControls as any)?.detach();
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
    const tc = this.transformControls as any;
    if (tc) {
      this.sm.scene.remove(tc.getHelper());
      tc.dispose();
      this.transformControls = null;
    }
    if (this._faceHandles) {
      this._faceHandles.dispose();
      this._faceHandles = null;
    }
  }

  private syncFromPivot(): void {
    if (!this.pivot || !this.selectedId) return;
    const entry = this.entries.find(e => e.id === this.selectedId);
    if (!entry) return;

    if (this._transformMode === "rotate") {
      // Rotate is constrained to the world Z axis. Extract the Z component,
      // store it on the entry, and flatten the pivot back to Z-only so the
      // gizmo can never tilt the box off-axis.
      const zRot = new THREE.Euler().setFromQuaternion(this.pivot.quaternion, "ZYX").z;
      entry.rotationZ = zRot;
      this.pivot.rotation.set(0, 0, zRot);
      this._faceHandles?.setRotationZ(zRot);
    } else {
      // Translate (TransformControls) — box center follows the pivot, size unchanged.
      const center = this.pivot.position.clone();
      const halfSize = new THREE.Vector3(
        Math.abs(this.pivot.scale.x) * 0.5,
        Math.abs(this.pivot.scale.y) * 0.5,
        Math.abs(this.pivot.scale.z) * 0.5,
      );
      entry.box.min.copy(center).sub(halfSize);
      entry.box.max.copy(center).add(halfSize);
    }

    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  /** Set wireframe color for selected/default state */
  private _highlightHelper(id: string | null, selected: boolean): void {
    if (!id) return;
    const helper = this.helpers.get(id);
    if (helper) {
      (helper.material as THREE.LineBasicMaterial).color.setHex(
        selected ? 0xffff44 : 0xdcd546
      );
    }
  }

  private updateHelper(entry: ClipBoxEntry): void {
    // ── Wireframe (Box3Helper) ──────────────────────────────────────────────
    // Box3Helper reads entry.box.min/max directly in updateMatrixWorld so it
    // updates in-place each frame — only create it if it doesn't exist yet.
    if (!this.helpers.has(entry.id)) {
      const helper = new THREE.Box3Helper(entry.box, new THREE.Color(0xdcd546));
      (helper.material as THREE.LineBasicMaterial).linewidth = 1;
      helper.renderOrder = 3;
      helper.visible = entry.visible;
      this.sm.scene.add(helper);
      this.helpers.set(entry.id, helper);
    }
    // Box3Helper recomputes position/scale from the box each frame but leaves
    // rotation untouched, so set rotation.z to match the oriented clip box.
    const helper = this.helpers.get(entry.id);
    if (helper) helper.rotation.z = entry.rotationZ ?? 0;

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
      existingFill.rotation.z = entry.rotationZ ?? 0;
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
      fillMesh.rotation.z = entry.rotationZ ?? 0;
      fillMesh.renderOrder = 2; // behind the wireframe (renderOrder 3)
      fillMesh.visible = entry.visible;
      this.sm.scene.add(fillMesh);
      this.fills.set(entry.id, fillMesh);
    }
  }

  private applyAll(): void {
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
        const q = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1), entry.rotationZ ?? 0,
        );
        const matrix = new THREE.Matrix4().compose(center, q, size);
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
