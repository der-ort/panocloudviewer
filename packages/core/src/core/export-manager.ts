import * as THREE from "three";
import type { SceneManager } from "./scene-manager";
import type { ExportOptions, ExportView } from "../types";

const VIEW_DIRECTIONS: Record<Exclude<ExportView, "current">, { pos: THREE.Vector3; up: THREE.Vector3 }> = {
  top:    { pos: new THREE.Vector3(0, 0, 1),  up: new THREE.Vector3(0, 1, 0) },
  front:  { pos: new THREE.Vector3(0, -1, 0), up: new THREE.Vector3(0, 0, 1) },
  side:   { pos: new THREE.Vector3(1, 0, 0),  up: new THREE.Vector3(0, 0, 1) },
  back:   { pos: new THREE.Vector3(0, 1, 0),  up: new THREE.Vector3(0, 0, 1) },
  custom: { pos: new THREE.Vector3(0, 0, 1),  up: new THREE.Vector3(0, 1, 0) },
};

/** Renders orthographic views and exports them as image files */
export class ExportManager {
  private sceneManager: SceneManager;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  /** World-space bounds of the loaded point clouds (potree octrees aren't Meshes). */
  private cloudBounds(): THREE.Box3 {
    const box = new THREE.Box3();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const pc of this.sceneManager.pointClouds as any[]) {
      const g = pc.pcoGeometry;
      const tb = g?.tightBoundingBox ?? g?.boundingBox ?? pc.boundingBox;
      const off = g?.offset;
      if (tb) {
        const wb = tb.clone();
        if (off) { wb.min.add(off); wb.max.add(off); }
        box.union(wb);
      } else {
        try { box.expandByObject(pc); } catch { /* skip */ }
      }
    }
    return box;
  }

  /**
   * Capture a view to an image data URL. `view: "current"` snapshots exactly what
   * the user sees (the live camera); the other views render an orthographic shot
   * framed to the cloud bounds.
   */
  async capture(options: ExportOptions): Promise<string> {
    const { view, scale, background, format, quality = 0.95 } = options;
    const { scene, renderer } = this.sceneManager;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const potree = this.sceneManager.potree as any;

    // Output size (clamped — large × 4 can exceed GL limits)
    const baseW = renderer.domElement.width;
    const baseH = renderer.domElement.height;
    const maxDim = renderer.capabilities.maxTextureSize || 4096;
    const outW = Math.max(1, Math.min(Math.round(baseW * scale), maxDim));
    const outH = Math.max(1, Math.min(Math.round(baseH * scale), maxDim));
    const aspect = outW / outH;

    let camera: THREE.Camera;
    if (view === "current") {
      // Exactly what's on screen — clone the live camera, fix aspect.
      const cam = this.sceneManager.camera.clone();
      cam.aspect = aspect;
      cam.updateProjectionMatrix();
      camera = cam;
    } else {
      const box = this.cloudBounds();
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxExt = Math.max(size.x, size.y, size.z, 1);
      const dir = VIEW_DIRECTIONS[view] ?? VIEW_DIRECTIONS.top;
      const halfH = maxExt * 0.6;
      const halfW = halfH * aspect;
      const ortho = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.01, maxExt * 10 + 10000);
      ortho.position.copy(center).addScaledVector(dir.pos, maxExt * 2);
      ortho.up.copy(dir.up);
      ortho.lookAt(center);
      ortho.updateMatrixWorld();
      camera = ortho;
    }

    // Render target
    const rt = new THREE.WebGLRenderTarget(outW, outH, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    const prevBg = scene.background;
    if (background === "white") scene.background = new THREE.Color(0xffffff);
    else if (background === "black") scene.background = new THREE.Color(0x000000);
    else scene.background = null;

    // Resolve the right octree nodes/point sizes for THIS camera before rendering,
    // otherwise the export is empty/wrong (potree LOD is camera-driven).
    if (potree && this.sceneManager.pointClouds.length > 0) {
      potree.updatePointClouds(this.sceneManager.pointClouds, camera, renderer);
    }

    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    scene.background = prevBg;

    // Read pixels
    const pixels = new Uint8Array(outW * outH * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, outW, outH, pixels);
    rt.dispose();

    // Flip Y (WebGL is bottom-up)
    const flipped = new Uint8ClampedArray(outW * outH * 4);
    for (let y = 0; y < outH; y++) {
      const src = (outH - 1 - y) * outW * 4;
      const dst = y * outW * 4;
      flipped.set(pixels.subarray(src, src + outW * 4), dst);
    }

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    canvas.getContext("2d")!.putImageData(new ImageData(flipped, outW, outH), 0, 0);

    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    return canvas.toDataURL(mime, quality);
  }

  /** Download a data URL as a file */
  static download(dataUrl: string, filename: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }
}
