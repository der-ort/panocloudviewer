import * as THREE from "three";
import type { DisplaySettings, Measurement, MeasurementType } from "../types";
import { DISPLAY_PRESETS } from "../types";
import { formatLength, formatArea, formatAngle } from "../format";

let _idCounter = 0;
function nextId() { return `m-${++_idCounter}`; }

const COLORS: Record<MeasurementType, string> = {
  point:    "#DCD546",
  distance: "#DCD546",
  height:   "#9B94FF",
  area:     "#4ADE80",
  volume:   "#F97316",
  angle:    "#EC4899",
  profile:  "#22D3EE",
};

/** Manages 3D measurement visualizations in the scene */
export class MeasurementManager {
  private scene: THREE.Scene;
  private group: THREE.Group;
  private measurements: Map<string, { data: Measurement; objects: THREE.Object3D[] }> = new Map();
  private _displaySettings: DisplaySettings = DISPLAY_PRESETS.standard;
  onChange?: (measurements: Measurement[]) => void;

  // Active drawing state
  activeMeasurement: Measurement | null = null;
  private previewLine: THREE.Line | null = null;

  // Snap preview — cursor indicator + rubber-band line to show where the
  // next point will land before the user clicks. The indicator is a constant
  // on-screen crosshair sprite (not a ball) for precise targeting.
  private _snapCross: THREE.Sprite | null = null;
  private _snapLine: THREE.Line | null = null;
  private _crossTexture?: THREE.CanvasTexture;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "measurements";
    this.scene.add(this.group);
  }

  getAll(): Measurement[] {
    return Array.from(this.measurements.values()).map(v => v.data);
  }

  /** Apply new display settings and rebuild all existing measurements */
  applyDisplaySettings(settings: DisplaySettings): void {
    this._displaySettings = settings;
    this._rebuildAll();
  }

  /** Rebuild all existing measurement visuals with current display settings */
  private _rebuildAll(): void {
    for (const [id, entry] of this.measurements) {
      this._disposeObjects(entry.objects);
      const m = entry.data;
      const newObjects = m.box
        ? this.buildVolumeBoxObjects(m, new THREE.Box3(
            new THREE.Vector3(m.box.min[0], m.box.min[1], m.box.min[2]),
            new THREE.Vector3(m.box.max[0], m.box.max[1], m.box.max[2]),
          ))
        : this.buildObjects(m);
      this.measurements.set(id, { data: m, objects: newObjects });
    }
  }

  /** Dispose geometry/materials and remove objects from the group */
  private _disposeObjects(objects: THREE.Object3D[]): void {
    objects.forEach(o => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.LineSegments) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      } else if (o instanceof THREE.Sprite) {
        (o.material as THREE.SpriteMaterial).map?.dispose();
        (o.material as THREE.Material).dispose();
      }
      this.group.remove(o);
    });
  }

  /** Start a new measurement (call addPoint for each click, finish() to complete) */
  start(type: MeasurementType): Measurement {
    const m: Measurement = {
      id: nextId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${_idCounter}`,
      points: [],
      color: COLORS[type],
      visible: true,
      selected: false,
    };
    this.activeMeasurement = m;
    return m;
  }

  /** Add a 3D point to the active measurement */
  addPoint(point: THREE.Vector3): Measurement | null {
    if (!this.activeMeasurement) return null;
    this.activeMeasurement.points.push(point.clone());
    const m = this.activeMeasurement;

    // Auto-complete single-point measurements
    if (m.type === "point") {
      return this.finish();
    }

    // For distance: auto-finish after 2 points
    if (m.type === "distance" && m.points.length === 2) return this.finish();
    if (m.type === "height" && m.points.length === 2) return this.finish();
    if (m.type === "angle" && m.points.length === 3) return this.finish();

    this.rebuildPreview();
    return null;
  }

  /** Finalize the active measurement */
  finish(): Measurement | null {
    if (!this.activeMeasurement || this.activeMeasurement.points.length === 0) return null;
    const m = this.activeMeasurement;
    this.activeMeasurement = null;
    this.clearPreview();
    this.clearSnap();

    // Compute value
    m.value = this.compute(m);

    // Build scene objects
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
  updateSnap(worldPos: THREE.Vector3, color?: string): void {
    const c = new THREE.Color(color ?? this.activeMeasurement?.color ?? "#DCD546");

    // ── Snap crosshair (constant on-screen size) ──
    if (!this._snapCross) {
      const mat = new THREE.SpriteMaterial({
        map: this._getCrossTexture(),
        color: c,
        sizeAttenuation: false, // constant pixel size at any zoom
        depthTest: false,       // always visible through the cloud
        depthWrite: false,
        transparent: true,
      });
      this._snapCross = new THREE.Sprite(mat);
      this._snapCross.scale.set(0.05, 0.05, 1);
      this._snapCross.renderOrder = 5;
      this.group.add(this._snapCross);
    }
    this._snapCross.position.copy(worldPos);
    (this._snapCross.material as THREE.SpriteMaterial).color.copy(c);

    // ── Rubber-band line from last placed point → snap position ──
    const lastPt = this.activeMeasurement?.points[this.activeMeasurement.points.length - 1];
    if (lastPt) {
      if (this._snapLine) {
        // Update existing line geometry in-place
        const positions = (this._snapLine.geometry as THREE.BufferGeometry).attributes.position;
        positions.setXYZ(0, lastPt.x, lastPt.y, lastPt.z);
        positions.setXYZ(1, worldPos.x, worldPos.y, worldPos.z);
        positions.needsUpdate = true;
      } else {
        const geo = new THREE.BufferGeometry().setFromPoints([lastPt, worldPos]);
        const mat = new THREE.LineDashedMaterial({
          color: c,
          depthTest: false,
          transparent: true,
          opacity: 0.5,
          dashSize: 0.3,
          gapSize: 0.15,
        });
        this._snapLine = new THREE.Line(geo, mat);
        this._snapLine.computeLineDistances();
        this._snapLine.renderOrder = 3;
        this.group.add(this._snapLine);
      }
    } else if (!this.activeMeasurement && !lastPt) {
      // No measurement started yet — just show the sphere (first click indicator)
    }
  }

  /** Build (and cache) the stylized crosshair sprite texture. */
  private _getCrossTexture(): THREE.CanvasTexture {
    if (this._crossTexture) return this._crossTexture;
    const S = 64;
    const canvas = document.createElement("canvas");
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d")!;
    const c = S / 2;
    ctx.strokeStyle = "#ffffff"; // tinted by material.color
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const gap = 6;   // empty centre so the exact pixel stays visible
    const arm = 22;  // length of each crosshair arm
    ctx.beginPath();
    ctx.moveTo(c - arm, c); ctx.lineTo(c - gap, c); // left
    ctx.moveTo(c + gap, c); ctx.lineTo(c + arm, c); // right
    ctx.moveTo(c, c - arm); ctx.lineTo(c, c - gap); // top
    ctx.moveTo(c, c + gap); ctx.lineTo(c, c + arm); // bottom
    ctx.stroke();
    // Small centre ring
    ctx.beginPath();
    ctx.arc(c, c, 2.5, 0, Math.PI * 2);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    this._crossTexture = tex;
    return tex;
  }

  /** Hide the snap preview (call on mouse leave or tool deactivation) */
  clearSnap(): void {
    if (this._snapCross) {
      (this._snapCross.material as THREE.SpriteMaterial).dispose();
      this.group.remove(this._snapCross);
      this._snapCross = null;
    }
    if (this._snapLine) {
      this._snapLine.geometry.dispose();
      (this._snapLine.material as THREE.Material).dispose();
      this.group.remove(this._snapLine);
      this._snapLine = null;
    }
  }

  // ─── Volume measurement (drag-to-create) ─────────────────────────────────

  private _volumeDraft: THREE.Object3D | null = null;

  /** Show/update a volume draft box preview during drag creation */
  setVolumeDraft(box: THREE.Box3 | null): void {
    // Clear existing draft
    if (this._volumeDraft) {
      this._volumeDraft.traverse(o => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      this.group.remove(this._volumeDraft);
      this._volumeDraft = null;
    }
    if (!box || box.isEmpty()) return;

    const draftGroup = new THREE.Group();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const c = new THREE.Color(COLORS.volume);

    // Semi-transparent fill
    const fillGeo = new THREE.BoxGeometry(1, 1, 1);
    const fillMat = new THREE.MeshBasicMaterial({
      color: c, opacity: 0.1, transparent: true, depthWrite: false, depthTest: false,
    });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.copy(center);
    fill.scale.copy(size);
    fill.renderOrder = 1;
    draftGroup.add(fill);

    // Wireframe edges
    const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
    const edgesMat = new THREE.LineBasicMaterial({ color: c, depthTest: false, transparent: true, opacity: 0.6 });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    edges.position.copy(center);
    edges.scale.copy(size);
    edges.renderOrder = 2;
    draftGroup.add(edges);

    this.group.add(draftGroup);
    this._volumeDraft = draftGroup;
  }

  /** Create a volume measurement from a drag-defined box */
  addVolumeMeasurement(box: THREE.Box3): Measurement | null {
    this.setVolumeDraft(null); // clear draft
    this.clearSnap();

    const size = new THREE.Vector3();
    box.getSize(size);
    const volume = size.x * size.y * size.z;
    if (volume <= 0) return null;

    const id = nextId();
    const m: Measurement = {
      id,
      type: "volume",
      label: `Volume ${_idCounter}`,
      points: [], // Not used for box-based volumes
      value: volume,
      box: {
        min: [box.min.x, box.min.y, box.min.z],
        max: [box.max.x, box.max.y, box.max.z],
      },
      color: COLORS.volume,
      visible: true,
      selected: false,
    };

    const objects = this.buildVolumeBoxObjects(m, box);
    this.measurements.set(m.id, { data: m, objects });
    this.onChange?.(this.getAll());
    return m;
  }

  private buildVolumeBoxObjects(m: Measurement, box: THREE.Box3): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    const color = new THREE.Color(m.color);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Semi-transparent box fill
    const fillGeo = new THREE.BoxGeometry(1, 1, 1);
    const fillMat = new THREE.MeshBasicMaterial({
      color, opacity: 0.12, transparent: true, depthWrite: false, depthTest: false,
    });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.copy(center);
    fill.scale.copy(size);
    fill.renderOrder = 1;
    this.group.add(fill);
    objects.push(fill);

    // Wireframe edges
    const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
    const edgesMat = new THREE.LineBasicMaterial({ color, depthTest: false });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    edges.position.copy(center);
    edges.scale.copy(size);
    edges.renderOrder = 2;
    this.group.add(edges);
    objects.push(edges);

    // Volume label
    const text = `${m.value!.toFixed(3)} m³`;
    const sprite = this.makeTextSprite(text, m.color);
    sprite.position.copy(center).add(new THREE.Vector3(0, 0, size.z / 2 + 0.5));
    const ls = this._displaySettings.measurementLabelScale;
    sprite.scale.set(3.2 * ls, 0.8 * ls, 1);
    sprite.renderOrder = 3;
    this.group.add(sprite);
    objects.push(sprite);

    return objects;
  }

  // ─── Internals ──────────────────────────────────────────────────────────────

  private compute(m: Measurement): number {
    const pts = m.points;
    switch (m.type) {
      case "point": return 0;
      case "distance": return pts.length >= 2 ? pts[0].distanceTo(pts[1]) : 0;
      case "height": return pts.length >= 2 ? Math.abs(pts[1].z - pts[0].z) : 0;
      case "angle": {
        if (pts.length < 3) return 0;
        const a = pts[0].clone().sub(pts[1]).normalize();
        const b = pts[2].clone().sub(pts[1]).normalize();
        return Math.acos(Math.max(-1, Math.min(1, a.dot(b))));
      }
      case "area": return this.polygonArea(pts);
      case "volume": return this.convexVolume(pts);
      default: return 0;
    }
  }

  private polygonArea(pts: THREE.Vector3[]): number {
    if (pts.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      area += a.x * b.y - b.x * a.y;
    }
    return Math.abs(area) / 2;
  }

  private convexVolume(pts: THREE.Vector3[]): number {
    const box = new THREE.Box3();
    pts.forEach(p => box.expandByPoint(p));
    const size = new THREE.Vector3();
    box.getSize(size);
    return size.x * size.y * size.z;
  }

  private buildObjects(m: Measurement): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    const color = new THREE.Color(m.color);
    const pts = m.points;

    // Sphere at each point
    pts.forEach(p => {
      const geo = new THREE.SphereGeometry(this._displaySettings.measurementSphereRadius, 8, 6);
      const mat = new THREE.MeshBasicMaterial({ color, depthTest: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(p);
      mesh.renderOrder = 2;
      this.group.add(mesh);
      objects.push(mesh);
    });

    // Lines between points
    if (pts.length >= 2) {
      const lineType = m.type === "height" ? "vertical" : "direct";
      if (lineType === "vertical" && m.type === "height") {
        const geo = new THREE.BufferGeometry().setFromPoints([
          pts[0], new THREE.Vector3(pts[0].x, pts[0].y, pts[1].z),
        ]);
        const mat = new THREE.LineBasicMaterial({ color, depthTest: false });
        const line = new THREE.Line(geo, mat);
        line.renderOrder = 1;
        this.group.add(line);
        objects.push(line);
      } else {
        for (let i = 0; i < pts.length - 1; i++) {
          const geo = new THREE.BufferGeometry().setFromPoints([pts[i], pts[i+1]]);
          const mat = new THREE.LineBasicMaterial({ color, depthTest: false });
          const line = new THREE.Line(geo, mat);
          line.renderOrder = 1;
          this.group.add(line);
          objects.push(line);
        }
        // Close polygon for area
        if (m.type === "area" && pts.length >= 3) {
          const geo = new THREE.BufferGeometry().setFromPoints([pts[pts.length - 1], pts[0]]);
          const mat = new THREE.LineBasicMaterial({ color, depthTest: false });
          this.group.add(new THREE.Line(geo, mat));
        }
      }
    }

    // Label
    if (m.value !== undefined) {
      let text = "";
      switch (m.type) {
        case "distance": text = formatLength(m.value); break;
        case "height":   text = formatLength(m.value); break;
        case "area":     text = formatArea(m.value); break;
        case "angle":    text = formatAngle(m.value); break;
        case "volume":   text = `${m.value.toFixed(3)} m³`; break;
        case "point": {
          const p = pts[0];
          text = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
          break;
        }
      }
      if (text) {
        const sprite = this.makeTextSprite(text, m.color);
        const mid = pts.reduce((a, b) => a.clone().add(b), new THREE.Vector3()).divideScalar(pts.length);
        sprite.position.copy(mid).add(new THREE.Vector3(0, 0, 1));
        const ls = this._displaySettings.measurementLabelScale;
        sprite.scale.set(3.2 * ls, 0.8 * ls, 1);
        sprite.renderOrder = 3;
        this.group.add(sprite);
        objects.push(sprite);
      }
    }

    return objects;
  }

  private makeTextSprite(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 48;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.roundRect(2, 2, 252, 44, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = "bold 28px -apple-system, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 24);
    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  }

  private rebuildPreview() {
    this.clearPreview();
    if (!this.activeMeasurement || this.activeMeasurement.points.length < 1) return;
    const pts = this.activeMeasurement.points;
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.activeMeasurement.color),
      depthTest: false,
      transparent: true,
      opacity: 0.7,
    });
    this.previewLine = new THREE.Line(geo, mat);
    this.previewLine.renderOrder = 1;
    this.group.add(this.previewLine);
  }

  private clearPreview() {
    if (this.previewLine) {
      this.previewLine.geometry.dispose();
      (this.previewLine.material as THREE.Material).dispose();
      this.group.remove(this.previewLine);
      this.previewLine = null;
    }
  }

  rename(id: string, name: string): void {
    const entry = this.measurements.get(id);
    if (!entry) return;
    entry.data.label = name;
    this.onChange?.(this.getAll());
  }

  remove(id: string) {
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
    this._crossTexture = undefined;
    this.scene.remove(this.group);
  }
}
