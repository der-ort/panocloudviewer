import * as THREE from "three";
import type { CameraData } from "../types";

const MARKER_COLOR_DEFAULT  = 0xdcd546;  // brand yellow
const MARKER_COLOR_HOVER    = 0xffffff;
const MARKER_COLOR_SELECTED = 0xff6644;  // orange-red for high contrast

interface MarkerEntry {
  mesh: THREE.Mesh;
  label: THREE.Sprite;
}

/**
 * 3D panorama camera markers.
 *
 * Each marker is a solid sphere mesh (always visible through the point cloud
 * via depthTest=false) + a text label sprite above it. Sphere meshes are used
 * for raycasting — they are far more reliable than sprites.
 */
export class MarkerManager {
  private scene: THREE.Scene;
  private entries: MarkerEntry[] = [];
  private group: THREE.Group;
  private hoveredIdx = -1;
  private selectedIdx = -1;
  private sphereRadius = 0.5;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "pano-markers";
    this.scene.add(this.group);
  }

  /** Build markers from camera data. Pass worldBox for auto-scaling. */
  build(cameras: CameraData[], worldBox?: THREE.Box3) {
    this.clear();

    if (worldBox && !worldBox.isEmpty()) {
      const size = new THREE.Vector3();
      worldBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      // ~0.8% of scene size, clamped to a reasonable range
      this.sphereRadius = Math.max(0.25, Math.min(5, maxDim * 0.008));
    }

    cameras.forEach((cam, i) => {
      if (!cam.position) return;
      const { x, y, z } = cam.position;

      const mesh = this._makeSphere(MARKER_COLOR_DEFAULT);
      mesh.position.set(x, y, z);
      mesh.userData = { cameraIndex: i, cameraData: cam };
      this.group.add(mesh);

      const label = this._makeLabel(cam.name);
      label.position.set(x, y, z + this.sphereRadius * 3);
      this.group.add(label);

      this.entries.push({ mesh, label });
    });
  }

  private _makeSphere(color: number): THREE.Mesh {
    const geo = new THREE.SphereGeometry(this.sphereRadius, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
      color,
      depthTest: false,   // Always visible through the point cloud
      depthWrite: false,
      transparent: true,
      opacity: 0.92,
    });
    return new THREE.Mesh(geo, mat);
  }

  private _makeLabel(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    // Background pill
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.fill();

    // Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.substring(0, 20), 128, 34);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(this.sphereRadius * 8, this.sphereRadius * 2, 1);
    return sprite;
  }

  /** Update sphere color by index */
  private _recolor(idx: number, color: number) {
    const entry = this.entries[idx];
    if (!entry) return;
    (entry.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
  }

  setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  /** Return sphere meshes for raycasting */
  getMeshes(): THREE.Object3D[] {
    return this.entries.map(e => e.mesh);
  }

  setHovered(idx: number) {
    if (this.hoveredIdx === idx) return;
    if (this.hoveredIdx >= 0 && this.hoveredIdx !== this.selectedIdx) {
      this._recolor(this.hoveredIdx, MARKER_COLOR_DEFAULT);
    }
    this.hoveredIdx = idx;
    if (idx >= 0 && idx !== this.selectedIdx) {
      this._recolor(idx, MARKER_COLOR_HOVER);
    }
  }

  setSelected(idx: number) {
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
      (mesh.material as THREE.MeshBasicMaterial).dispose();
      mesh.geometry.dispose();
      this.group.remove(mesh);

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
    this.scene.remove(this.group);
  }
}
