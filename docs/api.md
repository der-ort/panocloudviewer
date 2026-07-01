# PanoCloudViewer — API Reference

Complete reference for `@der-ort/pano-cloud-viewer` (React UI) and `@der-ort/pano-cloud-viewer-core` (headless engine). Managers, types, adapters, and format helpers live in **core** and are re-exported from the React package (`export * from "@der-ort/pano-cloud-viewer-core"`), so importing them from `@der-ort/pano-cloud-viewer` works too. React-only exports (components, providers, hooks, `cn`, i18n, `PanoCloudViewer`) come from the React package only. All signatures are verified against the source.

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
18. [Version / Build Identity](#18-version--build-identity)
19. [Component Slot System](#19-component-slot-system)

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
| `uiMode` | `UiMode` (`"professional" \| "lite"`) | `"professional"` | UI complexity. `"professional"` = full toolset; `"lite"` = beginner set (nav modes, basic measurements, panorama/minimap/theme toggles). |
| `panoEngine` | `PanoEngine` (`"photo-sphere-viewer" \| "pannellum"`) | `"photo-sphere-viewer"` | Which 360° engine renders the panorama overlay. Both load lazily from CDN. Switchable at runtime via `useViewer().setPanoEngine`. |
| `uiScale` | `number` | `1` | Scales the UI **chrome only** (toolbars, tool-rail, sidebar, floating palettes, dialogs) via a `--pcv-scale` CSS variable + `zoom`. The 3D viewport/canvas stays at full resolution. Use e.g. `1.25` to enlarge controls on large displays. |
| `components` | `Partial<ViewerComponents>` | `undefined` | Override any of the default shadcn-style UI primitives (Dialog, Button, …). Shallow-merged over the built-in defaults. |
| `children` | `(viewport: ReactNode) => ReactNode` | `undefined` | Custom UI render prop — replaces default `WorkspaceLayout`. Receives the Suspense-wrapped `<Viewport>` element. |

### Related exports

- `usePcvRoot()` — returns a `RefObject<HTMLDivElement>` to the `.pcv` root element. Pass its `.current` as the `container` for Radix `Portal` / `createPortal` so portalled content inherits the viewer's scoped CSS custom properties.
- `useUiScale()` — returns the numeric `uiScale` factor (default `1`) for components needing the raw value.
- `pcvChromeScaleStyle` — an inline style object (`{ zoom: "var(--pcv-scale, 1)" }`) to apply chrome scaling to a custom container. **Never apply it to the 3D canvas.**

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
  /** UI complexity mode (default: "professional") */
  uiMode?: UiMode;
  /** 360° panorama engine (default: "photo-sphere-viewer") */
  panoEngine?: PanoEngine;
}
```

> **Note:** `<PanoCloudViewer>` only forwards `source`, `uiMode`, and `panoEngine` into the `ViewerConfig` it builds. The remaining fields (`pointBudget`, `showMinimap`, `onCameraSelect`, `displaySettings`, …) are honoured when you construct a `ViewerConfig` yourself and pass it to `<ViewerProvider>`.

---

## 3. `<WorkspaceLayout>` and layout variants

### `<WorkspaceLayout>`

Default shell layout: top toolbar (`MainToolbar`) → left tool rail (`ToolRail`) → central `<Viewport>` (lazy) → right collapsible `<Sidebar>`. Must be inside `ViewerProvider`, `DataProvider`, `ThemeProvider`, and `LocaleProvider`. The sidebar starts **below the toolbar** (no overlap) and toggles via a **chevron on its inner edge**. The toolbar's **gear button** opens a **simple quick-settings popover** (panoramas/minimap toggles, color mode, point size — mirroring the minimal layout) in addition to the advanced "Rendering Settings" modal.

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
| `<DisplayControls>` | Navigation mode buttons (orbit/free/pan), color mode selector, quality preset selector, point budget slider, point size slider |
| `<MeasureTools>` | Measurement tool buttons (point, distance, height, area, volume, angle, profile) + clear all |
| `<SectionTools>` | Clip box create tool, mode toggle (keep inside / keep outside), remove box button |
| `<ClipToolbar>` | Floating toolbar for the selected clip box: Move / Scale / Rotate transform-mode buttons, reset rotation, enable/outline toggles |
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
| `<Sidebar>` | Tabbed container. Tabs: **Layers**, **Panoramas** (pano-only), **Scene**, **Measurements**, **Scenes** (pro-only). Classification is folded into the Layers tab as a collapsible section — `ClassificationPanel` is still exported but is no longer a standalone tab. |
| `<PanoPanel>` | Searchable list of panorama cameras with fly-to buttons |
| `<ScenePanel>` | Point cloud visibility, measurement list, section list |
| `<MeasurementsPanel>` | List of all measurements with values, CSV export, clear all |
| `<ClassificationPanel>` | LAS classification filter checkboxes (rendered inside the Layers tab) |
| `<ScenesPanel>` | Save/restore named viewer scenes (camera + up + target + clip boxes + display settings), keyframe animation, 1080p MP4 video export, JSON import/export |

---

## 7. Overlay Components

| Component | Description |
|---|---|
| `<PanoViewer>` | Full-screen 360° panorama overlay. Rendered when `selectedCamera` is set in `ViewerProvider`. Engine-pluggable via the `panoEngine` config field / `useViewer().setPanoEngine` — **Photo Sphere Viewer** (default) or **Pannellum** (fallback). Both load lazily from CDN; the overlay header has an A/B engine toggle. |
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
| `showMeasurements` | `boolean` | `true` | Whether measurement objects are visible (wired to `MeasurementManager.setVisible`) |
| `setShowMeasurements` | `(v: boolean) => void` | — | Toggle measurement visibility |
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
| `uiMode` | `UiMode` | `"professional"` | Resolved UI complexity mode (read-only; from `config.uiMode`) |
| `panoEngine` | `PanoEngine` | `"photo-sphere-viewer"` | Active panorama engine (seeded from config) |
| `setPanoEngine` | `(engine: PanoEngine) => void` | — | Switch the panorama engine at runtime |
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
  /** Coordinate reference system (proj4/WKT/EPSG). Empty/absent = not georeferenced. */
  projection?: string;
  offset?: [number, number, number];
  scale?: [number, number, number];
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

const {
  boxes, selectedBoxId, hasClipBox, clipMode, isEnabled, outlinesVisible,
  addBox, clearAll, toggleMode, setEnabled, setOutlinesVisible,
  selectBox, resetRotation, setTransformMode, removeBox, setBoxVisible, setModeAll,
} = useClipActions();
```

| Return | Type | Description |
|---|---|---|
| `boxes` | `ClipBoxEntry[]` | All active clip boxes |
| `selectedBoxId` | `string \| null` | Currently selected box ID |
| `hasClipBox` | `boolean` | Whether any clip boxes exist |
| `clipMode` | `ClipMode` | Current global clip mode, derived from the first **visible** box (`"outside"` = keep inside, `"inside"` = remove inside) |
| `isEnabled` | `boolean` | Whether clipping is globally enabled |
| `outlinesVisible` | `boolean` | Whether box outlines/fills/handles are shown |
| `addBox` | `() => void` | Add a new clip box sized to fit the current viewport (`addDefaultBox`), then select it |
| `clearAll` | `() => void` | Remove all clip boxes |
| `toggleMode` | `() => void` | Toggle the global clip mode for all boxes |
| `setEnabled` | `(enabled: boolean) => void` | Globally enable/disable clipping without deleting boxes |
| `setOutlinesVisible` | `(visible: boolean) => void` | Show/hide all outlines/fills/handles (clipping unaffected) |
| `selectBox` | `(id: string \| null) => void` | Select a box for transform |
| `resetRotation` | `(id?: string) => void` | Reset a box's orientation to axis-aligned (selected box when omitted) |
| `setTransformMode` | `(mode: "translate" \| "scale" \| "rotate") => void` | Set the active TransformControls mode |
| `removeBox` | `(id: string) => void` | Remove a single clip box |
| `setBoxVisible` | `(id: string, visible: boolean) => void` | Show/hide a single box |
| `setModeAll` | `(mode: ClipMode) => void` | Set the global clip mode on all boxes |

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

```typescript
interface SceneManagerOptions {
  canvas: HTMLElement;                       // container element for the WebGL canvas
  onFpsUpdate?: (fps: number) => void;
  onPointsUpdate?: (loaded: number) => void;
}
new SceneManager(options: SceneManagerOptions)
```

| Method | Signature | Description |
|---|---|---|
| `start` | `() => void` | Start the requestAnimationFrame render loop |
| `dispose` | `() => void` | Stop loop, disconnect ResizeObserver, dispose renderer |
| `setNavigationMode` | `(mode: NavigationMode) => void` | Switch between orbit / free / pan navigation |
| `setProjection` | `(mode: CameraProjection) => void` | Switch perspective / orthographic projection |
| `fitToBox` | `(box: THREE.Box3) => void` | Position camera to frame a bounding box |
| `raycast` | `(nx: number, ny: number, objects: THREE.Object3D[]) => THREE.Intersection[]` | Screen-space raycast (nx/ny are NDC: -1 to 1) |
| `pickPoint` | `(nx: number, ny: number) => THREE.Vector3 \| null` | potree-core GPU pick — front-most rendered point under the cursor (NDC coords) |
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
| `flySpeed` | `number` | Legacy field, retained for API compatibility — no longer drives navigation |
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
| `getGeoInfo` | `() => GeoInfo` | `{ georeferenced, projection }` — georeference status of the loaded cloud |
| `clear` | `() => void` | Remove all loaded point clouds from scene |
| `static calcOptimalBudget` | `(totalPoints: number) => number` | Heuristic budget: 30%/15%/8% of total, capped 500K–10M |

| Property | Type | Description |
|---|---|---|
| `worldBox` | `THREE.Box3` | World-space bounding box (available after `load()`) |
| `hasRgbData` | `boolean` | Getter — whether the loaded cloud has RGB color attributes |
| `projection` | `string` | Getter — CRS string from metadata (`""` when not georeferenced) |
| `isGeoreferenced` | `boolean` | Getter — whether the cloud carries a non-empty CRS |

### `CameraAnimator`

Smooth camera fly-to animations, no external tween library.

| Method | Signature | Description |
|---|---|---|
| `flyTo` | `(opts: { position: THREE.Vector3, target: THREE.Vector3, up?: THREE.Vector3, duration?: number, easing?: Easing }) => Promise<void>` | Animate camera position + target (and lerp `up` when given) over `duration` ms (default 800). Passing `up` prevents restored scenes from tilting. |
| `flyToCamera` | `(camPos: THREE.Vector3 \| [number,number,number], yawDeg?: number, offset?: number, duration?: number) => Promise<void>` | Fly behind a panorama marker; offset=5 by default |
| `cancel` | `() => void` | Cancel any in-progress animation |

`Easing = "smooth" | "linear" | "easeInOut"` — `"smooth"` is quartic ease-out (default).

### `ClipManager`

Manages named clip boxes with TransformControls. Each box stores a full `THREE.Quaternion` orientation. Default post-create transform mode is `scale` (6 axis-colored face-resize spheres via `FaceHandleController`); `translate` shows move arrows; `rotate` shows **full 3-axis** rotation rings. Only one mode's handles are shown at a time so they can't grab each other. New section boxes are sized to **fit the current viewport** (centered on the view target, clamped to the cloud bounds) so they stay in view and are easy to grab — see `makeViewportBox` / `addDefaultBox`.

> **three r170 note:** `TransformControls` extends `Controls`/`EventDispatcher`, not `Object3D`. Each gizmo is added to the scene via `tc.getHelper()` (the internal `_root` Object3D), never `scene.add(tc)`. Raising the gizmo over the point cloud (`depthTest=false`/`renderOrder`) traverses `tc.getHelper()`, not the controls object.

> **Single global clip mode:** potree-core exposes only one global `clipMode`, so all clip boxes share one mode (`"outside"` or `"inside"`). Use `setModeAll` to change it consistently; per-box modes are not supported.

| Method | Signature | Description |
|---|---|---|
| `addBox` | `(box: THREE.Box3, name?: string) => ClipBoxEntry` | Add a clip box; creates scene helper; applies clipping |
| `makeViewportBox` | `(worldBox?: THREE.Box3) => THREE.Box3` | Build a box sized to fit the current viewport, clamped to the cloud bounds |
| `addDefaultBox` | `(worldBox?: THREE.Box3, name?: string) => ClipBoxEntry` | `addBox(makeViewportBox(...))` — the preferred "create section box" call |
| `setEnabled` | `(enabled: boolean) => void` | Globally enable/disable all clipping without deleting boxes (helpers stay visible) |
| `isEnabled` | `() => boolean` | Whether clipping is currently enabled |
| `setOutlinesVisible` | `(visible: boolean) => void` | Show/hide ALL outlines/fills/handles/gizmos without affecting clipping (clean screenshots) |
| `areOutlinesVisible` | `() => boolean` | Whether outlines are globally shown |
| `selectBox` | `(id: string \| null) => Promise<void>` | Select a box for transform (lazy-init TransformControls) |
| `setTransformMode` | `(mode: "translate" \| "scale" \| "rotate") => void` | Switch TransformControls mode (default `scale`) |
| `getTransformMode` | `() => "translate" \| "scale" \| "rotate"` | Current transform mode |
| `resetRotation` | `(id?: string) => void` | Reset a box's orientation to identity (selected box when omitted) |
| `removeBox` | `(id: string) => void` | Remove a clip box |
| `setBoxMode` | `(id: string, mode: ClipMode) => void` | Set one box's mode (prefer `setModeAll` — the mode is global) |
| `setModeAll` | `(mode: ClipMode) => void` | Set the single global clip mode on every box: `"outside"` (keep inside) / `"inside"` (remove inside) |
| `setBoxVisible` | `(id: string, visible: boolean) => void` | Show/hide a clip box helper |
| `renameBox` | `(id: string, name: string) => void` | Rename a clip box |
| `isPointVisible` | `(p: THREE.Vector3) => boolean` | Whether a world point survives the current clipping (used to cull markers / reject clipped picks) |
| `setDraft` | `(box: THREE.Box3 \| null) => void` | Show a draft preview box (no clipping applied) |
| `getBoxes` | `() => ClipBoxEntry[]` | Get all clip boxes (cloned) |
| `getSelectedId` | `() => string \| null` | Get currently selected box ID |
| `hasBox` | `() => boolean` | Whether any clip boxes exist |
| `clear` | `() => void` | Remove all clip boxes |
| `dispose` | `() => void` | Full cleanup including TransformControls |

| Property | Type | Description |
|---|---|---|
| `faceHandles` | `FaceHandleController \| null` | Getter — the box-resize handle controller (for viewport event forwarding) |

| Callback | Type | Description |
|---|---|---|
| `onChange` | `(boxes: ClipBoxEntry[]) => void` | Called after any mutation |
| `onSelectChange` | `(id: string \| null) => void` | Called when selection changes |

### `ExportManager`

Renders views to images and records camera animations to MP4.

| Method | Signature | Description |
|---|---|---|
| `capture` | `(options: ExportOptions) => Promise<string>` | Render and return a data URL. `view: "current"` snapshots the live camera; `top/front/side/back` render an orthographic shot framed to the cloud bounds. |
| `recordAnimation` | `(opts: RecordOptions) => Promise<Blob>` | Render a camera animation **frame by frame** to an MP4 Blob (default 1920×1080, H.264 via WebCodecs + mp4-muxer). Deterministic — no stutter. Requires WebCodecs (Chrome/Edge), throws otherwise. |
| `static download` | `(dataUrl: string, filename: string) => void` | Trigger browser file download |

```typescript
interface RecordOptions {
  /** Position the camera for absolute time `t` (seconds). Called once per frame. */
  sampleCamera: (t: number) => void;
  durationSec: number;
  fps?: number;        // default 30
  width?: number;      // default 1920
  height?: number;     // default 1080
  background?: "white" | "black" | "transparent" | "current"; // default "current"
  bitrate?: number;    // default 12_000_000 (12 Mbps)
  onProgress?: (fraction: number) => void;
}
```

### `MarkerManager`

Renders panorama camera markers as constant on-screen-size pins (`THREE.Sprite` with `sizeAttenuation:false`), so they do not grow/shrink with zoom. Labels are subtle and shown on hover/selection only by default, controlled by `DisplaySettings.markerLabelMode` (`"hover" | "always" | "hidden"`).

| Method | Signature | Description |
|---|---|---|
| `build` | `(cameras: CameraData[], worldBox?: THREE.Box3) => void` | Create pin sprites for all cameras |
| `getMeshes` | `() => THREE.Object3D[]` | Get sprites for raycasting |
| `setHovered` | `(idx: number) => void` | Highlight a marker on hover (-1 = none); reveals its label when `markerLabelMode="hover"` |
| `setSelected` | `(idx: number) => void` | Mark a marker as selected (-1 = none) |
| `setVisible` | `(visible: boolean) => void` | Show/hide all markers |
| `applyClipFilter` | `(predicate: ((pos: THREE.Vector3) => boolean) \| null) => void` | Hide markers whose camera position fails the predicate (typically `ClipManager.isPointVisible`). Pass `null` to show all. |
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
| `updateSnap` | `(worldPos: THREE.Vector3, color?: string) => void` | Live cursor preview while measuring — constant on-screen crosshair sprite + dashed rubber-band line |
| `clearSnap` | `() => void` | Clear the snap crosshair/rubber-band |
| `setVisible` | `(visible: boolean) => void` | Show/hide all measurement objects |
| `dispose` | `() => void` | Full cleanup |

| Property | Type | Description |
|---|---|---|
| `activeMeasurement` | `Measurement \| null` | In-progress measurement, if any |
| `onChange` | `(measurements: Measurement[]) => void` | Called after any mutation |

### `MinimapRenderer`

Top-down orthographic minimap with camera frustum overlay, rendered in the **bottom-right** corner of the viewport.

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
  cameraUp?: { x: number; y: number; z: number }, // default { x: 0, y: 0, z: 1 }
): Omit<ViewerScene, "id" | "createdAt">
```
Assembles a `ViewerScene` payload from current viewer state. Pass the result to `presentationManager.addScene()`.

### `AxisWidget`

Renders a small always-visible XYZ orientation widget in the **bottom-left** corner of the viewport via a scissor-test post-render pass (flat `MeshBasicMaterial`, mirrors the main camera's rotation).

| Method | Signature | Description |
|---|---|---|
| `constructor` | `(sm: SceneManager)` | Self-registers a post-render callback on the SceneManager |
| `dispose` | `() => void` | Remove the widget and dispose its geometry/materials |

> `FaceHandleController` and `FpsControls` also live in `packages/core/src/core/` but are **internal** — they are not part of the public exports.

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
  /** Full 3-axis box orientation. Defaults to identity. */
  quaternion: THREE.Quaternion;
}
```

### Export

```typescript
type ExportView = "current" | "top" | "front" | "side" | "back" | "custom";
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
type UiMode = "professional" | "lite";
type PanoEngine = "pannellum" | "photo-sphere-viewer";

type NavigationMode = "orbit" | "free" | "pan";
type CameraProjection = "perspective" | "orthographic";

type ActiveTool =
  | "none"
  | "measure-point" | "measure-distance" | "measure-height"
  | "measure-area" | "measure-volume" | "measure-angle" | "measure-profile"
  | "section-box" | "section-plane"
  | "annotate";

type ColorMode = "rgb" | "height" | "intensity" | "intensity_gradient" | "classification" | "return_number" | "source";
```

### Georeference

```typescript
interface GeoInfo {
  georeferenced: boolean; // true when the cloud carries a non-empty CRS
  projection: string;     // raw CRS string (proj4/WKT/EPSG), "" when absent
}
```

### Display settings

```typescript
type DisplayPreset = "compact" | "standard" | "prominent";

interface DisplaySettings {
  preset: DisplayPreset;
  measurementLineWidth: number;    // pixels
  measurementLabelScale: number;   // multiplier
  measurementSphereRadius: number; // world units
  markerSphereScale: number;       // multiplier on pin size
  markerSphereOpacity: number;     // 0–1
  markerLabelScale: number;        // multiplier
  markerLabelMode?: "hover" | "always" | "hidden"; // when marker labels show (optional)
}

// Pre-defined presets — also exported as DISPLAY_PRESETS constant.
// markerLabelMode defaults: compact/standard → "hover", prominent → "always".
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
| `formatLength` | `(meters: number) => string` | Always metric, 2 decimals — e.g. `"1.23 m"` |
| `formatArea` | `(m2: number) => string` | e.g. `"4.56 m²"` (2 decimals) |
| `formatVolume` | `(m3: number) => string` | e.g. `"7.89 m³"` (2 decimals) |
| `formatAngle` | `(radians: number) => string` | e.g. `"45.0°"` |
| `formatCoord` | `(x: number, y: number, z: number, decimals?: number) => string` | Formatted coordinate string, e.g. `"X: 1.23, Y: 4.56, Z: 7.89"` |
| `exportMeasurementsCSV` | `(measurements: Measurement[]) => string` | Generate CSV string from measurements (does not download — call `ExportManager.download()` or use `useMeasurementActions().exportCSV()`) |

### `cn()` utility

React-only, exported from `@der-ort/pano-cloud-viewer` only:

| Function | Signature | Description |
|---|---|---|
| `cn` | `(...inputs: ClassValue[]) => string` | `clsx` + `tailwind-merge` for conditional class names |

### `pcvChromeScaleStyle`

Inline style object (`{ zoom: "var(--pcv-scale, 1)" }`) applying the `uiScale` chrome scaling to a container. Apply to non-viewport chrome only — never the 3D canvas.

### `useDraggable()`

React-only hook for making floating panels draggable. Returns a `DraggableState` (`UseDraggableOptions` configures the initial position / bounds).

---

## 18. Version / Build Identity

The version and build identity are baked into the bundle at build time so a consuming app can confirm which viewer build actually shipped (updates ship via the git dependency, so the SHA + build time is the real "did it ship" signal).

```typescript
import { PCV_VERSION, PCV_BUILD, PCV_VERSION_STRING } from '@der-ort/pano-cloud-viewer';
```

| Export | Type | Description |
|---|---|---|
| `PCV_VERSION` | `string` | Package version (from `package.json`) |
| `PCV_BUILD` | `string` | `<short-git-sha> · <UTC build time>` |
| `PCV_VERSION_STRING` | `string` | Combined display string |

These are also shown in the pro QuickSettingsPopover footer, the MinimalSettingsPopover footer, and the AboutDialog.

---

## 19. Component Slot System

Override the built-in shadcn-style UI primitives (Dialog, Button, …) app-wide via the `components` prop on `<PanoCloudViewer>` or directly with `ComponentsProvider`.

```typescript
import { ComponentsProvider, useComponents, defaultComponents } from '@der-ort/pano-cloud-viewer';
import type { ViewerComponents, ComponentsProviderProps } from '@der-ort/pano-cloud-viewer';
```

| Export | Description |
|---|---|
| `ComponentsProvider` | Provides a `Partial<ViewerComponents>` map, shallow-merged over `defaultComponents` |
| `useComponents()` | Returns the resolved component map |
| `defaultComponents` | The built-in primitive set |
| `ViewerComponents` | The slot map type |

All shadcn-style UI primitives are also re-exported from the package root (`export * from "./ui"`).
