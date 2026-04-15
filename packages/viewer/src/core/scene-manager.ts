import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FpsControls } from "./fps-controls";
import type { NavigationMode, CameraProjection } from "../types";

export interface SceneManagerOptions {
  canvas: HTMLElement;
  onFpsUpdate?: (fps: number) => void;
  onPointsUpdate?: (loaded: number) => void;
}

/** Manages the Three.js scene, camera, renderer and animation loop */
export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  private _fpsControls: FpsControls | null = null;
  private _navMode: NavigationMode = "orbit";
  private _projection: CameraProjection = "perspective";
  private _orthoCamera: THREE.OrthographicCamera | null = null;
  /** Movement speed for fly mode — auto-scaled when point cloud loads */
  flySpeed = 10;
  private animationId: number | null = null;
  private lastTime = 0;
  private frameCount = 0;
  private fpsInterval = 0;
  private onFpsUpdate?: (fps: number) => void;
  private onPointsUpdate?: (loaded: number) => void;
  private resizeObserver: ResizeObserver;
  private frameCallbacks: Array<() => void> = [];
  private postRenderCallbacks: Array<() => void> = [];
  // potree-core Potree instance (set after lazy import)
  potree: unknown = null;
  pointClouds: unknown[] = [];

  constructor({ canvas, onFpsUpdate, onPointsUpdate }: SceneManagerOptions) {
    this.onFpsUpdate = onFpsUpdate;
    this.onPointsUpdate = onPointsUpdate;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    const { clientWidth: w, clientHeight: h } = canvas;
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 100000);
    this.camera.position.set(0, 0, 50);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    // Cap pixel ratio — 2x is heavy for point clouds, 1.5x is a good balance
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(w, h);
    // Use LinearSRGBColorSpace — potree-core handles sRGB conversion
    // internally in its shaders. SRGBColorSpace would double-apply gamma.
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    // Disable autoClear — we call renderer.clear() explicitly at the top of
    // each frame so that post-render callbacks (AxisWidget scissor pass) can
    // render overlays without wiping the main scene.
    this.renderer.autoClear = false;
    canvas.appendChild(this.renderer.domElement);

    // Controls — orbit mode is the default
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.zoomSpeed = 1.5;
    // Invert orbit drag direction — in a Z-up scene, the default orbit
    // direction feels backwards. Negative rotateSpeed makes dragging feel
    // natural: drag up = camera moves up (like grabbing the scene).
    this.controls.rotateSpeed = -1;

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(1, 2, 3);
    this.scene.add(dir);

    // Responsive resize
    this.resizeObserver = new ResizeObserver(() => this.onResize(canvas));
    this.resizeObserver.observe(canvas);

    this.fpsInterval = performance.now();
  }

  private onResize(canvas: HTMLElement) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /** Start the render loop */
  start() {
    const loop = (now: number) => {
      this.animationId = requestAnimationFrame(loop);
      const delta = this.lastTime === 0 ? 16 : now - this.lastTime;
      this.lastTime = now;

      // Explicit clear — disable scissor test first so the clear covers the
      // entire framebuffer (the axis widget may have left scissorTest on).
      this.renderer.setScissorTest(false);
      this.renderer.clear();

      if (this._navMode === "fly" && this._fpsControls) {
        this._fpsControls.update(Math.min(delta / 1000, 0.1)); // cap at 100ms
      } else {
        this.controls.update();
      }

      // potree-core update — always use PerspectiveCamera for correct LOD
      if (this.potree && this.pointClouds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.potree as any).updatePointClouds(
          this.pointClouds,
          this.camera,
          this.renderer
        );
      }

      // Pre-render frame callbacks (minimap, etc.)
      this.frameCallbacks.forEach(cb => cb());

      // Main render — use ortho camera when projection is orthographic
      if (this._projection === "orthographic") {
        this.renderer.render(this.scene, this._syncOrthoCamera());
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      // Reset scissor/viewport state before post-render passes — potree-core
      // may leave scissorTest enabled or modify the viewport during its render.
      this.renderer.setScissorTest(false);

      // Post-render callbacks (AxisWidget scissor pass, etc.)
      this.postRenderCallbacks.forEach(cb => cb());

      // FPS counter
      this.frameCount++;
      if (now - this.fpsInterval >= 1000) {
        this.onFpsUpdate?.(this.frameCount);
        this.frameCount = 0;
        this.fpsInterval = now;
      }
    };
    this.animationId = requestAnimationFrame(loop);
  }

  /** Register a callback run every frame before render */
  addFrameCallback(cb: () => void): void {
    this.frameCallbacks.push(cb);
  }

  /** Remove a previously registered pre-render frame callback */
  removeFrameCallback(cb: () => void): void {
    this.frameCallbacks = this.frameCallbacks.filter(fn => fn !== cb);
  }

  /** Register a callback run every frame AFTER the main render (for overlays) */
  addPostRenderCallback(cb: () => void): void {
    this.postRenderCallbacks.push(cb);
  }

  /** Remove a previously registered post-render callback */
  removePostRenderCallback(cb: () => void): void {
    this.postRenderCallbacks = this.postRenderCallbacks.filter(fn => fn !== cb);
  }

  /** Current navigation mode */
  get navigationMode(): NavigationMode {
    return this._navMode;
  }

  /** Current camera projection */
  get projection(): CameraProjection {
    return this._projection;
  }

  /**
   * Switch between perspective and orthographic projection.
   * PerspectiveCamera always drives OrbitControls and potree LOD — the ortho
   * camera is synced from it each frame and used only for rendering.
   */
  setProjection(mode: CameraProjection): void {
    if (mode === this._projection) return;
    this._projection = mode;
    if (mode === "orthographic" && !this._orthoCamera) {
      this._orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100000);
    }
  }

  /**
   * Sync the ortho camera to the perspective camera's view each frame.
   * Frustum is derived from the perspective camera's FOV and current distance
   * to the orbit target so the visual scale matches.
   */
  private _syncOrthoCamera(): THREE.OrthographicCamera {
    const cam = this._orthoCamera!;
    cam.position.copy(this.camera.position);
    cam.quaternion.copy(this.camera.quaternion);
    const dist = this.camera.position.distanceTo(this.controls.target);
    const h = 2 * dist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const w = h * this.camera.aspect;
    cam.left   = -w / 2;
    cam.right  =  w / 2;
    cam.top    =  h / 2;
    cam.bottom = -h / 2;
    cam.near   = 0.01;
    cam.far    = 100000;
    cam.updateProjectionMatrix();
    return cam;
  }

  /**
   * Switch between navigation modes.
   * - orbit: standard orbit / tumble around a target point
   * - fly:   free-flight (WASD + mouse-drag to look), no camera roll
   * - earth: pan-primary mode (like Google Earth / map view)
   */
  setNavigationMode(mode: NavigationMode): void {
    if (mode === this._navMode) return;
    this._navMode = mode;

    if (mode === "fly") {
      // Disable orbit, activate FPS-style fly controls
      this.controls.enabled = false;
      if (!this._fpsControls) {
        this._fpsControls = new FpsControls(this.camera, this.renderer.domElement);
      }
      this._fpsControls.syncFromCamera();
      this._fpsControls.movementSpeed = this.flySpeed;
      this._fpsControls.enabled = true;
    } else {
      // Re-enable orbit controls
      if (this._fpsControls) this._fpsControls.enabled = false;
      this.controls.enabled = true;

      if (mode === "orbit") {
        // Standard orbit: full-sphere rotation, no screen-space panning
        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.enableRotate = true;
      } else {
        // Earth mode: camera stays above horizon, screen-space panning (like Google Maps)
        this.controls.screenSpacePanning = true;
        this.controls.maxPolarAngle = Math.PI / 2.05; // slightly above 90° to feel natural
        this.controls.enableRotate = true;
      }
    }
  }

  /**
   * Set fly movement speed. Propagates to active FlyControls if instantiated.
   * Call this instead of setting flySpeed directly when fly mode is active.
   */
  setFlySpeed(speed: number): void {
    this.flySpeed = speed;
    if (this._fpsControls) this._fpsControls.movementSpeed = speed;
  }

  /** Stop animation loop and dispose resources */
  dispose() {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this._fpsControls?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /** Fit camera to bounding box */
  fitToBox(box: THREE.Box3) {
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
    this.camera.position.copy(center).add(new THREE.Vector3(0, 0, dist));
    this.controls.target.copy(center);
    this.controls.update();
  }

  /** Raycast against objects in scene */
  raycast(normalizedX: number, normalizedY: number, objects: THREE.Object3D[]): THREE.Intersection[] {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(normalizedX, normalizedY);
    raycaster.setFromCamera(pointer, this.camera);
    return raycaster.intersectObjects(objects, true);
  }

  /**
   * Pick a point on the point cloud using potree-core's GPU picker.
   * Returns the world-space position of the closest point under the cursor,
   * or null if nothing was hit.
   */
  pickPoint(normalizedX: number, normalizedY: number): THREE.Vector3 | null {
    if (this.pointClouds.length === 0) return null;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), this.camera);
    for (const pc of this.pointClouds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const octree = pc as any;
      if (typeof octree.pick !== "function") continue;
      const result = octree.pick(this.renderer, this.camera, raycaster.ray, {
        pickWindowSize: 17,
      });
      if (result?.position) {
        return result.position.clone();
      }
    }
    return null;
  }
}
