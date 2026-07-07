import * as THREE from "three";
import type { SceneManager } from "./scene-manager";

/**
 * NavVis-style picking magnifier: while a measurement tool is active, a small
 * zoomed inset follows the cursor so the user can see exactly which detail
 * they are snapping to.
 *
 * Implementation: a second render pass of the MAIN scene through a CLONE of
 * the main camera with a `setViewOffset` crop around the cursor, scissored
 * into a square near the cursor — a true crop-magnification of exactly what
 * is on screen. Unlike the earlier narrow-FOV re-aim, this keeps the main
 * camera's pose and projection semantics, so it magnifies identically for
 * perspective and orthographic cameras and for potree point materials (whose
 * size/LOD uniforms are computed for the main camera). No framebuffer
 * readbacks, no `preserveDrawingBuffer` (a readback-based 2D loupe was tried
 * before and was slow and empty — see CLAUDE.md).
 *
 * Potree LOD note: we deliberately do NOT call `potree.updatePointClouds` with
 * the zoom camera — that would re-target octree streaming every frame and
 * thrash the loader. The inset magnifies whatever LOD the main camera loaded,
 * which is exactly what the user is picking against.
 */
export class MagnifierRenderer {
  private sm: SceneManager;
  private enabled = false;
  /** Latest cursor position (canvas-relative CSS px), or null when off-canvas. */
  private cursor: { cx: number; cy: number } | null = null;
  /** Reused per-frame crop camera — copied from the main camera each render
   *  (cloning per frame allocated a camera + matrices → GC churn). */
  private zoomCamera = new THREE.PerspectiveCamera();

  // Frame + crosshair drawn over the inset in a second tiny pass.
  private frameScene = new THREE.Scene();
  private frameCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private frameDisposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  /** Inset size (CSS px) and zoom factor. */
  static readonly SIZE = 180;
  static readonly ZOOM = 8;

  /**
   * Objects hidden ONLY during the magnifier's scene render (restored right
   * after). Used for the measurement snap crosshair, whose low-res sprite
   * looks pixelated when zoomed — the magnifier draws its own crisp crosshair.
   */
  private hideProviders: Array<() => THREE.Object3D | null | undefined> = [];

  constructor(sm: SceneManager) {
    this.sm = sm;
    this._buildFrame();
  }

  /** Register an object (via a getter, since it may be created lazily) to hide
   *  during the magnifier's render pass only. */
  hideDuringRender(provider: () => THREE.Object3D | null | undefined): void {
    this.hideProviders.push(provider);
  }

  private _buildFrame(): void {
    const border = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.995, -0.995, 0),
        new THREE.Vector3(0.995, -0.995, 0),
        new THREE.Vector3(0.995, 0.995, 0),
        new THREE.Vector3(-0.995, 0.995, 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0xdcd546 }),
    );
    // Center crosshair with a small gap so the exact pick point stays visible.
    const g = 0.08, a = 0.3;
    const cross = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-a, 0, 0), new THREE.Vector3(-g, 0, 0),
        new THREE.Vector3(g, 0, 0),  new THREE.Vector3(a, 0, 0),
        new THREE.Vector3(0, -a, 0), new THREE.Vector3(0, -g, 0),
        new THREE.Vector3(0, g, 0),  new THREE.Vector3(0, a, 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    );
    this.frameScene.add(border, cross);
    this.frameDisposables.push(border.geometry, border.material as THREE.Material,
      cross.geometry, cross.material as THREE.Material);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.cursor = null;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Feed the latest cursor position (canvas-relative CSS px).
   * Call on mousemove while a measurement tool is active.
   */
  update(cx: number, cy: number): void {
    this.cursor = { cx, cy };
  }

  /** Hide the inset (cursor left the canvas / tool deactivated). */
  clearCursor(): void {
    this.cursor = null;
  }

  /** Render the inset. Register as a SceneManager post-render callback. */
  render(): void {
    if (!this.enabled || !this.cursor) return;
    const renderer = this.sm.renderer;
    const el = renderer.domElement;
    const W = el.clientWidth;
    const H = el.clientHeight;
    if (W === 0 || H === 0) return;

    const size = MagnifierRenderer.SIZE;
    const { cx, cy } = this.cursor;

    // Inset placement: offset up-right of the cursor, flipped near edges so it
    // stays fully on screen. GL viewport origin is BOTTOM-left.
    const pad = 24;
    let left = cx + pad;
    if (left + size > W) left = cx - pad - size;
    let bottom = H - cy + pad;
    if (bottom + size > H) bottom = H - cy - pad - size;
    left = Math.max(0, Math.min(left, W - size));
    bottom = Math.max(0, Math.min(bottom, H - size));

    // Zoom camera: the main camera's pose/projection rendering only a
    // (size / ZOOM)² crop centered on the cursor — crop → magnification.
    // copy() resets .view to the main camera's (null), then setViewOffset
    // installs this frame's crop, so no stale offset carries over.
    const sub = size / MagnifierRenderer.ZOOM;
    const zoomCamera = this.zoomCamera;
    zoomCamera.copy(this.sm.camera);
    zoomCamera.setViewOffset(W, H, cx - sub / 2, cy - sub / 2, sub, sub);
    zoomCamera.updateProjectionMatrix();

    // Save renderer state
    const savedVp = new THREE.Vector4();
    const savedSc = new THREE.Vector4();
    renderer.getViewport(savedVp);
    renderer.getScissor(savedSc);
    const savedScTest = renderer.getScissorTest();
    const savedAutoClear = renderer.autoClear;

    renderer.autoClear = false;
    renderer.setScissorTest(true);
    renderer.setScissor(left, bottom, size, size);
    renderer.setViewport(left, bottom, size, size);

    // Hide registered objects (the pixelated snap crosshair) for this pass only.
    const restore: THREE.Object3D[] = [];
    for (const provider of this.hideProviders) {
      const obj = provider();
      if (obj && obj.visible) { obj.visible = false; restore.push(obj); }
    }

    // The scene's own background fills the square (clearDepth keeps the main
    // image outside the scissor untouched).
    renderer.clearDepth();
    renderer.render(this.sm.scene, zoomCamera);

    for (const obj of restore) obj.visible = true;

    // Frame + crisp vector crosshair on top
    renderer.clearDepth();
    renderer.render(this.frameScene, this.frameCamera);

    renderer.setViewport(savedVp);
    renderer.setScissor(savedSc);
    renderer.setScissorTest(savedScTest);
    renderer.autoClear = savedAutoClear;
  }

  dispose(): void {
    for (const d of this.frameDisposables) d.dispose();
    this.frameDisposables = [];
  }
}
