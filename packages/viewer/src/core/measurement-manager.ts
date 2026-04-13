import * as THREE from "three";
import type { Measurement, MeasurementType } from "../types";
import { formatLength, formatArea, formatAngle } from "../lib/utils";

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
  onChange?: (measurements: Measurement[]) => void;

  // Active drawing state
  activeMeasurement: Measurement | null = null;
  private previewLine: THREE.Line | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "measurements";
    this.scene.add(this.group);
  }

  getAll(): Measurement[] {
    return Array.from(this.measurements.values()).map(v => v.data);
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

    // Compute value
    m.value = this.compute(m);

    // Build scene objects
    const objects = this.buildObjects(m);
    this.measurements.set(m.id, { data: m, objects });
    this.onChange?.(this.getAll());
    return m;
  }

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
    // Approximate as bounding box volume
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
      const geo = new THREE.SphereGeometry(0.15, 8, 6);
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
        // Vertical line only on Z axis
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
        sprite.scale.set(5, 1.2, 1);
        sprite.renderOrder = 3;
        this.group.add(sprite);
        objects.push(sprite);
      }
    }

    return objects;
  }

  private makeTextSprite(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 320; canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.roundRect(2, 2, 316, 60, 8);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 160, 32);
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

  remove(id: string) {
    const entry = this.measurements.get(id);
    if (!entry) return;
    entry.objects.forEach(o => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      } else if (o instanceof THREE.Sprite) {
        (o.material as THREE.SpriteMaterial).map?.dispose();
        (o.material as THREE.Material).dispose();
      }
      this.group.remove(o);
    });
    this.measurements.delete(id);
    this.onChange?.(this.getAll());
  }

  clearAll() {
    for (const id of this.measurements.keys()) this.remove(id);
  }

  dispose() {
    this.clearAll();
    this.clearPreview();
    this.scene.remove(this.group);
  }
}
