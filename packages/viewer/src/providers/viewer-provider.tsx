"use client";

import React, { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";
import type { SceneManager } from "../core/scene-manager";
import type { PointCloudLoader } from "../core/point-cloud-loader";
import type { MeasurementManager } from "../core/measurement-manager";
import type { MarkerManager } from "../core/marker-manager";
import type { CameraAnimator } from "../core/camera-animator";
import type { ExportManager } from "../core/export-manager";
import type { MinimapRenderer } from "../core/minimap-renderer";
import type { ClipManager } from "../core/clip-manager";
import type { ClipBoxEntry } from "../core/clip-manager";
import type { ActiveTool, CameraData, Measurement, ViewerConfig } from "../types";

export type ColorMode = "rgb" | "height" | "intensity";

interface ViewerContextValue {
  // Core managers (set after Three.js init)
  sceneManager: SceneManager | null;
  loader: PointCloudLoader | null;
  measurementManager: MeasurementManager | null;
  markerManager: MarkerManager | null;
  cameraAnimator: CameraAnimator | null;
  exporter: ExportManager | null;
  minimap: MinimapRenderer | null;
  clipManager: ClipManager | null;

  // Setters (called by Viewport after init)
  setSceneManager: (sm: SceneManager) => void;
  setLoader: (l: PointCloudLoader) => void;
  setMeasurementManager: (m: MeasurementManager) => void;
  setMarkerManager: (m: MarkerManager) => void;
  setCameraAnimator: (a: CameraAnimator) => void;
  setExporter: (e: ExportManager) => void;
  setMinimap: (r: MinimapRenderer) => void;
  setClipManager: (c: ClipManager) => void;

  // Viewer state
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  pointBudget: number;
  setPointBudget: (v: number) => void;
  pointSize: number;
  setPointSize: (v: number) => void;
  fps: number;
  setFps: (v: number) => void;
  pointCount: number;
  setPointCount: (v: number) => void;
  measurementList: Measurement[];
  setMeasurementList: React.Dispatch<React.SetStateAction<Measurement[]>>;
  showMarkers: boolean;
  setShowMarkers: (v: boolean) => void;
  showMinimap: boolean;
  setShowMinimap: (v: boolean) => void;
  selectedCamera: CameraData | null;
  setSelectedCamera: (cam: CameraData | null) => void;
  clipBoxEntries: ClipBoxEntry[];
  setClipBoxEntries: React.Dispatch<React.SetStateAction<ClipBoxEntry[]>>;
  selectedClipBoxId: string | null;
  setSelectedClipBoxId: (id: string | null) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;

  config: ViewerConfig;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

export function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used inside <ViewerProvider>");
  return ctx;
}

interface ViewerProviderProps {
  config: ViewerConfig;
  children: ReactNode;
}

export function ViewerProvider({ config, children }: ViewerProviderProps) {
  const [sceneManager, _setSceneManager] = useState<SceneManager | null>(null);
  const [loader, _setLoader] = useState<PointCloudLoader | null>(null);
  const [measurementManager, _setMeasurementManager] = useState<MeasurementManager | null>(null);
  const [markerManager, _setMarkerManager] = useState<MarkerManager | null>(null);
  const [cameraAnimator, _setCameraAnimator] = useState<CameraAnimator | null>(null);
  const [exporter, _setExporter] = useState<ExportManager | null>(null);
  const [minimap, _setMinimap] = useState<MinimapRenderer | null>(null);
  const [clipManager, _setClipManager] = useState<ClipManager | null>(null);

  const [activeTool, setActiveTool] = useState<ActiveTool>("none");
  const [pointBudget, setPointBudget] = useState(config.pointBudget ?? 2_000_000);
  const [pointSize, setPointSize] = useState(1.5);
  const [fps, setFps] = useState(0);
  const [pointCount, setPointCount] = useState(0);
  const [measurementList, setMeasurementList] = useState<Measurement[]>([]);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showMinimap, setShowMinimap] = useState(config.showMinimap ?? true);
  const [selectedCamera, setSelectedCamera] = useState<import("../types").CameraData | null>(null);
  const [clipBoxEntries, setClipBoxEntries] = useState<ClipBoxEntry[]>([]);
  const [selectedClipBoxId, setSelectedClipBoxId] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("rgb");

  const setSceneManager = useCallback((sm: SceneManager) => _setSceneManager(sm), []);
  const setLoader = useCallback((l: PointCloudLoader) => _setLoader(l), []);
  const setMeasurementManager = useCallback((m: MeasurementManager) => _setMeasurementManager(m), []);
  const setMarkerManager = useCallback((m: MarkerManager) => _setMarkerManager(m), []);
  const setCameraAnimator = useCallback((a: CameraAnimator) => _setCameraAnimator(a), []);
  const setExporter = useCallback((e: ExportManager) => _setExporter(e), []);
  const setMinimap = useCallback((r: MinimapRenderer) => _setMinimap(r), []);
  const setClipManager = useCallback((c: ClipManager) => _setClipManager(c), []);

  const value: ViewerContextValue = {
    sceneManager, loader, measurementManager, markerManager, cameraAnimator, exporter, minimap, clipManager,
    setSceneManager, setLoader, setMeasurementManager, setMarkerManager, setCameraAnimator, setExporter, setMinimap, setClipManager,
    activeTool, setActiveTool,
    pointBudget, setPointBudget,
    pointSize, setPointSize,
    fps, setFps,
    pointCount, setPointCount,
    measurementList, setMeasurementList,
    showMarkers, setShowMarkers,
    showMinimap, setShowMinimap,
    selectedCamera, setSelectedCamera,
    clipBoxEntries, setClipBoxEntries,
    selectedClipBoxId, setSelectedClipBoxId,
    colorMode, setColorMode,
    config,
  };

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}
