/**
 * Simple Measurement Tool
 *
 * A stripped-down viewer focused on distance measurement. Demonstrates:
 *  - Using the viewer with a minimal toolbar (measure only)
 *  - Listening to measurement callbacks
 *  - Displaying a custom results panel
 *
 * Usage:
 *   import SimpleMeasurement from './simple-measurement';
 *   <SimpleMeasurement />
 */
"use client";

import React, { lazy, Suspense, useState } from "react";
import { Ruler, Trash2, MapPin } from "lucide-react";
import {
  ViewerProvider,
  DataProvider,
  ThemeProvider,
  LocaleProvider,
  useViewer,
  createAdapter,
} from "@der-ort/pano-cloud-viewer";
import type { Measurement, ActiveTool } from "@der-ort/pano-cloud-viewer";
import "@der-ort/pano-cloud-viewer/themes/base.css";

const Viewport = lazy(() =>
  import("@der-ort/pano-cloud-viewer").then(m => ({ default: m.Viewport }))
);

const SOURCE = {
  type: "s3" as const,
  baseUrl: "/sample/",
};

function MeasureLayout() {
  const {
    activeTool,
    setActiveTool,
    measurementList,
    measurementManager,
    setMeasurementList,
  } = useViewer();
  const [results, setResults] = useState<Measurement[]>([]);

  // Sync measurements from the manager
  React.useEffect(() => {
    setResults(measurementList);
  }, [measurementList]);

  const toggleTool = (tool: ActiveTool) =>
    setActiveTool(activeTool === tool ? "none" : tool);

  const clearAll = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
    setResults([]);
  };

  return (
    <div className="flex w-full h-full">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Viewport />
        </Suspense>

        {/* Floating toolbar */}
        <div className="absolute top-3 left-3 flex gap-1 bg-black/70 rounded-lg p-1.5 backdrop-blur-sm">
          <button
            onClick={() => toggleTool("measure-point")}
            className={`p-2 rounded ${activeTool === "measure-point" ? "bg-blue-500/30 text-blue-400" : "text-white/60 hover:text-white"}`}
            title="Measure point coordinates"
          >
            <MapPin size={16} />
          </button>
          <button
            onClick={() => toggleTool("measure-distance")}
            className={`p-2 rounded ${activeTool === "measure-distance" ? "bg-blue-500/30 text-blue-400" : "text-white/60 hover:text-white"}`}
            title="Measure distance"
          >
            <Ruler size={16} />
          </button>
          <div className="w-px bg-white/20 mx-1" />
          <button
            onClick={clearAll}
            className="p-2 rounded text-white/40 hover:text-red-400"
            title="Clear all measurements"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Results panel */}
      <div className="w-64 h-full border-l border-[hsl(var(--border))] bg-[hsl(var(--sidebar-bg))] overflow-y-auto">
        <div className="p-3 border-b border-[hsl(var(--border))]">
          <h2 className="text-sm font-semibold text-foreground">
            Measurements
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {results.length === 0
              ? "Click the ruler icon, then click two points"
              : `${results.length} measurement${results.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="p-2 space-y-1">
          {results.map(m => (
            <div
              key={m.id}
              className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: m.color }}
              />
              <span className="flex-1 font-mono text-foreground capitalize">
                {m.type}
              </span>
              <span className="font-mono text-foreground/70">
                {m.value !== undefined
                  ? m.type === "point"
                    ? `(${m.points[0]?.x.toFixed(1)}, ${m.points[0]?.y.toFixed(1)}, ${m.points[0]?.z.toFixed(1)})`
                    : `${m.value.toFixed(3)} m`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SimpleMeasurement() {
  const adapter = createAdapter(SOURCE);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LocaleProvider>
        <ThemeProvider defaultTheme="dark">
          <DataProvider adapter={adapter}>
            <ViewerProvider config={{ source: SOURCE }}>
              <MeasureLayout />
            </ViewerProvider>
          </DataProvider>
        </ThemeProvider>
      </LocaleProvider>
    </div>
  );
}
