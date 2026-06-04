# PanoCloudViewer

Embeddable React component library for viewing Potree 2.0 point clouds and 360° panoramic images.
Package names: `@der-ort/pano-cloud-viewer` (React UI) · `@der-ort/pano-cloud-viewer-core` (headless engine)

---

## Two-Package Architecture

The library is split into two packages:

| Package | Role |
|---|---|
| `@der-ort/pano-cloud-viewer-core` | Headless engine: Three.js manager classes, data adapters, shared types, format helpers. Zero React / UI dependencies. Lives in `packages/core/`. |
| `@der-ort/pano-cloud-viewer` | React UI: providers, hooks, shadcn-style components, layouts, themes, i18n. Depends on core. Lives in `packages/viewer/`. |

`packages/viewer` bundles core into its `dist` at build time (`tsup noExternal` + `dts.resolve`), so the prebuilt artifact is self-contained — consumers never resolve core separately. The package is consumed as a git dependency:
```json
"@der-ort/pano-cloud-viewer": "github:der-ort/panocloudviewer&path:packages/viewer"
```

---

## Monorepo Structure

```
packages/core/          → Headless engine (no React, no UI)
  src/
    core/               → Manager classes (SceneManager, PointCloudLoader, etc.)
    data/               → FileSourceAdapter and implementations
    format.ts           → Format helper functions
    types.ts            → All exported TypeScript types
    index.ts            → Core public exports

packages/viewer/        → React UI library
  src/
    components/         → React UI components
      toolbar/          → MainToolbar, ViewControls, DisplayControls, MeasureTools, SectionTools, ExportTools, ToolRail
      sidebar/          → Sidebar, PanoPanel, ScenePanel, MeasurementsPanel, ClassificationPanel, ScenesPanel
      overlays/         → PanoViewer, AboutDialog, RenderingSettings, DisplaySettingsDialog
      pano-cloud-viewer.tsx  → Root drop-in component
      viewport.tsx           → Three.js wiring component
      workspace-layout.tsx   → Default shell layout (toolbar + viewport + sidebar)
    hooks/              → Action hooks: useNavigationActions, useMeasurementActions, useClipActions, etc.
    layouts/            → MinimalLayout, WorkstationLayout, FloatingPalette, CollapsibleSidebar
    providers/          → React context providers
    i18n/               → ViewerLocale, en, de, LocaleProvider
    themes/             → CSS custom property themes (base.css, smart-agile.css)
    lib/                → Utilities (cn)
    index.ts            → Public exports (re-exports everything from core + viewer UI)

apps/web/               → Next.js demo / documentation site
apps/electron/          → Electron desktop wrapper
docs/                   → Documentation (Markdown + VitePress)
```

---

## Commands

```sh
pnpm install                                          # Install all dependencies
pnpm build                                            # Build everything
pnpm dev                                              # Run Next.js dev server (apps/web)
pnpm --filter @der-ort/pano-cloud-viewer build        # Build viewer library only
pnpm build:web                                        # Build Next.js static export → apps/web/out/
pnpm lint                                             # TypeScript check across all packages
```

---

## Architecture: Three-Layer Model

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1 — React / Provider  (packages/viewer)      │
│  ViewerProvider · DataProvider · ThemeProvider      │
│  LocaleProvider                                     │
│  Holds UI state; stores manager refs after init     │
├─────────────────────────────────────────────────────┤
│  LAYER 2 — Manager Classes  (packages/core)         │
│  SceneManager · PointCloudLoader · CameraAnimator   │
│  MarkerManager · MeasurementManager · ClipManager   │
│  ExportManager · MinimapRenderer · PresentationMgr  │
│  AxisWidget                                         │
│  Instantiated inside Viewport; passed up via setters│
├─────────────────────────────────────────────────────┤
│  LAYER 3 — Renderer / WebGL                         │
│  THREE.WebGLRenderer · potree-core · OrbitControls  │
│  TransformControls                                  │
└─────────────────────────────────────────────────────┘
```

**Layer 1 (Provider/React)**: Holds all UI state with `useState`. Providers expose their values through React context. Manager instances (layer 2) are stored *in React state as refs* after Viewport initialises them — this lets toolbar and sidebar components call manager methods without prop-drilling.

**Layer 2 (Managers)**: Plain TypeScript classes in `packages/core` that own Three.js objects and implement all 3D logic. They know nothing about React. They call back into React state via callback props (e.g. `onChange`, `onFpsUpdate`) rather than importing context directly.

**Layer 3 (Three.js / WebGL)**: The raw rendering stack — `THREE.WebGLRenderer`, `potree-core`'s octree streaming, and the Three.js controls.

---

## Manager Classes

All manager classes live in `packages/core/src/core/` and are exported from both `@der-ort/pano-cloud-viewer-core` and (via re-export) `@der-ort/pano-cloud-viewer`.

### `SceneManager` (`packages/core/src/core/scene-manager.ts`)
Central Three.js scene, camera, renderer, and animation loop.

- **Constructor**: `{ canvas, onFpsUpdate?, onPointsUpdate? }` — creates Scene, PerspectiveCamera, WebGLRenderer, OrbitControls, lights, ResizeObserver.
- **`start()`**: Starts `requestAnimationFrame` loop. Each frame: explicit clear → updates active controls → calls `potree.updatePointClouds()` → fires pre-render frame callbacks → renders → resets scissor/viewport → fires post-render callbacks → counts FPS.
- **`setNavigationMode(mode)`**: Switches between `"orbit"`, `"free"`, `"pan"` by reconfiguring the single `OrbitControls` (mouse-button map + `maxPolarAngle`). Orbit = CAD turntable; Free = Blender-ish (rotate on left+middle); Pan = map/top-down (left-drag pans, `maxPolarAngle=π/2.05`). `zoomToCursor=true` and damping throughout.
- **`setProjection(mode)`**: Switches between `"perspective"` and `"orthographic"`. Orthographic uses a synced ortho camera derived from the perspective camera's FOV each frame.
- **`addPostRenderCallback(cb)` / `removePostRenderCallback(cb)`**: Register callbacks that run after the main render (used by AxisWidget for scissor-test overlay pass).
- **`addFrameCallback(cb)` / `removeFrameCallback(cb)`**: Register arbitrary callbacks run every frame before render. Used by MinimapRenderer.
- **`fitToBox(box)`**: Positions camera to frame a bounding box.
- **`raycast(nx, ny, objects)`**: Screen-space raycast returning `THREE.Intersection[]`.
- **`dispose()`**: Cancels animation, disconnects ResizeObserver, disposes renderer.
- **Key fields**: `scene`, `camera`, `renderer`, `controls`, `potree` (set after lazy import), `pointClouds[]`, `flySpeed`.
- **Provider state written**: `fps` via `onFpsUpdate` callback.

### `PointCloudLoader` (`core/point-cloud-loader.ts`)
Loads Potree 2.0 point clouds via `potree-core`.

- **`load(metadataPath, pointBudget)`**: Lazy-imports `potree-core`, calls `potree.loadPointCloud()` with a `requestManager` built from the `FileSourceAdapter`. Detects RGB attribute in `metadata.json` and sets appropriate `PointColorType`. Sets `outputColorEncoding=1` (see Color Rendering section). Fits camera to world box. Sets `flySpeed` on SceneManager proportional to cloud size.
- **`setColorMode(mode)`**: Switches `PointColorType` on all loaded materials. Always re-applies `outputColorEncoding=1` after switching to preserve the gamma fix.
- **`setPointBudget(budget)`**: Sets `potree.pointBudget`.
- **`setPointSize(size)` / `setPointShape(shape)` / `setPointSizeType(type)`**: Direct material property setters.
- **`readMetadata(path)`**: Returns `PointCloudMetadata | null`.
- **`static calcOptimalBudget(totalPoints)`**: Heuristic budget calculation (30% / 15% / 8% of total depending on size, capped 500K–10M).
- **`worldBox`**: `THREE.Box3` of the loaded cloud in world space, available post-load.
- **`hasRgbData`**: `boolean` getter.
- **`ColorMode` export**: `"rgb" | "height" | "intensity" | "intensity_gradient" | "classification" | "return_number" | "source"`

### `CameraAnimator` (`core/camera-animator.ts`)
Smooth camera fly-to animations, no external tween library.

- **`flyTo({ position, target, duration? })`**: Animates camera position and OrbitControls target using quartic ease-out over `duration` ms (default 800). Cancels any in-progress animation. Returns `Promise<void>`.
- **`flyToCamera(camPos, yawDeg, offset, duration)`**: Convenience method — positions camera `offset` units behind a panorama marker and looks at it.
- **`cancel()`**: Cancels in-progress animation.

### `ClipManager` (`core/clip-manager.ts`)
Manages multiple named axis-aligned clip boxes with TransformControls support.

- **`addBox(box, name?)`**: Adds a `ClipBoxEntry`, creates a yellow `Box3Helper` in the scene, applies clipping to all point clouds. Returns the entry. Default post-create transform mode is `scale` (the `FaceHandleController` shows the 6 axis-colored resize handles); Move shows translate arrows; Rotate shows a single world-Z ring.
- **`selectBox(id)` / `setTransformMode(mode)`**: Lazy-initialises TransformControls, attaches an invisible pivot mesh. Disables OrbitControls while dragging. **three r170**: `TransformControls` extends `Controls`/`EventDispatcher` (not `Object3D`), so its visual gizmo is added to the scene via `tc.getHelper()` (which returns the internal `_root` Object3D), never `scene.add(tc)`. The `_raiseGizmo()` helper (which forces the gizmo to render over the dense cloud via `depthTest=false` + high `renderOrder`) must traverse `tc.getHelper()`, not the controls object — the controls object has no `traverse`.
- **`removeBox(id)` / `setBoxMode(id, mode)` / `setBoxVisible(id, visible)` / `renameBox(id, name)`**: Mutate entries and call `applyAll()`.
- **`setDraft(box)`**: Shows a live preview helper during drag (no clip applied).
- **`clear()`**: Removes all boxes and disables clipping.
- **`dispose()`**: Disposes TransformControls and scene objects.
- **`onChange?: (boxes: ClipBoxEntry[]) => void`**: Called on every mutation; Viewport wires this to `setClipBoxEntries`.
- **`onSelectChange?: (id: string | null) => void`**: Wired to `setSelectedClipBoxId`.
- **`ClipMode`**: `"outside"` (keep inside box) → `clipMode=1`; `"inside"` (remove inside box) → `clipMode=2`.

### `ExportManager` (`core/export-manager.ts`)
Renders orthographic views to image files.

- **`capture(options: ExportOptions)`**: Creates a temporary `OrthographicCamera` pointing in the requested direction, renders to a `WebGLRenderTarget` at `scale × viewport size`, reads back pixels, flips Y (WebGL is bottom-up), draws to a `<canvas>`, returns a data URL.
- **`static download(dataUrl, filename)`**: Triggers browser download.
- **View directions**: `top`, `front`, `side`, `back` (fixed directions), `custom` (uses top direction).

### `MarkerManager` (`core/marker-manager.ts`)
Renders panorama camera markers as constant on-screen-size pins.

- **`build(cameras, worldBox?)`**: Clears existing markers, creates a `THREE.Sprite` per camera using a `CanvasTexture` (glow + circle + camera icon + label). Sprites use `sizeAttenuation:false` so they stay a **constant screen size** (pins) and do not grow/shrink with zoom — they are no longer world-sized sphere meshes. Sprites have `depthTest=false` so they are always visible through the point cloud.
- **Labels**: Subtle and shown on hover/selection only by default. Governed by `markerLabelMode: "hover" | "always" | "hidden"` on `DisplaySettings` (in `DISPLAY_PRESETS`; compact/standard → `"hover"`, prominent → `"always"`). `markerSphereScale` / `markerSphereOpacity` / `markerLabelScale` still tune pin size / opacity / label size.
- **`getMeshes()`**: Returns sprites for raycasting.
- **`setHovered(idx)` / `setSelected(idx)`**: Recolors the sprite texture (default=yellow, hover=white, selected=orange-red); also reveals the label when `markerLabelMode="hover"`.
- **`setVisible(visible)`**: Shows/hides the entire group.
- **`dispose()`**: Disposes textures and materials, removes group from scene.

### `MeasurementManager` (`core/measurement-manager.ts`)
Interactive 3D measurement tool with visual scene objects.

- **`start(type)`**: Creates a new `Measurement` object and sets it as `activeMeasurement`.
- **`addPoint(point)`**: Appends a point to the active measurement. Auto-finishes for `point` (1 pt), `distance`/`height` (2 pts), `angle` (3 pts). Rebuilds preview line while drawing.
- **`finish()`**: Computes value (distance, height, area via shoelace, angle, volume via bounding box), builds permanent 3D objects (spheres + lines + text sprite), stores in map, fires `onChange`.
- **`remove(id)` / `clearAll()`**: Disposes geometry/materials, removes from scene.
- **`onChange?: (measurements: Measurement[]) => void`**: Wired to `setMeasurementList` in Viewport.

### `MinimapRenderer` (`core/minimap-renderer.ts`)
Top-down orthographic minimap with overlay.

- **`attach(container)`**: Creates two `<canvas>` elements inside container — one WebGL (3D scene rendering), one 2D overlay (camera frustum indicator, compass "N").
- **`setBounds(bounds)`**: Calculates padded square world range, positions `OrthographicCamera` above center.
- **`update()`**: Called every frame via `SceneManager.addFrameCallback`. Throttled: renders 3D every 6th frame (~10 fps), overlay every 2nd frame.
- **`canvasToWorld(cx, cy)`**: Converts canvas pixel coordinates to world XY for click-to-navigate.
- **`resize()`**: Syncs canvas dimensions to container.
- **`dispose()`**: Removes canvases, disposes renderer.

### `PresentationManager` (`core/presentation-manager.ts`)
Persists named viewer scenes (camera position + clip boxes + display settings) in `localStorage`.

- **Constructor `(sourceKey)`**: Storage key is `pcv_scenes_${sourceKey}` — one list per project.
- **`addScene(scene)` / `removeScene(id)` / `renameScene(id, name)`**: Mutate and persist. Max 50 scenes.
- **`getScenes()`**: Returns a shallow copy of the scenes array.
- **`exportJSON()` / `importJSON(json)`**: Serialise / merge scenes for sharing.
- **`clear()`**: Wipes all scenes.
- **`onChange?: (scenes: ViewerScene[]) => void`**: Callback after every mutation.
- **`captureScene(...)` (standalone function)**: Helper to assemble a `ViewerScene` object from current state without saving it.
- **Note**: `PresentationManager` is *not* wired into `ViewerProvider` by default — the `ScenesPanel` component creates it ad-hoc.

---

## Component Tree

```
PanoCloudViewer             ← root drop-in (sets up all providers)
  LocaleProvider
  ThemeProvider
  DataProvider              ← fetches cameras.json + metadata.json
  ViewerProvider            ← holds all viewer state + manager refs
    [children render prop?]
      WorkspaceLayout       ← DEFAULT: full shell (toolbar + viewport + sidebar)
      OR custom layout      ← via children=(viewport)=>JSX
        Viewport [lazy]     ← Three.js init, event handlers, minimap overlay
        (your UI components)
```

When the `children` render prop is **not** provided, `PanoCloudViewer` renders `WorkspaceLayout`:

```
WorkspaceLayout
  MainToolbar               ← top bar (logo, view controls, toggles)
  ToolRail                  ← left icon rail (measure/section tools)
  Viewport [lazy]           ← Three.js init, event handlers, minimap overlay
  PanoViewer                ← 360° panorama overlay (conditionally rendered)
  RenderingSettings         ← rendering settings panel overlay
  Sidebar                   ← right collapsible sidebar
    PanoPanel
    ScenePanel
    MeasurementsPanel
    ClassificationPanel
    ScenesPanel
```

Alternative packaged layouts (use via the render prop):
- `MinimalLayout` — viewport + minimal floating toolbar
- `WorkstationLayout` — viewport + collapsible side-panel with floating palettes + status bar

**`Viewport`** is lazy-imported using `React.lazy()`:
```ts
const Viewport = lazy(() => import("./viewport").then(m => ({ default: m.Viewport })));
```
This prevents potree-core and Three.js from loading on the server.

**All components** use `"use client"` — Three.js is browser-only.

### Viewport responsibilities
1. Creates all manager instances (SceneManager, PointCloudLoader, etc.) in a one-time `useEffect`.
2. Registers a minimap frame callback with `SceneManager`.
3. Wires manager callbacks to provider state setters (`onChange → setMeasurementList`, etc.).
4. Passes manager instances up to `ViewerProvider` via `setSceneManager`, `setLoader`, etc.
5. Handles pointer events: marker raycasting, measurement clicks, section-box drag, right-click to finish.
6. Syncs provider state changes back to managers via secondary `useEffect`s (navigation mode, marker visibility, etc.).
7. Renders minimap DOM overlay and tool hint bar.

---

## Provider Pattern

### `ViewerProvider` + `useViewer()`
Core state store. Exposes:
- Manager refs: `sceneManager`, `loader`, `measurementManager`, `markerManager`, `cameraAnimator`, `exporter`, `minimap`, `clipManager` (all `null` until Viewport initialises)
- Setter methods for each manager (called by Viewport)
- UI state: `activeTool`, `pointBudget`, `pointSize`, `fps`, `pointCount`, `measurementList`, `showMarkers`, `showMinimap`, `selectedCamera`, `clipBoxEntries`, `selectedClipBoxId`, `colorMode`, `navigationMode`, `projection`, `displaySettings`
- `config: ViewerConfig`

**`uiScale?: number` prop (chrome-only scaling)**: `PanoCloudViewer` accepts an optional `uiScale` (default `1`) that scales only the UI **chrome** — toolbars, tool-rail, sidebar, floating palettes, dialogs — by setting a `--pcv-scale` CSS variable plus `zoom` on the chrome wrapper. The 3D viewport/canvas is deliberately left at full device resolution so point-cloud rendering stays crisp. Use values like `1.25` to enlarge controls on large/high-DPI displays or `0.85` to compact them.

Managers are stored in React `useState` (not `useRef`) so that toolbar/sidebar components re-render when managers become available.

### `DataProvider` + `useData()`
Fetches `cameras.json` and `metadata.json` from the adapter on mount. Exposes: `cameras`, `metadata`, `loading`, `error`, `reload()`. Resolves image URLs via `adapter.resolveUrl()`.

### `ThemeProvider` + `useTheme()`
Dark/light/system theme. Persists to `localStorage` (`pcv-theme` key). Applies `dark`/`light` class and `data-theme` attribute to `document.documentElement`. Exposes: `theme`, `resolvedTheme`, `setTheme()`, `toggleTheme()`.

### `LocaleProvider` + `useLocale()`
Provides the active `ViewerLocale` dictionary to all components. Accepts an optional `locale` prop; falls back to `en`. Wrap at the root (already done by `PanoCloudViewer`). Components call `useLocale().toolbar.about` etc. for all UI strings.

---

## Action Hooks (`packages/viewer/src/hooks/`)

High-level hooks for custom UIs. Each encapsulates a logical group of actions, all stable callbacks. Must be used inside `<ViewerProvider>`.

| Hook | Purpose |
|---|---|
| `useNavigationActions()` | `fitToView`, `flyToView(preset)`, `navigationMode`, `setNavigationMode`, `projection`, `setProjection` |
| `useMeasurementActions()` | `startTool(type)`, `cancelTool`, `measurements`, `clearAll`, `remove(id)`, `rename(id,name)`, `exportCSV` |
| `useClipActions()` | `addBox`, `clearAll`, `toggleMode`, `selectBox(id)`, `setTransformMode(mode)`, `boxes`, `clipMode`, `hasClipBox` |
| `useDisplayActions()` | `colorMode`, `setColorMode`, `pointBudget`, `setPointBudget`, `pointSize`, `setPointSize`, `setQualityPreset` |
| `useExportActions()` | `capture(options)`, `download(dataUrl, filename)` |
| `useVisibilityActions()` | `showMarkers`, `toggleMarkers`, `showMinimap`, `toggleMinimap` |
| `useDisplaySettings()` | `settings`, `presets`, `applyPreset(preset)`, `updateSetting(key, value)` |

---

## Source Adapter Pattern

`FileSourceAdapter` interface (`data/file-source-adapter.ts`):
```ts
interface FileSourceAdapter {
  resolveUrl(relativePath: string): string;
  fetchJson<T>(relativePath: string): Promise<T>;
  fetchBinary(relativePath: string): Promise<ArrayBuffer>;
  fetchWithHeaders?(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  listDirectories?(path: string): Promise<string[]>;
}
```

**`S3SourceAdapter`**: Uses `fetch()` with optional auth headers. Merges headers on `fetchWithHeaders`. Used for `s3` and `local` source types.

**`ElectronSourceAdapter`**: Uses `window.electronFS` IPC bridge (exposed by preload script). Falls back gracefully if bridge unavailable. Resolves URLs as `file:///absolute/path`.

**`createAdapter(source)`**: Factory function — switch on `source.type` → returns appropriate adapter. `local` type is treated as `S3SourceAdapter` (served by dev server).

To add a new adapter: implement `FileSourceAdapter`, add a new source type to `PointCloudSource` in `packages/core/src/types.ts`, and add a case in `packages/core/src/data/file-source-adapter.ts`.

---

## Key Design Decisions

### `renderer.outputColorSpace = THREE.LinearSRGBColorSpace`
potree-core's vertex shaders output sRGB-encoded color values directly (they do the conversion themselves). Using `THREE.SRGBColorSpace` would instruct Three.js to apply gamma encoding a second time during framebuffer write, causing the point cloud to appear washed-out/white. `LinearSRGBColorSpace` tells Three.js to write the values as-is, preserving the already-correct sRGB output from potree-core's shaders.

### `mat.outputColorEncoding = 1` (ColorEncoding.SRGB) after loading
potree-core's default material settings are `inputColorEncoding=SRGB, outputColorEncoding=LINEAR`. This triggers a `fromLinear(vColor)` call in the vertex shader which interprets the sRGB data as if it were linear and re-encodes it — causing extreme brightness on RGB point clouds. Setting `outputColorEncoding=1` (SRGB) disables this conversion path so sRGB data passes through untouched. This fix must be re-applied after every `setColorMode()` call as potree-core may reset the material.

### Lazy-import of potree-core
potree-core is a heavy, WebGL-only bundle. Importing it at module load time would break SSR (Next.js server renders) and slow initial bundle load. It is always imported inside `async` functions: `const { Potree, PointColorType } = await import("potree-core")`.

### `"use client"` on all components
Three.js uses `window`, `document`, `requestAnimationFrame`, `WebGLRenderingContext` — none of which exist in Node.js. All viewer components carry the `"use client"` directive to prevent Next.js from attempting server-side rendering of any part of the tree.

### Single OrbitControls for all navigation modes
`SceneManager` keeps **one** `OrbitControls` instance for orbit/free/pan. `setNavigationMode` only swaps `controls.mouseButtons` and `maxPolarAngle`; the frame loop always calls `this.controls.update()`. This is deliberate: clipping, the minimap, `CameraAnimator.flyTo`, and the ortho-camera sync all read `controls.target`, so introducing a second controller (e.g. TrackballControls/MapControls with its own target) would desync them. Keep navigation on the single instance.

### Managers stored in React state (not refs)
Manager instances are stored via `useState` in `ViewerProvider`. If they were stored in `useRef`, toolbar and sidebar components would not re-render when managers become available after Viewport initialises, and conditional renders like `loader && <SomePanel />` would never show. State storage triggers the necessary re-render cascade.

### `TransformControls` in three r170 extends `Controls`, not `Object3D`
As of three r170, `TransformControls` no longer **is** an `Object3D` — it extends `Controls` / `EventDispatcher`. Its visual gizmo lives in an internal `_root` Object3D obtained via `tc.getHelper()`. The clip-box transform handles must therefore be added to the scene with `scene.add(tc.getHelper())` — `scene.add(tc)` would add nothing visible. Likewise the `_raiseGizmo()` helper (which sets `depthTest=false` + a high `renderOrder` so the gizmo draws over the dense point cloud) must call `tc.getHelper().traverse(...)`; the controls object itself has no `traverse` method and would throw.

### Marker pins are constant on-screen size
Panorama markers are `THREE.Sprite`s with `sizeAttenuation:false`, so they keep a fixed pixel size regardless of zoom (map-pin behaviour) rather than scaling with distance like world-sized meshes. Labels are subtle and gated by `DisplaySettings.markerLabelMode` (`"hover" | "always" | "hidden"`) so dense camera sets don't drown the view in text.

### `uiScale` scales chrome only, not the canvas
The `uiScale` prop scales the UI chrome (toolbars, tool-rail, sidebar, floating palettes, dialogs) via a `--pcv-scale` CSS variable plus `zoom`, while the 3D viewport/canvas stays at full device resolution. This keeps point-cloud rendering crisp on high-DPI / large displays while letting the surrounding controls be enlarged or shrunk independently.

---

## Navigation Modes

All three modes use the same `OrbitControls` instance (`zoomToCursor=true`, damping, positive/natural `rotateSpeed`); `setNavigationMode` only changes `mouseButtons` + `maxPolarAngle`.

| Mode | Config | Behaviour |
|---|---|---|
| `orbit` (default) | `maxPolarAngle=π`, buttons `{LEFT:ROTATE, MIDDLE:DOLLY, RIGHT:PAN}` | CAD turntable; rotate around target; full sphere; zoom-to-cursor |
| `free` | `maxPolarAngle=π`, buttons `{LEFT:ROTATE, MIDDLE:ROTATE, RIGHT:PAN}` | Blender-ish; rotate on left+middle drag; free angle |
| `pan` | `maxPolarAngle=π/2.05`, buttons `{LEFT:PAN, MIDDLE:DOLLY, RIGHT:ROTATE}` | Map / top-down; left-drag pans; horizon-locked |

Switch via `setNavigationMode(mode)` in `ViewerProvider` — Viewport syncs to `SceneManager` via `useEffect`.

`CameraProjection` (`"perspective" | "orthographic"`) is a separate axis — use `setProjection(mode)` on `SceneManager` or `ViewerProvider`. The orthographic view derives its frustum from the perspective camera's FOV and current orbit distance.

---

## i18n System

- **`ViewerLocale`** (`i18n/types.ts`): Full interface with sections `toolbar`, `exportPanel`, `toolRail`, `sidebar`, `scenePanel`, `panoPanel`, `classificationPanel`, `measurementsPanel`, `viewport`, `renderingSettings`, `scenesPanel`, `about`, `panoViewer`. Some values are functions: `statusPts: (millions: number) => string`.
- **Built-in locales**: `en` (`i18n/en.ts`), `de` (`i18n/de.ts`).
- **`createLocale(base, overrides)`**: Deep-merges `DeepPartial<ViewerLocale>` into a base locale. Use for partial overrides without writing a full locale object.
- **`LocaleProvider`** (`i18n/locale-context.tsx`): Wraps the component tree. Accepts `locale?: ViewerLocale` prop.
- **`useLocale()`**: Returns the active `ViewerLocale`. Components access individual sections: `const t = useLocale().toolbar`.
- **Adding a locale**: Copy `en.ts`, translate all strings, export and pass to `<PanoCloudViewer locale={myLocale} />`.

---

## Conventions

- **TypeScript strict mode** throughout — no `any` except where potree-core's untyped API forces it (always `eslint-disable` commented).
- **UI primitives**: Radix UI (accessible, unstyled) for dialogs, dropdowns, sliders, tabs.
- **Styling**: Tailwind CSS + CSS custom properties. Colors always via `hsl(var(--brand))` pattern — never hardcoded hex in JSX.
- **Icons**: `lucide-react`.
- **`cn()` utility** (`lib/utils.ts`): `clsx` + `tailwind-merge` for conditional class names.
- **Format utilities**: `formatLength`, `formatArea`, `formatVolume`, `formatAngle`, `formatCoord` in `lib/utils.ts`.

---

## Theming

CSS custom properties defined in `packages/viewer/src/themes/`. Two files ship:
- `base.css` — neutral token definitions (shadcn/ui naming convention). Import this to style from scratch.
- `smart-agile.css` — smart+agile brand preset: yellow `#DCD546` on dark / purple `#9B94FF`-ish on light. Imports `base.css`.

```css
/* Usage pattern — all color references in components */
color: hsl(var(--brand));
background: hsl(var(--background));
border-color: hsl(var(--border));
```

Key variables: `--brand`, `--background`, `--foreground`, `--border`, `--muted`, `--card`, `--font-sans`, `--font-mono`, `--radius`.

Viewer-specific variables: `--toolbar-bg`, `--toolbar-border`, `--sidebar-bg`, `--sidebar-width`, `--statusbar-bg`, `--viewport-bg`.

To integrate with a host shadcn/ui app, map the host's tokens to PanoCloudViewer's variables in a bridge CSS file.

### Readability rule (foreground must follow background)
Any theme or brand preset that overrides `--background` (or the card / toolbar / sidebar background tokens `--card`, `--toolbar-bg`, `--sidebar-bg`, `--statusbar-bg`) **MUST also set the matching `--foreground` / `--card-foreground` / `--muted-foreground`** so text contrast is preserved. Overriding only the background — e.g. flipping to a dark surface while leaving the default dark text — produces unreadable, low-contrast UI. Always change foreground and background tokens together.

---

## Data Format

Potree 2.0 octree folder (output of PanoCloudConverter):
```
project/
├── metadata.json    # Octree metadata, bounds, point attributes (detects RGB attr)
├── hierarchy.bin    # Octree node hierarchy
├── octree.bin       # Binary point data
└── cameras.json     # [optional] Panorama camera positions and image URLs
```

---

## Common Pitfalls

- **Never import potree-core at the top level** — always `await import("potree-core")` inside async functions.
- **Never add `"use server"` or remove `"use client"`** from viewer components — Three.js is browser-only.
- **After any `setColorMode()`** — `outputColorEncoding=1` must be re-applied or RGB clouds will show incorrect brightness.
- **`renderer.outputColorSpace`** — must stay `THREE.LinearSRGBColorSpace`. Changing to `SRGBColorSpace` whitewashes the cloud.
- **`SceneManager.flySpeed`** is a legacy field retained for API compatibility — it no longer drives navigation (orbit/free/pan use a single OrbitControls). Don't rely on it.
- **`PresentationManager`** is not in `ViewerProvider` — it is instantiated directly by `ScenesPanel`. If you need it elsewhere, instantiate it yourself with the source key.
- **`ClipManager.applyAll()`** uses `visible[0].mode` for the global `clipMode` — all boxes share one clip mode. Multiple boxes with different modes is not currently supported.
- **Navigation uses one OrbitControls** — don't add a second controller (Trackball/Map) per mode; `controls.target` is shared by clipping, minimap, camera-animator and ortho sync, so a separate target would desync them.
- **`TransformControls` (three r170) is not an `Object3D`** — add its gizmo with `scene.add(tc.getHelper())`, never `scene.add(tc)`, and traverse `tc.getHelper()` (not `tc`) when raising the gizmo's `renderOrder`/`depthTest`. `tc` has no `traverse`.
- **Marker sprites** use `sizeAttenuation:false` (constant on-screen pin size) and `depthTest=false` (always render on top). Don't switch `sizeAttenuation` back on (pins would scale with zoom) or remove `depthTest=false` (pins would hide behind the cloud).
- **Marker labels** are gated by `DisplaySettings.markerLabelMode` — default `"hover"`. Don't hardcode always-on labels; respect the setting.
- **`uiScale` must not scale the canvas** — it scales chrome via `--pcv-scale` + `zoom` only. Applying `zoom`/scale to the viewport/canvas would degrade WebGL resolution and break pointer-to-NDC math.
- **`DataProvider`** resolves image URLs via `adapter.resolveUrl()` at fetch time. The `CameraData.image` field in context is always a full URL, not a relative path.
