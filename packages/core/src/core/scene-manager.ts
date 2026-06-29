import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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
  private _navMode: NavigationMode = "orbit";
  private _projection: CameraProjection = "perspective";
  private _orthoCamera: THREE.OrthographicCamera | null = null;
  /** Kept for API compatibility — no longer drives navigation */
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
    // Point clouds are Z-up — make Z the camera's up axis so OrbitControls
    // orbits around Z and the horizon stays level (no roll). Start at an
    // oblique angle so "up" is never parallel to the view direction.
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, -50, 30);

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
    // Prevent the browser's native drag/selection so pointer drags reach
    // OrbitControls instead of starting a text selection or ghost-image drag.
    this.renderer.domElement.style.touchAction = "none";
    this.renderer.domElement.style.userSelect = "none";
    this.renderer.domElement.addEventListener("dragstart", (e) => e.preventDefault());

    // Controls — orbit mode is the default (CAD/Blender-style turntable)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = true;
    // Clamp just shy of the Z-up poles to avoid the orbit singularity flip.
    this.controls.minPolarAngle = 0.01;
    this.controls.maxPolarAngle = Math.PI - 0.01;
    this.controls.zoomSpeed = 1.5;
    this.controls.rotateSpeed = 0.8;
    // Zoom toward the orbit target (not the cursor). zoomToCursor drifts
    // controls.target on every scroll, which inflates the camera→target
    // distance that screen-space panning scales by — making drag/pan speed
    // change unpredictably after zooming. Keep the target stable so navigation
    // feels consistent at any zoom level.
    this.controls.zoomToCursor = false;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };

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

      // Single OrbitControls instance drives all three navigation modes (each
      // mode just reconfigures it), so its target stays the one source of truth
      // for clipping, minimap, camera-animator and the ortho-camera sync.
      this.controls.update();

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
   * Switch between navigation modes. All three reconfigure the SAME OrbitControls
   * instance (zoom-to-cursor + damping throughout) so the orbit target remains
   * authoritative for clipping, minimap, camera animation and ortho sync.
   * - orbit: CAD turntable — left-drag rotate, middle dolly, right pan, full sphere.
   * - free:  Blender-ish free orbit — left/middle drag rotate, right pan, full sphere.
   * - pan:   Map / top-down — left-drag pans, horizon-locked, right-drag rotates.
   */
  setNavigationMode(mode: NavigationMode): void {
    if (mode === this._navMode) return;
    this._navMode = mode;

    const c = this.controls;
    c.enabled = true;
    c.enableRotate = true;
    c.screenSpacePanning = true;

    // Clamp just shy of the poles so orbiting never crosses the Z-up
    // singularity (which would flip the view and read as a sudden roll).
    if (mode === "pan") {
      // Map-style: camera stays above the horizon, left-drag pans the scene.
      c.minPolarAngle = 0.01;
      c.maxPolarAngle = Math.PI / 2.05;
      c.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
    } else if (mode === "free") {
      // Blender-ish: near-full-sphere rotation on both left and middle drag.
      c.minPolarAngle = 0.01;
      c.maxPolarAngle = Math.PI - 0.01;
      c.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN,
      };
    } else {
      // Orbit (default) CAD turntable.
      c.minPolarAngle = 0.01;
      c.maxPolarAngle = Math.PI - 0.01;
      c.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
    }
    c.update();
  }

  /**
   * Set fly movement speed. Kept for API compatibility.
   */
  setFlySpeed(speed: number): void {
    this.flySpeed = speed;
  }

  /** Stop animation loop and dispose resources */
  dispose() {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.resizeObserver.disconnect();
    this.controls.dispose();
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
    // Oblique 3/4 view for Z-up content (from the front, slightly above) so the
    // horizon is level and "up" is not parallel to the view direction.
    const dir = new THREE.Vector3(0, -0.82, 0.57).multiplyScalar(dist);
    this.camera.position.copy(center).add(dir);
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
