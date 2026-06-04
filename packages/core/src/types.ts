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
  /** Low-res thumbnail URL for sidebar lists (falls back to image if absent) */
  thumbnail?: string | null;
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
  /** For volume measurements: the defining box (serializable) */
  box?: { min: [number, number, number]; max: [number, number, number] };
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

export type UiMode = "professional" | "lite";

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
  /** Display settings overrides (marker/measurement sizing) */
  displaySettings?: Partial<DisplaySettings>;
  /**
   * UI complexity mode.
   * - "professional" (default): full toolset — all measurements, clipping, display controls, export, all sidebar tabs.
   * - "lite": beginner set — nav modes, basic measurements (point/distance/height), panorama/minimap/theme toggles only.
   */
  uiMode?: UiMode;
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

export type NavigationMode = "orbit" | "fly" | "earth";
export type CameraProjection = "perspective" | "orthographic";

// ── Display settings ────────────────────────────────────────

export type DisplayPreset = "compact" | "standard" | "prominent";

export interface DisplaySettings {
  preset: DisplayPreset;
  /** Measurement line width in pixels */
  measurementLineWidth: number;
  /** Measurement label scale multiplier (1.0 = default) */
  measurementLabelScale: number;
  /** Measurement sphere radius in world units */
  measurementSphereRadius: number;
  /** Marker sphere scale multiplier on auto-calculated radius */
  markerSphereScale: number;
  /** Marker sphere opacity (0-1) */
  markerSphereOpacity: number;
  /** Marker label scale multiplier */
  markerLabelScale: number;
}

export const DISPLAY_PRESETS: Record<DisplayPreset, DisplaySettings> = {
  compact: {
    preset: "compact",
    measurementLineWidth: 1,
    measurementLabelScale: 0.6,
    measurementSphereRadius: 0.08,
    markerSphereScale: 0.5,
    markerSphereOpacity: 0.7,
    markerLabelScale: 0.5,
  },
  standard: {
    preset: "standard",
    measurementLineWidth: 2,
    measurementLabelScale: 1.0,
    measurementSphereRadius: 0.15,
    markerSphereScale: 1.0,
    markerSphereOpacity: 0.92,
    markerLabelScale: 1.0,
  },
  prominent: {
    preset: "prominent",
    measurementLineWidth: 4,
    measurementLabelScale: 1.6,
    measurementSphereRadius: 0.3,
    markerSphereScale: 2.0,
    markerSphereOpacity: 1.0,
    markerLabelScale: 1.5,
  },
};
