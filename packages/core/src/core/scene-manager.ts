import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { NavigationMode, CameraProjection } from "../types";

export interface SceneManagerOptions {
  canvas: HTMLElement;
  onFpsUpdate?: (fps: number) => void;
  onPointsUpdate?: (loaded: number) => void;
  /** The GPU dropped the WebGL context: nothing draws until it is restored. */
  onContextLost?: () => void;
  /** The context is back; three re-uploads what it owns on the next frame. */
  onContextRestored?: () => void;
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
  /** WASD/QE fly speed as a fraction of the camera→target distance per second
   *  (scales with zoom so it feels consistent at room and site scale). */
  flySpeed = 0.9;
  private heldKeys = new Set<string>();
  private _flyFwd = new THREE.Vector3();
  private _flyRight = new THREE.Vector3();
  private _flyMove = new THREE.Vector3();
  private animationId: number | null = null;
  private lastTime = 0;
  private frameCount = 0;
  private fpsInterval = 0;
  private onFpsUpdate?: (fps: number) => void;
  private onPointsUpdate?: (loaded: number) => void;
  private onContextLost?: () => void;
  private onContextRestored?: () => void;
  private _contextLost = false;
  /** Fetched while the context is alive: getExtension returns null once it is lost. */
  private _loseContextExt: WEBGL_lose_context | null = null;
  private resizeObserver: ResizeObserver;
  private frameCallbacks: Array<() => void> = [];
  private postRenderCallbacks: Array<() => void> = [];
  // potree-core Potree instance (set after lazy import)
  potree: unknown = null;
  pointClouds: unknown[] = [];

  constructor({ canvas, onFpsUpdate, onPointsUpdate, onContextLost, onContextRestored }: SceneManagerOptions) {
    this.onFpsUpdate = onFpsUpdate;
    this.onPointsUpdate = onPointsUpdate;
    this.onContextLost = onContextLost;
    this.onContextRestored = onContextRestored;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Camera — floor dimensions to 1px so a hidden/zero-size container at init
    // (SSR hydration flash, display:none) can't produce an Infinity aspect ratio.
    const w = Math.max(canvas.clientWidth, 1);
    const h = Math.max(canvas.clientHeight, 1);
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
    // each frame so that post-render callbacks (AxisGizmo overlay pass) can
    // render overlays without wiping the main scene.
    this.renderer.autoClear = false;
    canvas.appendChild(this.renderer.domElement);
    // Prevent the browser's native drag/selection so pointer drags reach
    // OrbitControls instead of starting a text selection or ghost-image drag.
    this.renderer.domElement.style.touchAction = "none";
    this.renderer.domElement.style.userSelect = "none";
    this.renderer.domElement.addEventListener("dragstart", this.preventDragStart);

    // A context the GPU drops (out of memory on an integrated GPU, a driver
    // reset) used to leave a white canvas and no word why. Listening lets the
    // host say so and offer a reload; preventDefault() is what allows the
    // browser to fire webglcontextrestored at all.
    this._loseContextExt = this.renderer.getContext().getExtension("WEBGL_lose_context");
    this.renderer.domElement.addEventListener("webglcontextlost", this.handleContextLost);
    this.renderer.domElement.addEventListener("webglcontextrestored", this.handleContextRestored);

    // WASD fly + Q/E vertical. Global listeners (work without clicking the
    // canvas first); the keydown guard ignores typing in form fields.
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onWindowBlur);

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

  /** Bound so it can be removed in dispose(); blocks native drag/ghost-image. */
  private preventDragStart = (e: Event) => e.preventDefault();

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    this._contextLost = true;
    this.onContextLost?.();
  };
  private handleContextRestored = () => {
    this._contextLost = false;
    this.onContextRestored?.();
  };

  /** True between webglcontextlost and webglcontextrestored. */
  get contextLost(): boolean {
    return this._contextLost;
  }

  /**
   * Ask for a lost context back. Resolves true once it is restored (at once if
   * it is not lost), false if it has not come back within `timeoutMs`.
   *
   * Only a context lost through WEBGL_lose_context can be asked back; after a
   * real GPU loss the browser restores it by itself, or not at all.
   */
  restoreContext(timeoutMs = 5000): Promise<boolean> {
    if (!this._contextLost) return Promise.resolve(true);
    const canvas = this.renderer.domElement;
    return new Promise((resolve) => {
      const done = (restored: boolean) => {
        window.clearTimeout(timer);
        canvas.removeEventListener("webglcontextrestored", onRestored);
        resolve(restored);
      };
      const onRestored = () => done(true);
      const timer = window.setTimeout(() => done(false), timeoutMs);
      canvas.addEventListener("webglcontextrestored", onRestored);
      this._loseContextExt?.restoreContext();
    });
  }

  /** Keys we fly with (layout-independent physical codes). */
  private static readonly FLY_CODES = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE"]);

  private onKeyDown = (e: KeyboardEvent) => {
    if (!SceneManager.FLY_CODES.has(e.code)) return;
    // Don't hijack keys while typing in a form field / contenteditable.
    const el = document.activeElement as HTMLElement | null;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
    this.heldKeys.add(e.code);
  };
  private onKeyUp = (e: KeyboardEvent) => { this.heldKeys.delete(e.code); };
  /** Held keys would otherwise stick if the window loses focus mid-press. */
  private onWindowBlur = () => this.heldKeys.clear();

  /**
   * Apply WASD (fly along the view) + Q/E (world up/down) for this frame.
   * Moves the camera AND the orbit target by the same vector so OrbitControls
   * stays consistent (the pivot travels with the camera, like a fly cam).
   */
  private _applyFlyKeys(deltaMs: number): void {
    const keys = this.heldKeys;
    if (keys.size === 0) return;

    this.camera.getWorldDirection(this._flyFwd);                        // look direction
    this._flyRight.setFromMatrixColumn(this.camera.matrixWorld, 0);     // camera's world +X (right)
    const move = this._flyMove.set(0, 0, 0);
    if (keys.has("KeyW")) move.add(this._flyFwd);
    if (keys.has("KeyS")) move.sub(this._flyFwd);
    if (keys.has("KeyD")) move.add(this._flyRight);
    if (keys.has("KeyA")) move.sub(this._flyRight);
    if (keys.has("KeyQ")) move.z += 1; // up (Z-up world)
    if (keys.has("KeyE")) move.z -= 1; // down
    if (move.lengthSq() === 0) return;

    const dist = Math.max(this.camera.position.distanceTo(this.controls.target), 1);
    move.normalize().multiplyScalar(this.flySpeed * dist * (deltaMs / 1000));
    this.camera.position.add(move);
    this.controls.target.add(move);
  }

  private onResize(canvas: HTMLElement) {
    // Floor to 1px — a hidden container reports 0 and would break the aspect ratio.
    const w = Math.max(canvas.clientWidth, 1);
    const h = Math.max(canvas.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /** Start the render loop */
  start() {
    const loop = (now: number) => {
      this.animationId = requestAnimationFrame(loop);
      // Nothing can draw, and potree would keep streaming nodes it cannot upload.
      if (this._contextLost) return;
      const delta = this.lastTime === 0 ? 16 : now - this.lastTime;
      this.lastTime = now;

      // Explicit clear — disable scissor test first so the clear covers the
      // entire framebuffer (the axis widget may have left scissorTest on).
      this.renderer.setScissorTest(false);
      this.renderer.clear();

      // WASD/QE fly — move camera + orbit target before the controls update.
      this._applyFlyKeys(delta);

      // Single OrbitControls instance drives all three navigation modes (each
      // mode just reconfigures it), so its target stays the one source of truth
      // for clipping, camera-animator and the ortho-camera sync.
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
      for (const cb of this.frameCallbacks) cb();

      // Main render — use ortho camera when projection is orthographic.
      if (this._projection === "orthographic") {
        // `sizeAttenuation:false` sprites (measurement labels/dots, markers)
        // skip three's perspective `-mvPosition.z` screen-size multiply under an
        // ortho camera, so they collapse to ~invisible. Compensate by scaling
        // them by the camera distance for this pass, then restore (factor=dist
        // makes the on-screen size match the perspective view — see derivation).
        const factor = this.camera.position.distanceTo(this.controls.target);
        const scaled = this._scaleScreenSprites(factor);
        this.renderer.render(this.scene, this._syncOrthoCamera());
        for (const s of scaled) s.scale.multiplyScalar(1 / factor);
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      // Reset scissor/viewport state before post-render passes — potree-core
      // may leave scissorTest enabled or modify the viewport during its render.
      this.renderer.setScissorTest(false);

      // Post-render callbacks (AxisGizmo overlay pass, etc.)
      for (const cb of this.postRenderCallbacks) cb();

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
    this.renderer.domElement.removeEventListener("dragstart", this.preventDragStart);
    // Before forceContextLoss(): releasing the context on purpose is not a loss to report.
    this.renderer.domElement.removeEventListener("webglcontextlost", this.handleContextLost);
    this.renderer.domElement.removeEventListener("webglcontextrestored", this.handleContextRestored);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onWindowBlur);
    this.controls.dispose();
    this.renderer.dispose();
    // dispose() frees three's GL objects but not the context, which lives
    // until the canvas is collected; a browser keeps a handful at most.
    if (!this._contextLost) this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  /**
   * Where the camera goes to frame `box`: the target at its centre, the
   * distance at which it fills the view, along `dir` (default the oblique 3/4
   * view from the front, slightly above, so the Z-up horizon stays level).
   */
  fitParams(box: THREE.Box3, dir: THREE.Vector3 = new THREE.Vector3(0, -0.82, 0.57)) {
    const target = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(target);
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
    return { target, position: target.clone().addScaledVector(dir.clone().normalize(), dist) };
  }

  /** Fit camera to bounding box */
  fitToBox(box: THREE.Box3) {
    const { target, position } = this.fitParams(box);
    this.camera.position.copy(position);
    this.controls.target.copy(target);
    this.controls.update();
  }

  /**
   * The camera the scene is actually rendered with — the synced ortho camera in
   * orthographic mode, otherwise the perspective camera. Picking/raycasting MUST
   * use this so screen rays match what's displayed (perspective rays diverge,
   * ortho rays are parallel).
   */
  getActiveCamera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this._projection === "orthographic" ? this._syncOrthoCamera() : this.camera;
  }

  /** Scale registered screen-space sprites by `factor` (for the ortho pass); returns those scaled so the caller can restore them. */
  private _screenGroups: THREE.Object3D[] = [];
  private _scaleScreenSprites(factor: number): THREE.Sprite[] {
    if (this._screenGroups.length === 0) {
      for (const name of ["measurements", "pano-markers"]) {
        const g = this.scene.getObjectByName(name);
        if (g) this._screenGroups.push(g);
      }
    }
    const scaled: THREE.Sprite[] = [];
    for (const g of this._screenGroups) {
      g.traverse(o => {
        const s = o as THREE.Sprite;
        if (s.isSprite && (s.material as THREE.SpriteMaterial).sizeAttenuation === false) {
          s.scale.multiplyScalar(factor);
          scaled.push(s);
        }
      });
    }
    return scaled;
  }

  /** Raycast against objects in scene */
  raycast(normalizedX: number, normalizedY: number, objects: THREE.Object3D[]): THREE.Intersection[] {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(normalizedX, normalizedY);
    raycaster.setFromCamera(pointer, this.getActiveCamera());
    return raycaster.intersectObjects(objects, true);
  }

  /**
   * Pick a point on the point cloud using potree-core's GPU picker.
   * Returns the world-space position of the closest point under the cursor,
   * or null if nothing was hit.
   */
  pickPoint(normalizedX: number, normalizedY: number): THREE.Vector3 | null {
    if (this.pointClouds.length === 0) return null;
    const camera = this.getActiveCamera(); // ortho-aware — the GPU pick must match the displayed projection
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);
    for (const pc of this.pointClouds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const octree = pc as any;
      if (typeof octree.pick !== "function") continue;
      const result = octree.pick(this.renderer, camera, raycaster.ray, {
        // Generous window so thin structures (edges, poles, railings) are easy
        // to hit — the pick still returns the point closest to the ray. 63 px
        // gives a proper point-snap feel; below that, sparse clouds miss often
        // and the preview falls back to the ground plane.
        pickWindowSize: 63,
      });
      if (result?.position) {
        return result.position.clone();
      }
    }
    return null;
  }
}
