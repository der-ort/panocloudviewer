# PanoCloudViewer — API Reference

Complete reference for `@der-ort/pano-cloud-viewer`. All types and exports are based on the actual source code.

---

## Table of Contents

1. [`<PanoCloudViewer>`](#1-panocloudviewer)
2. [`<WorkspaceLayout>`](#2-workspacelayout)
3. [`<Viewport>`](#3-viewport)
4. [Toolbar Components](#4-toolbar-components)
5. [Sidebar Components](#5-sidebar-components)
6. [Overlay Components](#6-overlay-components)
7. [`useViewer()` hook](#7-useviewer-hook)
8. [`useData()` hook](#8-usedata-hook)
9. [`useTheme()` hook](#9-usetheme-hook)
10. [`useLocale()` hook](#10-uselocale-hook)
11. [Manager Classes](#11-manager-classes)
12. [Types](#12-types)
13. [Source Adapters](#13-source-adapters)
14. [i18n](#14-i18n)

---

## 1. `<PanoCloudViewer>`

Drop-in component. Sets up all providers and renders the full viewer shell.

```tsx
import { PanoCloudViewer } from '@der-ort/pano-cloud-viewer';
import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';

<PanoCloudViewer
  source={{ type: 's3', baseUrl: 'https://bucket.s3.amazonaws.com/project/' }}
  theme="dark"
/>
```

The component fills its container — give the container an explicit size.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `source` | `PointCloudSource` | required | Data source (S3, Electron, or local) |
| `theme` | `"dark" \| "light"` | `"dark"` | Initial color theme |
| `className` | `string` | `undefined` | Extra CSS class on the root `<div>` |
| `locale` | `ViewerLocale` | `en` | UI language / string overrides |

### Provider tree

`PanoCloudViewer` wraps these providers in order (outermost to innermost):
`LocaleProvider` → `ThemeProvider` → `DataProvider` → `ViewerProvider` → `WorkspaceLayout`

---

## 2. `<WorkspaceLayout>`

Shell layout component. Renders: top toolbar (`MainToolbar`) → left tool rail (`ToolRail`) → central viewport (`Viewport`, lazy) → right sidebar (`Sidebar`) → bottom status bar.

Must be inside `ViewerProvider`, `DataProvider`, `ThemeProvider`, and `LocaleProvider`.

```tsx
import { WorkspaceLayout } from '@der-ort/pano-cloud-viewer';

// Custom layout — provide your own providers
<ViewerProvider config={config}>
  <DataProvider adapter={adapter}>
    <WorkspaceLayout className="my-custom-class" />
  </DataProvider>
</ViewerProvider>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | `undefined` | Extra CSS class on the root flex container |

The right sidebar toggles open/closed via internal state. The `Viewport` is loaded with `React.lazy` — a spinner fallback is shown while it initialises.

---

## 3. `<Viewport>`

Core Three.js component. Initialises all manager instances, runs the render loop, and handles mouse events. Renders the 3D canvas, minimap overlay, and tool hint bar.

Must be inside `ViewerProvider` and `DataProvider`.

```tsx
import { Viewport } from '@der-ort/pano-cloud-viewer';

// Standalone usage — embed just the 3D canvas
<div style={{ width: 800, height: 600 }}>
  <Viewport className="rounded-lg" />
</div>
```

**Note:** `Viewport` should be lazy-imported in Next.js or any SSR environment to prevent server-side errors:
```tsx
const Viewport = dynamic(() => import('@der-ort/pano-cloud-viewer').then(m => ({ default: m.Viewport })), { ssr: false });
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | `undefined` | Extra CSS class on the container div |

### What Viewport initialises

On first mount, Viewport creates and registers in `ViewerProvider`: `SceneManager`, `PointCloudLoader`, `MeasurementManager`, `MarkerManager`, `CameraAnimator`, `ExportManager`, `MinimapRenderer`, `ClipManager`.

---

## 4. Toolbar Components

All toolbar components must be inside `ViewerProvider`. They read state via `useViewer()` and dispatch actions through it.

| Component | Description |
|---|---|
| `<MainToolbar>` | Full top bar: logo, view preset buttons, display controls, navigation mode selector, theme toggle, sidebar toggle, about button |
| `<ViewControls>` | View preset buttons (top, front, back, left, right) — flies camera to orthographic-style positions |
| `<DisplayControls>` | Navigation mode buttons (orbit/fly/earth), color mode selector, quality preset selector, point budget slider, point size slider |
| `<MeasureTools>` | Measurement tool buttons (point, distance, height, area, volume, angle, profile) + clear all |
| `<SectionTools>` | Clip box draw tool, mode toggle (keep inside / keep outside), remove box button |
| `<ExportTools>` | Export image panel — view selector, scale, background, format, download button |
| `<ToolRail>` | Left-side vertical icon strip grouping `MeasureTools` and `SectionTools` with collapsible groups |

### `<MainToolbar>` props

| Prop | Type | Description |
|---|---|---|
| `onToggleSidebar` | `() => void` | Called when sidebar toggle button is clicked |
| `sidebarOpen` | `boolean` | Controls the sidebar toggle button active state |
| `onToggleRenderSettings` | `() => void` | Called when rendering settings button is clicked |
| `renderSettingsOpen` | `boolean` | Controls the rendering settings button active state |

### `<ToolbarIconBtn>` and `<ToolbarSection>` (named exports from `main-toolbar`)

Primitive building blocks for custom toolbars. `ToolbarIconBtn` is a styled icon button with active/disabled states. `ToolbarSection` is a flex row group with an optional divider.

---

## 5. Sidebar Components

All sidebar components must be inside `ViewerProvider` and `DataProvider`.

| Component | Description |
|---|---|
| `<Sidebar>` | Tabbed container for all sidebar panels; tabs: Panoramas, Scene, Measurements, Classification, Scenes |
| `<PanoPanel>` | Searchable list of panorama cameras with fly-to buttons |
| `<ScenePanel>` | Point cloud visibility, measurement list, section list |
| `<MeasurementsPanel>` | List of all measurements with values, CSV export, clear all |
| `<ClassificationPanel>` | LAS classification filter checkboxes |
| `<ScenesPanel>` | Save/restore named viewer scenes (camera + clip boxes + display settings), JSON import/export |

---

## 6. Overlay Components

| Component | Description |
|---|---|
| `<PanoViewer>` | Full-screen 360° panorama viewer (Pannellum). Rendered by `WorkspaceLayout` when `selectedCamera` is set in `ViewerProvider`. |
| `<AboutDialog>` | Modal dialog showing library version, engine credits |
| `<RenderingSettings>` | Slide-out panel for fine-grained rendering adjustments (gamma, brightness, contrast, elevation range, opacity) |

### `<RenderingSettings>` props

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Whether the panel is visible |
| `onClose` | `() => void` | Called when the close button is clicked |

---

## 7. `useViewer()` hook

Returns the full viewer context. Must be used inside `<ViewerProvider>`.

```tsx
import { useViewer } from '@der-ort/pano-cloud-viewer';

function MyComponent() {
  const { sceneManager, loader, fps, activeTool, setActiveTool } = useViewer();
  // ...
}
```

### Return value

#### Manager refs (null until Viewport initialises)

| Property | Type | Description |
|---|---|---|
| `sceneManager` | `SceneManager \| null` | Three.js scene, camera, renderer, controls |
| `loader` | `PointCloudLoader \| null` | Potree point cloud loader |
| `measurementManager` | `MeasurementManager \| null` | Interactive 3D measurements |
| `markerManager` | `MarkerManager \| null` | Panorama camera sprite markers |
| `cameraAnimator` | `CameraAnimator \| null` | Smooth fly-to camera animations |
| `exporter` | `ExportManager \| null` | Orthographic image export |
| `minimap` | `MinimapRenderer \| null` | Top-down minimap renderer |
| `clipManager` | `ClipManager \| null` | Clip box management |

#### Manager setters (used by Viewport — not normally called by consumers)

`setSceneManager`, `setLoader`, `setMeasurementManager`, `setMarkerManager`, `setCameraAnimator`, `setExporter`, `setMinimap`, `setClipManager`

#### UI state

| Property | Type | Default | Description |
|---|---|---|---|
| `activeTool` | `ActiveTool` | `"none"` | Currently active interaction tool |
| `setActiveTool` | `(tool: ActiveTool) => void` | — | Set the active tool |
| `pointBudget` | `number` | `2_000_000` | Max points rendered per frame |
| `setPointBudget` | `(v: number) => void` | — | Update point budget |
| `pointSize` | `number` | `1.5` | Point size in pixels |
| `setPointSize` | `(v: number) => void` | — | Update point size |
| `fps` | `number` | `0` | Current frames per second (updated every second) |
| `setFps` | `(v: number) => void` | — | Internal — set by SceneManager |
| `pointCount` | `number` | `0` | Total points in loaded cloud |
| `setPointCount` | `(v: number) => void` | — | Internal setter |
| `measurementList` | `Measurement[]` | `[]` | All completed measurements |
| `setMeasurementList` | `React.Dispatch<SetStateAction<Measurement[]>>` | — | Internal — set by MeasurementManager |
| `showMarkers` | `boolean` | `true` | Whether pano camera markers are visible |
| `setShowMarkers` | `(v: boolean) => void` | — | Toggle marker visibility |
| `showMinimap` | `boolean` | `true` | Whether the minimap overlay is shown |
| `setShowMinimap` | `(v: boolean) => void` | — | Toggle minimap |
| `selectedCamera` | `CameraData \| null` | `null` | Currently selected panorama camera |
| `setSelectedCamera` | `(cam: CameraData \| null) => void` | — | Select a camera (opens PanoViewer) |
| `clipBoxEntries` | `ClipBoxEntry[]` | `[]` | All active clip boxes |
| `setClipBoxEntries` | `React.Dispatch<SetStateAction<ClipBoxEntry[]>>` | — | Internal — set by ClipManager |
| `selectedClipBoxId` | `string \| null` | `null` | ID of currently selected clip box |
| `setSelectedClipBoxId` | `(id: string \| null) => void` | — | Select a clip box |
| `colorMode` | `ColorMode` | `"rgb"` | Current point color mode |
| `setColorMode` | `(mode: ColorMode) => void` | — | Change color mode |
| `navigationMode` | `NavigationMode` | `"orbit"` | Current navigation mode |
| `setNavigationMode` | `(mode: NavigationMode) => void` | — | Change navigation mode |
| `config` | `ViewerConfig` | — | The config object passed to ViewerProvider |

---

## 8. `useData()` hook

Returns metadata and camera data loaded from the adapter. Must be used inside `<DataProvider>`.

```tsx
import { useData } from '@der-ort/pano-cloud-viewer';

function MyComponent() {
  const { cameras, metadata, loading, error, reload } = useData();
}
```

### Return value

| Property | Type | Description |
|---|---|---|
| `cameras` | `CameraData[]` | Panorama camera list from `cameras.json`. Image URLs are resolved to absolute URLs. `[]` if file not found. |
| `metadata` | `PointCloudMetadata \| null` | Point cloud metadata from `metadata.json`. `null` until loaded. |
| `loading` | `boolean` | `true` while initial fetch is in progress |
| `error` | `string \| null` | Error message if fetch failed |
| `reload` | `() => void` | Trigger a re-fetch |

### `PointCloudMetadata`

```typescript
interface PointCloudMetadata {
  name: string;
  points: number;
  boundingBox: { min: [number, number, number]; max: [number, number, number] };
  spacing?: number;
  version?: string;
}
```

---

## 9. `useTheme()` hook

Returns theme state. Must be used inside `<ThemeProvider>`.

```tsx
import { useTheme } from '@der-ort/pano-cloud-viewer';

function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
}
```

### Return value

| Property | Type | Description |
|---|---|---|
| `theme` | `Theme` | Stored theme preference: `"dark"`, `"light"`, or `"system"` |
| `resolvedTheme` | `"dark" \| "light"` | Actual resolved theme (system preference resolved) |
| `setTheme` | `(theme: Theme) => void` | Set theme and persist to localStorage |
| `toggleTheme` | `() => void` | Toggle between dark and light |

---

## 10. `useLocale()` hook

Returns the active locale dictionary. Must be used inside `<LocaleProvider>`.

```tsx
import { useLocale } from '@der-ort/pano-cloud-viewer';

function MyComponent() {
  const t = useLocale();
  return <button>{t.toolbar.about}</button>;
}
```

Returns a `ViewerLocale` object. See [i18n section](#14-i18n) for the full interface.

---

## 11. Manager Classes

Managers are exported for advanced / headless use. In normal usage, obtain instances via `useViewer()` after Viewport has initialised them.

### `SceneManager`

Manages the Three.js scene, camera, renderer, and animation loop.

| Method | Signature | Description |
|---|---|---|
| `start` | `() => void` | Start the requestAnimationFrame render loop |
| `dispose` | `() => void` | Stop loop, disconnect ResizeObserver, dispose renderer |
| `setNavigationMode` | `(mode: NavigationMode) => void` | Switch between orbit / fly / earth navigation |
| `fitToBox` | `(box: THREE.Box3) => void` | Position camera to frame a bounding box |
| `raycast` | `(nx: number, ny: number, objects: THREE.Object3D[]) => THREE.Intersection[]` | Screen-space raycast (nx/ny are NDC: -1 to 1) |
| `addFrameCallback` | `(cb: () => void) => void` | Register a callback to run every frame before render |
| `removeFrameCallback` | `(cb: () => void) => void` | Unregister a frame callback |

| Property | Type | Description |
|---|---|---|
| `scene` | `THREE.Scene` | The main Three.js scene |
| `camera` | `THREE.PerspectiveCamera` | The main perspective camera |
| `renderer` | `THREE.WebGLRenderer` | The WebGL renderer |
| `controls` | `OrbitControls` | OrbitControls instance (always alive, enabled/disabled per mode) |
| `flySpeed` | `number` | Movement speed for fly mode (auto-set after cloud loads) |
| `potree` | `unknown` | potree-core Potree instance (set after lazy import) |
| `pointClouds` | `unknown[]` | Array of loaded potree-core point cloud objects |
| `navigationMode` | `NavigationMode` | Read-only getter for current mode |

### `PointCloudLoader`

Loads Potree 2.0 point clouds via `potree-core`.

| Method | Signature | Description |
|---|---|---|
| `load` | `(metadataPath?: string, pointBudget?: number) => Promise<void>` | Load a point cloud; detects RGB; fits camera; sets minimap bounds |
| `setColorMode` | `(mode: ColorMode) => Promise<void>` | Change `PointColorType` on all loaded materials |
| `setPointBudget` | `(budget: number) => void` | Set max rendered points on the potree instance |
| `setPointSize` | `(size: number) => void` | Set point size on all materials |
| `setPointShape` | `(shape: number) => void` | 0=square, 1=circle, 2=paraboloid |
| `setPointSizeType` | `(type: number) => void` | 0=fixed, 1=attenuated, 2=adaptive |
| `readMetadata` | `(path?: string) => Promise<PointCloudMetadata \| null>` | Fetch and parse metadata.json |
| `getPointCloud` | `() => THREE.Object3D \| null` | Return the first loaded point cloud object |
| `clear` | `() => void` | Remove all loaded point clouds from scene |
| `static calcOptimalBudget` | `(totalPoints: number) => number` | Heuristic budget: 30%/15%/8% of total, capped 500K–10M |

| Property | Type | Description |
|---|---|---|
| `worldBox` | `THREE.Box3` | World-space bounding box (available after `load()`) |
| `hasRgbData` | `boolean` | Whether the loaded cloud has RGB color attributes |

### `CameraAnimator`

Smooth camera fly-to animations using quartic ease-out.

| Method | Signature | Description |
|---|---|---|
| `flyTo` | `(opts: { position: THREE.Vector3, target: THREE.Vector3, duration?: number }) => Promise<void>` | Animate camera to position/target over duration ms (default 800) |
| `flyToCamera` | `(camPos: THREE.Vector3 \| [number,number,number], yawDeg?: number, offset?: number, duration?: number) => Promise<void>` | Fly behind a panorama marker; offset=5 by default |
| `cancel` | `() => void` | Cancel any in-progress animation |

### `ClipManager`

Manages named axis-aligned clip boxes with TransformControls.

| Method | Signature | Description |
|---|---|---|
| `addBox` | `(box: THREE.Box3, name?: string) => ClipBoxEntry` | Add a clip box; creates scene helper; applies clipping |
| `selectBox` | `(id: string \| null) => Promise<void>` | Select a box for transform (lazy-init TransformControls) |
| `setTransformMode` | `(mode: "translate" \| "scale") => void` | Switch TransformControls mode |
| `removeBox` | `(id: string) => void` | Remove a clip box |
| `setBoxMode` | `(id: string, mode: ClipMode) => void` | Set clip mode: `"outside"` (keep inside) or `"inside"` (remove inside) |
| `setBoxVisible` | `(id: string, visible: boolean) => void` | Show/hide a clip box helper and its clipping effect |
| `renameBox` | `(id: string, name: string) => void` | Rename a clip box |
| `setDraft` | `(box: THREE.Box3 \| null) => void` | Show a draft preview box (no clipping applied) |
| `getBoxes` | `() => ClipBoxEntry[]` | Get all clip boxes (defensive clone) |
| `getSelectedId` | `() => string \| null` | Get currently selected box ID |
| `hasBox` | `() => boolean` | Whether any clip boxes exist |
| `clear` | `() => void` | Remove all clip boxes |
| `dispose` | `() => void` | Full cleanup including TransformControls |

| Callback | Type | Description |
|---|---|---|
| `onChange` | `(boxes: ClipBoxEntry[]) => void` | Called after any mutation |
| `onSelectChange` | `(id: string \| null) => void` | Called when selection changes |

### `ExportManager`

Renders orthographic views and exports as images.

| Method | Signature | Description |
|---|---|---|
| `capture` | `(options: ExportOptions) => Promise<string>` | Render and return a data URL |
| `static download` | `(dataUrl: string, filename: string) => void` | Trigger browser file download |

### `MarkerManager`

Renders 3D panorama camera markers as billboard sprites.

| Method | Signature | Description |
|---|---|---|
| `build` | `(cameras: CameraData[], worldBox?: THREE.Box3) => void` | Create sprites for all cameras; auto-scales to scene |
| `getMeshes` | `() => THREE.Object3D[]` | Get sprites for raycasting |
| `setHovered` | `(idx: number) => void` | Highlight a marker on hover (-1 = none) |
| `setSelected` | `(idx: number) => void` | Mark a marker as selected (-1 = none) |
| `setVisible` | `(visible: boolean) => void` | Show/hide all markers |
| `clear` | `() => void` | Remove all markers (dispose textures) |
| `dispose` | `() => void` | Full cleanup including scene group removal |

### `MeasurementManager`

Interactive 3D measurement tool.

| Method | Signature | Description |
|---|---|---|
| `start` | `(type: MeasurementType) => Measurement` | Begin a new measurement |
| `addPoint` | `(point: THREE.Vector3) => Measurement \| null` | Add a 3D point; auto-finishes when enough points collected |
| `finish` | `() => Measurement \| null` | Finalize active measurement; computes value; builds scene objects |
| `remove` | `(id: string) => void` | Remove a measurement and dispose its geometry |
| `clearAll` | `() => void` | Remove all measurements |
| `getAll` | `() => Measurement[]` | Get all completed measurements |
| `dispose` | `() => void` | Full cleanup |

| Property | Type | Description |
|---|---|---|
| `activeMeasurement` | `Measurement \| null` | In-progress measurement, if any |
| `onChange` | `(measurements: Measurement[]) => void` | Called after any mutation |

### `MinimapRenderer`

Top-down orthographic minimap with camera frustum overlay.

| Method | Signature | Description |
|---|---|---|
| `attach` | `(container: HTMLElement) => void` | Create WebGL and 2D canvases inside container |
| `setBounds` | `(bounds: THREE.Box3) => void` | Set world-space scene bounds; configures ortho camera |
| `update` | `() => void` | Render one frame (call every animation frame) |
| `canvasToWorld` | `(cx: number, cy: number) => THREE.Vector2` | Convert canvas pixel to world XY (for click-to-navigate) |
| `resize` | `() => void` | Sync canvas dimensions to container size |
| `dispose` | `() => void` | Remove canvases and dispose renderer |

### `PresentationManager`

Persists named viewer scenes in localStorage.

| Method | Signature | Description |
|---|---|---|
| `getScenes` | `() => ViewerScene[]` | Get all saved scenes (shallow copy) |
| `addScene` | `(scene: Omit<ViewerScene, "id" \| "createdAt">) => ViewerScene` | Save a new scene; max 50 |
| `removeScene` | `(id: string) => void` | Delete a scene |
| `renameScene` | `(id: string, name: string) => void` | Rename a scene |
| `exportJSON` | `() => string` | Serialize all scenes to JSON string |
| `importJSON` | `(json: string) => number` | Merge scenes from JSON; returns count imported |
| `clear` | `() => void` | Delete all scenes |

| Callback | Type | Description |
|---|---|---|
| `onChange` | `(scenes: ViewerScene[]) => void` | Called after any mutation |

**Helper function:**
```typescript
captureScene(
  name: string,
  cameraPos: { x: number; y: number; z: number },
  cameraTarget: { x: number; y: number; z: number },
  clipBoxes: ClipBoxEntry[],
  colorMode: string,
  pointSize: number,
  pointBudget: number,
): Omit<ViewerScene, "id" | "createdAt">
```
Assembles a `ViewerScene` payload from current viewer state. Pass the result to `presentationManager.addScene()`.

---

## 12. Types

All types are exported from `@der-ort/pano-cloud-viewer`.

### Source types

```typescript
type PointCloudSource = S3Source | LocalSource | ElectronSource;

interface S3Source {
  type: "s3";
  baseUrl: string;           // Base URL ending with "/"
  headers?: Record<string, string>; // Optional auth headers
}

interface LocalSource {
  type: "local";
  basePath: string;          // Relative to dev server root
}

interface ElectronSource {
  type: "electron";
  basePath: string;          // Absolute path to folder
}
```

### Camera / panorama

```typescript
interface CameraData {
  name: string;
  index: number;
  image: string | null;      // Absolute URL (resolved by DataProvider)
  representation?: "sphericalRepresentation" | "pinholeRepresentation" | "cylindricalRepresentation";
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number; w: number };
  yaw_deg?: number;
  description?: string;
  position_source?: "scan" | "image";
  _project?: string;
}
```

### Measurements

```typescript
type MeasurementType = "point" | "distance" | "height" | "area" | "volume" | "angle" | "profile";

interface Measurement {
  id: string;
  type: MeasurementType;
  label: string;
  points: THREE.Vector3[];
  value?: number;            // meters / m² / m³ / radians depending on type
  color: string;
  visible: boolean;
  selected: boolean;
}
```

### Clipping

```typescript
type ClipMode = "outside" | "inside";  // "outside" = keep inside box

interface ClipBoxEntry {
  id: string;
  name: string;
  box: THREE.Box3;
  mode: ClipMode;
  visible: boolean;
}

type SectionType = "box" | "plane";

interface ClipSection {
  id: string;
  type: SectionType;
  label: string;
  visible: boolean;
  active: boolean;
  transform: THREE.Matrix4;
}
```

### Export

```typescript
type ExportView = "top" | "front" | "side" | "back" | "custom";
type ExportFormat = "png" | "jpeg";

interface ExportOptions {
  view: ExportView;
  scale: 1 | 2 | 4;
  background: "white" | "black" | "transparent";
  showScaleBar: boolean;
  format: ExportFormat;
  quality?: number;          // 0–1, jpeg only
}
```

### Viewer state

```typescript
type Theme = "dark" | "light" | "system";

type NavigationMode = "orbit" | "fly" | "earth";

type ActiveTool =
  | "none"
  | "measure-point" | "measure-distance" | "measure-height"
  | "measure-area" | "measure-volume" | "measure-angle" | "measure-profile"
  | "section-box" | "section-plane"
  | "annotate";

type ColorMode = "rgb" | "height" | "intensity" | "intensity_gradient" | "classification" | "return_number" | "source";

interface ViewerConfig {
  source: PointCloudSource;
  theme?: Theme;
  pointBudget?: number;
  showMinimap?: boolean;
  enablePanoramas?: boolean;
  className?: string;
  onCameraSelect?: (camera: CameraData) => void;
  onMeasurementChange?: (measurements: Measurement[]) => void;
}
```

### Presentation / scenes

```typescript
interface ViewerScene {
  id: string;
  name: string;
  createdAt: string;          // ISO 8601
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
```

---

## 13. Source Adapters

### `FileSourceAdapter` interface

```typescript
interface FileSourceAdapter {
  resolveUrl(relativePath: string): string;
  fetchJson<T>(relativePath: string): Promise<T>;
  fetchBinary(relativePath: string): Promise<ArrayBuffer>;
  fetchWithHeaders?(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  listDirectories?(path: string): Promise<string[]>;
}
```

### `createAdapter(source: PointCloudSource): FileSourceAdapter`

Factory function. Returns the correct adapter implementation for the given source type.

```typescript
import { createAdapter } from '@der-ort/pano-cloud-viewer';

const adapter = createAdapter({ type: 's3', baseUrl: 'https://...' });
const metadata = await adapter.fetchJson('metadata.json');
```

### `S3SourceAdapter`

```typescript
class S3SourceAdapter implements FileSourceAdapter {
  constructor(baseUrl: string, headers?: Record<string, string>)
}
```

Uses `fetch()` with optional auth headers. Handles CORS. Suitable for S3, CDN URLs, or any HTTP endpoint.

### `ElectronSourceAdapter`

```typescript
class ElectronSourceAdapter implements FileSourceAdapter {
  constructor(basePath: string)  // absolute path to project folder
}
```

Uses `window.electronFS` IPC bridge (`readFile`, `readFileBinary`, `readdir`). Throws if the bridge is not available. The preload script in `apps/electron/src/preload.ts` exposes the bridge.

### Adding a custom adapter

Implement `FileSourceAdapter` and pass an instance directly to `DataProvider`:

```tsx
import type { FileSourceAdapter } from '@der-ort/pano-cloud-viewer';

class MyCustomAdapter implements FileSourceAdapter {
  resolveUrl(rel: string) { return `/api/pcloud/${rel}`; }
  async fetchJson<T>(rel: string): Promise<T> {
    const res = await fetch(this.resolveUrl(rel), { credentials: 'include' });
    return res.json();
  }
  async fetchBinary(rel: string): Promise<ArrayBuffer> {
    const res = await fetch(this.resolveUrl(rel), { credentials: 'include' });
    return res.arrayBuffer();
  }
}

const adapter = new MyCustomAdapter();

<DataProvider adapter={adapter}>
  <ViewerProvider config={{ source: { type: 's3', baseUrl: '' } }}>
    <Viewport />
  </ViewerProvider>
</DataProvider>
```

Note: `ViewerProvider` still requires a `config.source` — pass a placeholder if using a custom adapter directly with `DataProvider`.

---

## 14. i18n

### `ViewerLocale` interface

The full locale interface. All sections must be provided; use `createLocale(base, overrides)` for partial overrides.

Top-level sections:

| Section | Description |
|---|---|
| `toolbar` | All toolbar button labels, tooltips, color mode names, navigation mode names |
| `exportPanel` | Export panel labels and button text |
| `toolRail` | Measure and section tool labels |
| `sidebar` | Sidebar tab labels |
| `scenePanel` | Scene panel strings |
| `panoPanel` | Panorama panel strings |
| `classificationPanel` | Classification filter strings and LAS class labels (`classLabels: Record<number, string>`) |
| `measurementsPanel` | Measurements panel strings |
| `viewport` | Viewport overlay strings, tool hints, status bar formatters |
| `renderingSettings` | Rendering settings panel strings |
| `scenesPanel` | Scenes panel strings |
| `about` | About dialog strings |
| `panoViewer` | Panorama viewer strings |

Some values are functions:
```typescript
statusPts: (millions: number) => string    // e.g. (n) => `${n.toFixed(1)}M pts`
statusBudget: (millions: number) => string
statusFps: (fps: number) => string
pointBudgetTitle: (millions: number) => string
pointSizeTitle: (size: number) => string
measurementCount: (count: number) => string
```

### `createLocale(base, overrides)`

Deep-merges a `DeepPartial<ViewerLocale>` into a base locale. All unspecified keys keep their base values.

```typescript
import { en, createLocale } from '@der-ort/pano-cloud-viewer';

const myLocale = createLocale(en, {
  toolbar: {
    about: 'Info',
    navOrbit: 'Turntable',
  },
  viewport: {
    overview: 'Map',
  },
});
```

### `LocaleProvider`

```tsx
import { LocaleProvider } from '@der-ort/pano-cloud-viewer';

<LocaleProvider locale={myLocale}>
  {children}
</LocaleProvider>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `locale` | `ViewerLocale` | `en` | Active locale dictionary |

### Built-in locales

```typescript
import { en } from '@der-ort/pano-cloud-viewer';  // English (default)
import { de } from '@der-ort/pano-cloud-viewer';  // German
```

### Using with `<PanoCloudViewer>`

```tsx
import { de } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer
  source={source}
  locale={de}
/>
```

---

## Utilities

Exported from `@der-ort/pano-cloud-viewer`:

| Function | Signature | Description |
|---|---|---|
| `cn` | `(...inputs: ClassValue[]) => string` | `clsx` + `tailwind-merge` for conditional class names |
| `formatLength` | `(meters: number) => string` | e.g. `"1.23 m"` or `"123.4 cm"` |
| `formatArea` | `(m2: number) => string` | e.g. `"4.56 m²"` |
| `formatVolume` | `(m3: number) => string` | e.g. `"7.89 m³"` |
| `formatAngle` | `(radians: number) => string` | e.g. `"45.0°"` |
| `formatCoord` | `(value: number) => string` | Formatted coordinate value |
| `exportMeasurementsCSV` | `(measurements: Measurement[]) => string` | Generate CSV string from measurements array |
