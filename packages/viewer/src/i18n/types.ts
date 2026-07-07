/**
 * Full locale dictionary for PanoCloudViewer.
 * Pass a partial override via `createLocale(en, overrides)` or supply a complete object.
 */
export interface ViewerLocale {
  toolbar: {
    // View presets
    viewTop: string;
    viewTopLabel: string;
    viewFront: string;
    viewFrontLabel: string;
    viewBack: string;
    viewBackLabel: string;
    viewLeft: string;
    viewLeftLabel: string;
    viewRight: string;
    viewRightLabel: string;
    viewBottom: string;
    viewBottomLabel: string;
    // Display controls
    budget: string;
    pointBudgetTitle: (millions: number) => string;
    size: string;
    pointSizeTitle: (size: number) => string;
    // Right-side toggles
    panoramas: string;
    togglePanoramas: string;
    minimap: string;
    toggleMinimap: string;
    clouds: string;
    cloudSelector: string;
    theme: string;
    switchToLight: string;
    switchToDark: string;
    about: string;
    sidebar: string;
    toggleSidebar: string;
    // Color mode
    colorMode: string;
    colorRgb: string;
    colorElevation: string;
    colorIntensity: string;
    colorIntensityGradient: string;
    colorClassification: string;
    colorReturnNumber: string;
    colorSource: string;
    // Quality presets
    quality: string;
    qualityPerformance: string;
    qualityBalanced: string;
    qualityHigh: string;
    // Navigation modes
    navOrbit: string;
    navFree: string;
    navPan: string;
    navOrbitTitle: string;
    navFreeTitle: string;
    navPanTitle: string;
    // Camera projection
    camPerspective: string;
    camOrthographic: string;
    camPerspectiveTitle: string;
    camOrthographicTitle: string;
  };
  exportPanel: {
    exportImageTitle: string;
    title: string;
    view: string;
    viewTop: string;
    viewFront: string;
    viewSide: string;
    viewBack: string;
    scale: string;
    background: string;
    bgWhite: string;
    bgBlack: string;
    bgTransparent: string;
    format: string;
    exporting: string;
    download: string;
  };
  toolRail: {
    measureGroup: string;
    sectionGroup: string;
    measurePoint: string;
    measureDistance: string;
    measureHeight: string;
    measureArea: string;
    measureVolume: string;
    measureAngle: string;
    measureProfile: string;
    magnifier: string;
    clearMeasurements: string;
    drawClipBox: string;
    clipModeKeepInside: string;
    clipModeKeepOutside: string;
    removeClipBox: string;
  };
  sidebar: {
    tabLayers: string;
    tabPanoramas: string;
    tabScene: string;
    tabMeasurements: string;
    tabClassification: string;
    tabScenes: string;
  };
  scenePanel: {
    pointClouds: string;
    noCloudLoaded: string;
    measurements: string;
    clearAll: string;
    none: string;
    sections: string;
    sectionHint: string;
    clipModeNote: string;
  };
  panoPanel: {
    searchPlaceholder: string;
    noResults: string;
    flyTo: string;
  };
  classificationPanel: {
    title: string;
    all: string;
    none: string;
    // LAS class labels by code
    classLabels: Record<number, string>;
  };
  measurementsPanel: {
    noMeasurements: string;
    useMeasureToolHint: string;
    measurementCount: (count: number) => string;
    downloadCsv: string;
    csv: string;
    clearAll: string;
    typePoint: string;
    typeDistance: string;
    typeHeight: string;
    typeArea: string;
    typeVolume: string;
    typeAngle: string;
    typeProfile: string;
  };
  viewport: {
    overview: string;
    hintPoint: string;
    hintDistance: string;
    hintHeight: string;
    hintArea: string;
    hintAngle: string;
    hintProfile: string;
    hintSectionBox: string;
    hintVolumeFootprint: string;
    hintVolumeHeight: string;
    initialisingRenderer: string;
    statusPts: (millions: number) => string;
    statusBudget: (millions: number) => string;
    statusFps: (fps: number) => string;
  };
  renderingSettings: {
    title: string;
    rgbSection: string;
    intensitySection: string;
    elevationSection: string;
    generalSection: string;
    gamma: string;
    brightness: string;
    contrast: string;
    range: string;
    elevMin: string;
    elevMax: string;
    opacity: string;
    reset: string;
  };
  scenesPanel: {
    saveScene: string;
    namePlaceholder: string;
    save: string;
    savedScenes: string;
    noScenes: string;
    restore: string;
    exportJson: string;
    importJson: string;
  };
  displaySettings: {
    title: string;
    presetsTab: string;
    advancedTab: string;
    preset_compact: string;
    preset_compact_desc: string;
    preset_standard: string;
    preset_standard_desc: string;
    preset_prominent: string;
    preset_prominent_desc: string;
    measurementsSection: string;
    lineWidth: string;
    labelScale: string;
    sphereRadius: string;
    markersSection: string;
    markerScale: string;
    markerOpacity: string;
    markerLabelScale: string;
  };
  about: {
    title: string;
    productName: string;
    description: string;
    engineLabel: string;
    panoramasLabel: string;
    uiLabel: string;
  };
  panoViewer: {
    close: string;
  };
  /** Clip management toolbar strings */
  clipToolbar: {
    title: string;
    addBox: string;
    clearAll: string;
    keepInside: string;
    keepOutside: string;
    show: string;
    hide: string;
    delete: string;
    /** @deprecated unused — handles show simultaneously (kept for locale compat) */
    move: string;
    /** @deprecated unused — handles show simultaneously (kept for locale compat) */
    scale: string;
    /** @deprecated unused — handles show simultaneously (kept for locale compat) */
    rotateZ: string;
    clippingOn: string;
    clippingOff: string;
    outlinesOn: string;
    outlinesOff: string;
    resetRotation: string;
  };
  /** UI mode labels and related toolbar strings */
  uiModes: {
    /** Label for the "professional" mode */
    professional: string;
    /** Label for the "lite" mode */
    lite: string;
    /** Generic label for the mode selector */
    modeLabel: string;
  };
}

/**
 * Deep-merge a base locale with partial overrides.
 * Useful for supplying only the strings that differ from English.
 *
 * @example
 * import { en, createLocale } from '@der-ort/pano-cloud-viewer/i18n';
 * const myLocale = createLocale(en, { toolbar: { about: 'Info' } });
 */
export function createLocale(
  base: ViewerLocale,
  overrides: DeepPartial<ViewerLocale>,
): ViewerLocale {
  return deepMerge(base, overrides) as ViewerLocale;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge(base: unknown, overrides: unknown): unknown {
  if (typeof base !== "object" || base === null) return overrides ?? base;
  const result = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(overrides as Record<string, unknown>)) {
    const val = (overrides as Record<string, unknown>)[key];
    result[key] =
      val !== undefined && typeof val === "object" && !Array.isArray(val)
        ? deepMerge(result[key], val)
        : val;
  }
  return result;
}
