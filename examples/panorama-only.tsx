/**
 * Panorama-Only Viewer
 *
 * Uses the viewer's building blocks to create a panorama-focused experience:
 *  - No toolbar, no measurement tools, no minimap
 *  - Sidebar shows only the panorama list
 *  - Clicking a panorama flies to it and opens the 360-degree view
 *
 * This example shows how to compose a custom layout from the library's
 * exported sub-components instead of using the all-in-one PanoCloudViewer.
 *
 * Usage:
 *   import PanoramaOnly from './panorama-only';
 *   <PanoramaOnly />
 */
"use client";

import React, { lazy, Suspense } from "react";
import {
  ViewerProvider,
  DataProvider,
  ThemeProvider,
  LocaleProvider,
  useViewer,
  PanoPanel,
  PanoViewer,
  createAdapter,
} from "@der-ort/pano-cloud-viewer";
import "@der-ort/pano-cloud-viewer/themes/smart-agile.css";

const Viewport = lazy(() =>
  import("@der-ort/pano-cloud-viewer").then(m => ({ default: m.Viewport }))
);

const SOURCE = {
  type: "s3" as const,
  baseUrl: "/sample/",
};

function PanoLayout() {
  const { selectedCamera } = useViewer();

  return (
    <div className="flex w-full h-full">
      {/* Panorama list on the left */}
      <div className="w-72 h-full border-r border-[hsl(var(--border))] bg-[hsl(var(--sidebar-bg))] overflow-hidden flex flex-col">
        <div className="p-3 border-b border-[hsl(var(--border))]">
          <h2 className="text-sm font-semibold text-foreground">Panoramas</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Click to open 360-degree view
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <PanoPanel />
        </div>
      </div>

      {/* 3D viewport */}
      <div className="flex-1 relative">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Viewport />
        </Suspense>
        {/* Panorama overlay */}
        {selectedCamera && <PanoViewer />}
      </div>
    </div>
  );
}

export default function PanoramaOnly() {
  const adapter = createAdapter(SOURCE);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LocaleProvider>
        <ThemeProvider defaultTheme="dark">
          <DataProvider adapter={adapter}>
            <ViewerProvider config={{ source: SOURCE }}>
              <PanoLayout />
            </ViewerProvider>
          </DataProvider>
        </ThemeProvider>
      </LocaleProvider>
    </div>
  );
}
