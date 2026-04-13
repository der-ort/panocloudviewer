import * as THREE from "three";
import type { FileSourceAdapter } from "../data/file-source-adapter";
import type { SceneManager } from "./scene-manager";

export interface PointCloudMetadata {
  name: string;
  points: number;
  boundingBox: { min: [number, number, number]; max: [number, number, number] };
  spacing?: number;
  version?: string;
}

/** Loads Potree 2.0 point clouds (octree.bin + hierarchy.bin + metadata.json) via potree-core */
export class PointCloudLoader {
  private sceneManager: SceneManager;
  private adapter: FileSourceAdapter;
  private currentClouds: THREE.Object3D[] = [];

  constructor(sceneManager: SceneManager, adapter: FileSourceAdapter) {
    this.sceneManager = sceneManager;
    this.adapter = adapter;
  }

  /** Load a point cloud from the adapter's base URL */
  async load(metadataPath = "metadata.json", pointBudget = 2_000_000): Promise<void> {
    // Lazy-import potree-core (client-only, heavy)
    const { Potree } = await import("potree-core");

    if (!this.sceneManager.potree) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.sceneManager.potree = new (Potree as any)();
    }

    // Clear existing clouds
    this.clear();

    const urlResolver = (relPath: string) => this.adapter.resolveUrl(relPath);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const potree = this.sceneManager.potree as any;
    potree.pointBudget = pointBudget;

    const pointCloud = await potree.loadPointCloud(
      metadataPath,
      urlResolver
    );

    pointCloud.material.size = 1.5;
    pointCloud.material.pointSizeType = 0; // ADAPTIVE
    pointCloud.material.shape = 2; // CIRCLE

    this.sceneManager.scene.add(pointCloud);
    this.sceneManager.pointClouds.push(pointCloud);
    this.currentClouds.push(pointCloud as THREE.Object3D);

    // Fit camera to cloud
    const box = new THREE.Box3().setFromObject(pointCloud as THREE.Object3D);
    if (!box.isEmpty()) {
      this.sceneManager.fitToBox(box);
    }
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
  setPointBudget(budget: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (this.sceneManager.potree) (this.sceneManager.potree as any).pointBudget = budget;
  }

  /** Set point size on all loaded clouds */
  setPointSize(size: number) {
    for (const cloud of this.currentClouds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mat = (cloud as any).material;
      if (mat) mat.size = size;
    }
  }

  /** Read metadata.json from adapter */
  async readMetadata(path = "metadata.json"): Promise<PointCloudMetadata | null> {
    try {
      return await this.adapter.fetchJson<PointCloudMetadata>(path);
    } catch {
      return null;
    }
  }

  /** Return the first loaded point cloud object, if any */
  getPointCloud(): THREE.Object3D | null {
    return this.currentClouds[0] ?? null;
  }

  /** Calculate optimal point budget based on total point count */
  static calcOptimalBudget(totalPoints: number): number {
    const ratio = totalPoints < 5_000_000 ? 0.3 : totalPoints < 50_000_000 ? 0.15 : 0.08;
    const raw = Math.round(totalPoints * ratio);
    return Math.min(Math.max(Math.round(raw / 100_000) * 100_000, 500_000), 10_000_000);
  }
}
