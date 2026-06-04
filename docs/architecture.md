# PanoCloudViewer — Architecture Guide

A deep dive into the design decisions, rendering pipeline, and extension points for new developers.

---

## 1. Overview

`@der-ort/pano-cloud-viewer` is a React component library that embeds a full-featured 3D point cloud viewer into any web or Electron application. Its core responsibilities are:

1. **Stream and render Potree 2.0 octree point clouds** over HTTP/S3 or the local file system, using `potree-core` for octree management and `three` for WebGL rendering.
2. **Overlay interactive tools** — measurements, clip boxes, panorama camera markers — on top of the 3D scene.
3. **Expose a composable React API** so consumers can either use the drop-in `<PanoCloudViewer>` component or assemble a custom layout from individual pieces.

---

## 2. Two-Package Architecture

The library is split across two packages:

| Package | Role |
|---|---|
| `@der-ort/pano-cloud-viewer-core` | Headless engine: Three.js manager classes, data adapters, shared types, format helpers. **Zero React / UI dependencies.** |
| `@der-ort/pano-cloud-viewer` | React UI: providers, hooks, shadcn-style components, layouts, themes, i18n. **Depends on core.** |

### Why the split?

- **Core** can be used without React: server-side tooling, Electron helpers, or alternative UI frameworks only need to install the core package.
- **Viewer** bundles core into its `dist` at build time (`tsup noExternal` + `dts.resolve`), so every consumer import resolves without having to separately install `@der-ort/pano-cloud-viewer-core`.
- Existing imports from `@der-ort/pano-cloud-viewer` continue to work unchanged because the viewer package re-exports everything from core:
  ```ts
  export * from "@der-ort/pano-cloud-viewer-core";
  ```

### Git-dependency install

The library is consumed as a git dependency pointing directly at the monorepo subfolder:

```json
{
  "@der-ort/pano-cloud-viewer": "github:der-ort/panocloudviewer&path:packages/viewer"
}
```

Because the committed `dist/` is self-contained (core bundled in), consumers **never** need to separately install `@der-ort/pano-cloud-viewer-core` or run a build step.

---

## 3. System Diagram

```
┌───────────────────────────────────────────────────────────────┐
│  React component tree (runs in browser)                       │
│                                                               │
│  <PanoCloudViewer>                                            │
│    <LocaleProvider>  ← i18n strings                          │
│    <ThemeProvider>   ← dark/light CSS class on <html>         │
│    <DataProvider>    ← cameras.json + metadata.json           │
│    <ViewerProvider>  ← all viewer state + manager refs        │
│      <WorkspaceLayout>  (default, or custom via children)     │
│        <MainToolbar>  <ToolRail>  <Sidebar>                   │
│        <Viewport [lazy]>  ← Three.js init lives here          │
│          <MinimapOverlay>  <ToolHintBar>                      │
└───────────────────────────────────────────────────────────────┘
                │  creates & stores refs to
                ▼
┌───────────────────────────────────────────────────────────────┐
│  Manager layer (plain TypeScript classes — packages/core)     │
│                                                               │
│  SceneManager       → owns THREE.Scene, camera, renderer      │
│  PointCloudLoader   → potree-core wrapper, octree streaming   │
│  CameraAnimator     → fly-to animations (no tween lib)        │
│  MarkerManager      → 3D sprite markers for pano cameras      │
│  MeasurementManager → interactive 3D measurement tools        │
│  ClipManager        → clip boxes with TransformControls       │
│  ExportManager      → orthographic capture to image           │
│  MinimapRenderer    → secondary WebGL renderer (top-down)     │
│  PresentationManager→ localStorage scene persistence          │
│  AxisWidget         → world-axis indicator overlay            │
└───────────────────────────────────────────────────────────────┘
                │  drives
                ▼
┌───────────────────────────────────────────────────────────────┐
│  Three.js / WebGL                                             │
│                                                               │
│  THREE.WebGLRenderer  THREE.Scene  THREE.PerspectiveCamera    │
│  OrbitControls · TransformControls                │
│  potree-core: Potree.updatePointClouds() (octree LOD)         │
└───────────────────────────────────────────────────────────────┘
```

Data flows up through callbacks: managers call `onChange` / `onFpsUpdate` / `onPointsUpdate` functions that were injected at construction time. These functions are the state setters from `ViewerProvider`. This keeps managers fully decoupled from React.

---

## 4. The Render Pipeline

The render loop lives entirely in `SceneManager.start()`. Each animation frame proceeds in this order:

```
requestAnimationFrame(loop)
  │
  ├─ 1. Explicit clear
  │      renderer.setScissorTest(false); renderer.clear()
  │
  ├─ 2. Controls update
  │      orbitControls.update()   // single instance for all nav modes
  │
  ├─ 3. potree-core LOD update
  │      potree.updatePointClouds(pointClouds, camera, renderer)
  │      → determines which octree nodes to load/unload
  │      → issues background fetch requests via RequestManager
  │
  ├─ 4. Pre-render frame callbacks
  │      forEach(frameCallbacks, cb => cb())
  │      → MinimapRenderer.update() is registered here
  │         → every 6th frame: render scene top-down to minimap GL canvas
  │         → every 2nd frame: draw camera frustum overlay on 2D canvas
  │
  ├─ 5. Main render
  │      renderer.render(scene, activeCamera)
  │      (uses ortho camera when projection === "orthographic")
  │
  ├─ 6. Reset scissor/viewport state
  │
  ├─ 7. Post-render callbacks
  │      forEach(postRenderCallbacks, cb => cb())
  │      → AxisWidget scissor pass renders here
  │
  └─ 8. FPS counter
         if elapsed >= 1000ms: onFpsUpdate(frameCount)
```

`potree.updatePointClouds()` is called *before* the main render so that any geometry updates made by potree-core (adding/removing node meshes from the scene) take effect in the same frame they are requested.

The minimap runs in the same frame callback system, throttled to avoid burning GPU budget on the secondary renderer.

---

## 5. Provider Layer

### Why managers are stored in React state

A natural first instinct is to store manager instances in a module-level singleton or a `useRef`. The problem: toolbar and sidebar components need to *react* to managers becoming available. When `Viewport` finishes initialising and calls `setSceneManager(sm)`, every component consuming `useViewer()` needs to re-render so they can display real data.

`useRef` does not trigger re-renders. `useState` does. So all eight manager refs are stored with `useState` in `ViewerProvider`, even though their values are mutable objects. The state holds a *reference* to the manager instance — React only re-renders when the reference itself changes (i.e. when a manager is first set or replaced), not when the manager's internal state mutates.

### `ViewerProvider`

Owns two categories of state:

**Manager refs** (all `null` until Viewport initialises):
`sceneManager`, `loader`, `measurementManager`, `markerManager`, `cameraAnimator`, `exporter`, `minimap`, `clipManager`

**UI state** (immediately available):
`activeTool`, `pointBudget`, `pointSize`, `fps`, `pointCount`, `measurementList`, `showMarkers`, `showMinimap`, `selectedCamera`, `clipBoxEntries`, `selectedClipBoxId`, `colorMode`, `navigationMode`, `projection`, `displaySettings`, `config`

### `DataProvider`

Fetches project metadata from the adapter using `Promise.allSettled` — if `cameras.json` is absent (it is optional) the provider still succeeds and sets `cameras` to `[]`. Image URLs in `CameraData` are resolved to absolute URLs at fetch time via `adapter.resolveUrl()`, so downstream consumers never see relative paths.

### `ThemeProvider`

Applies the resolved theme as a class on `document.documentElement` (`dark` or `light`) and as `data-theme` attribute. CSS variables in the themes are scoped to `:root` with overrides in `.dark {}`. The `system` theme value reads `window.matchMedia("(prefers-color-scheme: dark)")` at render time.

### `LocaleProvider`

Provides the active `ViewerLocale` object via context. If no `locale` prop is passed to `<PanoCloudViewer>`, the English locale (`en`) is used by default. Components destructure specific sections: `const t = useLocale().toolbar` to avoid re-rendering when unrelated sections change.

---

## 6. Manager Layer

### SceneManager

The foundation everything else builds on. Owns the Three.js scene graph, camera, renderer, and controls. A **single `OrbitControls` instance** drives all three navigation modes (orbit/free/pan) — `setNavigationMode` just reconfigures its mouse-button map and polar limits. Keeping one controller means its `target` stays authoritative for clipping, the minimap, `CameraAnimator`, and the ortho-camera sync, with no multi-controller desync.

The ResizeObserver on the canvas container handles responsive resizing automatically — there is no need for external resize event listeners.

### PointCloudLoader

The only class that touches `potree-core`. It builds a `requestManager` object that proxies fetch calls through the active `FileSourceAdapter`, giving potree-core the ability to send requests with custom headers (e.g. S3 auth tokens) or use Electron's IPC bridge.

The `worldBox` property is the reliable way to get scene bounds after load — it accounts for potree-core's internal coordinate offset (`pcoGeometry.offset`) which is applied to translate the cloud to a local coordinate system.

### CameraAnimator

Uses a quartic ease-out curve (`1 - (1-t)^4`) that matches the feel of the original Potree application. The animation is pure `requestAnimationFrame` with no dependency on the SceneManager's render loop — it drives the camera directly and `OrbitControls.update()` is called inside the animation function to keep the controls in sync.

### MarkerManager

Camera markers use `THREE.Sprite` (camera-facing billboards) rather than `THREE.Mesh` because sprites automatically face the camera without needing to track camera orientation. The `depthTest: false` / `depthWrite: false` material settings ensure markers are always visible through the dense point cloud.

Textures are generated at runtime on `<canvas>` elements rather than loaded from files, eliminating network requests for marker assets.

### MeasurementManager

Measurements are drawn in two phases:
1. **Active phase**: while `activeMeasurement` is set, `rebuildPreview()` is called after each point to draw a semi-transparent preview line from the accumulated points.
2. **Finalized phase**: `finish()` computes the value, builds permanent geometry (spheres at vertices, lines between them, text sprite label), and stores everything in a `Map<id, { data, objects }>` for clean removal later.

All geometry is rendered with `depthTest: false` and elevated `renderOrder` values to ensure measurements always draw on top of the point cloud.

Area calculation uses the 2D shoelace formula on the XY plane. Volume is approximated as bounding box volume — a deliberate simplification suitable for initial estimates.

### ClipManager

Clip boxes are applied to potree-core's material via `mat.setClipBoxes()`. potree-core expects the clip box array in a specific format: each entry needs `{ box, inverse, matrix, position }`. The `inverse` matrix is what the shader uses to transform world-space points into box-local space for the inside/outside test.

`TransformControls` are lazy-initialised (only imported and created when the user first selects a clip box) because they are a moderately heavy module and most sessions never use them.

### ExportManager

The export pipeline temporarily hijacks the renderer — it sets a `WebGLRenderTarget`, renders at the requested scale, reads pixels, then restores the render target to `null`. The viewport is restored before the function returns, so the user sees no visual glitch in practice.

### MinimapRenderer

Uses a *separate* `WebGLRenderer` instance (with `alpha: false` and `antialias: false` for performance) attached to its own `<canvas>` element. This avoids contention with the main renderer's render target state. A `try/catch` around renderer creation handles the browser's WebGL context limit gracefully.

### PresentationManager

Intentionally not part of `ViewerProvider` — it is instantiated by the `ScenesPanel` component with a `sourceKey` derived from the source URL. This keeps persistence scoped per project without requiring global configuration.

---

## 7. Adapter Pattern

### Why it exists

The viewer must load binary point cloud data from three very different environments:
- A browser fetching from an S3 bucket (possibly with auth headers)
- An Electron app reading from the local filesystem (via IPC)
- A Next.js dev server serving from the `public/` folder

Rather than scattering `if (source.type === 'electron')` checks throughout the codebase, all I/O is routed through a `FileSourceAdapter` interface. This produces a single swap point: change the adapter and the rest of the codebase works unchanged.

### The interface

```typescript
interface FileSourceAdapter {
  resolveUrl(relativePath: string): string;
  fetchJson<T>(relativePath: string): Promise<T>;
  fetchBinary(relativePath: string): Promise<ArrayBuffer>;
  fetchWithHeaders?(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  listDirectories?(path: string): Promise<string[]>;
}
```

`fetchWithHeaders` is optional because potree-core's `RequestManager` needs it to attach auth headers to its internal requests. `listDirectories` is optional and only used by multi-project scanning features.

### Adding a new adapter

1. Create a class that implements `FileSourceAdapter`.
2. Add a new variant to the `PointCloudSource` union type in `packages/core/src/types.ts`.
3. Add a `case` in `createAdapter()` in `packages/core/src/data/file-source-adapter.ts`.

No other files need changing.

---

## 8. Viewport.tsx — Central Wiring Component

`Viewport` is the single most important component in the codebase. It is the bridge between the React provider layer and the Three.js manager layer.

### Initialisation sequence (runs once, on mount)

```
useEffect(() => {
  adapter = createAdapter(config.source)
  sm      = new SceneManager({ canvas: containerRef.current, onFpsUpdate: setFps })
  loader  = new PointCloudLoader(sm, adapter)
  measure = new MeasurementManager(sm.scene)
  marker  = new MarkerManager(sm.scene)
  anim    = new CameraAnimator(sm.camera, sm.controls)
  export_ = new ExportManager(sm)
  minimap = new MinimapRenderer(sm)
  clip    = new ClipManager(sm)

  // Wire manager callbacks → provider state setters
  measure.onChange = setMeasurementList
  clip.onChange    = setClipBoxEntries
  clip.onSelectChange = setSelectedClipBoxId

  // Push managers up to ViewerProvider
  setSceneManager(sm); setLoader(loader); ...

  // Register minimap frame callback
  sm.addFrameCallback(() => minimap.update())

  // Start render loop
  sm.start()

  // Load the point cloud
  loader.load("metadata.json", pointBudget).then(...)

  // Cleanup
  return () => { sm.dispose(); measure.dispose(); ... }
}, []) // empty deps — runs once
```

The empty dependency array (`[]`) is intentional and necessary. Re-running this effect would create duplicate Three.js renderers.

### State sync effects (secondary useEffects)

After initialisation, Viewport watches specific provider state changes and syncs them to managers:

- `[cameras, showMarkers]` → `marker.build(cameras, worldBox)` and `marker.setVisible(showMarkers)`
- `[navigationMode]` → `sm.setNavigationMode(navigationMode)`
- `[showMinimap]` → `minimap.attach(minimapContainerRef.current)` (re-attaches after show)

---

## 9. Navigation Modes

All three navigation modes are implemented in `SceneManager.setNavigationMode()` on **one** `OrbitControls` instance (`zoomToCursor=true`, damping, natural rotate). Each mode only changes the mouse-button map and polar limits — see [Navigation Modes](/guide/navigation) for the full mouse tables.

### Orbit (default — CAD turntable)

`maxPolarAngle=π`, `mouseButtons = { LEFT: ROTATE, MIDDLE: DOLLY, RIGHT: PAN }`. Left-drag tumbles around the target, scroll zooms toward the cursor. Full-sphere.

### Free (Blender-ish)

`maxPolarAngle=π`, `mouseButtons = { LEFT: ROTATE, MIDDLE: ROTATE, RIGHT: PAN }`. Rotation on both left and middle drag for quick free-angle inspection.

### Pan (map / top-down)

`maxPolarAngle=π/2.05` (horizon-locked), `mouseButtons = { LEFT: PAN, MIDDLE: DOLLY, RIGHT: ROTATE }`. Left-drag pans like a GIS/mapping tool.

---

## 10. UI Composition

### Default `WorkspaceLayout`

When `<PanoCloudViewer>` is used without a `children` render prop, it renders the built-in `WorkspaceLayout`: a full toolbar at the top, a left tool rail (measure/section), a right collapsible sidebar with tabs, and the 3D viewport in the center. This layout suits professional desktop-style workflows.

### Custom UI via render prop

Pass a `children` function to `<PanoCloudViewer>` to completely replace the default shell. The function receives the viewport element (already wrapped in `Suspense`) and must render it somewhere:

```tsx
<PanoCloudViewer source={source}>
  {(viewport) => (
    <div className="relative w-full h-full">
      {viewport}
      <MyCustomToolbar />
    </div>
  )}
</PanoCloudViewer>
```

All providers (`ViewerProvider`, `DataProvider`, `ThemeProvider`, `LocaleProvider`) are set up by `PanoCloudViewer` regardless of whether a custom `children` function is used. Action hooks and `useViewer()` work inside any component rendered as a descendant.

### Packaged layout components

Two alternative layouts are exported for common patterns:

| Component | Description |
|---|---|
| `<MinimalLayout viewport={vp}>` | Viewport full-screen with a minimal floating toolbar (fit-to-view, nav mode, theme toggle). Good for embed widgets. |
| `<WorkstationLayout viewport={vp}>` | Viewport with a collapsible side-panel housing floating tool palettes (tools, display, view settings, export) and a bottom status bar. |
| `<FloatingPalette>` | Standalone glass-morphism floating panel — compose your own layout from palettes. |
| `<CollapsibleSidebar>` | A side panel that collapses to an icon rail, used inside `WorkstationLayout`. |

Usage with the render prop:

```tsx
import { PanoCloudViewer, MinimalLayout } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer source={source}>
  {(viewport) => <MinimalLayout viewport={viewport} />}
</PanoCloudViewer>
```

### Action hooks

For fully custom UIs, use the action hooks instead of wiring `useViewer()` manually. Each hook encapsulates a logical group of actions and returns stable callbacks:

| Hook | Returns |
|---|---|
| `useNavigationActions()` | `fitToView`, `flyToView(preset)`, `navigationMode`, `setNavigationMode`, `projection`, `setProjection` |
| `useMeasurementActions()` | `startTool(type)`, `cancelTool`, `measurements`, `clearAll`, `remove(id)`, `rename(id, name)`, `exportCSV` |
| `useClipActions()` | `addBox`, `clearAll`, `toggleMode`, `selectBox(id)`, `setTransformMode(mode)`, `boxes`, `clipMode`, `hasClipBox` |
| `useDisplayActions()` | `colorMode`, `setColorMode`, `pointBudget`, `setPointBudget`, `pointSize`, `setPointSize`, `setQualityPreset` |
| `useExportActions()` | `capture(options)`, `download(dataUrl, filename)` |
| `useVisibilityActions()` | `showMarkers`, `toggleMarkers`, `showMinimap`, `toggleMinimap` |
| `useDisplaySettings()` | `settings`, `presets`, `applyPreset(preset)`, `updateSetting(key, value)` |

---

## 11. Color Rendering

### sRGB pipeline

Three.js and WebGL have a color space model where the framebuffer can either store linear or sRGB values. The key setting is `renderer.outputColorSpace`:

- `THREE.SRGBColorSpace`: Three.js applies gamma encoding during framebuffer write. Input should be linear.
- `THREE.LinearSRGBColorSpace`: Three.js writes values as-is. Input is already in the correct space.

### The potree-core gamma bug

potree-core's vertex shaders produce **sRGB-encoded** color output directly. They handle the conversion from stored color data to display-ready sRGB themselves.

Additionally, potree-core's material has two encoding properties:
- `inputColorEncoding`: encoding of the stored point color data (defaults to SRGB=1)
- `outputColorEncoding`: encoding of the shader's output (defaults to LINEAR=0)

When `outputColorEncoding=LINEAR (0)` and `inputColorEncoding=SRGB (1)`, the shader calls `fromLinear(vColor)` which reinterprets the sRGB data as if it were linear and applies a gamma correction — this is backwards, and causes extreme brightness (overexposure) on RGB point clouds.

### The fix

Two settings must be applied together:

**1. Renderer level:**
```typescript
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
```
Tells Three.js not to apply gamma during framebuffer write. The shader output is already sRGB-correct.

**2. Material level** (applied after every `loadPointCloud()` and every `setColorMode()`):
```typescript
pointCloud.material.outputColorEncoding = 1; // ColorEncoding.SRGB
```
Tells potree-core's shader that its output is sRGB, which disables the `fromLinear()` conversion. sRGB data from the attribute buffer passes through to the output as-is.

Both fixes are necessary.

---

## 12. i18n

The i18n system is a simple context-provided dictionary, with no runtime locale detection or message formatting library.

### Architecture

```
ViewerLocale (interface)   ← full type definition in i18n/types.ts
  en (object)              ← i18n/en.ts — English strings
  de (object)              ← i18n/de.ts — German strings

LocaleProvider             ← i18n/locale-context.tsx
  accepts: locale?: ViewerLocale
  provides: ViewerLocale via context

useLocale()                ← hook — returns active ViewerLocale
  usage: const t = useLocale().toolbar
```

Some locale values are functions to support inline interpolation without a full i18n library:
```typescript
statusPts: (millions: number) => string
// en: (n) => `${n.toFixed(1)}M pts`
```

### Adding a new locale

1. Create `packages/viewer/src/i18n/fr.ts` (or your language code).
2. Export a `const fr: ViewerLocale = { ... }` object implementing every key. Use `en.ts` as the template.
3. Pass it to `<PanoCloudViewer locale={fr} />` or to `<LocaleProvider locale={fr}>`.
4. Optionally export it from `index.ts` alongside `en` and `de`.

For partial overrides (e.g. only changing a few strings in English), use `createLocale`:
```typescript
import { en, createLocale } from '@der-ort/pano-cloud-viewer';
const myLocale = createLocale(en, {
  toolbar: { about: 'Info' },
  viewport: { overview: 'Map' },
});
```
`createLocale` deep-merges `DeepPartial<ViewerLocale>` into the base, so all unspecified keys keep their base locale values.

---

## 13. Adding a New Feature — Developer Checklist

Follow these steps to add a new feature (e.g. a new measurement type, a new panel, a new tool):

**If it requires new Three.js scene logic:**
- [ ] Create a new Manager class in `packages/core/src/core/`.
- [ ] Keep it framework-agnostic: no React imports, use callback props for state output.
- [ ] Add `dispose()` method that removes all scene objects and disposes geometry/materials.
- [ ] Instantiate it in `packages/viewer/src/components/viewport.tsx` inside the one-time `useEffect`.
- [ ] Wire its callbacks to provider state setters.
- [ ] If other components need it, add `myManager: MyManager | null` and `setMyManager` to `ViewerProvider`.
- [ ] Export the class from `packages/core/src/index.ts`.

**If it requires new UI state:**
- [ ] Add state variables to `ViewerProvider` and expose them in `ViewerContextValue`.

**If it requires new UI components:**
- [ ] Add `"use client"` directive at the top.
- [ ] Use `useViewer()` to access state and managers.
- [ ] Use Radix UI primitives for interactive elements (buttons, dialogs, sliders).
- [ ] Style with Tailwind CSS classes and `hsl(var(--brand))` color references.
- [ ] Use `useLocale()` for all user-visible strings.
- [ ] Export from `packages/viewer/src/index.ts`.

**If it requires new types:**
- [ ] Add to `packages/core/src/types.ts`.
- [ ] Export from `packages/core/src/index.ts`.

**If it requires a new source adapter capability:**
- [ ] Add the optional method to the `FileSourceAdapter` interface.
- [ ] Implement in `S3SourceAdapter` and `ElectronSourceAdapter`.
- [ ] Keep it optional (`method?:`) so existing adapters without the method don't break.
