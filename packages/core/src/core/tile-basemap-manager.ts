import * as THREE from "three";
import type { SceneManager } from "./scene-manager";
import type { BasemapConfig } from "../types";

const DEFAULT_TILE_URL =
  "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION = "© OpenStreetMap contributors © CARTO";
const EARTH_RADIUS = 6378137; // WGS84 semi-major axis (m)
const EARTH_CIRC = 2 * Math.PI * EARTH_RADIUS;

/** Slippy-map tile helpers (web-mercator XYZ). */
function lonToTileX(lon: number, z: number): number {
  return Math.floor(((lon + 180) / 360) * 2 ** z);
}
function latToTileY(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.asinh(Math.tan(r)) / Math.PI) / 2) * 2 ** z);
}
function tileXToLon(x: number, z: number): number {
  return (x / 2 ** z) * 360 - 180;
}
function tileYToLat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

/** The four XY corners of a box (Z ignored). */
function cornersXY(b: THREE.Box3): Array<[number, number]> {
  return [
    [b.min.x, b.min.y], [b.min.x, b.max.y],
    [b.max.x, b.min.y], [b.max.x, b.max.y],
  ];
}

/** Built-in proj4 definitions for common (German) CRS used by `BasemapConfig.crs`. */
const EPSG_DEFS: Record<string, string> = {
  "EPSG:4326": "+proj=longlat +datum=WGS84 +no_defs",
  // ETRS89 / LCC Germany (N-E) — what NavVis IVION exports as
  "EPSG:4839": "+proj=lcc +lat_0=51 +lon_0=10.5 +lat_1=48.6666666666667 +lat_2=53.6666666666667 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  // ETRS89 / UTM (the modern German standard)
  "EPSG:25832": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  "EPSG:25833": "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
};

/** Resolve `crs` to a proj4 definition: a raw proj4 string, or a known EPSG code. */
function resolveCrsDef(crs: string): string | null {
  const s = crs.trim();
  if (s.includes("+proj")) return s; // already a proj4 definition
  return EPSG_DEFS[s.toUpperCase().replace(/\s+/g, "")] ?? null;
}

/**
 * Lays georeferenced raster map tiles (default Carto Voyager) on a ground plane
 * under the point cloud. Because most exports are NOT georeferenced, the common
 * path is a **manual georeference** (`BasemapConfig.georeference`) that pins the
 * cloud's local origin to a WGS84 lat/lon.
 *
 * Tiles are built in a local ENU frame (X=east, Y=north, meters / `metersPerUnit`)
 * centered on the cloud origin; the whole group is then rotated by the cloud's
 * heading and dropped to `groundZ`. A small-area equirectangular approximation
 * (valid for survey-sized scenes) converts tile lon/lat corners to local meters.
 */
export class TileBasemapManager {
  private sm: SceneManager;
  private group: THREE.Group;
  private texLoader = new THREE.TextureLoader();
  private textures: THREE.Texture[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];
  private _built = false;
  attribution = DEFAULT_ATTRIBUTION;

  constructor(sm: SceneManager) {
    this.sm = sm;
    this.group = new THREE.Group();
    this.group.name = "basemap";
    this.group.visible = false;
    this.group.renderOrder = -10; // draw before the cloud
    this.sm.scene.add(this.group);
    this.texLoader.setCrossOrigin("anonymous");
  }

  isBuilt(): boolean {
    return this._built;
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  /**
   * Build the basemap for a cloud. Dispatches on the config:
   * - `cfg.crs` → **projected mode** (cloud already in a projected CRS; tiles are
   *   reprojected with proj4 to the cloud's true coordinates).
   * - `cfg.georeference` → **manual-pin mode** (local cloud pinned to a lat/lon).
   * No-ops otherwise.
   */
  async build(worldBox: THREE.Box3, cfg: BasemapConfig | undefined): Promise<void> {
    this.clear();
    this.group.rotation.set(0, 0, 0);
    this.group.position.set(0, 0, 0);
    if (!cfg || worldBox.isEmpty()) return;
    this.attribution = cfg.attribution ?? DEFAULT_ATTRIBUTION;
    if (cfg.crs) await this._buildProjected(worldBox, cfg);
    else if (cfg.georeference) this._buildManual(worldBox, cfg);
  }

  /** Projected mode — reproject Carto tiles (proj4) to the cloud's CRS coords. */
  private async _buildProjected(worldBox: THREE.Box3, cfg: BasemapConfig): Promise<void> {
    const def = resolveCrsDef(cfg.crs!);
    if (!def) {
      console.warn(`[basemap] unknown crs "${cfg.crs}" — pass a proj4 string or a known EPSG code`);
      return;
    }
    const mod = await import("proj4");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proj4: any = (mod as any).default ?? mod;
    const toGeo = proj4(def, "EPSG:4326");  // [E,N] → [lon,lat]
    const toProj = proj4("EPSG:4326", def); // [lon,lat] → [E,N]

    const tileUrl = cfg.tileUrl ?? DEFAULT_TILE_URL;
    const maxZoom = cfg.maxZoom ?? 20;
    const groundZ = cfg.georeference?.groundZ ?? worldBox.min.z;

    // Cloud (projected/scene) corners → geographic bbox.
    let latMin = 90, latMax = -90, lonMin = 180, lonMax = -180;
    for (const [x, y] of cornersXY(worldBox)) {
      const [lon, lat] = toGeo.forward([x, y]);
      latMin = Math.min(latMin, lat); latMax = Math.max(latMax, lat);
      lonMin = Math.min(lonMin, lon); lonMax = Math.max(lonMax, lon);
    }

    const size = new THREE.Vector3();
    worldBox.getSize(size);
    const cosLat = Math.cos(((latMin + latMax) / 2) * Math.PI / 180);
    const targetTileM = Math.min(Math.max(Math.max(size.x, size.y), 20), 400);
    let z = Math.round(Math.log2((EARTH_CIRC * cosLat) / targetTileM));
    z = Math.max(1, Math.min(maxZoom, z));

    const xMin = lonToTileX(lonMin, z), xMax = lonToTileX(lonMax, z);
    const yMin = latToTileY(latMax, z), yMax = latToTileY(latMin, z);
    if ((xMax - xMin + 1) * (yMax - yMin + 1) > 64) return;

    for (let tx = xMin; tx <= xMax; tx++) {
      for (let ty = yMin; ty <= yMax; ty++) {
        // Tile NW/SE lon/lat → projected (scene) coords.
        const nw = toProj.forward([tileXToLon(tx, z), tileYToLat(ty, z)]);
        const se = toProj.forward([tileXToLon(tx + 1, z), tileYToLat(ty + 1, z)]);
        const w = se[0] - nw[0];
        const h = nw[1] - se[1];
        if (w <= 0 || h <= 0) continue;
        this._addTile(tileUrl, z, tx, ty, w, h, (nw[0] + se[0]) / 2, (nw[1] + se[1]) / 2, groundZ, 0);
      }
    }
    this._built = this.group.children.length > 0;
  }

  /** Manual-pin mode — local cloud pinned to a WGS84 lat/lon (equirectangular). */
  private _buildManual(worldBox: THREE.Box3, cfg: BasemapConfig): void {
    const geo = cfg.georeference!;
    const tileUrl = cfg.tileUrl ?? DEFAULT_TILE_URL;
    const maxZoom = cfg.maxZoom ?? 20;
    const mpu = geo.metersPerUnit ?? 1;
    const rot = ((geo.rotationDeg ?? 0) * Math.PI) / 180;
    const groundZ = geo.groundZ ?? worldBox.min.z;
    const cosLat = Math.cos((geo.lat * Math.PI) / 180);

    const size = new THREE.Vector3();
    worldBox.getSize(size);
    const targetTileM = Math.min(Math.max(Math.max(size.x, size.y) * mpu, 20), 400);
    let z = Math.round(Math.log2((EARTH_CIRC * cosLat) / targetTileM));
    z = Math.max(1, Math.min(maxZoom, z));

    const toEN = (x: number, y: number) => ({
      east: x * mpu * Math.cos(rot) + y * mpu * Math.sin(rot),
      north: -x * mpu * Math.sin(rot) + y * mpu * Math.cos(rot),
    });
    const enToGeo = (east: number, north: number) => ({
      lat: geo.lat + ((north / EARTH_RADIUS) * 180) / Math.PI,
      lon: geo.lon + ((east / (EARTH_RADIUS * cosLat)) * 180) / Math.PI,
    });
    let latMin = 90, latMax = -90, lonMin = 180, lonMax = -180;
    for (const [cx, cy] of cornersXY(worldBox)) {
      const { east, north } = toEN(cx, cy);
      const g = enToGeo(east, north);
      latMin = Math.min(latMin, g.lat); latMax = Math.max(latMax, g.lat);
      lonMin = Math.min(lonMin, g.lon); lonMax = Math.max(lonMax, g.lon);
    }

    const xMin = lonToTileX(lonMin, z), xMax = lonToTileX(lonMax, z);
    const yMin = latToTileY(latMax, z), yMax = latToTileY(latMin, z);
    if ((xMax - xMin + 1) * (yMax - yMin + 1) > 64) return;

    const deg2rad = Math.PI / 180;
    const geoToEnu = (lat: number, lon: number) => ({
      east: (lon - geo.lon) * deg2rad * EARTH_RADIUS * cosLat,
      north: (lat - geo.lat) * deg2rad * EARTH_RADIUS,
    });
    for (let tx = xMin; tx <= xMax; tx++) {
      for (let ty = yMin; ty <= yMax; ty++) {
        const nw = geoToEnu(tileYToLat(ty, z), tileXToLon(tx, z));
        const se = geoToEnu(tileYToLat(ty + 1, z), tileXToLon(tx + 1, z));
        const w = (se.east - nw.east) / mpu;
        const h = (nw.north - se.north) / mpu;
        if (w <= 0 || h <= 0) continue;
        this._addTile(tileUrl, z, tx, ty, w, h, (nw.east + se.east) / 2 / mpu, (nw.north + se.north) / 2 / mpu, 0, 0);
      }
    }
    // ENU → cloud frame: rotate by the heading, drop to groundZ.
    this.group.rotation.set(0, 0, -rot);
    this.group.position.set(0, 0, groundZ);
    this._built = this.group.children.length > 0;
  }

  /** Create one tile plane (grey placeholder) and load its texture. */
  private _addTile(
    tileUrl: string, z: number, tx: number, ty: number,
    w: number, h: number, cx: number, cy: number, meshZ: number, rotZ: number,
  ): void {
    const gmat = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x808080, // grey until the tile texture loads
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(gmat, mat);
    mesh.position.set(cx, cy, meshZ);
    mesh.rotation.z = rotZ;
    mesh.renderOrder = -10;
    this.group.add(mesh);
    this.geometries.push(gmat);
    this.materials.push(mat);

    const url = tileUrl
      .replace("{z}", String(z))
      .replace("{x}", String(tx))
      .replace("{y}", String(ty))
      .replace("{s}", "a")
      .replace("{r}", "");
    this.texLoader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.LinearSRGBColorSpace; // pass-through (renderer outputs LinearSRGB)
        tex.minFilter = THREE.LinearFilter;
        mat.map = tex;
        mat.color.setHex(0xffffff);
        mat.needsUpdate = true;
        this.textures.push(tex);
      },
      undefined,
      () => { /* tile fetch failed — leave the grey placeholder */ },
    );
  }

  clear(): void {
    for (const m of this.group.children.slice()) this.group.remove(m);
    for (const t of this.textures) t.dispose();
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    this.textures = [];
    this.geometries = [];
    this.materials = [];
    this._built = false;
  }

  dispose(): void {
    this.clear();
    this.sm.scene.remove(this.group);
  }
}
