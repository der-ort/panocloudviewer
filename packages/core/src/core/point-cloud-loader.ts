import * as THREE from "three";
import type { FileSourceAdapter } from "../data/file-source-adapter";
import type { SceneManager } from "./scene-manager";

export type ColorMode = "rgb" | "height" | "intensity" | "intensity_gradient" | "classification" | "return_number" | "source";

export interface PointCloudMetadata {
  name: string;
  points: number;
  boundingBox: { min: [number, number, number]; max: [number, number, number] };
  spacing?: number;
  version?: string;
  /** Coordinate reference system (proj4/WKT/EPSG). Empty/absent = not georeferenced. */
  projection?: string;
  offset?: [number, number, number];
  scale?: [number, number, number];
}

/** Georeference status of a loaded cloud (surfaced in the cloud info / About). */
export interface GeoInfo {
  /** True when the cloud carries a non-empty CRS in metadata.json. */
  georeferenced: boolean;
  /** The raw CRS string (proj4/WKT/EPSG), or "" when absent. */
  projection: string;
}

/** Loads Potree 2.0 point clouds (octree.bin + hierarchy.bin + metadata.json) via potree-core */
export class PointCloudLoader {
  private sceneManager: SceneManager;
  private adapter: FileSourceAdapter;
  private currentClouds: THREE.Object3D[] = [];
  private hasRgb = false;
  /** CRS string from metadata.json (empty = not georeferenced). */
  private _projection = "";
  /** World-space bounding box of the loaded point cloud (available after load) */
  worldBox: THREE.Box3 = new THREE.Box3();

  constructor(sceneManager: SceneManager, adapter: FileSourceAdapter) {
    this.sceneManager = sceneManager;
    this.adapter = adapter;
  }

  /** Point budget actually applied by the last load() (auto-derived or explicit). */
  appliedBudget = 2_000_000;

  /**
   * Load a point cloud from the adapter's base URL.
   * @param pointBudget Explicit budget. When omitted, the budget is derived
   *                    from the cloud's total point count via
   *                    {@link PointCloudLoader.calcOptimalBudget} — no fixed cap.
   */
  async load(metadataPath = "metadata.json", pointBudget?: number): Promise<void> {
    // Lazy-import potree-core (client-only, heavy)
    const { Potree, PointColorType } = await import("potree-core");

    if (!this.sceneManager.potree) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.sceneManager.potree = new (Potree as any)();
    }

    // Clear existing clouds
    this.clear();

    // potree-core loadPointCloud accepts either a base URL string
    // or a RequestManager { fetch, getUrl }. Build the appropriate one.
    const requestManager = {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        this.adapter.fetchWithHeaders
          ? this.adapter.fetchWithHeaders(input, init)
          : fetch(input, init),
      getUrl: (url: string) => Promise.resolve(this.adapter.resolveUrl(url)),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const potree = this.sceneManager.potree as any;

    // Read metadata up-front: RGB detection, CRS, and the total point count
    // that drives the automatic budget.
    let hasRgb = false;
    let totalPoints = 0;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = await this.adapter.fetchJson<any>(metadataPath);
      const attributes: Array<{ name: string }> = meta?.attributes ?? [];
      hasRgb = attributes.some((a) => {
        const n = (a.name ?? "").toLowerCase();
        return n === "rgb" || n === "rgba" || n === "color";
      });
      // Capture the CRS so consumers can tell whether the cloud is georeferenced.
      this._projection = typeof meta?.projection === "string" ? meta.projection.trim() : "";
      totalPoints = typeof meta?.points === "number" ? meta.points : 0;
    } catch {
      hasRgb = false;
    }
    this.hasRgb = hasRgb;

    // No explicit budget → scale it to the cloud instead of a fixed default,
    // so big clouds aren't artificially starved and small ones aren't padded.
    const budget = pointBudget
      ?? (totalPoints > 0 ? PointCloudLoader.calcOptimalBudget(totalPoints) : 2_000_000);
    this.appliedBudget = budget;
    potree.pointBudget = budget;

    const pointCloud = await potree.loadPointCloud(
      metadataPath,
      requestManager
    );

    pointCloud.material.size = 1.0; // smaller default → crisper (raise via UI)
    pointCloud.material.pointSizeType = 2; // ADAPTIVE
    pointCloud.material.shape = 1; // CIRCLE

    if (hasRgb) {
      // Keep newFormat as set by loader; use RGB color type
      pointCloud.material.pointColorType = PointColorType.RGB;
    } else {
      pointCloud.material.newFormat = false;
      pointCloud.material.pointColorType = PointColorType.HEIGHT;
    }
    // potree-core default: inputColorEncoding=SRGB, outputColorEncoding=LINEAR.
    // This triggers `fromLinear(vColor)` in the vertex shader which double-encodes
    // sRGB data and causes extreme brightness. Setting outputColorEncoding=SRGB (1)
    // ensures neither conversion condition fires, so sRGB data passes through as-is.
    pointCloud.material.outputColorEncoding = 1; // ColorEncoding.SRGB
    pointCloud.material.needsUpdate = true;

    this.sceneManager.scene.add(pointCloud);
    this.sceneManager.pointClouds.push(pointCloud);
    this.currentClouds.push(pointCloud as THREE.Object3D);

    // Fit camera to cloud
    const box = pointCloud.pcoGeometry?.boundingBox ?? pointCloud.boundingBox;
    const tightBox = pointCloud.pcoGeometry?.tightBoundingBox ?? box;
    const offset = pointCloud.pcoGeometry?.offset;

    // Build world-space bounding box
    const worldBox = new THREE.Box3();
    if (tightBox && offset) {
      worldBox.copy(tightBox);
      worldBox.min.add(offset);
      worldBox.max.add(offset);
    } else if (box) {
      worldBox.copy(box);
    } else {
      worldBox.setFromObject(pointCloud as THREE.Object3D);
    }

    this.worldBox = worldBox.clone();

    if (!worldBox.isEmpty()) {
      this.sceneManager.fitToBox(worldBox);

      // Set height range for elevation-based coloring
      const zMin = worldBox.min.z;
      const zMax = worldBox.max.z;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mat = (pointCloud as any).material;
      if (mat) {
        mat.heightMin = zMin;
        mat.heightMax = zMax;
        // Improve default RGB appearance
        mat.rgbGamma = 1.0;
        mat.rgbBrightness = 0;
        mat.rgbContrast = 0;
      }
    }
  }

  /** Set color mode on all loaded clouds */
  async setColorMode(mode: ColorMode): Promise<void> {
    const { PointColorType } = await import("potree-core");
    for (const cloud of this.currentClouds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mat = (cloud as any).material;
      if (!mat) continue;

      // Ensure height range is always set
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
      // Preserve fix: prevent double-gamma encoding (see load() for explanation)
      mat.outputColorEncoding = 1; // ColorEncoding.SRGB
      mat.needsUpdate = true;
    }
  }

  /** Whether the loaded cloud has RGB data */
  get hasRgbData(): boolean {
    return this.hasRgb;
  }

  /** CRS string from metadata.json ("" when not georeferenced). */
  get projection(): string {
    return this._projection;
  }

  /** Whether the cloud carries a non-empty CRS. */
  get isGeoreferenced(): boolean {
    return this._projection.length > 0;
  }

  /** Georeference status for the cloud info / About dialog. */
  getGeoInfo(): GeoInfo {
    return { georeferenced: this.isGeoreferenced, projection: this._projection };
  }

  /** Remove all loaded point clouds from scene, releasing their GPU buffers. */
  clear() {
    for (const cloud of this.currentClouds) {
      this.sceneManager.scene.remove(cloud);
      // Best-effort: potree octrees hold GPU geometry. dispose() isn't part of
      // potree-core's typed surface, so guard the call; skipping it leaks VRAM
      // across project switches.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      try { (cloud as any).dispose?.(); } catch { /* not all potree builds implement dispose */ }
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

  /** Set point shape: 0=SQUARE, 1=CIRCLE, 2=PARABOLOID */
  setPointShape(shape: number) {
    for (const cloud of this.currentClouds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mat = (cloud as any).material;
      if (mat) {
        mat.shape = shape;
        mat.needsUpdate = true;
      }
    }
  }

  /** Set point size type: 0=FIXED, 1=ATTENUATED, 2=ADAPTIVE */
  setPointSizeType(type: number) {
    for (const cloud of this.currentClouds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mat = (cloud as any).material;
      if (mat) {
        mat.pointSizeType = type;
        mat.needsUpdate = true;
      }
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

  /**
   * Calculate an optimal point budget from the total point count.
   * Proportional (30% / 15% / 8% by cloud size), floored at 500K, and never
   * above the cloud's own total — no fixed upper cap, so large clouds aren't
   * artificially starved.
   */
  static calcOptimalBudget(totalPoints: number): number {
    const ratio = totalPoints < 5_000_000 ? 0.3 : totalPoints < 50_000_000 ? 0.15 : 0.08;
    const raw = Math.round(totalPoints * ratio / 100_000) * 100_000;
    return Math.min(Math.max(raw, 500_000), Math.max(totalPoints, 500_000));
  }
}
