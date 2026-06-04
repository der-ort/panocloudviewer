import * as THREE5 from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// src/core/scene-manager.ts
var SceneManager = class {
  scene;
  camera;
  renderer;
  controls;
  _navMode = "orbit";
  _projection = "perspective";
  _orthoCamera = null;
  /** Kept for API compatibility — no longer drives navigation */
  flySpeed = 10;
  animationId = null;
  lastTime = 0;
  frameCount = 0;
  fpsInterval = 0;
  onFpsUpdate;
  onPointsUpdate;
  resizeObserver;
  frameCallbacks = [];
  postRenderCallbacks = [];
  // potree-core Potree instance (set after lazy import)
  potree = null;
  pointClouds = [];
  constructor({ canvas, onFpsUpdate, onPointsUpdate }) {
    this.onFpsUpdate = onFpsUpdate;
    this.onPointsUpdate = onPointsUpdate;
    this.scene = new THREE5.Scene();
    this.scene.background = new THREE5.Color(657930);
    const { clientWidth: w, clientHeight: h } = canvas;
    this.camera = new THREE5.PerspectiveCamera(60, w / h, 0.01, 1e5);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, -50, 30);
    this.renderer = new THREE5.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE5.LinearSRGBColorSpace;
    this.renderer.autoClear = false;
    canvas.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.touchAction = "none";
    this.renderer.domElement.style.userSelect = "none";
    this.renderer.domElement.addEventListener("dragstart", (e) => e.preventDefault());
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = true;
    this.controls.minPolarAngle = 0.01;
    this.controls.maxPolarAngle = Math.PI - 0.01;
    this.controls.zoomSpeed = 1.5;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomToCursor = true;
    this.controls.mouseButtons = {
      LEFT: THREE5.MOUSE.ROTATE,
      MIDDLE: THREE5.MOUSE.DOLLY,
      RIGHT: THREE5.MOUSE.PAN
    };
    this.scene.add(new THREE5.AmbientLight(16777215, 0.5));
    const dir = new THREE5.DirectionalLight(16777215, 1);
    dir.position.set(1, 2, 3);
    this.scene.add(dir);
    this.resizeObserver = new ResizeObserver(() => this.onResize(canvas));
    this.resizeObserver.observe(canvas);
    this.fpsInterval = performance.now();
  }
  onResize(canvas) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
  /** Start the render loop */
  start() {
    const loop = (now) => {
      this.animationId = requestAnimationFrame(loop);
      this.lastTime === 0 ? 16 : now - this.lastTime;
      this.lastTime = now;
      this.renderer.setScissorTest(false);
      this.renderer.clear();
      this.controls.update();
      if (this.potree && this.pointClouds.length > 0) {
        this.potree.updatePointClouds(
          this.pointClouds,
          this.camera,
          this.renderer
        );
      }
      this.frameCallbacks.forEach((cb) => cb());
      if (this._projection === "orthographic") {
        this.renderer.render(this.scene, this._syncOrthoCamera());
      } else {
        this.renderer.render(this.scene, this.camera);
      }
      this.renderer.setScissorTest(false);
      this.postRenderCallbacks.forEach((cb) => cb());
      this.frameCount++;
      if (now - this.fpsInterval >= 1e3) {
        this.onFpsUpdate?.(this.frameCount);
        this.frameCount = 0;
        this.fpsInterval = now;
      }
    };
    this.animationId = requestAnimationFrame(loop);
  }
  /** Register a callback run every frame before render */
  addFrameCallback(cb) {
    this.frameCallbacks.push(cb);
  }
  /** Remove a previously registered pre-render frame callback */
  removeFrameCallback(cb) {
    this.frameCallbacks = this.frameCallbacks.filter((fn) => fn !== cb);
  }
  /** Register a callback run every frame AFTER the main render (for overlays) */
  addPostRenderCallback(cb) {
    this.postRenderCallbacks.push(cb);
  }
  /** Remove a previously registered post-render callback */
  removePostRenderCallback(cb) {
    this.postRenderCallbacks = this.postRenderCallbacks.filter((fn) => fn !== cb);
  }
  /** Current navigation mode */
  get navigationMode() {
    return this._navMode;
  }
  /** Current camera projection */
  get projection() {
    return this._projection;
  }
  /**
   * Switch between perspective and orthographic projection.
   * PerspectiveCamera always drives OrbitControls and potree LOD — the ortho
   * camera is synced from it each frame and used only for rendering.
   */
  setProjection(mode) {
    if (mode === this._projection) return;
    this._projection = mode;
    if (mode === "orthographic" && !this._orthoCamera) {
      this._orthoCamera = new THREE5.OrthographicCamera(-1, 1, 1, -1, 0.01, 1e5);
    }
  }
  /**
   * Sync the ortho camera to the perspective camera's view each frame.
   * Frustum is derived from the perspective camera's FOV and current distance
   * to the orbit target so the visual scale matches.
   */
  _syncOrthoCamera() {
    const cam = this._orthoCamera;
    cam.position.copy(this.camera.position);
    cam.quaternion.copy(this.camera.quaternion);
    const dist = this.camera.position.distanceTo(this.controls.target);
    const h = 2 * dist * Math.tan(THREE5.MathUtils.degToRad(this.camera.fov / 2));
    const w = h * this.camera.aspect;
    cam.left = -w / 2;
    cam.right = w / 2;
    cam.top = h / 2;
    cam.bottom = -h / 2;
    cam.near = 0.01;
    cam.far = 1e5;
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
  setNavigationMode(mode) {
    if (mode === this._navMode) return;
    this._navMode = mode;
    const c = this.controls;
    c.enabled = true;
    c.enableRotate = true;
    c.screenSpacePanning = true;
    if (mode === "pan") {
      c.minPolarAngle = 0.01;
      c.maxPolarAngle = Math.PI / 2.05;
      c.mouseButtons = {
        LEFT: THREE5.MOUSE.PAN,
        MIDDLE: THREE5.MOUSE.DOLLY,
        RIGHT: THREE5.MOUSE.ROTATE
      };
    } else if (mode === "free") {
      c.minPolarAngle = 0.01;
      c.maxPolarAngle = Math.PI - 0.01;
      c.mouseButtons = {
        LEFT: THREE5.MOUSE.ROTATE,
        MIDDLE: THREE5.MOUSE.ROTATE,
        RIGHT: THREE5.MOUSE.PAN
      };
    } else {
      c.minPolarAngle = 0.01;
      c.maxPolarAngle = Math.PI - 0.01;
      c.mouseButtons = {
        LEFT: THREE5.MOUSE.ROTATE,
        MIDDLE: THREE5.MOUSE.DOLLY,
        RIGHT: THREE5.MOUSE.PAN
      };
    }
    c.update();
  }
  /**
   * Set fly movement speed. Kept for API compatibility.
   */
  setFlySpeed(speed) {
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
  fitToBox(box) {
    const center = new THREE5.Vector3();
    const size = new THREE5.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
    const dir = new THREE5.Vector3(0, -0.82, 0.57).multiplyScalar(dist);
    this.camera.position.copy(center).add(dir);
    this.controls.target.copy(center);
    this.controls.update();
  }
  /** Raycast against objects in scene */
  raycast(normalizedX, normalizedY, objects) {
    const raycaster = new THREE5.Raycaster();
    const pointer = new THREE5.Vector2(normalizedX, normalizedY);
    raycaster.setFromCamera(pointer, this.camera);
    return raycaster.intersectObjects(objects, true);
  }
  /**
   * Pick a point on the point cloud using potree-core's GPU picker.
   * Returns the world-space position of the closest point under the cursor,
   * or null if nothing was hit.
   */
  pickPoint(normalizedX, normalizedY) {
    if (this.pointClouds.length === 0) return null;
    const raycaster = new THREE5.Raycaster();
    raycaster.setFromCamera(new THREE5.Vector2(normalizedX, normalizedY), this.camera);
    for (const pc of this.pointClouds) {
      const octree = pc;
      if (typeof octree.pick !== "function") continue;
      const result = octree.pick(this.renderer, this.camera, raycaster.ray, {
        pickWindowSize: 17
      });
      if (result?.position) {
        return result.position.clone();
      }
    }
    return null;
  }
};
var PointCloudLoader = class {
  sceneManager;
  adapter;
  currentClouds = [];
  hasRgb = false;
  /** World-space bounding box of the loaded point cloud (available after load) */
  worldBox = new THREE5.Box3();
  constructor(sceneManager, adapter) {
    this.sceneManager = sceneManager;
    this.adapter = adapter;
  }
  /** Load a point cloud from the adapter's base URL */
  async load(metadataPath = "metadata.json", pointBudget = 2e6) {
    const { Potree, PointColorType } = await import('potree-core');
    if (!this.sceneManager.potree) {
      this.sceneManager.potree = new Potree();
    }
    this.clear();
    const requestManager = {
      fetch: (input, init) => this.adapter.fetchWithHeaders ? this.adapter.fetchWithHeaders(input, init) : fetch(input, init),
      getUrl: (url) => Promise.resolve(this.adapter.resolveUrl(url))
    };
    const potree = this.sceneManager.potree;
    potree.pointBudget = pointBudget;
    const pointCloud = await potree.loadPointCloud(
      metadataPath,
      requestManager
    );
    pointCloud.material.size = 1.5;
    pointCloud.material.pointSizeType = 2;
    pointCloud.material.shape = 1;
    let hasRgb = false;
    try {
      const meta = await this.adapter.fetchJson(metadataPath);
      const attributes = meta?.attributes ?? [];
      hasRgb = attributes.some((a) => {
        const n = (a.name ?? "").toLowerCase();
        return n === "rgb" || n === "rgba" || n === "color";
      });
    } catch {
      hasRgb = false;
    }
    this.hasRgb = hasRgb;
    if (hasRgb) {
      pointCloud.material.pointColorType = PointColorType.RGB;
    } else {
      pointCloud.material.newFormat = false;
      pointCloud.material.pointColorType = PointColorType.HEIGHT;
    }
    pointCloud.material.outputColorEncoding = 1;
    pointCloud.material.needsUpdate = true;
    this.sceneManager.scene.add(pointCloud);
    this.sceneManager.pointClouds.push(pointCloud);
    this.currentClouds.push(pointCloud);
    const box = pointCloud.pcoGeometry?.boundingBox ?? pointCloud.boundingBox;
    const tightBox = pointCloud.pcoGeometry?.tightBoundingBox ?? box;
    const offset = pointCloud.pcoGeometry?.offset;
    const worldBox = new THREE5.Box3();
    if (tightBox && offset) {
      worldBox.copy(tightBox);
      worldBox.min.add(offset);
      worldBox.max.add(offset);
    } else if (box) {
      worldBox.copy(box);
    } else {
      worldBox.setFromObject(pointCloud);
    }
    this.worldBox = worldBox.clone();
    if (!worldBox.isEmpty()) {
      this.sceneManager.fitToBox(worldBox);
      const zMin = worldBox.min.z;
      const zMax = worldBox.max.z;
      const mat = pointCloud.material;
      if (mat) {
        mat.heightMin = zMin;
        mat.heightMax = zMax;
        mat.rgbGamma = 1;
        mat.rgbBrightness = 0;
        mat.rgbContrast = 0;
      }
    }
  }
  /** Set color mode on all loaded clouds */
  async setColorMode(mode) {
    const { PointColorType } = await import('potree-core');
    for (const cloud of this.currentClouds) {
      const mat = cloud.material;
      if (!mat) continue;
      if (!this.worldBox.isEmpty()) {
        mat.heightMin = this.worldBox.min.z;
        mat.heightMax = this.worldBox.max.z;
      }
      switch (mode) {
        case "rgb":
          if (this.hasRgb) {
            mat.newFormat = true;
            mat.pointColorType = PointColorType.RGB;
          } else {
            mat.newFormat = false;
            mat.pointColorType = PointColorType.HEIGHT;
          }
          break;
        case "height":
          mat.newFormat = false;
          mat.pointColorType = PointColorType.HEIGHT;
          break;
        case "intensity":
          mat.newFormat = false;
          mat.pointColorType = PointColorType.INTENSITY;
          break;
        case "intensity_gradient":
          mat.newFormat = false;
          mat.pointColorType = PointColorType.INTENSITY_GRADIENT;
          break;
        case "classification":
          mat.newFormat = false;
          mat.pointColorType = PointColorType.CLASSIFICATION;
          break;
        case "return_number":
          mat.newFormat = false;
          mat.pointColorType = PointColorType.RETURN_NUMBER;
          break;
        case "source":
          mat.newFormat = false;
          mat.pointColorType = PointColorType.SOURCE;
          break;
      }
      mat.outputColorEncoding = 1;
      mat.needsUpdate = true;
    }
  }
  /** Whether the loaded cloud has RGB data */
  get hasRgbData() {
    return this.hasRgb;
  }
  /** Remove all loaded point clouds from scene */
  clear() {
    for (const cloud of this.currentClouds) {
      this.sceneManager.scene.remove(cloud);
    }
    this.currentClouds = [];
    this.sceneManager.pointClouds = [];
  }
  /** Set point budget on all loaded clouds */
  setPointBudget(budget) {
    if (this.sceneManager.potree) this.sceneManager.potree.pointBudget = budget;
  }
  /** Set point size on all loaded clouds */
  setPointSize(size) {
    for (const cloud of this.currentClouds) {
      const mat = cloud.material;
      if (mat) mat.size = size;
    }
  }
  /** Set point shape: 0=SQUARE, 1=CIRCLE, 2=PARABOLOID */
  setPointShape(shape) {
    for (const cloud of this.currentClouds) {
      const mat = cloud.material;
      if (mat) {
        mat.shape = shape;
        mat.needsUpdate = true;
      }
    }
  }
  /** Set point size type: 0=FIXED, 1=ATTENUATED, 2=ADAPTIVE */
  setPointSizeType(type) {
    for (const cloud of this.currentClouds) {
      const mat = cloud.material;
      if (mat) {
        mat.pointSizeType = type;
        mat.needsUpdate = true;
      }
    }
  }
  /** Read metadata.json from adapter */
  async readMetadata(path = "metadata.json") {
    try {
      return await this.adapter.fetchJson(path);
    } catch {
      return null;
    }
  }
  /** Return the first loaded point cloud object, if any */
  getPointCloud() {
    return this.currentClouds[0] ?? null;
  }
  /** Calculate optimal point budget based on total point count */
  static calcOptimalBudget(totalPoints) {
    const ratio = totalPoints < 5e6 ? 0.3 : totalPoints < 5e7 ? 0.15 : 0.08;
    const raw = Math.round(totalPoints * ratio);
    return Math.min(Math.max(Math.round(raw / 1e5) * 1e5, 5e5), 1e7);
  }
};
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}
var CameraAnimator = class {
  camera;
  controls;
  animId = null;
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
  }
  flyTo({ position, target, duration = 800 }) {
    return new Promise((resolve) => {
      if (this.animId !== null) cancelAnimationFrame(this.animId);
      const startPos = this.camera.position.clone();
      const startTarget = this.controls.target.clone();
      const startTime = performance.now();
      const animate = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        const e = easeOutQuart(t);
        this.camera.position.lerpVectors(startPos, position, e);
        this.controls.target.lerpVectors(startTarget, target, e);
        this.controls.update();
        if (t < 1) {
          this.animId = requestAnimationFrame(animate);
        } else {
          this.animId = null;
          resolve();
        }
      };
      this.animId = requestAnimationFrame(animate);
    });
  }
  /** Fly to a camera marker position (offset behind the camera by `offset` units) */
  flyToCamera(camPos, yawDeg = 0, offset = 5, duration = 800) {
    const pos = Array.isArray(camPos) ? new THREE5.Vector3(camPos[0], camPos[1], camPos[2]) : camPos;
    const yaw = yawDeg * Math.PI / 180;
    const viewerPos = new THREE5.Vector3(
      pos.x - Math.sin(yaw) * offset,
      pos.y - Math.cos(yaw) * offset,
      pos.z + 2
    );
    return this.flyTo({ position: viewerPos, target: pos, duration });
  }
  cancel() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
};

// src/types.ts
var DISPLAY_PRESETS = {
  compact: {
    preset: "compact",
    measurementLineWidth: 1,
    measurementLabelScale: 0.6,
    measurementSphereRadius: 0.08,
    markerSphereScale: 0.5,
    markerSphereOpacity: 0.7,
    markerLabelScale: 0.5
  },
  standard: {
    preset: "standard",
    measurementLineWidth: 2,
    measurementLabelScale: 1,
    measurementSphereRadius: 0.15,
    markerSphereScale: 1,
    markerSphereOpacity: 0.92,
    markerLabelScale: 1
  },
  prominent: {
    preset: "prominent",
    measurementLineWidth: 4,
    measurementLabelScale: 1.6,
    measurementSphereRadius: 0.3,
    markerSphereScale: 2,
    markerSphereOpacity: 1,
    markerLabelScale: 1.5
  }
};

// src/core/marker-manager.ts
var MARKER_COLOR_DEFAULT = 14472518;
var MARKER_COLOR_HOVER = 16777215;
var MARKER_COLOR_SELECTED = 16737860;
var MarkerManager = class {
  scene;
  entries = [];
  group;
  hoveredIdx = -1;
  selectedIdx = -1;
  sphereRadius = 0.5;
  _displaySettings = DISPLAY_PRESETS.standard;
  _cameras = [];
  _worldBox;
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE5.Group();
    this.group.name = "pano-markers";
    this.scene.add(this.group);
  }
  /** Apply new display settings and rebuild all markers */
  applyDisplaySettings(settings) {
    this._displaySettings = settings;
    if (this._cameras.length > 0) {
      this.build(this._cameras, this._worldBox);
    }
  }
  /** Build markers from camera data. Pass worldBox for auto-scaling. */
  build(cameras, worldBox) {
    this._cameras = cameras;
    this._worldBox = worldBox;
    this.clear();
    if (worldBox && !worldBox.isEmpty()) {
      const size = new THREE5.Vector3();
      worldBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      this.sphereRadius = Math.max(0.25, Math.min(5, maxDim * 8e-3));
    }
    cameras.forEach((cam, i) => {
      if (!cam.position) return;
      const { x, y, z } = cam.position;
      const mesh = this._makeSphere(MARKER_COLOR_DEFAULT);
      mesh.position.set(x, y, z);
      mesh.userData = { cameraIndex: i, cameraData: cam };
      this.group.add(mesh);
      const label = this._makeLabel(cam.name);
      const scaledRadius = this.sphereRadius * this._displaySettings.markerSphereScale;
      label.position.set(x, y, z + scaledRadius * 3);
      this.group.add(label);
      this.entries.push({ mesh, label });
    });
  }
  _makeSphere(color) {
    const scaledRadius = this.sphereRadius * this._displaySettings.markerSphereScale;
    const geo = new THREE5.SphereGeometry(scaledRadius, 16, 16);
    const mat = new THREE5.MeshBasicMaterial({
      color,
      depthTest: false,
      // Always visible through the point cloud
      depthWrite: false,
      transparent: true,
      opacity: this._displaySettings.markerSphereOpacity
    });
    return new THREE5.Mesh(geo, mat);
  }
  _makeLabel(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.substring(0, 20), 128, 34);
    const tex = new THREE5.CanvasTexture(canvas);
    const mat = new THREE5.SpriteMaterial({
      map: tex,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    const sprite = new THREE5.Sprite(mat);
    const ls = this._displaySettings.markerLabelScale;
    sprite.scale.set(this.sphereRadius * 8 * ls, this.sphereRadius * 2 * ls, 1);
    return sprite;
  }
  /** Update sphere color by index */
  _recolor(idx, color) {
    const entry = this.entries[idx];
    if (!entry) return;
    entry.mesh.material.color.setHex(color);
  }
  setVisible(visible) {
    this.group.visible = visible;
  }
  /** Return sphere meshes for raycasting */
  getMeshes() {
    return this.entries.map((e) => e.mesh);
  }
  setHovered(idx) {
    if (this.hoveredIdx === idx) return;
    if (this.hoveredIdx >= 0 && this.hoveredIdx !== this.selectedIdx) {
      this._recolor(this.hoveredIdx, MARKER_COLOR_DEFAULT);
    }
    this.hoveredIdx = idx;
    if (idx >= 0 && idx !== this.selectedIdx) {
      this._recolor(idx, MARKER_COLOR_HOVER);
    }
  }
  setSelected(idx) {
    if (this.selectedIdx >= 0) {
      this._recolor(this.selectedIdx, MARKER_COLOR_DEFAULT);
    }
    this.selectedIdx = idx;
    if (idx >= 0) {
      this._recolor(idx, MARKER_COLOR_SELECTED);
    }
  }
  clear() {
    for (const { mesh, label } of this.entries) {
      mesh.material.dispose();
      mesh.geometry.dispose();
      this.group.remove(mesh);
      label.material.map?.dispose();
      label.material.dispose();
      this.group.remove(label);
    }
    this.entries = [];
    this.hoveredIdx = -1;
    this.selectedIdx = -1;
  }
  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
};

// src/format.ts
function formatLength(meters) {
  if (meters < 1) return `${(meters * 100).toFixed(1)} cm`;
  if (meters < 100) return `${meters.toFixed(2)} m`;
  return `${meters.toFixed(1)} m`;
}
function formatArea(m2) {
  if (m2 < 1) return `${(m2 * 1e4).toFixed(1)} cm\xB2`;
  return `${m2.toFixed(2)} m\xB2`;
}
function formatVolume(m3) {
  return `${m3.toFixed(3)} m\xB3`;
}
function formatAngle(radians) {
  return `${(radians * 180 / Math.PI).toFixed(1)}\xB0`;
}
function formatCoord(x, y, z, decimals = 2) {
  const f = (v) => v.toFixed(decimals);
  return `X: ${f(x)}, Y: ${f(y)}, Z: ${f(z)}`;
}
function measurementUnit(type) {
  switch (type) {
    case "distance":
    case "height":
      return "m";
    case "area":
      return "m\xB2";
    case "volume":
      return "m\xB3";
    case "angle":
      return "\xB0";
    default:
      return "";
  }
}
function rawValue(m) {
  if (m.value === void 0) return "";
  switch (m.type) {
    case "distance":
    case "height":
      return m.value.toFixed(4);
    case "area":
      return m.value.toFixed(4);
    case "volume":
      return m.value.toFixed(4);
    case "angle":
      return (m.value * 180 / Math.PI).toFixed(2);
    case "point":
      return "";
    default:
      return m.value.toFixed(4);
  }
}
function csvField(val) {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
function exportMeasurementsCSV(measurements) {
  const maxPoints = measurements.reduce((max, m) => Math.max(max, m.points.length), 0);
  const header = ["#", "Type", "Label", "Value", "Unit"];
  for (let i = 1; i <= maxPoints; i++) {
    header.push(`Point ${i} X`, `Point ${i} Y`, `Point ${i} Z`);
  }
  const rows = [header.join(",")];
  measurements.forEach((m, idx) => {
    const fields = [
      String(idx + 1),
      csvField(m.type),
      csvField(m.label),
      rawValue(m),
      measurementUnit(m.type)
    ];
    for (let i = 0; i < maxPoints; i++) {
      const p = m.points[i];
      if (p) {
        fields.push(p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4));
      } else {
        fields.push("", "", "");
      }
    }
    rows.push(fields.join(","));
  });
  return rows.join("\n");
}

// src/core/measurement-manager.ts
var _idCounter = 0;
function nextId() {
  return `m-${++_idCounter}`;
}
var COLORS = {
  point: "#DCD546",
  distance: "#DCD546",
  height: "#9B94FF",
  area: "#4ADE80",
  volume: "#F97316",
  angle: "#EC4899",
  profile: "#22D3EE"
};
var MeasurementManager = class {
  scene;
  group;
  measurements = /* @__PURE__ */ new Map();
  _displaySettings = DISPLAY_PRESETS.standard;
  onChange;
  // Active drawing state
  activeMeasurement = null;
  previewLine = null;
  // Snap preview — cursor indicator + rubber-band line to show where the
  // next point will land before the user clicks.
  _snapSphere = null;
  _snapLine = null;
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE5.Group();
    this.group.name = "measurements";
    this.scene.add(this.group);
  }
  getAll() {
    return Array.from(this.measurements.values()).map((v) => v.data);
  }
  /** Apply new display settings and rebuild all existing measurements */
  applyDisplaySettings(settings) {
    this._displaySettings = settings;
    this._rebuildAll();
  }
  /** Rebuild all existing measurement visuals with current display settings */
  _rebuildAll() {
    for (const [id, entry] of this.measurements) {
      this._disposeObjects(entry.objects);
      const m = entry.data;
      const newObjects = m.box ? this.buildVolumeBoxObjects(m, new THREE5.Box3(
        new THREE5.Vector3(m.box.min[0], m.box.min[1], m.box.min[2]),
        new THREE5.Vector3(m.box.max[0], m.box.max[1], m.box.max[2])
      )) : this.buildObjects(m);
      this.measurements.set(id, { data: m, objects: newObjects });
    }
  }
  /** Dispose geometry/materials and remove objects from the group */
  _disposeObjects(objects) {
    objects.forEach((o) => {
      if (o instanceof THREE5.Mesh || o instanceof THREE5.Line || o instanceof THREE5.LineSegments) {
        o.geometry.dispose();
        o.material.dispose();
      } else if (o instanceof THREE5.Sprite) {
        o.material.map?.dispose();
        o.material.dispose();
      }
      this.group.remove(o);
    });
  }
  /** Start a new measurement (call addPoint for each click, finish() to complete) */
  start(type) {
    const m = {
      id: nextId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${_idCounter}`,
      points: [],
      color: COLORS[type],
      visible: true,
      selected: false
    };
    this.activeMeasurement = m;
    return m;
  }
  /** Add a 3D point to the active measurement */
  addPoint(point) {
    if (!this.activeMeasurement) return null;
    this.activeMeasurement.points.push(point.clone());
    const m = this.activeMeasurement;
    if (m.type === "point") {
      return this.finish();
    }
    if (m.type === "distance" && m.points.length === 2) return this.finish();
    if (m.type === "height" && m.points.length === 2) return this.finish();
    if (m.type === "angle" && m.points.length === 3) return this.finish();
    this.rebuildPreview();
    return null;
  }
  /** Finalize the active measurement */
  finish() {
    if (!this.activeMeasurement || this.activeMeasurement.points.length === 0) return null;
    const m = this.activeMeasurement;
    this.activeMeasurement = null;
    this.clearPreview();
    this.clearSnap();
    m.value = this.compute(m);
    const objects = this.buildObjects(m);
    this.measurements.set(m.id, { data: m, objects });
    this.onChange?.(this.getAll());
    return m;
  }
  // ─── Snap Preview ───────────────────────────────────────────────────────────
  /**
   * Show a snap preview at the given world position. Call this on every
   * mousemove while a measurement tool is active. Renders:
   *  - A small sphere at the snap position (shows where the point will be placed)
   *  - A rubber-band line from the last placed point to the snap position
   */
  updateSnap(worldPos, color) {
    const c = new THREE5.Color(color ?? this.activeMeasurement?.color ?? "#DCD546");
    if (!this._snapSphere) {
      const geo = new THREE5.SphereGeometry(this._displaySettings.measurementSphereRadius * 0.8, 10, 8);
      const mat = new THREE5.MeshBasicMaterial({
        color: c,
        depthTest: false,
        transparent: true,
        opacity: 0.8
      });
      this._snapSphere = new THREE5.Mesh(geo, mat);
      this._snapSphere.renderOrder = 4;
      this.group.add(this._snapSphere);
    }
    this._snapSphere.position.copy(worldPos);
    this._snapSphere.material.color.copy(c);
    const lastPt = this.activeMeasurement?.points[this.activeMeasurement.points.length - 1];
    if (lastPt) {
      if (this._snapLine) {
        const positions = this._snapLine.geometry.attributes.position;
        positions.setXYZ(0, lastPt.x, lastPt.y, lastPt.z);
        positions.setXYZ(1, worldPos.x, worldPos.y, worldPos.z);
        positions.needsUpdate = true;
      } else {
        const geo = new THREE5.BufferGeometry().setFromPoints([lastPt, worldPos]);
        const mat = new THREE5.LineDashedMaterial({
          color: c,
          depthTest: false,
          transparent: true,
          opacity: 0.5,
          dashSize: 0.3,
          gapSize: 0.15
        });
        this._snapLine = new THREE5.Line(geo, mat);
        this._snapLine.computeLineDistances();
        this._snapLine.renderOrder = 3;
        this.group.add(this._snapLine);
      }
    } else if (!this.activeMeasurement && !lastPt) ;
  }
  /** Hide the snap preview (call on mouse leave or tool deactivation) */
  clearSnap() {
    if (this._snapSphere) {
      this._snapSphere.geometry.dispose();
      this._snapSphere.material.dispose();
      this.group.remove(this._snapSphere);
      this._snapSphere = null;
    }
    if (this._snapLine) {
      this._snapLine.geometry.dispose();
      this._snapLine.material.dispose();
      this.group.remove(this._snapLine);
      this._snapLine = null;
    }
  }
  // ─── Volume measurement (drag-to-create) ─────────────────────────────────
  _volumeDraft = null;
  /** Show/update a volume draft box preview during drag creation */
  setVolumeDraft(box) {
    if (this._volumeDraft) {
      this._volumeDraft.traverse((o) => {
        if (o instanceof THREE5.Mesh || o instanceof THREE5.LineSegments) {
          o.geometry.dispose();
          o.material.dispose();
        }
      });
      this.group.remove(this._volumeDraft);
      this._volumeDraft = null;
    }
    if (!box || box.isEmpty()) return;
    const draftGroup = new THREE5.Group();
    const center = new THREE5.Vector3();
    const size = new THREE5.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const c = new THREE5.Color(COLORS.volume);
    const fillGeo = new THREE5.BoxGeometry(1, 1, 1);
    const fillMat = new THREE5.MeshBasicMaterial({
      color: c,
      opacity: 0.1,
      transparent: true,
      depthWrite: false,
      depthTest: false
    });
    const fill = new THREE5.Mesh(fillGeo, fillMat);
    fill.position.copy(center);
    fill.scale.copy(size);
    fill.renderOrder = 1;
    draftGroup.add(fill);
    const edgesGeo = new THREE5.EdgesGeometry(new THREE5.BoxGeometry(1, 1, 1));
    const edgesMat = new THREE5.LineBasicMaterial({ color: c, depthTest: false, transparent: true, opacity: 0.6 });
    const edges = new THREE5.LineSegments(edgesGeo, edgesMat);
    edges.position.copy(center);
    edges.scale.copy(size);
    edges.renderOrder = 2;
    draftGroup.add(edges);
    this.group.add(draftGroup);
    this._volumeDraft = draftGroup;
  }
  /** Create a volume measurement from a drag-defined box */
  addVolumeMeasurement(box) {
    this.setVolumeDraft(null);
    this.clearSnap();
    const size = new THREE5.Vector3();
    box.getSize(size);
    const volume = size.x * size.y * size.z;
    if (volume <= 0) return null;
    const id = nextId();
    const m = {
      id,
      type: "volume",
      label: `Volume ${_idCounter}`,
      points: [],
      // Not used for box-based volumes
      value: volume,
      box: {
        min: [box.min.x, box.min.y, box.min.z],
        max: [box.max.x, box.max.y, box.max.z]
      },
      color: COLORS.volume,
      visible: true,
      selected: false
    };
    const objects = this.buildVolumeBoxObjects(m, box);
    this.measurements.set(m.id, { data: m, objects });
    this.onChange?.(this.getAll());
    return m;
  }
  buildVolumeBoxObjects(m, box) {
    const objects = [];
    const color = new THREE5.Color(m.color);
    const center = new THREE5.Vector3();
    const size = new THREE5.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const fillGeo = new THREE5.BoxGeometry(1, 1, 1);
    const fillMat = new THREE5.MeshBasicMaterial({
      color,
      opacity: 0.12,
      transparent: true,
      depthWrite: false,
      depthTest: false
    });
    const fill = new THREE5.Mesh(fillGeo, fillMat);
    fill.position.copy(center);
    fill.scale.copy(size);
    fill.renderOrder = 1;
    this.group.add(fill);
    objects.push(fill);
    const edgesGeo = new THREE5.EdgesGeometry(new THREE5.BoxGeometry(1, 1, 1));
    const edgesMat = new THREE5.LineBasicMaterial({ color, depthTest: false });
    const edges = new THREE5.LineSegments(edgesGeo, edgesMat);
    edges.position.copy(center);
    edges.scale.copy(size);
    edges.renderOrder = 2;
    this.group.add(edges);
    objects.push(edges);
    const text = `${m.value.toFixed(3)} m\xB3`;
    const sprite = this.makeTextSprite(text, m.color);
    sprite.position.copy(center).add(new THREE5.Vector3(0, 0, size.z / 2 + 0.5));
    const ls = this._displaySettings.measurementLabelScale;
    sprite.scale.set(3.2 * ls, 0.8 * ls, 1);
    sprite.renderOrder = 3;
    this.group.add(sprite);
    objects.push(sprite);
    return objects;
  }
  // ─── Internals ──────────────────────────────────────────────────────────────
  compute(m) {
    const pts = m.points;
    switch (m.type) {
      case "point":
        return 0;
      case "distance":
        return pts.length >= 2 ? pts[0].distanceTo(pts[1]) : 0;
      case "height":
        return pts.length >= 2 ? Math.abs(pts[1].z - pts[0].z) : 0;
      case "angle": {
        if (pts.length < 3) return 0;
        const a = pts[0].clone().sub(pts[1]).normalize();
        const b = pts[2].clone().sub(pts[1]).normalize();
        return Math.acos(Math.max(-1, Math.min(1, a.dot(b))));
      }
      case "area":
        return this.polygonArea(pts);
      case "volume":
        return this.convexVolume(pts);
      default:
        return 0;
    }
  }
  polygonArea(pts) {
    if (pts.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      area += a.x * b.y - b.x * a.y;
    }
    return Math.abs(area) / 2;
  }
  convexVolume(pts) {
    const box = new THREE5.Box3();
    pts.forEach((p) => box.expandByPoint(p));
    const size = new THREE5.Vector3();
    box.getSize(size);
    return size.x * size.y * size.z;
  }
  buildObjects(m) {
    const objects = [];
    const color = new THREE5.Color(m.color);
    const pts = m.points;
    pts.forEach((p) => {
      const geo = new THREE5.SphereGeometry(this._displaySettings.measurementSphereRadius, 8, 6);
      const mat = new THREE5.MeshBasicMaterial({ color, depthTest: false });
      const mesh = new THREE5.Mesh(geo, mat);
      mesh.position.copy(p);
      mesh.renderOrder = 2;
      this.group.add(mesh);
      objects.push(mesh);
    });
    if (pts.length >= 2) {
      const lineType = m.type === "height" ? "vertical" : "direct";
      if (lineType === "vertical" && m.type === "height") {
        const geo = new THREE5.BufferGeometry().setFromPoints([
          pts[0],
          new THREE5.Vector3(pts[0].x, pts[0].y, pts[1].z)
        ]);
        const mat = new THREE5.LineBasicMaterial({ color, depthTest: false });
        const line = new THREE5.Line(geo, mat);
        line.renderOrder = 1;
        this.group.add(line);
        objects.push(line);
      } else {
        for (let i = 0; i < pts.length - 1; i++) {
          const geo = new THREE5.BufferGeometry().setFromPoints([pts[i], pts[i + 1]]);
          const mat = new THREE5.LineBasicMaterial({ color, depthTest: false });
          const line = new THREE5.Line(geo, mat);
          line.renderOrder = 1;
          this.group.add(line);
          objects.push(line);
        }
        if (m.type === "area" && pts.length >= 3) {
          const geo = new THREE5.BufferGeometry().setFromPoints([pts[pts.length - 1], pts[0]]);
          const mat = new THREE5.LineBasicMaterial({ color, depthTest: false });
          this.group.add(new THREE5.Line(geo, mat));
        }
      }
    }
    if (m.value !== void 0) {
      let text = "";
      switch (m.type) {
        case "distance":
          text = formatLength(m.value);
          break;
        case "height":
          text = formatLength(m.value);
          break;
        case "area":
          text = formatArea(m.value);
          break;
        case "angle":
          text = formatAngle(m.value);
          break;
        case "volume":
          text = `${m.value.toFixed(3)} m\xB3`;
          break;
        case "point": {
          const p = pts[0];
          text = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
          break;
        }
      }
      if (text) {
        const sprite = this.makeTextSprite(text, m.color);
        const mid = pts.reduce((a, b) => a.clone().add(b), new THREE5.Vector3()).divideScalar(pts.length);
        sprite.position.copy(mid).add(new THREE5.Vector3(0, 0, 1));
        const ls = this._displaySettings.measurementLabelScale;
        sprite.scale.set(3.2 * ls, 0.8 * ls, 1);
        sprite.renderOrder = 3;
        this.group.add(sprite);
        objects.push(sprite);
      }
    }
    return objects;
  }
  makeTextSprite(text, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 48;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.roundRect(2, 2, 252, 44, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = "bold 28px -apple-system, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 24);
    const tex = new THREE5.CanvasTexture(canvas);
    return new THREE5.Sprite(new THREE5.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  }
  rebuildPreview() {
    this.clearPreview();
    if (!this.activeMeasurement || this.activeMeasurement.points.length < 1) return;
    const pts = this.activeMeasurement.points;
    const geo = new THREE5.BufferGeometry().setFromPoints(pts);
    const mat = new THREE5.LineBasicMaterial({
      color: new THREE5.Color(this.activeMeasurement.color),
      depthTest: false,
      transparent: true,
      opacity: 0.7
    });
    this.previewLine = new THREE5.Line(geo, mat);
    this.previewLine.renderOrder = 1;
    this.group.add(this.previewLine);
  }
  clearPreview() {
    if (this.previewLine) {
      this.previewLine.geometry.dispose();
      this.previewLine.material.dispose();
      this.group.remove(this.previewLine);
      this.previewLine = null;
    }
  }
  rename(id, name) {
    const entry = this.measurements.get(id);
    if (!entry) return;
    entry.data.label = name;
    this.onChange?.(this.getAll());
  }
  remove(id) {
    const entry = this.measurements.get(id);
    if (!entry) return;
    this._disposeObjects(entry.objects);
    this.measurements.delete(id);
    this.onChange?.(this.getAll());
  }
  clearAll() {
    for (const id of this.measurements.keys()) this.remove(id);
  }
  dispose() {
    this.clearAll();
    this.clearPreview();
    this.clearSnap();
    this.scene.remove(this.group);
  }
};
var VIEW_DIRECTIONS = {
  top: { pos: new THREE5.Vector3(0, 0, 1), up: new THREE5.Vector3(0, 1, 0) },
  front: { pos: new THREE5.Vector3(0, -1, 0), up: new THREE5.Vector3(0, 0, 1) },
  side: { pos: new THREE5.Vector3(1, 0, 0), up: new THREE5.Vector3(0, 0, 1) },
  back: { pos: new THREE5.Vector3(0, 1, 0), up: new THREE5.Vector3(0, 0, 1) },
  custom: { pos: new THREE5.Vector3(0, 0, 1), up: new THREE5.Vector3(0, 1, 0) }
};
var ExportManager = class {
  sceneManager;
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
  }
  /** Capture an orthographic view and return as data URL */
  async capture(options) {
    const { view, scale, background, format, quality = 0.95 } = options;
    const { scene, renderer } = this.sceneManager;
    const box = new THREE5.Box3();
    scene.traverse((obj) => {
      if (obj instanceof THREE5.Mesh || obj.name === "pointcloud") {
        try {
          box.expandByObject(obj);
        } catch {
        }
      }
    });
    const size = new THREE5.Vector3();
    const center = new THREE5.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const dir = VIEW_DIRECTIONS[view] ?? VIEW_DIRECTIONS.top;
    const baseW = renderer.domElement.width;
    const baseH = renderer.domElement.height;
    const outW = baseW * scale;
    const outH = baseH * scale;
    const aspect = outW / outH;
    const halfH = Math.max(size.x, size.y, size.z) * 0.6;
    const halfW = halfH * aspect;
    const orthoCamera = new THREE5.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.01, 1e5);
    orthoCamera.position.copy(center).addScaledVector(dir.pos, halfH * 3);
    orthoCamera.up.copy(dir.up);
    orthoCamera.lookAt(center);
    orthoCamera.updateMatrixWorld();
    const rt = new THREE5.WebGLRenderTarget(outW, outH, {
      minFilter: THREE5.LinearFilter,
      magFilter: THREE5.LinearFilter,
      format: THREE5.RGBAFormat
    });
    const prevBg = scene.background;
    if (background === "white") scene.background = new THREE5.Color(16777215);
    else if (background === "black") scene.background = new THREE5.Color(0);
    else scene.background = null;
    renderer.setRenderTarget(rt);
    renderer.setSize(outW, outH);
    renderer.render(scene, orthoCamera);
    renderer.setRenderTarget(null);
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
    scene.background = prevBg;
    const pixels = new Uint8Array(outW * outH * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, outW, outH, pixels);
    rt.dispose();
    const flipped = new Uint8ClampedArray(outW * outH * 4);
    for (let y = 0; y < outH; y++) {
      const src = (outH - 1 - y) * outW * 4;
      const dst = y * outW * 4;
      flipped.set(pixels.subarray(src, src + outW * 4), dst);
    }
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    canvas.getContext("2d").putImageData(new ImageData(flipped, outW, outH), 0, 0);
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    return canvas.toDataURL(mime, quality);
  }
  /** Download a data URL as a file */
  static download(dataUrl, filename) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }
};
var MinimapRenderer = class {
  sceneManager;
  bounds = null;
  // Rendering elements
  container = null;
  glCanvas = null;
  overlayCanvas = null;
  miniRenderer = null;
  orthoCamera;
  // World range (square, padded)
  worldLeft = -50;
  worldRight = 50;
  worldTop = 50;
  worldBottom = -50;
  frameCount = 0;
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.orthoCamera = new THREE5.OrthographicCamera(-50, 50, 50, -50, -1e4, 1e4);
    this.orthoCamera.position.set(0, 0, 1e3);
    this.orthoCamera.up.set(0, 1, 0);
    this.orthoCamera.lookAt(0, 0, 0);
  }
  /**
   * Attach to a container element. Creates internal canvases.
   * Container should have position:relative and defined size.
   */
  attach(container) {
    this.dispose();
    this.container = container;
    const w = container.clientWidth || 176;
    const h = container.clientHeight || 176;
    this.glCanvas = document.createElement("canvas");
    this.glCanvas.width = w;
    this.glCanvas.height = h;
    this.glCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    container.appendChild(this.glCanvas);
    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.width = w;
    this.overlayCanvas.height = h;
    this.overlayCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
    container.appendChild(this.overlayCanvas);
    try {
      this.miniRenderer = new THREE5.WebGLRenderer({
        canvas: this.glCanvas,
        antialias: false,
        alpha: false
      });
      this.miniRenderer.setPixelRatio(1);
      this.miniRenderer.setSize(w, h, false);
      this.miniRenderer.setClearColor(658970, 1);
    } catch {
      this.miniRenderer = null;
    }
  }
  /** Set world-space bounds of the scene */
  setBounds(bounds) {
    this.bounds = bounds.clone();
    if (bounds.isEmpty()) return;
    const size = new THREE5.Vector3();
    const center = new THREE5.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    const half = Math.max(size.x, size.y) * 0.55;
    this.worldLeft = center.x - half;
    this.worldRight = center.x + half;
    this.worldTop = center.y + half;
    this.worldBottom = center.y - half;
    this.orthoCamera.left = this.worldLeft;
    this.orthoCamera.right = this.worldRight;
    this.orthoCamera.top = this.worldTop;
    this.orthoCamera.bottom = this.worldBottom;
    this.orthoCamera.near = -1e4;
    this.orthoCamera.far = 1e4;
    this.orthoCamera.position.set(center.x, center.y, 1e3);
    this.orthoCamera.lookAt(center.x, center.y, 0);
    this.orthoCamera.updateProjectionMatrix();
  }
  /** Called every frame. Renders 3D scene top-down + overlay. */
  update() {
    this.frameCount++;
    const render3D = this.frameCount % 6 === 0;
    if (render3D) this._render3D();
    if (this.frameCount % 2 === 0) this._drawOverlay();
  }
  _render3D() {
    if (!this.miniRenderer || !this.bounds) return;
    const c = this.container;
    if (c && this.glCanvas) {
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (this.glCanvas.width !== w || this.glCanvas.height !== h) {
        this.glCanvas.width = w;
        this.glCanvas.height = h;
        this.miniRenderer.setSize(w, h, false);
        if (this.overlayCanvas) {
          this.overlayCanvas.width = w;
          this.overlayCanvas.height = h;
        }
      }
    }
    this.miniRenderer.render(this.sceneManager.scene, this.orthoCamera);
  }
  _drawOverlay() {
    if (!this.overlayCanvas) return;
    const ctx = this.overlayCanvas.getContext("2d");
    if (!ctx) return;
    const W = this.overlayCanvas.width;
    const H = this.overlayCanvas.height;
    ctx.clearRect(0, 0, W, H);
    this._drawCamera(ctx, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("N", W / 2, 10);
  }
  _worldToCanvasX(wx) {
    const W = this.overlayCanvas?.width ?? 176;
    return (wx - this.worldLeft) / (this.worldRight - this.worldLeft) * W;
  }
  _worldToCanvasY(wy) {
    const H = this.overlayCanvas?.height ?? 176;
    return (1 - (wy - this.worldBottom) / (this.worldTop - this.worldBottom)) * H;
  }
  _drawCamera(ctx, _W, _H) {
    const cam = this.sceneManager.camera;
    const dir = new THREE5.Vector3();
    cam.getWorldDirection(dir);
    const cx = this._worldToCanvasX(cam.position.x);
    const cy = this._worldToCanvasY(cam.position.y);
    const angle = Math.atan2(-dir.y, dir.x);
    const fovLen = 28;
    const halfFov = THREE5.MathUtils.degToRad(cam.fov * 0.5 * (1 / Math.max(cam.aspect, 0.1)));
    const left = angle - halfFov;
    const right = angle + halfFov;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(left) * fovLen, cy + Math.sin(left) * fovLen);
    ctx.lineTo(cx + Math.cos(right) * fovLen, cy + Math.sin(right) * fovLen);
    ctx.closePath();
    ctx.fillStyle = "rgba(220,213,70,0.18)";
    ctx.strokeStyle = "rgba(220,213,70,0.55)";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#dcd546";
    ctx.fill();
  }
  /** Convert canvas pixel to world XY position */
  canvasToWorld(cx, cy) {
    const W = this.overlayCanvas?.width ?? 176;
    const H = this.overlayCanvas?.height ?? 176;
    const wx = this.worldLeft + cx / W * (this.worldRight - this.worldLeft);
    const wy = this.worldBottom + (1 - cy / H) * (this.worldTop - this.worldBottom);
    return new THREE5.Vector2(wx, wy);
  }
  /** Handle resize (called by parent when container size changes) */
  resize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (this.glCanvas) {
      this.glCanvas.width = w;
      this.glCanvas.height = h;
    }
    if (this.overlayCanvas) {
      this.overlayCanvas.width = w;
      this.overlayCanvas.height = h;
    }
    this.miniRenderer?.setSize(w, h, false);
  }
  dispose() {
    this.miniRenderer?.dispose();
    this.miniRenderer = null;
    if (this.glCanvas?.parentElement) this.glCanvas.remove();
    if (this.overlayCanvas?.parentElement) this.overlayCanvas.remove();
    this.glCanvas = null;
    this.overlayCanvas = null;
    this.container = null;
  }
};
var AXIS_COLOR = {
  x: 15680580,
  y: 2278750,
  z: 3900150
};
var HANDLE_HOVER_COLOR = 16777215;
var HANDLE_DRAG_COLOR = 16347926;
var FaceHandleController = class {
  scene;
  camera;
  domElement;
  handles = [];
  box = null;
  onChange = null;
  drag = null;
  hoveredHandle = null;
  raycaster = new THREE5.Raycaster();
  group;
  disposed = false;
  /** Rotation of the box about the world Z axis, in radians. */
  _rotationZ = 0;
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.group = new THREE5.Group();
    this.group.name = "face-handles";
    this.scene.add(this.group);
    this.createHandles();
  }
  createHandles() {
    const axes = ["x", "y", "z"];
    const signs = [1, -1];
    const geo = new THREE5.SphereGeometry(1, 12, 8);
    for (const axis of axes) {
      for (const sign of signs) {
        const mat = new THREE5.MeshBasicMaterial({
          color: AXIS_COLOR[axis],
          transparent: true,
          opacity: 0.7,
          depthTest: false
        });
        const mesh = new THREE5.Mesh(geo, mat);
        mesh.renderOrder = 10;
        mesh.visible = false;
        mesh.userData = { faceHandle: true, axis, sign };
        this.group.add(mesh);
        this.handles.push({ mesh, axis, sign });
      }
    }
  }
  attach(box, onChange) {
    this.box = box;
    this.onChange = onChange;
    this.updatePositions();
    for (const h of this.handles) h.mesh.visible = true;
  }
  /** Set the box's rotation about the world Z axis (radians) so handles follow it. */
  setRotationZ(r) {
    this._rotationZ = r;
    if (this.box) this.updatePositions();
  }
  detach() {
    this.box = null;
    this.onChange = null;
    this.drag = null;
    this.hoveredHandle = null;
    for (const h of this.handles) h.mesh.visible = false;
  }
  isAttached() {
    return this.box !== null;
  }
  isDragging() {
    return this.drag !== null;
  }
  getHandleMeshes() {
    return this.handles.map((h) => h.mesh);
  }
  /** Update handle positions and sizes to match the current box */
  updatePositions() {
    if (!this.box) return;
    const center = new THREE5.Vector3();
    const size = new THREE5.Vector3();
    this.box.getCenter(center);
    this.box.getSize(size);
    const diag = size.length();
    const radius = Math.max(0.05, Math.min(diag * 0.02, 2));
    const cos = Math.cos(this._rotationZ);
    const sin = Math.sin(this._rotationZ);
    for (const h of this.handles) {
      const offset = new THREE5.Vector3();
      if (h.sign === 1) {
        offset[h.axis] = this.box.max[h.axis] - center[h.axis];
      } else {
        offset[h.axis] = this.box.min[h.axis] - center[h.axis];
      }
      const rx = offset.x * cos - offset.y * sin;
      const ry = offset.x * sin + offset.y * cos;
      h.mesh.position.set(center.x + rx, center.y + ry, center.z + offset.z);
      h.mesh.scale.setScalar(radius);
    }
  }
  /**
   * Try to start a drag. Call on pointerdown.
   * Returns true if a handle was grabbed (caller should disable orbit controls).
   */
  onPointerDown(clientX, clientY) {
    if (!this.box) return false;
    const handle = this.hitTest(clientX, clientY);
    if (!handle) return false;
    const cameraDir = new THREE5.Vector3();
    this.camera.getWorldDirection(cameraDir);
    const plane = new THREE5.Plane().setFromNormalAndCoplanarPoint(
      cameraDir.negate(),
      handle.mesh.position.clone()
    );
    this.setRaycasterFromClient(clientX, clientY);
    const startIntersect = new THREE5.Vector3();
    if (!this.raycaster.ray.intersectPlane(plane, startIntersect)) return false;
    const startValue = handle.sign === 1 ? this.box.max[handle.axis] : this.box.min[handle.axis];
    this.drag = {
      handle,
      plane,
      startIntersect,
      startValue,
      worldAxis: this.worldAxisFor(handle.axis)
    };
    this.setHandleColor(handle, HANDLE_DRAG_COLOR);
    return true;
  }
  /** World-space unit vector for a box-local face axis, rotated by _rotationZ around Z. */
  worldAxisFor(axis) {
    const cos = Math.cos(this._rotationZ);
    const sin = Math.sin(this._rotationZ);
    if (axis === "x") return new THREE5.Vector3(cos, sin, 0);
    if (axis === "y") return new THREE5.Vector3(-sin, cos, 0);
    return new THREE5.Vector3(0, 0, 1);
  }
  /** Update the box during a drag. Call on pointermove. */
  onPointerMove(clientX, clientY) {
    if (!this.drag || !this.box) return;
    this.setRaycasterFromClient(clientX, clientY);
    const currentIntersect = new THREE5.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.drag.plane, currentIntersect)) return;
    const axis = this.drag.handle.axis;
    const worldDelta = currentIntersect.clone().sub(this.drag.startIntersect);
    const delta = worldDelta.dot(this.drag.worldAxis);
    const newValue = this.drag.startValue + delta;
    const MIN_SIZE = 0.1;
    if (this.drag.handle.sign === 1) {
      this.box.max[axis] = Math.max(this.box.min[axis] + MIN_SIZE, newValue);
    } else {
      this.box.min[axis] = Math.min(this.box.max[axis] - MIN_SIZE, newValue);
    }
    this.updatePositions();
    this.onChange?.(this.box);
  }
  /** End the drag. Call on pointerup. */
  onPointerUp() {
    if (this.drag) {
      this.setHandleColor(this.drag.handle, AXIS_COLOR[this.drag.handle.axis]);
      this.drag = null;
    }
  }
  /** Update hover highlight. Call on pointermove when not dragging. */
  updateHover(clientX, clientY) {
    if (this.drag || !this.box) return;
    const hit = this.hitTest(clientX, clientY);
    if (hit !== this.hoveredHandle) {
      if (this.hoveredHandle) {
        this.setHandleColor(this.hoveredHandle, AXIS_COLOR[this.hoveredHandle.axis]);
      }
      this.hoveredHandle = hit;
      if (hit) {
        this.setHandleColor(hit, HANDLE_HOVER_COLOR);
      }
    }
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const h of this.handles) {
      h.mesh.geometry.dispose();
      h.mesh.material.dispose();
    }
    this.scene.remove(this.group);
  }
  hitTest(clientX, clientY) {
    if (!this.box) return null;
    this.setRaycasterFromClient(clientX, clientY);
    const meshes = this.handles.filter((h) => h.mesh.visible).map((h) => h.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);
    if (intersects.length === 0) return null;
    const hitMesh = intersects[0].object;
    return this.handles.find((h) => h.mesh === hitMesh) ?? null;
  }
  setRaycasterFromClient(clientX, clientY) {
    const rect = this.domElement.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(new THREE5.Vector2(nx, ny), this.camera);
  }
  setHandleColor(handle, color) {
    handle.mesh.material.color.setHex(color);
  }
};

// src/core/clip-manager.ts
var _nextId = 1;
function genId() {
  return `clip_${_nextId++}`;
}
var ClipManager = class {
  sm;
  entries = [];
  helpers = /* @__PURE__ */ new Map();
  fills = /* @__PURE__ */ new Map();
  draftHelper = null;
  selectedId = null;
  transformControls = null;
  pivot = null;
  _faceHandles = null;
  _transformMode = "translate";
  onChange;
  onSelectChange;
  constructor(sm) {
    this.sm = sm;
  }
  async initTransformControls() {
    if (this.transformControls) return;
    const { TransformControls } = await import('three/examples/jsm/controls/TransformControls.js');
    const tc = new TransformControls(this.sm.camera, this.sm.renderer.domElement);
    tc.setSpace("world");
    tc.setSize(0.8);
    tc.addEventListener("change", () => this.syncFromPivot());
    tc.addEventListener("dragging-changed", (e) => {
      this.sm.controls.enabled = !e.value;
    });
    this.sm.scene.add(tc);
    this.transformControls = tc;
  }
  addBox(box, name) {
    const id = genId();
    const entry = {
      id,
      name: name ?? `Box ${this.entries.length + 1}`,
      box: box.clone(),
      mode: "outside",
      visible: true,
      rotationZ: 0
    };
    this.entries.push(entry);
    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
    return entry;
  }
  async selectBox(id) {
    this._highlightHelper(this.selectedId, false);
    const tc = this.transformControls;
    if (tc) tc.detach();
    if (this.pivot) {
      this.sm.scene.remove(this.pivot);
      this.pivot.geometry.dispose();
      this.pivot = null;
    }
    this._faceHandles?.detach();
    this.selectedId = id;
    this.onSelectChange?.(id);
    if (!id) return;
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return;
    await this.initTransformControls();
    const controls = this.transformControls;
    const center = new THREE5.Vector3();
    const size = new THREE5.Vector3();
    entry.box.getCenter(center);
    entry.box.getSize(size);
    const geo = new THREE5.BoxGeometry(1, 1, 1);
    const mat = new THREE5.MeshBasicMaterial({ visible: false });
    this.pivot = new THREE5.Mesh(geo, mat);
    this.pivot.position.copy(center);
    this.pivot.scale.copy(size);
    this.pivot.rotation.set(0, 0, entry.rotationZ ?? 0);
    this.pivot.userData.clipId = id;
    this.sm.scene.add(this.pivot);
    controls.attach(this.pivot);
    controls.setMode("translate");
    if (!this._faceHandles) {
      this._faceHandles = new FaceHandleController(
        this.sm.scene,
        this.sm.camera,
        this.sm.renderer.domElement
      );
    }
    this._faceHandles.setRotationZ(entry.rotationZ ?? 0);
    this._faceHandles.attach(entry.box, () => {
      this.updateHelper(entry);
      this.applyAll();
      if (this.pivot) {
        const c = new THREE5.Vector3();
        const s = new THREE5.Vector3();
        entry.box.getCenter(c);
        entry.box.getSize(s);
        this.pivot.position.copy(c);
        this.pivot.scale.copy(s);
      }
      this.onChange?.(this.getBoxes());
    });
    this._applyTransformMode();
    this._highlightHelper(id, true);
  }
  setTransformMode(mode) {
    this._transformMode = mode;
    this._applyTransformMode();
  }
  /** Get the face handle controller (for viewport event forwarding) */
  get faceHandles() {
    return this._faceHandles;
  }
  _applyTransformMode() {
    const tc = this.transformControls;
    if (this._transformMode === "scale") {
      if (tc) tc.detach();
      if (this._faceHandles && this.selectedId) {
        const entry = this.entries.find((e) => e.id === this.selectedId);
        if (entry && !this._faceHandles.isAttached()) {
          this._faceHandles.setRotationZ(entry.rotationZ ?? 0);
          this._faceHandles.attach(entry.box, () => {
            this.updateHelper(entry);
            this.applyAll();
            if (this.pivot) {
              const c = new THREE5.Vector3();
              const s = new THREE5.Vector3();
              entry.box.getCenter(c);
              entry.box.getSize(s);
              this.pivot.position.copy(c);
              this.pivot.scale.copy(s);
            }
            this.onChange?.(this.getBoxes());
          });
        }
        this._faceHandles.updatePositions();
      }
    } else {
      if (tc && this.pivot) {
        tc.attach(this.pivot);
        tc.setMode(this._transformMode);
      }
      this._faceHandles?.detach();
    }
  }
  removeBox(id) {
    const idx = this.entries.findIndex((e) => e.id === id);
    if (idx === -1) return;
    this.entries.splice(idx, 1);
    const helper = this.helpers.get(id);
    if (helper) {
      this.sm.scene.remove(helper);
      helper.geometry.dispose();
      this.helpers.delete(id);
    }
    const fill = this.fills.get(id);
    if (fill) {
      this.sm.scene.remove(fill);
      fill.geometry.dispose();
      fill.material.dispose();
      this.fills.delete(id);
    }
    if (this.selectedId === id) {
      this.transformControls?.detach();
      if (this.pivot) {
        this.sm.scene.remove(this.pivot);
        this.pivot.geometry.dispose();
        this.pivot = null;
      }
      this.selectedId = null;
      this.onSelectChange?.(null);
    }
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }
  setBoxMode(id, mode) {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return;
    entry.mode = mode;
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }
  setBoxVisible(id, visible) {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return;
    entry.visible = visible;
    const helper = this.helpers.get(id);
    if (helper) helper.visible = visible;
    const fill = this.fills.get(id);
    if (fill) fill.visible = visible;
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }
  renameBox(id, name) {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return;
    entry.name = name;
    this.onChange?.(this.getBoxes());
  }
  getBoxes() {
    return this.entries.map((e) => ({ ...e, box: e.box.clone() }));
  }
  getSelectedId() {
    return this.selectedId;
  }
  hasBox() {
    return this.entries.length > 0;
  }
  /** Draft box — live drag preview, no clip applied */
  setDraft(box) {
    if (this.draftHelper) {
      this.sm.scene.remove(this.draftHelper);
      this.draftHelper.geometry.dispose();
      this.draftHelper = null;
    }
    if (box && !box.isEmpty()) {
      this.draftHelper = new THREE5.Box3Helper(box, new THREE5.Color(14472518));
      this.draftHelper.material.transparent = true;
      this.draftHelper.material.opacity = 0.6;
      this.draftHelper.renderOrder = 3;
      this.sm.scene.add(this.draftHelper);
    }
  }
  clear() {
    this.transformControls?.detach();
    if (this.pivot) {
      this.sm.scene.remove(this.pivot);
      this.pivot.geometry.dispose();
      this.pivot = null;
    }
    for (const [, helper] of this.helpers) {
      this.sm.scene.remove(helper);
      helper.geometry.dispose();
    }
    this.helpers.clear();
    for (const [, fill] of this.fills) {
      this.sm.scene.remove(fill);
      fill.geometry.dispose();
      fill.material.dispose();
    }
    this.fills.clear();
    this.entries = [];
    this.selectedId = null;
    if (this.draftHelper) {
      this.sm.scene.remove(this.draftHelper);
      this.draftHelper.geometry.dispose();
      this.draftHelper = null;
    }
    this.applyAll();
    this.onChange?.([]);
    this.onSelectChange?.(null);
  }
  dispose() {
    this.clear();
    const tc = this.transformControls;
    if (tc) {
      this.sm.scene.remove(tc);
      tc.dispose();
      this.transformControls = null;
    }
    if (this._faceHandles) {
      this._faceHandles.dispose();
      this._faceHandles = null;
    }
  }
  syncFromPivot() {
    if (!this.pivot || !this.selectedId) return;
    const entry = this.entries.find((e) => e.id === this.selectedId);
    if (!entry) return;
    if (this._transformMode === "rotate") {
      const zRot = new THREE5.Euler().setFromQuaternion(this.pivot.quaternion, "ZYX").z;
      entry.rotationZ = zRot;
      this.pivot.rotation.set(0, 0, zRot);
      this._faceHandles?.setRotationZ(zRot);
    } else {
      const center = this.pivot.position.clone();
      const halfSize = new THREE5.Vector3(
        Math.abs(this.pivot.scale.x) * 0.5,
        Math.abs(this.pivot.scale.y) * 0.5,
        Math.abs(this.pivot.scale.z) * 0.5
      );
      entry.box.min.copy(center).sub(halfSize);
      entry.box.max.copy(center).add(halfSize);
    }
    this.updateHelper(entry);
    this.applyAll();
    this.onChange?.(this.getBoxes());
  }
  /** Set wireframe color for selected/default state */
  _highlightHelper(id, selected) {
    if (!id) return;
    const helper = this.helpers.get(id);
    if (helper) {
      helper.material.color.setHex(
        selected ? 16777028 : 14472518
      );
    }
  }
  updateHelper(entry) {
    if (!this.helpers.has(entry.id)) {
      const helper2 = new THREE5.Box3Helper(entry.box, new THREE5.Color(14472518));
      helper2.material.linewidth = 1;
      helper2.renderOrder = 3;
      helper2.visible = entry.visible;
      this.sm.scene.add(helper2);
      this.helpers.set(entry.id, helper2);
    }
    const helper = this.helpers.get(entry.id);
    if (helper) helper.rotation.z = entry.rotationZ ?? 0;
    const center = new THREE5.Vector3();
    const size = new THREE5.Vector3();
    entry.box.getCenter(center);
    entry.box.getSize(size);
    const existingFill = this.fills.get(entry.id);
    if (existingFill) {
      existingFill.position.copy(center);
      existingFill.scale.copy(size);
      existingFill.rotation.z = entry.rotationZ ?? 0;
    } else {
      const fillGeo = new THREE5.BoxGeometry(1, 1, 1);
      const fillMat = new THREE5.MeshBasicMaterial({
        color: 14472518,
        opacity: 0.08,
        transparent: true,
        depthWrite: false,
        side: THREE5.FrontSide
      });
      const fillMesh = new THREE5.Mesh(fillGeo, fillMat);
      fillMesh.position.copy(center);
      fillMesh.scale.copy(size);
      fillMesh.rotation.z = entry.rotationZ ?? 0;
      fillMesh.renderOrder = 2;
      fillMesh.visible = entry.visible;
      this.sm.scene.add(fillMesh);
      this.fills.set(entry.id, fillMesh);
    }
  }
  applyAll() {
    const visible = this.entries.filter((e) => e.visible);
    for (const pc of this.sm.pointClouds) {
      const mat = pc.material;
      if (!mat) continue;
      if (visible.length === 0) {
        mat.setClipBoxes([]);
        mat.clipMode = 0;
        continue;
      }
      const clipBoxes = visible.map((entry) => {
        const size = new THREE5.Vector3();
        const center = new THREE5.Vector3();
        entry.box.getSize(size);
        entry.box.getCenter(center);
        const q = new THREE5.Quaternion().setFromAxisAngle(
          new THREE5.Vector3(0, 0, 1),
          entry.rotationZ ?? 0
        );
        const matrix = new THREE5.Matrix4().compose(center, q, size);
        const inverse = matrix.clone().invert();
        return {
          box: entry.box.clone(),
          inverse,
          matrix,
          position: center.clone()
        };
      });
      mat.setClipBoxes(clipBoxes);
      mat.clipMode = visible[0].mode === "outside" ? 1 : 2;
    }
  }
};
var AxisWidget = class {
  _scene;
  _camera;
  _disposables = [];
  _materials = [];
  sm;
  constructor(sm) {
    this.sm = sm;
    this._scene = new THREE5.Scene();
    this._scene.background = null;
    this._camera = new THREE5.PerspectiveCamera(50, 1, 0.1, 100);
    this._buildAxes();
  }
  _buildAxes() {
    const axes = [
      { dir: new THREE5.Vector3(1, 0, 0), color: 15087942, label: "X" },
      // red
      { dir: new THREE5.Vector3(0, 1, 0), color: 2792847, label: "Y" },
      // teal
      { dir: new THREE5.Vector3(0, 0, 1), color: 4553629, label: "Z" }
      // blue
    ];
    for (const axis of axes) {
      const mat = new THREE5.MeshBasicMaterial({ color: axis.color });
      this._materials.push(mat);
      const quat = new THREE5.Quaternion().setFromUnitVectors(
        new THREE5.Vector3(0, 1, 0),
        axis.dir
      );
      const shaftGeo = new THREE5.CylinderGeometry(0.03, 0.03, 0.65, 6);
      shaftGeo.translate(0, 0.325, 0);
      shaftGeo.applyQuaternion(quat);
      this._scene.add(new THREE5.Mesh(shaftGeo, mat));
      this._disposables.push(shaftGeo);
      const coneGeo = new THREE5.ConeGeometry(0.08, 0.2, 8);
      coneGeo.translate(0, 0.76, 0);
      coneGeo.applyQuaternion(quat);
      this._scene.add(new THREE5.Mesh(coneGeo, mat));
      this._disposables.push(coneGeo);
      const sprite = this._makeLabel(axis.label, axis.color);
      const tipPos = axis.dir.clone().multiplyScalar(1.05);
      sprite.position.copy(tipPos);
      sprite.scale.set(0.28, 0.28, 1);
      this._scene.add(sprite);
    }
    const sGeo = new THREE5.SphereGeometry(0.06, 8, 8);
    const sMat = new THREE5.MeshBasicMaterial({ color: 10066329 });
    this._scene.add(new THREE5.Mesh(sGeo, sMat));
    this._disposables.push(sGeo);
    this._materials.push(sMat);
  }
  /** Create a canvas-based sprite with the axis letter */
  _makeLabel(letter, color) {
    const res = 64;
    const canvas = document.createElement("canvas");
    canvas.width = res;
    canvas.height = res;
    const ctx = canvas.getContext("2d");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${res * 0.6}px "Inter", system-ui, sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillText(letter, res / 2 + 1, res / 2 + 1);
    const hex = "#" + color.toString(16).padStart(6, "0");
    ctx.fillStyle = hex;
    ctx.fillText(letter, res / 2, res / 2);
    const tex = new THREE5.CanvasTexture(canvas);
    tex.minFilter = THREE5.LinearFilter;
    const mat = new THREE5.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false
    });
    this._materials.push(mat);
    return new THREE5.Sprite(mat);
  }
  /**
   * Render the widget into a scissor region in the top-right corner.
   * Must be called from a post-render callback after the main scene renders.
   */
  render() {
    const renderer = this.sm.renderer;
    const el = renderer.domElement;
    const W = el.clientWidth;
    const H = el.clientHeight;
    if (W === 0 || H === 0) return;
    const size = 100;
    const margin = 10;
    const savedVp = new THREE5.Vector4();
    const savedSc = new THREE5.Vector4();
    renderer.getViewport(savedVp);
    renderer.getScissor(savedSc);
    const savedScTest = renderer.getScissorTest();
    const savedAutoClear = renderer.autoClear;
    const dist = 3;
    const offset = new THREE5.Vector3(0, 0, dist).applyQuaternion(
      this.sm.camera.quaternion
    );
    this._camera.position.copy(offset);
    this._camera.up.copy(this.sm.camera.up);
    this._camera.lookAt(0, 0, 0);
    const x = W - size - margin;
    const y = H - size - margin;
    renderer.autoClear = false;
    renderer.setScissorTest(true);
    renderer.setScissor(x, y, size, size);
    renderer.setViewport(x, y, size, size);
    renderer.clearDepth();
    renderer.render(this._scene, this._camera);
    renderer.setViewport(savedVp);
    renderer.setScissor(savedSc);
    renderer.setScissorTest(savedScTest);
    renderer.autoClear = savedAutoClear;
  }
  dispose() {
    for (const g of this._disposables) g.dispose();
    for (const m of this._materials) {
      if (m instanceof THREE5.SpriteMaterial) m.map?.dispose();
      m.dispose();
    }
    this._disposables = [];
    this._materials = [];
  }
};

// src/core/presentation-manager.ts
var MAX_SCENES = 50;
var _nextId2 = 1;
function genSceneId() {
  return `scene_${Date.now()}_${_nextId2++}`;
}
var PresentationManager = class {
  storageKey;
  scenes = [];
  onChange;
  constructor(sourceKey) {
    this.storageKey = `pcv_scenes_${sourceKey}`;
    this.load();
  }
  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) this.scenes = JSON.parse(raw);
    } catch {
      this.scenes = [];
    }
  }
  persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.scenes));
    } catch {
    }
    this.onChange?.(this.getScenes());
  }
  getScenes() {
    return [...this.scenes];
  }
  addScene(scene) {
    const entry = {
      ...scene,
      id: genSceneId(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.scenes.unshift(entry);
    if (this.scenes.length > MAX_SCENES) this.scenes.length = MAX_SCENES;
    this.persist();
    return entry;
  }
  removeScene(id) {
    this.scenes = this.scenes.filter((s) => s.id !== id);
    this.persist();
  }
  renameScene(id, name) {
    const scene = this.scenes.find((s) => s.id === id);
    if (scene) {
      scene.name = name;
      this.persist();
    }
  }
  /** Export all scenes as a JSON string (for sharing / backup) */
  exportJSON() {
    return JSON.stringify(this.scenes, null, 2);
  }
  /** Import scenes from JSON string, merging with existing */
  importJSON(json) {
    try {
      const imported = JSON.parse(json);
      if (!Array.isArray(imported)) return 0;
      const existingIds = new Set(this.scenes.map((s) => s.id));
      let count = 0;
      for (const scene of imported) {
        if (!scene.id || !scene.name || !scene.camera) continue;
        if (existingIds.has(scene.id)) {
          scene.id = genSceneId();
        }
        this.scenes.push(scene);
        count++;
      }
      if (this.scenes.length > MAX_SCENES) this.scenes.length = MAX_SCENES;
      this.persist();
      return count;
    } catch {
      return 0;
    }
  }
  clear() {
    this.scenes = [];
    this.persist();
  }
};
function captureScene(name, cameraPos, cameraTarget, clipBoxes, colorMode, pointSize, pointBudget) {
  return {
    name,
    camera: {
      position: [cameraPos.x, cameraPos.y, cameraPos.z],
      target: [cameraTarget.x, cameraTarget.y, cameraTarget.z]
    },
    clipBoxes: clipBoxes.map((b) => ({
      name: b.name,
      min: [b.box.min.x, b.box.min.y, b.box.min.z],
      max: [b.box.max.x, b.box.max.y, b.box.max.z],
      mode: b.mode,
      visible: b.visible
    })),
    colorMode,
    pointSize,
    pointBudget
  };
}

// src/data/file-source-adapter.ts
var S3SourceAdapter = class {
  baseUrl;
  headers;
  constructor(baseUrl, headers = {}) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    this.headers = headers;
  }
  resolveUrl(relativePath) {
    return this.baseUrl + relativePath;
  }
  async fetchJson(relativePath) {
    const res = await fetch(this.resolveUrl(relativePath), { headers: this.headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${relativePath}`);
    return res.json();
  }
  async fetchBinary(relativePath) {
    const res = await fetch(this.resolveUrl(relativePath), { headers: this.headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${relativePath}`);
    return res.arrayBuffer();
  }
  fetchWithHeaders(input, init) {
    const mergedHeaders = { ...this.headers, ...init?.headers };
    return fetch(input, { ...init, headers: mergedHeaders });
  }
};
var ElectronSourceAdapter = class {
  basePath;
  constructor(basePath) {
    this.basePath = basePath.replace(/\\/g, "/");
    if (!this.basePath.endsWith("/")) this.basePath += "/";
  }
  resolveUrl(relativePath) {
    return "file:///" + this.basePath + relativePath;
  }
  async fetchJson(relativePath) {
    const abs = this.basePath + relativePath;
    const win = window;
    if (!win.electronFS) throw new Error("electronFS not available - is preload loaded?");
    const data = await win.electronFS.readFile(abs, "utf-8");
    return JSON.parse(data);
  }
  async fetchBinary(relativePath) {
    const abs = this.basePath + relativePath;
    const win = window;
    if (!win.electronFS) throw new Error("electronFS not available");
    const buffer = await win.electronFS.readFileBinary(abs);
    return buffer;
  }
  async listDirectories(path) {
    const win = window;
    if (!win.electronFS) return [];
    return win.electronFS.readdir(this.basePath + path);
  }
};
function createAdapter(source) {
  switch (source.type) {
    case "s3":
      return new S3SourceAdapter(source.baseUrl, source.headers);
    case "electron":
      return new ElectronSourceAdapter(source.basePath);
    case "local":
      return new S3SourceAdapter(source.basePath);
  }
}

export { AxisWidget, CameraAnimator, ClipManager, DISPLAY_PRESETS, ElectronSourceAdapter, ExportManager, MarkerManager, MeasurementManager, MinimapRenderer, PointCloudLoader, PresentationManager, S3SourceAdapter, SceneManager, captureScene, createAdapter, exportMeasurementsCSV, formatAngle, formatArea, formatCoord, formatLength, formatVolume };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map