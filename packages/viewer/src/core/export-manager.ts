import * as THREE from "three";
import type { SceneManager } from "./scene-manager";
import type { ExportOptions, ExportView } from "../types";

const VIEW_DIRECTIONS: Record<ExportView, { pos: THREE.Vector3; up: THREE.Vector3 }> = {
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

  /** Capture an orthographic view and return as data URL */
  async capture(options: ExportOptions): Promise<string> {
    const { view, scale, background, format, quality = 0.95 } = options;
    const { scene, renderer } = this.sceneManager;

    // Compute scene bounds
    const box = new THREE.Box3();
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj.name === "pointcloud") {
        try { box.expandByObject(obj); } catch { /* skip */ }
      }
    });

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const dir = VIEW_DIRECTIONS[view] ?? VIEW_DIRECTIONS.top;

    // Output size
    const baseW = renderer.domElement.width;
    const baseH = renderer.domElement.height;
    const outW = baseW * scale;
    const outH = baseH * scale;

    // Orthographic camera
    const aspect = outW / outH;
    const halfH = Math.max(size.x, size.y, size.z) * 0.6;
    const halfW = halfH * aspect;

    const orthoCamera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.01, 100000);
    orthoCamera.position.copy(center).addScaledVector(dir.pos, halfH * 3);
    orthoCamera.up.copy(dir.up);
    orthoCamera.lookAt(center);
    orthoCamera.updateMatrixWorld();

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

    renderer.setRenderTarget(rt);
    renderer.setSize(outW, outH);
    renderer.render(scene, orthoCamera);
    renderer.setRenderTarget(null);
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);

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
