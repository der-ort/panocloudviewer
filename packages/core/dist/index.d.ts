import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
type ExportView = "current" | "top" | "front" | "side" | "back" | "custom";
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
type UiMode = "professional" | "lite";
/**
 * Which 360° panorama viewer engine renders the equirectangular overlay when a
 * camera marker is opened.
 * - `"photo-sphere-viewer"` (default): feature-rich (zoom, markers, gallery,
 *   virtual-tour, …), Three.js based; loaded from CDN with its own isolated
 *   Three.js instance so it does not clash with the viewer's pinned Three.js.
 * - `"pannellum"`: lightweight, mature; loaded from CDN. Optional fallback.
 */
type PanoEngine = "pannellum" | "photo-sphere-viewer";
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
    /**
     * UI complexity mode.
     * - "professional" (default): full toolset — all measurements, clipping, display controls, export, all sidebar tabs.
     * - "lite": beginner set — nav modes, basic measurements (point/distance/height), panorama/minimap/theme toggles only.
     */
    uiMode?: UiMode;
    /**
     * Which 360° panorama engine renders the equirectangular overlay.
     * Defaults to `"photo-sphere-viewer"`.
     */
    panoEngine?: PanoEngine;
}
type ActiveTool = "none" | "measure-point" | "measure-distance" | "measure-height" | "measure-area" | "measure-volume" | "measure-angle" | "measure-profile" | "section-box" | "section-plane" | "annotate";
type NavigationMode = "orbit" | "free" | "pan";
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
    /**
     * When marker labels are shown.
     * - "hover"  (default): label shown only for the hovered/selected marker
     * - "always": all labels shown
     * - "hidden": no labels shown
     * Optional for backward compatibility with existing DisplaySettings literals.
     */
    markerLabelMode?: "hover" | "always" | "hidden";
}
declare const DISPLAY_PRESETS: Record<DisplayPreset, DisplaySettings>;

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
    private _navMode;
    private _projection;
    private _orthoCamera;
    /** Kept for API compatibility — no longer drives navigation */
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
     * Switch between navigation modes. All three reconfigure the SAME OrbitControls
     * instance (zoom-to-cursor + damping throughout) so the orbit target remains
     * authoritative for clipping, minimap, camera animation and ortho sync.
     * - orbit: CAD turntable — left-drag rotate, middle dolly, right pan, full sphere.
     * - free:  Blender-ish free orbit — left/middle drag rotate, right pan, full sphere.
     * - pan:   Map / top-down — left-drag pans, horizon-locked, right-drag rotates.
     */
    setNavigationMode(mode: NavigationMode): void;
    /**
     * Set fly movement speed. Kept for API compatibility.
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
    /** Coordinate reference system (proj4/WKT/EPSG). Empty/absent = not georeferenced. */
    projection?: string;
    offset?: [number, number, number];
    scale?: [number, number, number];
}
/** Georeference status of a loaded cloud (surfaced in the cloud info / About). */
interface GeoInfo {
    /** True when the cloud carries a non-empty CRS in metadata.json. */
    georeferenced: boolean;
    /** The raw CRS string (proj4/WKT/EPSG), or "" when absent. */
    projection: string;
}
/** Loads Potree 2.0 point clouds (octree.bin + hierarchy.bin + metadata.json) via potree-core */
declare class PointCloudLoader {
    private sceneManager;
    private adapter;
    private currentClouds;
    private hasRgb;
    /** CRS string from metadata.json (empty = not georeferenced). */
    private _projection;
    /** World-space bounding box of the loaded point cloud (available after load) */
    worldBox: THREE.Box3;
    constructor(sceneManager: SceneManager, adapter: FileSourceAdapter);
    /** Load a point cloud from the adapter's base URL */
    load(metadataPath?: string, pointBudget?: number): Promise<void>;
    /** Set color mode on all loaded clouds */
    setColorMode(mode: ColorMode): Promise<void>;
    /** Whether the loaded cloud has RGB data */
    get hasRgbData(): boolean;
    /** CRS string from metadata.json ("" when not georeferenced). */
    get projection(): string;
    /** Whether the cloud carries a non-empty CRS. */
    get isGeoreferenced(): boolean;
    /** Georeference status for the cloud info / About dialog. */
    getGeoInfo(): GeoInfo;
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

/** Easing curves for fly-to / keyframe animations. */
type Easing = "smooth" | "linear" | "easeInOut";
interface AnimOptions {
    position: THREE.Vector3;
    target: THREE.Vector3;
    /** Camera up vector to restore (prevents tilt when presets changed it). */
    up?: THREE.Vector3;
    duration?: number;
    easing?: Easing;
}
/** Smooth camera fly-to animation using requestAnimationFrame, no external deps */
declare class CameraAnimator {
    private camera;
    private controls;
    private animId;
    constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls);
    flyTo({ position, target, up, duration, easing }: AnimOptions): Promise<void>;
    /** Fly to a camera marker position (offset behind the camera by `offset` units) */
    flyToCamera(camPos: THREE.Vector3 | [number, number, number], yawDeg?: number, offset?: number, duration?: number): Promise<void>;
    cancel(): void;
}

/**
 * 3D panorama camera markers.
 *
 * Each marker is a small constant on-screen-size pin sprite
 * (sizeAttenuation:false) in brand yellow, always visible through the point
 * cloud via depthTest=false. A subtle text label sits above the pin and is
 * hidden by default — it appears only on hover/selection (markerLabelMode).
 *
 * The pin sprites are returned from getMeshes() as the raycast targets; Sprite
 * is raycastable in three r170. One pin per camera, in camera index order.
 */
declare class MarkerManager {
    private scene;
    private entries;
    private group;
    private hoveredIdx;
    private selectedIdx;
    private labelMode;
    private _displaySettings;
    private _cameras;
    private _worldBox?;
    /** Shared circular pin texture (reused across all pins; tinted via material.color). */
    private _pinTexture?;
    /** World-space vertical offset for the label anchor above the pin. */
    private _labelOffset;
    /** Optional clip predicate — markers whose position fails it are hidden. */
    private _clipFilter;
    constructor(scene: THREE.Scene);
    /** Apply new display settings and rebuild all markers */
    applyDisplaySettings(settings: DisplaySettings): void;
    /** Build markers from camera data. Pass worldBox for auto-scaling. */
    build(cameras: CameraData[], worldBox?: THREE.Box3): void;
    /**
     * Hide panorama markers whose camera position falls outside the kept clip
     * region. Pass `null` to clear the filter (all markers visible). The predicate
     * is typically `ClipManager.isPointVisible`.
     */
    applyClipFilter(predicate: ((pos: THREE.Vector3) => boolean) | null): void;
    /** Whether a marker survives the active clip filter. */
    private _passesClip;
    private _applyAllMarkerVisibility;
    /** Lazily build (and cache) the shared circular pin texture. */
    private _getPinTexture;
    private _makePin;
    private _makeLabel;
    /** Update pin color by index */
    private _recolor;
    /** Resolve whether a marker's label should be visible under the current mode. */
    private _labelShouldShow;
    private _applyLabelVisibility;
    setVisible(visible: boolean): void;
    /** Return pin sprites for raycasting (one per camera, index order) */
    getMeshes(): THREE.Object3D[];
    setHovered(idx: number): void;
    setSelected(idx: number): void;
    clear(): void;
    dispose(): void;
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
    private _snapCross;
    private _snapLine;
    private _crossTexture?;
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
    /** Build (and cache) the stylized crosshair sprite texture. */
    private _getCrossTexture;
    /** Show/hide ALL measurement objects (the whole group) — used by the Layers panel. */
    setVisible(visible: boolean): void;
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

/** Options for {@link ExportManager.recordAnimation}. */
interface RecordOptions {
    /** Set the camera for absolute time `t` (seconds). Called once per frame. */
    sampleCamera: (t: number) => void;
    /** Total animation length in seconds. */
    durationSec: number;
    fps?: number;
    width?: number;
    height?: number;
    background?: "white" | "black" | "transparent";
    bitrate?: number;
    onProgress?: (fraction: number) => void;
}
/** Renders orthographic views and exports them as image files */
declare class ExportManager {
    private sceneManager;
    constructor(sceneManager: SceneManager);
    /**
     * Record a camera animation to an MP4 Blob by rendering **frame by frame** at a
     * fixed resolution (default 1920×1080) and encoding with WebCodecs (exact
     * per-frame timestamps → no stutter, high bitrate → not over-compressed).
     * Rendering is deterministic (not real-time), so it's smooth regardless of how
     * long each frame takes. Requires WebCodecs (Chrome/Edge).
     */
    recordAnimation(opts: RecordOptions): Promise<Blob>;
    /** World-space bounds of the loaded point clouds (potree octrees aren't Meshes). */
    private cloudBounds;
    /**
     * Capture a view to an image data URL. `view: "current"` snapshots exactly what
     * the user sees (the live camera); the other views render an orthographic shot
     * framed to the cloud bounds.
     */
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
    /** Orientation of the box (full 3-axis rotation). */
    private _quaternion;
    constructor(scene: THREE.Scene, camera: THREE.Camera, domElement: HTMLElement);
    private createHandles;
    attach(box: THREE.Box3, onChange: (box: THREE.Box3) => void): void;
    /** Set the box's orientation (full 3-axis) so handles follow it. */
    setQuaternion(q: THREE.Quaternion): void;
    detach(): void;
    isAttached(): boolean;
    /** Show/hide the whole handle group without detaching (keeps box binding). */
    setGroupVisible(visible: boolean): void;
    isDragging(): boolean;
    getHandleMeshes(): THREE.Mesh[];
    /** Update handle positions and sizes to match the current box */
    updatePositions(): void;
    /**
     * Try to start a drag. Call on pointerdown.
     * Returns true if a handle was grabbed (caller should disable orbit controls).
     */
    onPointerDown(clientX: number, clientY: number): boolean;
    /** World-space unit vector for a box-local face axis, rotated by the box orientation. */
    private worldAxisFor;
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
    /** Box orientation (full 3-axis rotation). Defaults to identity. */
    quaternion: THREE.Quaternion;
}
/** Manages multiple named clip boxes with TransformControls support */
declare class ClipManager {
    private sm;
    private entries;
    private helpers;
    private fills;
    private draftHelper;
    private selectedId;
    /** Move gizmo (translate arrows) — used in "translate" transform mode. */
    private tcMove;
    /** Rotate gizmo (full XYZ rings) — used in "rotate" transform mode. */
    private tcRotate;
    private pivot;
    private _faceHandles;
    /** Active transform mode for the selected box (move / scale / rotate). */
    private _transformMode;
    /** Global clipping enable flag. When false, boxes stay visible but no clipping is applied. */
    private _enabled;
    /** Whether box outlines / fills / handles render at all (off = clean screenshots). */
    private _outlinesVisible;
    onChange?: (boxes: ClipBoxEntry[]) => void;
    onSelectChange?: (id: string | null) => void;
    constructor(sm: SceneManager);
    private initTransformControls;
    /**
     * Force the TransformControls gizmos to render on top of the point cloud.
     * The gizmos use default materials (depthTest=true, renderOrder=0) so they are
     * occluded by the dense cloud. Traverse each gizmo tree and disable depth
     * testing so the arrows/rings draw through.
     */
    private _raiseGizmo;
    /**
     * Build an axis-aligned box centered on the current view target, sized to sit
     * comfortably INSIDE the viewport at the current camera distance, then clamped
     * to the cloud bounds. This replaces the old behavior of spanning the whole
     * world box, which routinely extended far outside the viewport (and dwarfed
     * the resize handles). The result is always fully visible and easy to grab.
     */
    makeViewportBox(worldBox?: THREE.Box3): THREE.Box3;
    /**
     * Add a clip box sized to fit the current viewport (see {@link makeViewportBox}).
     * Preferred over `addBox(worldBox.clone())` for the "create default box" action.
     */
    addDefaultBox(worldBox?: THREE.Box3, name?: string): ClipBoxEntry;
    addBox(box: THREE.Box3, name?: string): ClipBoxEntry;
    selectBox(id: string | null): Promise<void>;
    /** Switch the active transform mode for the selected box (move/scale/rotate). */
    setTransformMode(mode: "translate" | "scale" | "rotate"): void;
    getTransformMode(): "translate" | "scale" | "rotate";
    /** Get the face handle controller (for viewport event forwarding) */
    get faceHandles(): FaceHandleController | null;
    /** Attach the face-resize handles to the selected box with the sync callback. */
    private _attachFaceHandles;
    /**
     * Show only the handles for the active mode:
     * - `scale` → 6 face-resize spheres (no gizmos),
     * - `translate` → move arrows,
     * - `rotate` → full XYZ rotation rings.
     * Keeping a single set active avoids overlapping handles grabbing each other.
     */
    private _applyTransformMode;
    /** Detach both gizmos. */
    private _detachGizmos;
    /**
     * Reset a box's orientation back to axis-aligned (identity rotation). Targets
     * the given box, or the selected one when omitted.
     */
    resetRotation(id?: string): void;
    removeBox(id: string): void;
    setBoxMode(id: string, mode: ClipMode): void;
    /**
     * Set the clip mode for ALL boxes at once. potree-core only supports a single
     * global clip mode, so boxes must never diverge — use this instead of
     * per-box setBoxMode when changing the effective mode.
     */
    setModeAll(mode: ClipMode): void;
    /**
     * Globally enable/disable clipping without removing any boxes. When disabled,
     * boxes remain visible as wireframes/fills but no actual clipping is applied.
     */
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    /**
     * Whether a world-space point survives the current clipping (i.e. is part of
     * the kept/visible region). Used to cull out-of-bounds panorama markers and to
     * reject picks on clipped-away points. Returns true when clipping is off or
     * there are no visible boxes.
     */
    isPointVisible(p: THREE.Vector3): boolean;
    /** Point-in-(rotated)-box test using the entry's center, size and quaternion. */
    private _pointInBox;
    /**
     * Globally show/hide ALL box outlines, fills, handles and gizmos WITHOUT
     * affecting clipping — clipping stays active so you keep the cropped view but
     * get a clean image (e.g. for screenshots). Per-box visibility still applies
     * when outlines are on.
     */
    setOutlinesVisible(visible: boolean): void;
    areOutlinesVisible(): boolean;
    /** Apply the global outline flag (and per-box visibility) to all scene objects. */
    private _applyOutlineVisibility;
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
    /**
     * Set wireframe color: selected → bright yellow; deselected → black so the
     * inactive crop boxes recede (and read cleanly on light point clouds).
     */
    private _highlightHelper;
    private updateHelper;
    private applyAll;
}

/**
 * Renders a small XYZ orientation widget in the bottom-left corner of the
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
     * Render the widget into a scissor region in the bottom-left corner.
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
        /** Camera up vector. Optional for backward compat with older saved scenes. */
        up?: [number, number, number];
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
}, clipBoxes: ClipBoxEntry[], colorMode: string, pointSize: number, pointBudget: number, cameraUp?: {
    x: number;
    y: number;
    z: number;
}): Omit<ViewerScene, "id" | "createdAt">;

/** Format a length in meters — always metric, 2 decimals. */
declare function formatLength(meters: number): string;
/** Format area in square meters — always metric, 2 decimals. */
declare function formatArea(m2: number): string;
/** Format volume in cubic meters — always metric, 2 decimals. */
declare function formatVolume(m3: number): string;
/** Format angle in degrees */
declare function formatAngle(radians: number): string;
/** Format a 3D coordinate for display */
declare function formatCoord(x: number, y: number, z: number, decimals?: number): string;
/** Export measurements as a CSV string */
declare function exportMeasurementsCSV(measurements: Measurement[]): string;

export { type ActiveTool, AxisWidget, CameraAnimator, type CameraData, type CameraPosition, type CameraProjection, type CameraRotation, type ClipBoxEntry, ClipManager, type ClipMode, type ColorMode, DISPLAY_PRESETS, type DisplayPreset, type DisplaySettings, type Easing, type ElectronSource, ElectronSourceAdapter, type ExportFormat, ExportManager, type ExportOptions, type ExportView, type FileSourceAdapter, type GeoInfo, type LocalSource, MarkerManager, type Measurement, MeasurementManager, type MeasurementType, MinimapRenderer, type NavigationMode, type PanoEngine, PointCloudLoader, type PointCloudMetadata, type PointCloudSource, PresentationManager, type RecordOptions, type S3Source, S3SourceAdapter, SceneManager, type SceneManagerOptions, type Theme, type UiMode, type ViewerConfig, type ViewerScene, captureScene, createAdapter, exportMeasurementsCSV, formatAngle, formatArea, formatCoord, formatLength, formatVolume };
