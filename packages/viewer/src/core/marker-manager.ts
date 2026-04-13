import * as THREE from "three";
import type { CameraData } from "../types";

const MARKER_COLOR_DEFAULT = 0xdcd546;  // brand yellow-green
const MARKER_COLOR_HOVER   = 0xffffff;
const MARKER_COLOR_SELECTED= 0x9b94ff;  // brand purple
const MARKER_RADIUS = 0.4;

/** Creates and manages 3D sphere markers for panorama camera positions */
export class MarkerManager {
  private scene: THREE.Scene;
  private markers: THREE.Mesh[] = [];
  private labels: THREE.Sprite[] = [];
  private group: THREE.Group;
  private hoveredIdx = -1;
  private selectedIdx = -1;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "pano-markers";
    this.scene.add(this.group);
  }

  /** Build markers from camera data (only cameras with position) */
  build(cameras: CameraData[]) {
    this.clear();
    cameras.forEach((cam, i) => {
      if (!cam.position) return;
      const { x, y, z } = cam.position;

      // Sphere
      const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: MARKER_COLOR_DEFAULT,
        emissive: MARKER_COLOR_DEFAULT,
        emissiveIntensity: 0.4,
        roughness: 0.4,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z + MARKER_RADIUS);
      mesh.userData = { cameraIndex: i, cameraData: cam };
      this.group.add(mesh);
      this.markers.push(mesh);

      // Text label sprite
      const sprite = this.makeLabel(cam.name);
      sprite.position.set(x, y, z + MARKER_RADIUS * 3 + 0.5);
      sprite.scale.set(4, 1, 1);
      sprite.userData = { cameraIndex: i };
      this.group.add(sprite);
      this.labels.push(sprite);
    });
  }

  private makeLabel(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.roundRect(2, 2, 252, 60, 8);
    ctx.fill();
    ctx.fillStyle = "#DCD546";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.substring(0, 20), 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    return new THREE.Sprite(mat);
  }

  setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  /** Return all marker meshes for raycasting */
  getMeshes(): THREE.Object3D[] {
    return this.markers;
  }

  setHovered(idx: number) {
    if (this.hoveredIdx === idx) return;
    if (this.hoveredIdx >= 0 && this.markers[this.hoveredIdx]) {
      (this.markers[this.hoveredIdx].material as THREE.MeshStandardMaterial)
        .color.setHex(this.hoveredIdx === this.selectedIdx ? MARKER_COLOR_SELECTED : MARKER_COLOR_DEFAULT);
    }
    this.hoveredIdx = idx;
    if (idx >= 0 && this.markers[idx]) {
      (this.markers[idx].material as THREE.MeshStandardMaterial).color.setHex(MARKER_COLOR_HOVER);
    }
  }

  setSelected(idx: number) {
    if (this.selectedIdx >= 0 && this.markers[this.selectedIdx]) {
      (this.markers[this.selectedIdx].material as THREE.MeshStandardMaterial)
        .color.setHex(MARKER_COLOR_DEFAULT);
    }
    this.selectedIdx = idx;
    if (idx >= 0 && this.markers[idx]) {
      (this.markers[idx].material as THREE.MeshStandardMaterial).color.setHex(MARKER_COLOR_SELECTED);
    }
  }

  clear() {
    this.markers.forEach(m => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
      this.group.remove(m);
    });
    this.labels.forEach(s => {
      (s.material as THREE.SpriteMaterial).map?.dispose();
      (s.material as THREE.Material).dispose();
      this.group.remove(s);
    });
    this.markers = [];
    this.labels = [];
    this.hoveredIdx = -1;
    this.selectedIdx = -1;
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
}
