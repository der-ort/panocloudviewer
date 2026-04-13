"use client";

import React from "react";
import { ThemeProvider } from "../providers/theme-provider";
import { ViewerProvider } from "../providers/viewer-provider";
import { DataProvider } from "../providers/data-provider";
import { LocaleProvider } from "../i18n/locale-context";
import { WorkspaceLayout } from "./workspace-layout";
import { createAdapter } from "../data/file-source-adapter";
import type { PointCloudSource } from "../types";
import type { ViewerLocale } from "../i18n/types";

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
export function PanoCloudViewer({ source, theme = "dark", className, locale }: PanoCloudViewerProps) {
  const adapter = createAdapter(source);
  const config = { source };
  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider defaultTheme={theme}>
        <DataProvider adapter={adapter}>
          <ViewerProvider config={config}>
            <div className={`w-full h-full ${className ?? ""}`}>
              <WorkspaceLayout />
            </div>
          </ViewerProvider>
        </DataProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
