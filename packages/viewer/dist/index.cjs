'use strict';

var THREE5 = require('three');
var OrbitControls_js = require('three/examples/jsm/controls/OrbitControls.js');
var React25 = require('react');
var jsxRuntime = require('react/jsx-runtime');
var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var lucideReact = require('lucide-react');
var reactDom = require('react-dom');
var classVarianceAuthority = require('class-variance-authority');
var SliderPrimitive = require('@radix-ui/react-slider');
var DialogPrimitive = require('@radix-ui/react-dialog');
var TabsPrimitive = require('@radix-ui/react-tabs');
var PopoverPrimitive = require('@radix-ui/react-popover');
var TooltipPrimitive = require('@radix-ui/react-tooltip');
var TogglePrimitive = require('@radix-ui/react-toggle');
var SelectPrimitive = require('@radix-ui/react-select');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var THREE5__namespace = /*#__PURE__*/_interopNamespace(THREE5);
var React25__default = /*#__PURE__*/_interopDefault(React25);
var SliderPrimitive__namespace = /*#__PURE__*/_interopNamespace(SliderPrimitive);
var DialogPrimitive__namespace = /*#__PURE__*/_interopNamespace(DialogPrimitive);
var TabsPrimitive__namespace = /*#__PURE__*/_interopNamespace(TabsPrimitive);
var PopoverPrimitive__namespace = /*#__PURE__*/_interopNamespace(PopoverPrimitive);
var TooltipPrimitive__namespace = /*#__PURE__*/_interopNamespace(TooltipPrimitive);
var TogglePrimitive__namespace = /*#__PURE__*/_interopNamespace(TogglePrimitive);
var SelectPrimitive__namespace = /*#__PURE__*/_interopNamespace(SelectPrimitive);

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}
function formatLength(meters) {
  return `${meters.toFixed(2)} m`;
}
function formatArea(m2) {
  return `${m2.toFixed(2)} m\xB2`;
}
function formatVolume(m3) {
  return `${m3.toFixed(2)} m\xB3`;
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
function nextId() {
  return `m-${++_idCounter}`;
}
function genId() {
  return `clip_${_nextId++}`;
}
function genSceneId() {
  return `scene_${Date.now()}_${_nextId2++}`;
}
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
function createAdapter(source) {
  switch (source.type) {
    case "s3":
      return new exports.S3SourceAdapter(source.baseUrl, source.headers);
    case "electron":
      return new exports.ElectronSourceAdapter(source.basePath);
    case "local":
      return new exports.S3SourceAdapter(source.basePath);
  }
}
exports.SceneManager = void 0; exports.PointCloudLoader = void 0; exports.CameraAnimator = void 0; exports.DISPLAY_PRESETS = void 0; var MARKER_COLOR_DEFAULT, MARKER_COLOR_HOVER, MARKER_COLOR_SELECTED, PIN_BASE_SCALE; exports.MarkerManager = void 0; var _idCounter, COLORS; exports.MeasurementManager = void 0; var VIEW_DIRECTIONS; exports.ExportManager = void 0; exports.MinimapRenderer = void 0; var AXIS_COLOR, HANDLE_HOVER_COLOR, HANDLE_DRAG_COLOR, FaceHandleController, _nextId; exports.ClipManager = void 0; exports.AxisWidget = void 0; var MAX_SCENES, _nextId2; exports.PresentationManager = void 0; exports.S3SourceAdapter = void 0; exports.ElectronSourceAdapter = void 0;
var init_dist = __esm({
  "../core/dist/index.js"() {
    exports.SceneManager = class {
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
        this.scene = new THREE5__namespace.Scene();
        this.scene.background = new THREE5__namespace.Color(657930);
        const { clientWidth: w, clientHeight: h } = canvas;
        this.camera = new THREE5__namespace.PerspectiveCamera(60, w / h, 0.01, 1e5);
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, -50, 30);
        this.renderer = new THREE5__namespace.WebGLRenderer({
          antialias: true,
          logarithmicDepthBuffer: true,
          // Keep the drawing buffer so the picking magnifier (a 2D loupe) can sample
          // the rendered canvas between frames via drawImage.
          preserveDrawingBuffer: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setSize(w, h);
        this.renderer.outputColorSpace = THREE5__namespace.LinearSRGBColorSpace;
        this.renderer.autoClear = false;
        canvas.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.touchAction = "none";
        this.renderer.domElement.style.userSelect = "none";
        this.renderer.domElement.addEventListener("dragstart", (e) => e.preventDefault());
        this.controls = new OrbitControls_js.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.screenSpacePanning = true;
        this.controls.minPolarAngle = 0.01;
        this.controls.maxPolarAngle = Math.PI - 0.01;
        this.controls.zoomSpeed = 1.5;
        this.controls.rotateSpeed = 0.8;
        this.controls.zoomToCursor = false;
        this.controls.mouseButtons = {
          LEFT: THREE5__namespace.MOUSE.ROTATE,
          MIDDLE: THREE5__namespace.MOUSE.DOLLY,
          RIGHT: THREE5__namespace.MOUSE.PAN
        };
        this.scene.add(new THREE5__namespace.AmbientLight(16777215, 0.5));
        const dir = new THREE5__namespace.DirectionalLight(16777215, 1);
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
          this._orthoCamera = new THREE5__namespace.OrthographicCamera(-1, 1, 1, -1, 0.01, 1e5);
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
        const h = 2 * dist * Math.tan(THREE5__namespace.MathUtils.degToRad(this.camera.fov / 2));
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
            LEFT: THREE5__namespace.MOUSE.PAN,
            MIDDLE: THREE5__namespace.MOUSE.DOLLY,
            RIGHT: THREE5__namespace.MOUSE.ROTATE
          };
        } else if (mode === "free") {
          c.minPolarAngle = 0.01;
          c.maxPolarAngle = Math.PI - 0.01;
          c.mouseButtons = {
            LEFT: THREE5__namespace.MOUSE.ROTATE,
            MIDDLE: THREE5__namespace.MOUSE.ROTATE,
            RIGHT: THREE5__namespace.MOUSE.PAN
          };
        } else {
          c.minPolarAngle = 0.01;
          c.maxPolarAngle = Math.PI - 0.01;
          c.mouseButtons = {
            LEFT: THREE5__namespace.MOUSE.ROTATE,
            MIDDLE: THREE5__namespace.MOUSE.DOLLY,
            RIGHT: THREE5__namespace.MOUSE.PAN
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
        const center = new THREE5__namespace.Vector3();
        const size = new THREE5__namespace.Vector3();
        box.getCenter(center);
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
        const dir = new THREE5__namespace.Vector3(0, -0.82, 0.57).multiplyScalar(dist);
        this.camera.position.copy(center).add(dir);
        this.controls.target.copy(center);
        this.controls.update();
      }
      /** Raycast against objects in scene */
      raycast(normalizedX, normalizedY, objects) {
        const raycaster = new THREE5__namespace.Raycaster();
        const pointer = new THREE5__namespace.Vector2(normalizedX, normalizedY);
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
        const raycaster = new THREE5__namespace.Raycaster();
        raycaster.setFromCamera(new THREE5__namespace.Vector2(normalizedX, normalizedY), this.camera);
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
    exports.PointCloudLoader = class {
      sceneManager;
      adapter;
      currentClouds = [];
      hasRgb = false;
      /** World-space bounding box of the loaded point cloud (available after load) */
      worldBox = new THREE5__namespace.Box3();
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
        const worldBox = new THREE5__namespace.Box3();
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
    exports.CameraAnimator = class {
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
        const pos = Array.isArray(camPos) ? new THREE5__namespace.Vector3(camPos[0], camPos[1], camPos[2]) : camPos;
        const yaw = yawDeg * Math.PI / 180;
        const viewerPos = new THREE5__namespace.Vector3(
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
    exports.DISPLAY_PRESETS = {
      compact: {
        preset: "compact",
        measurementLineWidth: 1,
        measurementLabelScale: 0.6,
        measurementSphereRadius: 0.08,
        markerSphereScale: 0.7,
        markerSphereOpacity: 0.8,
        markerLabelScale: 0.85,
        markerLabelMode: "hover"
      },
      standard: {
        preset: "standard",
        measurementLineWidth: 2,
        measurementLabelScale: 1,
        measurementSphereRadius: 0.15,
        markerSphereScale: 1,
        markerSphereOpacity: 0.9,
        markerLabelScale: 1,
        markerLabelMode: "hover"
      },
      prominent: {
        preset: "prominent",
        measurementLineWidth: 4,
        measurementLabelScale: 1.6,
        measurementSphereRadius: 0.3,
        markerSphereScale: 1.6,
        markerSphereOpacity: 1,
        markerLabelScale: 1.3,
        markerLabelMode: "always"
      }
    };
    MARKER_COLOR_DEFAULT = 14472518;
    MARKER_COLOR_HOVER = 16777215;
    MARKER_COLOR_SELECTED = 16737860;
    PIN_BASE_SCALE = 0.022;
    exports.MarkerManager = class {
      scene;
      entries = [];
      group;
      hoveredIdx = -1;
      selectedIdx = -1;
      labelMode = "hover";
      _displaySettings = exports.DISPLAY_PRESETS.standard;
      _cameras = [];
      _worldBox;
      /** Shared circular pin texture (reused across all pins; tinted via material.color). */
      _pinTexture;
      /** World-space vertical offset for the label anchor above the pin. */
      _labelOffset = 0.5;
      /** Optional clip predicate — markers whose position fails it are hidden. */
      _clipFilter = null;
      constructor(scene) {
        this.scene = scene;
        this.group = new THREE5__namespace.Group();
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
        this.labelMode = this._displaySettings.markerLabelMode ?? "hover";
        this.clear();
        if (worldBox && !worldBox.isEmpty()) {
          const size = new THREE5__namespace.Vector3();
          worldBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          this._labelOffset = Math.max(0.2, Math.min(4, maxDim * 0.01));
        }
        const pinScale = PIN_BASE_SCALE * this._displaySettings.markerSphereScale;
        cameras.forEach((cam, i) => {
          if (!cam.position) return;
          const { x, y, z } = cam.position;
          const pin = this._makePin(MARKER_COLOR_DEFAULT, pinScale);
          pin.position.set(x, y, z);
          pin.userData = { cameraIndex: i, cameraData: cam };
          this.group.add(pin);
          const label = this._makeLabel(cam.name);
          label.position.set(x, y, z + this._labelOffset);
          label.visible = this.labelMode === "always";
          this.group.add(label);
          this.entries.push({ pin, label });
        });
        this._applyAllMarkerVisibility();
      }
      /**
       * Hide panorama markers whose camera position falls outside the kept clip
       * region. Pass `null` to clear the filter (all markers visible). The predicate
       * is typically `ClipManager.isPointVisible`.
       */
      applyClipFilter(predicate) {
        this._clipFilter = predicate;
        this._applyAllMarkerVisibility();
      }
      /** Whether a marker survives the active clip filter. */
      _passesClip(idx) {
        if (!this._clipFilter) return true;
        const cam = this._cameras[idx];
        if (!cam?.position) return true;
        return this._clipFilter(new THREE5__namespace.Vector3(cam.position.x, cam.position.y, cam.position.z));
      }
      _applyAllMarkerVisibility() {
        for (let i = 0; i < this.entries.length; i++) {
          const entry = this.entries[i];
          const pass = this._passesClip(i);
          entry.pin.visible = pass;
          entry.label.visible = pass && this._labelShouldShow(i);
        }
      }
      /** Lazily build (and cache) the shared circular pin texture. */
      _getPinTexture() {
        if (this._pinTexture) return this._pinTexture;
        const S = 64;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        const c = S / 2;
        ctx.beginPath();
        ctx.arc(c, c, S * 0.46, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c, c, S * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(20,20,20,0.85)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c, c, S * 0.27, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        const tex = new THREE5__namespace.CanvasTexture(canvas);
        tex.minFilter = THREE5__namespace.LinearFilter;
        this._pinTexture = tex;
        return tex;
      }
      _makePin(color, scale) {
        const mat = new THREE5__namespace.SpriteMaterial({
          map: this._getPinTexture(),
          color,
          sizeAttenuation: false,
          // constant on-screen size at any zoom
          depthTest: false,
          // always visible through the point cloud
          depthWrite: false,
          transparent: true,
          opacity: this._displaySettings.markerSphereOpacity
        });
        const sprite = new THREE5__namespace.Sprite(mat);
        sprite.scale.set(scale, scale, 1);
        return sprite;
      }
      _makeLabel(text) {
        const W = 200;
        const H = 48;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(15,15,15,0.55)";
        ctx.beginPath();
        ctx.roundRect(0, 0, W, H, 8);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "500 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text.substring(0, 22), W / 2, H / 2 + 1);
        const tex = new THREE5__namespace.CanvasTexture(canvas);
        tex.minFilter = THREE5__namespace.LinearFilter;
        const mat = new THREE5__namespace.SpriteMaterial({
          map: tex,
          sizeAttenuation: false,
          // constant on-screen size — never huge
          depthTest: false,
          depthWrite: false,
          transparent: true
        });
        const sprite = new THREE5__namespace.Sprite(mat);
        const ls = this._displaySettings.markerLabelScale;
        const h = 0.05 * ls;
        sprite.scale.set(h * (W / H), h, 1);
        return sprite;
      }
      /** Update pin color by index */
      _recolor(idx, color) {
        const entry = this.entries[idx];
        if (!entry) return;
        entry.pin.material.color.setHex(color);
      }
      /** Resolve whether a marker's label should be visible under the current mode. */
      _labelShouldShow(idx) {
        if (this.labelMode === "always") return true;
        if (this.labelMode === "hidden") return false;
        return idx === this.hoveredIdx || idx === this.selectedIdx;
      }
      _applyLabelVisibility(idx) {
        const entry = this.entries[idx];
        if (!entry) return;
        entry.label.visible = this._passesClip(idx) && this._labelShouldShow(idx);
      }
      setVisible(visible) {
        this.group.visible = visible;
      }
      /** Return pin sprites for raycasting (one per camera, index order) */
      getMeshes() {
        return this.entries.map((e) => e.pin);
      }
      setHovered(idx) {
        if (this.hoveredIdx === idx) return;
        const prev = this.hoveredIdx;
        this.hoveredIdx = idx;
        if (prev >= 0 && prev !== this.selectedIdx) {
          this._recolor(prev, MARKER_COLOR_DEFAULT);
          this._applyLabelVisibility(prev);
        }
        if (idx >= 0 && idx !== this.selectedIdx) {
          this._recolor(idx, MARKER_COLOR_HOVER);
          this._applyLabelVisibility(idx);
        }
      }
      setSelected(idx) {
        const prev = this.selectedIdx;
        this.selectedIdx = idx;
        if (prev >= 0) {
          this._recolor(prev, prev === this.hoveredIdx ? MARKER_COLOR_HOVER : MARKER_COLOR_DEFAULT);
          this._applyLabelVisibility(prev);
        }
        if (idx >= 0) {
          this._recolor(idx, MARKER_COLOR_SELECTED);
          this._applyLabelVisibility(idx);
        }
      }
      clear() {
        for (const { pin, label } of this.entries) {
          pin.material.dispose();
          this.group.remove(pin);
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
        this._pinTexture?.dispose();
        this._pinTexture = void 0;
        this.scene.remove(this.group);
      }
    };
    _idCounter = 0;
    COLORS = {
      point: "#DCD546",
      distance: "#DCD546",
      height: "#9B94FF",
      area: "#4ADE80",
      volume: "#F97316",
      angle: "#EC4899",
      profile: "#22D3EE"
    };
    exports.MeasurementManager = class {
      scene;
      group;
      measurements = /* @__PURE__ */ new Map();
      _displaySettings = exports.DISPLAY_PRESETS.standard;
      onChange;
      // Active drawing state
      activeMeasurement = null;
      previewLine = null;
      // Snap preview — cursor indicator + rubber-band line to show where the
      // next point will land before the user clicks. The indicator is a constant
      // on-screen crosshair sprite (not a ball) for precise targeting.
      _snapCross = null;
      _snapLine = null;
      _crossTexture;
      constructor(scene) {
        this.scene = scene;
        this.group = new THREE5__namespace.Group();
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
          const newObjects = m.box ? this.buildVolumeBoxObjects(m, new THREE5__namespace.Box3(
            new THREE5__namespace.Vector3(m.box.min[0], m.box.min[1], m.box.min[2]),
            new THREE5__namespace.Vector3(m.box.max[0], m.box.max[1], m.box.max[2])
          )) : this.buildObjects(m);
          this.measurements.set(id, { data: m, objects: newObjects });
        }
      }
      /** Dispose geometry/materials and remove objects from the group */
      _disposeObjects(objects) {
        objects.forEach((o) => {
          if (o instanceof THREE5__namespace.Mesh || o instanceof THREE5__namespace.Line || o instanceof THREE5__namespace.LineSegments) {
            o.geometry.dispose();
            o.material.dispose();
          } else if (o instanceof THREE5__namespace.Sprite) {
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
        const c = new THREE5__namespace.Color(color ?? this.activeMeasurement?.color ?? "#DCD546");
        if (!this._snapCross) {
          const mat = new THREE5__namespace.SpriteMaterial({
            map: this._getCrossTexture(),
            color: c,
            sizeAttenuation: false,
            // constant pixel size at any zoom
            depthTest: false,
            // always visible through the cloud
            depthWrite: false,
            transparent: true
          });
          this._snapCross = new THREE5__namespace.Sprite(mat);
          this._snapCross.scale.set(0.05, 0.05, 1);
          this._snapCross.renderOrder = 5;
          this.group.add(this._snapCross);
        }
        this._snapCross.position.copy(worldPos);
        this._snapCross.material.color.copy(c);
        const lastPt = this.activeMeasurement?.points[this.activeMeasurement.points.length - 1];
        if (lastPt) {
          if (this._snapLine) {
            const positions = this._snapLine.geometry.attributes.position;
            positions.setXYZ(0, lastPt.x, lastPt.y, lastPt.z);
            positions.setXYZ(1, worldPos.x, worldPos.y, worldPos.z);
            positions.needsUpdate = true;
          } else {
            const geo = new THREE5__namespace.BufferGeometry().setFromPoints([lastPt, worldPos]);
            const mat = new THREE5__namespace.LineDashedMaterial({
              color: c,
              depthTest: false,
              transparent: true,
              opacity: 0.5,
              dashSize: 0.3,
              gapSize: 0.15
            });
            this._snapLine = new THREE5__namespace.Line(geo, mat);
            this._snapLine.computeLineDistances();
            this._snapLine.renderOrder = 3;
            this.group.add(this._snapLine);
          }
        } else if (!this.activeMeasurement && !lastPt) ;
      }
      /** Build (and cache) the stylized crosshair sprite texture. */
      _getCrossTexture() {
        if (this._crossTexture) return this._crossTexture;
        const S = 64;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        const c = S / 2;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        const gap = 6;
        const arm = 22;
        ctx.beginPath();
        ctx.moveTo(c - arm, c);
        ctx.lineTo(c - gap, c);
        ctx.moveTo(c + gap, c);
        ctx.lineTo(c + arm, c);
        ctx.moveTo(c, c - arm);
        ctx.lineTo(c, c - gap);
        ctx.moveTo(c, c + gap);
        ctx.lineTo(c, c + arm);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(c, c, 2.5, 0, Math.PI * 2);
        ctx.stroke();
        const tex = new THREE5__namespace.CanvasTexture(canvas);
        tex.minFilter = THREE5__namespace.LinearFilter;
        this._crossTexture = tex;
        return tex;
      }
      /** Hide the snap preview (call on mouse leave or tool deactivation) */
      clearSnap() {
        if (this._snapCross) {
          this._snapCross.material.dispose();
          this.group.remove(this._snapCross);
          this._snapCross = null;
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
            if (o instanceof THREE5__namespace.Mesh || o instanceof THREE5__namespace.LineSegments) {
              o.geometry.dispose();
              o.material.dispose();
            }
          });
          this.group.remove(this._volumeDraft);
          this._volumeDraft = null;
        }
        if (!box || box.isEmpty()) return;
        const draftGroup = new THREE5__namespace.Group();
        const center = new THREE5__namespace.Vector3();
        const size = new THREE5__namespace.Vector3();
        box.getCenter(center);
        box.getSize(size);
        const c = new THREE5__namespace.Color(COLORS.volume);
        const fillGeo = new THREE5__namespace.BoxGeometry(1, 1, 1);
        const fillMat = new THREE5__namespace.MeshBasicMaterial({
          color: c,
          opacity: 0.1,
          transparent: true,
          depthWrite: false,
          depthTest: false
        });
        const fill = new THREE5__namespace.Mesh(fillGeo, fillMat);
        fill.position.copy(center);
        fill.scale.copy(size);
        fill.renderOrder = 1;
        draftGroup.add(fill);
        const edgesGeo = new THREE5__namespace.EdgesGeometry(new THREE5__namespace.BoxGeometry(1, 1, 1));
        const edgesMat = new THREE5__namespace.LineBasicMaterial({ color: c, depthTest: false, transparent: true, opacity: 0.6 });
        const edges = new THREE5__namespace.LineSegments(edgesGeo, edgesMat);
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
        const size = new THREE5__namespace.Vector3();
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
        const color = new THREE5__namespace.Color(m.color);
        const center = new THREE5__namespace.Vector3();
        const size = new THREE5__namespace.Vector3();
        box.getCenter(center);
        box.getSize(size);
        const fillGeo = new THREE5__namespace.BoxGeometry(1, 1, 1);
        const fillMat = new THREE5__namespace.MeshBasicMaterial({
          color,
          opacity: 0.12,
          transparent: true,
          depthWrite: false,
          depthTest: false
        });
        const fill = new THREE5__namespace.Mesh(fillGeo, fillMat);
        fill.position.copy(center);
        fill.scale.copy(size);
        fill.renderOrder = 1;
        this.group.add(fill);
        objects.push(fill);
        const edgesGeo = new THREE5__namespace.EdgesGeometry(new THREE5__namespace.BoxGeometry(1, 1, 1));
        const edgesMat = new THREE5__namespace.LineBasicMaterial({ color, depthTest: false });
        const edges = new THREE5__namespace.LineSegments(edgesGeo, edgesMat);
        edges.position.copy(center);
        edges.scale.copy(size);
        edges.renderOrder = 2;
        this.group.add(edges);
        objects.push(edges);
        const text = formatVolume(m.value);
        const sprite = this.makeTextSprite(text, m.color);
        sprite.position.copy(center).add(new THREE5__namespace.Vector3(0, 0, size.z / 2 + 0.5));
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
        const box = new THREE5__namespace.Box3();
        pts.forEach((p) => box.expandByPoint(p));
        const size = new THREE5__namespace.Vector3();
        box.getSize(size);
        return size.x * size.y * size.z;
      }
      buildObjects(m) {
        const objects = [];
        const color = new THREE5__namespace.Color(m.color);
        const pts = m.points;
        pts.forEach((p) => {
          const geo = new THREE5__namespace.SphereGeometry(this._displaySettings.measurementSphereRadius, 8, 6);
          const mat = new THREE5__namespace.MeshBasicMaterial({ color, depthTest: false });
          const mesh = new THREE5__namespace.Mesh(geo, mat);
          mesh.position.copy(p);
          mesh.renderOrder = 2;
          this.group.add(mesh);
          objects.push(mesh);
        });
        if (pts.length >= 2) {
          const lineType = m.type === "height" ? "vertical" : "direct";
          if (lineType === "vertical" && m.type === "height") {
            const geo = new THREE5__namespace.BufferGeometry().setFromPoints([
              pts[0],
              new THREE5__namespace.Vector3(pts[0].x, pts[0].y, pts[1].z)
            ]);
            const mat = new THREE5__namespace.LineBasicMaterial({ color, depthTest: false });
            const line = new THREE5__namespace.Line(geo, mat);
            line.renderOrder = 1;
            this.group.add(line);
            objects.push(line);
          } else {
            for (let i = 0; i < pts.length - 1; i++) {
              const geo = new THREE5__namespace.BufferGeometry().setFromPoints([pts[i], pts[i + 1]]);
              const mat = new THREE5__namespace.LineBasicMaterial({ color, depthTest: false });
              const line = new THREE5__namespace.Line(geo, mat);
              line.renderOrder = 1;
              this.group.add(line);
              objects.push(line);
            }
            if (m.type === "area" && pts.length >= 3) {
              const geo = new THREE5__namespace.BufferGeometry().setFromPoints([pts[pts.length - 1], pts[0]]);
              const mat = new THREE5__namespace.LineBasicMaterial({ color, depthTest: false });
              this.group.add(new THREE5__namespace.Line(geo, mat));
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
              text = formatVolume(m.value);
              break;
            case "point": {
              const p = pts[0];
              text = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
              break;
            }
          }
          if (text) {
            const sprite = this.makeTextSprite(text, m.color);
            const mid = pts.reduce((a, b) => a.clone().add(b), new THREE5__namespace.Vector3()).divideScalar(pts.length);
            sprite.position.copy(mid).add(new THREE5__namespace.Vector3(0, 0, 1));
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
        const tex = new THREE5__namespace.CanvasTexture(canvas);
        return new THREE5__namespace.Sprite(new THREE5__namespace.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      }
      rebuildPreview() {
        this.clearPreview();
        if (!this.activeMeasurement || this.activeMeasurement.points.length < 1) return;
        const pts = this.activeMeasurement.points;
        const geo = new THREE5__namespace.BufferGeometry().setFromPoints(pts);
        const mat = new THREE5__namespace.LineBasicMaterial({
          color: new THREE5__namespace.Color(this.activeMeasurement.color),
          depthTest: false,
          transparent: true,
          opacity: 0.7
        });
        this.previewLine = new THREE5__namespace.Line(geo, mat);
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
        this._crossTexture?.dispose();
        this._crossTexture = void 0;
        this.scene.remove(this.group);
      }
    };
    VIEW_DIRECTIONS = {
      top: { pos: new THREE5__namespace.Vector3(0, 0, 1), up: new THREE5__namespace.Vector3(0, 1, 0) },
      front: { pos: new THREE5__namespace.Vector3(0, -1, 0), up: new THREE5__namespace.Vector3(0, 0, 1) },
      side: { pos: new THREE5__namespace.Vector3(1, 0, 0), up: new THREE5__namespace.Vector3(0, 0, 1) },
      back: { pos: new THREE5__namespace.Vector3(0, 1, 0), up: new THREE5__namespace.Vector3(0, 0, 1) },
      custom: { pos: new THREE5__namespace.Vector3(0, 0, 1), up: new THREE5__namespace.Vector3(0, 1, 0) }
    };
    exports.ExportManager = class {
      sceneManager;
      constructor(sceneManager) {
        this.sceneManager = sceneManager;
      }
      /** Capture an orthographic view and return as data URL */
      async capture(options) {
        const { view, scale, background, format, quality = 0.95 } = options;
        const { scene, renderer } = this.sceneManager;
        const box = new THREE5__namespace.Box3();
        scene.traverse((obj) => {
          if (obj instanceof THREE5__namespace.Mesh || obj.name === "pointcloud") {
            try {
              box.expandByObject(obj);
            } catch {
            }
          }
        });
        const size = new THREE5__namespace.Vector3();
        const center = new THREE5__namespace.Vector3();
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
        const orthoCamera = new THREE5__namespace.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.01, 1e5);
        orthoCamera.position.copy(center).addScaledVector(dir.pos, halfH * 3);
        orthoCamera.up.copy(dir.up);
        orthoCamera.lookAt(center);
        orthoCamera.updateMatrixWorld();
        const rt = new THREE5__namespace.WebGLRenderTarget(outW, outH, {
          minFilter: THREE5__namespace.LinearFilter,
          magFilter: THREE5__namespace.LinearFilter,
          format: THREE5__namespace.RGBAFormat
        });
        const prevBg = scene.background;
        if (background === "white") scene.background = new THREE5__namespace.Color(16777215);
        else if (background === "black") scene.background = new THREE5__namespace.Color(0);
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
    exports.MinimapRenderer = class {
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
        this.orthoCamera = new THREE5__namespace.OrthographicCamera(-50, 50, 50, -50, -1e4, 1e4);
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
          this.miniRenderer = new THREE5__namespace.WebGLRenderer({
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
        const size = new THREE5__namespace.Vector3();
        const center = new THREE5__namespace.Vector3();
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
        const dir = new THREE5__namespace.Vector3();
        cam.getWorldDirection(dir);
        const cx = this._worldToCanvasX(cam.position.x);
        const cy = this._worldToCanvasY(cam.position.y);
        const angle = Math.atan2(-dir.y, dir.x);
        const fovLen = 28;
        const halfFov = THREE5__namespace.MathUtils.degToRad(cam.fov * 0.5 * (1 / Math.max(cam.aspect, 0.1)));
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
        return new THREE5__namespace.Vector2(wx, wy);
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
    AXIS_COLOR = {
      x: 15680580,
      y: 2278750,
      z: 3900150
    };
    HANDLE_HOVER_COLOR = 16777215;
    HANDLE_DRAG_COLOR = 16347926;
    FaceHandleController = class {
      scene;
      camera;
      domElement;
      handles = [];
      box = null;
      onChange = null;
      drag = null;
      hoveredHandle = null;
      raycaster = new THREE5__namespace.Raycaster();
      group;
      disposed = false;
      /** Orientation of the box (full 3-axis rotation). */
      _quaternion = new THREE5__namespace.Quaternion();
      constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;
        this.group = new THREE5__namespace.Group();
        this.group.name = "face-handles";
        this.scene.add(this.group);
        this.createHandles();
      }
      createHandles() {
        const axes = ["x", "y", "z"];
        const signs = [1, -1];
        const geo = new THREE5__namespace.SphereGeometry(1, 12, 8);
        for (const axis of axes) {
          for (const sign of signs) {
            const mat = new THREE5__namespace.MeshBasicMaterial({
              color: AXIS_COLOR[axis],
              transparent: true,
              opacity: 0.95,
              depthTest: false
            });
            const mesh = new THREE5__namespace.Mesh(geo, mat);
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
      /** Set the box's orientation (full 3-axis) so handles follow it. */
      setQuaternion(q) {
        this._quaternion.copy(q);
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
      /** Show/hide the whole handle group without detaching (keeps box binding). */
      setGroupVisible(visible) {
        this.group.visible = visible;
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
        const center = new THREE5__namespace.Vector3();
        const size = new THREE5__namespace.Vector3();
        this.box.getCenter(center);
        this.box.getSize(size);
        const diag = size.length();
        const radius = Math.max(0.08, Math.min(diag * 0.03, 3));
        for (const h of this.handles) {
          const offset = new THREE5__namespace.Vector3();
          if (h.sign === 1) {
            offset[h.axis] = this.box.max[h.axis] - center[h.axis];
          } else {
            offset[h.axis] = this.box.min[h.axis] - center[h.axis];
          }
          const half = Math.abs(offset[h.axis]);
          offset[h.axis] += h.sign * (half * 0.12 + radius * 1.5);
          offset.applyQuaternion(this._quaternion);
          h.mesh.position.set(center.x + offset.x, center.y + offset.y, center.z + offset.z);
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
        const cameraDir = new THREE5__namespace.Vector3();
        this.camera.getWorldDirection(cameraDir);
        const plane = new THREE5__namespace.Plane().setFromNormalAndCoplanarPoint(
          cameraDir.negate(),
          handle.mesh.position.clone()
        );
        this.setRaycasterFromClient(clientX, clientY);
        const startIntersect = new THREE5__namespace.Vector3();
        if (!this.raycaster.ray.intersectPlane(plane, startIntersect)) return false;
        const startCenter = new THREE5__namespace.Vector3();
        const startSize = new THREE5__namespace.Vector3();
        this.box.getCenter(startCenter);
        this.box.getSize(startSize);
        this.drag = {
          handle,
          plane,
          startIntersect,
          startCenter,
          startSize,
          worldAxis: this.worldAxisFor(handle.axis)
        };
        this.setHandleColor(handle, HANDLE_DRAG_COLOR);
        return true;
      }
      /** World-space unit vector for a box-local face axis, rotated by the box orientation. */
      worldAxisFor(axis) {
        const local = new THREE5__namespace.Vector3(
          axis === "x" ? 1 : 0,
          axis === "y" ? 1 : 0,
          axis === "z" ? 1 : 0
        );
        return local.applyQuaternion(this._quaternion);
      }
      /** Update the box during a drag. Call on pointermove. */
      onPointerMove(clientX, clientY) {
        if (!this.drag || !this.box) return;
        this.setRaycasterFromClient(clientX, clientY);
        const currentIntersect = new THREE5__namespace.Vector3();
        if (!this.raycaster.ray.intersectPlane(this.drag.plane, currentIntersect)) return;
        const axis = this.drag.handle.axis;
        const s = this.drag.handle.sign;
        const worldDelta = currentIntersect.clone().sub(this.drag.startIntersect);
        const delta = worldDelta.dot(this.drag.worldAxis);
        const MIN_SIZE = 0.1;
        const startSizeA = this.drag.startSize[axis];
        const newSizeA = Math.max(MIN_SIZE, startSizeA + s * delta);
        const grow = newSizeA - startSizeA;
        const center = this.drag.startCenter.clone().addScaledVector(this.drag.worldAxis, s * grow / 2);
        const size = this.drag.startSize.clone();
        size[axis] = newSizeA;
        const half = size.clone().multiplyScalar(0.5);
        this.box.min.copy(center).sub(half);
        this.box.max.copy(center).add(half);
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
        this.raycaster.setFromCamera(new THREE5__namespace.Vector2(nx, ny), this.camera);
      }
      setHandleColor(handle, color) {
        handle.mesh.material.color.setHex(color);
      }
    };
    _nextId = 1;
    exports.ClipManager = class {
      sm;
      entries = [];
      helpers = /* @__PURE__ */ new Map();
      fills = /* @__PURE__ */ new Map();
      draftHelper = null;
      selectedId = null;
      /** Move gizmo (translate arrows) — used in "translate" transform mode. */
      tcMove = null;
      /** Rotate gizmo (full XYZ rings) — used in "rotate" transform mode. */
      tcRotate = null;
      pivot = null;
      _faceHandles = null;
      /** Active transform mode for the selected box (move / scale / rotate). */
      _transformMode = "scale";
      /** Global clipping enable flag. When false, boxes stay visible but no clipping is applied. */
      _enabled = true;
      /** Whether box outlines / fills / handles render at all (off = clean screenshots). */
      _outlinesVisible = true;
      onChange;
      onSelectChange;
      constructor(sm) {
        this.sm = sm;
      }
      async initTransformControls() {
        if (this.tcMove && this.tcRotate) return;
        const { TransformControls } = await import('three/examples/jsm/controls/TransformControls.js');
        const makeTc = (mode, size) => {
          const tc = new TransformControls(this.sm.camera, this.sm.renderer.domElement);
          tc.setSpace("world");
          tc.setMode(mode);
          tc.setSize(size);
          tc.addEventListener("change", () => this.syncFromPivot());
          tc.addEventListener("dragging-changed", (e) => {
            this.sm.controls.enabled = !e.value;
          });
          this.sm.scene.add(tc.getHelper());
          return tc;
        };
        this.tcMove = makeTc("translate", 0.8);
        this.tcRotate = makeTc("rotate", 1.1);
        this._raiseGizmo();
      }
      /**
       * Force the TransformControls gizmos to render on top of the point cloud.
       * The gizmos use default materials (depthTest=true, renderOrder=0) so they are
       * occluded by the dense cloud. Traverse each gizmo tree and disable depth
       * testing so the arrows/rings draw through.
       */
      _raiseGizmo() {
        for (const tc of [this.tcMove, this.tcRotate]) {
          const helper = tc?.getHelper?.();
          if (!helper) continue;
          helper.traverse((child) => {
            if (!child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const m of mats) {
              m.depthTest = false;
              m.depthWrite = false;
              m.transparent = true;
            }
            child.renderOrder = 5;
          });
        }
      }
      /**
       * Build an axis-aligned box centered on the current view target, sized to sit
       * comfortably INSIDE the viewport at the current camera distance, then clamped
       * to the cloud bounds. This replaces the old behavior of spanning the whole
       * world box, which routinely extended far outside the viewport (and dwarfed
       * the resize handles). The result is always fully visible and easy to grab.
       */
      makeViewportBox(worldBox) {
        const cam = this.sm.camera;
        const target = this.sm.controls.target.clone();
        const dist = cam.position.distanceTo(target) || 1;
        const vfov = THREE5__namespace.MathUtils.degToRad(cam.fov || 50);
        const halfH = Math.tan(vfov / 2) * dist;
        const halfW = halfH * (cam.aspect || 1);
        let half = Math.min(halfH, halfW) * 0.45;
        let halfZ = half * 0.6;
        if (worldBox && !worldBox.isEmpty()) {
          const ws = new THREE5__namespace.Vector3();
          worldBox.getSize(ws);
          half = Math.min(half, ws.x * 0.5, ws.y * 0.5);
          halfZ = Math.min(halfZ, ws.z * 0.5);
          target.clamp(worldBox.min, worldBox.max);
        }
        half = Math.max(half, 0.25);
        halfZ = Math.max(halfZ, 0.15);
        return new THREE5__namespace.Box3(
          new THREE5__namespace.Vector3(target.x - half, target.y - half, target.z - halfZ),
          new THREE5__namespace.Vector3(target.x + half, target.y + half, target.z + halfZ)
        );
      }
      /**
       * Add a clip box sized to fit the current viewport (see {@link makeViewportBox}).
       * Preferred over `addBox(worldBox.clone())` for the "create default box" action.
       */
      addDefaultBox(worldBox, name) {
        return this.addBox(this.makeViewportBox(worldBox), name);
      }
      addBox(box, name) {
        const id = genId();
        const entry = {
          id,
          name: name ?? `Box ${this.entries.length + 1}`,
          box: box.clone(),
          mode: "outside",
          visible: true,
          quaternion: new THREE5__namespace.Quaternion()
        };
        this.entries.push(entry);
        this.updateHelper(entry);
        this.applyAll();
        this.onChange?.(this.getBoxes());
        return entry;
      }
      async selectBox(id) {
        this._highlightHelper(this.selectedId, false);
        this._detachGizmos();
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
        const center = new THREE5__namespace.Vector3();
        const size = new THREE5__namespace.Vector3();
        entry.box.getCenter(center);
        entry.box.getSize(size);
        const geo = new THREE5__namespace.BoxGeometry(1, 1, 1);
        const mat = new THREE5__namespace.MeshBasicMaterial({ visible: false });
        this.pivot = new THREE5__namespace.Mesh(geo, mat);
        this.pivot.position.copy(center);
        this.pivot.scale.copy(size);
        this.pivot.quaternion.copy(entry.quaternion);
        this.pivot.userData.clipId = id;
        this.sm.scene.add(this.pivot);
        if (!this._faceHandles) {
          this._faceHandles = new FaceHandleController(
            this.sm.scene,
            this.sm.camera,
            this.sm.renderer.domElement
          );
        }
        this._applyTransformMode();
        this._applyOutlineVisibility();
        this._highlightHelper(id, true);
      }
      /** Switch the active transform mode for the selected box (move/scale/rotate). */
      setTransformMode(mode) {
        this._transformMode = mode;
        this._applyTransformMode();
      }
      getTransformMode() {
        return this._transformMode;
      }
      /** Get the face handle controller (for viewport event forwarding) */
      get faceHandles() {
        return this._faceHandles;
      }
      /** Attach the face-resize handles to the selected box with the sync callback. */
      _attachFaceHandles(entry) {
        if (!this._faceHandles) return;
        this._faceHandles.setQuaternion(entry.quaternion);
        this._faceHandles.attach(entry.box, () => {
          this.updateHelper(entry);
          this.applyAll();
          if (this.pivot) {
            const c = new THREE5__namespace.Vector3();
            const s = new THREE5__namespace.Vector3();
            entry.box.getCenter(c);
            entry.box.getSize(s);
            this.pivot.position.copy(c);
            this.pivot.scale.copy(s);
          }
          this.onChange?.(this.getBoxes());
        });
      }
      /**
       * Show only the handles for the active mode:
       * - `scale` → 6 face-resize spheres (no gizmos),
       * - `translate` → move arrows,
       * - `rotate` → full XYZ rotation rings.
       * Keeping a single set active avoids overlapping handles grabbing each other.
       */
      _applyTransformMode() {
        if (!this.pivot || !this.selectedId) return;
        const move = this.tcMove;
        const rotate = this.tcRotate;
        const entry = this.entries.find((e) => e.id === this.selectedId);
        if (this._transformMode === "scale") {
          move?.detach();
          rotate?.detach();
          if (entry) {
            if (!this._faceHandles?.isAttached()) this._attachFaceHandles(entry);
            this._faceHandles?.setGroupVisible(true);
            this._faceHandles?.updatePositions();
          }
        } else if (this._transformMode === "translate") {
          rotate?.detach();
          this._faceHandles?.detach();
          if (move) {
            move.attach(this.pivot);
            move.showX = move.showY = move.showZ = true;
          }
          this._raiseGizmo();
        } else {
          move?.detach();
          this._faceHandles?.detach();
          if (rotate) {
            rotate.attach(this.pivot);
            rotate.showX = rotate.showY = rotate.showZ = true;
          }
          this._raiseGizmo();
        }
      }
      /** Detach both gizmos. */
      _detachGizmos() {
        this.tcMove?.detach();
        this.tcRotate?.detach();
      }
      /**
       * Reset a box's orientation back to axis-aligned (identity rotation). Targets
       * the given box, or the selected one when omitted.
       */
      resetRotation(id) {
        const targetId = id ?? this.selectedId;
        if (!targetId) return;
        const entry = this.entries.find((e) => e.id === targetId);
        if (!entry) return;
        entry.quaternion.identity();
        if (this.selectedId === targetId) {
          this.pivot?.quaternion.identity();
          this._faceHandles?.setQuaternion(entry.quaternion);
        }
        this.updateHelper(entry);
        this.applyAll();
        this.onChange?.(this.getBoxes());
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
          this._detachGizmos();
          this._faceHandles?.detach();
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
      /**
       * Set the clip mode for ALL boxes at once. potree-core only supports a single
       * global clip mode, so boxes must never diverge — use this instead of
       * per-box setBoxMode when changing the effective mode.
       */
      setModeAll(mode) {
        for (const entry of this.entries) {
          entry.mode = mode;
        }
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      /**
       * Globally enable/disable clipping without removing any boxes. When disabled,
       * boxes remain visible as wireframes/fills but no actual clipping is applied.
       */
      setEnabled(enabled) {
        this._enabled = enabled;
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      isEnabled() {
        return this._enabled;
      }
      /**
       * Whether a world-space point survives the current clipping (i.e. is part of
       * the kept/visible region). Used to cull out-of-bounds panorama markers and to
       * reject picks on clipped-away points. Returns true when clipping is off or
       * there are no visible boxes.
       */
      isPointVisible(p) {
        if (!this._enabled) return true;
        const visible = this.entries.filter((e) => e.visible);
        if (visible.length === 0) return true;
        const insideAny = visible.some((e) => this._pointInBox(p, e));
        return visible[0].mode === "outside" ? insideAny : !insideAny;
      }
      /** Point-in-(rotated)-box test using the entry's center, size and quaternion. */
      _pointInBox(p, entry) {
        const center = new THREE5__namespace.Vector3();
        const size = new THREE5__namespace.Vector3();
        entry.box.getCenter(center);
        entry.box.getSize(size);
        const local = p.clone().sub(center).applyQuaternion(entry.quaternion.clone().invert());
        return Math.abs(local.x) <= size.x / 2 && Math.abs(local.y) <= size.y / 2 && Math.abs(local.z) <= size.z / 2;
      }
      /**
       * Globally show/hide ALL box outlines, fills, handles and gizmos WITHOUT
       * affecting clipping — clipping stays active so you keep the cropped view but
       * get a clean image (e.g. for screenshots). Per-box visibility still applies
       * when outlines are on.
       */
      setOutlinesVisible(visible) {
        this._outlinesVisible = visible;
        this._applyOutlineVisibility();
      }
      areOutlinesVisible() {
        return this._outlinesVisible;
      }
      /** Apply the global outline flag (and per-box visibility) to all scene objects. */
      _applyOutlineVisibility() {
        const show = this._outlinesVisible;
        for (const entry of this.entries) {
          const helper = this.helpers.get(entry.id);
          if (helper) helper.visible = show && entry.visible;
          const fill = this.fills.get(entry.id);
          if (fill) fill.visible = show && entry.visible;
        }
        const selected = show && this.selectedId !== null;
        if (selected) {
          this._applyTransformMode();
        } else {
          this._detachGizmos();
          this._faceHandles?.setGroupVisible(false);
        }
      }
      setBoxVisible(id, visible) {
        const entry = this.entries.find((e) => e.id === id);
        if (!entry) return;
        entry.visible = visible;
        const helper = this.helpers.get(id);
        if (helper) helper.visible = visible && this._outlinesVisible;
        const fill = this.fills.get(id);
        if (fill) fill.visible = visible && this._outlinesVisible;
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
          this.draftHelper = new THREE5__namespace.Box3Helper(box, new THREE5__namespace.Color(14472518));
          this.draftHelper.material.transparent = true;
          this.draftHelper.material.opacity = 0.6;
          this.draftHelper.renderOrder = 3;
          this.sm.scene.add(this.draftHelper);
        }
      }
      clear() {
        this._detachGizmos();
        this._faceHandles?.detach();
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
        for (const tc of [this.tcMove, this.tcRotate]) {
          if (!tc) continue;
          this.sm.scene.remove(tc.getHelper());
          tc.dispose();
        }
        this.tcMove = null;
        this.tcRotate = null;
        if (this._faceHandles) {
          this._faceHandles.dispose();
          this._faceHandles = null;
        }
      }
      syncFromPivot() {
        if (!this.pivot || !this.selectedId) return;
        const entry = this.entries.find((e) => e.id === this.selectedId);
        if (!entry) return;
        const center = this.pivot.position.clone();
        const halfSize = new THREE5__namespace.Vector3(
          Math.abs(this.pivot.scale.x) * 0.5,
          Math.abs(this.pivot.scale.y) * 0.5,
          Math.abs(this.pivot.scale.z) * 0.5
        );
        entry.box.min.copy(center).sub(halfSize);
        entry.box.max.copy(center).add(halfSize);
        entry.quaternion.copy(this.pivot.quaternion);
        this._faceHandles?.setQuaternion(entry.quaternion);
        this.updateHelper(entry);
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      /**
       * Set wireframe color: selected → bright yellow; deselected → black so the
       * inactive crop boxes recede (and read cleanly on light point clouds).
       */
      _highlightHelper(id, selected) {
        if (!id) return;
        const helper = this.helpers.get(id);
        if (helper) {
          helper.material.color.setHex(
            selected ? 16777028 : 0
          );
        }
      }
      updateHelper(entry) {
        if (!this.helpers.has(entry.id)) {
          const helper2 = new THREE5__namespace.Box3Helper(entry.box, new THREE5__namespace.Color(0));
          helper2.material.linewidth = 1;
          helper2.renderOrder = 3;
          helper2.visible = entry.visible && this._outlinesVisible;
          this.sm.scene.add(helper2);
          this.helpers.set(entry.id, helper2);
        }
        const helper = this.helpers.get(entry.id);
        if (helper) helper.quaternion.copy(entry.quaternion);
        const center = new THREE5__namespace.Vector3();
        const size = new THREE5__namespace.Vector3();
        entry.box.getCenter(center);
        entry.box.getSize(size);
        const existingFill = this.fills.get(entry.id);
        if (existingFill) {
          existingFill.position.copy(center);
          existingFill.scale.copy(size);
          existingFill.quaternion.copy(entry.quaternion);
        } else {
          const fillGeo = new THREE5__namespace.BoxGeometry(1, 1, 1);
          const fillMat = new THREE5__namespace.MeshBasicMaterial({
            color: 14472518,
            opacity: 0.08,
            transparent: true,
            depthWrite: false,
            side: THREE5__namespace.FrontSide
          });
          const fillMesh = new THREE5__namespace.Mesh(fillGeo, fillMat);
          fillMesh.position.copy(center);
          fillMesh.scale.copy(size);
          fillMesh.quaternion.copy(entry.quaternion);
          fillMesh.renderOrder = 2;
          fillMesh.visible = entry.visible && this._outlinesVisible;
          this.sm.scene.add(fillMesh);
          this.fills.set(entry.id, fillMesh);
        }
      }
      applyAll() {
        if (!this._enabled) {
          for (const pc of this.sm.pointClouds) {
            const mat = pc.material;
            if (!mat) continue;
            mat.setClipBoxes([]);
            mat.clipMode = 0;
          }
          return;
        }
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
            const size = new THREE5__namespace.Vector3();
            const center = new THREE5__namespace.Vector3();
            entry.box.getSize(size);
            entry.box.getCenter(center);
            const matrix = new THREE5__namespace.Matrix4().compose(center, entry.quaternion, size);
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
    exports.AxisWidget = class {
      _scene;
      _camera;
      _disposables = [];
      _materials = [];
      sm;
      constructor(sm) {
        this.sm = sm;
        this._scene = new THREE5__namespace.Scene();
        this._scene.background = null;
        this._camera = new THREE5__namespace.PerspectiveCamera(50, 1, 0.1, 100);
        this._buildAxes();
      }
      _buildAxes() {
        const axes = [
          { dir: new THREE5__namespace.Vector3(1, 0, 0), color: 15087942, label: "X" },
          // red
          { dir: new THREE5__namespace.Vector3(0, 1, 0), color: 2792847, label: "Y" },
          // teal
          { dir: new THREE5__namespace.Vector3(0, 0, 1), color: 4553629, label: "Z" }
          // blue
        ];
        for (const axis of axes) {
          const mat = new THREE5__namespace.MeshBasicMaterial({ color: axis.color });
          this._materials.push(mat);
          const quat = new THREE5__namespace.Quaternion().setFromUnitVectors(
            new THREE5__namespace.Vector3(0, 1, 0),
            axis.dir
          );
          const shaftGeo = new THREE5__namespace.CylinderGeometry(0.03, 0.03, 0.65, 6);
          shaftGeo.translate(0, 0.325, 0);
          shaftGeo.applyQuaternion(quat);
          this._scene.add(new THREE5__namespace.Mesh(shaftGeo, mat));
          this._disposables.push(shaftGeo);
          const coneGeo = new THREE5__namespace.ConeGeometry(0.08, 0.2, 8);
          coneGeo.translate(0, 0.76, 0);
          coneGeo.applyQuaternion(quat);
          this._scene.add(new THREE5__namespace.Mesh(coneGeo, mat));
          this._disposables.push(coneGeo);
          const sprite = this._makeLabel(axis.label, axis.color);
          const tipPos = axis.dir.clone().multiplyScalar(1.05);
          sprite.position.copy(tipPos);
          sprite.scale.set(0.28, 0.28, 1);
          this._scene.add(sprite);
        }
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
        const tex = new THREE5__namespace.CanvasTexture(canvas);
        tex.minFilter = THREE5__namespace.LinearFilter;
        const mat = new THREE5__namespace.SpriteMaterial({
          map: tex,
          transparent: true,
          depthTest: false
        });
        this._materials.push(mat);
        return new THREE5__namespace.Sprite(mat);
      }
      /**
       * Render the widget into a scissor region in the bottom-left corner.
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
        const savedVp = new THREE5__namespace.Vector4();
        const savedSc = new THREE5__namespace.Vector4();
        renderer.getViewport(savedVp);
        renderer.getScissor(savedSc);
        const savedScTest = renderer.getScissorTest();
        const savedAutoClear = renderer.autoClear;
        const dist = 3;
        const offset = new THREE5__namespace.Vector3(0, 0, dist).applyQuaternion(
          this.sm.camera.quaternion
        );
        this._camera.position.copy(offset);
        this._camera.up.copy(this.sm.camera.up);
        this._camera.lookAt(0, 0, 0);
        const x = margin;
        const y = margin;
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
          if (m instanceof THREE5__namespace.SpriteMaterial) m.map?.dispose();
          m.dispose();
        }
        this._disposables = [];
        this._materials = [];
      }
    };
    MAX_SCENES = 50;
    _nextId2 = 1;
    exports.PresentationManager = class {
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
    exports.S3SourceAdapter = class {
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
    exports.ElectronSourceAdapter = class {
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
  }
});
function useViewer() {
  const ctx = React25.useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used inside <ViewerProvider>");
  return ctx;
}
function ViewerProvider({ config, children }) {
  const [sceneManager, _setSceneManager] = React25.useState(null);
  const [loader, _setLoader] = React25.useState(null);
  const [measurementManager, _setMeasurementManager] = React25.useState(null);
  const [markerManager, _setMarkerManager] = React25.useState(null);
  const [cameraAnimator, _setCameraAnimator] = React25.useState(null);
  const [exporter, _setExporter] = React25.useState(null);
  const [minimap, _setMinimap] = React25.useState(null);
  const [clipManager, _setClipManager] = React25.useState(null);
  const [activeTool, setActiveTool] = React25.useState("none");
  const [pointBudget, setPointBudget] = React25.useState(config.pointBudget ?? 2e6);
  const [pointSize, setPointSize] = React25.useState(1.5);
  const [fps, setFps] = React25.useState(0);
  const [pointCount, setPointCount] = React25.useState(0);
  const [measurementList, setMeasurementList] = React25.useState([]);
  const [showMarkers, setShowMarkers] = React25.useState(true);
  const [showMinimap, setShowMinimap] = React25.useState(config.showMinimap ?? true);
  const [selectedCamera, setSelectedCamera] = React25.useState(null);
  const [clipBoxEntries, setClipBoxEntries] = React25.useState([]);
  const [selectedClipBoxId, setSelectedClipBoxId] = React25.useState(null);
  const [colorMode, setColorMode] = React25.useState("rgb");
  const [navigationMode, _setNavigationMode] = React25.useState("orbit");
  const [projection, _setProjection] = React25.useState("perspective");
  const [displaySettings, setDisplaySettings] = React25.useState(() => ({
    ...exports.DISPLAY_PRESETS.standard,
    ...config.displaySettings
  }));
  const setNavigationMode = React25.useCallback((mode) => {
    _setNavigationMode(mode);
  }, []);
  const setProjection = React25.useCallback((mode) => {
    _setProjection(mode);
  }, []);
  const setSceneManager = React25.useCallback((sm) => _setSceneManager(sm), []);
  const setLoader = React25.useCallback((l) => _setLoader(l), []);
  const setMeasurementManager = React25.useCallback((m) => _setMeasurementManager(m), []);
  const setMarkerManager = React25.useCallback((m) => _setMarkerManager(m), []);
  const setCameraAnimator = React25.useCallback((a) => _setCameraAnimator(a), []);
  const setExporter = React25.useCallback((e) => _setExporter(e), []);
  const setMinimap = React25.useCallback((r) => _setMinimap(r), []);
  const setClipManager = React25.useCallback((c) => _setClipManager(c), []);
  const uiMode = config.uiMode ?? "professional";
  const [panoEngine, setPanoEngine] = React25.useState(config.panoEngine ?? "photo-sphere-viewer");
  const value = {
    sceneManager,
    loader,
    measurementManager,
    markerManager,
    cameraAnimator,
    exporter,
    minimap,
    clipManager,
    setSceneManager,
    setLoader,
    setMeasurementManager,
    setMarkerManager,
    setCameraAnimator,
    setExporter,
    setMinimap,
    setClipManager,
    activeTool,
    setActiveTool,
    pointBudget,
    setPointBudget,
    pointSize,
    setPointSize,
    fps,
    setFps,
    pointCount,
    setPointCount,
    measurementList,
    setMeasurementList,
    showMarkers,
    setShowMarkers,
    showMinimap,
    setShowMinimap,
    selectedCamera,
    setSelectedCamera,
    clipBoxEntries,
    setClipBoxEntries,
    selectedClipBoxId,
    setSelectedClipBoxId,
    colorMode,
    setColorMode,
    navigationMode,
    setNavigationMode,
    projection,
    setProjection,
    displaySettings,
    setDisplaySettings,
    uiMode,
    panoEngine,
    setPanoEngine,
    config
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ViewerContext.Provider, { value, children });
}
var ViewerContext;
var init_viewer_provider = __esm({
  "src/providers/viewer-provider.tsx"() {
    "use client";
    init_dist();
    ViewerContext = React25.createContext(null);
  }
});
function useData() {
  const ctx = React25.useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
function DataProvider({ adapter, children }) {
  const [cameras, setCameras] = React25.useState([]);
  const [metadata, setMetadata] = React25.useState(null);
  const [loading, setLoading] = React25.useState(true);
  const [error, setError] = React25.useState(null);
  const [rev, setRev] = React25.useState(0);
  React25.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const load = async () => {
      try {
        const [cams, meta] = await Promise.allSettled([
          adapter.fetchJson("cameras.json"),
          adapter.fetchJson("metadata.json")
        ]);
        if (cancelled) return;
        if (cams.status === "fulfilled") {
          const resolved = (cams.value ?? []).map((cam) => ({
            ...cam,
            image: cam.image ? adapter.resolveUrl(cam.image) : null,
            thumbnail: cam.thumbnail ? adapter.resolveUrl(cam.thumbnail) : null
          }));
          setCameras(resolved);
        }
        if (meta.status === "fulfilled") setMetadata(meta.value);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [adapter, rev]);
  const reload = () => setRev((r) => r + 1);
  return /* @__PURE__ */ jsxRuntime.jsx(DataContext.Provider, { value: { cameras, metadata, loading, error, reload }, children });
}
var DataContext;
var init_data_provider = __esm({
  "src/providers/data-provider.tsx"() {
    "use client";
    DataContext = React25.createContext(null);
  }
});

// src/i18n/en.ts
exports.en = void 0;
var init_en = __esm({
  "src/i18n/en.ts"() {
    exports.en = {
      toolbar: {
        viewTop: "Top view",
        viewTopLabel: "T",
        viewFront: "Front view",
        viewFrontLabel: "Fr",
        viewBack: "Back view",
        viewBackLabel: "Bk",
        viewLeft: "Left view",
        viewLeftLabel: "L",
        viewRight: "Right view",
        viewRightLabel: "R",
        viewBottom: "Bottom view",
        viewBottomLabel: "Bt",
        budget: "Budget",
        pointBudgetTitle: (m) => `Point budget: ${m.toFixed(1)}M`,
        size: "Size",
        pointSizeTitle: (s) => `Point size: ${s.toFixed(1)}`,
        panoramas: "Panoramas",
        togglePanoramas: "Toggle panorama markers",
        minimap: "Minimap",
        toggleMinimap: "Toggle minimap",
        clouds: "Clouds",
        cloudSelector: "Point cloud selector",
        theme: "Theme",
        switchToLight: "Switch to light",
        switchToDark: "Switch to dark",
        about: "About",
        sidebar: "Sidebar",
        toggleSidebar: "Toggle sidebar",
        colorMode: "Color mode",
        colorRgb: "RGB",
        colorElevation: "Elevation",
        colorIntensity: "Intensity",
        colorIntensityGradient: "Intensity Gradient",
        colorClassification: "Classification",
        colorReturnNumber: "Return Number",
        colorSource: "Source",
        quality: "Quality",
        qualityPerformance: "Performance",
        qualityBalanced: "Balanced",
        qualityHigh: "High Quality",
        navOrbit: "Orbit",
        navFree: "Free",
        navPan: "Pan",
        navOrbitTitle: "Orbit \u2014 CAD turntable, rotate around target",
        navFreeTitle: "Free rotate \u2014 Blender-style, no up-vector lock",
        navPanTitle: "Pan / Map \u2014 left-drag pans, horizon locked",
        camPerspective: "Persp",
        camOrthographic: "Ortho",
        camPerspectiveTitle: "Perspective camera",
        camOrthographicTitle: "Orthographic camera"
      },
      exportPanel: {
        exportImageTitle: "Export orthographic image",
        title: "Export Image",
        view: "View",
        viewTop: "Top (Plan)",
        viewFront: "Front",
        viewSide: "Side",
        viewBack: "Back",
        scale: "Scale",
        background: "Background",
        bgWhite: "white",
        bgBlack: "black",
        bgTransparent: "\u03B1",
        format: "Format",
        exporting: "Exporting\u2026",
        download: "Download"
      },
      toolRail: {
        measureGroup: "M",
        sectionGroup: "S",
        measurePoint: "Point coordinate",
        measureDistance: "Distance",
        measureHeight: "Height difference",
        measureArea: "Area",
        measureVolume: "Volume",
        measureAngle: "Angle",
        measureProfile: "Profile",
        clearMeasurements: "Clear all measurements",
        drawClipBox: "Draw clip box (drag in viewport)",
        clipModeKeepInside: "Mode: keep inside (click to invert)",
        clipModeKeepOutside: "Mode: keep outside (click to invert)",
        removeClipBox: "Remove clip box"
      },
      sidebar: {
        tabPanoramas: "Panoramas",
        tabScene: "Scene",
        tabMeasurements: "Measurements",
        tabClassification: "Classification",
        tabScenes: "Scenes"
      },
      scenePanel: {
        pointClouds: "Point Clouds",
        noCloudLoaded: "No cloud loaded",
        measurements: "Measurements",
        clearAll: "Clear all",
        none: "None",
        sections: "Sections",
        sectionHint: "Use toolbar to add clipping volumes",
        clipModeNote: "Clip mode applies to all boxes"
      },
      panoPanel: {
        searchPlaceholder: "Search panoramas\u2026",
        noResults: "No panoramas found",
        flyTo: "Fly to"
      },
      classificationPanel: {
        title: "LAS Classes",
        all: "All",
        none: "None",
        classLabels: {
          0: "Never classified",
          1: "Unclassified",
          2: "Ground",
          3: "Low Vegetation",
          4: "Medium Vegetation",
          5: "High Vegetation",
          6: "Building",
          7: "Low Point (Noise)",
          9: "Water",
          17: "Bridge Deck",
          18: "High Noise"
        }
      },
      measurementsPanel: {
        noMeasurements: "No measurements yet.",
        useMeasureToolHint: "Use the toolbar to start measuring.",
        measurementCount: (n) => `${n} measurement${n === 1 ? "" : "s"}`,
        downloadCsv: "Download CSV",
        csv: "CSV",
        clearAll: "Clear all",
        typePoint: "Point",
        typeDistance: "Distance",
        typeHeight: "Height",
        typeArea: "Area",
        typeVolume: "Volume",
        typeAngle: "Angle",
        typeProfile: "Profile"
      },
      viewport: {
        overview: "OVERVIEW",
        hintPoint: "Click to place point \u2022 Esc to cancel",
        hintDistance: "Click 2 points \u2022 Right-click to finish",
        hintHeight: "Click start then end point",
        hintArea: "Click polygon vertices \u2022 Right-click to close",
        hintAngle: "Click 3 points (vertex is middle)",
        hintSectionBox: "Drag to define clipping box",
        initialisingRenderer: "Initialising renderer\u2026",
        statusPts: (m) => `${m.toFixed(1)}M pts`,
        statusBudget: (m) => `Budget: ${m.toFixed(1)}M`,
        statusFps: (fps) => `${fps} fps`
      },
      renderingSettings: {
        title: "Rendering Settings",
        rgbSection: "RGB Adjustments",
        intensitySection: "Intensity Adjustments",
        elevationSection: "Elevation Range",
        generalSection: "General",
        gamma: "Gamma",
        brightness: "Brightness",
        contrast: "Contrast",
        range: "Range",
        elevMin: "Min Z",
        elevMax: "Max Z",
        opacity: "Opacity",
        reset: "Reset to defaults"
      },
      scenesPanel: {
        saveScene: "Save Current View",
        namePlaceholder: "Scene name\u2026",
        save: "Save",
        savedScenes: "Saved Scenes",
        noScenes: "No saved scenes yet.",
        restore: "Restore scene",
        exportJson: "Export scenes as JSON",
        importJson: "Import scenes from JSON"
      },
      displaySettings: {
        title: "Display Settings",
        presetsTab: "Presets",
        advancedTab: "Advanced",
        preset_compact: "Compact",
        preset_compact_desc: "Small labels & markers",
        preset_standard: "Standard",
        preset_standard_desc: "Default sizes",
        preset_prominent: "Prominent",
        preset_prominent_desc: "Large labels & markers",
        measurementsSection: "Measurements",
        lineWidth: "Line Width",
        labelScale: "Label Size",
        sphereRadius: "Point Size",
        markersSection: "Panorama Markers",
        markerScale: "Pin Size",
        markerOpacity: "Pin Opacity",
        markerLabelScale: "Label Size"
      },
      about: {
        title: "About",
        productName: "PanoCloud Viewer",
        description: "A modular point cloud and panorama viewer built with Next.js 15, potree-core, Three.js, and shadcn/ui.",
        engineLabel: "Engine: potree-core + Three.js",
        panoramasLabel: "Panoramas: Pannellum 2.5.6",
        uiLabel: "UI: shadcn/ui + Tailwind CSS"
      },
      panoViewer: {
        close: "Close panorama"
      },
      uiModes: {
        professional: "Professional",
        lite: "Lite",
        modeLabel: "Mode"
      },
      clipToolbar: {
        title: "Clipping",
        addBox: "Add box",
        clearAll: "Clear all",
        keepInside: "Keep inside (all)",
        keepOutside: "Keep outside (all)",
        show: "Show",
        hide: "Hide",
        delete: "Delete",
        move: "Move",
        scale: "Scale",
        rotateZ: "Rotate"
      }
    };
  }
});
function useLocale() {
  return React25.useContext(LocaleContext);
}
function LocaleProvider({ locale = exports.en, children }) {
  return /* @__PURE__ */ jsxRuntime.jsx(LocaleContext.Provider, { value: locale, children });
}
var LocaleContext;
var init_locale_context = __esm({
  "src/i18n/locale-context.tsx"() {
    "use client";
    init_en();
    LocaleContext = React25.createContext(exports.en);
  }
});
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
var init_utils = __esm({
  "src/lib/utils.ts"() {
    init_dist();
  }
});

// src/components/viewport.tsx
var viewport_exports = {};
__export(viewport_exports, {
  Viewport: () => Viewport
});
function Viewport({ className }) {
  const containerRef = React25.useRef(null);
  const minimapContainerRef = React25.useRef(null);
  const initialized = React25.useRef(false);
  const [minimapSize, setMinimapSize] = React25__default.default.useState(176);
  const t = useLocale().viewport;
  const {
    config,
    setSceneManager,
    setLoader,
    setMeasurementManager,
    setMarkerManager,
    setCameraAnimator,
    setExporter,
    setMinimap,
    setClipManager,
    setFps,
    activeTool,
    pointBudget,
    showMarkers,
    showMinimap,
    setMeasurementList,
    setSelectedCamera,
    clipBoxEntries,
    setClipBoxEntries,
    setSelectedClipBoxId,
    navigationMode,
    projection,
    displaySettings
  } = useViewer();
  const { cameras, metadata } = useData();
  const metaZRef = React25.useRef(null);
  React25.useEffect(() => {
    if (metadata) {
      metaZRef.current = {
        min: metadata.boundingBox.min[2],
        max: metadata.boundingBox.max[2]
      };
    }
  }, [metadata]);
  const smRef = React25.useRef(null);
  const loaderRef = React25.useRef(null);
  const markerRef = React25.useRef(null);
  const measureRef = React25.useRef(null);
  const minimapRef = React25.useRef(null);
  const clipRef = React25.useRef(null);
  const loupeCanvasRef = React25.useRef(null);
  const [magnifierOn, setMagnifierOn] = React25__default.default.useState(false);
  const [loupePos, setLoupePos] = React25__default.default.useState({ x: 0, y: 0 });
  const animRef = React25.useRef(null);
  const axisRef = React25.useRef(null);
  const clipDraftRef = React25.useRef(null);
  const clipDownRef = React25.useRef(null);
  const volumeDragRef = React25.useRef(null);
  React25.useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;
    const adapter = createAdapter(config.source);
    const sm = new exports.SceneManager({
      canvas: containerRef.current,
      onFpsUpdate: setFps
    });
    const loader = new exports.PointCloudLoader(sm, adapter);
    const measureMgr = new exports.MeasurementManager(sm.scene);
    measureMgr.onChange = (list) => setMeasurementList(list);
    const markerMgr = new exports.MarkerManager(sm.scene);
    const anim = new exports.CameraAnimator(sm.camera, sm.controls);
    const exporter = new exports.ExportManager(sm);
    const minimapRdr = new exports.MinimapRenderer(sm);
    const clipMgr = new exports.ClipManager(sm);
    clipMgr.onChange = (boxes) => setClipBoxEntries(boxes);
    clipMgr.onSelectChange = (id) => setSelectedClipBoxId(id);
    smRef.current = sm;
    loaderRef.current = loader;
    markerRef.current = markerMgr;
    measureRef.current = measureMgr;
    minimapRef.current = minimapRdr;
    clipRef.current = clipMgr;
    animRef.current = anim;
    setSceneManager(sm);
    setLoader(loader);
    setMeasurementManager(measureMgr);
    setMarkerManager(markerMgr);
    setCameraAnimator(anim);
    setExporter(exporter);
    setMinimap(minimapRdr);
    setClipManager(clipMgr);
    const minimapFrame = () => minimapRdr.update();
    sm.addFrameCallback(minimapFrame);
    const axisWidget = new exports.AxisWidget(sm);
    axisRef.current = axisWidget;
    const axisFrame = () => axisWidget.render();
    sm.addPostRenderCallback(axisFrame);
    sm.start();
    loader.load("metadata.json", pointBudget).then(() => {
      const pc = loader.getPointCloud();
      if (pc) {
        const pca = pc;
        const box = pca.pcoGeometry?.boundingBox ?? pca.boundingBox;
        const tightBox = pca.pcoGeometry?.tightBoundingBox ?? box;
        const offset = pca.pcoGeometry?.offset;
        const worldBox = new THREE5__namespace.Box3();
        if (tightBox && offset) {
          worldBox.copy(tightBox);
          worldBox.min.add(offset);
          worldBox.max.add(offset);
        } else if (box) {
          worldBox.copy(box);
        } else {
          worldBox.setFromObject(pc);
        }
        if (!worldBox.isEmpty()) {
          minimapRdr.setBounds(worldBox);
        }
      }
    }).catch(console.error);
    return () => {
      sm.removeFrameCallback(minimapFrame);
      sm.removePostRenderCallback(axisFrame);
      sm.dispose();
      measureMgr.dispose();
      markerMgr.dispose();
      minimapRdr.dispose();
      clipMgr.dispose();
      axisWidget.dispose();
      initialized.current = false;
    };
  }, []);
  React25.useEffect(() => {
    if (minimapRef.current && minimapContainerRef.current) {
      minimapRef.current.attach(minimapContainerRef.current);
    }
  }, [showMinimap]);
  const handleMinimapClick = React25.useCallback((e) => {
    const sm = smRef.current;
    const minimap = minimapRef.current;
    if (!sm || !minimap) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const world = minimap.canvasToWorld(cx, cy);
    const cam = sm.camera;
    const offset = new THREE5__namespace.Vector3().subVectors(cam.position, sm.controls.target);
    sm.controls.target.set(world.x, world.y, sm.controls.target.z);
    cam.position.set(world.x + offset.x, world.y + offset.y, cam.position.z);
    sm.controls.update();
  }, []);
  const minimapResizeRef = React25.useRef(false);
  const handleMinimapResizeStart = React25.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    minimapResizeRef.current = true;
    const startY = e.clientY;
    const startSize = minimapSize;
    const onMove = (ev) => {
      if (!minimapResizeRef.current) return;
      const delta = startY - ev.clientY;
      setMinimapSize(Math.max(120, Math.min(400, startSize + delta)));
      minimapRef.current?.resize();
    };
    const onUp = () => {
      minimapResizeRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setTimeout(() => minimapRef.current?.resize(), 0);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [minimapSize]);
  React25.useEffect(() => {
    if (markerRef.current && cameras.length > 0) {
      const wb = loaderRef.current?.worldBox;
      markerRef.current.build(cameras, wb && !wb.isEmpty() ? wb : void 0);
      markerRef.current.setVisible(showMarkers);
    }
  }, [cameras, showMarkers]);
  React25.useEffect(() => {
    markerRef.current?.setVisible(showMarkers);
  }, [showMarkers]);
  React25.useEffect(() => {
    const mm = markerRef.current;
    const cm = clipRef.current;
    if (!mm) return;
    mm.applyClipFilter(cm ? (p) => cm.isPointVisible(p) : null);
  }, [clipBoxEntries]);
  const magnifierTool = activeTool.startsWith("measure-") && activeTool !== "measure-volume";
  React25.useEffect(() => {
    if (!activeTool.startsWith("measure-")) {
      measureRef.current?.clearSnap();
    }
    if (activeTool !== "measure-volume") {
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
    }
    if (activeTool !== "section-box") {
      clipDraftRef.current = null;
      clipDownRef.current = null;
      clipRef.current?.setDraft(null);
    }
    if (!magnifierTool) setMagnifierOn(false);
  }, [activeTool, magnifierTool]);
  React25.useEffect(() => {
    smRef.current?.setNavigationMode(navigationMode);
  }, [navigationMode]);
  React25.useEffect(() => {
    smRef.current?.setProjection(projection);
  }, [projection]);
  React25.useEffect(() => {
    measureRef.current?.applyDisplaySettings(displaySettings);
    markerRef.current?.applyDisplaySettings(displaySettings);
  }, [displaySettings]);
  const projectToPlaneZ = React25.useCallback((nx, ny, planeZ) => {
    const sm = smRef.current;
    if (!sm) return null;
    const raycaster = new THREE5__namespace.Raycaster();
    raycaster.setFromCamera(new THREE5__namespace.Vector2(nx, ny), sm.camera);
    const plane = new THREE5__namespace.Plane(new THREE5__namespace.Vector3(0, 0, 1), -planeZ);
    const hit = new THREE5__namespace.Vector3();
    return raycaster.ray.intersectPlane(plane, hit) ? hit : null;
  }, []);
  const pickVisiblePoint = React25.useCallback((nx, ny) => {
    const sm = smRef.current;
    if (!sm) return null;
    const picked = sm.pickPoint(nx, ny);
    if (picked && (!clipRef.current || clipRef.current.isPointVisible(picked))) {
      return picked;
    }
    return projectToPlaneZ(nx, ny, sm.controls.target.z);
  }, [projectToPlaneZ]);
  const drawLoupe = React25.useCallback((hit) => {
    const sm = smRef.current;
    const src = sm?.renderer.domElement;
    const loupe = loupeCanvasRef.current;
    if (!sm || !src || !loupe) return;
    const ctx = loupe.getContext("2d");
    if (!ctx) return;
    const ndc = hit.clone().project(sm.camera);
    const bufX = (ndc.x * 0.5 + 0.5) * src.width;
    const bufY = (1 - (ndc.y * 0.5 + 0.5)) * src.height;
    const ratio = src.clientWidth > 0 ? src.width / src.clientWidth : 1;
    const srcSize = LOUPE_SIZE / LOUPE_ZOOM * ratio;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
    try {
      ctx.drawImage(
        src,
        bufX - srcSize / 2,
        bufY - srcSize / 2,
        srcSize,
        srcSize,
        0,
        0,
        LOUPE_SIZE,
        LOUPE_SIZE
      );
    } catch {
    }
  }, []);
  const buildClipDraftAt = React25.useCallback((nx, ny) => {
    const sm = smRef.current;
    if (!sm) return null;
    const zMid = metaZRef.current ? (metaZRef.current.min + metaZRef.current.max) / 2 : sm.controls.target.z;
    const center = projectToPlaneZ(nx, ny, zMid);
    if (!center) return null;
    const wb = loaderRef.current?.worldBox;
    const bounds = new THREE5__namespace.Vector3(20, 20, 20);
    if (wb && !wb.isEmpty()) wb.getSize(bounds);
    const half = new THREE5__namespace.Vector3(
      Math.max(0.1, Math.min(bounds.x, bounds.x / 4)) / 2,
      Math.max(0.1, Math.min(bounds.y, bounds.y / 4)) / 2,
      Math.max(0.2, Math.min(bounds.z, bounds.z / 12, 8)) / 2
    );
    return new THREE5__namespace.Box3(
      center.clone().sub(half),
      center.clone().add(half)
    );
  }, [projectToPlaneZ]);
  const getNDC = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      nx: (e.clientX - rect.left) / rect.width * 2 - 1,
      ny: -((e.clientY - rect.top) / rect.height) * 2 + 1
    };
  };
  const handleDblClick = React25.useCallback((e) => {
    const sm = smRef.current;
    const anim = animRef.current;
    if (!sm || !anim) return;
    const { nx, ny } = getNDC(e);
    const hit = sm.pickPoint(nx, ny) ?? projectToPlaneZ(nx, ny, sm.controls.target.z);
    if (!hit) return;
    anim.flyTo({ position: sm.camera.position.clone(), target: hit, duration: 600 });
  }, [projectToPlaneZ]);
  const handleMouseDown = React25.useCallback((e) => {
    const sm = smRef.current;
    if (!sm) return;
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isAttached() && e.button === 0) {
      if (fh.onPointerDown(e.clientX, e.clientY)) {
        e.preventDefault();
        sm.controls.enabled = false;
        return;
      }
    }
    if (activeTool === "measure-volume" && e.button === 0) {
      const vd = volumeDragRef.current;
      if (vd && vd.phase === "height") {
        if (vd.footprintBox) {
          measureRef.current?.addVolumeMeasurement(vd.footprintBox);
        }
        volumeDragRef.current = null;
        sm.controls.enabled = true;
        return;
      }
      e.preventDefault();
      sm.controls.enabled = false;
      const { nx, ny } = getNDC(e);
      const planeZ = sm.controls.target.z;
      const startWorld = projectToPlaneZ(nx, ny, planeZ);
      if (startWorld) {
        volumeDragRef.current = { phase: "footprint", startWorld, planeZ };
      }
      return;
    }
    if (activeTool !== "section-box" || e.button !== 0) return;
    clipDownRef.current = { x: e.clientX, y: e.clientY };
  }, [activeTool]);
  const handleMouseMove = React25.useCallback((e) => {
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerMove(e.clientX, e.clientY);
      return;
    }
    if (fh && fh.isAttached()) {
      fh.updateHover(e.clientX, e.clientY);
    }
    const vd = volumeDragRef.current;
    if (vd && activeTool === "measure-volume") {
      if (vd.phase === "footprint") {
        const { nx, ny } = getNDC(e);
        const endWorld = projectToPlaneZ(nx, ny, vd.planeZ);
        if (!endWorld) return;
        const { startWorld } = vd;
        const zMin = metaZRef.current?.min ?? vd.planeZ - 10;
        const zMax = metaZRef.current?.max ?? vd.planeZ + 10;
        const box = new THREE5__namespace.Box3(
          new THREE5__namespace.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
          new THREE5__namespace.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax)
        );
        measureRef.current?.setVolumeDraft(box);
      } else if (vd.phase === "height" && vd.footprintBox && vd.startClientY !== void 0) {
        const deltaY = vd.startClientY - e.clientY;
        const sensitivity = 0.1;
        const zExtent = Math.max(0.1, Math.abs(deltaY) * sensitivity);
        const midZ = (vd.baseZMin + vd.baseZMax) / 2;
        const box = vd.footprintBox.clone();
        box.min.z = midZ - zExtent / 2;
        box.max.z = midZ + zExtent / 2;
        vd.footprintBox.copy(box);
        measureRef.current?.setVolumeDraft(box);
      }
      return;
    }
    if (activeTool === "section-box") {
      const { nx, ny } = getNDC(e);
      const box = buildClipDraftAt(nx, ny);
      clipDraftRef.current = box;
      clipRef.current?.setDraft(box);
      return;
    }
    if (activeTool.startsWith("measure-") && measureRef.current) {
      const sm = smRef.current;
      if (!sm) return;
      const { nx, ny } = getNDC(e);
      const hit = pickVisiblePoint(nx, ny);
      if (hit) {
        measureRef.current.updateSnap(hit);
        if (magnifierTool) {
          drawLoupe(hit);
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          let px = cx + LOUPE_OFFSET;
          let py = cy + LOUPE_OFFSET;
          if (px + LOUPE_SIZE > rect.width) px = cx - LOUPE_OFFSET - LOUPE_SIZE;
          if (py + LOUPE_SIZE > rect.height) py = cy - LOUPE_OFFSET - LOUPE_SIZE;
          setLoupePos({ x: Math.max(4, px), y: Math.max(4, py) });
          if (!magnifierOn) setMagnifierOn(true);
        }
      }
    }
  }, [activeTool, pickVisiblePoint, buildClipDraftAt, magnifierTool, magnifierOn, drawLoupe]);
  const handleMouseUp = React25.useCallback((e) => {
    const sm = smRef.current;
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerUp();
      if (sm) sm.controls.enabled = true;
      return;
    }
    const vdUp = volumeDragRef.current;
    if (vdUp && vdUp.phase === "footprint" && activeTool === "measure-volume") {
      const { nx, ny } = getNDC(e);
      const endWorld = projectToPlaneZ(nx, ny, vdUp.planeZ);
      if (endWorld) {
        const { startWorld } = vdUp;
        const zMin = metaZRef.current?.min ?? vdUp.planeZ - 10;
        const zMax = metaZRef.current?.max ?? vdUp.planeZ + 10;
        const box = new THREE5__namespace.Box3(
          new THREE5__namespace.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
          new THREE5__namespace.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax)
        );
        if (!box.isEmpty()) {
          volumeDragRef.current = {
            phase: "height",
            startWorld: vdUp.startWorld,
            planeZ: vdUp.planeZ,
            footprintBox: box,
            startClientY: e.clientY,
            baseZMin: zMin,
            baseZMax: zMax
          };
          return;
        }
      }
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
      if (sm) sm.controls.enabled = true;
      return;
    }
    if (sm) sm.controls.enabled = true;
    if (activeTool === "section-box" && e.button === 0) {
      const down = clipDownRef.current;
      clipDownRef.current = null;
      const DRAG_THRESHOLD = 5;
      const moved = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_THRESHOLD : true;
      if (!moved) {
        const { nx, ny } = getNDC(e);
        const box = clipDraftRef.current ?? buildClipDraftAt(nx, ny);
        if (box && !box.isEmpty() && clipRef.current) {
          const entry = clipRef.current.addBox(box);
          clipRef.current.selectBox(entry.id);
          clipDraftRef.current = null;
          clipRef.current.setDraft(null);
        }
      }
      return;
    }
  }, [activeTool, buildClipDraftAt]);
  const handleClick = React25.useCallback((e) => {
    if (activeTool === "section-box") return;
    const sm = smRef.current;
    if (!sm) return;
    const { nx, ny } = getNDC(e);
    if (activeTool === "none" && showMarkers && markerRef.current) {
      const hits = sm.raycast(nx, ny, markerRef.current.getMeshes());
      if (hits.length > 0) {
        const idx = hits[0].object.userData.cameraIndex;
        markerRef.current.setSelected(idx);
        setSelectedCamera(cameras[idx]);
        config.onCameraSelect?.(cameras[idx]);
      }
    }
    if (activeTool.startsWith("measure-") && activeTool !== "measure-volume" && measureRef.current) {
      const type = activeTool.replace("measure-", "");
      const hit = pickVisiblePoint(nx, ny);
      if (hit) {
        if (!measureRef.current.activeMeasurement) measureRef.current.start(type);
        measureRef.current.addPoint(hit);
      }
    }
  }, [activeTool, cameras, config, pickVisiblePoint, showMarkers]);
  const handleMouseLeave = React25.useCallback(() => {
    measureRef.current?.clearSnap();
    setMagnifierOn(false);
  }, []);
  const handleContextMenu = React25.useCallback((e) => {
    e.preventDefault();
    if (volumeDragRef.current) {
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
      const sm = smRef.current;
      if (sm) sm.controls.enabled = true;
      return;
    }
    if (activeTool.startsWith("measure-") && measureRef.current?.activeMeasurement) {
      measureRef.current.finish();
    }
    if (activeTool === "section-box") {
      clipDraftRef.current = null;
      clipDownRef.current = null;
      clipRef.current?.setDraft(null);
      clipRef.current?.clear();
    }
  }, [activeTool]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("relative w-full h-full overflow-hidden bg-[hsl(var(--viewport-bg))]", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        ref: containerRef,
        className: "w-full h-full select-none",
        onClick: handleClick,
        onDoubleClick: handleDblClick,
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseLeave,
        onContextMenu: handleContextMenu,
        onDragStart: (e) => e.preventDefault(),
        style: {
          // Hide the OS cursor while point-snapping so only the 3D crosshair
          // shows (no doubled cross); keep a crosshair for the section tool.
          cursor: activeTool === "section-box" ? "crosshair" : activeTool.startsWith("measure-") ? "none" : "default"
        }
      }
    ),
    magnifierOn && magnifierTool && /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "absolute rounded-lg overflow-hidden border border-white/20 shadow-xl pointer-events-none ring-1 ring-black/40 bg-[#0a0e1a]",
        style: { left: loupePos.x, top: loupePos.y, width: LOUPE_SIZE, height: LOUPE_SIZE },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "canvas",
            {
              ref: loupeCanvasRef,
              width: LOUPE_SIZE,
              height: LOUPE_SIZE,
              className: "block w-full h-full"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: LOUPE_SIZE, height: LOUPE_SIZE, className: "absolute inset-0", viewBox: "0 0 168 168", children: [
            /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "84", y1: "58", x2: "84", y2: "78", stroke: "#DCD546", strokeWidth: "1.25" }),
            /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "84", y1: "90", x2: "84", y2: "110", stroke: "#DCD546", strokeWidth: "1.25" }),
            /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "58", y1: "84", x2: "78", y2: "84", stroke: "#DCD546", strokeWidth: "1.25" }),
            /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "90", y1: "84", x2: "110", y2: "84", stroke: "#DCD546", strokeWidth: "1.25" }),
            /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "84", cy: "84", r: "5", fill: "none", stroke: "#DCD546", strokeWidth: "1", opacity: "0.85" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute top-1 left-2 text-[9px] font-mono text-white/45 select-none", children: "ZOOM" })
        ]
      }
    ),
    showMinimap && /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "absolute bottom-10 rounded-lg overflow-hidden border border-white/10 shadow-lg cursor-pointer transition-[right] duration-200",
        style: { width: minimapSize, height: minimapSize, right: "var(--pcv-minimap-right, 0.75rem)" },
        onClick: handleMinimapClick,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              ref: minimapContainerRef,
              className: "relative w-full h-full"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute top-1 left-2 text-[9px] text-white/40 font-mono pointer-events-none", children: t.overview }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              onMouseDown: handleMinimapResizeStart,
              className: "absolute top-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center",
              title: "Resize minimap",
              children: /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "8", height: "8", viewBox: "0 0 8 8", className: "text-white/30", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M0 8L8 0M3 8L8 3M6 8L8 6", stroke: "currentColor", strokeWidth: "1" }) })
            }
          )
        ]
      }
    ),
    activeTool !== "none" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-[hsl(var(--brand))] text-xs font-mono px-3 py-1 rounded-full pointer-events-none", children: [
      activeTool === "measure-point" && t.hintPoint,
      activeTool === "measure-distance" && t.hintDistance,
      activeTool === "measure-height" && t.hintHeight,
      activeTool === "measure-area" && t.hintArea,
      activeTool === "measure-angle" && t.hintAngle,
      activeTool === "measure-volume" && (volumeDragRef.current?.phase === "height" ? "Move mouse up/down to set height, click to confirm" : "Drag to draw volume footprint"),
      activeTool === "section-box" && t.hintSectionBox
    ] }),
    metadata && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute top-3 left-3 text-[10px] font-mono text-white/30 pointer-events-none", children: [
      (metadata.points / 1e6).toFixed(1),
      "M pts"
    ] })
  ] });
}
var LOUPE_SIZE, LOUPE_ZOOM, LOUPE_OFFSET;
var init_viewport = __esm({
  "src/components/viewport.tsx"() {
    "use client";
    init_utils();
    init_viewer_provider();
    init_data_provider();
    init_locale_context();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    LOUPE_SIZE = 168;
    LOUPE_ZOOM = 7;
    LOUPE_OFFSET = 22;
  }
});

// src/index.ts
init_dist();
var ThemeContext = React25.createContext(null);
function useTheme() {
  const ctx = React25.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
function ThemeProvider({
  defaultTheme = "dark",
  storageKey = "pcv-theme",
  children
}) {
  const [theme, setThemeState] = React25.useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    return localStorage.getItem(storageKey) ?? defaultTheme;
  });
  const [, forceUpdate] = React25.useReducer((n) => n + 1, 0);
  const resolvedTheme = theme === "system" ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : theme;
  React25.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", forceUpdate);
    return () => mq.removeEventListener("change", forceUpdate);
  }, [theme]);
  const setTheme = (t) => {
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem(storageKey, t);
  };
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  return /* @__PURE__ */ jsxRuntime.jsx(ThemeContext.Provider, { value: { theme, resolvedTheme, setTheme, toggleTheme }, children });
}

// src/components/pano-cloud-viewer.tsx
init_viewer_provider();
init_data_provider();
init_locale_context();

// src/components/workspace-layout.tsx
init_utils();
init_viewer_provider();
init_data_provider();
init_locale_context();

// src/components/toolbar/main-toolbar.tsx
init_utils();
init_viewer_provider();
init_locale_context();

// src/components/toolbar/view-controls.tsx
init_viewer_provider();
init_locale_context();
var CUBE_WIRE = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 2L22 8V16L12 22L2 16V8Z", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round", fill: "none" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 12L22 8", stroke: "currentColor", strokeWidth: "1.2" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 12L2 8", stroke: "currentColor", strokeWidth: "1.2" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 12V22", stroke: "currentColor", strokeWidth: "1.2" })
] });
function TopIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2 8L12 2L22 8L12 12Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function BottomIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2 16L12 22L22 16L12 12Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function FrontIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2 8L12 12V22L2 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function BackIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M22 8L12 12V22L22 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function LeftIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2 8L12 2V12L2 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function RightIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M22 8L12 2V12L22 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
var VIEW_DEFS = [
  { titleKey: "viewTop", pos: [0, 0, 1], up: [0, 1, 0], icon: TopIcon },
  { titleKey: "viewBottom", pos: [0, 0, -1], up: [0, 1, 0], icon: BottomIcon },
  { titleKey: "viewFront", pos: [0, -1, 0], up: [0, 0, 1], icon: FrontIcon },
  { titleKey: "viewBack", pos: [0, 1, 0], up: [0, 0, 1], icon: BackIcon },
  { titleKey: "viewLeft", pos: [-1, 0, 0], up: [0, 0, 1], icon: LeftIcon },
  { titleKey: "viewRight", pos: [1, 0, 0], up: [0, 0, 1], icon: RightIcon }
];
function ViewControls() {
  const { sceneManager } = useViewer();
  const t = useLocale().toolbar;
  const flyToView = (pos, up) => {
    if (!sceneManager) return;
    const { camera, controls } = sceneManager;
    const target = controls.target.clone();
    const dist = camera.position.distanceTo(target);
    const newPos = target.clone().add(
      { x: pos[0] * dist, y: pos[1] * dist, z: pos[2] * dist }
    );
    camera.position.set(newPos.x, newPos.y, newPos.z);
    camera.up.set(up[0], up[1], up[2]);
    controls.update();
  };
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: VIEW_DEFS.map((v) => /* @__PURE__ */ jsxRuntime.jsx(
    ToolbarIconBtn,
    {
      icon: /* @__PURE__ */ jsxRuntime.jsx(v.icon, {}),
      title: t[v.titleKey] ?? v.titleKey,
      active: false,
      onClick: () => flyToView(v.pos, v.up)
    },
    v.titleKey
  )) });
}

// src/components/toolbar/display-controls.tsx
init_viewer_provider();
init_locale_context();
var COLOR_MODES = [
  { value: "rgb", labelKey: "colorRgb" },
  { value: "height", labelKey: "colorElevation" },
  { value: "intensity", labelKey: "colorIntensity" },
  { value: "intensity_gradient", labelKey: "colorIntensityGradient" },
  { value: "classification", labelKey: "colorClassification" },
  { value: "return_number", labelKey: "colorReturnNumber" },
  { value: "source", labelKey: "colorSource" }
];
var QUALITY_PRESETS = [
  { value: "performance", shape: 0, sizeType: 0, label: "qualityPerformance" },
  // SQUARE + FIXED
  { value: "balanced", shape: 1, sizeType: 2, label: "qualityBalanced" },
  // CIRCLE + ADAPTIVE
  { value: "high", shape: 2, sizeType: 2, label: "qualityHigh" }
  // PARABOLOID + ADAPTIVE
];
function OrbitIcon({ className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5 8l7-4 7 4v8l-7 4-7-4V8z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5 8l7 4 7-4", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 12v8", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M20 5a9.5 9.5 0 0 0-4-2.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M20 5l-1.5-2M20 5l2-1", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function FreeIcon({ className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M7 9l5-3 5 3v6l-5 3-5-3V9z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M7 9l5 3 5-3", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 12v6", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4 8a8.5 8.5 0 0 1 2-3", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4 8l-1.5-1.5M4 8l1.5-2", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function PanIcon({ className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5 8l7-4 7 4v8l-7 4-7-4V8z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5 8l7 4 7-4", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 12v8", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5 8l7-4 7 4-7 4z", fill: "currentColor", fillOpacity: "0.25" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3 20h4M3 20l1.5-1.5M3 20l1.5 1.5", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function PerspectiveIcon({ className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "3", y: "4", width: "12", height: "12", rx: "0.5", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "9", y: "7", width: "12", height: "12", rx: "0.5", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "3", y1: "4", x2: "9", y2: "7", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "15", y1: "4", x2: "21", y2: "7", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "3", y1: "16", x2: "9", y2: "19", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "15", y1: "16", x2: "21", y2: "19", stroke: "currentColor", strokeWidth: "1.3" })
  ] });
}
function OrthoIcon({ className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "4", y: "4", width: "10", height: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "10", y: "10", width: "10", height: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "4", y1: "4", x2: "10", y2: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "14", y1: "4", x2: "20", y2: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "4", y1: "14", x2: "10", y2: "20", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "14", y1: "14", x2: "20", y2: "20", stroke: "currentColor", strokeWidth: "1.3" })
  ] });
}
var NAV_MODES = [
  { value: "orbit", icon: OrbitIcon, titleKey: "navOrbitTitle" },
  { value: "free", icon: FreeIcon, titleKey: "navFreeTitle" },
  { value: "pan", icon: PanIcon, titleKey: "navPanTitle" }
];
var PROJ_MODES = [
  { value: "perspective", icon: PerspectiveIcon, titleKey: "camPerspectiveTitle" },
  { value: "orthographic", icon: OrthoIcon, titleKey: "camOrthographicTitle" }
];
var iconBtnClass = (active) => `p-1 rounded transition-colors cursor-pointer border ${active ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] border-[hsl(var(--brand)/0.4)]" : "text-muted-foreground hover:text-foreground border-transparent hover:border-[hsl(var(--border))]"}`;
function ViewModeControls() {
  const { navigationMode, setNavigationMode, projection, setProjection } = useViewer();
  const t = useLocale().toolbar;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 px-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-0.5 border border-[hsl(var(--border))] rounded p-0.5", children: NAV_MODES.map((nm) => /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: iconBtnClass(navigationMode === nm.value),
        title: t[nm.titleKey],
        onClick: () => setNavigationMode(nm.value),
        children: /* @__PURE__ */ jsxRuntime.jsx(nm.icon, {})
      },
      nm.value
    )) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-0.5 border border-[hsl(var(--border))] rounded p-0.5", children: PROJ_MODES.map((pm) => /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: iconBtnClass(projection === pm.value),
        title: t[pm.titleKey],
        onClick: () => setProjection(pm.value),
        children: /* @__PURE__ */ jsxRuntime.jsx(pm.icon, {})
      },
      pm.value
    )) })
  ] });
}
function DisplayControls() {
  const { pointBudget, setPointBudget, pointSize, setPointSize, loader, colorMode, setColorMode, uiMode } = useViewer();
  const t = useLocale().toolbar;
  const [quality, setQuality] = React25.useState("balanced");
  const isPro = uiMode === "professional";
  const handleBudget = (e) => {
    const val = Number(e.target.value);
    setPointBudget(val);
    loader?.setPointBudget(val);
  };
  const handleSize = (e) => {
    const val = Number(e.target.value);
    setPointSize(val);
    loader?.setPointSize(val);
  };
  const handleColorMode = async (e) => {
    const mode = e.target.value;
    setColorMode(mode);
    await loader?.setColorMode(mode);
  };
  const handleQuality = (e) => {
    const preset = QUALITY_PRESETS.find((p) => p.value === e.target.value);
    if (!preset) return;
    setQuality(preset.value);
    loader?.setPointShape(preset.shape);
    loader?.setPointSizeType(preset.sizeType);
  };
  const selectClass = "bg-[hsl(var(--toolbar-bg))] border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand))] cursor-pointer";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 px-1", children: [
    isPro && /* @__PURE__ */ jsxRuntime.jsx(
      "select",
      {
        value: colorMode,
        onChange: handleColorMode,
        className: selectClass,
        title: t.colorMode,
        children: COLOR_MODES.map((cm) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: cm.value, children: t[cm.labelKey] ?? cm.value }, cm.value))
      }
    ),
    isPro && /* @__PURE__ */ jsxRuntime.jsx(
      "select",
      {
        value: quality,
        onChange: handleQuality,
        className: selectClass,
        title: t.quality,
        children: QUALITY_PRESETS.map((q) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: q.value, children: t[q.label] ?? q.value }, q.value))
      }
    ),
    isPro && /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "hidden lg:block", children: t.budget }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "range",
          min: 5e5,
          max: 1e7,
          step: 1e5,
          value: pointBudget,
          onChange: handleBudget,
          className: "pcv-slider w-16",
          title: t.pointBudgetTitle(pointBudget / 1e6)
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "w-8 text-right tabular-nums", children: [
        (pointBudget / 1e6).toFixed(0),
        "M"
      ] })
    ] }),
    isPro && /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "hidden lg:block", children: t.size }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "range",
          min: 0.5,
          max: 5,
          step: 0.1,
          value: pointSize,
          onChange: handleSize,
          className: "pcv-slider w-12",
          title: t.pointSizeTitle(pointSize)
        }
      )
    ] })
  ] });
}

// src/components/toolbar/export-tools.tsx
init_viewer_provider();
init_locale_context();
init_dist();
function ExportTools() {
  const { exporter } = useViewer();
  const t = useLocale().exportPanel;
  const pcvRoot = usePcvRoot();
  const [open, setOpen] = React25.useState(false);
  const [view, setView] = React25.useState("top");
  const [scale, setScale] = React25.useState(2);
  const [bg, setBg] = React25.useState("white");
  const [fmt, setFmt] = React25.useState("png");
  const [exporting, setExporting] = React25.useState(false);
  const btnRef = React25.useRef(null);
  const popoverRef = React25.useRef(null);
  const [pos, setPos] = React25.useState({ top: 0, right: 0 });
  React25.useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [open]);
  const handleClickOutside = React25.useCallback((e) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
      setOpen(false);
    }
  }, []);
  React25.useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);
  const doExport = async () => {
    if (!exporter) return;
    setExporting(true);
    try {
      const url = await exporter.capture({ view, scale, background: bg, showScaleBar: false, format: fmt });
      const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      exports.ExportManager.download(url, `pointcloud_${view}_${date}.${fmt}`);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };
  const views = [
    { value: "top", label: t.viewTop },
    { value: "front", label: t.viewFront },
    { value: "side", label: t.viewSide },
    { value: "back", label: t.viewBack }
  ];
  const bgLabels = {
    white: t.bgWhite,
    black: t.bgBlack,
    transparent: t.bgTransparent
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: btnRef, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Download, { size: 14 }),
        title: t.exportImageTitle,
        active: open,
        onClick: () => setOpen(!open)
      }
    ),
    open && reactDom.createPortal(
      /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          ref: popoverRef,
          style: { position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 },
          className: "bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-xl p-3 w-52 text-xs text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-semibold mb-2 text-[hsl(var(--brand))]", children: t.title }),
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block mb-1 text-muted-foreground", children: t.view }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "select",
              {
                value: view,
                onChange: (e) => setView(e.target.value),
                className: "w-full mb-2 bg-muted text-foreground rounded px-1 py-0.5 text-xs border border-[hsl(var(--border))]",
                children: views.map((v) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: v.value, children: v.label }, v.value))
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block mb-1 text-muted-foreground", children: t.scale }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1 mb-2", children: [1, 2, 4].map((s) => /* @__PURE__ */ jsxRuntime.jsxs(
              "button",
              {
                onClick: () => setScale(s),
                className: `flex-1 py-0.5 rounded text-xs border transition-colors ${scale === s ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`,
                children: [
                  s,
                  "x"
                ]
              },
              s
            )) }),
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block mb-1 text-muted-foreground", children: t.background }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1 mb-2", children: ["white", "black", "transparent"].map((b) => /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: () => setBg(b),
                className: `flex-1 py-0.5 rounded text-xs border transition-colors ${bg === b ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`,
                children: bgLabels[b]
              },
              b
            )) }),
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block mb-1 text-muted-foreground", children: t.format }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1 mb-3", children: ["png", "jpeg"].map((f) => /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: () => setFmt(f),
                className: `flex-1 py-0.5 rounded text-xs border transition-colors uppercase ${fmt === f ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`,
                children: f
              },
              f
            )) }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: doExport,
                disabled: exporting,
                className: "w-full py-1.5 bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] rounded font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity",
                children: exporting ? t.exporting : t.download
              }
            )
          ]
        }
      ),
      pcvRoot?.current ?? document.body
    )
  ] });
}
function ToolbarSection({ label, children, className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex items-center gap-0.5 px-2 border-r border-[hsl(var(--toolbar-border))] last:border-r-0", className), children: [
    children,
    label && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[9px] text-muted-foreground/50 ml-1 hidden xl:block font-mono uppercase tracking-wider", children: label })
  ] });
}
function MainToolbar({ onOpenCloudSelector, onToggleRenderSettings, onToggleQuickSettings, renderSettingsOpen, quickSettingsOpen }) {
  const { showMinimap, setShowMinimap, uiMode } = useViewer();
  const { resolvedTheme, toggleTheme } = useTheme();
  const t = useLocale().toolbar;
  const isPro = uiMode === "professional";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center h-10 px-2 gap-0 select-none overflow-x-auto", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(ToolbarSection, { label: "Views", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ViewControls, {}),
      /* @__PURE__ */ jsxRuntime.jsx(ViewModeControls, {})
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(ToolbarSection, { label: "Display", children: [
      /* @__PURE__ */ jsxRuntime.jsx(DisplayControls, {}),
      isPro && /* @__PURE__ */ jsxRuntime.jsx(
        ToolbarIconBtn,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Settings, { size: 14 }),
          active: quickSettingsOpen,
          onClick: onToggleQuickSettings,
          title: "Quick settings"
        }
      ),
      isPro && /* @__PURE__ */ jsxRuntime.jsx(
        ToolbarIconBtn,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sliders, { size: 14 }),
          active: renderSettingsOpen,
          onClick: onToggleRenderSettings,
          title: "Rendering settings"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsxRuntime.jsxs(ToolbarSection, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ToolbarIconBtn,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Map, { size: 14 }),
          label: t.minimap,
          active: showMinimap,
          onClick: () => setShowMinimap(!showMinimap),
          title: t.toggleMinimap
        }
      ),
      isPro && /* @__PURE__ */ jsxRuntime.jsx(ExportTools, {}),
      isPro && /* @__PURE__ */ jsxRuntime.jsx(
        ToolbarIconBtn,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Layers, { size: 14 }),
          label: t.clouds,
          active: false,
          onClick: onOpenCloudSelector,
          title: t.cloudSelector
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ToolbarIconBtn,
        {
          icon: resolvedTheme === "dark" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sun, { size: 14 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Moon, { size: 14 }),
          label: t.theme,
          active: false,
          onClick: toggleTheme,
          title: resolvedTheme === "dark" ? t.switchToLight : t.switchToDark
        }
      )
    ] })
  ] });
}
function ToolbarIconBtn({ icon, label, active, onClick, title }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      title,
      onClick,
      className: cn(
        "flex items-center gap-1 px-1.5 py-1 rounded text-xs transition-colors",
        active ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      ),
      children: [
        icon,
        label && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "hidden xl:block", children: label })
      ]
    }
  );
}

// src/components/toolbar/tool-rail.tsx
init_utils();
init_viewer_provider();
init_locale_context();
function RailBtn({ icon, title, active, onClick, disabled, compact }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      title,
      onClick,
      disabled,
      className: cn(
        "flex items-center justify-center rounded transition-colors",
        compact ? "w-7 h-7" : "w-9 h-9",
        active ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        disabled && "opacity-30 cursor-not-allowed"
      ),
      children: icon
    }
  );
}
function Divider() {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-px w-6 mx-auto bg-[hsl(var(--border))] my-0.5" });
}
function GroupLabel({ children }) {
  return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50 text-center leading-none mt-1", children });
}
var BASIC_MEASURES = [
  { type: "point", tool: "measure-point", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.MapPin, { size: 15 }), titleKey: "measurePoint" },
  { type: "distance", tool: "measure-distance", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Ruler, { size: 15 }), titleKey: "measureDistance" },
  { type: "height", tool: "measure-height", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowUpDown, { size: 15 }), titleKey: "measureHeight" }
];
var ADVANCED_MEASURES = [
  { type: "area", tool: "measure-area", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pentagon, { size: 15 }), titleKey: "measureArea" },
  { type: "volume", tool: "measure-volume", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Package, { size: 15 }), titleKey: "measureVolume" },
  { type: "angle", tool: "measure-angle", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Triangle, { size: 15 }), titleKey: "measureAngle" },
  { type: "profile", tool: "measure-profile", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Waypoints, { size: 15 }), titleKey: "measureProfile" }
];
function ToolRail() {
  const { activeTool, setActiveTool, clipManager, loader, measurementManager, setMeasurementList, uiMode, selectedClipBoxId } = useViewer();
  const t = useLocale().toolRail;
  const isPro = uiMode === "professional";
  const toggle = (tool) => setActiveTool(activeTool === tool ? "none" : tool);
  const boxes = clipManager?.getBoxes() ?? [];
  const hasClipBox = boxes.length > 0;
  const clipSelected = !!selectedClipBoxId;
  const toggleClipBox = () => {
    if (!clipManager || !loader) return;
    if (!hasClipBox) {
      if (loader.worldBox.isEmpty()) return;
      const entry = clipManager.addDefaultBox(loader.worldBox);
      clipManager.selectBox(entry.id);
    } else if (clipSelected) {
      clipManager.selectBox(null);
    } else {
      clipManager.selectBox(boxes[0].id);
    }
  };
  const clearClipBox = () => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  };
  const clearMeasurements = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-0.5 py-2 px-1 w-10 shrink-0", children: [
    /* @__PURE__ */ jsxRuntime.jsx(GroupLabel, { children: t.measureGroup }),
    BASIC_MEASURES.map((def) => /* @__PURE__ */ jsxRuntime.jsx(
      RailBtn,
      {
        icon: def.icon,
        title: t[def.titleKey] ?? def.type,
        active: activeTool === def.tool,
        onClick: () => toggle(def.tool)
      },
      def.tool
    )),
    isPro && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Divider, {}),
      ADVANCED_MEASURES.map((def) => /* @__PURE__ */ jsxRuntime.jsx(
        RailBtn,
        {
          icon: def.icon,
          title: t[def.titleKey] ?? def.type,
          active: activeTool === def.tool,
          onClick: () => toggle(def.tool)
        },
        def.tool
      ))
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      RailBtn,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 13 }),
        title: t.clearMeasurements,
        onClick: clearMeasurements,
        compact: true
      }
    ),
    isPro && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntime.jsx(GroupLabel, { children: t.sectionGroup }),
      /* @__PURE__ */ jsxRuntime.jsx(
        RailBtn,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.BoxSelect, { size: 15 }),
          title: !hasClipBox ? t.drawClipBox : clipSelected ? "Deselect section (crop stays active)" : "Edit section",
          active: clipSelected,
          onClick: toggleClipBox
        }
      ),
      hasClipBox && /* @__PURE__ */ jsxRuntime.jsx(
        RailBtn,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 13 }),
          title: t.removeClipBox,
          onClick: clearClipBox,
          compact: true
        }
      )
    ] })
  ] });
}

// src/components/toolbar/clip-toolbar.tsx
init_utils();

// src/hooks/use-clip-actions.ts
init_viewer_provider();
function useClipActions() {
  const { clipManager, loader, clipBoxEntries, selectedClipBoxId, activeTool, setActiveTool } = useViewer();
  const boxes = clipBoxEntries;
  const hasClipBox = boxes.length > 0;
  const clipMode = boxes.find((b) => b.visible)?.mode ?? "outside";
  const addBox = React25.useCallback(() => {
    if (!clipManager || !loader) return;
    if (loader.worldBox.isEmpty()) return;
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  }, [clipManager, loader]);
  const clearAll = React25.useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);
  const toggleMode = React25.useCallback(() => {
    const next = clipMode === "outside" ? "inside" : "outside";
    clipManager?.setModeAll(next);
  }, [clipManager, clipMode]);
  const setEnabled = React25.useCallback((enabled) => {
    clipManager?.setEnabled(enabled);
  }, [clipManager]);
  const isEnabled = clipManager?.isEnabled() ?? true;
  const outlinesVisible = clipManager?.areOutlinesVisible() ?? true;
  const setOutlinesVisible = React25.useCallback((visible) => {
    clipManager?.setOutlinesVisible(visible);
  }, [clipManager]);
  const selectBox = React25.useCallback((id) => {
    clipManager?.selectBox(id);
  }, [clipManager]);
  const resetRotation = React25.useCallback((id) => {
    clipManager?.resetRotation(id);
  }, [clipManager]);
  const setTransformMode = React25.useCallback((mode) => {
    if (!clipManager) return;
    if (!clipManager.getSelectedId() && boxes[0]) clipManager.selectBox(boxes[0].id);
    clipManager.setTransformMode(mode);
  }, [clipManager, boxes]);
  const removeBox = React25.useCallback((id) => {
    clipManager?.removeBox(id);
  }, [clipManager]);
  const setBoxVisible = React25.useCallback((id, visible) => {
    clipManager?.setBoxVisible(id, visible);
  }, [clipManager]);
  const setModeAll = React25.useCallback((mode) => {
    clipManager?.setModeAll(mode);
  }, [clipManager]);
  return {
    boxes,
    selectedBoxId: selectedClipBoxId,
    hasClipBox,
    clipMode,
    isEnabled,
    outlinesVisible,
    addBox,
    clearAll,
    toggleMode,
    setEnabled,
    setOutlinesVisible,
    selectBox,
    resetRotation,
    setTransformMode,
    removeBox,
    setBoxVisible,
    setModeAll
  };
}

// src/components/toolbar/clip-toolbar.tsx
init_locale_context();
function ClipToolbar() {
  const { boxes, selectedBoxId: selectedClipBoxId, addBox, clearAll, setModeAll, selectBox, removeBox, setBoxVisible, isEnabled, setEnabled, outlinesVisible, setOutlinesVisible, resetRotation, setTransformMode } = useClipActions();
  const t = useLocale().clipToolbar;
  const [enabled, setEnabledLocal] = React25__default.default.useState(isEnabled);
  const [outlines, setOutlinesLocal] = React25__default.default.useState(outlinesVisible);
  const [mode, setMode] = React25__default.default.useState("scale");
  React25__default.default.useEffect(() => {
    setEnabledLocal(isEnabled);
    setOutlinesLocal(outlinesVisible);
  }, [isEnabled, outlinesVisible, boxes]);
  const TRANSFORM_MODES = [
    { m: "translate", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Move, { size: 12 }), label: t.move },
    { m: "scale", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Maximize2, { size: 12 }), label: t.scale },
    { m: "rotate", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RotateCw, { size: 12 }), label: t.rotateZ }
  ];
  if (boxes.length === 0) return null;
  const firstVisible = boxes.find((b) => b.visible);
  const isInside = (firstVisible?.mode ?? "outside") === "inside";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col w-52 py-2 px-1 select-none", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-1 mb-1.5", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold text-foreground", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.BoxSelect, { size: 13, className: "text-[hsl(var(--brand))]" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: t.title })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-0.5", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            title: t.addBox,
            onClick: addBox,
            className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 12 }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px]", children: t.addBox })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            title: t.clearAll,
            onClick: clearAll,
            className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-destructive/20 hover:text-destructive transition-colors",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 12 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-px bg-white/10 mx-1 mb-1.5" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: () => {
          const next = !enabled;
          setEnabledLocal(next);
          setEnabled(next);
        },
        title: enabled ? "Clipping on" : "Clipping off",
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border",
          enabled ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          enabled ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Scissors, { size: 12 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ScissorsLineDashed, { size: 12 }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1 text-left", children: enabled ? "Clipping on" : "Clipping off" }),
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Power, { size: 12, className: enabled ? "text-[hsl(var(--brand))]" : "text-muted-foreground" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: () => {
          const next = !outlines;
          setOutlinesLocal(next);
          setOutlinesVisible(next);
        },
        title: outlines ? "Outlines visible" : "Outlines hidden",
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border",
          outlines ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          outlines ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { size: 12 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { size: 12 }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1 text-left", children: outlines ? "Outlines on" : "Outlines off" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: () => setModeAll(isInside ? "outside" : "inside"),
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors",
          "border",
          isInside ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Scissors, { size: 12 }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: isInside ? t.keepInside : t.keepOutside })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-h-40 overflow-y-auto flex flex-col gap-0.5 px-1", children: boxes.map((box) => {
      const isSelected = box.id === selectedClipBoxId;
      return /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: cn(
            "flex items-center gap-1 rounded px-1 py-0.5 transition-colors",
            isSelected ? "bg-[hsl(var(--brand)/0.15)]" : "hover:bg-muted/40"
          ),
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                title: box.visible ? t.hide : t.show,
                onClick: () => setBoxVisible(box.id, !box.visible),
                className: "flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                children: box.visible ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { size: 12 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { size: 12 })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                title: box.name,
                onClick: () => selectBox(isSelected ? null : box.id),
                className: cn(
                  "flex-1 text-left text-xs truncate rounded transition-colors",
                  isSelected ? "text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground"
                ),
                children: box.name
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                title: t.delete,
                onClick: () => removeBox(box.id),
                className: "flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors",
                children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 12 })
              }
            )
          ]
        },
        box.id
      );
    }) }),
    selectedClipBoxId && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-px bg-white/10 mx-1 mt-1.5 mb-1.5" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-1 px-1", children: TRANSFORM_MODES.map(({ m, icon, label }) => /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          onClick: () => {
            setMode(m);
            setTransformMode(m);
          },
          title: label,
          className: cn(
            "flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded text-xs transition-colors border",
            mode === m ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
          ),
          children: [
            icon,
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px]", children: label })
          ]
        },
        m
      )) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-1 mt-1", children: /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          onClick: () => resetRotation(),
          title: "Reset the box back to axis-aligned",
          className: "w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[10px] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RotateCcw, { size: 12 }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Reset rotation" })
          ]
        }
      ) })
    ] })
  ] });
}

// src/components/sidebar/sidebar.tsx
init_locale_context();
init_viewer_provider();

// src/components/sidebar/pano-panel.tsx
init_utils();
init_viewer_provider();
init_data_provider();
init_locale_context();
function PanoPanel() {
  const { cameraAnimator, markerManager, setSelectedCamera, showMarkers, setShowMarkers } = useViewer();
  const { cameras } = useData();
  const t = useLocale().panoPanel;
  const tToolbar = useLocale().toolbar;
  const [query, setQuery] = React25.useState("");
  const [selected, setSelected] = React25.useState(null);
  const filtered = React25.useMemo(() => {
    const q = query.toLowerCase();
    return cameras.filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.index).includes(q));
  }, [cameras, query]);
  const flyTo = (idx) => {
    const cam = cameras[idx];
    if (!cam || !cameraAnimator) return;
    setSelected(idx);
    markerManager?.setSelected(idx);
    if (cam.position) {
      cameraAnimator.flyToCamera([cam.position.x, cam.position.y, cam.position.z], cam.yaw_deg ?? 0);
    }
  };
  const openPano = (idx) => {
    const cam = cameras[idx];
    if (!cam) return;
    setSelected(idx);
    setSelectedCamera(cam);
    markerManager?.setSelected(idx);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))] shrink-0", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 bg-muted rounded px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 11, className: "text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: t.searchPlaceholder,
            className: "flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mt-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-[10px] text-muted-foreground font-mono", children: [
          filtered.length,
          " / ",
          cameras.length
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: () => setShowMarkers(!showMarkers),
            title: tToolbar.togglePanoramas,
            className: cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors",
              showMarkers ? "text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)] hover:bg-[hsl(var(--brand)/0.2)]" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            ),
            children: [
              showMarkers ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { size: 11 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { size: 11 }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: tToolbar.panoramas })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 overflow-y-auto", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground text-center mt-8 px-4", children: t.noResults }) : filtered.map((cam) => /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: `flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-[hsl(var(--border)/0.4)] hover:bg-muted transition-colors
                ${selected === cam.index ? "bg-[hsl(var(--brand)/0.12)] border-l-2 border-l-[hsl(var(--brand))]" : ""}`,
        onClick: () => openPano(cam.index),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-10 h-7 rounded shrink-0 bg-muted overflow-hidden", children: cam.thumbnail || cam.image ? /* @__PURE__ */ jsxRuntime.jsx(
            "img",
            {
              src: cam.thumbnail ?? cam.image ?? void 0,
              alt: cam.name,
              className: "w-full h-full object-cover",
              loading: "lazy",
              onError: (e) => {
                e.target.style.display = "none";
              }
            }
          ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Navigation, { size: 10, className: "text-muted-foreground" }) }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs font-mono truncate text-foreground", children: cam.name }),
            cam.position && /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-[9px] text-muted-foreground font-mono", children: [
              cam.position.x.toFixed(1),
              ", ",
              cam.position.y.toFixed(1),
              ", ",
              cam.position.z.toFixed(1)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                flyTo(cam.index);
              },
              title: t.flyTo,
              className: "shrink-0 text-muted-foreground hover:text-[hsl(var(--brand))] transition-colors",
              children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Navigation, { size: 11 })
            }
          )
        ]
      },
      cam.index
    )) })
  ] });
}

// src/components/sidebar/scene-panel.tsx
init_viewer_provider();
init_locale_context();
function ScenePanel() {
  const { measurementList, measurementManager, setMeasurementList, loader, clipManager, clipBoxEntries, selectedClipBoxId } = useViewer();
  const t = useLocale().scenePanel;
  const deleteMeasurement = (id) => {
    measurementManager?.remove(id);
    setMeasurementList((prev) => prev.filter((m) => m.id !== id));
  };
  const clearAll = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col h-full overflow-y-auto text-xs", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: t.pointClouds }),
      loader?.getPointCloud() ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 py-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CloudCog, { size: 12, className: "text-[hsl(var(--brand))] shrink-0" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1 truncate font-mono text-foreground", children: "pointcloud" })
      ] }) : /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground text-[10px]", children: t.noCloudLoaded })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.measurements }),
        measurementList.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: clearAll, title: t.clearAll, className: "text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 11 }) })
      ] }),
      measurementList.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] text-muted-foreground", children: t.none }) : measurementList.map((m) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 py-0.5 group", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Ruler, { size: 11, className: "text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1 truncate font-mono text-foreground capitalize", children: m.type }),
        m.value !== void 0 && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-[10px] text-[hsl(var(--brand))]", children: m.value.toFixed(2) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => deleteMeasurement(m.id),
            className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 10 })
          }
        )
      ] }, m.id))
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.sections }),
        clipBoxEntries.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => clipManager?.clear(), title: t.clearAll, className: "text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 11 }) })
      ] }),
      clipBoxEntries.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] text-muted-foreground", children: t.sectionHint }) : clipBoxEntries.map((box) => /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: `flex items-center gap-1 py-0.5 group rounded px-0.5 ${selectedClipBoxId === box.id ? "bg-[hsl(var(--brand)/0.1)]" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: () => clipManager?.setBoxVisible(box.id, !box.visible),
                className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
                title: box.visible ? "Hide" : "Show",
                children: box.visible ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { size: 11 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { size: 11 })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.BoxSelect, { size: 11, className: "text-[hsl(var(--brand))] shrink-0" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: () => clipManager?.selectBox(selectedClipBoxId === box.id ? null : box.id),
                className: "flex-1 truncate font-mono text-foreground text-left hover:text-[hsl(var(--brand))] transition-colors",
                children: box.name
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: () => clipManager?.setModeAll(box.mode === "outside" ? "inside" : "outside"),
                title: box.mode === "outside" ? "Keep inside (all)" : "Keep outside (all)",
                className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
                children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Scissors, { size: 10 })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[8px] text-muted-foreground font-mono w-6 text-center", children: box.mode === "outside" ? "OUT" : "IN" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: () => clipManager?.removeBox(box.id),
                className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0",
                children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 10 })
              }
            )
          ]
        },
        box.id
      )),
      clipBoxEntries.length > 1 && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[9px] text-muted-foreground mt-1 italic", children: t.clipModeNote })
    ] })
  ] });
}

// src/components/sidebar/measurements-panel.tsx
init_viewer_provider();
init_locale_context();
init_utils();
function formatValue(m) {
  if (m.value === void 0) return "\u2014";
  switch (m.type) {
    case "distance":
    case "height":
      return formatLength(m.value);
    case "area":
      return formatArea(m.value);
    case "volume":
      return formatVolume(m.value);
    case "angle":
      return formatAngle(m.value);
    case "point":
      if (m.points[0]) return formatCoord(m.points[0].x, m.points[0].y, m.points[0].z);
      return "\u2014";
    default:
      return m.value.toFixed(3);
  }
}
function InlineEditName({ value, onSave }) {
  const [editing, setEditing] = React25.useState(false);
  const [draft, setDraft] = React25.useState(value);
  const inputRef = React25.useRef(null);
  React25.useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);
  if (!editing) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "p",
      {
        className: "text-[10px] font-semibold text-foreground cursor-pointer hover:text-[hsl(var(--brand))] transition-colors truncate",
        onClick: () => {
          setDraft(value);
          setEditing(true);
        },
        title: "Click to rename",
        children: value
      }
    );
  }
  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      ref: inputRef,
      type: "text",
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      },
      onBlur: save,
      className: "text-[10px] font-semibold text-foreground bg-muted/60 border border-[hsl(var(--border))] rounded px-1 py-0 w-full outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
    }
  );
}
function MeasurementsPanel() {
  const { measurementList, measurementManager, setMeasurementList } = useViewer();
  const t = useLocale().measurementsPanel;
  ({
    point: t.typePoint,
    distance: t.typeDistance,
    height: t.typeHeight,
    area: t.typeArea,
    volume: t.typeVolume,
    angle: t.typeAngle,
    profile: t.typeProfile
  });
  const del = (id) => {
    measurementManager?.remove(id);
    setMeasurementList((prev) => prev.filter((m) => m.id !== id));
  };
  const clearAll = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };
  const downloadCSV = () => {
    const csv = exportMeasurementsCSV(measurementList);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleRename = (id, name) => {
    measurementManager?.rename(id, name);
    setMeasurementList((prev) => prev.map((m) => m.id === id ? { ...m, label: name } : m));
  };
  if (measurementList.length === 0) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center px-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: t.noMeasurements }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] text-muted-foreground", children: t.useMeasureToolHint })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-2 py-1.5 border-b border-[hsl(var(--border))] shrink-0", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: t.measurementCount(measurementList.length) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick: downloadCSV, title: t.downloadCsv, className: "text-muted-foreground hover:text-[hsl(var(--brand))] text-[10px] flex items-center gap-1 transition-colors", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Download, { size: 10 }),
          " ",
          t.csv
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick: clearAll, title: t.clearAll, className: "text-muted-foreground hover:text-destructive text-[10px] flex items-center gap-1 transition-colors", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 10 }),
          " ",
          t.clearAll
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 overflow-y-auto", children: measurementList.map((m) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 px-2 py-2 border-b border-[hsl(var(--border)/0.4)] hover:bg-muted group transition-colors", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: m.color ?? "hsl(var(--brand))" } }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx(InlineEditName, { value: m.label, onSave: (name) => handleRename(m.id, name) }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-mono text-[hsl(var(--brand))]", children: formatValue(m) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: () => del(m.id),
          className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 11 })
        }
      )
    ] }, m.id)) })
  ] });
}

// src/components/sidebar/classification-panel.tsx
init_viewer_provider();
init_locale_context();
var CLASS_DEFS = [
  { code: 0, color: "#aaaaaa" },
  { code: 1, color: "#888888" },
  { code: 2, color: "#c8a46e" },
  { code: 3, color: "#5ec45e" },
  { code: 4, color: "#2ea02e" },
  { code: 5, color: "#006600" },
  { code: 6, color: "#e07070" },
  { code: 7, color: "#ff4444" },
  { code: 9, color: "#4488ff" },
  { code: 17, color: "#cc88ff" },
  { code: 18, color: "#ff8800" }
];
function ClassificationPanel() {
  const { loader } = useViewer();
  const t = useLocale().classificationPanel;
  const [visible, setVisible] = React25.useState(
    Object.fromEntries(CLASS_DEFS.map((c) => [c.code, true]))
  );
  const toggle = (code) => {
    setVisible((prev) => {
      const next = { ...prev, [code]: !prev[code] };
      const cloud = loader?.getPointCloud();
      if (cloud?.material) {
        const mat = cloud.material;
        if (mat.classification) {
          const THREE3 = window.THREE;
          const hexColor = CLASS_DEFS.find((c) => c.code === code)?.color ?? "#ffffff";
          mat.classification[code] = { visible: next[code], color: THREE3 ? new THREE3.Color(hexColor) : hexColor };
        }
      }
      return next;
    });
  };
  const toggleAll = (on) => {
    const next = Object.fromEntries(CLASS_DEFS.map((c) => [c.code, on]));
    setVisible(next);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col h-full overflow-y-auto p-2", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.title }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => toggleAll(true), className: "text-[9px] text-muted-foreground hover:text-foreground transition-colors", children: t.all }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground text-[9px]", children: "/" }),
        /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => toggleAll(false), className: "text-[9px] text-muted-foreground hover:text-foreground transition-colors", children: t.none })
      ] })
    ] }),
    CLASS_DEFS.map((cls) => /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-center gap-2 py-1 cursor-pointer group", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "checkbox",
          checked: visible[cls.code] ?? true,
          onChange: () => toggle(cls.code),
          className: "accent-[hsl(var(--brand))] w-3 h-3 shrink-0"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-2.5 h-2.5 rounded-sm shrink-0", style: { background: cls.color } }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] font-mono text-foreground", children: cls.code }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] text-muted-foreground truncate", children: t.classLabels[cls.code] ?? String(cls.code) })
    ] }, cls.code))
  ] });
}

// src/components/sidebar/scenes-panel.tsx
init_viewer_provider();
init_locale_context();
init_dist();
function InlineEditSceneName({ value, onSave }) {
  const [editing, setEditing] = React25.useState(false);
  const [draft, setDraft] = React25.useState(value);
  const inputRef = React25.useRef(null);
  React25.useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);
  if (!editing) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "p",
      {
        className: "font-mono text-foreground truncate text-[11px] cursor-pointer hover:text-[hsl(var(--brand))] transition-colors",
        onDoubleClick: () => {
          setDraft(value);
          setEditing(true);
        },
        title: "Double-click to rename",
        children: value
      }
    );
  }
  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      ref: inputRef,
      type: "text",
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      },
      onBlur: save,
      className: "font-mono text-foreground text-[11px] bg-muted/60 border border-[hsl(var(--border))] rounded px-1 py-0 w-full outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
    }
  );
}
function ScenesPanel() {
  const {
    sceneManager,
    cameraAnimator,
    clipManager,
    loader,
    clipBoxEntries,
    colorMode,
    pointSize,
    pointBudget,
    setColorMode,
    setPointSize,
    setPointBudget,
    config
  } = useViewer();
  const t = useLocale().scenesPanel;
  const [scenes, setScenes] = React25.useState([]);
  const [newName, setNewName] = React25.useState("");
  const pmRef = React25.useRef(null);
  const fileInputRef = React25.useRef(null);
  React25.useEffect(() => {
    const key = config.source.type === "s3" ? config.source.baseUrl : config.source.type === "electron" ? config.source.basePath : "local";
    const pm = new exports.PresentationManager(key);
    pm.onChange = (s) => setScenes(s);
    pmRef.current = pm;
    setScenes(pm.getScenes());
  }, [config.source]);
  const handleSave = () => {
    if (!sceneManager || !pmRef.current) return;
    const name = newName.trim() || `Scene ${scenes.length + 1}`;
    const scene = captureScene(
      name,
      sceneManager.camera.position,
      sceneManager.controls.target,
      clipBoxEntries,
      colorMode,
      pointSize,
      pointBudget
    );
    pmRef.current.addScene(scene);
    setNewName("");
  };
  const handleRestore = async (scene) => {
    if (!sceneManager) return;
    const pos = new THREE5__namespace.Vector3(...scene.camera.position);
    const target = new THREE5__namespace.Vector3(...scene.camera.target);
    if (cameraAnimator) {
      await cameraAnimator.flyTo({ position: pos, target, duration: 600 });
    } else {
      sceneManager.camera.position.copy(pos);
      sceneManager.controls.target.copy(target);
      sceneManager.controls.update();
    }
    if (clipManager) {
      clipManager.clear();
      for (const cb of scene.clipBoxes) {
        const box = new THREE5__namespace.Box3(
          new THREE5__namespace.Vector3(...cb.min),
          new THREE5__namespace.Vector3(...cb.max)
        );
        const entry = clipManager.addBox(box, cb.name);
        if (cb.mode !== entry.mode) clipManager.setBoxMode(entry.id, cb.mode);
        if (!cb.visible) clipManager.setBoxVisible(entry.id, false);
      }
    }
    if (scene.colorMode && loader) {
      const cm = scene.colorMode;
      await loader.setColorMode(cm);
      setColorMode(cm);
    }
    if (scene.pointSize) {
      loader?.setPointSize(scene.pointSize);
      setPointSize(scene.pointSize);
    }
    if (scene.pointBudget) {
      loader?.setPointBudget(scene.pointBudget);
      setPointBudget(scene.pointBudget);
    }
  };
  const handleExport = () => {
    if (!pmRef.current) return;
    const json = pmRef.current.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenes_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file || !pmRef.current) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      pmRef.current?.importJSON(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col h-full overflow-y-auto text-xs", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: t.saveScene }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "text",
            value: newName,
            onChange: (e) => setNewName(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && handleSave(),
            placeholder: t.namePlaceholder,
            className: "flex-1 bg-muted/40 border border-[hsl(var(--border))] rounded px-1.5 py-0.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: handleSave,
            title: t.save,
            className: "px-2 py-0.5 rounded bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)] transition-colors",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 13 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2 flex-1", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.savedScenes }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: handleExport, title: t.exportJson, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Download, { size: 11 }) }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => fileInputRef.current?.click(), title: t.importJson, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Upload, { size: 11 }) }),
          /* @__PURE__ */ jsxRuntime.jsx("input", { ref: fileInputRef, type: "file", accept: ".json", onChange: handleImport, className: "hidden" })
        ] })
      ] }),
      scenes.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] text-muted-foreground", children: t.noScenes }) : scenes.map((scene) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 py-1 group border-b border-[hsl(var(--border)/0.3)] last:border-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Bookmark, { size: 11, className: "text-[hsl(var(--brand))] shrink-0" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntime.jsx(InlineEditSceneName, { value: scene.name, onSave: (name) => pmRef.current?.renameScene(scene.id, name) }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-[8px] text-muted-foreground font-mono", children: [
            new Date(scene.createdAt).toLocaleDateString(),
            scene.clipBoxes.length > 0 && ` \xB7 ${scene.clipBoxes.length} clip`
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => handleRestore(scene),
            title: t.restore,
            className: "text-[hsl(var(--brand))] hover:text-foreground transition-colors shrink-0",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Play, { size: 12 })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => pmRef.current?.removeScene(scene.id),
            className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 10 })
          }
        )
      ] }, scene.id))
    ] })
  ] });
}
function Sidebar() {
  const [tab, setTab] = React25.useState("panoramas");
  const t = useLocale().sidebar;
  const { uiMode } = useViewer();
  const isPro = uiMode === "professional";
  const ALL_TABS = [
    { id: "panoramas", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Camera, { size: 14 }), label: t.tabPanoramas },
    { id: "scene", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Layers, { size: 14 }), label: t.tabScene },
    { id: "measurements", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Ruler, { size: 14 }), label: t.tabMeasurements },
    { id: "classification", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Tag, { size: 14 }), label: t.tabClassification, proOnly: true },
    { id: "scenes", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Bookmark, { size: 14 }), label: t.tabScenes, proOnly: true }
  ];
  const TABS = ALL_TABS.filter((entry) => isPro || !entry.proOnly);
  const activeTab = TABS.some((tb) => tb.id === tab) ? tab : "panoramas";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex border-b border-white/10 shrink-0", children: TABS.map((tb) => /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: () => setTab(tb.id),
        title: tb.label,
        className: `flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-mono transition-colors
              ${activeTab === tb.id ? "text-[hsl(var(--brand))] border-b-2 border-[hsl(var(--brand))] -mb-px" : "text-white/50 hover:text-white/80"}`,
        children: [
          tb.icon,
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "hidden xl:block", children: tb.label })
        ]
      },
      tb.id
    )) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 overflow-hidden", children: [
      activeTab === "panoramas" && /* @__PURE__ */ jsxRuntime.jsx(PanoPanel, {}),
      activeTab === "scene" && /* @__PURE__ */ jsxRuntime.jsx(ScenePanel, {}),
      activeTab === "measurements" && /* @__PURE__ */ jsxRuntime.jsx(MeasurementsPanel, {}),
      activeTab === "classification" && /* @__PURE__ */ jsxRuntime.jsx(ClassificationPanel, {}),
      activeTab === "scenes" && /* @__PURE__ */ jsxRuntime.jsx(ScenesPanel, {})
    ] })
  ] });
}

// src/components/overlays/pano-viewer.tsx
init_viewer_provider();
init_locale_context();

// src/components/overlays/pano-engines/pannellum.ts
var PANNELLUM_VERSION = "2.5.6";
var CDN = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build`;
var pannellumPromise = null;
function loadPannellum() {
  const w = window;
  if (w.pannellum) return Promise.resolve(w.pannellum);
  if (pannellumPromise) return pannellumPromise;
  pannellumPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("pannellum-css")) {
      const link = document.createElement("link");
      link.id = "pannellum-css";
      link.rel = "stylesheet";
      link.href = `${CDN}/pannellum.css`;
      document.head.appendChild(link);
    }
    const onLoad = () => resolve(window.pannellum);
    const onError = () => {
      pannellumPromise = null;
      reject(new Error("Failed to load Pannellum from CDN"));
    };
    const existing = document.getElementById("pannellum-js");
    if (existing) {
      if (window.pannellum) {
        onLoad();
        return;
      }
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }
    const script = document.createElement("script");
    script.id = "pannellum-js";
    script.src = `${CDN}/pannellum.js`;
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);
  });
  return pannellumPromise;
}
var initPannellum = async (container, camera) => {
  if (!camera.image) return { destroy() {
  } };
  const pannellum = await loadPannellum();
  const viewer = pannellum.viewer(container, {
    type: "equirectangular",
    panorama: camera.image,
    autoLoad: true,
    showZoomCtrl: false,
    showFullscreenCtrl: false,
    compass: false,
    yaw: camera.yaw_deg ?? 0,
    hfov: 100,
    minHfov: 30,
    maxHfov: 150
  });
  return {
    destroy() {
      try {
        viewer.destroy();
      } catch {
      }
    }
  };
};

// src/components/overlays/pano-engines/photo-sphere.ts
var PSV_VERSION = "5";
var PSV_ESM_URL = `https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@${PSV_VERSION}/+esm`;
var PSV_CSS_URL = `https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@${PSV_VERSION}/index.css`;
var runtimeImport = new Function("u", "return import(u)");
var psvModulePromise = null;
function loadPsv() {
  if (!psvModulePromise) psvModulePromise = runtimeImport(PSV_ESM_URL);
  return psvModulePromise;
}
var initPhotoSphere = async (container, camera) => {
  if (!camera.image) return { destroy() {
  } };
  if (!document.getElementById("psv-core-css")) {
    const link = document.createElement("link");
    link.id = "psv-core-css";
    link.rel = "stylesheet";
    link.href = PSV_CSS_URL;
    document.head.appendChild(link);
  }
  const mod = await loadPsv();
  const Viewer = mod.Viewer;
  if (!Viewer) throw new Error("Photo Sphere Viewer: `Viewer` export not found on CDN module");
  const viewer = new Viewer({
    container,
    panorama: camera.image,
    // PSV accepts an angle string; convert the camera's yaw (degrees) directly.
    defaultYaw: `${camera.yaw_deg ?? 0}deg`,
    // Built-in controls: zoom in/out, pan/move, and fullscreen. Mouse-wheel zoom
    // and drag-to-look are on by default; these add the on-screen buttons.
    navbar: ["zoom", "move", "fullscreen"],
    mousewheel: true,
    loadingTxt: ""
  });
  return {
    destroy() {
      try {
        viewer.destroy();
      } catch {
      }
    }
  };
};

// src/components/overlays/pano-engines/index.ts
var ENGINES = {
  pannellum: initPannellum,
  "photo-sphere-viewer": initPhotoSphere
};
function getPanoEngine(engine) {
  return ENGINES[engine] ?? initPhotoSphere;
}
function PanoViewer() {
  const { selectedCamera, setSelectedCamera, panoEngine, setPanoEngine } = useViewer();
  const tPano = useLocale().panoViewer;
  const containerRef = React25.useRef(null);
  const instanceRef = React25.useRef(null);
  React25.useEffect(() => {
    const container = containerRef.current;
    if (!selectedCamera?.image || !container) return;
    let cancelled = false;
    const init = getPanoEngine(panoEngine);
    instanceRef.current?.destroy();
    instanceRef.current = null;
    init(container, selectedCamera).then((instance) => {
      if (cancelled) {
        instance.destroy();
        return;
      }
      instanceRef.current = instance;
    }).catch(console.error);
    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [selectedCamera, panoEngine]);
  if (!selectedCamera) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute inset-0 z-40 bg-black flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur shrink-0", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Navigation, { size: 14, className: "text-[hsl(var(--brand))]" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm font-mono text-white", children: selectedCamera.name }),
        selectedCamera.position && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs text-white/50 font-mono hidden sm:block", children: [
          selectedCamera.position.x.toFixed(2),
          ", ",
          selectedCamera.position.y.toFixed(2),
          ", ",
          selectedCamera.position.z.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center rounded-md border border-white/15 overflow-hidden text-[11px] font-mono", children: ["pannellum", "photo-sphere-viewer"].map((eng) => /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => setPanoEngine(eng),
            className: panoEngine === eng ? "px-2 py-0.5 bg-[hsl(var(--brand))] text-black" : "px-2 py-0.5 text-white/60 hover:text-white hover:bg-white/10",
            title: eng === "pannellum" ? "Pannellum" : "Photo Sphere Viewer",
            children: eng === "pannellum" ? "Pannellum" : "PSV"
          },
          eng
        )) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => setSelectedCamera(null),
            className: "text-white/70 hover:text-white transition-colors p-1",
            title: tPano.close,
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 18 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { ref: containerRef, className: "flex-1" }, panoEngine)
  ] });
}

// src/components/overlays/rendering-settings.tsx
init_viewer_provider();
init_locale_context();
function useDraggable(options) {
  const [position, setPosition] = React25.useState({ x: 0, y: 0 });
  const positionRef = React25.useRef({ x: 0, y: 0 });
  const boundsRef = React25.useRef(options?.bounds);
  boundsRef.current = options?.bounds;
  const moveRef = React25.useRef(null);
  const upRef = React25.useRef(null);
  const endDrag = React25.useCallback(() => {
    if (moveRef.current) window.removeEventListener("mousemove", moveRef.current);
    if (upRef.current) window.removeEventListener("mouseup", upRef.current);
    moveRef.current = null;
    upRef.current = null;
  }, []);
  React25.useEffect(() => endDrag, [endDrag]);
  const reset = React25.useCallback(() => {
    positionRef.current = { x: 0, y: 0 };
    setPosition({ x: 0, y: 0 });
  }, []);
  const onDragStart = React25.useCallback(
    (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const baseX = positionRef.current.x;
      const baseY = positionRef.current.y;
      const rect = boundsRef.current?.current?.getBoundingClientRect() ?? null;
      const onMove = (ev) => {
        let dx = ev.clientX - startX;
        let dy = ev.clientY - startY;
        if (rect) {
          const cx = Math.min(rect.right, Math.max(rect.left, ev.clientX));
          const cy = Math.min(rect.bottom, Math.max(rect.top, ev.clientY));
          dx = cx - startX;
          dy = cy - startY;
        }
        const next = { x: baseX + dx, y: baseY + dy };
        positionRef.current = next;
        setPosition(next);
      };
      moveRef.current = onMove;
      upRef.current = endDrag;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", endDrag);
    },
    [endDrag]
  );
  return { position, onDragStart, reset };
}
function RenderingSettings({ open, onClose }) {
  const { loader } = useViewer();
  const t = useLocale().renderingSettings;
  const pcvRoot = usePcvRoot();
  const { position, onDragStart, reset } = useDraggable({ bounds: pcvRoot ?? void 0 });
  React25.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);
  const [rgbGamma, setRgbGamma] = React25.useState(1);
  const [rgbBrightness, setRgbBrightness] = React25.useState(0);
  const [rgbContrast, setRgbContrast] = React25.useState(0);
  const [intensityGamma, setIntensityGamma] = React25.useState(1);
  const [intensityBrightness, setIntensityBrightness] = React25.useState(0);
  const [intensityContrast, setIntensityContrast] = React25.useState(0);
  const [intensityRange, setIntensityRange] = React25.useState([0, 65535]);
  const [heightMin, setHeightMin] = React25.useState(0);
  const [heightMax, setHeightMax] = React25.useState(100);
  const [opacity, setOpacity] = React25.useState(1);
  React25.useEffect(() => {
    if (!open || !loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    const mat = pc.material;
    if (!mat) return;
    setRgbGamma(mat.uniforms?.rgbGamma?.value ?? mat.rgbGamma ?? 1);
    setRgbBrightness(mat.uniforms?.rgbBrightness?.value ?? mat.rgbBrightness ?? 0);
    setRgbContrast(mat.uniforms?.rgbContrast?.value ?? mat.rgbContrast ?? 0);
    setIntensityGamma(mat.uniforms?.intensityGamma?.value ?? mat.intensityGamma ?? 1);
    setIntensityBrightness(mat.uniforms?.intensityBrightness?.value ?? mat.intensityBrightness ?? 0);
    setIntensityContrast(mat.uniforms?.intensityContrast?.value ?? mat.intensityContrast ?? 0);
    setOpacity(mat.opacity ?? 1);
    const wb2 = loader.worldBox;
    if (wb2 && !wb2.isEmpty()) {
      setHeightMin(mat.uniforms?.heightMin?.value ?? mat.heightMin ?? wb2.min.z);
      setHeightMax(mat.uniforms?.heightMax?.value ?? mat.heightMax ?? wb2.max.z);
    }
    const ir = mat.uniforms?.intensityRange?.value ?? mat.intensityRange;
    if (ir) setIntensityRange([ir[0] ?? 0, ir[1] ?? 65535]);
  }, [open, loader]);
  const apply = (setter, prop, value) => {
    setter(value);
    if (!loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    const mat = pc.material;
    if (!mat) return;
    mat[prop] = value;
    mat.needsUpdate = true;
  };
  const applyIntensityRange = (min, max) => {
    setIntensityRange([min, max]);
    if (!loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    const mat = pc.material;
    if (!mat) return;
    mat.intensityRange = [min, max];
    mat.needsUpdate = true;
  };
  if (!open) return null;
  const wb = loader?.worldBox;
  const zMin = wb && !wb.isEmpty() ? wb.min.z : -100;
  const zMax = wb && !wb.isEmpty() ? wb.max.z : 100;
  const zRange = zMax - zMin;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "absolute top-12 left-12 z-50 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-xl",
      style: { transform: `translate(${position.x}px, ${position.y}px)` },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: "flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))] cursor-move select-none",
            onMouseDown: onDragStart,
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sliders, { size: 14, className: "text-[hsl(var(--brand))]" }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-semibold", children: t.title })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: onClose,
                  onMouseDown: (e) => e.stopPropagation(),
                  className: "text-muted-foreground hover:text-foreground transition-colors p-0.5",
                  children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 14 })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-3 space-y-4 text-xs", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(Section, { title: t.rgbSection, children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Slider,
              {
                label: t.gamma,
                value: rgbGamma,
                min: 0.1,
                max: 4,
                step: 0.05,
                onChange: (v) => apply(setRgbGamma, "rgbGamma", v)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Slider,
              {
                label: t.brightness,
                value: rgbBrightness,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => apply(setRgbBrightness, "rgbBrightness", v)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Slider,
              {
                label: t.contrast,
                value: rgbContrast,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => apply(setRgbContrast, "rgbContrast", v)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(Section, { title: t.intensitySection, children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Slider,
              {
                label: t.gamma,
                value: intensityGamma,
                min: 0.1,
                max: 4,
                step: 0.05,
                onChange: (v) => apply(setIntensityGamma, "intensityGamma", v)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Slider,
              {
                label: t.brightness,
                value: intensityBrightness,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => apply(setIntensityBrightness, "intensityBrightness", v)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Slider,
              {
                label: t.contrast,
                value: intensityContrast,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => apply(setIntensityContrast, "intensityContrast", v)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-16 text-muted-foreground", children: t.range }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  type: "number",
                  value: intensityRange[0],
                  min: 0,
                  max: 65535,
                  onChange: (e) => applyIntensityRange(Number(e.target.value), intensityRange[1]),
                  className: "w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground", children: "\u2013" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  type: "number",
                  value: intensityRange[1],
                  min: 0,
                  max: 65535,
                  onChange: (e) => applyIntensityRange(intensityRange[0], Number(e.target.value)),
                  className: "w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(Section, { title: t.elevationSection, children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Slider,
              {
                label: t.elevMin,
                value: heightMin,
                min: zMin - zRange * 0.1,
                max: zMax + zRange * 0.1,
                step: zRange / 200,
                onChange: (v) => apply(setHeightMin, "heightMin", v),
                display: (v) => v.toFixed(1) + "m"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Slider,
              {
                label: t.elevMax,
                value: heightMax,
                min: zMin - zRange * 0.1,
                max: zMax + zRange * 0.1,
                step: zRange / 200,
                onChange: (v) => apply(setHeightMax, "heightMax", v),
                display: (v) => v.toFixed(1) + "m"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(Section, { title: t.generalSection, children: /* @__PURE__ */ jsxRuntime.jsx(
            Slider,
            {
              label: t.opacity,
              value: opacity,
              min: 0,
              max: 1,
              step: 0.02,
              onChange: (v) => apply(setOpacity, "opacity", v)
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              onClick: () => {
                apply(setRgbGamma, "rgbGamma", 1);
                apply(setRgbBrightness, "rgbBrightness", 0);
                apply(setRgbContrast, "rgbContrast", 0);
                apply(setIntensityGamma, "intensityGamma", 1);
                apply(setIntensityBrightness, "intensityBrightness", 0);
                apply(setIntensityContrast, "intensityContrast", 0);
                apply(setOpacity, "opacity", 1);
                if (wb && !wb.isEmpty()) {
                  apply(setHeightMin, "heightMin", wb.min.z);
                  apply(setHeightMax, "heightMax", wb.max.z);
                }
                applyIntensityRange(0, 65535);
              },
              className: "w-full py-1.5 text-center rounded bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors text-[10px] font-mono",
              children: t.reset
            }
          )
        ] })
      ]
    }
  );
}
function Section({ title, children }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-1.5", children })
  ] });
}
function Slider({ label, value, min, max, step, onChange, display }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-16 text-muted-foreground shrink-0", children: label }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        type: "range",
        min,
        max,
        step,
        value,
        onChange: (e) => onChange(Number(e.target.value)),
        className: "flex-1 accent-[hsl(var(--brand))] h-1"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-12 text-right font-mono text-[10px] tabular-nums", children: display ? display(value) : value.toFixed(2) })
  ] });
}

// src/components/overlays/quick-settings-popover.tsx
init_utils();
init_viewer_provider();

// src/version.ts
var PCV_VERSION = "0.2.0" ;
var PCV_BUILD = "035144e \xB7 2026-06-17 13:27Z" ;
var PCV_VERSION_STRING = `v${PCV_VERSION} \xB7 ${PCV_BUILD}`;
var COLOR_MODES2 = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "classification", label: "Classification" }
];
function ToggleRow({
  icon,
  label,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      onClick,
      className: "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("text-white/50", active && "text-[hsl(var(--brand))]"), children: icon }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-white/80 flex-1 text-left", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: cn(
              "w-7 h-4 rounded-full transition-colors flex items-center px-0.5",
              active ? "bg-[hsl(var(--brand)/0.6)]" : "bg-white/15"
            ),
            children: /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                className: cn(
                  "w-3 h-3 rounded-full bg-white transition-transform",
                  active && "translate-x-3"
                )
              }
            )
          }
        )
      ]
    }
  );
}
function QuickSettingsPopover({ onClose: _onClose }) {
  const {
    showMarkers,
    setShowMarkers,
    showMinimap,
    setShowMinimap,
    colorMode,
    setColorMode,
    pointSize,
    setPointSize,
    loader
  } = useViewer();
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute top-16 right-3 z-40", children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "w-56 p-3 space-y-3",
        "backdrop-blur-xl bg-black/30 dark:bg-black/40",
        "border border-white/15 dark:border-white/10",
        "rounded-xl shadow-2xl shadow-black/20"
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "View Settings" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            ToggleRow,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Camera, { size: 14 }),
              label: "Panoramas",
              active: showMarkers,
              onClick: () => setShowMarkers(!showMarkers)
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ToggleRow,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Map, { size: 14 }),
              label: "Minimap",
              active: showMinimap,
              onClick: () => setShowMinimap(!showMinimap)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Color" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-2 gap-1", children: COLOR_MODES2.map((cm) => /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              onClick: () => {
                setColorMode(cm.value);
                loader?.setColorMode(cm.value);
              },
              className: cn(
                "text-[10px] py-1 px-2 rounded-lg transition-colors",
                colorMode === cm.value ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))]" : "text-white/60 hover:text-white hover:bg-white/10"
              ),
              children: cm.label
            },
            cm.value
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Point Size" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-1", children: /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              type: "range",
              min: 0.5,
              max: 5,
              step: 0.1,
              value: pointSize,
              onChange: (e) => {
                const v = parseFloat(e.target.value);
                setPointSize(v);
                loader?.setPointSize(v);
              },
              className: "pcv-slider w-full"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-white/10 pt-2 px-1", children: /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-[9px] font-mono text-white/35 leading-tight", title: "Viewer version \xB7 build", children: [
          "v",
          PCV_VERSION,
          " \xB7 ",
          PCV_BUILD
        ] }) })
      ]
    }
  ) });
}
var chromeScale = { zoom: "var(--pcv-scale, 1)" };
var Viewport2 = React25.lazy(() => Promise.resolve().then(() => (init_viewport(), viewport_exports)).then((m) => ({ default: m.Viewport })));
function ViewportFallback() {
  const t = useLocale().viewport;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full flex items-center justify-center bg-[hsl(var(--background))]", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: t.initialisingRenderer })
  ] }) });
}
function GlassCard({ children, className }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        "backdrop-blur-xl bg-black/30 dark:bg-black/40",
        "border border-white/15 dark:border-white/10",
        "rounded-2xl shadow-2xl shadow-black/20",
        className
      ),
      children
    }
  );
}
function WorkspaceLayout({ className }) {
  const [sidebarOpen, setSidebarOpen] = React25.useState(true);
  const [renderSettingsOpen, setRenderSettingsOpen] = React25.useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = React25.useState(false);
  const { fps, pointBudget, activeTool, selectedCamera, uiMode, clipBoxEntries } = useViewer();
  const { metadata } = useData();
  const t = useLocale().viewport;
  const isPro = uiMode === "professional";
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "relative h-full w-full bg-[hsl(var(--background))] text-foreground overflow-hidden",
        // Publish the minimap's right offset so it sits just left of the sidebar
        // when open and snaps back to the edge when closed (the minimap, inside
        // the viewport, consumes `--pcv-minimap-right`).
        sidebarOpen ? "[--pcv-minimap-right:19.25rem] xl:[--pcv-minimap-right:21.25rem]" : "[--pcv-minimap-right:0.75rem]",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0", children: /* @__PURE__ */ jsxRuntime.jsx(React25.Suspense, { fallback: /* @__PURE__ */ jsxRuntime.jsx(ViewportFallback, {}), children: /* @__PURE__ */ jsxRuntime.jsx(Viewport2, {}) }) }),
        selectedCamera && /* @__PURE__ */ jsxRuntime.jsx(PanoViewer, {}),
        /* @__PURE__ */ jsxRuntime.jsx(RenderingSettings, { open: renderSettingsOpen, onClose: () => setRenderSettingsOpen(false) }),
        isPro && quickSettingsOpen && /* @__PURE__ */ jsxRuntime.jsx(QuickSettingsPopover, { onClose: () => setQuickSettingsOpen(false) }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none", style: chromeScale, children: /* @__PURE__ */ jsxRuntime.jsx(GlassCard, { className: "pointer-events-auto", children: /* @__PURE__ */ jsxRuntime.jsx(
          MainToolbar,
          {
            onToggleRenderSettings: isPro ? () => setRenderSettingsOpen((o) => !o) : void 0,
            renderSettingsOpen,
            onToggleQuickSettings: isPro ? () => setQuickSettingsOpen((o) => !o) : void 0,
            quickSettingsOpen
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute left-3 top-14 bottom-14 z-30 pointer-events-none flex items-center", style: chromeScale, children: /* @__PURE__ */ jsxRuntime.jsx(GlassCard, { className: "pointer-events-auto overflow-y-auto max-h-full", children: /* @__PURE__ */ jsxRuntime.jsx(ToolRail, {}) }) }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: cn(
              "absolute top-16 bottom-10 right-3 z-30 w-72 xl:w-80",
              "transition-transform duration-200",
              sidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+0.75rem)]"
            ),
            style: chromeScale,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: () => setSidebarOpen((o) => !o),
                  title: sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
                  "aria-label": sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
                  className: cn(
                    "absolute top-1/2 -translate-y-1/2 -left-7 z-40",
                    "flex items-center justify-center w-7 h-16 rounded-l-lg",
                    "backdrop-blur-xl bg-black/45 dark:bg-black/55",
                    "border border-r-0 border-white/25 dark:border-white/20",
                    "shadow-2xl shadow-black/30",
                    "text-white/80 hover:text-[hsl(var(--brand))] hover:bg-black/55 transition-colors"
                  ),
                  children: sidebarOpen ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { size: 18 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronLeft, { size: 18 })
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(GlassCard, { className: "h-full overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(Sidebar, {}) })
            ]
          }
        ),
        isPro && clipBoxEntries.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none", style: chromeScale, children: /* @__PURE__ */ jsxRuntime.jsx(GlassCard, { className: "pointer-events-auto", children: /* @__PURE__ */ jsxRuntime.jsx(ClipToolbar, {}) }) }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none", style: chromeScale, children: /* @__PURE__ */ jsxRuntime.jsx(GlassCard, { className: "pointer-events-none", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-white/50 select-none", children: [
          metadata && /* @__PURE__ */ jsxRuntime.jsx("span", { children: t.statusPts(metadata.points / 1e6) }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: t.statusBudget(pointBudget / 1e6) }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: t.statusFps(fps) }),
          activeTool !== "none" && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[hsl(var(--brand))]", children: activeTool })
        ] }) }) })
      ]
    }
  );
}

// src/ui/button.tsx
init_utils();
var buttonVariants = classVarianceAuthority.cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/.85)]",
        secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary)/.8)]",
        ghost: "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
        outline: "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
        destructive: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/.85)]"
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-4",
        icon: "h-8 w-8 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var Button = React25__default.default.forwardRef(
  ({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      ref,
      className: cn(buttonVariants({ variant, size }), className),
      ...props
    }
  )
);
Button.displayName = "Button";

// src/ui/slider.tsx
init_utils();
var Slider2 = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsxs(
  SliderPrimitive__namespace.Root,
  {
    ref,
    className: cn(
      "relative flex w-full touch-none select-none items-center",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx(SliderPrimitive__namespace.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-[hsl(var(--muted))]", children: /* @__PURE__ */ jsxRuntime.jsx(SliderPrimitive__namespace.Range, { className: "absolute h-full bg-[hsl(var(--primary))]" }) }),
      /* @__PURE__ */ jsxRuntime.jsx(SliderPrimitive__namespace.Thumb, { className: "block h-4 w-4 rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--background))] shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider2.displayName = "Slider";

// src/ui/dialog.tsx
init_utils();
var Dialog = DialogPrimitive__namespace.Root;
var DialogTrigger = DialogPrimitive__namespace.Trigger;
var DialogPortal = DialogPrimitive__namespace.Portal;
var DialogOverlay = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  DialogPrimitive__namespace.Overlay,
  {
    ref,
    className: cn("fixed inset-0 z-50 bg-black/50", className),
    ...props
  }
));
DialogOverlay.displayName = "DialogOverlay";
var DialogContent = React25__default.default.forwardRef(({ className, children, container, dragOffset, style, ...props }, ref) => {
  const dx = dragOffset?.x ?? 0;
  const dy = dragOffset?.y ?? 0;
  return /* @__PURE__ */ jsxRuntime.jsxs(DialogPortal, { container: container ?? void 0, children: [
    /* @__PURE__ */ jsxRuntime.jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxRuntime.jsx(
      DialogPrimitive__namespace.Content,
      {
        ref,
        className: cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xl",
          className
        ),
        style: {
          ...style,
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`
        },
        ...props,
        children
      }
    )
  ] });
});
DialogContent.displayName = "DialogContent";
var DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "div",
  {
    className: cn(
      "flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
var DialogTitle = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  DialogPrimitive__namespace.Title,
  {
    ref,
    className: cn("text-sm font-semibold", className),
    ...props
  }
));
DialogTitle.displayName = "DialogTitle";
var DialogClose = React25__default.default.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  DialogPrimitive__namespace.Close,
  {
    ref,
    className: cn(
      "rounded p-1 text-muted-foreground hover:bg-[hsl(var(--muted)/.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      className
    ),
    ...props,
    children: children ?? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 14 })
  }
));
DialogClose.displayName = "DialogClose";

// src/ui/tabs.tsx
init_utils();
var Tabs = TabsPrimitive__namespace.Root;
var TabsList = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  TabsPrimitive__namespace.List,
  {
    ref,
    className: cn(
      "flex gap-1 border-b border-[hsl(var(--border))]",
      className
    ),
    ...props
  }
));
TabsList.displayName = "TabsList";
var TabsTrigger = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  TabsPrimitive__namespace.Trigger,
  {
    ref,
    className: cn(
      "px-3 py-1.5 text-xs font-medium text-muted-foreground -mb-px transition-colors",
      "data-[state=active]:text-[hsl(var(--foreground))] data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--brand))]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  TabsPrimitive__namespace.Content,
  {
    ref,
    className: cn(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      className
    ),
    ...props
  }
));
TabsContent.displayName = "TabsContent";

// src/ui/popover.tsx
init_utils();
var Popover = PopoverPrimitive__namespace.Root;
var PopoverTrigger = PopoverPrimitive__namespace.Trigger;
var PopoverAnchor = PopoverPrimitive__namespace.Anchor;
var PopoverContent = React25__default.default.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(PopoverPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
  PopoverPrimitive__namespace.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-4 text-[hsl(var(--popover-foreground))] shadow-md outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = "PopoverContent";

// src/ui/tooltip.tsx
init_utils();
var TooltipProvider = TooltipPrimitive__namespace.Provider;
var Tooltip = TooltipPrimitive__namespace.Root;
var TooltipTrigger = TooltipPrimitive__namespace.Trigger;
var TooltipContent = React25__default.default.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
  TooltipPrimitive__namespace.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] px-3 py-1.5 text-xs text-[hsl(var(--popover-foreground))] shadow-md",
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = "TooltipContent";

// src/ui/toggle.tsx
init_utils();
var toggleVariants = classVarianceAuthority.cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] data-[state=on]:bg-[hsl(var(--accent))] data-[state=on]:text-[hsl(var(--accent-foreground))]",
        outline: "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] data-[state=on]:bg-[hsl(var(--accent))] data-[state=on]:text-[hsl(var(--accent-foreground))]"
      },
      size: {
        sm: "h-7 px-2 text-xs",
        md: "h-9 px-3",
        icon: "h-8 w-8 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var Toggle = React25__default.default.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  TogglePrimitive__namespace.Root,
  {
    ref,
    className: cn(toggleVariants({ variant, size }), className),
    ...props
  }
));
Toggle.displayName = "Toggle";

// src/ui/select.tsx
init_utils();
var Select = SelectPrimitive__namespace.Root;
var SelectGroup = SelectPrimitive__namespace.Group;
var SelectValue = SelectPrimitive__namespace.Value;
var SelectTrigger = React25__default.default.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsxs(
  SelectPrimitive__namespace.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] shadow-sm",
      "placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Icon, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4 opacity-50 shrink-0" }) })
    ]
  }
));
SelectTrigger.displayName = "SelectTrigger";
var SelectScrollUpButton = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  SelectPrimitive__namespace.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";
var SelectScrollDownButton = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  SelectPrimitive__namespace.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";
var SelectContent = React25__default.default.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsxs(
  SelectPrimitive__namespace.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsxRuntime.jsx(
        SelectPrimitive__namespace.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = "SelectContent";
var SelectLabel = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  SelectPrimitive__namespace.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
      className
    ),
    ...props
  }
));
SelectLabel.displayName = "SelectLabel";
var SelectItem = React25__default.default.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsxs(
  SelectPrimitive__namespace.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "focus:bg-[hsl(var(--accent))] focus:text-[hsl(var(--accent-foreground))]",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.ItemIndicator, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.ItemText, { children })
    ]
  }
));
SelectItem.displayName = "SelectItem";
var SelectSeparator = React25__default.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  SelectPrimitive__namespace.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-[hsl(var(--border))]", className),
    ...props
  }
));
SelectSeparator.displayName = "SelectSeparator";
var defaultComponents = {
  Button,
  Slider: Slider2,
  Toggle,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator
};
var ComponentsContext = React25.createContext(defaultComponents);
function ComponentsProvider({
  components,
  children
}) {
  const merged = React25.useMemo(
    () => components ? { ...defaultComponents, ...components } : defaultComponents,
    [components]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(ComponentsContext.Provider, { value: merged, children });
}
function useComponents() {
  return React25.useContext(ComponentsContext);
}

// src/components/pano-cloud-viewer.tsx
init_dist();
init_utils();
var Viewport4 = React25.lazy(() => Promise.resolve().then(() => (init_viewport(), viewport_exports)).then((m) => ({ default: m.Viewport })));
var PcvRootContext = React25.createContext(null);
function usePcvRoot() {
  return React25.useContext(PcvRootContext);
}
var UiScaleContext = React25.createContext(1);
function ViewportFallback2() {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full flex items-center justify-center bg-[hsl(var(--background))]", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: "Initialising renderer\u2026" })
  ] }) });
}
function PanoOverlayBridge() {
  const { selectedCamera } = useViewer();
  if (!selectedCamera) return null;
  return /* @__PURE__ */ jsxRuntime.jsx(PanoViewer, {});
}
function PcvRoot({ className, uiScale = 1, children }) {
  const { resolvedTheme } = useTheme();
  const rootRef = React25.useRef(null);
  const rootStyle = { "--pcv-scale": uiScale };
  return /* @__PURE__ */ jsxRuntime.jsx(PcvRootContext.Provider, { value: rootRef, children: /* @__PURE__ */ jsxRuntime.jsx(UiScaleContext.Provider, { value: uiScale, children: /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: rootRef,
      className: cn("pcv", resolvedTheme, "w-full h-full", className),
      "data-theme": resolvedTheme,
      style: rootStyle,
      children
    }
  ) }) });
}
function PanoCloudViewer({ source, theme = "dark", className, locale, uiMode, panoEngine, uiScale = 1, children, components }) {
  const adapter = createAdapter(source);
  const config = { source, uiMode, panoEngine };
  return /* @__PURE__ */ jsxRuntime.jsx(LocaleProvider, { locale, children: /* @__PURE__ */ jsxRuntime.jsx(ThemeProvider, { defaultTheme: theme, children: /* @__PURE__ */ jsxRuntime.jsx(DataProvider, { adapter, children: /* @__PURE__ */ jsxRuntime.jsx(ViewerProvider, { config, children: /* @__PURE__ */ jsxRuntime.jsx(ComponentsProvider, { components, children: /* @__PURE__ */ jsxRuntime.jsx(PcvRoot, { className, uiScale, children: children ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    children(
      /* @__PURE__ */ jsxRuntime.jsx(React25.Suspense, { fallback: /* @__PURE__ */ jsxRuntime.jsx(ViewportFallback2, {}), children: /* @__PURE__ */ jsxRuntime.jsx(Viewport4, {}) })
    ),
    /* @__PURE__ */ jsxRuntime.jsx(PanoOverlayBridge, {})
  ] }) : /* @__PURE__ */ jsxRuntime.jsx(WorkspaceLayout, {}) }) }) }) }) }) });
}

// src/index.ts
init_viewer_provider();
init_data_provider();

// src/layouts/minimal/minimal-toolbar.tsx
init_utils();
init_viewer_provider();

// src/layouts/minimal/minimal-settings-popover.tsx
init_utils();
init_viewer_provider();
var COLOR_MODES3 = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "classification", label: "Classification" }
];
function ToggleRow2({
  icon,
  label,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      onClick,
      className: "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("text-white/50", active && "text-[hsl(var(--brand))]"), children: icon }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-white/80 flex-1 text-left", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: cn(
              "w-7 h-4 rounded-full transition-colors flex items-center px-0.5",
              active ? "bg-[hsl(var(--brand)/0.6)]" : "bg-white/15"
            ),
            children: /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                className: cn(
                  "w-3 h-3 rounded-full bg-white transition-transform",
                  active && "translate-x-3"
                )
              }
            )
          }
        )
      ]
    }
  );
}
function MinimalSettingsPopover({ onClose }) {
  const {
    showMarkers,
    setShowMarkers,
    showMinimap,
    setShowMinimap,
    colorMode,
    setColorMode,
    pointSize,
    setPointSize,
    loader
  } = useViewer();
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-20 right-8 z-30", children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "w-56 p-3 space-y-3",
        "backdrop-blur-xl bg-black/30 dark:bg-black/40",
        "border border-white/15 dark:border-white/10",
        "rounded-xl shadow-2xl shadow-black/20"
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "View Settings" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            ToggleRow2,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Camera, { size: 14 }),
              label: "Panoramas",
              active: showMarkers,
              onClick: () => setShowMarkers(!showMarkers)
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ToggleRow2,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Map, { size: 14 }),
              label: "Minimap",
              active: showMinimap,
              onClick: () => setShowMinimap(!showMinimap)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Color" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-2 gap-1", children: COLOR_MODES3.map((cm) => /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              onClick: () => {
                setColorMode(cm.value);
                loader?.setColorMode(cm.value);
              },
              className: cn(
                "text-[10px] py-1 px-2 rounded-lg transition-colors",
                colorMode === cm.value ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))]" : "text-white/60 hover:text-white hover:bg-white/10"
              ),
              children: cm.label
            },
            cm.value
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Point Size" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-1", children: /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              type: "range",
              min: 0.5,
              max: 5,
              step: 0.1,
              value: pointSize,
              onChange: (e) => {
                const v = parseFloat(e.target.value);
                setPointSize(v);
                loader?.setPointSize(v);
              },
              className: "pcv-slider w-full"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-white/10 pt-2 px-1", children: /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-[9px] font-mono text-white/35 leading-tight", title: "Viewer version \xB7 build", children: [
          "v",
          PCV_VERSION,
          " \xB7 ",
          PCV_BUILD
        ] }) })
      ]
    }
  ) });
}
function GlassButton({
  icon,
  active,
  onClick,
  title,
  className
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      title,
      onClick,
      className: cn(
        "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
        active ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))] shadow-[0_0_12px_hsl(var(--brand)/0.3)]" : "text-white/70 hover:text-white hover:bg-white/10",
        className
      ),
      children: icon
    }
  );
}
function Separator2() {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6 bg-white/15 mx-0.5" });
}
function MinimalToolbar() {
  const {
    activeTool,
    setActiveTool,
    navigationMode,
    setNavigationMode,
    sceneManager,
    loader
  } = useViewer();
  const [settingsOpen, setSettingsOpen] = React25.useState(false);
  const toggleMeasure = React25.useCallback(
    (tool) => {
      setActiveTool(activeTool === tool ? "none" : tool);
    },
    [activeTool, setActiveTool]
  );
  const fitToView = React25.useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);
  const isMeasuring = activeTool.startsWith("measure-");
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 z-30", children: /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-0.5 px-2 py-1.5",
          "backdrop-blur-xl bg-black/30 dark:bg-black/40",
          "border border-white/15 dark:border-white/10",
          "rounded-2xl shadow-2xl shadow-black/20"
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Orbit, { size: 16 }),
              title: "Orbit",
              active: navigationMode === "orbit",
              onClick: () => setNavigationMode("orbit")
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Rotate3d, { size: 16 }),
              title: "Free rotate",
              active: navigationMode === "free",
              onClick: () => setNavigationMode("free")
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Map, { size: 16 }),
              title: "Pan / Map",
              active: navigationMode === "pan",
              onClick: () => setNavigationMode("pan")
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(Separator2, {}),
          /* @__PURE__ */ jsxRuntime.jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Maximize, { size: 16 }),
              title: "Fit to view",
              onClick: fitToView
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(Separator2, {}),
          /* @__PURE__ */ jsxRuntime.jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Ruler, { size: 16 }),
              title: "Distance",
              active: activeTool === "measure-distance",
              onClick: () => toggleMeasure("measure-distance")
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowUpDown, { size: 16 }),
              title: "Height",
              active: activeTool === "measure-height",
              onClick: () => toggleMeasure("measure-height")
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pentagon, { size: 16 }),
              title: "Area",
              active: activeTool === "measure-area",
              onClick: () => toggleMeasure("measure-area")
            }
          ),
          isMeasuring && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(Separator2, {}),
            /* @__PURE__ */ jsxRuntime.jsx(
              GlassButton,
              {
                icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 16 }),
                title: "Cancel measurement",
                onClick: () => setActiveTool("none"),
                className: "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(Separator2, {}),
          /* @__PURE__ */ jsxRuntime.jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Settings, { size: 16 }),
              title: "View settings",
              active: settingsOpen,
              onClick: () => setSettingsOpen(!settingsOpen)
            }
          )
        ]
      }
    ) }),
    settingsOpen && /* @__PURE__ */ jsxRuntime.jsx(MinimalSettingsPopover, { onClose: () => setSettingsOpen(false) })
  ] });
}
var chromeScale2 = { zoom: "var(--pcv-scale, 1)" };
function MinimalLayout({ viewport }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-full h-full overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0", children: viewport }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { style: chromeScale2, children: /* @__PURE__ */ jsxRuntime.jsx(MinimalToolbar, {}) })
  ] });
}

// src/layouts/workstation/workstation-layout.tsx
init_viewer_provider();
init_data_provider();

// src/layouts/workstation/collapsible-sidebar.tsx
init_utils();
function CollapsibleSidebar({ side, children, defaultOpen = true, width = "w-60" }) {
  const [open, setOpen] = React25.useState(defaultOpen);
  const isLeft = side === "left";
  const ChevronIcon = open ? isLeft ? lucideReact.ChevronLeft : lucideReact.ChevronRight : isLeft ? lucideReact.ChevronRight : lucideReact.ChevronLeft;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(
    "absolute top-0 bottom-0 z-20 flex",
    isLeft ? "left-0" : "right-0",
    isLeft ? "flex-row" : "flex-row-reverse"
  ), children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(
      "h-full overflow-y-auto overflow-x-hidden transition-all duration-200 bg-[hsl(var(--background)/0.95)] backdrop-blur-sm",
      isLeft ? "border-r" : "border-l",
      "border-[hsl(var(--border))]",
      open ? width : "w-0"
    ), children: open && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 space-y-2 min-w-[230px]", children }) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        onClick: () => setOpen(!open),
        className: cn(
          "self-center -mx-px z-10",
          "flex items-center justify-center w-5 h-10 rounded-md",
          "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
          "text-muted-foreground hover:text-foreground transition-colors",
          "shadow-md"
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(ChevronIcon, { size: 14 })
      }
    )
  ] });
}

// src/layouts/workstation/tools-palette.tsx
init_utils();
init_viewer_provider();

// src/layouts/workstation/floating-palette.tsx
init_utils();
function FloatingPalette({ title, icon, children, defaultCollapsed = false, className }) {
  const [collapsed, setCollapsed] = React25.useState(defaultCollapsed);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(
    "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden",
    "min-w-[220px]",
    className
  ), children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: () => setCollapsed(!collapsed),
        className: "flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-muted/40 transition-colors",
        children: [
          icon && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground", children: icon }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1 text-left", children: title }),
          collapsed ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { size: 12 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, { size: 12 })
        ]
      }
    ),
    !collapsed && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-3 pb-3 pt-1 space-y-2 border-t border-[hsl(var(--border))]", children })
  ] });
}
function ToolBtn({ icon, label, active, onClick, disabled }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      title: label,
      onClick,
      disabled,
      className: cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors",
        active ? "bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        disabled && "opacity-30 cursor-not-allowed"
      ),
      children: [
        icon,
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: label })
      ]
    }
  );
}
var MEASURE_TOOLS = [
  { tool: "measure-point", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.MapPin, { size: 14 }), label: "Point" },
  { tool: "measure-distance", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Ruler, { size: 14 }), label: "Distance" },
  { tool: "measure-height", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowUpDown, { size: 14 }), label: "Height" },
  { tool: "measure-area", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pentagon, { size: 14 }), label: "Area" },
  { tool: "measure-volume", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Package, { size: 14 }), label: "Volume" },
  { tool: "measure-angle", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Triangle, { size: 14 }), label: "Angle" },
  { tool: "measure-profile", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Waypoints, { size: 14 }), label: "Profile" }
];
function ToolsPalette() {
  const { activeTool, setActiveTool, clipManager, loader, measurementManager, setMeasurementList, clipBoxEntries } = useViewer();
  const toggle = React25.useCallback((tool) => {
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);
  const hasClipBox = clipBoxEntries.length > 0;
  const clipMode = clipBoxEntries[0]?.mode ?? "outside";
  const addClipBox = React25.useCallback(() => {
    if (!clipManager || !loader) return;
    if (loader.worldBox.isEmpty()) return;
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  }, [clipManager, loader]);
  const clearClipBox = React25.useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);
  const toggleClipMode = React25.useCallback(() => {
    const next = clipMode === "outside" ? "inside" : "outside";
    for (const b of clipBoxEntries) clipManager?.setBoxMode(b.id, next);
  }, [clipManager, clipBoxEntries, clipMode]);
  return /* @__PURE__ */ jsxRuntime.jsxs(FloatingPalette, { title: "Tools", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Ruler, { size: 12 }), children: [
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1", children: "Measure" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-0.5", children: [
      MEASURE_TOOLS.map((def) => /* @__PURE__ */ jsxRuntime.jsx(ToolBtn, { icon: def.icon, label: def.label, active: activeTool === def.tool, onClick: () => toggle(def.tool) }, def.tool)),
      /* @__PURE__ */ jsxRuntime.jsx(ToolBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 14 }), label: "Clear All", onClick: () => {
        measurementManager?.clearAll();
        setMeasurementList([]);
      } })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-3 mb-1", children: "Clipping" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ToolBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.BoxSelect, { size: 14 }), label: hasClipBox ? "Remove Clip Box" : "Add Clip Box", active: hasClipBox, onClick: hasClipBox ? clearClipBox : addClipBox }),
      hasClipBox && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ToolBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Scissors, { size: 14 }), label: `Mode: ${clipMode === "outside" ? "Keep Inside" : "Keep Outside"}`, onClick: toggleClipMode }),
        /* @__PURE__ */ jsxRuntime.jsx(ToolBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RotateCcw, { size: 14 }), label: "Clear Clips", onClick: clearClipBox })
      ] })
    ] })
  ] });
}

// src/layouts/workstation/display-palette.tsx
init_utils();
init_viewer_provider();
var COLOR_MODES4 = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "intensity_gradient", label: "Intensity Grad." },
  { value: "classification", label: "Classification" },
  { value: "return_number", label: "Return #" },
  { value: "source", label: "Source" }
];
var QUALITY_PRESETS2 = [
  { label: "Perf", shape: 0, sizeType: 0 },
  { label: "Balanced", shape: 1, sizeType: 2 },
  { label: "High", shape: 2, sizeType: 2 }
];
function DisplayPalette() {
  const { loader, colorMode, setColorMode, pointBudget, setPointBudget, pointSize, setPointSize } = useViewer();
  return /* @__PURE__ */ jsxRuntime.jsxs(FloatingPalette, { title: "Display", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Palette, { size: 12 }), children: [
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1", children: "Color" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-1", children: COLOR_MODES4.map((cm) => /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        onClick: () => {
          setColorMode(cm.value);
          loader?.setColorMode(cm.value);
        },
        className: cn(
          "text-[10px] px-2 py-0.5 rounded transition-colors",
          colorMode === cm.value ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        ),
        children: cm.label
      },
      cm.value
    )) }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-3 mb-1", children: "Quality" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1", children: QUALITY_PRESETS2.map((q) => /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        onClick: () => {
          loader?.setPointShape(q.shape);
          loader?.setPointSizeType(q.sizeType);
        },
        className: "text-[10px] px-2 py-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
        children: q.label
      },
      q.label
    )) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 mt-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-0.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Budget" }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            (pointBudget / 1e6).toFixed(1),
            "M"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "range",
            min: 5e5,
            max: 1e7,
            step: 1e5,
            value: pointBudget,
            onChange: (e) => {
              const v = parseInt(e.target.value);
              setPointBudget(v);
              loader?.setPointBudget(v);
            },
            className: "pcv-slider w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-0.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Point Size" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: pointSize.toFixed(1) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "range",
            min: 0.5,
            max: 5,
            step: 0.1,
            value: pointSize,
            onChange: (e) => {
              const v = parseFloat(e.target.value);
              setPointSize(v);
              loader?.setPointSize(v);
            },
            className: "pcv-slider w-full"
          }
        )
      ] })
    ] })
  ] });
}

// src/layouts/workstation/view-settings-palette.tsx
init_utils();
init_viewer_provider();
function ToggleRow3({ icon, label, active, onClick }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick, className: "flex items-center gap-2 w-full px-1 py-1 rounded text-xs hover:bg-muted/40 transition-colors", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("text-muted-foreground", active && "text-[hsl(var(--brand))]"), children: icon }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1 text-left text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("w-6 h-3.5 rounded-full transition-colors flex items-center px-0.5", active ? "bg-[hsl(var(--brand)/0.5)]" : "bg-muted/60"), children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("w-2.5 h-2.5 rounded-full bg-foreground/80 transition-transform", active && "translate-x-2.5") }) })
  ] });
}
function ModeBtn({ icon, label, active, onClick }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick, className: cn(
    "flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] transition-colors",
    active ? "bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
  ), children: [
    icon,
    /* @__PURE__ */ jsxRuntime.jsx("span", { children: label })
  ] });
}
function ViewSettingsPalette() {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap, navigationMode, setNavigationMode, projection, setProjection } = useViewer();
  return /* @__PURE__ */ jsxRuntime.jsxs(FloatingPalette, { title: "View", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { size: 12 }), defaultCollapsed: true, children: [
    /* @__PURE__ */ jsxRuntime.jsx(ToggleRow3, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Camera, { size: 13 }), label: "Panoramas", active: showMarkers, onClick: () => setShowMarkers(!showMarkers) }),
    /* @__PURE__ */ jsxRuntime.jsx(ToggleRow3, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Map, { size: 13 }), label: "Minimap", active: showMinimap, onClick: () => setShowMinimap(!showMinimap) }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2 mb-1", children: "Navigation" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ModeBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Orbit, { size: 14 }), label: "Orbit", active: navigationMode === "orbit", onClick: () => setNavigationMode("orbit") }),
      /* @__PURE__ */ jsxRuntime.jsx(ModeBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Rotate3d, { size: 14 }), label: "Free", active: navigationMode === "free", onClick: () => setNavigationMode("free") }),
      /* @__PURE__ */ jsxRuntime.jsx(ModeBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Map, { size: 14 }), label: "Pan", active: navigationMode === "pan", onClick: () => setNavigationMode("pan") })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2 mb-1", children: "Projection" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ModeBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Box, { size: 14 }), label: "Perspective", active: projection === "perspective", onClick: () => setProjection("perspective") }),
      /* @__PURE__ */ jsxRuntime.jsx(ModeBtn, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Square, { size: 14 }), label: "Ortho", active: projection === "orthographic", onClick: () => setProjection("orthographic") })
    ] })
  ] });
}

// src/layouts/workstation/export-palette.tsx
init_utils();
init_viewer_provider();
init_dist();
var VIEWS = [
  { value: "top", label: "Top" },
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" }
];
function ExportPalette() {
  const { exporter } = useViewer();
  const [view, setView] = React25.useState("top");
  const [scale, setScale] = React25.useState(2);
  const [format, setFormat] = React25.useState("png");
  const [bg, setBg] = React25.useState("white");
  const [exporting, setExporting] = React25.useState(false);
  const doExport = React25.useCallback(async () => {
    if (!exporter) return;
    setExporting(true);
    try {
      const url = await exporter.capture({ view, scale, background: bg, format, showScaleBar: false });
      exports.ExportManager.download(url, `export-${view}-${scale}x.${format}`);
    } finally {
      setExporting(false);
    }
  }, [exporter, view, scale, bg, format]);
  return /* @__PURE__ */ jsxRuntime.jsxs(FloatingPalette, { title: "Export", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Image, { size: 12 }), defaultCollapsed: true, children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1", children: VIEWS.map((v) => /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => setView(v.value), className: cn(
      "text-[10px] px-2 py-0.5 rounded transition-colors",
      view === v.value ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
    ), children: v.label }, v.value)) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 mt-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1", children: [1, 2, 4].map((s) => /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick: () => setScale(s), className: cn(
        "text-[10px] px-1.5 py-0.5 rounded transition-colors",
        scale === s ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
      ), children: [
        s,
        "x"
      ] }, s)) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1", children: ["png", "jpeg"].map((f) => /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => setFormat(f), className: cn(
        "text-[10px] px-1.5 py-0.5 rounded transition-colors",
        format === f ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
      ), children: f.toUpperCase() }, f)) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1 mt-1", children: ["white", "black", "transparent"].map((b) => /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => setBg(b), className: cn(
      "text-[10px] px-1.5 py-0.5 rounded transition-colors",
      bg === b ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
    ), children: b === "transparent" ? "Alpha" : b }, b)) }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: doExport,
        disabled: !exporter || exporting,
        className: cn(
          "flex items-center justify-center gap-1.5 w-full mt-2 py-1.5 rounded text-xs font-medium transition-colors",
          "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)]",
          (!exporter || exporting) && "opacity-40 cursor-not-allowed"
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Download, { size: 12 }),
          exporting ? "Exporting..." : "Download"
        ]
      }
    )
  ] });
}
var chromeScale3 = { zoom: "var(--pcv-scale, 1)" };
function WorkstationLayout({ viewport, sidebarSide = "left" }) {
  const { fps, pointBudget, activeTool } = useViewer();
  const { metadata } = useData();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-full h-full overflow-hidden bg-[hsl(var(--background))]", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0", children: viewport }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { style: chromeScale3, children: /* @__PURE__ */ jsxRuntime.jsxs(CollapsibleSidebar, { side: sidebarSide, children: [
      /* @__PURE__ */ jsxRuntime.jsx(ToolsPalette, {}),
      /* @__PURE__ */ jsxRuntime.jsx(DisplayPalette, {}),
      /* @__PURE__ */ jsxRuntime.jsx(ViewSettingsPalette, {}),
      /* @__PURE__ */ jsxRuntime.jsx(ExportPalette, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "absolute bottom-0 left-0 right-0 z-10 px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-muted-foreground/70 bg-[hsl(var(--card)/0.8)] backdrop-blur-sm border-t border-[hsl(var(--border)/0.5)]",
        style: chromeScale3,
        children: [
          metadata && /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            (metadata.points / 1e6).toFixed(1),
            "M pts"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            "Budget: ",
            (pointBudget / 1e6).toFixed(1),
            "M"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            fps,
            " fps"
          ] }),
          activeTool !== "none" && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[hsl(var(--brand))]", children: activeTool })
        ]
      }
    )
  ] });
}

// src/index.ts
init_viewport();

// src/components/toolbar/measure-tools.tsx
init_viewer_provider();
var TOOLS = [
  { type: "point", tool: "measure-point", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.MapPin, { size: 14 }), title: "Point coordinate" },
  { type: "distance", tool: "measure-distance", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Ruler, { size: 14 }), title: "Distance" },
  { type: "height", tool: "measure-height", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowUpDown, { size: 14 }), title: "Height" },
  { type: "area", tool: "measure-area", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pentagon, { size: 14 }), title: "Area" },
  { type: "volume", tool: "measure-volume", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Package, { size: 14 }), title: "Volume" },
  { type: "angle", tool: "measure-angle", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Triangle, { size: 14 }), title: "Angle" },
  { type: "profile", tool: "measure-profile", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Waypoints, { size: 14 }), title: "Profile" }
];
function MeasureTools() {
  const { activeTool, setActiveTool } = useViewer();
  const toggle = (tool) => {
    setActiveTool(activeTool === tool ? "none" : tool);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: TOOLS.map((t) => /* @__PURE__ */ jsxRuntime.jsx(
    ToolbarIconBtn,
    {
      icon: t.icon,
      title: t.title,
      active: activeTool === t.tool,
      onClick: () => toggle(t.tool)
    },
    t.tool
  )) });
}

// src/components/toolbar/section-tools.tsx
init_viewer_provider();
function SectionTools() {
  const { activeTool, setActiveTool, clipManager, loader } = useViewer();
  const addClipBox = () => {
    if (!clipManager || !loader) return;
    const boxes = clipManager.getBoxes();
    if (boxes.length > 0) {
      clipManager.clear();
      return;
    }
    if (loader.worldBox.isEmpty()) return;
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  };
  const hasClipBox = (clipManager?.getBoxes().length ?? 0) > 0;
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.BoxSelect, { size: 14 }),
        title: "Clipping box",
        active: hasClipBox,
        onClick: addClipBox
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Slice, { size: 14 }),
        title: "Clipping plane",
        active: activeTool === "section-plane",
        onClick: () => setActiveTool(activeTool === "section-plane" ? "none" : "section-plane")
      }
    )
  ] });
}

// src/components/overlays/about-dialog.tsx
init_locale_context();
function AboutDialog({ onClose }) {
  const t = useLocale().about;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", onClick: onClose, children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl p-6 w-80 text-sm",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-[hsl(var(--brand))] font-mono text-xs uppercase tracking-widest", children: t.title }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-bold text-foreground text-base", children: t.productName }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground text-xs mt-0.5", children: "@der-ort/pano-cloud-viewer" }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-[10px] font-mono text-muted-foreground/70 mt-1", title: "Viewer version \xB7 build", children: [
            "v",
            PCV_VERSION,
            " \xB7 ",
            PCV_BUILD
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-4", children: t.description }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1 text-xs text-muted-foreground border-t border-[hsl(var(--border))] pt-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { children: t.engineLabel }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { children: t.panoramasLabel }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { children: t.uiLabel })
        ] })
      ]
    }
  ) });
}

// src/components/overlays/display-settings-dialog.tsx
init_utils();
init_viewer_provider();
init_locale_context();
init_dist();
var PRESET_ICONS = {
  compact: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Minus, { size: 18 }),
  standard: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Circle, { size: 18 }),
  prominent: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 18 })
};
function PresetCard({
  preset,
  label,
  description,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "flex flex-col items-center gap-2 rounded-md border p-3 text-center transition-colors",
        "hover:bg-[hsl(var(--muted)/.4)]",
        active ? "border-[hsl(var(--brand))] bg-[hsl(var(--brand)/.08)]" : "border-[hsl(var(--border))]"
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            className: cn(
              "text-muted-foreground",
              active && "text-[hsl(var(--brand))]"
            ),
            children: PRESET_ICONS[preset]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-semibold", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] leading-tight text-muted-foreground", children: description })
      ]
    }
  );
}
function SettingsSection({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-3", children })
  ] });
}
function SliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-24 shrink-0 text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        type: "range",
        className: "pcv-slider flex-1",
        min,
        max,
        step,
        value,
        onChange: (e) => onChange(parseFloat(e.target.value))
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-10 text-right text-xs tabular-nums text-muted-foreground", children: value.toFixed(step < 0.1 ? 2 : 1) })
  ] });
}
function SegmentedRow({
  label,
  value,
  options,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-24 shrink-0 text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 overflow-hidden rounded-md border border-[hsl(var(--border))]", children: options.map((opt, i) => /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(opt.value),
        className: cn(
          "flex-1 px-2 py-1 text-xs transition-colors",
          i > 0 && "border-l border-[hsl(var(--border))]",
          value === opt.value ? "bg-[hsl(var(--brand)/.15)] font-semibold text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-[hsl(var(--muted)/.4)]"
        ),
        children: opt.label
      },
      opt.value
    )) })
  ] });
}
function DisplaySettingsDialog({
  open,
  onOpenChange
}) {
  const viewer = useViewer();
  const {
    Dialog: Dialog2,
    DialogContent: DialogContent2,
    DialogHeader: DialogHeader2,
    DialogTitle: DialogTitle2,
    DialogClose: DialogClose2,
    Tabs: Tabs2,
    TabsList: TabsList2,
    TabsTrigger: TabsTrigger2,
    TabsContent: TabsContent2
  } = useComponents();
  const [localSettings, setLocalSettings] = React25.useState(
    exports.DISPLAY_PRESETS.standard
  );
  const settings = viewer.displaySettings ?? localSettings;
  const setSettings = viewer.setDisplaySettings ?? setLocalSettings;
  const t = useLocale().displaySettings;
  const tx = t;
  const isDe = t.advancedTab === "Erweitert";
  const labelStr = {
    markerLabels: isDe ? "Beschriftungen" : "Labels",
    markerLabelHover: isDe ? "Bei Hover" : "On hover",
    markerLabelAlways: isDe ? "Immer" : "Always",
    markerLabelHidden: isDe ? "Aus" : "Hidden"
  };
  const pcvRoot = usePcvRoot();
  const { position, onDragStart, reset } = useDraggable();
  React25.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);
  const applyPreset = (preset) => {
    setSettings({ ...exports.DISPLAY_PRESETS[preset] });
  };
  const updateField = (key, value) => {
    setSettings({ ...settings, [key]: value, preset: settings.preset });
  };
  return /* @__PURE__ */ jsxRuntime.jsx(Dialog2, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntime.jsxs(
    DialogContent2,
    {
      className: "w-[420px]",
      container: pcvRoot?.current ?? void 0,
      dragOffset: position,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          DialogHeader2,
          {
            className: "cursor-move select-none",
            onMouseDown: onDragStart,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(DialogTitle2, { children: t.title }),
              /* @__PURE__ */ jsxRuntime.jsx(DialogClose2, { onMouseDown: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 14 }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(Tabs2, { defaultValue: "presets", className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(TabsList2, { className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(TabsTrigger2, { value: "presets", children: t.presetsTab }),
            /* @__PURE__ */ jsxRuntime.jsx(TabsTrigger2, { value: "advanced", children: t.advancedTab })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(TabsContent2, { value: "presets", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-3 gap-3", children: ["compact", "standard", "prominent"].map(
            (preset) => /* @__PURE__ */ jsxRuntime.jsx(
              PresetCard,
              {
                preset,
                label: t[`preset_${preset}`] ?? preset,
                description: t[`preset_${preset}_desc`] ?? "",
                active: settings.preset === preset,
                onClick: () => applyPreset(preset)
              },
              preset
            )
          ) }) }),
          /* @__PURE__ */ jsxRuntime.jsx(TabsContent2, { value: "advanced", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntime.jsxs(SettingsSection, { title: t.measurementsSection, children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                SliderRow,
                {
                  label: t.lineWidth,
                  min: 1,
                  max: 6,
                  step: 0.5,
                  value: settings.measurementLineWidth,
                  onChange: (v) => updateField("measurementLineWidth", v)
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                SliderRow,
                {
                  label: t.labelScale,
                  min: 0.3,
                  max: 2.5,
                  step: 0.1,
                  value: settings.measurementLabelScale,
                  onChange: (v) => updateField("measurementLabelScale", v)
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                SliderRow,
                {
                  label: t.sphereRadius,
                  min: 0.02,
                  max: 0.5,
                  step: 0.01,
                  value: settings.measurementSphereRadius,
                  onChange: (v) => updateField("measurementSphereRadius", v)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(SettingsSection, { title: t.markersSection, children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                SliderRow,
                {
                  label: t.markerScale,
                  min: 0.2,
                  max: 3,
                  step: 0.1,
                  value: settings.markerSphereScale,
                  onChange: (v) => updateField("markerSphereScale", v)
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                SliderRow,
                {
                  label: t.markerOpacity,
                  min: 0.1,
                  max: 1,
                  step: 0.05,
                  value: settings.markerSphereOpacity,
                  onChange: (v) => updateField("markerSphereOpacity", v)
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                SliderRow,
                {
                  label: t.markerLabelScale,
                  min: 0.3,
                  max: 2.5,
                  step: 0.1,
                  value: settings.markerLabelScale,
                  onChange: (v) => updateField("markerLabelScale", v)
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                SegmentedRow,
                {
                  label: tx.markerLabels ?? labelStr.markerLabels,
                  value: settings.markerLabelMode ?? "hover",
                  options: [
                    { value: "hover", label: tx.markerLabelHover ?? labelStr.markerLabelHover },
                    { value: "always", label: tx.markerLabelAlways ?? labelStr.markerLabelAlways },
                    { value: "hidden", label: tx.markerLabelHidden ?? labelStr.markerLabelHidden }
                  ],
                  onChange: (v) => updateField("markerLabelMode", v)
                }
              )
            ] })
          ] }) })
        ] })
      ]
    }
  ) });
}

// src/hooks/use-navigation-actions.ts
init_viewer_provider();
function useNavigationActions() {
  const { sceneManager, loader, navigationMode, setNavigationMode, projection, setProjection } = useViewer();
  const fitToView = React25.useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);
  const flyToView = React25.useCallback((preset) => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (wb.isEmpty()) return;
    const cam = sceneManager.camera;
    const controls = sceneManager.controls;
    const target = controls.target.clone();
    const dist = cam.position.distanceTo(target);
    const dirs = {
      top: [0, 0, 1],
      bottom: [0, 0, -1],
      front: [0, -1, 0],
      back: [0, 1, 0],
      left: [-1, 0, 0],
      right: [1, 0, 0]
    };
    const [dx, dy, dz] = dirs[preset];
    setProjection("orthographic");
    cam.position.set(
      target.x + dx * dist,
      target.y + dy * dist,
      target.z + dz * dist
    );
    cam.up.set(0, preset === "top" || preset === "bottom" ? 1 : 0, preset === "top" || preset === "bottom" ? 0 : 1);
    controls.update();
  }, [sceneManager, loader, setProjection]);
  return {
    navigationMode,
    setNavigationMode,
    projection,
    setProjection,
    fitToView,
    flyToView
  };
}

// src/hooks/use-measurement-actions.ts
init_viewer_provider();
init_utils();
function useMeasurementActions() {
  const { activeTool, setActiveTool, measurementManager, measurementList, setMeasurementList } = useViewer();
  const startTool = React25.useCallback((type) => {
    const tool = `measure-${type}`;
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);
  const cancelTool = React25.useCallback(() => {
    setActiveTool("none");
  }, [setActiveTool]);
  const clearAll = React25.useCallback(() => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  }, [measurementManager, setMeasurementList]);
  const remove = React25.useCallback((id) => {
    measurementManager?.remove(id);
  }, [measurementManager]);
  const rename = React25.useCallback((id, name) => {
    measurementManager?.rename(id, name);
  }, [measurementManager]);
  const exportCSV = React25.useCallback(() => {
    exportMeasurementsCSV(measurementList);
  }, [measurementList]);
  return {
    activeTool,
    startTool,
    cancelTool,
    measurements: measurementList,
    clearAll,
    remove,
    rename,
    exportCSV
  };
}

// src/hooks/use-display-actions.ts
init_viewer_provider();
function useDisplayActions() {
  const { loader, colorMode, setColorMode, pointBudget, setPointBudget, pointSize, setPointSize } = useViewer();
  const setQualityPreset = React25.useCallback((preset) => {
    if (!loader) return;
    switch (preset) {
      case "performance":
        loader.setPointShape(0);
        loader.setPointSizeType(0);
        break;
      case "balanced":
        loader.setPointShape(1);
        loader.setPointSizeType(2);
        break;
      case "high":
        loader.setPointShape(2);
        loader.setPointSizeType(2);
        break;
    }
  }, [loader]);
  return {
    colorMode,
    setColorMode,
    pointBudget,
    setPointBudget,
    pointSize,
    setPointSize,
    setQualityPreset
  };
}

// src/hooks/use-export-actions.ts
init_viewer_provider();
init_dist();
function useExportActions() {
  const { exporter } = useViewer();
  const capture = React25.useCallback(async (options) => {
    if (!exporter) return null;
    return exporter.capture(options);
  }, [exporter]);
  const download = React25.useCallback((dataUrl, filename) => {
    exports.ExportManager.download(dataUrl, filename);
  }, []);
  return { capture, download };
}

// src/hooks/use-visibility-actions.ts
init_viewer_provider();
function useVisibilityActions() {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap } = useViewer();
  const toggleMarkers = React25.useCallback(() => {
    setShowMarkers(!showMarkers);
  }, [showMarkers, setShowMarkers]);
  const toggleMinimap = React25.useCallback(() => {
    setShowMinimap(!showMinimap);
  }, [showMinimap, setShowMinimap]);
  return {
    showMarkers,
    toggleMarkers,
    showMinimap,
    toggleMinimap
  };
}

// src/hooks/use-display-settings.ts
init_viewer_provider();
init_dist();
function useDisplaySettings() {
  const viewer = useViewer();
  const [localSettings, setLocalSettings] = React25.useState(exports.DISPLAY_PRESETS.standard);
  const settings = viewer.displaySettings ?? localSettings;
  const setSettings = viewer.setDisplaySettings ?? setLocalSettings;
  const applyPreset = React25.useCallback((preset) => {
    setSettings({ ...exports.DISPLAY_PRESETS[preset] });
  }, [setSettings]);
  const updateSetting = React25.useCallback((key, value) => {
    setSettings({ ...settings, preset: "standard", [key]: value });
  }, [settings, setSettings]);
  return {
    settings,
    presets: exports.DISPLAY_PRESETS,
    applyPreset,
    updateSetting
  };
}

// src/index.ts
init_utils();
init_locale_context();
init_en();

// src/i18n/types.ts
function createLocale(base, overrides) {
  return deepMerge(base, overrides);
}
function deepMerge(base, overrides) {
  if (typeof base !== "object" || base === null) return overrides ?? base;
  const result = { ...base };
  for (const key of Object.keys(overrides)) {
    const val = overrides[key];
    result[key] = val !== void 0 && typeof val === "object" && !Array.isArray(val) ? deepMerge(result[key], val) : val;
  }
  return result;
}

// src/i18n/de.ts
init_en();
var de = createLocale(exports.en, {
  toolbar: {
    viewTop: "Draufsicht",
    viewTopLabel: "O",
    viewFront: "Vorderansicht",
    viewFrontLabel: "Vd",
    viewBack: "R\xFCckansicht",
    viewBackLabel: "Rk",
    viewLeft: "Linke Ansicht",
    viewLeftLabel: "L",
    viewRight: "Rechte Ansicht",
    viewRightLabel: "R",
    viewBottom: "Unteransicht",
    viewBottomLabel: "U",
    budget: "Budget",
    pointBudgetTitle: (m) => `Punktbudget: ${m.toFixed(1)}M`,
    size: "Gr\xF6\xDFe",
    pointSizeTitle: (s) => `Punktgr\xF6\xDFe: ${s.toFixed(1)}`,
    panoramas: "Panoramen",
    togglePanoramas: "Panorama-Marker umschalten",
    minimap: "Minikarte",
    toggleMinimap: "Minikarte umschalten",
    clouds: "Wolken",
    cloudSelector: "Punktwolkenauswahl",
    theme: "Design",
    switchToLight: "Zu hell wechseln",
    switchToDark: "Zu dunkel wechseln",
    about: "Info",
    sidebar: "Seitenleiste",
    toggleSidebar: "Seitenleiste umschalten",
    colorMode: "Farbmodus",
    colorRgb: "RGB",
    colorElevation: "H\xF6he",
    colorIntensity: "Intensit\xE4t",
    colorIntensityGradient: "Intensit\xE4tsgradient",
    colorClassification: "Klassifikation",
    colorReturnNumber: "R\xFCcklaufnummer",
    colorSource: "Quelle",
    quality: "Qualit\xE4t",
    qualityPerformance: "Leistung",
    qualityBalanced: "Ausgewogen",
    qualityHigh: "Hohe Qualit\xE4t",
    navOrbit: "Orbit",
    navFree: "Frei",
    navPan: "Verschieben",
    navOrbitTitle: "Orbit \u2014 CAD-Drehscheibe, um Ziel rotieren",
    navFreeTitle: "Frei drehen \u2014 Blender-Stil, keine Horizontbindung",
    navPanTitle: "Verschieben / Karte \u2014 linke Maustaste verschiebt, Horizont fixiert",
    camPerspective: "Perspek.",
    camOrthographic: "Ortho",
    camPerspectiveTitle: "Perspektivische Kamera",
    camOrthographicTitle: "Orthografische Kamera"
  },
  exportPanel: {
    exportImageTitle: "Orthografisches Bild exportieren",
    title: "Bild exportieren",
    view: "Ansicht",
    viewTop: "Oben (Plan)",
    viewFront: "Vorne",
    viewSide: "Seite",
    viewBack: "Hinten",
    scale: "Ma\xDFstab",
    background: "Hintergrund",
    bgWhite: "wei\xDF",
    bgBlack: "schwarz",
    bgTransparent: "\u03B1",
    format: "Format",
    exporting: "Exportiere\u2026",
    download: "Herunterladen"
  },
  toolRail: {
    measureGroup: "M",
    sectionGroup: "S",
    measurePoint: "Punktkoordinate",
    measureDistance: "Abstand",
    measureHeight: "H\xF6henunterschied",
    measureArea: "Fl\xE4che",
    measureVolume: "Volumen",
    measureAngle: "Winkel",
    measureProfile: "Profil",
    clearMeasurements: "Alle Messungen l\xF6schen",
    drawClipBox: "Ausschnittrahmen ziehen (im Viewport)",
    clipModeKeepInside: "Modus: innen behalten (zum Umkehren klicken)",
    clipModeKeepOutside: "Modus: au\xDFen behalten (zum Umkehren klicken)",
    removeClipBox: "Ausschnittrahmen entfernen"
  },
  sidebar: {
    tabPanoramas: "Panoramen",
    tabScene: "Szene",
    tabMeasurements: "Messungen",
    tabClassification: "Klassifikation",
    tabScenes: "Szenen"
  },
  scenePanel: {
    pointClouds: "Punktwolken",
    noCloudLoaded: "Keine Wolke geladen",
    measurements: "Messungen",
    clearAll: "Alle l\xF6schen",
    none: "Keine",
    sections: "Schnitte",
    sectionHint: "Werkzeuge nutzen um Schnittvolumen hinzuzuf\xFCgen",
    clipModeNote: "Schnittmodus gilt f\xFCr alle Boxen"
  },
  panoPanel: {
    searchPlaceholder: "Panoramen suchen\u2026",
    noResults: "Keine Panoramen gefunden",
    flyTo: "Dorthin fliegen"
  },
  classificationPanel: {
    title: "LAS-Klassen",
    all: "Alle",
    none: "Keine",
    classLabels: {
      0: "Nie klassifiziert",
      1: "Unklassifiziert",
      2: "Boden",
      3: "Niedrige Vegetation",
      4: "Mittlere Vegetation",
      5: "Hohe Vegetation",
      6: "Geb\xE4ude",
      7: "Tiefpunkt (Rauschen)",
      9: "Wasser",
      17: "Br\xFCckenbelag",
      18: "Starkes Rauschen"
    }
  },
  measurementsPanel: {
    noMeasurements: "Noch keine Messungen.",
    useMeasureToolHint: "Werkzeuge nutzen um zu messen.",
    measurementCount: (n) => `${n} Messung${n === 1 ? "" : "en"}`,
    downloadCsv: "CSV herunterladen",
    csv: "CSV",
    clearAll: "Alle l\xF6schen",
    typePoint: "Punkt",
    typeDistance: "Abstand",
    typeHeight: "H\xF6he",
    typeArea: "Fl\xE4che",
    typeVolume: "Volumen",
    typeAngle: "Winkel",
    typeProfile: "Profil"
  },
  viewport: {
    overview: "\xDCBERSICHT",
    hintPoint: "Klicken um Punkt zu setzen \u2022 Esc zum Abbrechen",
    hintDistance: "2 Punkte klicken \u2022 Rechtsklick zum Beenden",
    hintHeight: "Start- dann Endpunkt klicken",
    hintArea: "Polygonpunkte klicken \u2022 Rechtsklick zum Schlie\xDFen",
    hintAngle: "3 Punkte klicken (Mittelpunkt ist der Scheitelpunkt)",
    hintSectionBox: "Ziehen um Ausschnittrahmen zu definieren",
    initialisingRenderer: "Renderer wird initialisiert\u2026",
    statusPts: (m) => `${m.toFixed(1)}M Pkt.`,
    statusBudget: (m) => `Budget: ${m.toFixed(1)}M`,
    statusFps: (fps) => `${fps} fps`
  },
  renderingSettings: {
    title: "Rendereinstellungen",
    rgbSection: "RGB-Anpassungen",
    intensitySection: "Intensit\xE4ts-Anpassungen",
    elevationSection: "H\xF6henbereich",
    generalSection: "Allgemein",
    gamma: "Gamma",
    brightness: "Helligkeit",
    contrast: "Kontrast",
    range: "Bereich",
    elevMin: "Min Z",
    elevMax: "Max Z",
    opacity: "Deckkraft",
    reset: "Standardwerte wiederherstellen"
  },
  scenesPanel: {
    saveScene: "Aktuelle Ansicht speichern",
    namePlaceholder: "Szenenname\u2026",
    save: "Speichern",
    savedScenes: "Gespeicherte Szenen",
    noScenes: "Noch keine gespeicherten Szenen.",
    restore: "Szene wiederherstellen",
    exportJson: "Szenen als JSON exportieren",
    importJson: "Szenen aus JSON importieren"
  },
  displaySettings: {
    title: "Anzeigeeinstellungen",
    presetsTab: "Voreinstellungen",
    advancedTab: "Erweitert",
    preset_compact: "Kompakt",
    preset_compact_desc: "Kleine Beschriftungen & Marker",
    preset_standard: "Standard",
    preset_standard_desc: "Standardgr\xF6\xDFen",
    preset_prominent: "Auff\xE4llig",
    preset_prominent_desc: "Gro\xDFe Beschriftungen & Marker",
    measurementsSection: "Messungen",
    lineWidth: "Linienbreite",
    labelScale: "Beschriftungsgr\xF6\xDFe",
    sphereRadius: "Punktgr\xF6\xDFe",
    markersSection: "Panorama-Marker",
    markerScale: "Pin-Gr\xF6\xDFe",
    markerOpacity: "Pin-Deckkraft",
    markerLabelScale: "Beschriftungsgr\xF6\xDFe"
  },
  about: {
    title: "Info",
    productName: "PanoCloud Viewer",
    description: "Ein modularer Punktwolken- und Panorama-Viewer, erstellt mit Next.js 15, potree-core, Three.js und shadcn/ui.",
    engineLabel: "Engine: potree-core + Three.js",
    panoramasLabel: "Panoramen: Pannellum 2.5.6",
    uiLabel: "UI: shadcn/ui + Tailwind CSS"
  },
  panoViewer: {
    close: "Panorama schlie\xDFen"
  },
  uiModes: {
    professional: "Professionell",
    lite: "Lite",
    modeLabel: "Modus"
  },
  clipToolbar: {
    title: "Schnitte",
    addBox: "Box hinzuf\xFCgen",
    clearAll: "Alle entfernen",
    keepInside: "Innen behalten (alle)",
    keepOutside: "Au\xDFen behalten (alle)",
    show: "Anzeigen",
    hide: "Ausblenden",
    delete: "L\xF6schen",
    move: "Verschieben",
    scale: "Skalieren",
    rotateZ: "Drehen"
  }
});

exports.AboutDialog = AboutDialog;
exports.Button = Button;
exports.ClassificationPanel = ClassificationPanel;
exports.ClipToolbar = ClipToolbar;
exports.CollapsibleSidebar = CollapsibleSidebar;
exports.ComponentsProvider = ComponentsProvider;
exports.DataProvider = DataProvider;
exports.Dialog = Dialog;
exports.DialogClose = DialogClose;
exports.DialogContent = DialogContent;
exports.DialogHeader = DialogHeader;
exports.DialogOverlay = DialogOverlay;
exports.DialogPortal = DialogPortal;
exports.DialogTitle = DialogTitle;
exports.DialogTrigger = DialogTrigger;
exports.DisplayControls = DisplayControls;
exports.DisplaySettingsDialog = DisplaySettingsDialog;
exports.ExportTools = ExportTools;
exports.FloatingPalette = FloatingPalette;
exports.LocaleProvider = LocaleProvider;
exports.MainToolbar = MainToolbar;
exports.MeasureTools = MeasureTools;
exports.MeasurementsPanel = MeasurementsPanel;
exports.MinimalLayout = MinimalLayout;
exports.PCV_BUILD = PCV_BUILD;
exports.PCV_VERSION = PCV_VERSION;
exports.PCV_VERSION_STRING = PCV_VERSION_STRING;
exports.PanoCloudViewer = PanoCloudViewer;
exports.PanoPanel = PanoPanel;
exports.PanoViewer = PanoViewer;
exports.Popover = Popover;
exports.PopoverAnchor = PopoverAnchor;
exports.PopoverContent = PopoverContent;
exports.PopoverTrigger = PopoverTrigger;
exports.RenderingSettings = RenderingSettings;
exports.ScenePanel = ScenePanel;
exports.ScenesPanel = ScenesPanel;
exports.SectionTools = SectionTools;
exports.Select = Select;
exports.SelectContent = SelectContent;
exports.SelectGroup = SelectGroup;
exports.SelectItem = SelectItem;
exports.SelectLabel = SelectLabel;
exports.SelectScrollDownButton = SelectScrollDownButton;
exports.SelectScrollUpButton = SelectScrollUpButton;
exports.SelectSeparator = SelectSeparator;
exports.SelectTrigger = SelectTrigger;
exports.SelectValue = SelectValue;
exports.Sidebar = Sidebar;
exports.Slider = Slider2;
exports.Tabs = Tabs;
exports.TabsContent = TabsContent;
exports.TabsList = TabsList;
exports.TabsTrigger = TabsTrigger;
exports.ThemeProvider = ThemeProvider;
exports.Toggle = Toggle;
exports.ToolRail = ToolRail;
exports.ToolbarIconBtn = ToolbarIconBtn;
exports.ToolbarSection = ToolbarSection;
exports.Tooltip = Tooltip;
exports.TooltipContent = TooltipContent;
exports.TooltipProvider = TooltipProvider;
exports.TooltipTrigger = TooltipTrigger;
exports.ViewControls = ViewControls;
exports.ViewerProvider = ViewerProvider;
exports.Viewport = Viewport;
exports.WorkspaceLayout = WorkspaceLayout;
exports.WorkstationLayout = WorkstationLayout;
exports.buttonVariants = buttonVariants;
exports.captureScene = captureScene;
exports.cn = cn;
exports.createAdapter = createAdapter;
exports.createLocale = createLocale;
exports.de = de;
exports.defaultComponents = defaultComponents;
exports.exportMeasurementsCSV = exportMeasurementsCSV;
exports.formatAngle = formatAngle;
exports.formatArea = formatArea;
exports.formatCoord = formatCoord;
exports.formatLength = formatLength;
exports.formatVolume = formatVolume;
exports.toggleVariants = toggleVariants;
exports.useClipActions = useClipActions;
exports.useComponents = useComponents;
exports.useData = useData;
exports.useDisplayActions = useDisplayActions;
exports.useDisplaySettings = useDisplaySettings;
exports.useDraggable = useDraggable;
exports.useExportActions = useExportActions;
exports.useLocale = useLocale;
exports.useMeasurementActions = useMeasurementActions;
exports.useNavigationActions = useNavigationActions;
exports.usePcvRoot = usePcvRoot;
exports.useTheme = useTheme;
exports.useViewer = useViewer;
exports.useVisibilityActions = useVisibilityActions;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map