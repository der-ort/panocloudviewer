// ─── Main component ───────────────────────────────────────────────────────────
export { PanoCloudViewer } from "./components/pano-cloud-viewer";
export type { PanoCloudViewerProps } from "./components/pano-cloud-viewer";

// ─── Providers ────────────────────────────────────────────────────────────────
export { ViewerProvider, useViewer } from "./providers/viewer-provider";
export { ThemeProvider, useTheme } from "./providers/theme-provider";
export { DataProvider, useData } from "./providers/data-provider";

// ─── Layout ───────────────────────────────────────────────────────────────────
export { WorkspaceLayout } from "./components/workspace-layout";

// ─── Viewport ─────────────────────────────────────────────────────────────────
export { Viewport } from "./components/viewport";

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export { Sidebar } from "./components/sidebar/sidebar";
export { PanoPanel } from "./components/sidebar/pano-panel";
export { ScenePanel } from "./components/sidebar/scene-panel";
export { MeasurementsPanel } from "./components/sidebar/measurements-panel";
export { ClassificationPanel } from "./components/sidebar/classification-panel";

// ─── Toolbar ──────────────────────────────────────────────────────────────────
export { MainToolbar, ToolbarIconBtn, ToolbarSection } from "./components/toolbar/main-toolbar";
export { ViewControls } from "./components/toolbar/view-controls";
export { MeasureTools } from "./components/toolbar/measure-tools";
export { SectionTools } from "./components/toolbar/section-tools";
export { DisplayControls } from "./components/toolbar/display-controls";
export { ExportTools } from "./components/toolbar/export-tools";

// ─── Overlays ─────────────────────────────────────────────────────────────────
export { PanoViewer } from "./components/overlays/pano-viewer";
export { AboutDialog } from "./components/overlays/about-dialog";

// ─── Core managers (for advanced / headless use) ──────────────────────────────
export { SceneManager } from "./core/scene-manager";
export { PointCloudLoader } from "./core/point-cloud-loader";
export { CameraAnimator } from "./core/camera-animator";
export { MarkerManager } from "./core/marker-manager";
export { MeasurementManager } from "./core/measurement-manager";
export { ExportManager } from "./core/export-manager";
export { MinimapRenderer } from "./core/minimap-renderer";

// ─── Data adapters ────────────────────────────────────────────────────────────
export { createAdapter, S3SourceAdapter, ElectronSourceAdapter } from "./data/file-source-adapter";

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  PointCloudSource,
  S3Source,
  LocalSource,
  ElectronSource,
  CameraData,
  Measurement,
  MeasurementType,
  ActiveTool,
  ExportOptions,
  ExportView,
  ExportFormat,
} from "./types";

// ─── Utils ────────────────────────────────────────────────────────────────────
export { cn, formatLength, formatArea, formatVolume, formatAngle, formatCoord, exportMeasurementsCSV } from "./lib/utils";
