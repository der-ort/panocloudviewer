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
   * Build the basemap for a cloud. Requires `cfg.georeference` (manual pin) and a
   * non-empty world box. No-ops otherwise.
   */
  build(worldBox: THREE.Box3, cfg: BasemapConfig | undefined): void {
    this.clear();
    const geo = cfg?.georeference;
    if (!geo || worldBox.isEmpty()) return;

    const tileUrl = cfg?.tileUrl ?? DEFAULT_TILE_URL;
    this.attribution = cfg?.attribution ?? DEFAULT_ATTRIBUTION;
    const maxZoom = cfg?.maxZoom ?? 20;
    const mpu = geo.metersPerUnit ?? 1;
    const rot = ((geo.rotationDeg ?? 0) * Math.PI) / 180;
    const groundZ = geo.groundZ ?? worldBox.min.z;
    const cosLat = Math.cos((geo.lat * Math.PI) / 180);

    // Cloud → geographic (equirectangular around the origin lat/lon).
    const size = new THREE.Vector3();
    worldBox.getSize(size);
    const extentM = Math.max(size.x, size.y) * mpu;

    // Pick a zoom whose tiles are ~the size of the scene (clamped to provider max).
    const targetTileM = Math.min(Math.max(extentM, 20), 400);
    let z = Math.round(Math.log2((EARTH_CIRC * cosLat) / targetTileM));
    z = Math.max(1, Math.min(maxZoom, z));

    // Local cloud (x,y) → ENU east/north (meters). rot = +Y heading CW from north.
    const toEN = (x: number, y: number) => {
      const xm = x * mpu;
      const ym = y * mpu;
      return {
        east: xm * Math.cos(rot) + ym * Math.sin(rot),
        north: -xm * Math.sin(rot) + ym * Math.cos(rot),
      };
    };
    const enToGeo = (east: number, north: number) => ({
      lat: geo.lat + ((north / EARTH_RADIUS) * 180) / Math.PI,
      lon: geo.lon + ((east / (EARTH_RADIUS * cosLat)) * 180) / Math.PI,
    });

    // Geographic bbox covering the cloud's footprint.
    let latMin = 90, latMax = -90, lonMin = 180, lonMax = -180;
    for (const [cx, cy] of [
      [worldBox.min.x, worldBox.min.y],
      [worldBox.min.x, worldBox.max.y],
      [worldBox.max.x, worldBox.min.y],
      [worldBox.max.x, worldBox.max.y],
    ]) {
      const { east, north } = toEN(cx, cy);
      const g = enToGeo(east, north);
      latMin = Math.min(latMin, g.lat); latMax = Math.max(latMax, g.lat);
      lonMin = Math.min(lonMin, g.lon); lonMax = Math.max(lonMax, g.lon);
    }

    const xMin = lonToTileX(lonMin, z);
    const xMax = lonToTileX(lonMax, z);
    const yMin = latToTileY(latMax, z); // north → smaller y
    const yMax = latToTileY(latMin, z);

    // Safety: never request an absurd number of tiles.
    if ((xMax - xMin + 1) * (yMax - yMin + 1) > 64) return;

    // Build each tile as an axis-aligned plane in the ENU frame.
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

        const cxLocal = (nw.east + se.east) / 2 / mpu;
        const cyLocal = (nw.north + se.north) / 2 / mpu;

        const gmat = new THREE.PlaneGeometry(w, h);
        const mat = new THREE.MeshBasicMaterial({
          color: 0x808080, // grey placeholder until the tile texture loads
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(gmat, mat);
        mesh.position.set(cxLocal, cyLocal, 0);
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
            // sRGB PNG written straight through (renderer outputs LinearSRGB).
            tex.colorSpace = THREE.LinearSRGBColorSpace;
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
    }

    // ENU → cloud frame: rotate by the heading, then sit at groundZ.
    this.group.rotation.set(0, 0, -rot);
    this.group.position.set(0, 0, groundZ);
    this._built = this.group.children.length > 0;
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
