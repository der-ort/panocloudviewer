import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as SelectPrimitive from '@radix-ui/react-select';
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
    constructor(scene: THREE.Scene);
    /** Apply new display settings and rebuild all markers */
    applyDisplaySettings(settings: DisplaySettings): void;
    /** Build markers from camera data. Pass worldBox for auto-scaling. */
    build(cameras: CameraData[], worldBox?: THREE.Box3): void;
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
    /** Move gizmo (translate arrows) — shown together with the rotate gizmo + face handles. */
    private tcMove;
    /** Rotate gizmo (full XYZ rings) — shown together with the move gizmo + face handles. */
    private tcRotate;
    private pivot;
    private _faceHandles;
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
    /**
     * @deprecated Transform handles (move, rotate, resize) are now shown together,
     * so there is no single active mode. Kept as a no-op for API compatibility.
     */
    setTransformMode(_mode?: "translate" | "scale" | "rotate"): void;
    /** Get the face handle controller (for viewport event forwarding) */
    get faceHandles(): FaceHandleController | null;
    /** Attach both gizmos to the current pivot (move + full-XYZ rotate). */
    private _attachGizmos;
    /** Detach both gizmos. */
    private _detachGizmos;
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
        navFree: string;
        navPan: string;
        navOrbitTitle: string;
        navFreeTitle: string;
        navPanTitle: string;
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
        move: string;
        scale: string;
        rotateZ: string;
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
declare function createLocale(base: ViewerLocale, overrides: DeepPartial<ViewerLocale>): ViewerLocale;
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

declare const buttonVariants: (props?: ({
    variant?: "default" | "secondary" | "ghost" | "outline" | "destructive" | null | undefined;
    size?: "icon" | "sm" | "md" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
}
declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLSpanElement>>;

declare const Dialog: React.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: React.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const DialogPortal: React.FC<DialogPrimitive.DialogPortalProps>;
declare const DialogOverlay: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const DialogContent: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
    /** Portal container — pass the `.pcv` root so themed tokens apply to the portalled dialog. */
    container?: HTMLElement | null;
    /**
     * Drag offset in pixels. When provided the dialog is translated by this amount
     * relative to its centered position. Centering (-50%, -50%) is always preserved
     * and composed with the drag offset so the dialog stays centered when offset is {0,0}.
     */
    dragOffset?: {
        x: number;
        y: number;
    };
} & React.RefAttributes<HTMLDivElement>>;
declare const DialogHeader: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const DialogTitle: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
declare const DialogClose: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogCloseProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;

declare const Tabs: React.ForwardRefExoticComponent<TabsPrimitive.TabsProps & React.RefAttributes<HTMLDivElement>>;
declare const TabsList: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const TabsTrigger: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
declare const TabsContent: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;

declare const Popover: React.FC<PopoverPrimitive.PopoverProps>;
declare const PopoverTrigger: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const PopoverAnchor: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverAnchorProps & React.RefAttributes<HTMLDivElement>>;
declare const PopoverContent: React.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;

declare const TooltipProvider: React.FC<TooltipPrimitive.TooltipProviderProps>;
declare const Tooltip: React.FC<TooltipPrimitive.TooltipProps>;
declare const TooltipTrigger: React.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const TooltipContent: React.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;

declare const toggleVariants: (props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "icon" | "sm" | "md" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ToggleProps extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>, VariantProps<typeof toggleVariants> {
}
declare const Toggle: React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<HTMLButtonElement>>;

declare const Select: React.FC<SelectPrimitive.SelectProps>;
declare const SelectGroup: React.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & React.RefAttributes<HTMLDivElement>>;
declare const SelectValue: React.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & React.RefAttributes<HTMLSpanElement>>;
declare const SelectTrigger: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
declare const SelectScrollUpButton: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollUpButtonProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectScrollDownButton: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollDownButtonProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectContent: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectLabel: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectItem: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectSeparator: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;

interface ViewerComponents {
    Button: React.ComponentType<ButtonProps>;
    Slider: React.ComponentType<SliderProps>;
    Toggle: React.ComponentType<ToggleProps>;
    Dialog: typeof Dialog;
    DialogTrigger: typeof DialogTrigger;
    DialogContent: typeof DialogContent;
    DialogHeader: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
    DialogTitle: typeof DialogTitle;
    DialogClose: typeof DialogClose;
    Tabs: typeof Tabs;
    TabsList: typeof TabsList;
    TabsTrigger: typeof TabsTrigger;
    TabsContent: typeof TabsContent;
    Popover: typeof Popover;
    PopoverTrigger: typeof PopoverTrigger;
    PopoverContent: typeof PopoverContent;
    TooltipProvider: typeof TooltipProvider;
    Tooltip: typeof Tooltip;
    TooltipTrigger: typeof TooltipTrigger;
    TooltipContent: typeof TooltipContent;
    Select: typeof Select;
    SelectGroup: typeof SelectGroup;
    SelectValue: typeof SelectValue;
    SelectTrigger: typeof SelectTrigger;
    SelectContent: typeof SelectContent;
    SelectLabel: typeof SelectLabel;
    SelectItem: typeof SelectItem;
    SelectSeparator: typeof SelectSeparator;
}
declare const defaultComponents: ViewerComponents;
interface ComponentsProviderProps {
    /** Partial overrides merged over the shadcn-style defaults. */
    components?: Partial<ViewerComponents>;
    children: ReactNode;
}
declare function ComponentsProvider({ components, children, }: ComponentsProviderProps): react_jsx_runtime.JSX.Element;
/**
 * Returns the active component set from the nearest ComponentsProvider.
 * Falls back to `defaultComponents` if no provider is present so that
 * individual primitives used outside a full PanoCloudViewer tree still work.
 */
declare function useComponents(): ViewerComponents;

/**
 * Returns a ref to the `.pcv` root element.
 * Use this as the `container` prop for Radix Portal and createPortal so that
 * portalled content inherits the viewer's scoped CSS custom properties.
 *
 * @example
 * function MyDialog() {
 *   const pcvRef = usePcvRoot();
 *   return (
 *     <Dialog.Portal container={pcvRef?.current ?? undefined}>
 *       ...
 *     </Dialog.Portal>
 *   );
 * }
 */
declare function usePcvRoot(): React.RefObject<HTMLDivElement | null> | null;
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
     * UI complexity mode.
     * - `"professional"` (default): full toolset — all measurements, clipping, display controls, export, all sidebar tabs.
     * - `"lite"`: beginner set — nav modes, basic measurements, panorama/minimap/theme toggles only.
     */
    uiMode?: UiMode;
    /**
     * Which 360° panorama engine renders the equirectangular overlay when a camera
     * marker is opened. Defaults to `"photo-sphere-viewer"`.
     *
     * - `"photo-sphere-viewer"` (default): feature-rich ([photo-sphere-viewer.js.org](https://photo-sphere-viewer.js.org)),
     *   Three.js based, with on-screen zoom/move/fullscreen controls. Loaded from
     *   CDN with its own isolated Three.js instance, so it does not clash with the
     *   viewer's pinned Three.js version.
     * - `"pannellum"`: lightweight, mature; loaded from CDN. Optional fallback.
     *
     * @example
     * <PanoCloudViewer source={source} panoEngine="pannellum" />
     */
    panoEngine?: PanoEngine;
    /**
     * Scale factor for the UI chrome (toolbars, tool-rail, sidebar, floating
     * palettes, dialogs / overlay panels, status bar). Defaults to `1`.
     *
     * Only the chrome is scaled — the 3D viewport / canvas stays at native
     * resolution and full size, so the point-cloud view remains crisp and you
     * don't lose view area. Implemented via a `--pcv-scale` CSS custom property
     * on the `.pcv` root that chrome containers consume through `zoom`.
     *
     * @example
     * // Enlarge all controls by 25% for touch / high-DPI displays
     * <PanoCloudViewer source={source} uiScale={1.25} />
     */
    uiScale?: number;
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
    /**
     * Override any of the default shadcn-style UI primitives.
     * Shallow-merged over the built-in defaults. Useful for consumers who
     * already have a component library and want to swap out e.g. Dialog or Button.
     *
     * @example
     * import { Button } from '@/components/ui/button'; // your own shadcn button
     * <PanoCloudViewer components={{ Button }} ... />
     */
    components?: Partial<ViewerComponents>;
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
declare function PanoCloudViewer({ source, theme, className, locale, uiMode, panoEngine, uiScale, children, components }: PanoCloudViewerProps): react_jsx_runtime.JSX.Element;

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
    /** Resolved UI mode — defaults to "professional" when not set in config */
    uiMode: UiMode;
    /** Active panorama engine — seeded from config (default "photo-sphere-viewer"); switchable at runtime */
    panoEngine: PanoEngine;
    setPanoEngine: (engine: PanoEngine) => void;
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
    onOpenCloudSelector?: () => void;
    onToggleRenderSettings?: () => void;
    onToggleQuickSettings?: () => void;
    renderSettingsOpen?: boolean;
    quickSettingsOpen?: boolean;
}
declare function MainToolbar({ onOpenCloudSelector, onToggleRenderSettings, onToggleQuickSettings, renderSettingsOpen, quickSettingsOpen }: MainToolbarProps): react_jsx_runtime.JSX.Element;
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

declare function ClipToolbar(): react_jsx_runtime.JSX.Element | null;

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

interface DisplaySettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
declare function DisplaySettingsDialog({ open, onOpenChange, }: DisplaySettingsDialogProps): react_jsx_runtime.JSX.Element;

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
    isEnabled: boolean;
    outlinesVisible: boolean;
    addBox: () => void;
    clearAll: () => void;
    toggleMode: () => void;
    setEnabled: (enabled: boolean) => void;
    setOutlinesVisible: (visible: boolean) => void;
    selectBox: (id: string | null) => void;
    removeBox: (id: string) => void;
    setBoxVisible: (id: string, visible: boolean) => void;
    setModeAll: (mode: "outside" | "inside") => void;
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

interface DraggableState {
    /** offset applied via transform: translate(x, y) */
    position: {
        x: number;
        y: number;
    };
    /** attach to the drag-handle element's onMouseDown */
    onDragStart: (e: React.MouseEvent) => void;
    /** reset back to {0,0} */
    reset: () => void;
}
interface UseDraggableOptions {
    /** Optional container; the grabbed point is kept within its bounds so the panel can't be lost off-screen. */
    bounds?: React.RefObject<HTMLElement | null>;
}
/**
 * Drag-to-move hook. Attach `onDragStart` to a header element's `onMouseDown`
 * and apply `transform: translate(position.x, position.y)` to the panel.
 */
declare function useDraggable(options?: UseDraggableOptions): DraggableState;

declare function cn(...inputs: ClassValue[]): string;

declare function useLocale(): ViewerLocale;
interface LocaleProviderProps {
    locale?: ViewerLocale;
    children: ReactNode;
}
declare function LocaleProvider({ locale, children }: LocaleProviderProps): react_jsx_runtime.JSX.Element;

declare const en: ViewerLocale;

declare const de: ViewerLocale;

export { AboutDialog, type ActiveTool, AxisWidget, Button, type ButtonProps, CameraAnimator, type CameraData, type CameraPosition, type CameraProjection, type CameraRotation, ClassificationPanel, type ClipBoxEntry, ClipManager, type ClipMode, ClipToolbar, CollapsibleSidebar, type ColorMode, ComponentsProvider, type ComponentsProviderProps, DISPLAY_PRESETS, DataProvider, Dialog, DialogClose, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, DisplayControls, type DisplayPreset, type DisplaySettings, DisplaySettingsDialog, type DraggableState, type ElectronSource, ElectronSourceAdapter, type ExportFormat, ExportManager, type ExportOptions, ExportTools, type ExportView, type FileSourceAdapter, FloatingPalette, type LocalSource, LocaleProvider, MainToolbar, MarkerManager, MeasureTools, type Measurement, MeasurementManager, type MeasurementType, MeasurementsPanel, MinimalLayout, MinimapRenderer, type NavigationMode, PanoCloudViewer, type PanoCloudViewerProps, type PanoEngine, PanoPanel, PanoViewer, PointCloudLoader, type PointCloudMetadata, type PointCloudSource, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, PresentationManager, RenderingSettings, type S3Source, S3SourceAdapter, SceneManager, type SceneManagerOptions, ScenePanel, ScenesPanel, SectionTools, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, Sidebar, Slider, type SliderProps, Tabs, TabsContent, TabsList, TabsTrigger, type Theme, ThemeProvider, Toggle, type ToggleProps, ToolRail, ToolbarIconBtn, ToolbarSection, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type UiMode, type UseDraggableOptions, ViewControls, type ViewerComponents, type ViewerConfig, type ViewerLocale, ViewerProvider, type ViewerScene, Viewport, WorkspaceLayout, WorkstationLayout, buttonVariants, captureScene, cn, createAdapter, createLocale, de, defaultComponents, en, exportMeasurementsCSV, formatAngle, formatArea, formatCoord, formatLength, formatVolume, toggleVariants, useClipActions, useComponents, useData, useDisplayActions, useDisplaySettings, useDraggable, useExportActions, useLocale, useMeasurementActions, useNavigationActions, usePcvRoot, useTheme, useViewer, useVisibilityActions };
