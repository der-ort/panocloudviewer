import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ClassValue } from 'clsx';

interface S3Source {
    type: "s3";
    /** Base URL for all point cloud files, ending with "/" */
    baseUrl: string;
    /** Optional auth headers (e.g. { Authorization: "Bearer ..." }) */
    headers?: Record<string, string>;
}
interface LocalSource {
    type: "local";
    /** Absolute path to the point cloud folder (Electron only) */
    basePath: string;
}
interface ElectronSource {
    type: "electron";
    /** Absolute path to the point cloud folder */
    basePath: string;
}
type PointCloudSource = S3Source | LocalSource | ElectronSource;
interface CameraPosition {
    x: number;
    y: number;
    z: number;
}
interface CameraRotation {
    x: number;
    y: number;
    z: number;
    w: number;
}
interface CameraData {
    name: string;
    index: number;
    image: string | null;
    /** Low-res thumbnail URL for sidebar lists (falls back to image if absent) */
    thumbnail?: string | null;
    representation?: "sphericalRepresentation" | "pinholeRepresentation" | "cylindricalRepresentation";
    position?: CameraPosition;
    rotation?: CameraRotation;
    yaw_deg?: number;
    description?: string;
    position_source?: "scan" | "image";
    _project?: string;
}
type MeasurementType = "point" | "distance" | "height" | "area" | "volume" | "angle" | "profile";
interface Measurement {
    id: string;
    type: MeasurementType;
    label: string;
    points: THREE.Vector3[];
    /** Computed result value (meters, m², m³, radians depending on type) */
    value?: number;
    /** For volume measurements: the defining box (serializable) */
    box?: {
        min: [number, number, number];
        max: [number, number, number];
    };
    color: string;
    visible: boolean;
    selected: boolean;
}
type ExportView = "top" | "front" | "side" | "back" | "custom";
type ExportFormat = "png" | "jpeg";
interface ExportOptions {
    view: ExportView;
    scale: 1 | 2 | 4;
    background: "white" | "black" | "transparent";
    showScaleBar: boolean;
    format: ExportFormat;
    quality?: number;
}
type Theme = "dark" | "light" | "system";
interface ViewerConfig {
    source: PointCloudSource;
    theme?: Theme;
    /** Initial point budget (default: 2_000_000) */
    pointBudget?: number;
    /** Show minimap (default: true) */
    showMinimap?: boolean;
    /** Enable panorama sidebar (default: true) */
    enablePanoramas?: boolean;
    /** Custom class name for the root element */
    className?: string;
    /** Called when a camera marker is selected */
    onCameraSelect?: (camera: CameraData) => void;
    /** Called when a measurement is created/updated */
    onMeasurementChange?: (measurements: Measurement[]) => void;
    /** Display settings overrides (marker/measurement sizing) */
    displaySettings?: Partial<DisplaySettings>;
}
type ActiveTool = "none" | "measure-point" | "measure-distance" | "measure-height" | "measure-area" | "measure-volume" | "measure-angle" | "measure-profile" | "section-box" | "section-plane" | "annotate";
type NavigationMode = "orbit" | "fly" | "earth";
type CameraProjection = "perspective" | "orthographic";
type DisplayPreset = "compact" | "standard" | "prominent";
interface DisplaySettings {
    preset: DisplayPreset;
    /** Measurement line width in pixels */
    measurementLineWidth: number;
    /** Measurement label scale multiplier (1.0 = default) */
    measurementLabelScale: number;
    /** Measurement sphere radius in world units */
    measurementSphereRadius: number;
    /** Marker sphere scale multiplier on auto-calculated radius */
    markerSphereScale: number;
    /** Marker sphere opacity (0-1) */
    markerSphereOpacity: number;
    /** Marker label scale multiplier */
    markerLabelScale: number;
}
declare const DISPLAY_PRESETS: Record<DisplayPreset, DisplaySettings>;

/**
 * Full locale dictionary for PanoCloudViewer.
 * Pass a partial override via `createLocale(en, overrides)` or supply a complete object.
 */
interface ViewerLocale {
    toolbar: {
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
        budget: string;
        pointBudgetTitle: (millions: number) => string;
        size: string;
        pointSizeTitle: (size: number) => string;
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
        colorMode: string;
        colorRgb: string;
        colorElevation: string;
        colorIntensity: string;
        colorIntensityGradient: string;
        colorClassification: string;
        colorReturnNumber: string;
        colorSource: string;
        quality: string;
        qualityPerformance: string;
        qualityBalanced: string;
        qualityHigh: string;
        navOrbit: string;
        navFly: string;
        navEarth: string;
        navOrbitTitle: string;
        navFlyTitle: string;
        navEarthTitle: string;
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
        clearMeasurements: string;
        drawClipBox: string;
        clipModeKeepInside: string;
        clipModeKeepOutside: string;
        removeClipBox: string;
    };
    sidebar: {
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
        hintSectionBox: string;
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
}
/**
 * Deep-merge a base locale with partial overrides.
 * Useful for supplying only the strings that differ from English.
 *
 * @example
 * import { en, createLocale } from '@der-ort/pano-cloud-viewer/i18n';
 * const myLocale = createLocale(en, { toolbar: { about: 'Info' } });
 */
declare function createLocale(base: ViewerLocale, overrides: DeepPartial<ViewerLocale>): ViewerLocale;
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface PanoCloudViewerProps {
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
declare function PanoCloudViewer({ source, theme, className, locale, children }: PanoCloudViewerProps): react_jsx_runtime.JSX.Element;

interface SceneManagerOptions {
    canvas: HTMLElement;
    onFpsUpdate?: (fps: number) => void;
    onPointsUpdate?: (loaded: number) => void;
}
/** Manages the Three.js scene, camera, renderer and animation loop */
declare class SceneManager {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    private _fpsControls;
    private _navMode;
    private _projection;
    private _orthoCamera;
    /** Movement speed for fly mode — auto-scaled when point cloud loads */
    flySpeed: number;
    private animationId;
    private lastTime;
    private frameCount;
    private fpsInterval;
    private onFpsUpdate?;
    private onPointsUpdate?;
    private resizeObserver;
    private frameCallbacks;
    private postRenderCallbacks;
    potree: unknown;
    pointClouds: unknown[];
    constructor({ canvas, onFpsUpdate, onPointsUpdate }: SceneManagerOptions);
    private onResize;
    /** Start the render loop */
    start(): void;
    /** Register a callback run every frame before render */
    addFrameCallback(cb: () => void): void;
    /** Remove a previously registered pre-render frame callback */
    removeFrameCallback(cb: () => void): void;
    /** Register a callback run every frame AFTER the main render (for overlays) */
    addPostRenderCallback(cb: () => void): void;
    /** Remove a previously registered post-render callback */
    removePostRenderCallback(cb: () => void): void;
    /** Current navigation mode */
    get navigationMode(): NavigationMode;
    /** Current camera projection */
    get projection(): CameraProjection;
    /**
     * Switch between perspective and orthographic projection.
     * PerspectiveCamera always drives OrbitControls and potree LOD — the ortho
     * camera is synced from it each frame and used only for rendering.
     */
    setProjection(mode: CameraProjection): void;
    /**
     * Sync the ortho camera to the perspective camera's view each frame.
     * Frustum is derived from the perspective camera's FOV and current distance
     * to the orbit target so the visual scale matches.
     */
    private _syncOrthoCamera;
    /**
     * Switch between navigation modes.
     * - orbit: standard orbit / tumble around a target point
     * - fly:   free-flight (WASD + mouse-drag to look), no camera roll
     * - earth: pan-primary mode (like Google Earth / map view)
     */
    setNavigationMode(mode: NavigationMode): void;
    /**
     * Set fly movement speed. Propagates to active FlyControls if instantiated.
     * Call this instead of setting flySpeed directly when fly mode is active.
     */
    setFlySpeed(speed: number): void;
    /** Stop animation loop and dispose resources */
    dispose(): void;
    /** Fit camera to bounding box */
    fitToBox(box: THREE.Box3): void;
    /** Raycast against objects in scene */
    raycast(normalizedX: number, normalizedY: number, objects: THREE.Object3D[]): THREE.Intersection[];
    /**
     * Pick a point on the point cloud using potree-core's GPU picker.
     * Returns the world-space position of the closest point under the cursor,
     * or null if nothing was hit.
     */
    pickPoint(normalizedX: number, normalizedY: number): THREE.Vector3 | null;
}

/** Abstraction over file loading - allows S3, Electron, and local HTTP sources */
interface FileSourceAdapter {
    /** Resolve a relative path to a full URL or absolute path */
    resolveUrl(relativePath: string): string;
    /** Fetch JSON data */
    fetchJson<T>(relativePath: string): Promise<T>;
    /** Fetch binary data */
    fetchBinary(relativePath: string): Promise<ArrayBuffer>;
    /** Optional: fetch with custom headers (used by potree-core RequestManager) */
    fetchWithHeaders?(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    /** Optional: list directories (used for multi-project scanning) */
    listDirectories?(path: string): Promise<string[]>;
}
/** HTTP/S3 adapter - works in browser and Electron via fetch */
declare class S3SourceAdapter implements FileSourceAdapter {
    private baseUrl;
    private headers;
    constructor(baseUrl: string, headers?: Record<string, string>);
    resolveUrl(relativePath: string): string;
    fetchJson<T>(relativePath: string): Promise<T>;
    fetchBinary(relativePath: string): Promise<ArrayBuffer>;
    fetchWithHeaders(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
/** Electron IPC adapter - uses window.electronFS bridge exposed by preload */
declare class ElectronSourceAdapter implements FileSourceAdapter {
    private basePath;
    constructor(basePath: string);
    resolveUrl(relativePath: string): string;
    fetchJson<T>(relativePath: string): Promise<T>;
    fetchBinary(relativePath: string): Promise<ArrayBuffer>;
    listDirectories(path: string): Promise<string[]>;
}
/** Create the appropriate adapter from a source config */
declare function createAdapter(source: PointCloudSource): FileSourceAdapter;

type ColorMode = "rgb" | "height" | "intensity" | "intensity_gradient" | "classification" | "return_number" | "source";
interface PointCloudMetadata {
    name: string;
    points: number;
    boundingBox: {
        min: [number, number, number];
        max: [number, number, number];
    };
    spacing?: number;
    version?: string;
}
/** Loads Potree 2.0 point clouds (octree.bin + hierarchy.bin + metadata.json) via potree-core */
declare class PointCloudLoader {
    private sceneManager;
    private adapter;
    private currentClouds;
    private hasRgb;
    /** World-space bounding box of the loaded point cloud (available after load) */
    worldBox: THREE.Box3;
    constructor(sceneManager: SceneManager, adapter: FileSourceAdapter);
    /** Load a point cloud from the adapter's base URL */
    load(metadataPath?: string, pointBudget?: number): Promise<void>;
    /** Set color mode on all loaded clouds */
    setColorMode(mode: ColorMode): Promise<void>;
    /** Whether the loaded cloud has RGB data */
    get hasRgbData(): boolean;
    /** Remove all loaded point clouds from scene */
    clear(): void;
    /** Set point budget on all loaded clouds */
    setPointBudget(budget: number): void;
    /** Set point size on all loaded clouds */
    setPointSize(size: number): void;
    /** Set point shape: 0=SQUARE, 1=CIRCLE, 2=PARABOLOID */
    setPointShape(shape: number): void;
    /** Set point size type: 0=FIXED, 1=ATTENUATED, 2=ADAPTIVE */
    setPointSizeType(type: number): void;
    /** Read metadata.json from adapter */
    readMetadata(path?: string): Promise<PointCloudMetadata | null>;
    /** Return the first loaded point cloud object, if any */
    getPointCloud(): THREE.Object3D | null;
    /** Calculate optimal point budget based on total point count */
    static calcOptimalBudget(totalPoints: number): number;
}

/** Manages 3D measurement visualizations in the scene */
declare class MeasurementManager {
    private scene;
    private group;
    private measurements;
    private _displaySettings;
    onChange?: (measurements: Measurement[]) => void;
    activeMeasurement: Measurement | null;
    private previewLine;
    private _snapSphere;
    private _snapLine;
    constructor(scene: THREE.Scene);
    getAll(): Measurement[];
    /** Apply new display settings and rebuild all existing measurements */
    applyDisplaySettings(settings: DisplaySettings): void;
    /** Rebuild all existing measurement visuals with current display settings */
    private _rebuildAll;
    /** Dispose geometry/materials and remove objects from the group */
    private _disposeObjects;
    /** Start a new measurement (call addPoint for each click, finish() to complete) */
    start(type: MeasurementType): Measurement;
    /** Add a 3D point to the active measurement */
    addPoint(point: THREE.Vector3): Measurement | null;
    /** Finalize the active measurement */
    finish(): Measurement | null;
    /**
     * Show a snap preview at the given world position. Call this on every
     * mousemove while a measurement tool is active. Renders:
     *  - A small sphere at the snap position (shows where the point will be placed)
     *  - A rubber-band line from the last placed point to the snap position
     */
    updateSnap(worldPos: THREE.Vector3, color?: string): void;
    /** Hide the snap preview (call on mouse leave or tool deactivation) */
    clearSnap(): void;
    private _volumeDraft;
    /** Show/update a volume draft box preview during drag creation */
    setVolumeDraft(box: THREE.Box3 | null): void;
    /** Create a volume measurement from a drag-defined box */
    addVolumeMeasurement(box: THREE.Box3): Measurement | null;
    private buildVolumeBoxObjects;
    private compute;
    private polygonArea;
    private convexVolume;
    private buildObjects;
    private makeTextSprite;
    private rebuildPreview;
    private clearPreview;
    rename(id: string, name: string): void;
    remove(id: string): void;
    clearAll(): void;
    dispose(): void;
}

/**
 * 3D panorama camera markers.
 *
 * Each marker is a solid sphere mesh (always visible through the point cloud
 * via depthTest=false) + a text label sprite above it. Sphere meshes are used
 * for raycasting — they are far more reliable than sprites.
 */
declare class MarkerManager {
    private scene;
    private entries;
    private group;
    private hoveredIdx;
    private selectedIdx;
    private sphereRadius;
    private _displaySettings;
    private _cameras;
    private _worldBox?;
    constructor(scene: THREE.Scene);
    /** Apply new display settings and rebuild all markers */
    applyDisplaySettings(settings: DisplaySettings): void;
    /** Build markers from camera data. Pass worldBox for auto-scaling. */
    build(cameras: CameraData[], worldBox?: THREE.Box3): void;
    private _makeSphere;
    private _makeLabel;
    /** Update sphere color by index */
    private _recolor;
    setVisible(visible: boolean): void;
    /** Return sphere meshes for raycasting */
    getMeshes(): THREE.Object3D[];
    setHovered(idx: number): void;
    setSelected(idx: number): void;
    clear(): void;
    dispose(): void;
}

interface AnimOptions {
    position: THREE.Vector3;
    target: THREE.Vector3;
    duration?: number;
}
/** Smooth camera fly-to animation using requestAnimationFrame, no external deps */
declare class CameraAnimator {
    private camera;
    private controls;
    private animId;
    constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls);
    flyTo({ position, target, duration }: AnimOptions): Promise<void>;
    /** Fly to a camera marker position (offset behind the camera by `offset` units) */
    flyToCamera(camPos: THREE.Vector3 | [number, number, number], yawDeg?: number, offset?: number, duration?: number): Promise<void>;
    cancel(): void;
}

/** Renders orthographic views and exports them as image files */
declare class ExportManager {
    private sceneManager;
    constructor(sceneManager: SceneManager);
    /** Capture an orthographic view and return as data URL */
    capture(options: ExportOptions): Promise<string>;
    /** Download a data URL as a file */
    static download(dataUrl: string, filename: string): void;
}

/**
 * Renders a top-down orthographic minimap of the point cloud scene.
 * Uses a secondary WebGLRenderer for the 3D view and a 2D canvas overlay
 * for camera indicator, markers, and labels.
 */
declare class MinimapRenderer {
    private sceneManager;
    private bounds;
    private container;
    private glCanvas;
    private overlayCanvas;
    private miniRenderer;
    private orthoCamera;
    private worldLeft;
    private worldRight;
    private worldTop;
    private worldBottom;
    private frameCount;
    constructor(sceneManager: SceneManager);
    /**
     * Attach to a container element. Creates internal canvases.
     * Container should have position:relative and defined size.
     */
    attach(container: HTMLElement): void;
    /** Set world-space bounds of the scene */
    setBounds(bounds: THREE.Box3): void;
    /** Called every frame. Renders 3D scene top-down + overlay. */
    update(): void;
    private _render3D;
    private _drawOverlay;
    private _worldToCanvasX;
    private _worldToCanvasY;
    private _drawCamera;
    /** Convert canvas pixel to world XY position */
    canvasToWorld(cx: number, cy: number): THREE.Vector2;
    /** Handle resize (called by parent when container size changes) */
    resize(): void;
    dispose(): void;
}

/**
 * Manages 6 face-center handles for interactive Box3 resizing.
 * Each handle controls one face of the box (min.x, max.x, min.y, max.y, min.z, max.z).
 */
declare class FaceHandleController {
    private scene;
    private camera;
    private domElement;
    private handles;
    private box;
    private onChange;
    private drag;
    private hoveredHandle;
    private raycaster;
    private group;
    private disposed;
    constructor(scene: THREE.Scene, camera: THREE.Camera, domElement: HTMLElement);
    private createHandles;
    attach(box: THREE.Box3, onChange: (box: THREE.Box3) => void): void;
    detach(): void;
    isAttached(): boolean;
    isDragging(): boolean;
    getHandleMeshes(): THREE.Mesh[];
    /** Update handle positions and sizes to match the current box */
    updatePositions(): void;
    /**
     * Try to start a drag. Call on pointerdown.
     * Returns true if a handle was grabbed (caller should disable orbit controls).
     */
    onPointerDown(clientX: number, clientY: number): boolean;
    /** Update the box during a drag. Call on pointermove. */
    onPointerMove(clientX: number, clientY: number): void;
    /** End the drag. Call on pointerup. */
    onPointerUp(): void;
    /** Update hover highlight. Call on pointermove when not dragging. */
    updateHover(clientX: number, clientY: number): void;
    dispose(): void;
    private hitTest;
    private setRaycasterFromClient;
    private setHandleColor;
}

type ClipMode = "outside" | "inside";
interface ClipBoxEntry {
    id: string;
    name: string;
    box: THREE.Box3;
    mode: ClipMode;
    visible: boolean;
}
/** Manages multiple named clip boxes with TransformControls support */
declare class ClipManager {
    private sm;
    private entries;
    private helpers;
    private fills;
    private draftHelper;
    private selectedId;
    private transformControls;
    private pivot;
    private _faceHandles;
    private _transformMode;
    onChange?: (boxes: ClipBoxEntry[]) => void;
    onSelectChange?: (id: string | null) => void;
    constructor(sm: SceneManager);
    private initTransformControls;
    addBox(box: THREE.Box3, name?: string): ClipBoxEntry;
    selectBox(id: string | null): Promise<void>;
    setTransformMode(mode: "translate" | "scale" | "rotate"): void;
    /** Get the face handle controller (for viewport event forwarding) */
    get faceHandles(): FaceHandleController | null;
    private _applyTransformMode;
    removeBox(id: string): void;
    setBoxMode(id: string, mode: ClipMode): void;
    setBoxVisible(id: string, visible: boolean): void;
    renameBox(id: string, name: string): void;
    getBoxes(): ClipBoxEntry[];
    getSelectedId(): string | null;
    hasBox(): boolean;
    /** Draft box — live drag preview, no clip applied */
    setDraft(box: THREE.Box3 | null): void;
    clear(): void;
    dispose(): void;
    private syncFromPivot;
    /** Set wireframe color for selected/default state */
    private _highlightHelper;
    private updateHelper;
    private applyAll;
}

interface ViewerContextValue {
    sceneManager: SceneManager | null;
    loader: PointCloudLoader | null;
    measurementManager: MeasurementManager | null;
    markerManager: MarkerManager | null;
    cameraAnimator: CameraAnimator | null;
    exporter: ExportManager | null;
    minimap: MinimapRenderer | null;
    clipManager: ClipManager | null;
    setSceneManager: (sm: SceneManager) => void;
    setLoader: (l: PointCloudLoader) => void;
    setMeasurementManager: (m: MeasurementManager) => void;
    setMarkerManager: (m: MarkerManager) => void;
    setCameraAnimator: (a: CameraAnimator) => void;
    setExporter: (e: ExportManager) => void;
    setMinimap: (r: MinimapRenderer) => void;
    setClipManager: (c: ClipManager) => void;
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
    navigationMode: NavigationMode;
    setNavigationMode: (mode: NavigationMode) => void;
    projection: CameraProjection;
    setProjection: (mode: CameraProjection) => void;
    displaySettings: DisplaySettings;
    setDisplaySettings: (settings: DisplaySettings) => void;
    config: ViewerConfig;
}
declare function useViewer(): ViewerContextValue;
interface ViewerProviderProps {
    config: ViewerConfig;
    children: ReactNode;
}
declare function ViewerProvider({ config, children }: ViewerProviderProps): react_jsx_runtime.JSX.Element;

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: "dark" | "light";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}
declare function useTheme(): ThemeContextValue;
interface ThemeProviderProps {
    defaultTheme?: Theme;
    storageKey?: string;
    children: ReactNode;
}
declare function ThemeProvider({ defaultTheme, storageKey, children, }: ThemeProviderProps): react_jsx_runtime.JSX.Element;

interface DataContextValue {
    cameras: CameraData[];
    metadata: PointCloudMetadata | null;
    loading: boolean;
    error: string | null;
    reload: () => void;
}

declare function useData(): DataContextValue;
interface DataProviderProps {
    adapter: FileSourceAdapter;
    children: ReactNode;
}
declare function DataProvider({ adapter, children }: DataProviderProps): react_jsx_runtime.JSX.Element;

interface WorkspaceLayoutProps {
    className?: string;
}
declare function WorkspaceLayout({ className }: WorkspaceLayoutProps): react_jsx_runtime.JSX.Element;

interface MinimalLayoutProps {
    viewport: React.ReactNode;
}
declare function MinimalLayout({ viewport }: MinimalLayoutProps): react_jsx_runtime.JSX.Element;

interface WorkstationLayoutProps {
    viewport: React.ReactNode;
    /** Sidebar position. Default: "left" */
    sidebarSide?: "left" | "right";
}
declare function WorkstationLayout({ viewport, sidebarSide }: WorkstationLayoutProps): react_jsx_runtime.JSX.Element;

interface FloatingPaletteProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    defaultCollapsed?: boolean;
    className?: string;
}
declare function FloatingPalette({ title, icon, children, defaultCollapsed, className }: FloatingPaletteProps): react_jsx_runtime.JSX.Element;

interface CollapsibleSidebarProps {
    side: "left" | "right";
    children: React.ReactNode;
    defaultOpen?: boolean;
    width?: string;
}
declare function CollapsibleSidebar({ side, children, defaultOpen, width }: CollapsibleSidebarProps): react_jsx_runtime.JSX.Element;

interface ViewportProps {
    className?: string;
}
declare function Viewport({ className }: ViewportProps): react_jsx_runtime.JSX.Element;

declare function Sidebar(): react_jsx_runtime.JSX.Element;

declare function PanoPanel(): react_jsx_runtime.JSX.Element;

declare function ScenePanel(): react_jsx_runtime.JSX.Element;

declare function MeasurementsPanel(): react_jsx_runtime.JSX.Element;

declare function ClassificationPanel(): react_jsx_runtime.JSX.Element;

declare function ScenesPanel(): react_jsx_runtime.JSX.Element;

interface ToolbarSectionProps {
    label?: string;
    children: React.ReactNode;
    className?: string;
}
declare function ToolbarSection({ label, children, className }: ToolbarSectionProps): react_jsx_runtime.JSX.Element;

interface MainToolbarProps {
    onOpenAbout?: () => void;
    onOpenCloudSelector?: () => void;
    onToggleSidebar?: () => void;
    onToggleRenderSettings?: () => void;
    sidebarOpen?: boolean;
    renderSettingsOpen?: boolean;
}
declare function MainToolbar({ onOpenAbout, onOpenCloudSelector, onToggleSidebar, onToggleRenderSettings, sidebarOpen, renderSettingsOpen }: MainToolbarProps): react_jsx_runtime.JSX.Element;
interface ToolbarIconBtnProps {
    icon: React.ReactNode;
    label?: string;
    active?: boolean;
    onClick?: () => void;
    title?: string;
}
declare function ToolbarIconBtn({ icon, label, active, onClick, title }: ToolbarIconBtnProps): react_jsx_runtime.JSX.Element;

declare function ViewControls(): react_jsx_runtime.JSX.Element;

declare function MeasureTools(): react_jsx_runtime.JSX.Element;

declare function SectionTools(): react_jsx_runtime.JSX.Element;

declare function DisplayControls(): react_jsx_runtime.JSX.Element;

declare function ExportTools(): react_jsx_runtime.JSX.Element;

declare function ToolRail(): react_jsx_runtime.JSX.Element;

declare function PanoViewer(): react_jsx_runtime.JSX.Element | null;

interface AboutDialogProps {
    onClose: () => void;
}
declare function AboutDialog({ onClose }: AboutDialogProps): react_jsx_runtime.JSX.Element;

interface RenderingSettingsProps {
    open: boolean;
    onClose: () => void;
}
declare function RenderingSettings({ open, onClose }: RenderingSettingsProps): react_jsx_runtime.JSX.Element | null;

/**
 * Renders a small XYZ orientation widget in the top-right corner of the
 * viewport using a second render pass with scissor clipping.
 *
 * Flat, technical-drawing style — no lighting, MeshBasicMaterial only.
 * Shows world-space orientation: the widget camera mirrors the main camera's
 * rotation so the user always sees how X, Y, Z axes are oriented relative
 * to the current view.
 */
declare class AxisWidget {
    private _scene;
    private _camera;
    private _disposables;
    private _materials;
    readonly sm: SceneManager;
    constructor(sm: SceneManager);
    private _buildAxes;
    /** Create a canvas-based sprite with the axis letter */
    private _makeLabel;
    /**
     * Render the widget into a scissor region in the top-right corner.
     * Must be called from a post-render callback after the main scene renders.
     */
    render(): void;
    dispose(): void;
}

/** Serialisable viewer scene / perspective */
interface ViewerScene {
    id: string;
    name: string;
    createdAt: string;
    camera: {
        position: [number, number, number];
        target: [number, number, number];
    };
    clipBoxes: Array<{
        name: string;
        min: [number, number, number];
        max: [number, number, number];
        mode: ClipMode;
        visible: boolean;
    }>;
    colorMode: string;
    pointSize: number;
    pointBudget: number;
}
/**
 * Persists viewer scenes (perspectives) in localStorage.
 * Key is derived from the source URL so each project keeps its own list.
 */
declare class PresentationManager {
    private storageKey;
    private scenes;
    onChange?: (scenes: ViewerScene[]) => void;
    constructor(sourceKey: string);
    private load;
    private persist;
    getScenes(): ViewerScene[];
    addScene(scene: Omit<ViewerScene, "id" | "createdAt">): ViewerScene;
    removeScene(id: string): void;
    renameScene(id: string, name: string): void;
    /** Export all scenes as a JSON string (for sharing / backup) */
    exportJSON(): string;
    /** Import scenes from JSON string, merging with existing */
    importJSON(json: string): number;
    clear(): void;
}
/** Helper: capture current viewer state into a scene object */
declare function captureScene(name: string, cameraPos: {
    x: number;
    y: number;
    z: number;
}, cameraTarget: {
    x: number;
    y: number;
    z: number;
}, clipBoxes: ClipBoxEntry[], colorMode: string, pointSize: number, pointBudget: number): Omit<ViewerScene, "id" | "createdAt">;

type ViewPreset = "top" | "bottom" | "front" | "back" | "left" | "right";
declare function useNavigationActions(): {
    navigationMode: NavigationMode;
    setNavigationMode: (mode: NavigationMode) => void;
    projection: CameraProjection;
    setProjection: (mode: CameraProjection) => void;
    fitToView: () => void;
    flyToView: (preset: ViewPreset) => void;
};

declare function useMeasurementActions(): {
    activeTool: ActiveTool;
    startTool: (type: MeasurementType) => void;
    cancelTool: () => void;
    measurements: Measurement[];
    clearAll: () => void;
    remove: (id: string) => void;
    rename: (id: string, name: string) => void;
    exportCSV: () => void;
};

declare function useClipActions(): {
    boxes: ClipBoxEntry[];
    selectedBoxId: string | null;
    hasClipBox: boolean;
    clipMode: ClipMode;
    addBox: () => void;
    clearAll: () => void;
    toggleMode: () => void;
    selectBox: (id: string | null) => void;
    setTransformMode: (mode: "translate" | "scale" | "rotate") => void;
};

type QualityPreset = "performance" | "balanced" | "high";
declare function useDisplayActions(): {
    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;
    pointBudget: number;
    setPointBudget: (v: number) => void;
    pointSize: number;
    setPointSize: (v: number) => void;
    setQualityPreset: (preset: QualityPreset) => void;
};

declare function useExportActions(): {
    capture: (options: ExportOptions) => Promise<string | null>;
    download: (dataUrl: string, filename: string) => void;
};

declare function useVisibilityActions(): {
    showMarkers: boolean;
    toggleMarkers: () => void;
    showMinimap: boolean;
    toggleMinimap: () => void;
};

declare function useDisplaySettings(): {
    settings: DisplaySettings;
    presets: Record<DisplayPreset, DisplaySettings>;
    applyPreset: (preset: DisplayPreset) => void;
    updateSetting: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void;
};

declare function cn(...inputs: ClassValue[]): string;
/** Format a number in meters with appropriate precision */
declare function formatLength(meters: number): string;
/** Format area in m² */
declare function formatArea(m2: number): string;
/** Format volume in m³ */
declare function formatVolume(m3: number): string;
/** Format angle in degrees */
declare function formatAngle(radians: number): string;
/** Format a 3D coordinate for display */
declare function formatCoord(x: number, y: number, z: number, decimals?: number): string;
/** Export measurements as a CSV string */
declare function exportMeasurementsCSV(measurements: Measurement[]): string;

declare function useLocale(): ViewerLocale;
interface LocaleProviderProps {
    locale?: ViewerLocale;
    children: ReactNode;
}
declare function LocaleProvider({ locale, children }: LocaleProviderProps): react_jsx_runtime.JSX.Element;

declare const en: ViewerLocale;

declare const de: ViewerLocale;

export { AboutDialog, type ActiveTool, AxisWidget, CameraAnimator, type CameraData, type CameraProjection, ClassificationPanel, type ClipBoxEntry, ClipManager, type ClipMode, CollapsibleSidebar, type ColorMode, DISPLAY_PRESETS, DataProvider, DisplayControls, type DisplayPreset, type DisplaySettings, type ElectronSource, ElectronSourceAdapter, type ExportFormat, ExportManager, type ExportOptions, ExportTools, type ExportView, FloatingPalette, type LocalSource, LocaleProvider, MainToolbar, MarkerManager, MeasureTools, type Measurement, MeasurementManager, type MeasurementType, MeasurementsPanel, MinimalLayout, MinimapRenderer, type NavigationMode, PanoCloudViewer, type PanoCloudViewerProps, PanoPanel, PanoViewer, PointCloudLoader, type PointCloudSource, PresentationManager, RenderingSettings, type S3Source, S3SourceAdapter, SceneManager, ScenePanel, ScenesPanel, SectionTools, Sidebar, ThemeProvider, ToolRail, ToolbarIconBtn, ToolbarSection, ViewControls, type ViewerLocale, ViewerProvider, type ViewerScene, Viewport, WorkspaceLayout, WorkstationLayout, captureScene, cn, createAdapter, createLocale, de, en, exportMeasurementsCSV, formatAngle, formatArea, formatCoord, formatLength, formatVolume, useClipActions, useData, useDisplayActions, useDisplaySettings, useExportActions, useLocale, useMeasurementActions, useNavigationActions, useTheme, useViewer, useVisibilityActions };
