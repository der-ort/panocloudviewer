import * as THREE from "three";
import type { SceneManager } from "./scene-manager";

/**
 * Renders a small XYZ orientation widget in the top-right corner of the
 * viewport using a second render pass with scissor clipping.
 *
 * Flat, technical-drawing style — no lighting, MeshBasicMaterial only.
 * Shows world-space orientation: the widget camera mirrors the main camera's
 * rotation so the user always sees how X, Y, Z axes are oriented relative
 * to the current view.
 */
export class AxisWidget {
  private _scene: THREE.Scene;
  private _camera: THREE.PerspectiveCamera;
  private _disposables: THREE.BufferGeometry[] = [];
  private _materials: THREE.Material[] = [];
  readonly sm: SceneManager;

  constructor(sm: SceneManager) {
    this.sm = sm;
    this._scene = new THREE.Scene();
    // Transparent — no background, the widget floats over the viewport
    this._scene.background = null;

    // Perspective camera — no lights needed for MeshBasicMaterial
    this._camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);

    this._buildAxes();
  }

  private _buildAxes(): void {
    const axes = [
      { dir: new THREE.Vector3(1, 0, 0), color: 0xe63946, label: "X" },  // red
      { dir: new THREE.Vector3(0, 1, 0), color: 0x2a9d8f, label: "Y" },  // teal
      { dir: new THREE.Vector3(0, 0, 1), color: 0x457b9d, label: "Z" },  // blue
    ];

    for (const axis of axes) {
      // Flat material — no lighting needed, minimal GPU cost
      const mat = new THREE.MeshBasicMaterial({ color: axis.color });
      this._materials.push(mat);

      // Build geometry along +Y then rotate to match axis direction
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        axis.dir,
      );

      // Thin uniform shaft
      const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.65, 6);
      shaftGeo.translate(0, 0.325, 0);
      shaftGeo.applyQuaternion(quat);
      this._scene.add(new THREE.Mesh(shaftGeo, mat));
      this._disposables.push(shaftGeo);

      // Arrowhead cone
      const coneGeo = new THREE.ConeGeometry(0.08, 0.2, 8);
      coneGeo.translate(0, 0.76, 0);
      coneGeo.applyQuaternion(quat);
      this._scene.add(new THREE.Mesh(coneGeo, mat));
      this._disposables.push(coneGeo);

      // Letter label sprite at the tip
      const sprite = this._makeLabel(axis.label, axis.color);
      const tipPos = axis.dir.clone().multiplyScalar(1.05);
      sprite.position.copy(tipPos);
      sprite.scale.set(0.28, 0.28, 1);
      this._scene.add(sprite);
    }

    // Small origin dot
    const sGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const sMat = new THREE.MeshBasicMaterial({ color: 0x999999 });
    this._scene.add(new THREE.Mesh(sGeo, sMat));
    this._disposables.push(sGeo);
    this._materials.push(sMat);
  }

  /** Create a canvas-based sprite with the axis letter */
  private _makeLabel(letter: string, color: number): THREE.Sprite {
    const res = 64;
    const canvas = document.createElement("canvas");
    canvas.width = res;
    canvas.height = res;
    const ctx = canvas.getContext("2d")!;

    // White letter with a subtle dark shadow for contrast on any background
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${res * 0.6}px "Inter", system-ui, sans-serif`;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillText(letter, res / 2 + 1, res / 2 + 1);

    // Letter in the axis colour
    const hex = "#" + color.toString(16).padStart(6, "0");
    ctx.fillStyle = hex;
    ctx.fillText(letter, res / 2, res / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
    });
    this._materials.push(mat);
    return new THREE.Sprite(mat);
  }

  /**
   * Render the widget into a scissor region in the top-right corner.
   * Must be called from a post-render callback after the main scene renders.
   */
  render(): void {
    const renderer = this.sm.renderer;
    const el = renderer.domElement;
    const W = el.clientWidth;
    const H = el.clientHeight;
    if (W === 0 || H === 0) return;

    const size = 100;
    const margin = 10;

    // Save state
    const savedVp = new THREE.Vector4();
    const savedSc = new THREE.Vector4();
    renderer.getViewport(savedVp);
    renderer.getScissor(savedSc);
    const savedScTest = renderer.getScissorTest();
    const savedAutoClear = renderer.autoClear;

    // Sync widget camera to main camera orientation
    const dist = 3.0;
    const offset = new THREE.Vector3(0, 0, dist).applyQuaternion(
      this.sm.camera.quaternion,
    );
    this._camera.position.copy(offset);
    this._camera.up.copy(this.sm.camera.up);
    this._camera.lookAt(0, 0, 0);

    // Scissor region — top-right corner (y=0 is bottom in WebGL)
    const x = W - size - margin;
    const y = H - size - margin;

    renderer.autoClear = false;
    renderer.setScissorTest(true);
    renderer.setScissor(x, y, size, size);
    renderer.setViewport(x, y, size, size);

    // Clear only depth — the null background means the main scene shows
    // through, so the widget floats transparently over the viewport
    renderer.clearDepth();
    renderer.render(this._scene, this._camera);

    // Restore state
    renderer.setViewport(savedVp);
    renderer.setScissor(savedSc);
    renderer.setScissorTest(savedScTest);
    renderer.autoClear = savedAutoClear;
  }

  dispose(): void {
    for (const g of this._disposables) g.dispose();
    for (const m of this._materials) {
      if (m instanceof THREE.SpriteMaterial) m.map?.dispose();
      m.dispose();
    }
    this._disposables = [];
    this._materials = [];
  }
}
