import * as THREE from "three";
import type { SceneManager } from "./scene-manager";

export type ClipMode = "outside" | "inside";

export interface ClipBoxEntry {
  id: string;
  name: string;
  box: THREE.Box3;
  mode: ClipMode;
  visible: boolean;
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
  private draftHelper: THREE.Box3Helper | null = null;
  private selectedId: string | null = null;
  private transformControls: unknown = null;
  private pivot: THREE.Mesh | null = null;

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
    this.sm.scene.add(tc);
    this.transformControls = tc;
  }

  addBox(box: THREE.Box3, name?: string): ClipBoxEntry {
    const id = genId();
    const entry: ClipBoxEntry = {
      id,
      name: name ?? `Box ${this.entries.length + 1}`,
      box: box.clone(),
      mode: "outside",
      visible: true,
    };
    this.entries.push(entry);
    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
    return entry;
  }

  async selectBox(id: string | null): Promise<void> {
    // Detach previous pivot
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tc = this.transformControls as any;
    if (tc) tc.detach();
    if (this.pivot) {
      this.sm.scene.remove(this.pivot);
      this.pivot.geometry.dispose();
      this.pivot = null;
    }

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
    this.pivot.userData.clipId = id;
    this.sm.scene.add(this.pivot);

    controls.attach(this.pivot);
    controls.setMode("translate");
  }

  setTransformMode(mode: "translate" | "scale"): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.transformControls as any)?.setMode(mode);
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

    if (this.selectedId === id) {
      // Detach controls
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
      this.sm.scene.remove(tc);
      tc.dispose();
      this.transformControls = null;
    }
  }

  private syncFromPivot(): void {
    if (!this.pivot || !this.selectedId) return;
    const entry = this.entries.find(e => e.id === this.selectedId);
    if (!entry) return;

    const center = this.pivot.position.clone();
    const halfSize = new THREE.Vector3(
      Math.abs(this.pivot.scale.x) * 0.5,
      Math.abs(this.pivot.scale.y) * 0.5,
      Math.abs(this.pivot.scale.z) * 0.5,
    );
    entry.box.min.copy(center).sub(halfSize);
    entry.box.max.copy(center).add(halfSize);

    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }

  private updateHelper(entry: ClipBoxEntry): void {
    const existing = this.helpers.get(entry.id);
    if (existing) {
      this.sm.scene.remove(existing);
      existing.geometry.dispose();
    }
    const helper = new THREE.Box3Helper(entry.box, new THREE.Color(0xdcd546));
    (helper.material as THREE.LineBasicMaterial).linewidth = 1;
    helper.renderOrder = 3;
    helper.visible = entry.visible;
    this.sm.scene.add(helper);
    this.helpers.set(entry.id, helper);
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
        const matrix = new THREE.Matrix4()
          .makeScale(size.x, size.y, size.z)
          .setPosition(center);
        const inverse = matrix.clone().invert();
        return {
          box: entry.box.clone(),
          inverse,
          matrix,
          position: center.clone(),
        };
      });

      mat.setClipBoxes(clipBoxes);
      // Use first visible entry's mode for global clipMode
      // outside → 1 (keep inside box), inside → 2 (remove inside box)
      mat.clipMode = visible[0].mode === "outside" ? 1 : 2;
    }
  }
}
