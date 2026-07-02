import * as THREE from "three";
import type { SceneManager } from "./scene-manager";

/**
 * Renders a top-down orthographic minimap of the point cloud scene.
 * Uses a secondary WebGLRenderer for the 3D view and a 2D canvas overlay
 * for camera indicator, markers, and labels.
 */
export class MinimapRenderer {
  private sceneManager: SceneManager;
  private bounds: THREE.Box3 | null = null;

  // Rendering elements
  private container: HTMLElement | null = null;
  private glCanvas: HTMLCanvasElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private miniRenderer: THREE.WebGLRenderer | null = null;
  private orthoCamera: THREE.OrthographicCamera;

  // World range (square, padded)
  private worldLeft = -50;
  private worldRight = 50;
  private worldTop = 50;
  private worldBottom = -50;

  private frameCount = 0;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
    // Placeholder camera — updated in setBounds
    this.orthoCamera = new THREE.OrthographicCamera(-50, 50, 50, -50, -10000, 10000);
    this.orthoCamera.position.set(0, 0, 1000);
    this.orthoCamera.up.set(0, 1, 0);
    this.orthoCamera.lookAt(0, 0, 0);
  }

  /**
   * Attach to a container element. Creates internal canvases.
   * Container should have position:relative and defined size.
   */
  attach(container: HTMLElement) {
    this.dispose();
    this.container = container;

    const w = container.clientWidth || 176;
    const h = container.clientHeight || 176;

    // WebGL canvas for 3D rendering
    this.glCanvas = document.createElement("canvas");
    this.glCanvas.width = w;
    this.glCanvas.height = h;
    this.glCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    container.appendChild(this.glCanvas);

    // 2D overlay canvas for camera indicator
    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.width = w;
    this.overlayCanvas.height = h;
    this.overlayCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
    container.appendChild(this.overlayCanvas);

    try {
      this.miniRenderer = new THREE.WebGLRenderer({
        canvas: this.glCanvas,
        antialias: false,
        alpha: false,
      });
      this.miniRenderer.setPixelRatio(1);
      this.miniRenderer.setSize(w, h, false);
      this.miniRenderer.setClearColor(0x0a0e1a, 1);
    } catch {
      // WebGL context limit — fall back to overlay-only
      this.miniRenderer = null;
    }
  }

  /** Set world-space bounds of the scene */
  setBounds(bounds: THREE.Box3) {
    this.bounds = bounds.clone();
    if (bounds.isEmpty()) return;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    const half = Math.max(size.x, size.y) * 0.55;

    this.worldLeft   = center.x - half;
    this.worldRight  = center.x + half;
    this.worldTop    = center.y + half;
    this.worldBottom = center.y - half;

    // Update ortho camera to match bounds
    this.orthoCamera.left   = this.worldLeft;
    this.orthoCamera.right  = this.worldRight;
    this.orthoCamera.top    = this.worldTop;
    this.orthoCamera.bottom = this.worldBottom;
    this.orthoCamera.near   = -10000;
    this.orthoCamera.far    = 10000;
    this.orthoCamera.position.set(center.x, center.y, 1000);
    this.orthoCamera.lookAt(center.x, center.y, 0);
    this.orthoCamera.updateProjectionMatrix();
  }

  /** Called every frame. Renders 3D scene top-down + overlay. */
  update() {
    // Throttle: render 3D every 6th frame (~10fps at 60fps main loop), overlay every 2nd
    this.frameCount++;
    const render3D = this.frameCount % 6 === 0;

    if (render3D) this._render3D();
    // Draw overlay every 2nd frame
    if (this.frameCount % 2 === 0) this._drawOverlay();
  }

  /** Sync canvas backing stores to the container's CSS size (no-op when equal). */
  private _syncSize() {
    const c = this.container;
    if (!c || !this.glCanvas) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (this.glCanvas.width === w && this.glCanvas.height === h) return;
    this.glCanvas.width = w;
    this.glCanvas.height = h;
    this.miniRenderer?.setSize(w, h, false);
    if (this.overlayCanvas) {
      this.overlayCanvas.width = w;
      this.overlayCanvas.height = h;
    }
  }

  private _render3D() {
    if (!this.miniRenderer || !this.bounds) return;
    this._syncSize(); // self-heal if the parent missed a resize() call
    this.miniRenderer.render(this.sceneManager.scene, this.orthoCamera);
  }

  private _drawOverlay() {
    if (!this.overlayCanvas) return;
    const ctx = this.overlayCanvas.getContext("2d");
    if (!ctx) return;

    const W = this.overlayCanvas.width;
    const H = this.overlayCanvas.height;
    ctx.clearRect(0, 0, W, H);

    // Camera frustum and dot
    this._drawCamera(ctx, W, H);

    // "N" label
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("N", W / 2, 10);
  }

  private _worldToCanvasX(wx: number): number {
    const W = this.overlayCanvas?.width ?? 176;
    return ((wx - this.worldLeft) / (this.worldRight - this.worldLeft)) * W;
  }

  private _worldToCanvasY(wy: number): number {
    const H = this.overlayCanvas?.height ?? 176;
    return (1 - (wy - this.worldBottom) / (this.worldTop - this.worldBottom)) * H;
  }

  private _drawCamera(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const cam = this.sceneManager.camera;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);

    // Clamp the indicator to the minimap edge when the camera is outside the
    // mapped world range — an off-canvas dot reads as "no camera at all".
    const cx = Math.min(Math.max(this._worldToCanvasX(cam.position.x), 5), W - 5);
    const cy = Math.min(Math.max(this._worldToCanvasY(cam.position.y), 5), H - 5);

    // Frustum cone — horizontal half-FOV derived from the vertical FOV + aspect
    // (hFov = 2·atan(tan(vFov/2)·aspect)); cone length scales with minimap size.
    const angle = Math.atan2(-dir.y, dir.x);
    const fovLen = Math.max(20, H * 0.16);
    const halfFov = Math.atan(
      Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * Math.max(cam.aspect, 0.1)
    );
    const left  = angle - halfFov;
    const right = angle + halfFov;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(left)  * fovLen, cy + Math.sin(left)  * fovLen);
    ctx.lineTo(cx + Math.cos(right) * fovLen, cy + Math.sin(right) * fovLen);
    ctx.closePath();
    ctx.fillStyle   = "rgba(220,213,70,0.18)";
    ctx.strokeStyle = "rgba(220,213,70,0.55)";
    ctx.lineWidth   = 1;
    ctx.fill();
    ctx.stroke();

    // Camera dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#dcd546";
    ctx.fill();
  }

  /** Convert canvas pixel to world XY position */
  canvasToWorld(cx: number, cy: number): THREE.Vector2 {
    const W = this.overlayCanvas?.width ?? 176;
    const H = this.overlayCanvas?.height ?? 176;
    const wx = this.worldLeft + (cx / W) * (this.worldRight - this.worldLeft);
    const wy = this.worldBottom + (1 - cy / H) * (this.worldTop - this.worldBottom);
    return new THREE.Vector2(wx, wy);
  }

  /** Handle resize (called by parent when container size changes) */
  resize() {
    this._syncSize();
  }

  dispose() {
    this.miniRenderer?.dispose();
    this.miniRenderer = null;
    if (this.glCanvas?.parentElement) this.glCanvas.remove();
    if (this.overlayCanvas?.parentElement) this.overlayCanvas.remove();
    this.glCanvas = null;
    this.overlayCanvas = null;
    this.container = null;
    // Intentionally keep this.bounds — it survives re-attach so the top view
    // reappears immediately when the minimap is toggled back on.
  }
}
