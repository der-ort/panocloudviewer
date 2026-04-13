"use client";

import React from "react";
import { ThemeProvider } from "../providers/theme-provider";
import { ViewerProvider } from "../providers/viewer-provider";
import { DataProvider } from "../providers/data-provider";
import { WorkspaceLayout } from "./workspace-layout";
import { createAdapter } from "../data/file-source-adapter";
import type { PointCloudSource } from "../types";

export interface PanoCloudViewerProps {
  /** Data source: S3 bucket, local path, or Electron IPC */
  source: PointCloudSource;
  /** Initial theme. Defaults to "dark". */
  theme?: "light" | "dark";
  /** CSS class applied to the root element */
  className?: string;
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
export function PanoCloudViewer({ source, theme = "dark", className }: PanoCloudViewerProps) {
  const adapter = createAdapter(source);
  const config = { source };
  return (
    <ThemeProvider defaultTheme={theme}>
      <DataProvider adapter={adapter}>
        <ViewerProvider config={config}>
          <div className={`w-full h-full ${className ?? ""}`}>
            <WorkspaceLayout />
          </div>
        </ViewerProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
