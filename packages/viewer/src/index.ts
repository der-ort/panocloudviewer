// ─── Headless core (managers, adapters, types, formats) ──────────────────────
// Re-exported so existing imports like `import { SceneManager, useViewer }` from
// "@der-ort/pano-cloud-viewer" keep working. Core is bundled into this package's
// dist at build time (tsup noExternal), so consumers never resolve it separately.
export * from "@der-ort/pano-cloud-viewer-core";

// ─── Main component ───────────────────────────────────────────────────────────
export { PanoCloudViewer, usePcvRoot } from "./components/pano-cloud-viewer";
export type { PanoCloudViewerProps } from "./components/pano-cloud-viewer";

// ─── Version / build identity ─────────────────────────────────────────────────
// Read these to confirm which viewer build a consuming app actually shipped.
export { PCV_VERSION, PCV_BUILD, PCV_VERSION_STRING } from "./version";

// ─── Providers ────────────────────────────────────────────────────────────────
export { ViewerProvider, useViewer, useFps } from "./providers/viewer-provider";
export { ThemeProvider, useTheme } from "./providers/theme-provider";
export { DataProvider, useData } from "./providers/data-provider";

// ─── Layout ───────────────────────────────────────────────────────────────────
export { WorkspaceLayout } from "./components/workspace-layout";

// ─── Layouts ─────────────────────────────────────────────────────────────────
export { MinimalLayout, WorkstationLayout, FloatingPalette, CollapsibleSidebar } from "./layouts";

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
export { ClipToolbar } from "./components/toolbar/clip-toolbar";

// ─── Overlays ─────────────────────────────────────────────────────────────────
export { PanoViewer } from "./components/overlays/pano-viewer";
export { AboutDialog } from "./components/overlays/about-dialog";
export { RenderingSettings } from "./components/overlays/rendering-settings";
export { DisplaySettingsDialog } from "./components/overlays/display-settings-dialog";

// ─── Action hooks (for custom UIs) ───────────────────────────────────────────
export {
  useNavigationActions,
  useMeasurementActions,
  useClipActions,
  useDisplayActions,
  useExportActions,
  useVisibilityActions,
  useDisplaySettings,
} from "./hooks";
export { useDraggable } from "./hooks/use-draggable";
export type { DraggableState, UseDraggableOptions } from "./hooks/use-draggable";

// ─── Utils ────────────────────────────────────────────────────────────────────
// Formatting helpers come from the core wildcard above; cn() is UI-only.
export { cn } from "./lib/utils";

// ─── i18n ─────────────────────────────────────────────────────────────────────
export { LocaleProvider, useLocale } from "./i18n/locale-context";
export { en } from "./i18n/en";
export { de } from "./i18n/de";
export { createLocale } from "./i18n/types";
export type { ViewerLocale } from "./i18n/types";

// ─── UI Primitives (shadcn-style) ─────────────────────────────────────────────
export * from "./ui";

// ─── Component slot system ───────────────────────────────────────────────────
export {
  ComponentsProvider,
  useComponents,
  defaultComponents,
} from "./providers/components-provider";
export type {
  ViewerComponents,
  ComponentsProviderProps,
} from "./providers/components-provider";
