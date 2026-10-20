import * as THREE from "three";
import type { CameraData, DisplaySettings } from "../types";
import { DISPLAY_PRESETS } from "../types";

const MARKER_COLOR_DEFAULT  = 0xdcd546;  // brand yellow
const MARKER_COLOR_HOVER    = 0xffffff;
const MARKER_COLOR_SELECTED = 0xff6644;  // orange-red for high contrast

/**
 * A pin's on-screen height as a fraction of the viewport height, at
 * markerSphereScale 1 — what the old 0.022 sprite scale covered under the
 * 60° camera.
 */
const PIN_SCREEN_FRACTION = 0.019;

/**
 * How much of its opacity a pin keeps while it is behind the point cloud.
 *
 * Low enough to read as "through a wall" at a glance, high enough that a
 * marker in the next room is still findable against a dense scan.
 */
const GHOST_OPACITY_FACTOR = 0.2;

/** In "always" label mode, labels for this many markers — the ones nearest the camera. */
const MAX_LABELS = 24;

/** Smallest pick radius in CSS pixels, so a pin stays hittable by a finger. */
const MIN_PICK_RADIUS_PX = 8;

type MarkerLabelMode = "hover" | "always" | "hidden";

/**
 * 3D panorama camera markers.
 *
 * All pins are ONE `THREE.Points` geometry, one vertex per camera in camera
 * index order, drawn with a round sprite texture at a constant on-screen size
 * (sizeAttenuation:false). Each marker used to be its own sprite, plus a ghost
 * sprite, plus a label sprite with its own canvas texture: 3,402 panoramas
 * were 6,813 draw calls a frame. Now the pins are two draw calls whatever
 * their number, and colour (hover, selection) and visibility (clip filter)
 * are per-vertex RGBA.
 *
 * Labels exist only while shown: on hover or selection, and in "always" mode
 * for the {@link MAX_LABELS} markers nearest the camera. Every label is a
 * canvas texture and a draw call, so labelling all of a crowded scan is what
 * the "always" mode must not do.
 *
 * ---------------------------------------------------------------------------
 * DEPTH: WHY THE PINS ARE DRAWN TWICE
 *
 * Pins used to carry `depthTest: false`, so every scan position floated on top
 * of the cloud — markers from the far side of a building sat over the wall in
 * front of you, and nothing about the picture said which room they were in.
 *
 * Plain `depthTest: true` fixes that and creates a worse problem: a marker
 * behind anything vanishes completely, and the only way to discover the next
 * room's panorama is to fly there. That is exactly what the original flag was
 * avoiding.
 *
 * So the pins are drawn twice from the same geometry, the two passes made
 * MUTUALLY EXCLUSIVE by the depth comparison rather than by draw order:
 *
 *   pins    depthFunc LessEqualDepth  → drawn only where they are in front
 *   ghosts  depthFunc GreaterDepth    → drawn only where they are behind
 *
 * Exactly one of the pair passes for any given pixel, so an unoccluded marker
 * is never the two of them stacked and brightened. Both leave `depthWrite`
 * off, so neither occludes the other or anything else.
 *
 * ---------------------------------------------------------------------------
 * PICKING
 *
 * {@link pick} works in screen space: a pin is a constant number of pixels, so
 * a world-space ray test is the wrong question. It ignores depth on purpose —
 * a ghosted marker stays clickable. Being behind a wall makes a panorama
 * harder to see, not unreachable.
 */
export class MarkerManager {
  private scene: THREE.Scene;
  private group: THREE.Group;
  private hoveredIdx = -1;
  private selectedIdx = -1;
  private labelMode: MarkerLabelMode = "hover";
  private _displaySettings: DisplaySettings = DISPLAY_PRESETS.standard;
  private _cameras: CameraData[] = [];
  private _worldBox?: THREE.Box3;
  /** Shared circular pin texture (white; tinted per vertex). */
  private _pinTexture?: THREE.CanvasTexture;
  /** World-space vertical offset for the label anchor above the pin. */
  private _labelOffset = 0.5;
  /** Optional clip predicate — markers whose position fails it are hidden. */
  private _clipFilter: ((pos: THREE.Vector3) => boolean) | null = null;

  private _geometry: THREE.BufferGeometry | null = null;
  private _pins: THREE.Points | null = null;
  private _ghosts: THREE.Points | null = null;
  /** Per camera: has a position and passes the clip filter. */
  private _shown: boolean[] = [];
  private _labels = new Map<number, THREE.Sprite>();
  /** "always" mode: the shown markers nearest the camera, which get labels. */
  private _nearest = new Set<number>();
  /** Camera position the nearest set was computed for (Infinity = recompute). */
  private _nearestFrom = new THREE.Vector3(Infinity, 0, 0);
  /** Canvas size and pin size in CSS pixels at the last render, for pick(). */
  private _view = new THREE.Vector2(1, 1);
  private _pinPx = 16;
  private _tmp = new THREE.Vector3();
  private _tmpColor = new THREE.Color();
  private _tmpMatrix = new THREE.Matrix4();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "pano-markers";
    this.scene.add(this.group);
  }

  /** Apply new display settings and rebuild all markers */
  applyDisplaySettings(settings: DisplaySettings): void {
    this._displaySettings = settings;
    if (this._cameras.length > 0) {
      this.build(this._cameras, this._worldBox);
    }
  }

  /** Build markers from camera data. Pass worldBox for auto-scaling. */
  build(cameras: CameraData[], worldBox?: THREE.Box3) {
    this._cameras = cameras;
    this._worldBox = worldBox;
    this.labelMode =
      (this._displaySettings.markerLabelMode as MarkerLabelMode | undefined) ??
      "hover";
    this.clear();

    if (worldBox && !worldBox.isEmpty()) {
      const size = new THREE.Vector3();
      worldBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      // small world offset so the label floats just above the pin anchor
      this._labelOffset = Math.max(0.2, Math.min(4, maxDim * 0.01));
    }
    if (cameras.length === 0) return;

    const positions = new Float32Array(cameras.length * 3);
    cameras.forEach((cam, i) => {
      // A camera without a position keeps (0,0,0) and stays hidden (see _shown).
      if (cam.position) positions.set([cam.position.x, cam.position.y, cam.position.z], i * 3);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(cameras.length * 4), 4));
    this._geometry = geometry;
    for (let i = 0; i < cameras.length; i++) this._recolor(i, MARKER_COLOR_DEFAULT);

    this._pins = this._makePins(geometry, "front");
    this._ghosts = this._makePins(geometry, "behind");
    this.group.add(this._pins, this._ghosts);

    // Re-apply any active clip filter to the freshly built markers.
    this._applyAllMarkerVisibility();
  }

  /**
   * Hide panorama markers whose camera position falls outside the kept clip
   * region. Pass `null` to clear the filter (all markers visible). The predicate
   * is typically `ClipManager.isPointVisible`.
   */
  applyClipFilter(predicate: ((pos: THREE.Vector3) => boolean) | null): void {
    this._clipFilter = predicate;
    this._applyAllMarkerVisibility();
  }

  private _applyAllMarkerVisibility(): void {
    const color = this._geometry?.getAttribute("color") as THREE.BufferAttribute | undefined;
    if (!color) return;
    for (let i = 0; i < this._cameras.length; i++) {
      const p = this._cameras[i].position;
      // A marker outside the kept region must be gone, ghost included, not faintly present.
      this._shown[i] = !!p && (!this._clipFilter || this._clipFilter(this._tmp.set(p.x, p.y, p.z)));
      color.setW(i, this._shown[i] ? 1 : 0);
    }
    color.needsUpdate = true;
    this._nearestFrom.set(Infinity, 0, 0);
    this._syncLabels();
  }

  /** Lazily build (and cache) the shared circular pin texture. */
  private _getPinTexture(): THREE.CanvasTexture {
    if (this._pinTexture) return this._pinTexture;

    const S = 64;
    const canvas = document.createElement("canvas");
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d")!;
    const c = S / 2;

    // Soft outer ring (subtle glow / halo)
    ctx.beginPath();
    ctx.arc(c, c, S * 0.46, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fill();

    // Darker outline
    ctx.beginPath();
    ctx.arc(c, c, S * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,20,20,0.85)";
    ctx.fill();

    // Filled disc — white so the vertex colour tints it cleanly
    ctx.beginPath();
    ctx.arc(c, c, S * 0.27, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    this._pinTexture = tex;
    return tex;
  }

  /**
   * One pass over all pins.
   *
   * `pass` selects which half of the depth range it is allowed to draw in —
   * see the class comment. The two passes together cover every pixel exactly
   * once, so the pair never reads as one brighter marker.
   */
  private _makePins(geometry: THREE.BufferGeometry, pass: "front" | "behind"): THREE.Points {
    const behind = pass === "behind";
    const material = new THREE.PointsMaterial({
      map: this._getPinTexture(),
      vertexColors: true, // RGBA: colour = state, alpha = shown
      sizeAttenuation: false, // constant on-screen size at any zoom, ortho included
      depthTest: true,
      // GreaterDepth draws ONLY the occluded part; the default LessEqualDepth
      // draws only the unoccluded part.
      depthFunc: behind ? THREE.GreaterDepth : THREE.LessEqualDepth,
      depthWrite: false,
      transparent: true,
      opacity:
        this._displaySettings.markerSphereOpacity *
        (behind ? GHOST_OPACITY_FACTOR : 1),
    });
    const points = new THREE.Points(geometry, material);
    // Hidden cameras sit at the origin and would skew the bounding sphere; the
    // per-frame hook below must run whenever the group is visible anyway.
    points.frustumCulled = false;
    points.onBeforeRender = (renderer, _scene, camera) => this._beforeRender(renderer, camera, material);
    return points;
  }

  /**
   * Per pass, per render: size the pins to the viewport (a PointsMaterial size
   * is pixels, the pin is a fraction of the view), and once per frame refresh
   * the "always" labels when the camera has moved.
   */
  private _beforeRender(renderer: THREE.WebGLRenderer, camera: THREE.Camera, material: THREE.PointsMaterial) {
    const ratio = renderer.getPixelRatio();
    const target = renderer.getRenderTarget();
    // three multiplies `size` by the pixel ratio; a render target (an export)
    // is measured in device pixels, the canvas in CSS pixels.
    const heightPx = target ? target.height / ratio : renderer.getSize(this._view).y;
    material.size = PIN_SCREEN_FRACTION * this._displaySettings.markerSphereScale * heightPx;
    if (target || material !== this._pins?.material) return;

    this._pinPx = material.size;
    if (this.labelMode === "always" && camera.position.distanceToSquared(this._nearestFrom) > 1e-6) {
      this._nearestFrom.copy(camera.position);
      this._updateNearest(camera.position);
    }
  }

  /** ponytail: a sort of every shown marker per moving frame, ~0.5 ms at 3,400; a spatial index if it ever shows up in a profile. */
  private _updateNearest(from: THREE.Vector3) {
    const pos = this._geometry!.getAttribute("position");
    const byDistance: Array<[number, number]> = [];
    for (let i = 0; i < this._shown.length; i++) {
      if (this._shown[i]) byDistance.push([this._tmp.fromBufferAttribute(pos, i).distanceToSquared(from), i]);
    }
    byDistance.sort((a, b) => a[0] - b[0]);
    this._nearest = new Set(byDistance.slice(0, MAX_LABELS).map(([, i]) => i));
    this._syncLabels();
  }

  /** Resolve whether a marker's label should be visible under the current mode. */
  private _labelShouldShow(idx: number): boolean {
    if (!this._shown[idx] || this.labelMode === "hidden") return false;
    if (idx === this.hoveredIdx || idx === this.selectedIdx) return true;
    return this.labelMode === "always" && this._nearest.has(idx);
  }

  /** Create the labels that should show, dispose the ones that should not. */
  private _syncLabels() {
    for (const idx of [...this._nearest, this.hoveredIdx, this.selectedIdx]) {
      if (idx >= 0 && this._labelShouldShow(idx) && !this._labels.has(idx)) {
        const p = this._cameras[idx].position!;
        const label = this._makeLabel(this._cameras[idx].name);
        label.position.set(p.x, p.y, p.z + this._labelOffset);
        this.group.add(label);
        this._labels.set(idx, label);
      }
    }
    // ponytail: no label cache — a 200×48 canvas is cheap to redraw when it comes back.
    for (const idx of [...this._labels.keys()]) {
      if (!this._labelShouldShow(idx)) this._disposeLabel(idx);
    }
  }

  private _disposeLabel(idx: number) {
    const label = this._labels.get(idx);
    if (!label) return;
    (label.material as THREE.SpriteMaterial).map?.dispose();
    (label.material as THREE.SpriteMaterial).dispose();
    this.group.remove(label);
    this._labels.delete(idx);
  }

  private _makeLabel(text: string): THREE.Sprite {
    const W = 200;
    const H = 48;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Subtle low-opacity background pill
    ctx.fillStyle = "rgba(15,15,15,0.55)";
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 8);
    ctx.fill();

    // Text — lighter weight, slightly translucent
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "500 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.substring(0, 22), W / 2, H / 2 + 1);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      sizeAttenuation: false, // constant on-screen size — never huge
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    const sprite = new THREE.Sprite(mat);
    const ls = this._displaySettings.markerLabelScale;
    // Constant on-screen label sized relative to viewport height, preserving aspect.
    const h = 0.05 * ls;
    sprite.scale.set(h * (W / H), h, 1);
    return sprite;
  }

  /** Set a pin's colour (both passes read the same vertex). */
  private _recolor(idx: number, color: number) {
    const attr = this._geometry?.getAttribute("color") as THREE.BufferAttribute | undefined;
    if (!attr || idx < 0 || idx >= attr.count) return;
    const c = this._tmpColor.setHex(color);
    attr.setXYZ(idx, c.r, c.g, c.b);
    attr.needsUpdate = true;
  }

  setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  /**
   * The marker under a screen point: NDC in (as for `SceneManager.raycast`),
   * camera index out, -1 for none. Pass `sceneManager.getActiveCamera()`.
   * Nearest on screen wins; hidden and clipped markers never do.
   */
  pick(ndcX: number, ndcY: number, camera: THREE.Camera): number {
    const pos = this._geometry?.getAttribute("position");
    if (!pos || !this.group.visible) return -1;
    camera.updateMatrixWorld();
    const m = this._tmpMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const halfW = this._view.x / 2;
    const halfH = this._view.y / 2;
    const radius = Math.max(this._pinPx / 2, MIN_PICK_RADIUS_PX);
    let best = -1;
    let bestSq = radius * radius;
    for (let i = 0; i < this._shown.length; i++) {
      if (!this._shown[i]) continue;
      const p = this._tmp.fromBufferAttribute(pos, i).applyMatrix4(m);
      if (p.z < -1 || p.z > 1) continue; // behind the camera or beyond the far plane
      const dx = (p.x - ndcX) * halfW;
      const dy = (p.y - ndcY) * halfH;
      const sq = dx * dx + dy * dy;
      if (sq <= bestSq) { best = i; bestSq = sq; }
    }
    return best;
  }

  /**
   * @deprecated Use {@link pick}: the pins are one `THREE.Points` now, so a
   * raycast hit carries the camera index as `intersection.index` (not
   * `object.userData.cameraIndex`), and three's Points threshold is in world
   * units while the pins are a pixel size.
   */
  getMeshes(): THREE.Object3D[] {
    return this._pins ? [this._pins] : [];
  }

  setHovered(idx: number) {
    if (this.hoveredIdx === idx) return;
    const prev = this.hoveredIdx;
    this.hoveredIdx = idx;

    if (prev >= 0 && prev !== this.selectedIdx) this._recolor(prev, MARKER_COLOR_DEFAULT);
    if (idx >= 0 && idx !== this.selectedIdx) this._recolor(idx, MARKER_COLOR_HOVER);
    this._syncLabels();
  }

  setSelected(idx: number) {
    const prev = this.selectedIdx;
    this.selectedIdx = idx;

    if (prev >= 0) this._recolor(prev, prev === this.hoveredIdx ? MARKER_COLOR_HOVER : MARKER_COLOR_DEFAULT);
    if (idx >= 0) this._recolor(idx, MARKER_COLOR_SELECTED);
    this._syncLabels();
  }

  clear() {
    for (const idx of [...this._labels.keys()]) this._disposeLabel(idx);
    for (const points of [this._pins, this._ghosts]) {
      if (!points) continue;
      // pin texture is shared/cached — do not dispose it here
      (points.material as THREE.PointsMaterial).dispose();
      this.group.remove(points);
    }
    this._geometry?.dispose();
    this._geometry = null;
    this._pins = null;
    this._ghosts = null;
    this._shown = [];
    this._nearest = new Set();
    this._nearestFrom.set(Infinity, 0, 0);
    this.hoveredIdx = -1;
    this.selectedIdx = -1;
  }

  dispose() {
    this.clear();
    this._pinTexture?.dispose();
    this._pinTexture = undefined;
    this.scene.remove(this.group);
  }
}
