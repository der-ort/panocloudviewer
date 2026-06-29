"use client";

import React, { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";
import type { SceneManager } from "@der-ort/pano-cloud-viewer-core";
import type { PointCloudLoader } from "@der-ort/pano-cloud-viewer-core";
import type { MeasurementManager } from "@der-ort/pano-cloud-viewer-core";
import type { MarkerManager } from "@der-ort/pano-cloud-viewer-core";
import type { CameraAnimator } from "@der-ort/pano-cloud-viewer-core";
import type { ExportManager } from "@der-ort/pano-cloud-viewer-core";
import type { MinimapRenderer } from "@der-ort/pano-cloud-viewer-core";
import type { ClipManager } from "@der-ort/pano-cloud-viewer-core";
import type { ClipBoxEntry } from "@der-ort/pano-cloud-viewer-core";
import type { ColorMode } from "@der-ort/pano-cloud-viewer-core";
import type { ActiveTool, CameraData, CameraProjection, DisplaySettings, Measurement, NavigationMode, PanoEngine, UiMode, ViewerConfig } from "@der-ort/pano-cloud-viewer-core";
import { DISPLAY_PRESETS } from "@der-ort/pano-cloud-viewer-core";

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
  showMeasurements: boolean;
  setShowMeasurements: (v: boolean) => void;
  selectedCamera: CameraData | null;
  setSelectedCamera: (cam: CameraData | null) => void;
  clipBoxEntries: ClipBoxEntry[];
  setClipBoxEntries: React.Dispatch<React.SetStateAction<ClipBoxEntry[]>>;
  selectedClipBoxId: string | null;
  setSelectedClipBoxId: (id: string | null) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  navigationMode: NavigationMode;
  setNavigationMode: (mode: NavigationMode) => void;
  projection: CameraProjection;
  setProjection: (mode: CameraProjection) => void;
  displaySettings: DisplaySettings;
  setDisplaySettings: (settings: DisplaySettings) => void;

  /** Resolved UI mode — defaults to "professional" when not set in config */
  uiMode: UiMode;

  /** Active panorama engine — seeded from config (default "photo-sphere-viewer"); switchable at runtime */
  panoEngine: PanoEngine;
  setPanoEngine: (engine: PanoEngine) => void;

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
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<import("@der-ort/pano-cloud-viewer-core").CameraData | null>(null);
  const [clipBoxEntries, setClipBoxEntries] = useState<ClipBoxEntry[]>([]);
  const [selectedClipBoxId, setSelectedClipBoxId] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("rgb");
  const [navigationMode, _setNavigationMode] = useState<NavigationMode>("orbit");
  const [projection, _setProjection] = useState<CameraProjection>("perspective");
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => ({
    ...DISPLAY_PRESETS.standard,
    ...config.displaySettings,
  }));

  const setNavigationMode = useCallback((mode: NavigationMode) => {
    _setNavigationMode(mode);
  }, []);

  const setProjection = useCallback((mode: CameraProjection) => {
    _setProjection(mode);
  }, []);

  const setSceneManager = useCallback((sm: SceneManager) => _setSceneManager(sm), []);
  const setLoader = useCallback((l: PointCloudLoader) => _setLoader(l), []);
  const setMeasurementManager = useCallback((m: MeasurementManager) => _setMeasurementManager(m), []);
  const setMarkerManager = useCallback((m: MarkerManager) => _setMarkerManager(m), []);
  const setCameraAnimator = useCallback((a: CameraAnimator) => _setCameraAnimator(a), []);
  const setExporter = useCallback((e: ExportManager) => _setExporter(e), []);
  const setMinimap = useCallback((r: MinimapRenderer) => _setMinimap(r), []);
  const setClipManager = useCallback((c: ClipManager) => _setClipManager(c), []);

  const uiMode: UiMode = config.uiMode ?? "professional";
  const [panoEngine, setPanoEngine] = useState<PanoEngine>(config.panoEngine ?? "photo-sphere-viewer");

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
    showMeasurements, setShowMeasurements,
    selectedCamera, setSelectedCamera,
    clipBoxEntries, setClipBoxEntries,
    selectedClipBoxId, setSelectedClipBoxId,
    colorMode, setColorMode,
    navigationMode, setNavigationMode,
    projection, setProjection,
    displaySettings, setDisplaySettings,
    uiMode,
    panoEngine, setPanoEngine,
    config,
  };

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}
