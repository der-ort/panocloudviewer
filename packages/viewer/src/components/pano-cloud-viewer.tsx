"use client";

import React, { createContext, useContext, useRef, useCallback, Suspense, lazy } from "react";
import { ThemeProvider, useTheme } from "../providers/theme-provider";
import { ViewerProvider, useViewer } from "../providers/viewer-provider";
import { DataProvider } from "../providers/data-provider";
import { LocaleProvider } from "../i18n/locale-context";
import { WorkspaceLayout } from "./workspace-layout";
import { PanoViewer } from "./overlays/pano-viewer";
import { createAdapter } from "@der-ort/pano-cloud-viewer-core";
import type { PointCloudSource, UiMode } from "@der-ort/pano-cloud-viewer-core";
import type { ViewerLocale } from "../i18n/types";
import { cn } from "../lib/utils";

const Viewport = lazy(() => import("./viewport").then(m => ({ default: m.Viewport })));

/**
 * Context that exposes the `.pcv` root element so portalled content
 * (Radix Dialog.Portal, createPortal) can render inside the scoped CSS boundary.
 */
const PcvRootContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

/**
 * Returns a ref to the `.pcv` root element.
 * Use this as the `container` prop for Radix Portal and createPortal so that
 * portalled content inherits the viewer's scoped CSS custom properties.
 *
 * @example
 * function MyDialog() {
 *   const pcvRef = usePcvRoot();
 *   return (
 *     <Dialog.Portal container={pcvRef?.current ?? undefined}>
 *       ...
 *     </Dialog.Portal>
 *   );
 * }
 */
export function usePcvRoot(): React.RefObject<HTMLDivElement | null> | null {
  return useContext(PcvRootContext);
}

export interface PanoCloudViewerProps {
  /** Data source: S3 bucket, local path, or Electron IPC */
  source: PointCloudSource;
  /** Initial theme. Defaults to "dark". */
  theme?: "light" | "dark";
  /** CSS class applied to the root element */
  className?: string;
  /**
   * Override UI strings for internationalisation.
   * Import a built-in locale (`en`, `de`) or supply a custom `ViewerLocale` object.
   * Defaults to English when omitted.
   *
   * @example
   * import { de } from '@der-ort/pano-cloud-viewer/i18n';
   * <PanoCloudViewer locale={de} ... />
   */
  locale?: ViewerLocale;
  /**
   * UI complexity mode.
   * - `"professional"` (default): full toolset — all measurements, clipping, display controls, export, all sidebar tabs.
   * - `"lite"`: beginner set — nav modes, basic measurements, panorama/minimap/theme toggles only.
   */
  uiMode?: UiMode;
  /**
   * Custom UI via render prop. Receives the viewport element that must be rendered.
   * When omitted, the default WorkspaceLayout is used.
   *
   * @example
   * <PanoCloudViewer source={source}>
   *   {(viewport) => (
   *     <div className="relative w-full h-full">
   *       {viewport}
   *       <MyToolbar />
   *     </div>
   *   )}
   * </PanoCloudViewer>
   */
  children?: (viewport: React.ReactNode) => React.ReactNode;
}

function ViewportFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">Initialising renderer…</p>
      </div>
    </div>
  );
}

function PanoOverlayBridge() {
  const { selectedCamera } = useViewer();
  if (!selectedCamera) return null;
  return <PanoViewer />;
}

interface PcvRootProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Inner wrapper rendered inside ThemeProvider so it can read `useTheme()`.
 * Applies the `pcv` scoping class and the resolved theme class to the root div,
 * ensuring all CSS tokens and Tailwind `dark:` variants are scoped to this element.
 * Also exposes a ref to this element via PcvRootContext so portalled content
 * (Radix Dialog.Portal, createPortal) can be anchored inside the CSS scope.
 */
function PcvRoot({ className, children }: PcvRootProps) {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <PcvRootContext.Provider value={rootRef}>
      <div
        ref={rootRef}
        className={cn("pcv", resolvedTheme, "w-full h-full", className)}
        data-theme={resolvedTheme}
      >
        {children}
      </div>
    </PcvRootContext.Provider>
  );
}

/**
 * Drop-in PanoCloud Viewer component.
 *
 * @example
 * ```tsx
 * import { PanoCloudViewer } from '@der-ort/pano-cloud-viewer';
 * import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';
 *
 * <PanoCloudViewer
 *   source={{ type: 's3', baseUrl: 'https://bucket.s3.amazonaws.com/project/' }}
 *   theme="dark"
 * />
 * ```
 */
export function PanoCloudViewer({ source, theme = "dark", className, locale, uiMode, children }: PanoCloudViewerProps) {
  const adapter = createAdapter(source);
  const config = { source, uiMode };

  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider defaultTheme={theme}>
        <DataProvider adapter={adapter}>
          <ViewerProvider config={config}>
            <PcvRoot className={className}>
              {children ? (
                <>
                  {children(
                    <Suspense fallback={<ViewportFallback />}>
                      <Viewport />
                    </Suspense>
                  )}
                  <PanoOverlayBridge />
                </>
              ) : (
                <WorkspaceLayout />
              )}
            </PcvRoot>
          </ViewerProvider>
        </DataProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
