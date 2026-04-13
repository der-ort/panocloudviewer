import * as THREE from "three";
import type { SceneManager } from "./scene-manager";

/** Renders a top-down 2D minimap using Canvas 2D API only */
export class MinimapRenderer {
  private sceneManager: SceneManager;
  private canvas: HTMLCanvasElement | null = null;
  private bounds: THREE.Box3 | null = null;

  // Derived from bounds, updated in setBounds/update
  private worldLeft = -50;
  private worldRight = 50;
  private worldTop = 50;
  private worldBottom = -50;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  /** Attach a canvas element for the minimap */
  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.update();
  }

  /** Set world-space bounds of the scene */
  setBounds(bounds: THREE.Box3) {
    this.bounds = bounds.clone();
    if (!bounds.isEmpty()) {
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      bounds.getSize(size);
      bounds.getCenter(center);
      const half = Math.max(size.x, size.y) * 0.55;
      this.worldLeft   = center.x - half;
      this.worldRight  = center.x + half;
      this.worldTop    = center.y + half;
      this.worldBottom = center.y - half;
    }
    this.update();
  }

  /** Draw the minimap — call this every frame (caller handles throttling) */
  update() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    const W = this.canvas.width;
    const H = this.canvas.height;

    // Background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(10,14,26,0.92)";
    ctx.fillRect(0, 0, W, H);

    // Grid lines — every 20% of canvas size
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const x = (W / steps) * i;
      const y = (H / steps) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Scene bounds rectangle
    if (this.bounds && !this.bounds.isEmpty()) {
      const bx1 = this._worldToCanvasX(this.bounds.min.x);
      const by1 = this._worldToCanvasY(this.bounds.max.y);
      const bx2 = this._worldToCanvasX(this.bounds.max.x);
      const by2 = this._worldToCanvasY(this.bounds.min.y);
      ctx.fillStyle = "rgba(220,213,70,0.35)";
      ctx.fillRect(bx1, by1, bx2 - bx1, by2 - by1);
      ctx.strokeStyle = "rgba(220,213,70,0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx1, by1, bx2 - bx1, by2 - by1);
    }

    // Camera frustum and dot
    this._drawCamera(ctx, W, H);

    // "N" label at top
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("N", W / 2, 10);
  }

  private _worldToCanvasX(wx: number): number {
    const canvas = this.canvas!;
    const W = canvas.width;
    return ((wx - this.worldLeft) / (this.worldRight - this.worldLeft)) * W;
  }

  private _worldToCanvasY(wy: number): number {
    const canvas = this.canvas!;
    const H = canvas.height;
    return (1 - (wy - this.worldBottom) / (this.worldTop - this.worldBottom)) * H;
  }

  private _drawCamera(ctx: CanvasRenderingContext2D, _W: number, _H: number) {
    const cam = this.sceneManager.camera;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);

    const cx = this._worldToCanvasX(cam.position.x);
    const cy = this._worldToCanvasY(cam.position.y);

    // Frustum cone
    const angle = Math.atan2(-dir.y, dir.x); // canvas Y is inverted
    const fovLen = 28;
    const halfFov = THREE.MathUtils.degToRad(cam.fov * 0.5 * (1 / Math.max(cam.aspect, 0.1)));
    const left  = angle - halfFov;
    const right = angle + halfFov;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(left)  * fovLen, cy + Math.sin(left)  * fovLen);
    ctx.lineTo(cx + Math.cos(right) * fovLen, cy + Math.sin(right) * fovLen);
    ctx.closePath();
    ctx.fillStyle   = "rgba(220,213,70,0.15)";
    ctx.strokeStyle = "rgba(220,213,70,0.5)";
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
    if (!this.canvas) return new THREE.Vector2(0, 0);
    const W = this.canvas.width;
    const H = this.canvas.height;
    const wx = this.worldLeft + (cx / W) * (this.worldRight - this.worldLeft);
    const wy = this.worldBottom + (1 - cy / H) * (this.worldTop - this.worldBottom);
    return new THREE.Vector2(wx, wy);
  }

  dispose() {
    this.canvas = null;
    this.bounds = null;
  }
}
