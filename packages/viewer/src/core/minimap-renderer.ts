import * as THREE from "three";
import type { SceneManager } from "./scene-manager";

/** Renders a small top-down 2D overview minimap using a separate OrthographicCamera */
export class MinimapRenderer {
  private sceneManager: SceneManager;
  private camera: THREE.OrthographicCamera;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private frameSkip = 0;
  private readonly FRAME_INTERVAL = 6; // render every 6 main frames

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
    this.camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.01, 100000);
    this.camera.position.set(0, 0, 1000);
    this.camera.lookAt(0, 0, 0);
    this.camera.up.set(0, 1, 0);
  }

  /** Attach a canvas element for the minimap */
  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setClearColor(0x000000, 0.5);
  }

  /** Call this from the main animation loop */
  update(sceneBounds?: THREE.Box3) {
    if (!this.renderer || !this.canvas) return;
    if (++this.frameSkip < this.FRAME_INTERVAL) return;
    this.frameSkip = 0;

    if (sceneBounds && !sceneBounds.isEmpty()) {
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      sceneBounds.getSize(size);
      sceneBounds.getCenter(center);
      const half = Math.max(size.x, size.y) * 0.55;
      this.camera.left = center.x - half;
      this.camera.right = center.x + half;
      this.camera.top = center.y + half;
      this.camera.bottom = center.y - half;
      this.camera.position.set(center.x, center.y, 1000);
      this.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.sceneManager.scene, this.camera);

    // Draw camera frustum indicator on top
    this.drawCameraIndicator();
  }

  private drawCameraIndicator() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    const cam = this.sceneManager.camera;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);

    // Project camera position to minimap space
    const W = this.canvas.width;
    const H = this.canvas.height;
    const { left, right, top, bottom } = this.camera;
    const tx = (cam.position.x - left) / (right - left) * W;
    const ty = (1 - (cam.position.y - bottom) / (top - bottom)) * H;

    ctx.save();
    ctx.fillStyle = "#DCD546";
    ctx.beginPath();
    ctx.arc(tx, ty, 5, 0, Math.PI * 2);
    ctx.fill();

    // Direction arrow
    const angle = Math.atan2(dir.y, dir.x);
    ctx.strokeStyle = "#DCD546";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.cos(angle) * 15, ty - Math.sin(angle) * 15);
    ctx.stroke();
    ctx.restore();
  }

  /** Convert click on minimap canvas to 3D world XY position */
  canvasToWorld(cx: number, cy: number): THREE.Vector2 {
    if (!this.canvas) return new THREE.Vector2(0, 0);
    const W = this.canvas.width;
    const H = this.canvas.height;
    const { left, right, top, bottom } = this.camera;
    const wx = left + (cx / W) * (right - left);
    const wy = bottom + (1 - cy / H) * (top - bottom);
    return new THREE.Vector2(wx, wy);
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
    this.canvas = null;
  }
}
