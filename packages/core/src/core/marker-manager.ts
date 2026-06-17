import * as THREE from "three";
import type { CameraData, DisplaySettings } from "../types";
import { DISPLAY_PRESETS } from "../types";

const MARKER_COLOR_DEFAULT  = 0xdcd546;  // brand yellow
const MARKER_COLOR_HOVER    = 0xffffff;
const MARKER_COLOR_SELECTED = 0xff6644;  // orange-red for high contrast

/** Base on-screen size of a pin sprite (fraction of viewport height) when
 *  sizeAttenuation is false. Multiplied by markerSphereScale. */
const PIN_BASE_SCALE = 0.022;

type MarkerLabelMode = "hover" | "always" | "hidden";

interface MarkerEntry {
  /** Constant on-screen-size pin (sizeAttenuation:false) — also the raycast target. */
  pin: THREE.Sprite;
  label: THREE.Sprite;
}

/**
 * 3D panorama camera markers.
 *
 * Each marker is a small constant on-screen-size pin sprite
 * (sizeAttenuation:false) in brand yellow, always visible through the point
 * cloud via depthTest=false. A subtle text label sits above the pin and is
 * hidden by default — it appears only on hover/selection (markerLabelMode).
 *
 * The pin sprites are returned from getMeshes() as the raycast targets; Sprite
 * is raycastable in three r170. One pin per camera, in camera index order.
 */
export class MarkerManager {
  private scene: THREE.Scene;
  private entries: MarkerEntry[] = [];
  private group: THREE.Group;
  private hoveredIdx = -1;
  private selectedIdx = -1;
  private labelMode: MarkerLabelMode = "hover";
  private _displaySettings: DisplaySettings = DISPLAY_PRESETS.standard;
  private _cameras: CameraData[] = [];
  private _worldBox?: THREE.Box3;
  /** Shared circular pin texture (reused across all pins; tinted via material.color). */
  private _pinTexture?: THREE.CanvasTexture;
  /** World-space vertical offset for the label anchor above the pin. */
  private _labelOffset = 0.5;
  /** Optional clip predicate — markers whose position fails it are hidden. */
  private _clipFilter: ((pos: THREE.Vector3) => boolean) | null = null;

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

    const pinScale =
      PIN_BASE_SCALE * this._displaySettings.markerSphereScale;

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

  /** Whether a marker survives the active clip filter. */
  private _passesClip(idx: number): boolean {
    if (!this._clipFilter) return true;
    const cam = this._cameras[idx];
    if (!cam?.position) return true;
    return this._clipFilter(new THREE.Vector3(cam.position.x, cam.position.y, cam.position.z));
  }

  private _applyAllMarkerVisibility(): void {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const pass = this._passesClip(i);
      entry.pin.visible = pass;
      entry.label.visible = pass && this._labelShouldShow(i);
    }
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

    // Filled disc — white so material.color tints it cleanly
    ctx.beginPath();
    ctx.arc(c, c, S * 0.27, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    this._pinTexture = tex;
    return tex;
  }

  private _makePin(color: number, scale: number): THREE.Sprite {
    const mat = new THREE.SpriteMaterial({
      map: this._getPinTexture(),
      color,
      sizeAttenuation: false, // constant on-screen size at any zoom
      depthTest: false,       // always visible through the point cloud
      depthWrite: false,
      transparent: true,
      opacity: this._displaySettings.markerSphereOpacity,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale, scale, 1);
    return sprite;
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

  /** Update pin color by index */
  private _recolor(idx: number, color: number) {
    const entry = this.entries[idx];
    if (!entry) return;
    (entry.pin.material as THREE.SpriteMaterial).color.setHex(color);
  }

  /** Resolve whether a marker's label should be visible under the current mode. */
  private _labelShouldShow(idx: number): boolean {
    if (this.labelMode === "always") return true;
    if (this.labelMode === "hidden") return false;
    // "hover": visible if hovered or selected
    return idx === this.hoveredIdx || idx === this.selectedIdx;
  }

  private _applyLabelVisibility(idx: number) {
    const entry = this.entries[idx];
    if (!entry) return;
    entry.label.visible = this._passesClip(idx) && this._labelShouldShow(idx);
  }

  setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  /** Return pin sprites for raycasting (one per camera, index order) */
  getMeshes(): THREE.Object3D[] {
    return this.entries.map((e) => e.pin);
  }

  setHovered(idx: number) {
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

  setSelected(idx: number) {
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
      // pin texture is shared/cached — do not dispose it here
      (pin.material as THREE.SpriteMaterial).dispose();
      this.group.remove(pin);

      (label.material as THREE.SpriteMaterial).map?.dispose();
      (label.material as THREE.SpriteMaterial).dispose();
      this.group.remove(label);
    }
    this.entries = [];
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
