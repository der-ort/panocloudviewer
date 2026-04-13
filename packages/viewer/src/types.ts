import type * as THREE from "three";

// ── Source adapters ──────────────────────────────────────────

export interface S3Source {
  type: "s3";
  /** Base URL for all point cloud files, ending with "/" */
  baseUrl: string;
  /** Optional auth headers (e.g. { Authorization: "Bearer ..." }) */
  headers?: Record<string, string>;
}

export interface LocalSource {
  type: "local";
  /** Absolute path to the point cloud folder (Electron only) */
  basePath: string;
}

export interface ElectronSource {
  type: "electron";
  /** Absolute path to the point cloud folder */
  basePath: string;
}

export type PointCloudSource = S3Source | LocalSource | ElectronSource;

// ── Camera / panorama data ───────────────────────────────────

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface CameraRotation {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface CameraData {
  name: string;
  index: number;
  image: string | null;
  representation?: "sphericalRepresentation" | "pinholeRepresentation" | "cylindricalRepresentation";
  position?: CameraPosition;
  rotation?: CameraRotation;
  yaw_deg?: number;
  description?: string;
  position_source?: "scan" | "image";
  _project?: string;
}

// ── Measurements ─────────────────────────────────────────────

export type MeasurementType =
  | "point"
  | "distance"
  | "height"
  | "area"
  | "volume"
  | "angle"
  | "profile";

export interface Measurement {
  id: string;
  type: MeasurementType;
  label: string;
  points: THREE.Vector3[];
  /** Computed result value (meters, m², m³, radians depending on type) */
  value?: number;
  color: string;
  visible: boolean;
  selected: boolean;
}

// ── Sections / clipping ──────────────────────────────────────

export type SectionType = "box" | "plane";

export interface ClipSection {
  id: string;
  type: SectionType;
  label: string;
  visible: boolean;
  active: boolean;
  /** For box: center + dimensions. For plane: position + normal. */
  transform: THREE.Matrix4;
}

// ── Export ───────────────────────────────────────────────────

export type ExportView = "top" | "front" | "side" | "back" | "custom";
export type ExportFormat = "png" | "jpeg";

export interface ExportOptions {
  view: ExportView;
  scale: 1 | 2 | 4;
  background: "white" | "black" | "transparent";
  showScaleBar: boolean;
  format: ExportFormat;
  quality?: number; // 0-1, jpeg only
}

// ── Viewer config ─────────────────────────────────────────────

export type Theme = "dark" | "light" | "system";

export interface ViewerConfig {
  source: PointCloudSource;
  theme?: Theme;
  /** Initial point budget (default: 2_000_000) */
  pointBudget?: number;
  /** Show minimap (default: true) */
  showMinimap?: boolean;
  /** Enable panorama sidebar (default: true) */
  enablePanoramas?: boolean;
  /** Custom class name for the root element */
  className?: string;
  /** Called when a camera marker is selected */
  onCameraSelect?: (camera: CameraData) => void;
  /** Called when a measurement is created/updated */
  onMeasurementChange?: (measurements: Measurement[]) => void;
}

// ── Viewer state (context) ───────────────────────────────────

export interface ViewerState {
  pointBudget: number;
  pointSize: number;
  edlEnabled: boolean;
  edlStrength: number;
  theme: Theme;
  activeTool: ActiveTool;
  fps: number;
  pointCount: number;
  loadedPointCount: number;
}

export type ActiveTool =
  | "none"
  | "measure-point"
  | "measure-distance"
  | "measure-height"
  | "measure-area"
  | "measure-volume"
  | "measure-angle"
  | "measure-profile"
  | "section-box"
  | "section-plane"
  | "annotate";
