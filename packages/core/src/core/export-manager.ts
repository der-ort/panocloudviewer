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

/** Lazy-loaded mp4 muxer (from CDN, like the pano engines) — keeps it out of the bundle. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _muxerPromise: Promise<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadMp4Muxer(): Promise<any> {
  if (!_muxerPromise) {
    // `new Function` keeps esbuild/webpack from trying to resolve the https URL.
    const runtimeImport = new Function("u", "return import(u)") as (u: string) => Promise<unknown>;
    _muxerPromise = runtimeImport("https://cdn.jsdelivr.net/npm/mp4-muxer@5/+esm");
  }
  return _muxerPromise;
}

/** Options for {@link ExportManager.recordAnimation}. */
export interface RecordOptions {
  /** Set the camera for absolute time `t` (seconds). Called once per frame. */
  sampleCamera: (t: number) => void;
  /** Total animation length in seconds. */
  durationSec: number;
  fps?: number;          // default 30
  width?: number;        // default 1920
  height?: number;       // default 1080
  /** "current" keeps the live scene background; otherwise overrides it. Default "current". */
  background?: "white" | "black" | "transparent" | "current";
  bitrate?: number;      // default 12 Mbps
  onProgress?: (fraction: number) => void;
}

/** Renders orthographic views and exports them as image files */
export class ExportManager {
  private sceneManager: SceneManager;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  /**
   * Record a camera animation to an MP4 Blob by rendering **frame by frame** at a
   * fixed resolution (default 1920×1080) and encoding with WebCodecs (exact
   * per-frame timestamps → no stutter, high bitrate → not over-compressed).
   * Rendering is deterministic (not real-time), so it's smooth regardless of how
   * long each frame takes. Requires WebCodecs (Chrome/Edge).
   */
  async recordAnimation(opts: RecordOptions): Promise<Blob> {
    const {
      sampleCamera, durationSec, fps = 30,
      width = 1920, height = 1080, background = "current",
      bitrate = 12_000_000, onProgress,
    } = opts;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof w.VideoEncoder === "undefined" || typeof w.VideoFrame === "undefined") {
      throw new Error("This browser doesn't support WebCodecs video recording — try Chrome or Edge.");
    }

    const { renderer, scene } = this.sceneManager;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const potree = this.sceneManager.potree as any;

    const muxMod = await loadMp4Muxer();
    const Muxer = muxMod.Muxer ?? muxMod.default?.Muxer;
    const ArrayBufferTarget = muxMod.ArrayBufferTarget ?? muxMod.default?.ArrayBufferTarget;
    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: { codec: "avc", width, height },
      fastStart: "in-memory",
    });

    const encoder = new w.VideoEncoder({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
      error: (e: unknown) => console.error("[recordAnimation]", e),
    });
    // `avc.format: "avc"` makes the encoder emit a length-prefixed stream with an
    // avcC `decoderConfig.description` — mp4-muxer needs it (else "decoderConfig is null").
    encoder.configure({
      codec: "avc1.640028", width, height, bitrate, framerate: fps,
      avc: { format: "avc" },
    });

    // Save + override render state (updateStyle=false so the CSS size / ResizeObserver are untouched).
    const prevSize = new THREE.Vector2();
    renderer.getSize(prevSize);
    const prevPR = renderer.getPixelRatio();
    const prevBg = scene.background;
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    if (background === "white") scene.background = new THREE.Color(0xffffff);
    else if (background === "black") scene.background = new THREE.Color(0x000000);
    else if (background === "transparent") scene.background = null;
    // "current" → leave scene.background untouched (matches the live view).

    const rt = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
    const c2d = document.createElement("canvas");
    c2d.width = width; c2d.height = height;
    const ctx = c2d.getContext("2d")!;
    const pixels = new Uint8Array(width * height * 4);
    const flipped = new Uint8ClampedArray(width * height * 4);
    const row = width * 4;
    const frameDur = Math.round(1e6 / fps);
    const total = Math.max(1, Math.round(durationSec * fps));

    try {
      for (let f = 0; f < total; f++) {
        sampleCamera(f / fps);
        const cam = this.sceneManager.camera;
        if (potree && this.sceneManager.pointClouds.length > 0) {
          potree.updatePointClouds(this.sceneManager.pointClouds, cam, renderer);
        }
        renderer.setRenderTarget(rt);
        renderer.clear();
        renderer.render(scene, cam);
        renderer.setRenderTarget(null);
        renderer.readRenderTargetPixels(rt, 0, 0, width, height, pixels);
        // Flip Y (WebGL is bottom-up).
        for (let y = 0; y < height; y++) {
          const s = (height - 1 - y) * row;
          flipped.set(pixels.subarray(s, s + row), y * row);
        }
        ctx.putImageData(new ImageData(flipped, width, height), 0, 0);
        const frame = new w.VideoFrame(c2d, { timestamp: f * frameDur, duration: frameDur });
        encoder.encode(frame, { keyFrame: f % (fps * 2) === 0 });
        frame.close();
        onProgress?.((f + 1) / total);
        // Let the encoder drain so its queue doesn't grow unbounded.
        if (encoder.encodeQueueSize > 8) await new Promise<void>(r => setTimeout(r, 0));
      }
      await encoder.flush();
      muxer.finalize();
      return new Blob([muxer.target.buffer], { type: "video/mp4" });
    } finally {
      renderer.setRenderTarget(null);
      renderer.setPixelRatio(prevPR);
      renderer.setSize(prevSize.x, prevSize.y, false);
      scene.background = prevBg;
      rt.dispose();
    }
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
