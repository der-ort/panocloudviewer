// ─── Main component ───────────────────────────────────────────────────────────
export { PanoCloudViewer } from "./components/pano-cloud-viewer";
export type { PanoCloudViewerProps } from "./components/pano-cloud-viewer";

// ─── Providers ────────────────────────────────────────────────────────────────
export { ViewerProvider, useViewer } from "./providers/viewer-provider";
export type { ColorMode } from "./core/point-cloud-loader";
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
export { ScenesPanel } from "./components/sidebar/scenes-panel";

// ─── Toolbar ──────────────────────────────────────────────────────────────────
export { MainToolbar, ToolbarIconBtn, ToolbarSection } from "./components/toolbar/main-toolbar";
export { ViewControls } from "./components/toolbar/view-controls";
export { MeasureTools } from "./components/toolbar/measure-tools";
export { SectionTools } from "./components/toolbar/section-tools";
export { DisplayControls } from "./components/toolbar/display-controls";
export { ExportTools } from "./components/toolbar/export-tools";
export { ToolRail } from "./components/toolbar/tool-rail";

// ─── Overlays ─────────────────────────────────────────────────────────────────
export { PanoViewer } from "./components/overlays/pano-viewer";
export { AboutDialog } from "./components/overlays/about-dialog";
export { RenderingSettings } from "./components/overlays/rendering-settings";

// ─── Core managers (for advanced / headless use) ──────────────────────────────
export { SceneManager } from "./core/scene-manager";
export { PointCloudLoader } from "./core/point-cloud-loader";
export { CameraAnimator } from "./core/camera-animator";
export { MarkerManager } from "./core/marker-manager";
export { MeasurementManager } from "./core/measurement-manager";
export { ExportManager } from "./core/export-manager";
export { MinimapRenderer } from "./core/minimap-renderer";
export { ClipManager } from "./core/clip-manager";
export { AxisWidget } from "./core/axis-widget";
export type { ClipMode, ClipBoxEntry } from "./core/clip-manager";
export { PresentationManager, captureScene } from "./core/presentation-manager";
export type { ViewerScene } from "./core/presentation-manager";

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
  NavigationMode,
  CameraProjection,
  ExportOptions,
  ExportView,
  ExportFormat,
} from "./types";

// ─── Utils ────────────────────────────────────────────────────────────────────
export { cn, formatLength, formatArea, formatVolume, formatAngle, formatCoord, exportMeasurementsCSV } from "./lib/utils";

// ─── i18n ─────────────────────────────────────────────────────────────────────
export { LocaleProvider, useLocale } from "./i18n/locale-context";
export { en } from "./i18n/en";
export { de } from "./i18n/de";
export { createLocale } from "./i18n/types";
export type { ViewerLocale } from "./i18n/types";
