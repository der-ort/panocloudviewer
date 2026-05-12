"use client";

import React, { Suspense, lazy } from "react";
import { ThemeProvider } from "../providers/theme-provider";
import { ViewerProvider, useViewer } from "../providers/viewer-provider";
import { DataProvider } from "../providers/data-provider";
import { LocaleProvider } from "../i18n/locale-context";
import { WorkspaceLayout } from "./workspace-layout";
import { PanoViewer } from "./overlays/pano-viewer";
import { createAdapter } from "../data/file-source-adapter";
import type { PointCloudSource } from "../types";
import type { ViewerLocale } from "../i18n/types";

const Viewport = lazy(() => import("./viewport").then(m => ({ default: m.Viewport })));

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
export function PanoCloudViewer({ source, theme = "dark", className, locale, children }: PanoCloudViewerProps) {
  const adapter = createAdapter(source);
  const config = { source };

  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider defaultTheme={theme}>
        <DataProvider adapter={adapter}>
          <ViewerProvider config={config}>
            <div className={`w-full h-full ${className ?? ""}`}>
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
            </div>
          </ViewerProvider>
        </DataProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
