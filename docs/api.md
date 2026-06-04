# PanoCloudViewer — API Reference

Complete reference for `@der-ort/pano-cloud-viewer`. All types and exports are verified against the actual source code.

---

## Table of Contents

1. [`<PanoCloudViewer>`](#1-panocloudviewer)
2. [`ViewerConfig`](#2-viewerconfig)
3. [`<WorkspaceLayout>` and layout variants](#3-workspacelayout-and-layout-variants)
4. [`<Viewport>`](#4-viewport)
5. [Toolbar Components](#5-toolbar-components)
6. [Sidebar Components](#6-sidebar-components)
7. [Overlay Components](#7-overlay-components)
8. [`useViewer()` hook](#8-useviewer-hook)
9. [`useData()` hook](#9-usedata-hook)
10. [`useTheme()` hook](#10-usetheme-hook)
11. [`useLocale()` hook](#11-uselocale-hook)
12. [Action Hooks](#12-action-hooks)
13. [Manager Classes](#13-manager-classes)
14. [Types](#14-types)
15. [Source Adapters](#15-source-adapters)
16. [i18n](#16-i18n)
17. [Utilities](#17-utilities)

---

## 1. `<PanoCloudViewer>`

Drop-in component. Sets up all providers (`LocaleProvider` → `ThemeProvider` → `DataProvider` → `ViewerProvider`) and renders the full viewer shell.

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
| `children` | `(viewport: ReactNode) => ReactNode` | `undefined` | Custom UI render prop — replaces default `WorkspaceLayout`. Receives the Suspense-wrapped `<Viewport>` element. |

### Custom UI via render prop

When `children` is provided, the default `WorkspaceLayout` is replaced. The function receives the viewport element that **must** be rendered:

```tsx
import { PanoCloudViewer, MinimalLayout } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer source={source}>
  {(viewport) => <MinimalLayout viewport={viewport} />}
</PanoCloudViewer>
```

All providers are set up regardless, so action hooks and `useViewer()` work inside any descendant component.

---

## 2. `ViewerConfig`

Configuration object passed internally by `<PanoCloudViewer>` to `ViewerProvider`. Can also be passed directly when composing providers yourself.

```typescript
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
  /** Called when measurements are created / updated */
  onMeasurementChange?: (measurements: Measurement[]) => void;
  /** Display settings overrides (marker/measurement sizing) */
  displaySettings?: Partial<DisplaySettings>;
}
```

---

## 3. `<WorkspaceLayout>` and layout variants

### `<WorkspaceLayout>`

Default shell layout: top toolbar (`MainToolbar`) → left tool rail (`ToolRail`) → central `<Viewport>` (lazy) → right collapsible `<Sidebar>`. Must be inside `ViewerProvider`, `DataProvider`, `ThemeProvider`, and `LocaleProvider`.

```tsx
import { WorkspaceLayout } from '@der-ort/pano-cloud-viewer';

<ViewerProvider config={config}>
  <DataProvider adapter={adapter}>
    <WorkspaceLayout className="my-class" />
  </DataProvider>
</ViewerProvider>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | `undefined` | Extra CSS class on the root flex container |

### `<MinimalLayout>`

Full-screen viewport with a minimal floating toolbar (fit-to-view, navigation mode selector, theme toggle). Suitable for embedded widgets.

```tsx
import { MinimalLayout } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer source={source}>
  {(viewport) => <MinimalLayout viewport={viewport} />}
</PanoCloudViewer>
```

| Prop | Type | Description |
|---|---|---|
| `viewport` | `React.ReactNode` | The viewport element from the render prop |

### `<WorkstationLayout>`

Full-screen viewport with a collapsible side-panel containing floating palettes (tools, display, view settings, export) and a bottom status bar.

```tsx
import { WorkstationLayout } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer source={source}>
  {(viewport) => <WorkstationLayout viewport={viewport} sidebarSide="left" />}
</PanoCloudViewer>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `viewport` | `React.ReactNode` | required | The viewport element from the render prop |
| `sidebarSide` | `"left" \| "right"` | `"left"` | Which side the collapsible panel appears on |

### `<FloatingPalette>`

Standalone glass-morphism floating panel. Use to compose custom layouts.

```tsx
import { FloatingPalette } from '@der-ort/pano-cloud-viewer';
```

### `<CollapsibleSidebar>`

Side panel that collapses to an icon rail via a chevron toggle. Used internally by `WorkstationLayout`. Accepts `side` (`"left" | "right"`) and `children`.

---

## 4. `<Viewport>`

Core Three.js component. Initialises all manager instances, runs the render loop, and handles mouse events. Renders the 3D canvas, minimap overlay, and tool hint bar.

Must be inside `ViewerProvider` and `DataProvider`.

```tsx
import { Viewport } from '@der-ort/pano-cloud-viewer';

// Standalone usage — embed just the 3D canvas
<div style={{ width: 800, height: 600 }}>
  <Viewport className="rounded-lg" />
</div>
```

**Note:** Lazy-import in Next.js or any SSR environment:
```tsx
const Viewport = dynamic(
  () => import('@der-ort/pano-cloud-viewer').then(m => m.Viewport),
  { ssr: false }
);
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | `undefined` | Extra CSS class on the container div |

On first mount, `Viewport` creates and registers in `ViewerProvider`: `SceneManager`, `PointCloudLoader`, `MeasurementManager`, `MarkerManager`, `CameraAnimator`, `ExportManager`, `MinimapRenderer`, `ClipManager`.

---

## 5. Toolbar Components

All toolbar components must be inside `ViewerProvider`. They read state via `useViewer()` and dispatch actions through it.

| Component | Description |
|---|---|
| `<MainToolbar>` | Full top bar: logo, view preset buttons, display controls, navigation mode selector, theme toggle, sidebar toggle, about button |
| `<ViewControls>` | View preset buttons (top, bottom, front, back, left, right) — flies camera to axis-aligned positions |
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

### `<ToolbarIconBtn>` and `<ToolbarSection>`

Primitive building blocks for custom toolbars exported from `main-toolbar`. `ToolbarIconBtn` is a styled icon button with active/disabled states. `ToolbarSection` is a flex row group with an optional divider.

---

## 6. Sidebar Components

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

## 7. Overlay Components

| Component | Description |
|---|---|
| `<PanoViewer>` | Full-screen 360° panorama viewer (Pannellum). Rendered by `WorkspaceLayout` when `selectedCamera` is set in `ViewerProvider`. |
| `<AboutDialog>` | Modal dialog showing library version, engine credits |
| `<RenderingSettings>` | Slide-out panel for fine-grained rendering adjustments (gamma, brightness, contrast, elevation range, opacity) |
| `<DisplaySettingsDialog>` | Dialog for choosing a display preset (compact / standard / prominent) affecting measurement and marker sizing |

### `<RenderingSettings>` props

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Whether the panel is visible |
| `onClose` | `() => void` | Called when the close button is clicked |

---

## 8. `useViewer()` hook

Returns the full viewer context. Must be used inside `<ViewerProvider>`.

```tsx
import { useViewer } from '@der-ort/pano-cloud-viewer';

function MyComponent() {
  const { sceneManager, loader, fps, activeTool, setActiveTool } = useViewer();
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
| `projection` | `CameraProjection` | `"perspective"` | Perspective or orthographic camera |
| `setProjection` | `(mode: CameraProjection) => void` | — | Switch camera projection |
| `displaySettings` | `DisplaySettings` | `DISPLAY_PRESETS.standard` | Measurement and marker sizing settings |
| `setDisplaySettings` | `(s: DisplaySettings) => void` | — | Update display settings |
| `config` | `ViewerConfig` | — | The config object passed to ViewerProvider |

---

## 9. `useData()` hook

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

## 10. `useTheme()` hook

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

## 11. `useLocale()` hook

Returns the active locale dictionary. Must be used inside `<LocaleProvider>`.

```tsx
import { useLocale } from '@der-ort/pano-cloud-viewer';

function MyComponent() {
  const t = useLocale();
  return <button>{t.toolbar.about}</button>;
}
```

Returns a `ViewerLocale` object. See [i18n section](#16-i18n) for the full interface.

---

## 12. Action Hooks

Action hooks are high-level hooks that encapsulate common interactions. Use them instead of wiring `useViewer()` manually in custom UIs. All must be used inside `<ViewerProvider>`.

### `useNavigationActions()`

```tsx
import { useNavigationActions } from '@der-ort/pano-cloud-viewer';

const { fitToView, flyToView, navigationMode, setNavigationMode, projection, setProjection } = useNavigationActions();
```

| Return | Type | Description |
|---|---|---|
| `navigationMode` | `NavigationMode` | Current navigation mode |
| `setNavigationMode` | `(mode: NavigationMode) => void` | Switch navigation mode |
| `projection` | `CameraProjection` | Current camera projection |
| `setProjection` | `(mode: CameraProjection) => void` | Switch perspective / orthographic |
| `fitToView` | `() => void` | Fit camera to loaded point cloud bounding box |
| `flyToView` | `(preset: ViewPreset) => void` | Snap to axis-aligned view. `ViewPreset = "top" \| "bottom" \| "front" \| "back" \| "left" \| "right"` |

### `useMeasurementActions()`

```tsx
import { useMeasurementActions } from '@der-ort/pano-cloud-viewer';

const { startTool, cancelTool, measurements, clearAll, remove, rename, exportCSV } = useMeasurementActions();
```

| Return | Type | Description |
|---|---|---|
| `activeTool` | `ActiveTool` | Currently active tool |
| `startTool` | `(type: MeasurementType) => void` | Start a measurement tool (toggles off if already active) |
| `cancelTool` | `() => void` | Cancel the active tool |
| `measurements` | `Measurement[]` | All completed measurements |
| `clearAll` | `() => void` | Remove all measurements |
| `remove` | `(id: string) => void` | Remove a single measurement |
| `rename` | `(id: string, name: string) => void` | Rename a measurement |
| `exportCSV` | `() => void` | Download measurements as CSV |

### `useClipActions()`

```tsx
import { useClipActions } from '@der-ort/pano-cloud-viewer';

const { addBox, clearAll, toggleMode, selectBox, setTransformMode, boxes, clipMode, hasClipBox } = useClipActions();
```

| Return | Type | Description |
|---|---|---|
| `boxes` | `ClipBoxEntry[]` | All active clip boxes |
| `selectedBoxId` | `string \| null` | Currently selected box ID |
| `hasClipBox` | `boolean` | Whether any clip boxes exist |
| `clipMode` | `ClipMode` | Current clip mode (`"outside"` = keep inside, `"inside"` = remove inside) |
| `addBox` | `() => void` | Add a new clip box sized to the point cloud world box |
| `clearAll` | `() => void` | Remove all clip boxes |
| `toggleMode` | `() => void` | Toggle clip mode for all boxes |
| `selectBox` | `(id: string \| null) => void` | Select a box for transform |
| `setTransformMode` | `(mode: "translate" \| "scale" \| "rotate") => void` | Set TransformControls mode |

### `useDisplayActions()`

```tsx
import { useDisplayActions } from '@der-ort/pano-cloud-viewer';

const { colorMode, setColorMode, pointBudget, setPointBudget, pointSize, setPointSize, setQualityPreset } = useDisplayActions();
```

| Return | Type | Description |
|---|---|---|
| `colorMode` | `ColorMode` | Current point color mode |
| `setColorMode` | `(mode: ColorMode) => void` | Change color mode |
| `pointBudget` | `number` | Max rendered points |
| `setPointBudget` | `(v: number) => void` | Update point budget |
| `pointSize` | `number` | Point size in pixels |
| `setPointSize` | `(v: number) => void` | Update point size |
| `setQualityPreset` | `(preset: "performance" \| "balanced" \| "high") => void` | Apply a point shape/size-type preset |

### `useExportActions()`

```tsx
import { useExportActions } from '@der-ort/pano-cloud-viewer';

const { capture, download } = useExportActions();

const url = await capture({ view: 'top', scale: 2, background: 'white', showScaleBar: false, format: 'png' });
download(url!, 'plan_view.png');
```

| Return | Type | Description |
|---|---|---|
| `capture` | `(options: ExportOptions) => Promise<string \| null>` | Render and return a data URL |
| `download` | `(dataUrl: string, filename: string) => void` | Trigger browser file download |

### `useVisibilityActions()`

```tsx
import { useVisibilityActions } from '@der-ort/pano-cloud-viewer';

const { showMarkers, toggleMarkers, showMinimap, toggleMinimap } = useVisibilityActions();
```

| Return | Type | Description |
|---|---|---|
| `showMarkers` | `boolean` | Whether panorama markers are visible |
| `toggleMarkers` | `() => void` | Toggle panorama marker visibility |
| `showMinimap` | `boolean` | Whether minimap overlay is visible |
| `toggleMinimap` | `() => void` | Toggle minimap |

### `useDisplaySettings()`

```tsx
import { useDisplaySettings } from '@der-ort/pano-cloud-viewer';

const { settings, presets, applyPreset, updateSetting } = useDisplaySettings();
```

| Return | Type | Description |
|---|---|---|
| `settings` | `DisplaySettings` | Current display settings |
| `presets` | `Record<DisplayPreset, DisplaySettings>` | All available presets |
| `applyPreset` | `(preset: DisplayPreset) => void` | Apply `"compact"`, `"standard"`, or `"prominent"` |
| `updateSetting` | `<K extends keyof DisplaySettings>(key: K, value: ...) => void` | Update a single setting |

---

## 13. Manager Classes

Managers are exported for advanced / headless use. In normal usage, obtain instances via `useViewer()` after Viewport has initialised them.

All manager classes are exported from both `@der-ort/pano-cloud-viewer` and `@der-ort/pano-cloud-viewer-core`.

### `SceneManager`

Manages the Three.js scene, camera, renderer, and animation loop.

| Method | Signature | Description |
|---|---|---|
| `start` | `() => void` | Start the requestAnimationFrame render loop |
| `dispose` | `() => void` | Stop loop, disconnect ResizeObserver, dispose renderer |
| `setNavigationMode` | `(mode: NavigationMode) => void` | Switch between orbit / fly / earth navigation |
| `setProjection` | `(mode: CameraProjection) => void` | Switch perspective / orthographic projection |
| `fitToBox` | `(box: THREE.Box3) => void` | Position camera to frame a bounding box |
| `raycast` | `(nx: number, ny: number, objects: THREE.Object3D[]) => THREE.Intersection[]` | Screen-space raycast (nx/ny are NDC: -1 to 1) |
| `addFrameCallback` | `(cb: () => void) => void` | Register a callback to run every frame before render |
| `removeFrameCallback` | `(cb: () => void) => void` | Unregister a frame callback |
| `addPostRenderCallback` | `(cb: () => void) => void` | Register a callback to run after the main render |
| `removePostRenderCallback` | `(cb: () => void) => void` | Unregister a post-render callback |

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
| `projection` | `CameraProjection` | Read-only getter for current projection |

### `PointCloudLoader`

Loads Potree 2.0 point clouds via `potree-core`.

| Method | Signature | Description |
|---|---|---|
| `load` | `(metadataPath?: string, pointBudget?: number) => Promise<void>` | Load a point cloud; detects RGB; fits camera |
| `setColorMode` | `(mode: ColorMode) => Promise<void>` | Change `PointColorType` on all loaded materials |
| `setPointBudget` | `(budget: number) => void` | Set max rendered points on the potree instance |
| `setPointSize` | `(size: number) => void` | Set point size on all materials |
| `setPointShape` | `(shape: number) => void` | 0=square, 1=circle, 2=paraboloid |
| `setPointSizeType` | `(type: number) => void` | 0=fixed, 1=attenuated, 2=adaptive |
| `readMetadata` | `(path?: string) => Promise<PointCloudMetadata \| null>` | Fetch and parse metadata.json |
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
| `setTransformMode` | `(mode: "translate" \| "scale" \| "rotate") => void` | Switch TransformControls mode |
| `removeBox` | `(id: string) => void` | Remove a clip box |
| `setBoxMode` | `(id: string, mode: ClipMode) => void` | Set clip mode: `"outside"` (keep inside) or `"inside"` (remove inside) |
| `setBoxVisible` | `(id: string, visible: boolean) => void` | Show/hide a clip box helper |
| `renameBox` | `(id: string, name: string) => void` | Rename a clip box |
| `setDraft` | `(box: THREE.Box3 \| null) => void` | Show a draft preview box (no clipping applied) |
| `getBoxes` | `() => ClipBoxEntry[]` | Get all clip boxes |
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
| `rename` | `(id: string, name: string) => void` | Rename a measurement label |
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

**`captureScene()` helper function:**
```typescript
import { captureScene } from '@der-ort/pano-cloud-viewer';

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

## 14. Types

All types are exported from both `@der-ort/pano-cloud-viewer` and `@der-ort/pano-cloud-viewer-core`.

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
  basePath: string;          // Base URL or relative path served by the dev server / Next.js public folder
}

interface ElectronSource {
  type: "electron";
  basePath: string;          // Absolute path to the point cloud folder
}
```

### Camera / panorama

```typescript
interface CameraData {
  name: string;
  index: number;
  image: string | null;      // Absolute URL (resolved by DataProvider)
  thumbnail?: string | null; // Low-res thumbnail URL (falls back to image)
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
  box?: { min: [number, number, number]; max: [number, number, number] }; // volume only
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
type CameraProjection = "perspective" | "orthographic";

type ActiveTool =
  | "none"
  | "measure-point" | "measure-distance" | "measure-height"
  | "measure-area" | "measure-volume" | "measure-angle" | "measure-profile"
  | "section-box" | "section-plane"
  | "annotate";

type ColorMode = "rgb" | "height" | "intensity" | "intensity_gradient" | "classification" | "return_number" | "source";
```

### Display settings

```typescript
type DisplayPreset = "compact" | "standard" | "prominent";

interface DisplaySettings {
  preset: DisplayPreset;
  measurementLineWidth: number;    // pixels
  measurementLabelScale: number;   // multiplier
  measurementSphereRadius: number; // world units
  markerSphereScale: number;       // multiplier on auto-calculated radius
  markerSphereOpacity: number;     // 0–1
  markerLabelScale: number;        // multiplier
}

// Pre-defined presets — also exported as DISPLAY_PRESETS constant
const DISPLAY_PRESETS: Record<DisplayPreset, DisplaySettings>;
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

## 15. Source Adapters

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

Uses `window.electronFS` IPC bridge (`readFile`, `readFileBinary`, `readdir`). The preload script in `apps/electron/src/preload.ts` exposes the bridge.

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

**Note:** `ViewerProvider` requires a `config.source` — pass a placeholder `{ type: 's3', baseUrl: '' }` when using a custom adapter directly with `DataProvider`.

---

## 16. i18n

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

Deep-merges a `DeepPartial<ViewerLocale>` into a base locale.

```typescript
import { en, createLocale } from '@der-ort/pano-cloud-viewer';

const myLocale = createLocale(en, {
  toolbar: {
    about: 'Info',
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

---

## 17. Utilities

### Format helpers

Exported from both `@der-ort/pano-cloud-viewer` and `@der-ort/pano-cloud-viewer-core`:

| Function | Signature | Description |
|---|---|---|
| `formatLength` | `(meters: number) => string` | e.g. `"1.23 m"` or `"123.4 cm"` |
| `formatArea` | `(m2: number) => string` | e.g. `"4.56 m²"` |
| `formatVolume` | `(m3: number) => string` | e.g. `"7.89 m³"` |
| `formatAngle` | `(radians: number) => string` | e.g. `"45.0°"` |
| `formatCoord` | `(x: number, y: number, z: number, decimals?: number) => string` | Formatted coordinate string, e.g. `"X: 1.23, Y: 4.56, Z: 7.89"` |
| `exportMeasurementsCSV` | `(measurements: Measurement[]) => string` | Generate CSV string from measurements (does not download — call `ExportManager.download()` or use `useMeasurementActions().exportCSV()`) |

### `cn()` utility

React-only, exported from `@der-ort/pano-cloud-viewer` only:

| Function | Signature | Description |
|---|---|---|
| `cn` | `(...inputs: ClassValue[]) => string` | `clsx` + `tailwind-merge` for conditional class names |
