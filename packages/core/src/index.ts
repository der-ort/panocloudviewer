// @der-ort/pano-cloud-viewer-core — headless point-cloud engine (no React, no UI).
// Three.js manager classes, data adapters, shared types, and formatting helpers.

// ─── Managers ─────────────────────────────────────────────────────────────────
export { SceneManager } from "./core/scene-manager";
export type { SceneManagerOptions } from "./core/scene-manager";
export { PointCloudLoader } from "./core/point-cloud-loader";
export type { ColorMode, PointCloudMetadata } from "./core/point-cloud-loader";
export { CameraAnimator } from "./core/camera-animator";
export { MarkerManager } from "./core/marker-manager";
export { MeasurementManager } from "./core/measurement-manager";
export { ExportManager } from "./core/export-manager";
export { MinimapRenderer } from "./core/minimap-renderer";
export { ClipManager } from "./core/clip-manager";
export type { ClipMode, ClipBoxEntry } from "./core/clip-manager";
export { AxisWidget } from "./core/axis-widget";
export { PresentationManager, captureScene } from "./core/presentation-manager";
export type { ViewerScene } from "./core/presentation-manager";

// ─── Data adapters ────────────────────────────────────────────────────────────
export { createAdapter, S3SourceAdapter, ElectronSourceAdapter } from "./data/file-source-adapter";
export type { FileSourceAdapter } from "./data/file-source-adapter";

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  PointCloudSource,
  S3Source,
  LocalSource,
  ElectronSource,
  CameraData,
  CameraPosition,
  CameraRotation,
  Measurement,
  MeasurementType,
  ActiveTool,
  NavigationMode,
  CameraProjection,
  ExportOptions,
  ExportView,
  ExportFormat,
  DisplayPreset,
  DisplaySettings,
  ViewerConfig,
  Theme,
  UiMode,
  PanoEngine,
} from "./types";
export { DISPLAY_PRESETS } from "./types";

// ─── Formatting helpers ───────────────────────────────────────────────────────
export {
  formatLength,
  formatArea,
  formatVolume,
  formatAngle,
  formatCoord,
  exportMeasurementsCSV,
} from "./format";
