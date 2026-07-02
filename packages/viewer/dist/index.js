import * as THREE5 from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import React27, { createContext, lazy, useContext, useState, useCallback, useEffect, useRef, useReducer, useMemo, Suspense } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, ChevronDown, ChevronUp, Check, Download, SlidersHorizontal, BoxSelect, Plus, Trash2, Scissors, ScissorsLineDashed, Power, Eye, EyeOff, RotateCcw, Search, Navigation, CloudCog, Ruler, Upload, Bookmark, Play, ChevronRight, Square, Film, Layers, Camera, Box, Sun, Moon, ChevronLeft, Slice, MapPin, ArrowUpDown, Pentagon, Package, Triangle, Waypoints, Map as Map$1, Orbit, Rotate3d, Maximize, Settings, Palette, Image, Tag, Circle, Minus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cva } from 'class-variance-authority';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as SelectPrimitive from '@radix-ui/react-select';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
function loadMp4Muxer() {
  if (!_muxerPromise) {
    const runtimeImport2 = new Function("u", "return import(u)");
    _muxerPromise = runtimeImport2("https://cdn.jsdelivr.net/npm/mp4-muxer@5/+esm");
  }
  return _muxerPromise;
}
function genId() {
  return `clip_${_nextId++}`;
}
function genSceneId() {
  return `scene_${Date.now()}_${_nextId2++}`;
}
function captureScene(name, cameraPos, cameraTarget, clipBoxes, colorMode, pointSize, pointBudget, cameraUp = { x: 0, y: 0, z: 1 }) {
  return {
    name,
    camera: {
      position: [cameraPos.x, cameraPos.y, cameraPos.z],
      target: [cameraTarget.x, cameraTarget.y, cameraTarget.z],
      up: [cameraUp.x, cameraUp.y, cameraUp.z]
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
      return new S3SourceAdapter(source.baseUrl, source.headers);
    case "electron":
      return new ElectronSourceAdapter(source.basePath);
    case "local":
      return new S3SourceAdapter(source.basePath);
  }
}
var SceneManager, PointCloudLoader, EASINGS, CameraAnimator, DISPLAY_PRESETS, MARKER_COLOR_DEFAULT, MARKER_COLOR_HOVER, MARKER_COLOR_SELECTED, PIN_BASE_SCALE, MarkerManager, _idCounter, COLORS, MeasurementManager, VIEW_DIRECTIONS, _muxerPromise, ExportManager, MinimapRenderer, AXIS_COLOR, HANDLE_HOVER_COLOR, HANDLE_DRAG_COLOR, FaceHandleController, RING_COLOR, RING_HOVER_COLOR, RING_DRAG_COLOR, RotationRingController, _nextId, ClipManager, AxisWidget, MAX_SCENES, _nextId2, PresentationManager, S3SourceAdapter, ElectronSourceAdapter;
var init_dist = __esm({
  "../core/dist/index.js"() {
    SceneManager = class {
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
        const w = Math.max(canvas.clientWidth, 1);
        const h = Math.max(canvas.clientHeight, 1);
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
        this.renderer.domElement.addEventListener("dragstart", this.preventDragStart);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.screenSpacePanning = true;
        this.controls.minPolarAngle = 0.01;
        this.controls.maxPolarAngle = Math.PI - 0.01;
        this.controls.zoomSpeed = 1.5;
        this.controls.rotateSpeed = 0.8;
        this.controls.zoomToCursor = false;
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
      /** Bound so it can be removed in dispose(); blocks native drag/ghost-image. */
      preventDragStart = (e) => e.preventDefault();
      onResize(canvas) {
        const w = Math.max(canvas.clientWidth, 1);
        const h = Math.max(canvas.clientHeight, 1);
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
        this.renderer.domElement.removeEventListener("dragstart", this.preventDragStart);
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
            // Generous window so thin structures (edges, poles, railings) are easy
            // to hit — the pick still returns the point closest to the ray.
            pickWindowSize: 31
          });
          if (result?.position) {
            return result.position.clone();
          }
        }
        return null;
      }
    };
    PointCloudLoader = class {
      sceneManager;
      adapter;
      currentClouds = [];
      hasRgb = false;
      /** CRS string from metadata.json (empty = not georeferenced). */
      _projection = "";
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
          this._projection = typeof meta?.projection === "string" ? meta.projection.trim() : "";
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
      /** CRS string from metadata.json ("" when not georeferenced). */
      get projection() {
        return this._projection;
      }
      /** Whether the cloud carries a non-empty CRS. */
      get isGeoreferenced() {
        return this._projection.length > 0;
      }
      /** Georeference status for the cloud info / About dialog. */
      getGeoInfo() {
        return { georeferenced: this.isGeoreferenced, projection: this._projection };
      }
      /** Remove all loaded point clouds from scene, releasing their GPU buffers. */
      clear() {
        for (const cloud of this.currentClouds) {
          this.sceneManager.scene.remove(cloud);
          try {
            cloud.dispose?.();
          } catch {
          }
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
    EASINGS = {
      smooth: (t) => 1 - Math.pow(1 - t, 4),
      // quartic ease-out (default)
      linear: (t) => t,
      easeInOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    };
    CameraAnimator = class {
      camera;
      controls;
      animId = null;
      constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
      }
      flyTo({ position, target, up, duration = 800, easing = "smooth" }) {
        return new Promise((resolve) => {
          if (this.animId !== null) cancelAnimationFrame(this.animId);
          const startPos = this.camera.position.clone();
          const startTarget = this.controls.target.clone();
          const startUp = this.camera.up.clone();
          const endUp = up ? up.clone().normalize() : null;
          const ease = EASINGS[easing] ?? EASINGS.smooth;
          const startTime = performance.now();
          const animate = (now) => {
            const t = Math.min((now - startTime) / duration, 1);
            const e = ease(t);
            this.camera.position.lerpVectors(startPos, position, e);
            this.controls.target.lerpVectors(startTarget, target, e);
            if (endUp) this.camera.up.copy(startUp).lerp(endUp, e).normalize();
            this.controls.update();
            if (t < 1) {
              this.animId = requestAnimationFrame(animate);
            } else {
              if (endUp) this.camera.up.copy(endUp);
              this.controls.update();
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
      /**
       * Stop any in-flight animation. Note: the Promise returned by the interrupted
       * `flyTo()` is abandoned (never resolves) — callers awaiting it should not rely
       * on cancel() to settle it. Starting a new `flyTo()` cancels the previous one
       * the same way; that path is fine because the old promise is simply discarded.
       */
      cancel() {
        if (this.animId !== null) {
          cancelAnimationFrame(this.animId);
          this.animId = null;
        }
      }
    };
    DISPLAY_PRESETS = {
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
    MarkerManager = class {
      scene;
      entries = [];
      group;
      hoveredIdx = -1;
      selectedIdx = -1;
      labelMode = "hover";
      _displaySettings = DISPLAY_PRESETS.standard;
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
        this.labelMode = this._displaySettings.markerLabelMode ?? "hover";
        this.clear();
        if (worldBox && !worldBox.isEmpty()) {
          const size = new THREE5.Vector3();
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
        return this._clipFilter(new THREE5.Vector3(cam.position.x, cam.position.y, cam.position.z));
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
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        this._pinTexture = tex;
        return tex;
      }
      _makePin(color, scale) {
        const mat = new THREE5.SpriteMaterial({
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
        const sprite = new THREE5.Sprite(mat);
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
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        const mat = new THREE5.SpriteMaterial({
          map: tex,
          sizeAttenuation: false,
          // constant on-screen size — never huge
          depthTest: false,
          depthWrite: false,
          transparent: true
        });
        const sprite = new THREE5.Sprite(mat);
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
    MeasurementManager = class {
      scene;
      group;
      measurements = /* @__PURE__ */ new Map();
      _displaySettings = DISPLAY_PRESETS.standard;
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
      // Shared vertex-dot texture (white disc + dark ring, tinted per measurement).
      _dotTexture;
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
            const mat = o.material;
            if (mat.map && mat.map !== this._dotTexture) mat.map.dispose();
            mat.dispose();
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
        if (!this._snapCross) {
          const mat = new THREE5.SpriteMaterial({
            map: this._getCrossTexture(),
            color: c,
            sizeAttenuation: false,
            // constant pixel size at any zoom
            depthTest: false,
            // always visible through the cloud
            depthWrite: false,
            transparent: true
          });
          this._snapCross = new THREE5.Sprite(mat);
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
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        this._crossTexture = tex;
        return tex;
      }
      /** Show/hide ALL measurement objects (the whole group) — used by the Layers panel. */
      setVisible(visible) {
        this.group.visible = visible;
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
        const text = formatVolume(m.value);
        const sprite = this.makeTextSprite(text, m.color);
        sprite.position.copy(center).add(new THREE5.Vector3(0, 0, size.z / 2));
        sprite.center.set(0.5, -0.35);
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
      /**
       * Vertex marker: a constant screen-size dot sprite (like a map pin, not a
       * world-sized ball) so markers stay small and precise at any zoom level.
       * `measurementSphereRadius` acts as a size multiplier (0.15 = standard).
       */
      makeVertexDot(position, color) {
        const mat = new THREE5.SpriteMaterial({
          map: this._getDotTexture(),
          color,
          sizeAttenuation: false,
          depthTest: false,
          depthWrite: false,
          transparent: true
        });
        const dot = new THREE5.Sprite(mat);
        const s = 0.016 * (this._displaySettings.measurementSphereRadius / 0.15);
        dot.scale.set(s, s, 1);
        dot.position.copy(position);
        dot.renderOrder = 2;
        return dot;
      }
      /** Cached dot texture: white disc (tinted by material color) + dark outline ring. */
      _getDotTexture() {
        if (this._dotTexture) return this._dotTexture;
        const S = 32;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        const c = S / 2;
        ctx.beginPath();
        ctx.arc(c, c, 13, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c, c, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        this._dotTexture = tex;
        return tex;
      }
      buildObjects(m) {
        const objects = [];
        const color = new THREE5.Color(m.color);
        const pts = m.points;
        pts.forEach((p) => {
          const dot = this.makeVertexDot(p, color);
          this.group.add(dot);
          objects.push(dot);
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
              const closingLine = new THREE5.Line(geo, mat);
              closingLine.renderOrder = 1;
              this.group.add(closingLine);
              objects.push(closingLine);
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
            const anchor = this.labelAnchor(m);
            const onLine = m.type === "distance" || m.type === "height";
            const sprite = this.makeTextSprite(text, m.color);
            sprite.position.copy(anchor);
            if (!onLine) sprite.center.set(0.5, -0.35);
            this.group.add(sprite);
            objects.push(sprite);
          }
        }
        return objects;
      }
      /** World anchor for a measurement's label. */
      labelAnchor(m) {
        const pts = m.points;
        if (m.type === "height" && pts.length >= 2) {
          return new THREE5.Vector3(pts[0].x, pts[0].y, (pts[0].z + pts[1].z) / 2);
        }
        if (m.type === "angle" && pts.length >= 2) return pts[1].clone();
        const mid = new THREE5.Vector3();
        for (const p of pts) mid.add(p);
        return mid.divideScalar(Math.max(pts.length, 1));
      }
      /**
       * Value label: constant screen-size sprite (`sizeAttenuation:false`) so it is
       * equally readable on a 5 m room and a 500 m site. White text on a dark card
       * with the measurement color as accent bar + border — high contrast on both
       * bright and dark point clouds. `measurementLabelScale` multiplies the size.
       */
      makeTextSprite(text, color) {
        const W = 512, H = 96;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.roundRect(3, 3, W - 6, H - 6, 14);
        ctx.fillStyle = "rgba(10,10,12,0.88)";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(10, 16, 10, H - 32, 5);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 52px -apple-system, 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, W / 2 + 8, H / 2 + 2);
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        const sprite = new THREE5.Sprite(new THREE5.SpriteMaterial({
          map: tex,
          transparent: true,
          sizeAttenuation: false,
          // constant on-screen size at any zoom
          depthTest: false,
          depthWrite: false
        }));
        const ls = this._displaySettings.measurementLabelScale;
        sprite.scale.set(0.2 * ls, 0.2 * H / W * ls, 1);
        sprite.renderOrder = 4;
        return sprite;
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
        this._crossTexture?.dispose();
        this._crossTexture = void 0;
        this._dotTexture?.dispose();
        this._dotTexture = void 0;
        this.scene.remove(this.group);
      }
    };
    VIEW_DIRECTIONS = {
      top: { pos: new THREE5.Vector3(0, 0, 1), up: new THREE5.Vector3(0, 1, 0) },
      front: { pos: new THREE5.Vector3(0, -1, 0), up: new THREE5.Vector3(0, 0, 1) },
      side: { pos: new THREE5.Vector3(1, 0, 0), up: new THREE5.Vector3(0, 0, 1) },
      back: { pos: new THREE5.Vector3(0, 1, 0), up: new THREE5.Vector3(0, 0, 1) },
      custom: { pos: new THREE5.Vector3(0, 0, 1), up: new THREE5.Vector3(0, 1, 0) }
    };
    _muxerPromise = null;
    ExportManager = class _ExportManager {
      sceneManager;
      constructor(sceneManager) {
        this.sceneManager = sceneManager;
      }
      /**
       * Record a camera animation to an MP4 Blob by rendering **frame by frame** at a
       * fixed resolution (default 1920×1080) and encoding with WebCodecs (exact
       * per-frame timestamps → no stutter, high bitrate → not over-compressed).
       * Rendering is deterministic (not real-time), so it's smooth regardless of how
       * long each frame takes. Requires WebCodecs (Chrome/Edge).
       */
      async recordAnimation(opts) {
        const {
          sampleCamera,
          durationSec,
          fps = 30,
          width = 1920,
          height = 1080,
          background = "current",
          bitrate = 12e6,
          onProgress
        } = opts;
        const w = window;
        if (typeof w.VideoEncoder === "undefined" || typeof w.VideoFrame === "undefined") {
          throw new Error("This browser doesn't support WebCodecs video recording \u2014 try Chrome or Edge.");
        }
        const { renderer, scene } = this.sceneManager;
        const potree = this.sceneManager.potree;
        const muxMod = await loadMp4Muxer();
        const Muxer = muxMod.Muxer ?? muxMod.default?.Muxer;
        const ArrayBufferTarget = muxMod.ArrayBufferTarget ?? muxMod.default?.ArrayBufferTarget;
        const muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: { codec: "avc", width, height },
          fastStart: "in-memory"
        });
        const encoder = new w.VideoEncoder({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => console.error("[recordAnimation]", e)
        });
        encoder.configure({
          codec: "avc1.640028",
          width,
          height,
          bitrate,
          framerate: fps,
          avc: { format: "avc" }
        });
        const prevSize = new THREE5.Vector2();
        renderer.getSize(prevSize);
        const prevPR = renderer.getPixelRatio();
        const prevBg = scene.background;
        renderer.setPixelRatio(1);
        renderer.setSize(width, height, false);
        if (background === "white") scene.background = new THREE5.Color(16777215);
        else if (background === "black") scene.background = new THREE5.Color(0);
        else if (background === "transparent") scene.background = null;
        const rt = new THREE5.WebGLRenderTarget(width, height, {
          format: THREE5.RGBAFormat,
          minFilter: THREE5.LinearFilter,
          magFilter: THREE5.LinearFilter
        });
        const c2d = document.createElement("canvas");
        c2d.width = width;
        c2d.height = height;
        const ctx = c2d.getContext("2d");
        const pixels = new Uint8Array(width * height * 4);
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
            ctx.putImageData(new ImageData(_ExportManager.flipY(pixels, width, height), width, height), 0, 0);
            const frame = new w.VideoFrame(c2d, { timestamp: f * frameDur, duration: frameDur });
            encoder.encode(frame, { keyFrame: f % (fps * 2) === 0 });
            frame.close();
            onProgress?.((f + 1) / total);
            if (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
          }
          await encoder.flush();
          muxer.finalize();
          return new Blob([muxer.target.buffer], { type: "video/mp4" });
        } finally {
          try {
            encoder.close();
          } catch {
          }
          renderer.setRenderTarget(null);
          renderer.setPixelRatio(prevPR);
          renderer.setSize(prevSize.x, prevSize.y, false);
          scene.background = prevBg;
          rt.dispose();
        }
      }
      /**
       * Flip a bottom-up WebGL pixel buffer into top-down image order.
       * `readRenderTargetPixels` returns rows starting at the bottom of the frame;
       * ImageData / canvas expect the top row first.
       */
      static flipY(pixels, width, height) {
        const flipped = new Uint8ClampedArray(width * height * 4);
        const row = width * 4;
        for (let y = 0; y < height; y++) {
          const src = (height - 1 - y) * row;
          flipped.set(pixels.subarray(src, src + row), y * row);
        }
        return flipped;
      }
      /** World-space bounds of the loaded point clouds (potree octrees aren't Meshes). */
      cloudBounds() {
        const box = new THREE5.Box3();
        for (const pc of this.sceneManager.pointClouds) {
          const g = pc.pcoGeometry;
          const tb = g?.tightBoundingBox ?? g?.boundingBox ?? pc.boundingBox;
          const off = g?.offset;
          if (tb) {
            const wb = tb.clone();
            if (off) {
              wb.min.add(off);
              wb.max.add(off);
            }
            box.union(wb);
          } else {
            try {
              box.expandByObject(pc);
            } catch {
            }
          }
        }
        return box;
      }
      /**
       * Capture a view to an image data URL. `view: "current"` snapshots exactly what
       * the user sees (the live camera); the other views render an orthographic shot
       * framed to the cloud bounds.
       */
      async capture(options) {
        const { view, scale, background, format, quality = 0.95 } = options;
        const { scene, renderer } = this.sceneManager;
        const potree = this.sceneManager.potree;
        const baseW = renderer.domElement.width;
        const baseH = renderer.domElement.height;
        const maxDim = renderer.capabilities.maxTextureSize || 4096;
        const outW = Math.max(1, Math.min(Math.round(baseW * scale), maxDim));
        const outH = Math.max(1, Math.min(Math.round(baseH * scale), maxDim));
        const aspect = outW / outH;
        let camera;
        if (view === "current") {
          const cam = this.sceneManager.camera.clone();
          cam.aspect = aspect;
          cam.updateProjectionMatrix();
          camera = cam;
        } else {
          const box = this.cloudBounds();
          const size = new THREE5.Vector3();
          const center = new THREE5.Vector3();
          box.getSize(size);
          box.getCenter(center);
          const maxExt = Math.max(size.x, size.y, size.z, 1);
          const dir = VIEW_DIRECTIONS[view] ?? VIEW_DIRECTIONS.top;
          const halfH = maxExt * 0.6;
          const halfW = halfH * aspect;
          const ortho = new THREE5.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.01, maxExt * 10 + 1e4);
          ortho.position.copy(center).addScaledVector(dir.pos, maxExt * 2);
          ortho.up.copy(dir.up);
          ortho.lookAt(center);
          ortho.updateMatrixWorld();
          camera = ortho;
        }
        const rt = new THREE5.WebGLRenderTarget(outW, outH, {
          minFilter: THREE5.LinearFilter,
          magFilter: THREE5.LinearFilter,
          format: THREE5.RGBAFormat
        });
        const prevBg = scene.background;
        if (background === "white") scene.background = new THREE5.Color(16777215);
        else if (background === "black") scene.background = new THREE5.Color(0);
        else scene.background = null;
        if (potree && this.sceneManager.pointClouds.length > 0) {
          potree.updatePointClouds(this.sceneManager.pointClouds, camera, renderer);
        }
        renderer.setRenderTarget(rt);
        renderer.clear();
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        scene.background = prevBg;
        const pixels = new Uint8Array(outW * outH * 4);
        renderer.readRenderTargetPixels(rt, 0, 0, outW, outH, pixels);
        rt.dispose();
        const flipped = _ExportManager.flipY(pixels, outW, outH);
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
    MinimapRenderer = class {
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
      /** Sync canvas backing stores to the container's CSS size (no-op when equal). */
      _syncSize() {
        const c = this.container;
        if (!c || !this.glCanvas) return;
        const w = c.clientWidth;
        const h = c.clientHeight;
        if (this.glCanvas.width === w && this.glCanvas.height === h) return;
        this.glCanvas.width = w;
        this.glCanvas.height = h;
        this.miniRenderer?.setSize(w, h, false);
        if (this.overlayCanvas) {
          this.overlayCanvas.width = w;
          this.overlayCanvas.height = h;
        }
      }
      _render3D() {
        if (!this.miniRenderer || !this.bounds) return;
        this._syncSize();
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
      _drawCamera(ctx, W, H) {
        const cam = this.sceneManager.camera;
        const dir = new THREE5.Vector3();
        cam.getWorldDirection(dir);
        const cx = Math.min(Math.max(this._worldToCanvasX(cam.position.x), 5), W - 5);
        const cy = Math.min(Math.max(this._worldToCanvasY(cam.position.y), 5), H - 5);
        const angle = Math.atan2(-dir.y, dir.x);
        const fovLen = Math.max(20, H * 0.16);
        const halfFov = Math.atan(
          Math.tan(THREE5.MathUtils.degToRad(cam.fov) / 2) * Math.max(cam.aspect, 0.1)
        );
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
        this._syncSize();
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
      raycaster = new THREE5.Raycaster();
      group;
      disposed = false;
      /** Orientation of the box (full 3-axis rotation). */
      _quaternion = new THREE5.Quaternion();
      constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;
        this.group = new THREE5.Group();
        this.group.name = "face-handles";
        this.scene.add(this.group);
        this.createHandles();
      }
      // Shared arrow geometries for all 6 handles — each disposed once in dispose().
      // Local space: arrow points along +Y, base at the origin (mounted on the face).
      shaftGeometry = new THREE5.CylinderGeometry(0.09, 0.09, 0.55, 10).translate(0, 0.275, 0);
      coneGeometry = new THREE5.ConeGeometry(0.26, 0.5, 12).translate(0, 0.8, 0);
      grabGeometry = new THREE5.SphereGeometry(0.6, 8, 6).translate(0, 0.65, 0);
      /** One invisible material shared by all grab spheres. */
      grabMaterial = new THREE5.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false
      });
      createHandles() {
        const axes = ["x", "y", "z"];
        const signs = [1, -1];
        const UP = new THREE5.Vector3(0, 1, 0);
        for (const axis of axes) {
          for (const sign of signs) {
            const material = new THREE5.MeshBasicMaterial({
              color: AXIS_COLOR[axis],
              transparent: true,
              opacity: 0.95,
              depthTest: false
            });
            const shaft = new THREE5.Mesh(this.shaftGeometry, material);
            const cone = new THREE5.Mesh(this.coneGeometry, material);
            const grab = new THREE5.Mesh(this.grabGeometry, this.grabMaterial);
            shaft.renderOrder = cone.renderOrder = 10;
            const arrow = new THREE5.Group();
            arrow.add(shaft, cone, grab);
            arrow.visible = false;
            arrow.userData = { faceHandle: true, axis, sign };
            const dir = new THREE5.Vector3(
              axis === "x" ? sign : 0,
              axis === "y" ? sign : 0,
              axis === "z" ? sign : 0
            );
            const localQuat = new THREE5.Quaternion().setFromUnitVectors(UP, dir);
            this.group.add(arrow);
            this.handles.push({ group: arrow, material, grab, localQuat, axis, sign });
          }
        }
      }
      attach(box, onChange) {
        this.box = box;
        this.onChange = onChange;
        this.updatePositions();
        for (const h of this.handles) h.group.visible = true;
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
        for (const h of this.handles) h.group.visible = false;
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
        return this.handles.map((h) => h.grab);
      }
      /** Update handle positions and sizes to match the current box */
      updatePositions() {
        if (!this.box) return;
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        this.box.getCenter(center);
        this.box.getSize(size);
        const diag = size.length();
        const scale = Math.max(0.1, diag * 0.06);
        for (const h of this.handles) {
          const offset = new THREE5.Vector3();
          if (h.sign === 1) {
            offset[h.axis] = this.box.max[h.axis] - center[h.axis];
          } else {
            offset[h.axis] = this.box.min[h.axis] - center[h.axis];
          }
          const half = Math.abs(offset[h.axis]);
          offset[h.axis] += h.sign * (half * 0.04 + scale * 0.1);
          offset.applyQuaternion(this._quaternion);
          h.group.position.set(center.x + offset.x, center.y + offset.y, center.z + offset.z);
          h.group.scale.setScalar(scale);
          h.group.quaternion.copy(this._quaternion).multiply(h.localQuat);
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
          handle.group.position.clone()
        );
        this.setRaycasterFromClient(clientX, clientY);
        const startIntersect = new THREE5.Vector3();
        if (!this.raycaster.ray.intersectPlane(plane, startIntersect)) return false;
        const startCenter = new THREE5.Vector3();
        const startSize = new THREE5.Vector3();
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
        const local = new THREE5.Vector3(
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
        const currentIntersect = new THREE5.Vector3();
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
        this.shaftGeometry.dispose();
        this.coneGeometry.dispose();
        this.grabGeometry.dispose();
        this.grabMaterial.dispose();
        for (const h of this.handles) {
          h.material.dispose();
        }
        this.scene.remove(this.group);
      }
      hitTest(clientX, clientY) {
        if (!this.box) return null;
        this.setRaycasterFromClient(clientX, clientY);
        const grabs = this.handles.filter((h) => h.group.visible).map((h) => h.grab);
        const intersects = this.raycaster.intersectObjects(grabs);
        if (intersects.length === 0) return null;
        const hit = intersects[0].object;
        return this.handles.find((h) => h.grab === hit) ?? null;
      }
      setRaycasterFromClient(clientX, clientY) {
        const rect = this.domElement.getBoundingClientRect();
        const nx = (clientX - rect.left) / rect.width * 2 - 1;
        const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(new THREE5.Vector2(nx, ny), this.camera);
      }
      setHandleColor(handle, color) {
        handle.material.color.setHex(color);
      }
    };
    RING_COLOR = {
      x: 15680580,
      y: 2278750,
      z: 3900150
    };
    RING_HOVER_COLOR = 16777215;
    RING_DRAG_COLOR = 16347926;
    RotationRingController = class {
      scene;
      camera;
      domElement;
      group;
      rings = [];
      raycaster = new THREE5.Raycaster();
      drag = null;
      hovered = null;
      onRotate = null;
      center = new THREE5.Vector3();
      quaternion = new THREE5.Quaternion();
      attached = false;
      constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;
        this.group = new THREE5.Group();
        this.group.name = "clip-rotation-rings";
        this.group.visible = false;
        this.scene.add(this.group);
        this.buildRings();
      }
      buildRings() {
        const arcGeo = new THREE5.TorusGeometry(1, 0.012, 8, 48, Math.PI / 2);
        const pickGeo = new THREE5.TorusGeometry(1, 0.1, 8, 24, Math.PI / 2);
        const cycle = new THREE5.Quaternion().setFromAxisAngle(
          new THREE5.Vector3(1, 1, 1).normalize(),
          2 * Math.PI / 3
        );
        const orientations = [
          { axis: "z", q: new THREE5.Quaternion() },
          // XY plane: +X→+Y
          { axis: "x", q: cycle.clone() },
          // YZ plane: +Y→+Z
          { axis: "y", q: cycle.clone().multiply(cycle) }
          // ZX plane: +Z→+X
        ];
        for (const { axis, q } of orientations) {
          const material = new THREE5.MeshBasicMaterial({
            color: RING_COLOR[axis],
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity: 0.95
          });
          const arc = new THREE5.Mesh(arcGeo, material);
          arc.quaternion.copy(q);
          arc.renderOrder = 6;
          const picker = new THREE5.Mesh(pickGeo, new THREE5.MeshBasicMaterial({
            visible: true,
            transparent: true,
            opacity: 0,
            depthTest: false,
            depthWrite: false
          }));
          picker.quaternion.copy(q);
          picker.userData.ringAxis = axis;
          this.group.add(arc, picker);
          this.rings.push({ axis, arc, picker, material });
        }
      }
      /** Show the rings on a box and receive the new orientation while dragging. */
      attach(box, quaternion, onRotate) {
        this.onRotate = onRotate;
        this.attached = true;
        this.group.visible = true;
        this.updatePose(box, quaternion);
      }
      detach() {
        this.attached = false;
        this.group.visible = false;
        this.drag = null;
        this.onRotate = null;
        this.setHover(null);
      }
      isAttached() {
        return this.attached;
      }
      isDragging() {
        return this.drag !== null;
      }
      /** Show/hide without detaching (outline toggle). */
      setGroupVisible(visible) {
        this.group.visible = visible && this.attached;
      }
      /** Follow the box: center, orientation, and a radius just outside the box. */
      updatePose(box, quaternion) {
        const size = new THREE5.Vector3();
        box.getCenter(this.center);
        box.getSize(size);
        this.quaternion.copy(quaternion);
        this.group.position.copy(this.center);
        this.group.quaternion.copy(quaternion);
        const radius = Math.max(size.x, size.y, size.z) * 0.62;
        this.group.scale.setScalar(Math.max(radius, 0.3));
      }
      /** Try to start a rotation drag. Returns true if an arc was grabbed. */
      onPointerDown(clientX, clientY) {
        if (!this.attached || !this.group.visible) return false;
        const ring = this.hitTest(clientX, clientY);
        if (!ring) return false;
        const local = new THREE5.Vector3(
          ring.axis === "x" ? 1 : 0,
          ring.axis === "y" ? 1 : 0,
          ring.axis === "z" ? 1 : 0
        );
        const worldAxis = local.applyQuaternion(this.quaternion).normalize();
        const plane = new THREE5.Plane().setFromNormalAndCoplanarPoint(worldAxis, this.center);
        this.setRay(clientX, clientY);
        const hit = new THREE5.Vector3();
        if (!this.raycaster.ray.intersectPlane(plane, hit)) return false;
        this.drag = {
          axis: ring.axis,
          plane,
          worldAxis,
          startVec: hit.sub(this.center).normalize(),
          startQuat: this.quaternion.clone(),
          center: this.center.clone()
        };
        ring.material.color.setHex(RING_DRAG_COLOR);
        return true;
      }
      /** Rotate while dragging: signed angle between start and current plane vector. */
      onPointerMove(clientX, clientY) {
        if (!this.drag) return;
        this.setRay(clientX, clientY);
        const hit = new THREE5.Vector3();
        if (!this.raycaster.ray.intersectPlane(this.drag.plane, hit)) return;
        const cur = hit.sub(this.drag.center).normalize();
        const angle = Math.atan2(
          new THREE5.Vector3().crossVectors(this.drag.startVec, cur).dot(this.drag.worldAxis),
          this.drag.startVec.dot(cur)
        );
        const q = new THREE5.Quaternion().setFromAxisAngle(this.drag.worldAxis, angle).multiply(this.drag.startQuat);
        this.onRotate?.(q);
      }
      onPointerUp() {
        if (!this.drag) return;
        const ring = this.rings.find((r) => r.axis === this.drag.axis);
        ring?.material.color.setHex(RING_COLOR[this.drag.axis]);
        this.drag = null;
      }
      /** Hover highlight. Call on pointermove when not dragging. */
      updateHover(clientX, clientY) {
        if (this.drag || !this.attached || !this.group.visible) return;
        this.setHover(this.hitTest(clientX, clientY));
      }
      setHover(ring) {
        if (ring === this.hovered) return;
        if (this.hovered) this.hovered.material.color.setHex(RING_COLOR[this.hovered.axis]);
        this.hovered = ring;
        if (ring) ring.material.color.setHex(RING_HOVER_COLOR);
      }
      hitTest(clientX, clientY) {
        this.setRay(clientX, clientY);
        const pickers = this.rings.map((r) => r.picker);
        const hits = this.raycaster.intersectObjects(pickers);
        if (hits.length === 0) return null;
        const axis = hits[0].object.userData.ringAxis;
        return this.rings.find((r) => r.axis === axis) ?? null;
      }
      setRay(clientX, clientY) {
        const rect = this.domElement.getBoundingClientRect();
        const nx = (clientX - rect.left) / rect.width * 2 - 1;
        const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(new THREE5.Vector2(nx, ny), this.camera);
      }
      dispose() {
        this.rings[0]?.arc.geometry.dispose();
        this.rings[0]?.picker.geometry.dispose();
        for (const r of this.rings) {
          r.material.dispose();
          r.picker.material.dispose();
        }
        this.rings = [];
        this.scene.remove(this.group);
      }
    };
    _nextId = 1;
    ClipManager = class {
      sm;
      entries = [];
      helpers = /* @__PURE__ */ new Map();
      fills = /* @__PURE__ */ new Map();
      draftHelper = null;
      selectedId = null;
      /** Move gizmo (translate arrows at the box center) — three.js TransformControls. */
      tcMove = null;
      pivot = null;
      /** Face-mounted resize arrows (scaling). */
      _faceHandles = null;
      /** Quarter-circle rotation arcs (custom — exact hitboxes, see RotationRingController). */
      _rotRings = null;
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
      /** Look up a box entry by id. */
      entryOf(id) {
        return id ? this.entries.find((e) => e.id === id) : void 0;
      }
      /**
       * Remove a Box3Helper from the scene and dispose BOTH its geometry and its
       * internally-created LineBasicMaterial. Box3Helper owns its material, so
       * disposing only the geometry (the easy-to-forget half) leaks it.
       */
      disposeBox3Helper(helper) {
        if (!helper) return;
        this.sm.scene.remove(helper);
        helper.geometry.dispose();
        helper.material.dispose();
      }
      /** Remove the invisible transform pivot mesh and dispose its geometry + material. */
      disposePivot() {
        if (!this.pivot) return;
        this.sm.scene.remove(this.pivot);
        this.pivot.geometry.dispose();
        this.pivot.material.dispose();
        this.pivot = null;
      }
      /** In-flight init promise — guards against concurrent selectBox() double-init. */
      _initTcPromise = null;
      initTransformControls() {
        if (this.tcMove) return Promise.resolve();
        if (!this._initTcPromise) this._initTcPromise = this._doInitTransformControls();
        return this._initTcPromise;
      }
      async _doInitTransformControls() {
        const { TransformControls } = await import('three/examples/jsm/controls/TransformControls.js');
        const tc = new TransformControls(this.sm.camera, this.sm.renderer.domElement);
        tc.setSpace("world");
        tc.setMode("translate");
        tc.setSize(0.6);
        tc.addEventListener("change", () => this.syncFromPivot());
        tc.addEventListener("dragging-changed", (e) => {
          this.sm.controls.enabled = !e.value;
        });
        this.sm.scene.add(tc.getHelper());
        this.tcMove = tc;
        this._raiseGizmo();
      }
      /** Whether the translate gizmo is mid-drag (viewport uses this for ordering). */
      isGizmoDragging() {
        return this.tcMove?.dragging === true;
      }
      /**
       * Force the TransformControls gizmos to render on top of the point cloud.
       * The gizmos use default materials (depthTest=true, renderOrder=0) so they are
       * occluded by the dense cloud. Traverse each gizmo tree and disable depth
       * testing so the arrows/rings draw through.
       */
      _raiseGizmo() {
        const helper = this.tcMove?.getHelper?.();
        if (!helper) return;
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
        const vfov = THREE5.MathUtils.degToRad(cam.fov || 50);
        const halfH = Math.tan(vfov / 2) * dist;
        const halfW = halfH * (cam.aspect || 1);
        let half = Math.min(halfH, halfW) * 0.45;
        let halfZ = half * 0.6;
        if (worldBox && !worldBox.isEmpty()) {
          const ws = new THREE5.Vector3();
          worldBox.getSize(ws);
          half = Math.min(half, ws.x * 0.5, ws.y * 0.5);
          halfZ = Math.min(halfZ, ws.z * 0.5);
          target.clamp(worldBox.min, worldBox.max);
        }
        half = Math.max(half, 0.25);
        halfZ = Math.max(halfZ, 0.15);
        return new THREE5.Box3(
          new THREE5.Vector3(target.x - half, target.y - half, target.z - halfZ),
          new THREE5.Vector3(target.x + half, target.y + half, target.z + halfZ)
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
          quaternion: new THREE5.Quaternion()
        };
        this.entries.push(entry);
        this.updateHelper(entry);
        this.applyAll();
        this.onChange?.(this.getBoxes());
        return entry;
      }
      async selectBox(id) {
        this._highlightHelper(this.selectedId, false);
        this._detachHandles();
        this.disposePivot();
        this.selectedId = id;
        this.onSelectChange?.(id);
        if (!id) return;
        const entry = this.entryOf(id);
        if (!entry) return;
        await this.initTransformControls();
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        entry.box.getCenter(center);
        entry.box.getSize(size);
        const geo = new THREE5.BoxGeometry(1, 1, 1);
        const mat = new THREE5.MeshBasicMaterial({ visible: false });
        this.pivot = new THREE5.Mesh(geo, mat);
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
        if (!this._rotRings) {
          this._rotRings = new RotationRingController(
            this.sm.scene,
            this.sm.camera,
            this.sm.renderer.domElement
          );
        }
        this._showSelectionHandles();
        this._applyOutlineVisibility();
        this._highlightHelper(id, true);
      }
      /**
       * @deprecated All handle sets (move / scale / rotate) now show simultaneously
       * — there are no modes to switch. Kept as a no-op for API compatibility.
       */
      setTransformMode(_mode) {
      }
      /** @deprecated See {@link setTransformMode}. Always returns "scale". */
      getTransformMode() {
        return this._transformMode;
      }
      /** Get the face handle controller (for viewport event forwarding) */
      get faceHandles() {
        return this._faceHandles;
      }
      /** Get the rotation-ring controller (for viewport event forwarding). */
      get rotationRings() {
        return this._rotRings;
      }
      /** Attach the face-resize handles to the selected box with the sync callback. */
      _attachFaceHandles(entry) {
        if (!this._faceHandles) return;
        this._faceHandles.setQuaternion(entry.quaternion);
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
          this._rotRings?.updatePose(entry.box, entry.quaternion);
          this.onChange?.(this.getBoxes());
        });
      }
      /**
       * Attach ALL handle sets to the selected box at once — no mode switching:
       * - translate arrows at the center (TransformControls),
       * - 6 face-mounted resize arrows (scaling),
       * - 3 quarter-circle rotation arcs whose hitboxes match the visible arcs
       *   exactly, so they cannot contend with the resize arrows.
       */
      _showSelectionHandles() {
        if (!this.pivot || !this.selectedId) return;
        const move = this.tcMove;
        const entry = this.entryOf(this.selectedId);
        if (entry) {
          if (!this._faceHandles?.isAttached()) this._attachFaceHandles(entry);
          this._faceHandles?.setGroupVisible(true);
          this._faceHandles?.updatePositions();
          this._rotRings?.attach(entry.box, entry.quaternion, (q) => {
            this.pivot?.quaternion.copy(q);
            this.syncFromPivot();
          });
          this._rotRings?.setGroupVisible(true);
        }
        if (move) {
          move.attach(this.pivot);
          move.enabled = true;
          move.showX = move.showY = move.showZ = true;
        }
        this._raiseGizmo();
      }
      /** Detach every selection handle set: translate gizmo, resize arrows, rotation arcs. */
      _detachHandles() {
        this.tcMove?.detach();
        this._faceHandles?.detach();
        this._rotRings?.detach();
      }
      /**
       * Reset a box's orientation back to axis-aligned (identity rotation). Targets
       * the given box, or the selected one when omitted.
       */
      resetRotation(id) {
        const targetId = id ?? this.selectedId;
        if (!targetId) return;
        const entry = this.entryOf(targetId);
        if (!entry) return;
        entry.quaternion.identity();
        if (this.selectedId === targetId) {
          this.pivot?.quaternion.identity();
          this._faceHandles?.setQuaternion(entry.quaternion);
          this._rotRings?.updatePose(entry.box, entry.quaternion);
        }
        this.updateHelper(entry);
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      removeBox(id) {
        const idx = this.entries.findIndex((e) => e.id === id);
        if (idx === -1) return;
        this.entries.splice(idx, 1);
        this.disposeBox3Helper(this.helpers.get(id) ?? null);
        this.helpers.delete(id);
        const fill = this.fills.get(id);
        if (fill) {
          this.sm.scene.remove(fill);
          fill.geometry.dispose();
          fill.material.dispose();
          this.fills.delete(id);
        }
        if (this.selectedId === id) {
          this._detachHandles();
          this.disposePivot();
          this.selectedId = null;
          this.onSelectChange?.(null);
        }
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      setBoxMode(id, mode) {
        const entry = this.entryOf(id);
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
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
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
          this._showSelectionHandles();
        } else {
          this.tcMove?.detach();
          this._faceHandles?.setGroupVisible(false);
          this._rotRings?.setGroupVisible(false);
        }
      }
      setBoxVisible(id, visible) {
        const entry = this.entryOf(id);
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
        const entry = this.entryOf(id);
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
        this.disposeBox3Helper(this.draftHelper);
        this.draftHelper = null;
        if (box && !box.isEmpty()) {
          this.draftHelper = new THREE5.Box3Helper(box, new THREE5.Color(14472518));
          this.draftHelper.material.transparent = true;
          this.draftHelper.material.opacity = 0.6;
          this.draftHelper.renderOrder = 3;
          this.sm.scene.add(this.draftHelper);
        }
      }
      clear() {
        this._detachHandles();
        this.disposePivot();
        for (const [, helper] of this.helpers) this.disposeBox3Helper(helper);
        this.helpers.clear();
        for (const [, fill] of this.fills) {
          this.sm.scene.remove(fill);
          fill.geometry.dispose();
          fill.material.dispose();
        }
        this.fills.clear();
        this.entries = [];
        this.selectedId = null;
        this.disposeBox3Helper(this.draftHelper);
        this.draftHelper = null;
        this.applyAll();
        this.onChange?.([]);
        this.onSelectChange?.(null);
      }
      dispose() {
        this.clear();
        const tc = this.tcMove;
        if (tc) {
          this.sm.scene.remove(tc.getHelper());
          tc.dispose();
        }
        this.tcMove = null;
        this._initTcPromise = null;
        if (this._faceHandles) {
          this._faceHandles.dispose();
          this._faceHandles = null;
        }
        if (this._rotRings) {
          this._rotRings.dispose();
          this._rotRings = null;
        }
      }
      syncFromPivot() {
        if (!this.pivot || !this.selectedId) return;
        const entry = this.entryOf(this.selectedId);
        if (!entry) return;
        const center = this.pivot.position.clone();
        const halfSize = new THREE5.Vector3(
          Math.abs(this.pivot.scale.x) * 0.5,
          Math.abs(this.pivot.scale.y) * 0.5,
          Math.abs(this.pivot.scale.z) * 0.5
        );
        entry.box.min.copy(center).sub(halfSize);
        entry.box.max.copy(center).add(halfSize);
        entry.quaternion.copy(this.pivot.quaternion);
        this._faceHandles?.setQuaternion(entry.quaternion);
        this._rotRings?.updatePose(entry.box, entry.quaternion);
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
          const helper2 = new THREE5.Box3Helper(entry.box, new THREE5.Color(0));
          helper2.material.linewidth = 1;
          helper2.renderOrder = 3;
          helper2.visible = entry.visible && this._outlinesVisible;
          this.sm.scene.add(helper2);
          this.helpers.set(entry.id, helper2);
        }
        const helper = this.helpers.get(entry.id);
        if (helper) helper.quaternion.copy(entry.quaternion);
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        entry.box.getCenter(center);
        entry.box.getSize(size);
        const existingFill = this.fills.get(entry.id);
        if (existingFill) {
          existingFill.position.copy(center);
          existingFill.scale.copy(size);
          existingFill.quaternion.copy(entry.quaternion);
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
            const size = new THREE5.Vector3();
            const center = new THREE5.Vector3();
            entry.box.getSize(size);
            entry.box.getCenter(center);
            const matrix = new THREE5.Matrix4().compose(center, entry.quaternion, size);
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
    AxisWidget = class {
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
          if (m instanceof THREE5.SpriteMaterial) m.map?.dispose();
          m.dispose();
        }
        this._disposables = [];
        this._materials = [];
      }
    };
    MAX_SCENES = 50;
    _nextId2 = 1;
    PresentationManager = class {
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
        } catch (err) {
          console.warn("[PresentationManager] Failed to parse saved scenes, resetting.", err);
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
            if (!scene.id || !scene.name || !Array.isArray(scene.camera?.position) || !Array.isArray(scene.camera?.target)) continue;
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
    S3SourceAdapter = class {
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
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const ours = url.startsWith(this.baseUrl);
        const mergedHeaders = ours ? { ...this.headers, ...init?.headers } : init?.headers;
        return fetch(input, { ...init, headers: mergedHeaders });
      }
    };
    ElectronSourceAdapter = class {
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
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used inside <ViewerProvider>");
  return ctx;
}
function ViewerProvider({ config, children }) {
  const [sceneManager, _setSceneManager] = useState(null);
  const [loader, _setLoader] = useState(null);
  const [measurementManager, _setMeasurementManager] = useState(null);
  const [markerManager, _setMarkerManager] = useState(null);
  const [cameraAnimator, _setCameraAnimator] = useState(null);
  const [exporter, _setExporter] = useState(null);
  const [minimap, _setMinimap] = useState(null);
  const [clipManager, _setClipManager] = useState(null);
  const [activeTool, setActiveTool] = useState("none");
  const [pointBudget, setPointBudget] = useState(config.pointBudget ?? 2e6);
  const [pointSize, setPointSize] = useState(1.5);
  const [fps, setFps] = useState(0);
  const [pointCount, setPointCount] = useState(0);
  const [measurementList, setMeasurementList] = useState([]);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showMinimap, setShowMinimap] = useState(config.showMinimap ?? true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [clipBoxEntries, setClipBoxEntries] = useState([]);
  const [selectedClipBoxId, setSelectedClipBoxId] = useState(null);
  const [colorMode, setColorMode] = useState("rgb");
  const [navigationMode, _setNavigationMode] = useState("orbit");
  const [projection, _setProjection] = useState("perspective");
  const [displaySettings, setDisplaySettings] = useState(() => ({
    ...DISPLAY_PRESETS.standard,
    ...config.displaySettings
  }));
  const setNavigationMode = useCallback((mode) => {
    _setNavigationMode(mode);
  }, []);
  const setProjection = useCallback((mode) => {
    _setProjection(mode);
  }, []);
  const setSceneManager = useCallback((sm) => _setSceneManager(sm), []);
  const setLoader = useCallback((l) => _setLoader(l), []);
  const setMeasurementManager = useCallback((m) => _setMeasurementManager(m), []);
  const setMarkerManager = useCallback((m) => _setMarkerManager(m), []);
  const setCameraAnimator = useCallback((a) => _setCameraAnimator(a), []);
  const setExporter = useCallback((e) => _setExporter(e), []);
  const setMinimap = useCallback((r) => _setMinimap(r), []);
  const setClipManager = useCallback((c) => _setClipManager(c), []);
  const uiMode = config.uiMode ?? "professional";
  const [panoEngine, setPanoEngine] = useState(config.panoEngine ?? "photo-sphere-viewer");
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
    showMeasurements,
    setShowMeasurements,
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
  return /* @__PURE__ */ jsx(ViewerContext.Provider, { value, children });
}
var ViewerContext;
var init_viewer_provider = __esm({
  "src/providers/viewer-provider.tsx"() {
    "use client";
    init_dist();
    ViewerContext = createContext(null);
  }
});
function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
function DataProvider({ adapter, children }) {
  const [cameras, setCameras] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rev, setRev] = useState(0);
  useEffect(() => {
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
  return /* @__PURE__ */ jsx(DataContext.Provider, { value: { cameras, metadata, loading, error, reload }, children });
}
var DataContext;
var init_data_provider = __esm({
  "src/providers/data-provider.tsx"() {
    "use client";
    DataContext = createContext(null);
  }
});

// src/i18n/en.ts
var en;
var init_en = __esm({
  "src/i18n/en.ts"() {
    en = {
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
        tabLayers: "Layers",
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
        hintVolumeFootprint: "Drag to draw volume footprint",
        hintVolumeHeight: "Move mouse up/down to set height \u2022 Click to confirm",
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
        rotateZ: "Rotate",
        clippingOn: "Clipping on",
        clippingOff: "Clipping off",
        outlinesOn: "Outlines on",
        outlinesOff: "Outlines off",
        resetRotation: "Reset rotation"
      }
    };
  }
});
function useLocale() {
  return useContext(LocaleContext);
}
function LocaleProvider({ locale = en, children }) {
  return /* @__PURE__ */ jsx(LocaleContext.Provider, { value: locale, children });
}
var LocaleContext;
var init_locale_context = __esm({
  "src/i18n/locale-context.tsx"() {
    "use client";
    init_en();
    LocaleContext = createContext(en);
  }
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
var pcvChromeScaleStyle;
var init_utils = __esm({
  "src/lib/utils.ts"() {
    init_dist();
    pcvChromeScaleStyle = { zoom: "var(--pcv-scale, 1)" };
  }
});
function useMinimapResize(minimapRef, initialSize = 176) {
  const [minimapSize, setMinimapSize] = useState(initialSize);
  const sizeRef = useRef(initialSize);
  sizeRef.current = minimapSize;
  const draggingRef = useRef(false);
  const removeListenersRef = useRef(null);
  const handleMinimapResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    const startY = e.clientY;
    const startSize = sizeRef.current;
    const onMove = (ev) => {
      if (!draggingRef.current) return;
      const delta = startY - ev.clientY;
      setMinimapSize(Math.max(120, Math.min(400, startSize + delta)));
      minimapRef.current?.resize();
    };
    const onUp = () => {
      draggingRef.current = false;
      removeListenersRef.current?.();
      removeListenersRef.current = null;
      setTimeout(() => minimapRef.current?.resize(), 0);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    removeListenersRef.current = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [minimapRef]);
  useEffect(() => () => removeListenersRef.current?.(), []);
  return { minimapSize, handleMinimapResizeStart };
}
var init_use_minimap_resize = __esm({
  "src/hooks/use-minimap-resize.ts"() {
    "use client";
  }
});
function useSnapThrottle(pick) {
  const rafRef = useRef(null);
  const ndcRef = useRef(null);
  const pickRef = useRef(pick);
  pickRef.current = pick;
  const scheduleSnap = useCallback((nx, ny) => {
    ndcRef.current = { nx, ny };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const p = ndcRef.current;
        if (p) pickRef.current(p.nx, p.ny);
      });
    }
  }, []);
  const cancelSnap = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);
  useEffect(() => cancelSnap, [cancelSnap]);
  return { scheduleSnap, cancelSnap };
}
var init_use_snap_throttle = __esm({
  "src/hooks/use-snap-throttle.ts"() {
    "use client";
  }
});

// src/components/viewport.tsx
var viewport_exports = {};
__export(viewport_exports, {
  Viewport: () => Viewport
});
function Viewport({ className }) {
  const containerRef = useRef(null);
  const minimapContainerRef = useRef(null);
  const initialized = useRef(false);
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
    showMeasurements,
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
  const metaZRef = useRef(null);
  useEffect(() => {
    if (metadata) {
      metaZRef.current = {
        min: metadata.boundingBox.min[2],
        max: metadata.boundingBox.max[2]
      };
    }
  }, [metadata]);
  const smRef = useRef(null);
  const loaderRef = useRef(null);
  const markerRef = useRef(null);
  const measureRef = useRef(null);
  const minimapRef = useRef(null);
  const clipRef = useRef(null);
  const animRef = useRef(null);
  const axisRef = useRef(null);
  const { minimapSize, handleMinimapResizeStart } = useMinimapResize(minimapRef);
  const clipDraftRef = useRef(null);
  const clipDownRef = useRef(null);
  const volumeDragRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;
    const adapter = createAdapter(config.source);
    const sm = new SceneManager({
      canvas: containerRef.current,
      onFpsUpdate: setFps
    });
    const loader = new PointCloudLoader(sm, adapter);
    const measureMgr = new MeasurementManager(sm.scene);
    measureMgr.onChange = (list) => setMeasurementList(list);
    const markerMgr = new MarkerManager(sm.scene);
    const anim = new CameraAnimator(sm.camera, sm.controls);
    const exporter = new ExportManager(sm);
    const minimapRdr = new MinimapRenderer(sm);
    const clipMgr = new ClipManager(sm);
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
    const axisWidget = new AxisWidget(sm);
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
        const worldBox = new THREE5.Box3();
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
  useEffect(() => {
    if (minimapRef.current && minimapContainerRef.current) {
      minimapRef.current.attach(minimapContainerRef.current);
    }
  }, [showMinimap]);
  const navigateMinimap = useCallback((el, clientX, clientY) => {
    const sm = smRef.current;
    const minimap = minimapRef.current;
    if (!sm || !minimap) return;
    const rect = el.getBoundingClientRect();
    const world = minimap.canvasToWorld(clientX - rect.left, clientY - rect.top);
    const cam = sm.camera;
    const offset = new THREE5.Vector3().subVectors(cam.position, sm.controls.target);
    sm.controls.target.set(world.x, world.y, sm.controls.target.z);
    cam.position.set(world.x + offset.x, world.y + offset.y, cam.position.z);
    sm.controls.update();
  }, []);
  const minimapDragRef = useRef(false);
  const handleMinimapPointerDown = useCallback((e) => {
    minimapDragRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    navigateMinimap(e.currentTarget, e.clientX, e.clientY);
  }, [navigateMinimap]);
  const handleMinimapPointerMove = useCallback((e) => {
    if (minimapDragRef.current) navigateMinimap(e.currentTarget, e.clientX, e.clientY);
  }, [navigateMinimap]);
  const handleMinimapPointerUp = useCallback((e) => {
    minimapDragRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);
  useEffect(() => {
    if (markerRef.current && cameras.length > 0) {
      const wb = loaderRef.current?.worldBox;
      markerRef.current.build(cameras, wb && !wb.isEmpty() ? wb : void 0);
      markerRef.current.setVisible(showMarkers);
    }
  }, [cameras, showMarkers]);
  useEffect(() => {
    markerRef.current?.setVisible(showMarkers);
  }, [showMarkers]);
  useEffect(() => {
    measureRef.current?.setVisible(showMeasurements);
  }, [showMeasurements]);
  useEffect(() => {
    const mm = markerRef.current;
    const cm = clipRef.current;
    if (!mm) return;
    mm.applyClipFilter(cm ? (p) => cm.isPointVisible(p) : null);
  }, [clipBoxEntries]);
  useEffect(() => {
    lastSnapRef.current = null;
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
  }, [activeTool]);
  useEffect(() => {
    smRef.current?.setNavigationMode(navigationMode);
  }, [navigationMode]);
  useEffect(() => {
    smRef.current?.setProjection(projection);
  }, [projection]);
  useEffect(() => {
    measureRef.current?.applyDisplaySettings(displaySettings);
    markerRef.current?.applyDisplaySettings(displaySettings);
  }, [displaySettings]);
  const projectToPlaneZ = useCallback((nx, ny, planeZ) => {
    const sm = smRef.current;
    if (!sm) return null;
    const raycaster = new THREE5.Raycaster();
    raycaster.setFromCamera(new THREE5.Vector2(nx, ny), sm.camera);
    const plane = new THREE5.Plane(new THREE5.Vector3(0, 0, 1), -planeZ);
    const hit = new THREE5.Vector3();
    return raycaster.ray.intersectPlane(plane, hit) ? hit : null;
  }, []);
  const pickVisiblePoint = useCallback((nx, ny) => {
    const sm = smRef.current;
    if (!sm) return null;
    const picked = sm.pickPoint(nx, ny);
    if (picked && (!clipRef.current || clipRef.current.isPointVisible(picked))) {
      return picked;
    }
    return projectToPlaneZ(nx, ny, sm.controls.target.z);
  }, [projectToPlaneZ]);
  const lastSnapRef = useRef(null);
  const { scheduleSnap, cancelSnap } = useSnapThrottle((nx, ny) => {
    const hit = pickVisiblePoint(nx, ny);
    lastSnapRef.current = hit;
    if (hit) measureRef.current?.updateSnap(hit);
  });
  const buildClipDraftAt = useCallback((nx, ny) => {
    const sm = smRef.current;
    if (!sm) return null;
    const zMid = metaZRef.current ? (metaZRef.current.min + metaZRef.current.max) / 2 : sm.controls.target.z;
    const center = projectToPlaneZ(nx, ny, zMid);
    if (!center) return null;
    const wb = loaderRef.current?.worldBox;
    const bounds = new THREE5.Vector3(20, 20, 20);
    if (wb && !wb.isEmpty()) wb.getSize(bounds);
    const half = new THREE5.Vector3(
      Math.max(0.1, Math.min(bounds.x, bounds.x / 4)) / 2,
      Math.max(0.1, Math.min(bounds.y, bounds.y / 4)) / 2,
      Math.max(0.2, Math.min(bounds.z, bounds.z / 12, 8)) / 2
    );
    return new THREE5.Box3(
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
  const handleDblClick = useCallback((e) => {
    const sm = smRef.current;
    const anim = animRef.current;
    if (!sm || !anim) return;
    const { nx, ny } = getNDC(e);
    const hit = sm.pickPoint(nx, ny) ?? projectToPlaneZ(nx, ny, sm.controls.target.z);
    if (!hit) return;
    anim.flyTo({ position: sm.camera.position.clone(), target: hit, duration: 600 });
  }, [projectToPlaneZ]);
  const handleMouseDown = useCallback((e) => {
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
    const rr = clipRef.current?.rotationRings;
    if (rr && rr.isAttached() && e.button === 0 && !clipRef.current?.isGizmoDragging()) {
      if (rr.onPointerDown(e.clientX, e.clientY)) {
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
  const handleMouseMove = useCallback((e) => {
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerMove(e.clientX, e.clientY);
      return;
    }
    const rr = clipRef.current?.rotationRings;
    if (rr && rr.isDragging()) {
      rr.onPointerMove(e.clientX, e.clientY);
      return;
    }
    if (fh && fh.isAttached()) fh.updateHover(e.clientX, e.clientY);
    if (rr && rr.isAttached()) rr.updateHover(e.clientX, e.clientY);
    const vd = volumeDragRef.current;
    if (vd && activeTool === "measure-volume") {
      if (vd.phase === "footprint") {
        const { nx, ny } = getNDC(e);
        const endWorld = projectToPlaneZ(nx, ny, vd.planeZ);
        if (!endWorld) return;
        const { startWorld } = vd;
        const zMin = metaZRef.current?.min ?? vd.planeZ - 10;
        const zMax = metaZRef.current?.max ?? vd.planeZ + 10;
        const box = new THREE5.Box3(
          new THREE5.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
          new THREE5.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax)
        );
        measureRef.current?.setVolumeDraft(box);
      } else if (vd.phase === "height" && vd.footprintBox && vd.startClientY !== void 0) {
        const deltaY = vd.startClientY - e.clientY;
        const sensitivity = 0.1;
        const zExtent = Math.max(0.1, Math.abs(deltaY) * sensitivity);
        const midZ = ((vd.baseZMin ?? 0) + (vd.baseZMax ?? 0)) / 2;
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
    if (activeTool.startsWith("measure-") && smRef.current) {
      const { nx, ny } = getNDC(e);
      scheduleSnap(nx, ny);
    }
  }, [activeTool, scheduleSnap, buildClipDraftAt]);
  const handleMouseUp = useCallback((e) => {
    const sm = smRef.current;
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerUp();
      if (sm) sm.controls.enabled = true;
      return;
    }
    const rrUp = clipRef.current?.rotationRings;
    if (rrUp && rrUp.isDragging()) {
      rrUp.onPointerUp();
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
        const box = new THREE5.Box3(
          new THREE5.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
          new THREE5.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax)
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
  const handleClick = useCallback((e) => {
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
      const hit = lastSnapRef.current ?? pickVisiblePoint(nx, ny);
      if (hit) {
        if (!measureRef.current.activeMeasurement) measureRef.current.start(type);
        measureRef.current.addPoint(hit.clone());
      }
    }
  }, [activeTool, cameras, config, pickVisiblePoint, showMarkers]);
  const handleMouseLeave = useCallback(() => {
    cancelSnap();
    lastSnapRef.current = null;
    measureRef.current?.clearSnap();
  }, [cancelSnap]);
  const handleContextMenu = useCallback((e) => {
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
  return /* @__PURE__ */ jsxs("div", { className: cn("relative w-full h-full overflow-hidden bg-[hsl(var(--viewport-bg))]", className), children: [
    /* @__PURE__ */ jsx(
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
          // Keep the OS cursor visible while measuring — the user must never
          // lose the pointer. The 3D snap crosshair shows where the pick will
          // LAND (it can differ from the cursor when snapping), the OS
          // crosshair shows where the mouse IS.
          cursor: activeTool === "section-box" || activeTool.startsWith("measure-") ? "crosshair" : "default"
        }
      }
    ),
    showMinimap && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "absolute rounded-lg overflow-hidden border border-white/10 shadow-lg cursor-pointer transition-[right] duration-200",
        style: {
          width: minimapSize,
          height: minimapSize,
          right: "var(--pcv-minimap-right, 0.75rem)",
          // Lift above the OS home indicator / browser nav bar on mobile.
          bottom: "calc(2.5rem + env(safe-area-inset-bottom))"
        },
        onPointerDown: handleMinimapPointerDown,
        onPointerMove: handleMinimapPointerMove,
        onPointerUp: handleMinimapPointerUp,
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: minimapContainerRef,
              className: "relative w-full h-full"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-2 text-[9px] text-white/40 font-mono pointer-events-none", children: t.overview }),
          /* @__PURE__ */ jsx(
            "div",
            {
              onMouseDown: handleMinimapResizeStart,
              onPointerDown: (e) => e.stopPropagation(),
              className: "absolute top-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center",
              title: "Resize minimap",
              children: /* @__PURE__ */ jsx("svg", { width: "8", height: "8", viewBox: "0 0 8 8", className: "text-white/30", children: /* @__PURE__ */ jsx("path", { d: "M0 8L8 0M3 8L8 3M6 8L8 6", stroke: "currentColor", strokeWidth: "1" }) })
            }
          )
        ]
      }
    ),
    activeTool !== "none" && /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-[hsl(var(--brand))] text-xs font-mono px-3 py-1 rounded-full pointer-events-none", children: [
      activeTool === "measure-point" && t.hintPoint,
      activeTool === "measure-distance" && t.hintDistance,
      activeTool === "measure-height" && t.hintHeight,
      activeTool === "measure-area" && t.hintArea,
      activeTool === "measure-angle" && t.hintAngle,
      activeTool === "measure-volume" && (volumeDragRef.current?.phase === "height" ? t.hintVolumeHeight : t.hintVolumeFootprint),
      activeTool === "section-box" && t.hintSectionBox
    ] }),
    metadata && /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-3 text-[10px] font-mono text-white/30 pointer-events-none", children: [
      (metadata.points / 1e6).toFixed(1),
      "M pts"
    ] })
  ] });
}
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
    init_use_minimap_resize();
    init_use_snap_throttle();
  }
});

// src/index.ts
init_dist();
var ThemeContext = createContext(null);
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
function ThemeProvider({
  defaultTheme = "dark",
  storageKey = "pcv-theme",
  children
}) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    return localStorage.getItem(storageKey) ?? defaultTheme;
  });
  const [, forceUpdate] = useReducer((n) => n + 1, 0);
  const resolvedTheme = theme === "system" ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : theme;
  useEffect(() => {
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
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme, resolvedTheme, setTheme, toggleTheme }, children });
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
function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" ? window.innerWidth < breakpointPx : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx]);
  return isMobile;
}

// src/components/toolbar/main-toolbar.tsx
init_utils();
init_viewer_provider();

// src/components/toolbar/view-controls.tsx
init_viewer_provider();
init_locale_context();
var CUBE_WIRE = /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("path", { d: "M12 2L22 8V16L12 22L2 16V8Z", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round", fill: "none" }),
  /* @__PURE__ */ jsx("path", { d: "M12 12L22 8", stroke: "currentColor", strokeWidth: "1.2" }),
  /* @__PURE__ */ jsx("path", { d: "M12 12L2 8", stroke: "currentColor", strokeWidth: "1.2" }),
  /* @__PURE__ */ jsx("path", { d: "M12 12V22", stroke: "currentColor", strokeWidth: "1.2" })
] });
function TopIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M2 8L12 2L22 8L12 12Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function BottomIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M2 16L12 22L22 16L12 12Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function FrontIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M2 8L12 12V22L2 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function BackIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M22 8L12 12V22L22 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function LeftIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M2 8L12 2V12L2 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function RightIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M22 8L12 2V12L22 16Z", fill: "currentColor", fillOpacity: "0.35" })
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
  return /* @__PURE__ */ jsx(Fragment, { children: VIEW_DEFS.map((v) => /* @__PURE__ */ jsx(
    ToolbarIconBtn,
    {
      icon: /* @__PURE__ */ jsx(v.icon, {}),
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
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("path", { d: "M5 8l7-4 7 4v8l-7 4-7-4V8z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M5 8l7 4 7-4", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M12 12v8", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("path", { d: "M20 5a9.5 9.5 0 0 0-4-2.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M20 5l-1.5-2M20 5l2-1", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function FreeIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("path", { d: "M7 9l5-3 5 3v6l-5 3-5-3V9z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M7 9l5 3 5-3", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M12 12v6", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("path", { d: "M4 8a8.5 8.5 0 0 1 2-3", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M4 8l-1.5-1.5M4 8l1.5-2", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function PanIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("path", { d: "M5 8l7-4 7 4v8l-7 4-7-4V8z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M5 8l7 4 7-4", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M12 12v8", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("path", { d: "M5 8l7-4 7 4-7 4z", fill: "currentColor", fillOpacity: "0.25" }),
    /* @__PURE__ */ jsx("path", { d: "M3 20h4M3 20l1.5-1.5M3 20l1.5 1.5", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function PerspectiveIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "12", height: "12", rx: "0.5", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("rect", { x: "9", y: "7", width: "12", height: "12", rx: "0.5", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "4", x2: "9", y2: "7", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "15", y1: "4", x2: "21", y2: "7", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "16", x2: "9", y2: "19", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "15", y1: "16", x2: "21", y2: "19", stroke: "currentColor", strokeWidth: "1.3" })
  ] });
}
function OrthoIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("rect", { x: "4", y: "4", width: "10", height: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("rect", { x: "10", y: "10", width: "10", height: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "4", x2: "10", y2: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "14", y1: "4", x2: "20", y2: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "14", x2: "10", y2: "20", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "14", y1: "14", x2: "20", y2: "20", stroke: "currentColor", strokeWidth: "1.3" })
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
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-1", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5 border border-[hsl(var(--border))] rounded p-0.5", children: NAV_MODES.map((nm) => /* @__PURE__ */ jsx(
      "button",
      {
        className: iconBtnClass(navigationMode === nm.value),
        title: t[nm.titleKey],
        onClick: () => setNavigationMode(nm.value),
        children: /* @__PURE__ */ jsx(nm.icon, {})
      },
      nm.value
    )) }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5 border border-[hsl(var(--border))] rounded p-0.5", children: PROJ_MODES.map((pm) => /* @__PURE__ */ jsx(
      "button",
      {
        className: iconBtnClass(projection === pm.value),
        title: t[pm.titleKey],
        onClick: () => setProjection(pm.value),
        children: /* @__PURE__ */ jsx(pm.icon, {})
      },
      pm.value
    )) })
  ] });
}
function DisplayControls() {
  const { pointBudget, setPointBudget, pointSize, setPointSize, loader, colorMode, setColorMode, uiMode } = useViewer();
  const t = useLocale().toolbar;
  const [quality, setQuality] = useState("balanced");
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
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-1", children: [
    isPro && /* @__PURE__ */ jsx(
      "select",
      {
        value: colorMode,
        onChange: handleColorMode,
        className: selectClass,
        title: t.colorMode,
        children: COLOR_MODES.map((cm) => /* @__PURE__ */ jsx("option", { value: cm.value, children: t[cm.labelKey] ?? cm.value }, cm.value))
      }
    ),
    isPro && /* @__PURE__ */ jsx(
      "select",
      {
        value: quality,
        onChange: handleQuality,
        className: selectClass,
        title: t.quality,
        children: QUALITY_PRESETS.map((q) => /* @__PURE__ */ jsx("option", { value: q.value, children: t[q.label] ?? q.value }, q.value))
      }
    ),
    isPro && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono", children: [
      /* @__PURE__ */ jsx("span", { className: "hidden lg:block", children: t.budget }),
      /* @__PURE__ */ jsx(
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
      /* @__PURE__ */ jsxs("span", { className: "w-8 text-right tabular-nums", children: [
        (pointBudget / 1e6).toFixed(0),
        "M"
      ] })
    ] }),
    isPro && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono", children: [
      /* @__PURE__ */ jsx("span", { className: "hidden lg:block", children: t.size }),
      /* @__PURE__ */ jsx(
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
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("current");
  const [scale, setScale] = useState(2);
  const [bg, setBg] = useState("white");
  const [fmt, setFmt] = useState("png");
  const [exporting, setExporting] = useState(false);
  const btnRef = useRef(null);
  const popoverRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [open]);
  const handleClickOutside = useCallback((e) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
      setOpen(false);
    }
  }, []);
  useEffect(() => {
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
      ExportManager.download(url, `pointcloud_${view}_${date}.${fmt}`);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };
  const views = [
    { value: "current", label: "Current view" },
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
  return /* @__PURE__ */ jsxs("div", { ref: btnRef, children: [
    /* @__PURE__ */ jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsx(Download, { size: 14 }),
        title: t.exportImageTitle,
        active: open,
        onClick: () => setOpen(!open)
      }
    ),
    open && createPortal(
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: popoverRef,
          style: { position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 },
          className: "bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-xl p-3 w-52 text-xs text-foreground",
          children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold mb-2 text-[hsl(var(--brand))]", children: t.title }),
            /* @__PURE__ */ jsx("label", { className: "block mb-1 text-muted-foreground", children: t.view }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: view,
                onChange: (e) => setView(e.target.value),
                className: "w-full mb-2 bg-muted text-foreground rounded px-1 py-0.5 text-xs border border-[hsl(var(--border))]",
                children: views.map((v) => /* @__PURE__ */ jsx("option", { value: v.value, children: v.label }, v.value))
              }
            ),
            /* @__PURE__ */ jsx("label", { className: "block mb-1 text-muted-foreground", children: t.scale }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-2", children: [1, 2, 4].map((s) => /* @__PURE__ */ jsxs(
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
            /* @__PURE__ */ jsx("label", { className: "block mb-1 text-muted-foreground", children: t.background }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-2", children: ["white", "black", "transparent"].map((b) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setBg(b),
                className: `flex-1 py-0.5 rounded text-xs border transition-colors ${bg === b ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`,
                children: bgLabels[b]
              },
              b
            )) }),
            /* @__PURE__ */ jsx("label", { className: "block mb-1 text-muted-foreground", children: t.format }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-3", children: ["png", "jpeg"].map((f) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setFmt(f),
                className: `flex-1 py-0.5 rounded text-xs border transition-colors uppercase ${fmt === f ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`,
                children: f
              },
              f
            )) }),
            /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-0.5 px-2 border-r border-[hsl(var(--toolbar-border))] last:border-r-0", className), children: [
    children,
    label && /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground/50 ml-1 hidden xl:block font-mono uppercase tracking-wider", children: label })
  ] });
}
function MainToolbar({ onToggleRenderSettings, renderSettingsOpen }) {
  const { uiMode } = useViewer();
  const isPro = uiMode === "professional";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center h-10 px-2 gap-0 select-none overflow-x-auto", children: [
    /* @__PURE__ */ jsxs(ToolbarSection, { label: "Views", children: [
      /* @__PURE__ */ jsx(ViewControls, {}),
      /* @__PURE__ */ jsx(ViewModeControls, {})
    ] }),
    /* @__PURE__ */ jsxs(ToolbarSection, { label: "Display", children: [
      /* @__PURE__ */ jsx(DisplayControls, {}),
      isPro && /* @__PURE__ */ jsx(
        ToolbarIconBtn,
        {
          icon: /* @__PURE__ */ jsx(SlidersHorizontal, { size: 14 }),
          active: renderSettingsOpen,
          onClick: onToggleRenderSettings,
          title: "Settings"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsx(ToolbarSection, { children: isPro && /* @__PURE__ */ jsx(ExportTools, {}) })
  ] });
}
function ToolbarIconBtn({ icon, label, active, onClick, title }) {
  return /* @__PURE__ */ jsxs(
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
        label && /* @__PURE__ */ jsx("span", { className: "hidden xl:block", children: label })
      ]
    }
  );
}

// src/components/toolbar/tool-rail.tsx
init_utils();
init_viewer_provider();
init_locale_context();
function RailBtn({ icon, title, active, onClick, disabled, compact }) {
  return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsx("div", { className: "h-px w-6 mx-auto bg-[hsl(var(--border))] my-0.5" });
}
function GroupLabel({ children }) {
  return /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50 text-center leading-none mt-1", children });
}
var BASIC_MEASURES = [
  { type: "point", tool: "measure-point", icon: /* @__PURE__ */ jsx(MapPin, { size: 15 }), titleKey: "measurePoint" },
  { type: "distance", tool: "measure-distance", icon: /* @__PURE__ */ jsx(Ruler, { size: 15 }), titleKey: "measureDistance" },
  { type: "height", tool: "measure-height", icon: /* @__PURE__ */ jsx(ArrowUpDown, { size: 15 }), titleKey: "measureHeight" }
];
var ADVANCED_MEASURES = [
  { type: "area", tool: "measure-area", icon: /* @__PURE__ */ jsx(Pentagon, { size: 15 }), titleKey: "measureArea" },
  { type: "volume", tool: "measure-volume", icon: /* @__PURE__ */ jsx(Package, { size: 15 }), titleKey: "measureVolume" },
  { type: "angle", tool: "measure-angle", icon: /* @__PURE__ */ jsx(Triangle, { size: 15 }), titleKey: "measureAngle" },
  { type: "profile", tool: "measure-profile", icon: /* @__PURE__ */ jsx(Waypoints, { size: 15 }), titleKey: "measureProfile" }
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5 py-2 px-1 w-10 shrink-0", children: [
    /* @__PURE__ */ jsx(GroupLabel, { children: t.measureGroup }),
    BASIC_MEASURES.map((def) => /* @__PURE__ */ jsx(
      RailBtn,
      {
        icon: def.icon,
        title: t[def.titleKey] ?? def.type,
        active: activeTool === def.tool,
        onClick: () => toggle(def.tool)
      },
      def.tool
    )),
    isPro && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Divider, {}),
      ADVANCED_MEASURES.map((def) => /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx(
      RailBtn,
      {
        icon: /* @__PURE__ */ jsx(X, { size: 13 }),
        title: t.clearMeasurements,
        onClick: clearMeasurements,
        compact: true
      }
    ),
    isPro && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(GroupLabel, { children: t.sectionGroup }),
      /* @__PURE__ */ jsx(
        RailBtn,
        {
          icon: /* @__PURE__ */ jsx(BoxSelect, { size: 15 }),
          title: !hasClipBox ? t.drawClipBox : clipSelected ? "Deselect section (crop stays active)" : "Edit section",
          active: clipSelected,
          onClick: toggleClipBox
        }
      ),
      hasClipBox && /* @__PURE__ */ jsx(
        RailBtn,
        {
          icon: /* @__PURE__ */ jsx(X, { size: 13 }),
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
  const addBox = useCallback(() => {
    if (!clipManager || !loader) return;
    if (loader.worldBox.isEmpty()) return;
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  }, [clipManager, loader]);
  const clearAll = useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);
  const toggleMode = useCallback(() => {
    const next = clipMode === "outside" ? "inside" : "outside";
    clipManager?.setModeAll(next);
  }, [clipManager, clipMode]);
  const setEnabled = useCallback((enabled) => {
    clipManager?.setEnabled(enabled);
  }, [clipManager]);
  const isEnabled = clipManager?.isEnabled() ?? true;
  const outlinesVisible = clipManager?.areOutlinesVisible() ?? true;
  const setOutlinesVisible = useCallback((visible) => {
    clipManager?.setOutlinesVisible(visible);
  }, [clipManager]);
  const selectBox = useCallback((id) => {
    clipManager?.selectBox(id);
  }, [clipManager]);
  const resetRotation = useCallback((id) => {
    clipManager?.resetRotation(id);
  }, [clipManager]);
  const setTransformMode = useCallback((_mode) => {
    if (!clipManager) return;
    if (!clipManager.getSelectedId() && boxes[0]) clipManager.selectBox(boxes[0].id);
  }, [clipManager, boxes]);
  const removeBox = useCallback((id) => {
    clipManager?.removeBox(id);
  }, [clipManager]);
  const setBoxVisible = useCallback((id, visible) => {
    clipManager?.setBoxVisible(id, visible);
  }, [clipManager]);
  const setModeAll = useCallback((mode) => {
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
  const { boxes, selectedBoxId: selectedClipBoxId, addBox, clearAll, setModeAll, selectBox, removeBox, setBoxVisible, isEnabled, setEnabled, outlinesVisible, setOutlinesVisible, resetRotation } = useClipActions();
  const t = useLocale().clipToolbar;
  const [enabled, setEnabledLocal] = React27.useState(isEnabled);
  const [outlines, setOutlinesLocal] = React27.useState(outlinesVisible);
  React27.useEffect(() => {
    setEnabledLocal(isEnabled);
    setOutlinesLocal(outlinesVisible);
  }, [isEnabled, outlinesVisible, boxes]);
  if (boxes.length === 0) return null;
  const firstVisible = boxes.find((b) => b.visible);
  const isInside = (firstVisible?.mode ?? "outside") === "inside";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-52 py-2 px-1 select-none", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1 mb-1.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold text-foreground", children: [
        /* @__PURE__ */ jsx(BoxSelect, { size: 13, className: "text-[hsl(var(--brand))]" }),
        /* @__PURE__ */ jsx("span", { children: t.title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            title: t.addBox,
            onClick: addBox,
            className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 12 }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: t.addBox })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            title: t.clearAll,
            onClick: clearAll,
            className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-destructive/20 hover:text-destructive transition-colors",
            children: /* @__PURE__ */ jsx(Trash2, { size: 12 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-px bg-muted mx-1 mb-1.5" }),
    /* @__PURE__ */ jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          const next = !enabled;
          setEnabledLocal(next);
          setEnabled(next);
        },
        title: enabled ? t.clippingOn : t.clippingOff,
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border",
          enabled ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          enabled ? /* @__PURE__ */ jsx(Scissors, { size: 12 }) : /* @__PURE__ */ jsx(ScissorsLineDashed, { size: 12 }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: enabled ? t.clippingOn : t.clippingOff }),
          /* @__PURE__ */ jsx(Power, { size: 12, className: enabled ? "text-[hsl(var(--brand))]" : "text-muted-foreground" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          const next = !outlines;
          setOutlinesLocal(next);
          setOutlinesVisible(next);
        },
        title: outlines ? t.outlinesOn : t.outlinesOff,
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border",
          outlines ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          outlines ? /* @__PURE__ */ jsx(Eye, { size: 12 }) : /* @__PURE__ */ jsx(EyeOff, { size: 12 }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: outlines ? t.outlinesOn : t.outlinesOff })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setModeAll(isInside ? "outside" : "inside"),
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors",
          "border",
          isInside ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          /* @__PURE__ */ jsx(Scissors, { size: 12 }),
          /* @__PURE__ */ jsx("span", { children: isInside ? t.keepInside : t.keepOutside })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "max-h-40 overflow-y-auto flex flex-col gap-0.5 px-1", children: boxes.map((box) => {
      const isSelected = box.id === selectedClipBoxId;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "flex items-center gap-1 rounded px-1 py-0.5 transition-colors",
            isSelected ? "bg-[hsl(var(--brand)/0.15)]" : "hover:bg-muted/40"
          ),
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                title: box.visible ? t.hide : t.show,
                onClick: () => setBoxVisible(box.id, !box.visible),
                className: "flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                children: box.visible ? /* @__PURE__ */ jsx(Eye, { size: 12 }) : /* @__PURE__ */ jsx(EyeOff, { size: 12 })
              }
            ),
            /* @__PURE__ */ jsx(
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
            /* @__PURE__ */ jsx(
              "button",
              {
                title: t.delete,
                onClick: () => removeBox(box.id),
                className: "flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors",
                children: /* @__PURE__ */ jsx(Trash2, { size: 12 })
              }
            )
          ]
        },
        box.id
      );
    }) }),
    selectedClipBoxId && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-px bg-muted mx-1 mt-1.5 mb-1.5" }),
      /* @__PURE__ */ jsx("div", { className: "px-1", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => resetRotation(),
          title: t.resetRotation,
          className: "w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[10px] border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
          children: [
            /* @__PURE__ */ jsx(RotateCcw, { size: 12 }),
            /* @__PURE__ */ jsx("span", { children: t.resetRotation })
          ]
        }
      ) })
    ] })
  ] });
}

// src/components/sidebar/sidebar.tsx
init_locale_context();
init_viewer_provider();
init_data_provider();

// src/components/sidebar/layers-panel.tsx
init_utils();
init_viewer_provider();
init_data_provider();

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
  const [visible, setVisible] = useState(
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full overflow-y-auto p-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => toggleAll(true), className: "text-[9px] text-muted-foreground hover:text-foreground transition-colors", children: t.all }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[9px]", children: "/" }),
        /* @__PURE__ */ jsx("button", { onClick: () => toggleAll(false), className: "text-[9px] text-muted-foreground hover:text-foreground transition-colors", children: t.none })
      ] })
    ] }),
    CLASS_DEFS.map((cls) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 py-1 cursor-pointer group", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: visible[cls.code] ?? true,
          onChange: () => toggle(cls.code),
          className: "accent-[hsl(var(--brand))] w-3 h-3 shrink-0"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-sm shrink-0", style: { background: cls.color } }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-foreground", children: cls.code }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground truncate", children: t.classLabels[cls.code] ?? String(cls.code) })
    ] }, cls.code))
  ] });
}

// src/ui/toggle-row.tsx
init_utils();
function ToggleRow({ icon, label, active, onToggle, disabled, hint }) {
  const on = active && !disabled;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: disabled ? void 0 : onToggle,
      disabled,
      title: hint ?? label,
      className: cn(
        "flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-colors text-left",
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: cn("text-muted-foreground", on && "text-[hsl(var(--brand))]"), children: icon }),
        /* @__PURE__ */ jsxs("span", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "block text-xs text-foreground truncate", children: label }),
          hint && /* @__PURE__ */ jsx("span", { className: "block text-[10px] text-muted-foreground/60 truncate", children: hint })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "w-7 h-4 rounded-full transition-colors flex items-center px-0.5 shrink-0",
              on ? "bg-[hsl(var(--brand)/0.6)]" : "bg-muted"
            ),
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  "w-3 h-3 rounded-full bg-foreground transition-transform",
                  on && "translate-x-3"
                )
              }
            )
          }
        )
      ]
    }
  );
}
function LayersPanel() {
  const {
    showMarkers,
    setShowMarkers,
    showMeasurements,
    setShowMeasurements,
    showMinimap,
    setShowMinimap
  } = useViewer();
  const { cameras } = useData();
  const hasPanoramas = cameras.length > 0;
  return /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-1 overflow-y-auto h-full", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-1 mb-1", children: "Layers" }),
    hasPanoramas && /* @__PURE__ */ jsx(
      ToggleRow,
      {
        icon: /* @__PURE__ */ jsx(Camera, { size: 15 }),
        label: "Panoramas",
        active: showMarkers,
        onToggle: () => setShowMarkers(!showMarkers)
      }
    ),
    /* @__PURE__ */ jsx(
      ToggleRow,
      {
        icon: /* @__PURE__ */ jsx(Ruler, { size: 15 }),
        label: "Measurements",
        active: showMeasurements,
        onToggle: () => setShowMeasurements(!showMeasurements)
      }
    ),
    /* @__PURE__ */ jsx(
      ToggleRow,
      {
        icon: /* @__PURE__ */ jsx(Map$1, { size: 15 }),
        label: "Minimap",
        active: showMinimap,
        onToggle: () => setShowMinimap(!showMinimap)
      }
    ),
    /* @__PURE__ */ jsx(ClassificationSection, {})
  ] });
}
function ClassificationSection() {
  const [open, setOpen] = React27.useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "mt-1 border-t border-border pt-1", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        className: "flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: /* @__PURE__ */ jsx(Tag, { size: 15 }) }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-xs text-foreground", children: "Classification" }),
          /* @__PURE__ */ jsx(ChevronRight, { size: 14, className: cn("text-muted-foreground/60 transition-transform", open && "rotate-90") })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto", children: /* @__PURE__ */ jsx(ClassificationPanel, {}) })
  ] });
}

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
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => {
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))] shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-muted rounded px-2 py-1", children: [
        /* @__PURE__ */ jsx(Search, { size: 11, className: "text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: t.searchPlaceholder,
            className: "flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1.5", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground font-mono", children: [
          filtered.length,
          " / ",
          cameras.length
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowMarkers(!showMarkers),
            title: tToolbar.togglePanoramas,
            className: cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors",
              showMarkers ? "text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)] hover:bg-[hsl(var(--brand)/0.2)]" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            ),
            children: [
              showMarkers ? /* @__PURE__ */ jsx(Eye, { size: 11 }) : /* @__PURE__ */ jsx(EyeOff, { size: 11 }),
              /* @__PURE__ */ jsx("span", { children: tToolbar.panoramas })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: filtered.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center mt-8 px-4", children: t.noResults }) : filtered.map((cam) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-[hsl(var(--border)/0.4)] hover:bg-muted transition-colors
                ${selected === cam.index ? "bg-[hsl(var(--brand)/0.12)] border-l-2 border-l-[hsl(var(--brand))]" : ""}`,
        onClick: () => openPano(cam.index),
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-7 rounded shrink-0 bg-muted overflow-hidden", children: cam.thumbnail || cam.image ? /* @__PURE__ */ jsx(
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
          ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsx(Navigation, { size: 10, className: "text-muted-foreground" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-mono truncate text-foreground", children: cam.name }),
            cam.position && /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-muted-foreground font-mono", children: [
              cam.position.x.toFixed(1),
              ", ",
              cam.position.y.toFixed(1),
              ", ",
              cam.position.z.toFixed(1)
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                flyTo(cam.index);
              },
              title: t.flyTo,
              className: "shrink-0 text-muted-foreground hover:text-[hsl(var(--brand))] transition-colors",
              children: /* @__PURE__ */ jsx(Navigation, { size: 11 })
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full overflow-y-auto text-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: t.pointClouds }),
      loader?.getPointCloud() ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 py-1", children: [
        /* @__PURE__ */ jsx(CloudCog, { size: 12, className: "text-[hsl(var(--brand))] shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "flex-1 truncate font-mono text-foreground", children: "pointcloud" })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-[10px]", children: t.noCloudLoaded })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.measurements }),
        measurementList.length > 0 && /* @__PURE__ */ jsx("button", { onClick: clearAll, title: t.clearAll, className: "text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsx(Trash2, { size: 11 }) })
      ] }),
      measurementList.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: t.none }) : measurementList.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 py-0.5 group", children: [
        /* @__PURE__ */ jsx(Ruler, { size: 11, className: "text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "flex-1 truncate font-mono text-foreground capitalize", children: m.type }),
        m.value !== void 0 && /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-[hsl(var(--brand))]", children: m.value.toFixed(2) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => deleteMeasurement(m.id),
            className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all",
            children: /* @__PURE__ */ jsx(Trash2, { size: 10 })
          }
        )
      ] }, m.id))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.sections }),
        clipBoxEntries.length > 0 && /* @__PURE__ */ jsx("button", { onClick: () => clipManager?.clear(), title: t.clearAll, className: "text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsx(Trash2, { size: 11 }) })
      ] }),
      clipBoxEntries.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: t.sectionHint }) : clipBoxEntries.map((box) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex items-center gap-1 py-0.5 group rounded px-0.5 ${selectedClipBoxId === box.id ? "bg-[hsl(var(--brand)/0.1)]" : ""}`,
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => clipManager?.setBoxVisible(box.id, !box.visible),
                className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
                title: box.visible ? "Hide" : "Show",
                children: box.visible ? /* @__PURE__ */ jsx(Eye, { size: 11 }) : /* @__PURE__ */ jsx(EyeOff, { size: 11 })
              }
            ),
            /* @__PURE__ */ jsx(BoxSelect, { size: 11, className: "text-[hsl(var(--brand))] shrink-0" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => clipManager?.selectBox(selectedClipBoxId === box.id ? null : box.id),
                className: "flex-1 truncate font-mono text-foreground text-left hover:text-[hsl(var(--brand))] transition-colors",
                children: box.name
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => clipManager?.setModeAll(box.mode === "outside" ? "inside" : "outside"),
                title: box.mode === "outside" ? "Keep inside (all)" : "Keep outside (all)",
                className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
                children: /* @__PURE__ */ jsx(Scissors, { size: 10 })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[8px] text-muted-foreground font-mono w-6 text-center", children: box.mode === "outside" ? "OUT" : "IN" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => clipManager?.removeBox(box.id),
                className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0",
                children: /* @__PURE__ */ jsx(Trash2, { size: 10 })
              }
            )
          ]
        },
        box.id
      )),
      clipBoxEntries.length > 1 && /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground mt-1 italic", children: t.clipModeNote })
    ] })
  ] });
}

// src/components/sidebar/measurements-panel.tsx
init_viewer_provider();
init_locale_context();
init_utils();
function InlineEdit({
  value,
  onSave,
  activateOn = "click",
  displayClassName,
  inputClassName,
  title
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);
  const begin = () => {
    setDraft(value);
    setEditing(true);
  };
  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };
  if (!editing) {
    return /* @__PURE__ */ jsx(
      "p",
      {
        className: displayClassName,
        onClick: activateOn === "click" ? begin : void 0,
        onDoubleClick: activateOn === "dblclick" ? begin : void 0,
        title,
        children: value
      }
    );
  }
  return /* @__PURE__ */ jsx(
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
      className: inputClassName
    }
  );
}
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
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center px-4 gap-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t.noMeasurements }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: t.useMeasureToolHint })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-2 py-1.5 border-b border-[hsl(var(--border))] shrink-0", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: t.measurementCount(measurementList.length) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("button", { onClick: downloadCSV, title: t.downloadCsv, className: "text-muted-foreground hover:text-[hsl(var(--brand))] text-[10px] flex items-center gap-1 transition-colors", children: [
          /* @__PURE__ */ jsx(Download, { size: 10 }),
          " ",
          t.csv
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: clearAll, title: t.clearAll, className: "text-muted-foreground hover:text-destructive text-[10px] flex items-center gap-1 transition-colors", children: [
          /* @__PURE__ */ jsx(Trash2, { size: 10 }),
          " ",
          t.clearAll
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: measurementList.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-2 py-2 border-b border-[hsl(var(--border)/0.4)] hover:bg-muted group transition-colors", children: [
      /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: m.color ?? "hsl(var(--brand))" } }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(
          InlineEdit,
          {
            value: m.label,
            onSave: (name) => handleRename(m.id, name),
            activateOn: "click",
            title: "Click to rename",
            displayClassName: "text-[10px] font-semibold text-foreground cursor-pointer hover:text-[hsl(var(--brand))] transition-colors truncate",
            inputClassName: "text-[10px] font-semibold text-foreground bg-muted/60 border border-[hsl(var(--border))] rounded px-1 py-0 w-full outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-[hsl(var(--brand))]", children: formatValue(m) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => del(m.id),
          className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all",
          children: /* @__PURE__ */ jsx(Trash2, { size: 11 })
        }
      )
    ] }, m.id)) })
  ] });
}

// src/components/sidebar/scenes-panel.tsx
init_utils();
init_viewer_provider();
init_locale_context();
init_dist();
function ScenesPanel() {
  const {
    sceneManager,
    cameraAnimator,
    clipManager,
    loader,
    exporter,
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
  const [scenes, setScenes] = useState([]);
  const [newName, setNewName] = useState("");
  const pmRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showAnim, setShowAnim] = useState(false);
  const [flySec, setFlySec] = useState(2);
  const [staySec, setStaySec] = useState(1);
  const [easing, setEasing] = useState("smooth");
  const [recBg, setRecBg] = useState("current");
  const [loop, setLoop] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recPct, setRecPct] = useState(0);
  const stopRef = useRef(false);
  const dwellTimer = useRef(null);
  useEffect(() => {
    const key = config.source.type === "s3" ? config.source.baseUrl : config.source.type === "electron" ? config.source.basePath : "local";
    const pm = new PresentationManager(key);
    pm.onChange = (s) => setScenes(s);
    pmRef.current = pm;
    setScenes(pm.getScenes());
  }, [config.source]);
  useEffect(() => () => {
    stopRef.current = true;
    if (dwellTimer.current != null) clearTimeout(dwellTimer.current);
    cameraAnimator?.cancel();
  }, [cameraAnimator]);
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
      pointBudget,
      sceneManager.camera.up
    );
    pmRef.current.addScene(scene);
    setNewName("");
  };
  const flyToScene = (scene, durationMs, ease) => {
    if (!sceneManager) return Promise.resolve();
    const pos = new THREE5.Vector3(...scene.camera.position);
    const target = new THREE5.Vector3(...scene.camera.target);
    const up = scene.camera.up ? new THREE5.Vector3(...scene.camera.up) : new THREE5.Vector3(0, 0, 1);
    if (cameraAnimator) {
      return cameraAnimator.flyTo({ position: pos, target, up, duration: durationMs, easing: ease });
    }
    sceneManager.camera.position.copy(pos);
    sceneManager.controls.target.copy(target);
    sceneManager.camera.up.copy(up);
    sceneManager.controls.update();
    return Promise.resolve();
  };
  const handleRestore = async (scene) => {
    if (!sceneManager) return;
    await flyToScene(scene, 600, "smooth");
    if (clipManager) {
      clipManager.clear();
      for (const cb of scene.clipBoxes) {
        const box = new THREE5.Box3(
          new THREE5.Vector3(...cb.min),
          new THREE5.Vector3(...cb.max)
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
  const sleep = (ms) => new Promise((res) => {
    dwellTimer.current = window.setTimeout(() => {
      dwellTimer.current = null;
      res();
    }, ms);
  });
  const runOnce = async () => {
    for (const s of scenes) {
      if (stopRef.current) return;
      await flyToScene(s, flySec * 1e3, easing);
      if (stopRef.current) return;
      if (staySec > 0) await sleep(staySec * 1e3);
    }
  };
  const play = async () => {
    if (scenes.length < 2 || playing) return;
    stopRef.current = false;
    setPlaying(true);
    try {
      do {
        await runOnce();
      } while (loop && !stopRef.current);
    } finally {
      setPlaying(false);
    }
  };
  const stop = () => {
    stopRef.current = true;
    if (dwellTimer.current != null) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
    cameraAnimator?.cancel();
    setPlaying(false);
  };
  const EASE = {
    smooth: (t2) => 1 - Math.pow(1 - t2, 4),
    linear: (t2) => t2,
    easeInOut: (t2) => t2 < 0.5 ? 2 * t2 * t2 : 1 - Math.pow(-2 * t2 + 2, 2) / 2
  };
  const buildSampler = () => {
    const order = scenes;
    const fly = Math.max(flySec, 0.05);
    const stay = staySec;
    const ease = EASE[easing];
    const poseOf = (s) => ({
      pos: new THREE5.Vector3(...s.camera.position),
      tgt: new THREE5.Vector3(...s.camera.target),
      up: s.camera.up ? new THREE5.Vector3(...s.camera.up) : new THREE5.Vector3(0, 0, 1)
    });
    const apply = (pos, tgt, up) => {
      if (!sceneManager) return;
      sceneManager.camera.position.copy(pos);
      sceneManager.camera.up.copy(up).normalize();
      sceneManager.camera.lookAt(tgt);
      sceneManager.camera.updateMatrixWorld();
      sceneManager.controls.target.copy(tgt);
    };
    const total = stay + (fly + stay) * (order.length - 1);
    const sample = (t2) => {
      if (order.length === 0) return;
      if (t2 <= stay) {
        const p2 = poseOf(order[0]);
        apply(p2.pos, p2.tgt, p2.up);
        return;
      }
      let acc = stay;
      for (let i = 1; i < order.length; i++) {
        if (t2 <= acc + fly) {
          const f = ease(Math.min(1, (t2 - acc) / fly));
          const a = poseOf(order[i - 1]);
          const b = poseOf(order[i]);
          apply(
            a.pos.clone().lerp(b.pos, f),
            a.tgt.clone().lerp(b.tgt, f),
            a.up.clone().lerp(b.up, f).normalize()
          );
          return;
        }
        acc += fly;
        if (t2 <= acc + stay) {
          const p2 = poseOf(order[i]);
          apply(p2.pos, p2.tgt, p2.up);
          return;
        }
        acc += stay;
      }
      const p = poseOf(order[order.length - 1]);
      apply(p.pos, p.tgt, p.up);
    };
    return { sample, total };
  };
  const record = async () => {
    if (!exporter || scenes.length < 2 || recording || playing) return;
    const { sample, total } = buildSampler();
    setRecording(true);
    setRecPct(0);
    try {
      const blob = await exporter.recordAnimation({
        sampleCamera: sample,
        durationSec: total,
        fps: 30,
        width: 1920,
        height: 1080,
        background: recBg,
        onProgress: (p) => setRecPct(Math.round(p * 100))
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scene_animation_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Recording failed.");
    } finally {
      setRecording(false);
      setRecPct(0);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full overflow-y-auto text-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: t.saveScene }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSave,
            title: t.save,
            className: "px-2 py-0.5 rounded bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)] transition-colors",
            children: /* @__PURE__ */ jsx(Plus, { size: 13 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-2 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.savedScenes }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx("button", { onClick: handleExport, title: t.exportJson, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(Download, { size: 11 }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => fileInputRef.current?.click(), title: t.importJson, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(Upload, { size: 11 }) }),
          /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: ".json", onChange: handleImport, className: "hidden" })
        ] })
      ] }),
      scenes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: t.noScenes }) : scenes.map((scene) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 py-1 group border-b border-[hsl(var(--border)/0.3)] last:border-0", children: [
        /* @__PURE__ */ jsx(Bookmark, { size: 11, className: "text-[hsl(var(--brand))] shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx(
            InlineEdit,
            {
              value: scene.name,
              onSave: (name) => pmRef.current?.renameScene(scene.id, name),
              activateOn: "dblclick",
              title: "Double-click to rename",
              displayClassName: "font-mono text-foreground truncate text-[11px] cursor-pointer hover:text-[hsl(var(--brand))] transition-colors",
              inputClassName: "font-mono text-foreground text-[11px] bg-muted/60 border border-[hsl(var(--border))] rounded px-1 py-0 w-full outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: "text-[8px] text-muted-foreground font-mono", children: [
            new Date(scene.createdAt).toLocaleDateString(),
            scene.clipBoxes.length > 0 && ` \xB7 ${scene.clipBoxes.length} clip`
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleRestore(scene),
            title: t.restore,
            className: "text-[hsl(var(--brand))] hover:text-foreground transition-colors shrink-0",
            children: /* @__PURE__ */ jsx(Play, { size: 12 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => pmRef.current?.removeScene(scene.id),
            className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0",
            children: /* @__PURE__ */ jsx(Trash2, { size: 10 })
          }
        )
      ] }, scene.id))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-t border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowAnim((o) => !o),
          className: "flex items-center justify-between w-full text-[10px] font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsx("span", { children: "Animation" }),
            /* @__PURE__ */ jsx(ChevronRight, { size: 12, className: cn("transition-transform", showAnim && "rotate-90") })
          ]
        }
      ),
      showAnim && /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-2", children: [
        /* @__PURE__ */ jsxs(AnimRow, { label: "Fly time", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: 0.3,
              max: 8,
              step: 0.1,
              value: flySec,
              onChange: (e) => setFlySec(Number(e.target.value)),
              className: "flex-1 accent-[hsl(var(--brand))] h-1"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "w-9 text-right font-mono text-[10px]", children: [
            flySec.toFixed(1),
            "s"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(AnimRow, { label: "Stay", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: 0,
              max: 8,
              step: 0.1,
              value: staySec,
              onChange: (e) => setStaySec(Number(e.target.value)),
              className: "flex-1 accent-[hsl(var(--brand))] h-1"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "w-9 text-right font-mono text-[10px]", children: [
            staySec.toFixed(1),
            "s"
          ] })
        ] }),
        /* @__PURE__ */ jsx(AnimRow, { label: "Type", children: /* @__PURE__ */ jsxs(
          "select",
          {
            value: easing,
            onChange: (e) => setEasing(e.target.value),
            className: "flex-1 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] text-foreground",
            children: [
              /* @__PURE__ */ jsx("option", { value: "smooth", children: "Smooth" }),
              /* @__PURE__ */ jsx("option", { value: "linear", children: "Linear" }),
              /* @__PURE__ */ jsx("option", { value: "easeInOut", children: "Ease in-out" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(AnimRow, { label: "Video bg", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1 flex-1", children: ["current", "white", "black", "transparent"].map((b) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setRecBg(b),
            title: b,
            className: cn(
              "flex-1 py-0.5 rounded text-[9px] border transition-colors capitalize",
              recBg === b ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"
            ),
            children: b === "transparent" ? "clear" : b
          },
          b
        )) }) }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: loop,
              onChange: (e) => setLoop(e.target.checked),
              className: "accent-[hsl(var(--brand))] w-3 h-3"
            }
          ),
          "Loop"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1 pt-0.5", children: [
          !playing ? /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: play,
              disabled: scenes.length < 2 || recording,
              className: "flex-1 flex items-center justify-center gap-1 py-1 rounded bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)] disabled:opacity-40 transition-colors text-[10px]",
              children: [
                /* @__PURE__ */ jsx(Play, { size: 12 }),
                " Play"
              ]
            }
          ) : /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: stop,
              className: "flex-1 flex items-center justify-center gap-1 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors text-[10px]",
              children: [
                /* @__PURE__ */ jsx(Square, { size: 11 }),
                " Stop"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: record,
              disabled: playing || recording || scenes.length < 2,
              title: "Render a 1080p MP4 of one pass (frame by frame)",
              className: "flex items-center justify-center gap-1 px-2 py-1 rounded border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-40 transition-colors text-[10px]",
              children: [
                /* @__PURE__ */ jsx(Film, { size: 12 }),
                " ",
                recording ? `${recPct}%` : "Video"
              ]
            }
          )
        ] }),
        recording && /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-[hsl(var(--brand))]", children: [
          "Rendering 1080p MP4 frame by frame\u2026 ",
          recPct,
          "%"
        ] }),
        scenes.length < 2 && !recording && /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground/70", children: "Save at least two scenes to animate." })
      ] })
    ] })
  ] });
}
function AnimRow({ label, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "w-14 text-[10px] text-muted-foreground shrink-0", children: label }),
    children
  ] });
}
function Sidebar() {
  const [tab, setTab] = useState("layers");
  const t = useLocale().sidebar;
  const { uiMode, activeTool } = useViewer();
  const { cameras } = useData();
  useEffect(() => {
    if (activeTool.startsWith("measure-")) setTab("measurements");
  }, [activeTool]);
  const isPro = uiMode === "professional";
  const hasPanoramas = cameras.length > 0;
  const ALL_TABS = [
    { id: "layers", icon: /* @__PURE__ */ jsx(Layers, { size: 14 }), label: t.tabLayers },
    { id: "panoramas", icon: /* @__PURE__ */ jsx(Camera, { size: 14 }), label: t.tabPanoramas, panoOnly: true },
    { id: "scene", icon: /* @__PURE__ */ jsx(Box, { size: 14 }), label: t.tabScene },
    { id: "measurements", icon: /* @__PURE__ */ jsx(Ruler, { size: 14 }), label: t.tabMeasurements },
    { id: "scenes", icon: /* @__PURE__ */ jsx(Bookmark, { size: 14 }), label: t.tabScenes, proOnly: true }
  ];
  const TABS = ALL_TABS.filter(
    (entry) => (isPro || !entry.proOnly) && (!entry.panoOnly || hasPanoramas)
  );
  const activeTab = TABS.some((tb) => tb.id === tab) ? tab : "layers";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsx("div", { className: "flex border-b border-border shrink-0", children: TABS.map((tb) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setTab(tb.id),
        title: tb.label,
        className: `flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-mono transition-colors
              ${activeTab === tb.id ? "text-[hsl(var(--brand))] border-b-2 border-[hsl(var(--brand))] -mb-px" : "text-muted-foreground hover:text-foreground"}`,
        children: [
          tb.icon,
          /* @__PURE__ */ jsx("span", { className: "hidden xl:block", children: tb.label })
        ]
      },
      tb.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-hidden", children: [
      activeTab === "layers" && /* @__PURE__ */ jsx(LayersPanel, {}),
      activeTab === "panoramas" && /* @__PURE__ */ jsx(PanoPanel, {}),
      activeTab === "scene" && /* @__PURE__ */ jsx(ScenePanel, {}),
      activeTab === "measurements" && /* @__PURE__ */ jsx(MeasurementsPanel, {}),
      activeTab === "scenes" && /* @__PURE__ */ jsx(ScenesPanel, {})
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
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-40 bg-black flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Navigation, { size: 14, className: "text-[hsl(var(--brand))]" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-white", children: selectedCamera.name }),
        selectedCamera.position && /* @__PURE__ */ jsxs("span", { className: "text-xs text-white/50 font-mono hidden sm:block", children: [
          selectedCamera.position.x.toFixed(2),
          ", ",
          selectedCamera.position.y.toFixed(2),
          ", ",
          selectedCamera.position.z.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center rounded-md border border-white/15 overflow-hidden text-[11px] font-mono", children: ["pannellum", "photo-sphere-viewer"].map((eng) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPanoEngine(eng),
            className: panoEngine === eng ? "px-2 py-0.5 bg-[hsl(var(--brand))] text-black" : "px-2 py-0.5 text-white/60 hover:text-white hover:bg-white/10",
            title: eng === "pannellum" ? "Pannellum" : "Photo Sphere Viewer",
            children: eng === "pannellum" ? "Pannellum" : "PSV"
          },
          eng
        )) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSelectedCamera(null),
            className: "text-white/70 hover:text-white transition-colors p-1",
            title: tPano.close,
            children: /* @__PURE__ */ jsx(X, { size: 18 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: containerRef, className: "flex-1" }, panoEngine)
  ] });
}

// src/components/overlays/rendering-settings.tsx
init_viewer_provider();

// src/hooks/use-display-actions.ts
init_viewer_provider();
function useDisplayActions() {
  const { loader, colorMode, setColorMode, pointBudget, setPointBudget, pointSize, setPointSize } = useViewer();
  const setQualityPreset = useCallback((preset) => {
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

// src/components/overlays/rendering-settings.tsx
init_locale_context();
function useDraggable(options) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef(options?.bounds);
  boundsRef.current = options?.bounds;
  const moveRef = useRef(null);
  const upRef = useRef(null);
  const endDrag = useCallback(() => {
    if (moveRef.current) window.removeEventListener("mousemove", moveRef.current);
    if (upRef.current) window.removeEventListener("mouseup", upRef.current);
    moveRef.current = null;
    upRef.current = null;
  }, []);
  useEffect(() => endDrag, [endDrag]);
  const reset = useCallback(() => {
    positionRef.current = { x: 0, y: 0 };
    setPosition({ x: 0, y: 0 });
  }, []);
  const onDragStart = useCallback(
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
var COLOR_MODES2 = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "classification", label: "Classification" }
];
var QUALITY = [
  { value: "performance", label: "Performance" },
  { value: "balanced", label: "Balanced" },
  { value: "high", label: "High" }
];
function RenderingSettings({ open, onClose }) {
  const { loader, colorMode, setColorMode, pointSize, setPointSize, pointBudget, setPointBudget } = useViewer();
  const { setQualityPreset } = useDisplayActions();
  const { resolvedTheme, toggleTheme } = useTheme();
  const t = useLocale().renderingSettings;
  const pcvRoot = usePcvRoot();
  const { position, onDragStart, reset } = useDraggable({ bounds: pcvRoot ?? void 0 });
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);
  const [rgbGamma, setRgbGamma] = useState(1);
  const [rgbBrightness, setRgbBrightness] = useState(0);
  const [rgbContrast, setRgbContrast] = useState(0);
  const [intensityGamma, setIntensityGamma] = useState(1);
  const [intensityBrightness, setIntensityBrightness] = useState(0);
  const [intensityContrast, setIntensityContrast] = useState(0);
  const [intensityRange, setIntensityRange] = useState([0, 65535]);
  const [heightMin, setHeightMin] = useState(0);
  const [heightMax, setHeightMax] = useState(100);
  const [opacity, setOpacity] = useState(1);
  const mat = () => loader?.getPointCloud() ? loader.getPointCloud().material : null;
  useEffect(() => {
    if (!open) return;
    const m = mat();
    if (!m) return;
    const u = m.uniforms ?? {};
    setRgbGamma(u.rgbGamma?.value ?? 1);
    setRgbBrightness(u.rgbBrightness?.value ?? 0);
    setRgbContrast(u.rgbContrast?.value ?? 0);
    setIntensityGamma(u.intensityGamma?.value ?? 1);
    setIntensityBrightness(u.intensityBrightness?.value ?? 0);
    setIntensityContrast(u.intensityContrast?.value ?? 0);
    setOpacity(m.opacity ?? 1);
    const ir = u.intensityRange?.value;
    if (ir) setIntensityRange([ir[0] ?? 0, ir[1] ?? 65535]);
    const er = u.elevationRange?.value;
    const wb2 = loader?.worldBox;
    if (er) setHeightMin(er[0]), setHeightMax(er[1]);
    else if (wb2 && !wb2.isEmpty()) setHeightMin(wb2.min.z), setHeightMax(wb2.max.z);
  }, [open, loader]);
  const setUniform = (setter, name, value) => {
    setter(value);
    const m = mat();
    if (!m) return;
    const group = name.startsWith("rgb") ? ["rgbGamma", "rgbBrightness", "rgbContrast"] : ["intensityGamma", "intensityBrightness", "intensityContrast"];
    const def = (n) => n.endsWith("Gamma") ? 1 : 0;
    const isActive = () => group.some((n) => (m[n] ?? def(n)) !== def(n));
    const wasActive = isActive();
    m[name] = value;
    if (m.uniforms?.[name]) m.uniforms[name].value = value;
    if (wasActive !== isActive()) m.needsUpdate = true;
  };
  const setElevation = (min, max) => {
    setHeightMin(min);
    setHeightMax(max);
    const m = mat();
    if (m) m.elevationRange = [min, max];
  };
  const setIntensity = (min, max) => {
    setIntensityRange([min, max]);
    const m = mat();
    if (m?.uniforms?.intensityRange) m.uniforms.intensityRange.value = [min, max];
  };
  const setOpacityVal = (v) => {
    setOpacity(v);
    const m = mat();
    if (m) {
      m.opacity = v;
      m.transparent = v < 1;
      m.needsUpdate = true;
    }
  };
  if (!open) return null;
  const wb = loader?.worldBox;
  const zMin = wb && !wb.isEmpty() ? wb.min.z : -100;
  const zMax = wb && !wb.isEmpty() ? wb.max.z : 100;
  const zRange = Math.max(1, zMax - zMin);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "absolute top-[calc(0.75rem+env(safe-area-inset-top))] left-[calc(0.75rem+env(safe-area-inset-left))] z-50 w-[calc(100vw-1.5rem)] max-w-xs md:w-72 max-h-[calc(100dvh-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-xl",
      style: { transform: `translate(${position.x}px, ${position.y}px)` },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))] cursor-move select-none",
            onMouseDown: onDragStart,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(SlidersHorizontal, { size: 14, className: "text-[hsl(var(--brand))]" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: "Settings" })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  onMouseDown: (e) => e.stopPropagation(),
                  className: "text-muted-foreground hover:text-foreground transition-colors p-0.5",
                  children: /* @__PURE__ */ jsx(X, { size: 14 })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-4 text-xs", children: [
          /* @__PURE__ */ jsxs(Section, { title: "Display", children: [
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: COLOR_MODES2.map((cm) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setColorMode(cm.value);
                  loader?.setColorMode(cm.value);
                },
                className: colorMode === cm.value ? "text-[10px] py-1 px-2 rounded bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-[10px] py-1 px-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60",
                children: cm.label
              },
              cm.value
            )) }),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: "Point size",
                value: pointSize,
                min: 0.2,
                max: 5,
                step: 0.1,
                onChange: (v) => {
                  setPointSize(v);
                  loader?.setPointSize(v);
                }
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: "Budget",
                value: pointBudget,
                min: 2e5,
                max: 1e7,
                step: 1e5,
                onChange: (v) => {
                  setPointBudget(v);
                  loader?.setPointBudget(v);
                },
                display: (v) => (v / 1e6).toFixed(1) + "M"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 pt-0.5", children: QUALITY.map((q) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setQualityPreset(q.value),
                className: "flex-1 text-[10px] py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60",
                children: q.label
              },
              q.value
            )) })
          ] }),
          /* @__PURE__ */ jsxs(Section, { title: t.rgbSection, children: [
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.gamma,
                value: rgbGamma,
                min: 0.1,
                max: 4,
                step: 0.05,
                onChange: (v) => setUniform(setRgbGamma, "rgbGamma", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.brightness,
                value: rgbBrightness,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => setUniform(setRgbBrightness, "rgbBrightness", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.contrast,
                value: rgbContrast,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => setUniform(setRgbContrast, "rgbContrast", v)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Section, { title: t.intensitySection, children: [
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.gamma,
                value: intensityGamma,
                min: 0.1,
                max: 4,
                step: 0.05,
                onChange: (v) => setUniform(setIntensityGamma, "intensityGamma", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.brightness,
                value: intensityBrightness,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => setUniform(setIntensityBrightness, "intensityBrightness", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.contrast,
                value: intensityContrast,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => setUniform(setIntensityContrast, "intensityContrast", v)
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-16 text-muted-foreground", children: t.range }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: intensityRange[0],
                  min: 0,
                  max: 65535,
                  onChange: (e) => setIntensity(Number(e.target.value), intensityRange[1]),
                  className: "w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "\u2013" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: intensityRange[1],
                  min: 0,
                  max: 65535,
                  onChange: (e) => setIntensity(intensityRange[0], Number(e.target.value)),
                  className: "w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Section, { title: t.elevationSection, children: [
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.elevMin,
                value: heightMin,
                min: zMin - zRange * 0.1,
                max: zMax + zRange * 0.1,
                step: zRange / 200,
                onChange: (v) => setElevation(v, heightMax),
                display: (v) => v.toFixed(1) + "m"
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.elevMax,
                value: heightMax,
                min: zMin - zRange * 0.1,
                max: zMax + zRange * 0.1,
                step: zRange / 200,
                onChange: (v) => setElevation(heightMin, v),
                display: (v) => v.toFixed(1) + "m"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Section, { title: t.generalSection, children: /* @__PURE__ */ jsx(
            Slider,
            {
              label: t.opacity,
              value: opacity,
              min: 0,
              max: 1,
              step: 0.02,
              onChange: setOpacityVal
            }
          ) }),
          /* @__PURE__ */ jsx(Section, { title: "Theme", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: toggleTheme,
              className: "w-full flex items-center gap-2 px-2 py-1.5 rounded bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors",
              children: [
                resolvedTheme === "dark" ? /* @__PURE__ */ jsx(Sun, { size: 13 }) : /* @__PURE__ */ jsx(Moon, { size: 13 }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: resolvedTheme === "dark" ? "Switch to light" : "Switch to dark" })
              ]
            }
          ) })
        ] })
      ]
    }
  );
}
function Section({ title, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: title }),
    /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children })
  ] });
}
function Slider({ label, value, min, max, step, onChange, display }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "w-16 text-muted-foreground shrink-0", children: label }),
    /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx("span", { className: "w-12 text-right font-mono text-[10px] tabular-nums", children: display ? display(value) : value.toFixed(2) })
  ] });
}
var Viewport2 = lazy(() => Promise.resolve().then(() => (init_viewport(), viewport_exports)).then((m) => ({ default: m.Viewport })));
function ViewportFallback() {
  const t = useLocale().viewport;
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-[hsl(var(--background))]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-mono", children: t.initialisingRenderer })
  ] }) });
}
function GlassCard({ children, className }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "backdrop-blur-xl bg-[hsl(var(--card)/0.72)]",
        "border border-border",
        "rounded-2xl shadow-2xl shadow-black/20",
        className
      ),
      children
    }
  );
}
function WorkspaceLayout({ className }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768
  );
  const [renderSettingsOpen, setRenderSettingsOpen] = useState(false);
  const { fps, pointBudget, activeTool, selectedCamera, uiMode, clipBoxEntries } = useViewer();
  const { metadata } = useData();
  const t = useLocale().viewport;
  const isPro = uiMode === "professional";
  useEffect(() => {
    if (activeTool.startsWith("measure-") && !isMobile) setSidebarOpen(true);
  }, [activeTool, isMobile]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative h-full w-full bg-[hsl(var(--background))] text-foreground overflow-hidden",
        // Publish the minimap's right offset so it sits just left of the sidebar
        // when open and snaps back to the edge when closed (the minimap, inside
        // the viewport, consumes `--pcv-minimap-right`).
        // On mobile the sidebar is a full-bleed overlay, so the minimap stays at
        // the edge; only shift it on md+ where the sidebar sits beside the view.
        sidebarOpen ? "[--pcv-minimap-right:0.75rem] md:[--pcv-minimap-right:19.25rem] xl:[--pcv-minimap-right:21.25rem]" : "[--pcv-minimap-right:0.75rem]",
        className
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewportFallback, {}), children: /* @__PURE__ */ jsx(Viewport2, {}) }) }),
        selectedCamera && /* @__PURE__ */ jsx(PanoViewer, {}),
        /* @__PURE__ */ jsx(RenderingSettings, { open: renderSettingsOpen, onClose: () => setRenderSettingsOpen(false) }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-[calc(0.75rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[calc(100vw-1.5rem)]", style: pcvChromeScaleStyle, children: /* @__PURE__ */ jsx(GlassCard, { className: "pointer-events-auto max-w-full overflow-hidden", children: /* @__PURE__ */ jsx(
          MainToolbar,
          {
            onToggleRenderSettings: isPro ? () => setRenderSettingsOpen((o) => !o) : void 0,
            renderSettingsOpen
          }
        ) }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute left-[calc(0.75rem+env(safe-area-inset-left))] top-[calc(3.5rem+env(safe-area-inset-top))] bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 pointer-events-none flex items-center", style: pcvChromeScaleStyle, children: /* @__PURE__ */ jsx(GlassCard, { className: "pointer-events-auto overflow-y-auto max-h-full", children: /* @__PURE__ */ jsx(ToolRail, {}) }) }),
        isMobile && sidebarOpen && /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 z-20 bg-black/50 md:hidden",
            onClick: () => setSidebarOpen(false)
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "absolute z-30 transition-transform duration-200",
              // Mobile: full-bleed overlay inset from the notch / home indicator so
              // its scroll area isn't hidden by the OS status bar or browser nav bar.
              "top-[calc(3.5rem+env(safe-area-inset-top))] md:top-16",
              "bottom-[env(safe-area-inset-bottom)] md:bottom-10",
              "right-[env(safe-area-inset-right)] md:right-3",
              "w-full max-w-sm md:w-72 xl:w-80",
              sidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+0.75rem)]"
            ),
            style: pcvChromeScaleStyle,
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSidebarOpen((o) => !o),
                  title: sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
                  "aria-label": sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
                  className: cn(
                    "absolute top-1/2 -translate-y-1/2 -left-7 z-40",
                    "flex items-center justify-center w-7 h-16 rounded-l-lg",
                    "backdrop-blur-xl bg-[hsl(var(--card)/0.85)]",
                    "border border-r-0 border-border",
                    "shadow-2xl shadow-black/30",
                    "text-foreground hover:text-[hsl(var(--brand))] hover:bg-[hsl(var(--card))] transition-colors"
                  ),
                  children: sidebarOpen ? /* @__PURE__ */ jsx(ChevronRight, { size: 18 }) : /* @__PURE__ */ jsx(ChevronLeft, { size: 18 })
                }
              ),
              /* @__PURE__ */ jsx(GlassCard, { className: "h-full overflow-hidden", children: /* @__PURE__ */ jsx(Sidebar, {}) })
            ]
          }
        ),
        isPro && clipBoxEntries.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute bottom-[calc(3rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-30 pointer-events-none", style: pcvChromeScaleStyle, children: /* @__PURE__ */ jsx(GlassCard, { className: "pointer-events-auto", children: /* @__PURE__ */ jsx(ClipToolbar, {}) }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden md:block", style: pcvChromeScaleStyle, children: /* @__PURE__ */ jsx(GlassCard, { className: "pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-muted-foreground select-none", children: [
          metadata && /* @__PURE__ */ jsx("span", { children: t.statusPts(metadata.points / 1e6) }),
          /* @__PURE__ */ jsx("span", { children: t.statusBudget(pointBudget / 1e6) }),
          /* @__PURE__ */ jsx("span", { children: t.statusFps(fps) }),
          activeTool !== "none" && /* @__PURE__ */ jsx("span", { className: "text-[hsl(var(--brand))]", children: activeTool })
        ] }) }) })
      ]
    }
  );
}

// src/ui/button.tsx
init_utils();
var buttonVariants = cva(
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
var Button = React27.forwardRef(
  ({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsx(
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
var Slider2 = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(
  SliderPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex w-full touch-none select-none items-center",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx(SliderPrimitive.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-[hsl(var(--muted))]", children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: "absolute h-full bg-[hsl(var(--primary))]" }) }),
      /* @__PURE__ */ jsx(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--background))] shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider2.displayName = "Slider";

// src/ui/dialog.tsx
init_utils();
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogPortal = DialogPrimitive.Portal;
var DialogOverlay = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn("fixed inset-0 z-50 bg-black/50", className),
    ...props
  }
));
DialogOverlay.displayName = "DialogOverlay";
var DialogContent = React27.forwardRef(({ className, children, container, dragOffset, style, ...props }, ref) => {
  const dx = dragOffset?.x ?? 0;
  const dy = dragOffset?.y ?? 0;
  return /* @__PURE__ */ jsxs(DialogPortal, { container: container ?? void 0, children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsx(
      DialogPrimitive.Content,
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
}) => /* @__PURE__ */ jsx(
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
var DialogTitle = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-sm font-semibold", className),
    ...props
  }
));
DialogTitle.displayName = "DialogTitle";
var DialogClose = React27.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Close,
  {
    ref,
    className: cn(
      "rounded p-1 text-muted-foreground hover:bg-[hsl(var(--muted)/.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      className
    ),
    ...props,
    children: children ?? /* @__PURE__ */ jsx(X, { size: 14 })
  }
));
DialogClose.displayName = "DialogClose";

// src/ui/tabs.tsx
init_utils();
var Tabs = TabsPrimitive.Root;
var TabsList = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
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
var TabsTrigger = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
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
var TabsContent = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
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
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverAnchor = PopoverPrimitive.Anchor;
var PopoverContent = React27.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
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
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React27.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
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
var toggleVariants = cva(
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
var Toggle = React27.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsx(
  TogglePrimitive.Root,
  {
    ref,
    className: cn(toggleVariants({ variant, size }), className),
    ...props
  }
));
Toggle.displayName = "Toggle";

// src/ui/select.tsx
init_utils();
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React27.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
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
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50 shrink-0" }) })
    ]
  }
));
SelectTrigger.displayName = "SelectTrigger";
var SelectScrollUpButton = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";
var SelectScrollDownButton = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";
var SelectContent = React27.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
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
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = "SelectContent";
var SelectLabel = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
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
var SelectItem = React27.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
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
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = "SelectItem";
var SelectSeparator = React27.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
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
var ComponentsContext = createContext(defaultComponents);
function ComponentsProvider({
  components,
  children
}) {
  const merged = useMemo(
    () => components ? { ...defaultComponents, ...components } : defaultComponents,
    [components]
  );
  return /* @__PURE__ */ jsx(ComponentsContext.Provider, { value: merged, children });
}
function useComponents() {
  return useContext(ComponentsContext);
}

// src/components/pano-cloud-viewer.tsx
init_dist();
init_utils();
init_utils();
var Viewport4 = lazy(() => Promise.resolve().then(() => (init_viewport(), viewport_exports)).then((m) => ({ default: m.Viewport })));
var PcvRootContext = createContext(null);
function usePcvRoot() {
  return useContext(PcvRootContext);
}
var UiScaleContext = createContext(1);
function ViewportFallback2() {
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-[hsl(var(--background))]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-mono", children: "Initialising renderer\u2026" })
  ] }) });
}
function PanoOverlayBridge() {
  const { selectedCamera } = useViewer();
  if (!selectedCamera) return null;
  return /* @__PURE__ */ jsx(PanoViewer, {});
}
function PcvRoot({ className, uiScale = 1, children }) {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef(null);
  const rootStyle = { "--pcv-scale": uiScale };
  return /* @__PURE__ */ jsx(PcvRootContext.Provider, { value: rootRef, children: /* @__PURE__ */ jsx(UiScaleContext.Provider, { value: uiScale, children: /* @__PURE__ */ jsx(
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
  const adapter = useMemo(() => createAdapter(source), [source]);
  const config = useMemo(() => ({ source, uiMode, panoEngine }), [source, uiMode, panoEngine]);
  return /* @__PURE__ */ jsx(LocaleProvider, { locale, children: /* @__PURE__ */ jsx(ThemeProvider, { defaultTheme: theme, children: /* @__PURE__ */ jsx(DataProvider, { adapter, children: /* @__PURE__ */ jsx(ViewerProvider, { config, children: /* @__PURE__ */ jsx(ComponentsProvider, { components, children: /* @__PURE__ */ jsx(PcvRoot, { className, uiScale, children: children ? /* @__PURE__ */ jsxs(Fragment, { children: [
    children(
      /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewportFallback2, {}), children: /* @__PURE__ */ jsx(Viewport4, {}) })
    ),
    /* @__PURE__ */ jsx(PanoOverlayBridge, {})
  ] }) : /* @__PURE__ */ jsx(WorkspaceLayout, {}) }) }) }) }) }) });
}

// src/version.ts
var PCV_VERSION = "0.2.0" ;
var PCV_BUILD = "e994397 \xB7 2026-07-02 13:37Z" ;
var PCV_VERSION_STRING = `v${PCV_VERSION} \xB7 ${PCV_BUILD}`;

// src/index.ts
init_viewer_provider();
init_data_provider();

// src/layouts/minimal/minimal-layout.tsx
init_utils();

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
function MinimalSettingsPopover({ onClose }) {
  const {
    showMarkers,
    setShowMarkers,
    showMinimap,
    setShowMinimap,
    showMeasurements,
    setShowMeasurements,
    colorMode,
    setColorMode,
    pointSize,
    setPointSize,
    loader
  } = useViewer();
  return /* @__PURE__ */ jsx("div", { className: "absolute bottom-20 right-8 z-30", children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "w-56 p-3 space-y-3",
        "backdrop-blur-xl bg-[hsl(var(--card)/0.72)]",
        "border border-border",
        "rounded-xl shadow-2xl shadow-black/20"
      ),
      children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-1", children: "Layers" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsx(
            ToggleRow,
            {
              icon: /* @__PURE__ */ jsx(Camera, { size: 14 }),
              label: "Panoramas",
              active: showMarkers,
              onToggle: () => setShowMarkers(!showMarkers)
            }
          ),
          /* @__PURE__ */ jsx(
            ToggleRow,
            {
              icon: /* @__PURE__ */ jsx(Ruler, { size: 14 }),
              label: "Measurements",
              active: showMeasurements,
              onToggle: () => setShowMeasurements(!showMeasurements)
            }
          ),
          /* @__PURE__ */ jsx(
            ToggleRow,
            {
              icon: /* @__PURE__ */ jsx(Map$1, { size: 14 }),
              label: "Minimap",
              active: showMinimap,
              onToggle: () => setShowMinimap(!showMinimap)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-1", children: "Color" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: COLOR_MODES3.map((cm) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setColorMode(cm.value);
                loader?.setColorMode(cm.value);
              },
              className: cn(
                "text-[10px] py-1 px-2 rounded-lg transition-colors",
                colorMode === cm.value ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              ),
              children: cm.label
            },
            cm.value
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-1", children: "Point Size" }),
          /* @__PURE__ */ jsx("div", { className: "px-1", children: /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsx("div", { className: "border-t border-border pt-2 px-1", children: /* @__PURE__ */ jsxs("p", { className: "text-[9px] font-mono text-muted-foreground/60 leading-tight", title: "Viewer version \xB7 build", children: [
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
  return /* @__PURE__ */ jsx(
    "button",
    {
      title,
      onClick,
      className: cn(
        "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
        active ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))] shadow-[0_0_12px_hsl(var(--brand)/0.3)]" : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      ),
      children: icon
    }
  );
}
function Separator2() {
  return /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-muted mx-0.5" });
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleMeasure = useCallback(
    (tool) => {
      setActiveTool(activeTool === tool ? "none" : tool);
    },
    [activeTool, setActiveTool]
  );
  const fitToView = useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);
  const isMeasuring = activeTool.startsWith("measure-");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 z-30", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-0.5 px-2 py-1.5",
          "backdrop-blur-xl bg-[hsl(var(--card)/0.72)]",
          "border border-border",
          "rounded-2xl shadow-2xl shadow-black/20"
        ),
        children: [
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Orbit, { size: 16 }),
              title: "Orbit",
              active: navigationMode === "orbit",
              onClick: () => setNavigationMode("orbit")
            }
          ),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Rotate3d, { size: 16 }),
              title: "Free rotate",
              active: navigationMode === "free",
              onClick: () => setNavigationMode("free")
            }
          ),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Map$1, { size: 16 }),
              title: "Pan / Map",
              active: navigationMode === "pan",
              onClick: () => setNavigationMode("pan")
            }
          ),
          /* @__PURE__ */ jsx(Separator2, {}),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Maximize, { size: 16 }),
              title: "Fit to view",
              onClick: fitToView
            }
          ),
          /* @__PURE__ */ jsx(Separator2, {}),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Ruler, { size: 16 }),
              title: "Distance",
              active: activeTool === "measure-distance",
              onClick: () => toggleMeasure("measure-distance")
            }
          ),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(ArrowUpDown, { size: 16 }),
              title: "Height",
              active: activeTool === "measure-height",
              onClick: () => toggleMeasure("measure-height")
            }
          ),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Pentagon, { size: 16 }),
              title: "Area",
              active: activeTool === "measure-area",
              onClick: () => toggleMeasure("measure-area")
            }
          ),
          isMeasuring && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator2, {}),
            /* @__PURE__ */ jsx(
              GlassButton,
              {
                icon: /* @__PURE__ */ jsx(X, { size: 16 }),
                title: "Cancel measurement",
                onClick: () => setActiveTool("none"),
                className: "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Separator2, {}),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Settings, { size: 16 }),
              title: "View settings",
              active: settingsOpen,
              onClick: () => setSettingsOpen(!settingsOpen)
            }
          )
        ]
      }
    ) }),
    settingsOpen && /* @__PURE__ */ jsx(MinimalSettingsPopover, { onClose: () => setSettingsOpen(false) })
  ] });
}
function MinimalLayout({ viewport }) {
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: viewport }),
    /* @__PURE__ */ jsx("div", { style: pcvChromeScaleStyle, children: /* @__PURE__ */ jsx(MinimalToolbar, {}) })
  ] });
}

// src/layouts/workstation/workstation-layout.tsx
init_utils();
init_viewer_provider();
init_data_provider();

// src/layouts/workstation/collapsible-sidebar.tsx
init_utils();
function CollapsibleSidebar({ side, children, defaultOpen = true, width = "w-60" }) {
  const [open, setOpen] = useState(defaultOpen);
  const isLeft = side === "left";
  const ChevronIcon = open ? isLeft ? ChevronLeft : ChevronRight : isLeft ? ChevronRight : ChevronLeft;
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "absolute top-0 bottom-0 z-20 flex",
    isLeft ? "left-0" : "right-0",
    isLeft ? "flex-row" : "flex-row-reverse"
  ), children: [
    /* @__PURE__ */ jsx("div", { className: cn(
      "h-full overflow-y-auto overflow-x-hidden transition-all duration-200 bg-[hsl(var(--background)/0.95)] backdrop-blur-sm",
      isLeft ? "border-r" : "border-l",
      "border-[hsl(var(--border))]",
      open ? width : "w-0"
    ), children: open && /* @__PURE__ */ jsx("div", { className: "p-2 space-y-2 min-w-[230px]", children }) }),
    /* @__PURE__ */ jsx(
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
        children: /* @__PURE__ */ jsx(ChevronIcon, { size: 14 })
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
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden",
    "min-w-[220px]",
    className
  ), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setCollapsed(!collapsed),
        className: "flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-muted/40 transition-colors",
        children: [
          icon && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: icon }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: title }),
          collapsed ? /* @__PURE__ */ jsx(ChevronDown, { size: 12 }) : /* @__PURE__ */ jsx(ChevronUp, { size: 12 })
        ]
      }
    ),
    !collapsed && /* @__PURE__ */ jsx("div", { className: "px-3 pb-3 pt-1 space-y-2 border-t border-[hsl(var(--border))]", children })
  ] });
}
function ToolBtn({ icon, label, active, onClick, disabled }) {
  return /* @__PURE__ */ jsxs(
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
        /* @__PURE__ */ jsx("span", { children: label })
      ]
    }
  );
}
var MEASURE_TOOLS = [
  { tool: "measure-point", icon: /* @__PURE__ */ jsx(MapPin, { size: 14 }), label: "Point" },
  { tool: "measure-distance", icon: /* @__PURE__ */ jsx(Ruler, { size: 14 }), label: "Distance" },
  { tool: "measure-height", icon: /* @__PURE__ */ jsx(ArrowUpDown, { size: 14 }), label: "Height" },
  { tool: "measure-area", icon: /* @__PURE__ */ jsx(Pentagon, { size: 14 }), label: "Area" },
  { tool: "measure-volume", icon: /* @__PURE__ */ jsx(Package, { size: 14 }), label: "Volume" },
  { tool: "measure-angle", icon: /* @__PURE__ */ jsx(Triangle, { size: 14 }), label: "Angle" },
  { tool: "measure-profile", icon: /* @__PURE__ */ jsx(Waypoints, { size: 14 }), label: "Profile" }
];
function ToolsPalette() {
  const { activeTool, setActiveTool, clipManager, loader, measurementManager, setMeasurementList, clipBoxEntries } = useViewer();
  const toggle = useCallback((tool) => {
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);
  const hasClipBox = clipBoxEntries.length > 0;
  const clipMode = clipBoxEntries[0]?.mode ?? "outside";
  const addClipBox = useCallback(() => {
    if (!clipManager || !loader) return;
    if (loader.worldBox.isEmpty()) return;
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  }, [clipManager, loader]);
  const clearClipBox = useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);
  const toggleClipMode = useCallback(() => {
    const next = clipMode === "outside" ? "inside" : "outside";
    for (const b of clipBoxEntries) clipManager?.setBoxMode(b.id, next);
  }, [clipManager, clipBoxEntries, clipMode]);
  return /* @__PURE__ */ jsxs(FloatingPalette, { title: "Tools", icon: /* @__PURE__ */ jsx(Ruler, { size: 12 }), children: [
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1", children: "Measure" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
      MEASURE_TOOLS.map((def) => /* @__PURE__ */ jsx(ToolBtn, { icon: def.icon, label: def.label, active: activeTool === def.tool, onClick: () => toggle(def.tool) }, def.tool)),
      /* @__PURE__ */ jsx(ToolBtn, { icon: /* @__PURE__ */ jsx(X, { size: 14 }), label: "Clear All", onClick: () => {
        measurementManager?.clearAll();
        setMeasurementList([]);
      } })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-3 mb-1", children: "Clipping" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
      /* @__PURE__ */ jsx(ToolBtn, { icon: /* @__PURE__ */ jsx(BoxSelect, { size: 14 }), label: hasClipBox ? "Remove Clip Box" : "Add Clip Box", active: hasClipBox, onClick: hasClipBox ? clearClipBox : addClipBox }),
      hasClipBox && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(ToolBtn, { icon: /* @__PURE__ */ jsx(Scissors, { size: 14 }), label: `Mode: ${clipMode === "outside" ? "Keep Inside" : "Keep Outside"}`, onClick: toggleClipMode }),
        /* @__PURE__ */ jsx(ToolBtn, { icon: /* @__PURE__ */ jsx(RotateCcw, { size: 14 }), label: "Clear Clips", onClick: clearClipBox })
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
  return /* @__PURE__ */ jsxs(FloatingPalette, { title: "Display", icon: /* @__PURE__ */ jsx(Palette, { size: 12 }), children: [
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1", children: "Color" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: COLOR_MODES4.map((cm) => /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-3 mb-1", children: "Quality" }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: QUALITY_PRESETS2.map((q) => /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 mt-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-0.5", children: [
          /* @__PURE__ */ jsx("span", { children: "Budget" }),
          /* @__PURE__ */ jsxs("span", { children: [
            (pointBudget / 1e6).toFixed(1),
            "M"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
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
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-0.5", children: [
          /* @__PURE__ */ jsx("span", { children: "Point Size" }),
          /* @__PURE__ */ jsx("span", { children: pointSize.toFixed(1) })
        ] }),
        /* @__PURE__ */ jsx(
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
function ToggleRow2({ icon, label, active, onClick }) {
  return /* @__PURE__ */ jsxs("button", { onClick, className: "flex items-center gap-2 w-full px-1 py-1 rounded text-xs hover:bg-muted/40 transition-colors", children: [
    /* @__PURE__ */ jsx("span", { className: cn("text-muted-foreground", active && "text-[hsl(var(--brand))]"), children: icon }),
    /* @__PURE__ */ jsx("span", { className: "flex-1 text-left text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: cn("w-6 h-3.5 rounded-full transition-colors flex items-center px-0.5", active ? "bg-[hsl(var(--brand)/0.5)]" : "bg-muted/60"), children: /* @__PURE__ */ jsx("div", { className: cn("w-2.5 h-2.5 rounded-full bg-foreground/80 transition-transform", active && "translate-x-2.5") }) })
  ] });
}
function ModeBtn({ icon, label, active, onClick }) {
  return /* @__PURE__ */ jsxs("button", { onClick, className: cn(
    "flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] transition-colors",
    active ? "bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
  ), children: [
    icon,
    /* @__PURE__ */ jsx("span", { children: label })
  ] });
}
function ViewSettingsPalette() {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap, navigationMode, setNavigationMode, projection, setProjection } = useViewer();
  return /* @__PURE__ */ jsxs(FloatingPalette, { title: "View", icon: /* @__PURE__ */ jsx(Eye, { size: 12 }), defaultCollapsed: true, children: [
    /* @__PURE__ */ jsx(ToggleRow2, { icon: /* @__PURE__ */ jsx(Camera, { size: 13 }), label: "Panoramas", active: showMarkers, onClick: () => setShowMarkers(!showMarkers) }),
    /* @__PURE__ */ jsx(ToggleRow2, { icon: /* @__PURE__ */ jsx(Map$1, { size: 13 }), label: "Minimap", active: showMinimap, onClick: () => setShowMinimap(!showMinimap) }),
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2 mb-1", children: "Navigation" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Orbit, { size: 14 }), label: "Orbit", active: navigationMode === "orbit", onClick: () => setNavigationMode("orbit") }),
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Rotate3d, { size: 14 }), label: "Free", active: navigationMode === "free", onClick: () => setNavigationMode("free") }),
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Map$1, { size: 14 }), label: "Pan", active: navigationMode === "pan", onClick: () => setNavigationMode("pan") })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2 mb-1", children: "Projection" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Box, { size: 14 }), label: "Perspective", active: projection === "perspective", onClick: () => setProjection("perspective") }),
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Square, { size: 14 }), label: "Ortho", active: projection === "orthographic", onClick: () => setProjection("orthographic") })
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
  const [view, setView] = useState("top");
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState("png");
  const [bg, setBg] = useState("white");
  const [exporting, setExporting] = useState(false);
  const doExport = useCallback(async () => {
    if (!exporter) return;
    setExporting(true);
    try {
      const url = await exporter.capture({ view, scale, background: bg, format, showScaleBar: false });
      ExportManager.download(url, `export-${view}-${scale}x.${format}`);
    } finally {
      setExporting(false);
    }
  }, [exporter, view, scale, bg, format]);
  return /* @__PURE__ */ jsxs(FloatingPalette, { title: "Export", icon: /* @__PURE__ */ jsx(Image, { size: 12 }), defaultCollapsed: true, children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: VIEWS.map((v) => /* @__PURE__ */ jsx("button", { onClick: () => setView(v.value), className: cn(
      "text-[10px] px-2 py-0.5 rounded transition-colors",
      view === v.value ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
    ), children: v.label }, v.value)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [1, 2, 4].map((s) => /* @__PURE__ */ jsxs("button", { onClick: () => setScale(s), className: cn(
        "text-[10px] px-1.5 py-0.5 rounded transition-colors",
        scale === s ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
      ), children: [
        s,
        "x"
      ] }, s)) }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: ["png", "jpeg"].map((f) => /* @__PURE__ */ jsx("button", { onClick: () => setFormat(f), className: cn(
        "text-[10px] px-1.5 py-0.5 rounded transition-colors",
        format === f ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
      ), children: f.toUpperCase() }, f)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 mt-1", children: ["white", "black", "transparent"].map((b) => /* @__PURE__ */ jsx("button", { onClick: () => setBg(b), className: cn(
      "text-[10px] px-1.5 py-0.5 rounded transition-colors",
      bg === b ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
    ), children: b === "transparent" ? "Alpha" : b }, b)) }),
    /* @__PURE__ */ jsxs(
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
          /* @__PURE__ */ jsx(Download, { size: 12 }),
          exporting ? "Exporting..." : "Download"
        ]
      }
    )
  ] });
}
function WorkstationLayout({ viewport, sidebarSide = "left" }) {
  const { fps, pointBudget, activeTool } = useViewer();
  const { metadata } = useData();
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full overflow-hidden bg-[hsl(var(--background))]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: viewport }),
    /* @__PURE__ */ jsx("div", { style: pcvChromeScaleStyle, children: /* @__PURE__ */ jsxs(CollapsibleSidebar, { side: sidebarSide, children: [
      /* @__PURE__ */ jsx(ToolsPalette, {}),
      /* @__PURE__ */ jsx(DisplayPalette, {}),
      /* @__PURE__ */ jsx(ViewSettingsPalette, {}),
      /* @__PURE__ */ jsx(ExportPalette, {})
    ] }) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "absolute bottom-0 left-0 right-0 z-10 px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-muted-foreground/70 bg-[hsl(var(--card)/0.8)] backdrop-blur-sm border-t border-[hsl(var(--border)/0.5)]",
        style: pcvChromeScaleStyle,
        children: [
          metadata && /* @__PURE__ */ jsxs("span", { children: [
            (metadata.points / 1e6).toFixed(1),
            "M pts"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Budget: ",
            (pointBudget / 1e6).toFixed(1),
            "M"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            fps,
            " fps"
          ] }),
          activeTool !== "none" && /* @__PURE__ */ jsx("span", { className: "text-[hsl(var(--brand))]", children: activeTool })
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
  { type: "point", tool: "measure-point", icon: /* @__PURE__ */ jsx(MapPin, { size: 14 }), title: "Point coordinate" },
  { type: "distance", tool: "measure-distance", icon: /* @__PURE__ */ jsx(Ruler, { size: 14 }), title: "Distance" },
  { type: "height", tool: "measure-height", icon: /* @__PURE__ */ jsx(ArrowUpDown, { size: 14 }), title: "Height" },
  { type: "area", tool: "measure-area", icon: /* @__PURE__ */ jsx(Pentagon, { size: 14 }), title: "Area" },
  { type: "volume", tool: "measure-volume", icon: /* @__PURE__ */ jsx(Package, { size: 14 }), title: "Volume" },
  { type: "angle", tool: "measure-angle", icon: /* @__PURE__ */ jsx(Triangle, { size: 14 }), title: "Angle" },
  { type: "profile", tool: "measure-profile", icon: /* @__PURE__ */ jsx(Waypoints, { size: 14 }), title: "Profile" }
];
function MeasureTools() {
  const { activeTool, setActiveTool } = useViewer();
  const toggle = (tool) => {
    setActiveTool(activeTool === tool ? "none" : tool);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: TOOLS.map((t) => /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsx(BoxSelect, { size: 14 }),
        title: "Clipping box",
        active: hasClipBox,
        onClick: addClipBox
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsx(Slice, { size: 14 }),
        title: "Clipping plane",
        active: activeTool === "section-plane",
        onClick: () => setActiveTool(activeTool === "section-plane" ? "none" : "section-plane")
      }
    )
  ] });
}

// src/components/overlays/about-dialog.tsx
init_locale_context();
init_viewer_provider();
function AboutDialog({ onClose }) {
  const t = useLocale().about;
  const { loader } = useViewer();
  const geo = loader?.getGeoInfo();
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", onClick: onClose, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl p-6 w-80 text-sm",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-[hsl(var(--brand))] font-mono text-xs uppercase tracking-widest", children: t.title }),
          /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold text-foreground text-base", children: t.productName }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs mt-0.5", children: "@der-ort/pano-cloud-viewer" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-mono text-muted-foreground/70 mt-1", title: "Viewer version \xB7 build", children: [
            "v",
            PCV_VERSION,
            " \xB7 ",
            PCV_BUILD
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-4", children: t.description }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs text-muted-foreground border-t border-[hsl(var(--border))] pt-3", children: [
          /* @__PURE__ */ jsx("p", { children: t.engineLabel }),
          /* @__PURE__ */ jsx("p", { children: t.panoramasLabel }),
          /* @__PURE__ */ jsx("p", { children: t.uiLabel })
        ] }),
        geo && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground border-t border-[hsl(var(--border))] pt-3 mt-3", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Georeference:" }),
            " ",
            geo.georeferenced ? "yes" : "no (local coordinates)"
          ] }),
          geo.georeferenced && /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] mt-0.5 break-all", title: geo.projection, children: geo.projection.length > 80 ? geo.projection.slice(0, 80) + "\u2026" : geo.projection })
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
  compact: /* @__PURE__ */ jsx(Minus, { size: 18 }),
  standard: /* @__PURE__ */ jsx(Circle, { size: 18 }),
  prominent: /* @__PURE__ */ jsx(Plus, { size: 18 })
};
function PresetCard({
  preset,
  label,
  description,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
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
        /* @__PURE__ */ jsx(
          "span",
          {
            className: cn(
              "text-muted-foreground",
              active && "text-[hsl(var(--brand))]"
            ),
            children: PRESET_ICONS[preset]
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: label }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] leading-tight text-muted-foreground", children: description })
      ]
    }
  );
}
function SettingsSection({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h4", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: title }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children })
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
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "w-24 shrink-0 text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx("span", { className: "w-10 text-right text-xs tabular-nums text-muted-foreground", children: value.toFixed(step < 0.1 ? 2 : 1) })
  ] });
}
function SegmentedRow({
  label,
  value,
  options,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "w-24 shrink-0 text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 overflow-hidden rounded-md border border-[hsl(var(--border))]", children: options.map((opt, i) => /* @__PURE__ */ jsx(
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
  const settings = viewer.displaySettings;
  const setSettings = viewer.setDisplaySettings;
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
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);
  const applyPreset = (preset) => {
    setSettings({ ...DISPLAY_PRESETS[preset] });
  };
  const updateField = (key, value) => {
    setSettings({ ...settings, [key]: value, preset: settings.preset });
  };
  return /* @__PURE__ */ jsx(Dialog2, { open, onOpenChange, children: /* @__PURE__ */ jsxs(
    DialogContent2,
    {
      className: "w-[420px]",
      container: pcvRoot?.current ?? void 0,
      dragOffset: position,
      children: [
        /* @__PURE__ */ jsxs(
          DialogHeader2,
          {
            className: "cursor-move select-none",
            onMouseDown: onDragStart,
            children: [
              /* @__PURE__ */ jsx(DialogTitle2, { children: t.title }),
              /* @__PURE__ */ jsx(DialogClose2, { onMouseDown: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(X, { size: 14 }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(Tabs2, { defaultValue: "presets", className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxs(TabsList2, { className: "mb-4", children: [
            /* @__PURE__ */ jsx(TabsTrigger2, { value: "presets", children: t.presetsTab }),
            /* @__PURE__ */ jsx(TabsTrigger2, { value: "advanced", children: t.advancedTab })
          ] }),
          /* @__PURE__ */ jsx(TabsContent2, { value: "presets", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3", children: ["compact", "standard", "prominent"].map(
            (preset) => /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsx(TabsContent2, { value: "advanced", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs(SettingsSection, { title: t.measurementsSection, children: [
              /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsx(
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
            /* @__PURE__ */ jsxs(SettingsSection, { title: t.markersSection, children: [
              /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsx(
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
  const fitToView = useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);
  const flyToView = useCallback((preset) => {
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
  const startTool = useCallback((type) => {
    const tool = `measure-${type}`;
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);
  const cancelTool = useCallback(() => {
    setActiveTool("none");
  }, [setActiveTool]);
  const clearAll = useCallback(() => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  }, [measurementManager, setMeasurementList]);
  const remove = useCallback((id) => {
    measurementManager?.remove(id);
  }, [measurementManager]);
  const rename = useCallback((id, name) => {
    measurementManager?.rename(id, name);
  }, [measurementManager]);
  const exportCSV = useCallback(() => {
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

// src/hooks/use-export-actions.ts
init_viewer_provider();
init_dist();
function useExportActions() {
  const { exporter } = useViewer();
  const capture = useCallback(async (options) => {
    if (!exporter) return null;
    return exporter.capture(options);
  }, [exporter]);
  const download = useCallback((dataUrl, filename) => {
    ExportManager.download(dataUrl, filename);
  }, []);
  return { capture, download };
}

// src/hooks/use-visibility-actions.ts
init_viewer_provider();
function useVisibilityActions() {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap } = useViewer();
  const toggleMarkers = useCallback(() => {
    setShowMarkers(!showMarkers);
  }, [showMarkers, setShowMarkers]);
  const toggleMinimap = useCallback(() => {
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
  const { displaySettings: settings, setDisplaySettings } = useViewer();
  const applyPreset = useCallback((preset) => {
    setDisplaySettings({ ...DISPLAY_PRESETS[preset] });
  }, [setDisplaySettings]);
  const updateSetting = useCallback((key, value) => {
    setDisplaySettings({ ...settings, preset: "standard", [key]: value });
  }, [settings, setDisplaySettings]);
  return {
    settings,
    presets: DISPLAY_PRESETS,
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
var de = createLocale(en, {
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
    tabLayers: "Ebenen",
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
    hintVolumeFootprint: "Ziehen um die Volumen-Grundfl\xE4che zu zeichnen",
    hintVolumeHeight: "Maus hoch/runter f\xFCr die H\xF6he \u2022 Klick zum Best\xE4tigen",
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
    rotateZ: "Drehen",
    clippingOn: "Zuschnitt an",
    clippingOff: "Zuschnitt aus",
    outlinesOn: "Umrisse an",
    outlinesOff: "Umrisse aus",
    resetRotation: "Drehung zur\xFCcksetzen"
  }
});

export { AboutDialog, AxisWidget, Button, CameraAnimator, ClassificationPanel, ClipManager, ClipToolbar, CollapsibleSidebar, ComponentsProvider, DISPLAY_PRESETS, DataProvider, Dialog, DialogClose, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, DisplayControls, DisplaySettingsDialog, ElectronSourceAdapter, ExportManager, ExportTools, FloatingPalette, LocaleProvider, MainToolbar, MarkerManager, MeasureTools, MeasurementManager, MeasurementsPanel, MinimalLayout, MinimapRenderer, PCV_BUILD, PCV_VERSION, PCV_VERSION_STRING, PanoCloudViewer, PanoPanel, PanoViewer, PointCloudLoader, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, PresentationManager, RenderingSettings, S3SourceAdapter, SceneManager, ScenePanel, ScenesPanel, SectionTools, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, Sidebar, Slider2 as Slider, Tabs, TabsContent, TabsList, TabsTrigger, ThemeProvider, Toggle, ToolRail, ToolbarIconBtn, ToolbarSection, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, ViewControls, ViewerProvider, Viewport, WorkspaceLayout, WorkstationLayout, buttonVariants, captureScene, cn, createAdapter, createLocale, de, defaultComponents, en, exportMeasurementsCSV, formatAngle, formatArea, formatCoord, formatLength, formatVolume, toggleVariants, useClipActions, useComponents, useData, useDisplayActions, useDisplaySettings, useDraggable, useExportActions, useLocale, useMeasurementActions, useNavigationActions, usePcvRoot, useTheme, useViewer, useVisibilityActions };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map