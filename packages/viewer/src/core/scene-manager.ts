import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
  private animationId: number | null = null;
  private lastTime = 0;
  private frameCount = 0;
  private fpsInterval = 0;
  private onFpsUpdate?: (fps: number) => void;
  private onPointsUpdate?: (loaded: number) => void;
  private resizeObserver: ResizeObserver;
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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvas.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.zoomSpeed = 1.5;

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
      const delta = now - this.lastTime;
      this.lastTime = now;

      this.controls.update();

      // potree-core update
      if (this.potree && this.pointClouds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.potree as any).updatePointClouds(
          this.pointClouds,
          this.camera,
          this.renderer
        );
      }

      this.renderer.render(this.scene, this.camera);

      // FPS counter
      this.frameCount++;
      if (now - this.fpsInterval >= 1000) {
        this.onFpsUpdate?.(this.frameCount);
        this.frameCount = 0;
        this.fpsInterval = now;
      }

      void delta;
    };
    this.animationId = requestAnimationFrame(loop);
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
}
