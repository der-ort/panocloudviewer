import * as THREE from "three";
import type { SceneManager } from "./scene-manager";

/**
 * Point-picking magnifier. While a measurement tool is active, this renders a
 * zoomed-in view of the area around the snapped point into a small square
 * region in the top-right of the viewport, so the user can place points with
 * pixel precision. It reuses the MAIN renderer via a scissored post-render pass
 * (like {@link AxisWidget}) — no second WebGL context and no duplicated point
 * uploads — so it stays cheap.
 *
 * The zoom is achieved by aiming a cloned camera at the snap target with a
 * narrow FOV, which keeps the target centered (under the DOM crosshair the
 * viewport draws over this region).
 */
export class MagnifierRenderer {
  private sm: SceneManager;
  private _cam: THREE.PerspectiveCamera;
  private _target: THREE.Vector3 | null = null;
  private _active = false;
  private _zoom = 7;
  private _tmpColor = new THREE.Color();

  /** Square edge length and corner margin, in CSS pixels. */
  readonly size = 168;
  readonly margin = 12;
  /** Distance from the RIGHT viewport edge, CSS px (raised to clear the sidebar). */
  private _rightCss = 12;

  constructor(sm: SceneManager) {
    this.sm = sm;
    this._cam = new THREE.PerspectiveCamera(50, 1, 0.01, 1e7);
  }

  setActive(active: boolean): void {
    this._active = active;
    if (!active) this._target = null;
  }

  /** Set the gap from the right edge (CSS px) so the panel clears the sidebar. */
  setRightOffsetCss(px: number): void {
    this._rightCss = Math.max(this.margin, px);
  }

  /** Center the magnifier on a world position (the snapped point). */
  setTarget(world: THREE.Vector3 | null): void {
    this._target = world ? world.clone() : null;
  }

  /** Magnification factor (relative to the main FOV). */
  setZoom(zoom: number): void {
    this._zoom = Math.max(2, zoom);
  }

  /** Whether the magnifier currently has something to show. */
  isShowing(): boolean {
    return this._active && this._target !== null;
  }

  /** CSS-pixel rect (top-left origin) so the DOM overlay can match the region. */
  getRectCss(): { left: number; top: number; size: number } {
    const el = this.sm.renderer.domElement;
    return { left: el.clientWidth - this.size - this.margin, top: this.margin, size: this.size };
  }

  /** Run from a post-render callback (after the main scene render). */
  render(): void {
    if (!this._active || !this._target) return;
    const renderer = this.sm.renderer;
    const el = renderer.domElement;
    const wCss = el.clientWidth;
    const hCss = el.clientHeight;
    if (wCss === 0 || hCss === 0) return;

    const dpr = renderer.getPixelRatio();
    const sizePx = Math.round(this.size * dpr);
    const topPx = Math.round(this.margin * dpr);
    const rightPx = Math.round(this._rightCss * dpr);
    const wBuf = Math.round(wCss * dpr);
    const hBuf = Math.round(hCss * dpr);

    // Top-right square (WebGL scissor origin is bottom-left).
    const x = wBuf - sizePx - rightPx;
    const y = hBuf - sizePx - topPx;
    if (x < 0 || y < 0) return;

    // Zoomed camera: same eye as the main camera, narrow FOV, aimed at target.
    const main = this.sm.camera;
    this._cam.position.copy(main.position);
    this._cam.up.copy(main.up);
    this._cam.near = main.near;
    this._cam.far = main.far;
    this._cam.fov = Math.max(1.5, main.fov / this._zoom);
    this._cam.aspect = 1;
    this._cam.lookAt(this._target);
    this._cam.updateProjectionMatrix();

    // Save renderer state
    const savedVp = renderer.getViewport(new THREE.Vector4());
    const savedSc = renderer.getScissor(new THREE.Vector4());
    const savedScTest = renderer.getScissorTest();
    const savedAutoClear = renderer.autoClear;
    const savedClear = renderer.getClearColor(this._tmpColor).clone();
    const savedClearAlpha = renderer.getClearAlpha();

    renderer.autoClear = false;
    renderer.setScissorTest(true);
    renderer.setScissor(x, y, sizePx, sizePx);
    renderer.setViewport(x, y, sizePx, sizePx);
    renderer.setClearColor(0x0a0e1a, 1);
    renderer.clear(true, true, false); // opaque little window: clear color + depth
    renderer.render(this.sm.scene, this._cam);

    // Restore
    renderer.setViewport(savedVp);
    renderer.setScissor(savedSc);
    renderer.setScissorTest(savedScTest);
    renderer.autoClear = savedAutoClear;
    renderer.setClearColor(savedClear, savedClearAlpha);
  }
}
