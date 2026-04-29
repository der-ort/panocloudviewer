# PanoCloudViewer — Architecture Guide

A deep dive into the design decisions, rendering pipeline, and extension points for new developers.

---

## 1. Overview

`@der-ort/pano-cloud-viewer` is a React component library that embeds a full-featured 3D point cloud viewer into any web or Electron application. Its core responsibilities are:

1. **Stream and render Potree 2.0 octree point clouds** over HTTP/S3 or the local file system, using `potree-core` for octree management and `three` for WebGL rendering.
2. **Overlay interactive tools** — measurements, clip boxes, panorama camera markers — on top of the 3D scene.
3. **Expose a composable React API** so consumers can either use the drop-in `<PanoCloudViewer>` component or assemble a custom layout from individual pieces.

The library targets developers who embed it into larger React/Next.js applications and architects who want to extend its capabilities.

---

## 2. System Diagram

```
┌───────────────────────────────────────────────────────────────┐
│  React component tree (runs in browser)                       │
│                                                               │
│  <PanoCloudViewer>                                            │
│    <LocaleProvider>  ← i18n strings                          │
│    <ThemeProvider>   ← dark/light CSS class on <html>         │
│    <DataProvider>    ← cameras.json + metadata.json           │
│    <ViewerProvider>  ← all viewer state + manager refs        │
│      <WorkspaceLayout>                                        │
│        <MainToolbar>  <ToolRail>  <Sidebar>                   │
│        <Viewport [lazy]>  ← THREE.js init lives here          │
│          <MinimapOverlay>  <ToolHintBar>                      │
└───────────────────────────────────────────────────────────────┘
                │  creates & stores refs to
                ▼
┌───────────────────────────────────────────────────────────────┐
│  Manager layer (plain TypeScript classes)                     │
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
└───────────────────────────────────────────────────────────────┘
                │  drives
                ▼
┌───────────────────────────────────────────────────────────────┐
│  Three.js / WebGL                                             │
│                                                               │
│  THREE.WebGLRenderer  THREE.Scene  THREE.PerspectiveCamera    │
│  OrbitControls  FlyControls  TransformControls                │
│  potree-core: Potree.updatePointClouds() (octree LOD)         │
└───────────────────────────────────────────────────────────────┘
```

Data flows up through callbacks: managers call `onChange` / `onFpsUpdate` / `onPointsUpdate` functions that were injected at construction time. These functions are the state setters from `ViewerProvider`. This keeps managers fully decoupled from React.

---

## 3. The Render Pipeline

The render loop lives entirely in `SceneManager.start()`. Each animation frame proceeds in this order:

```
requestAnimationFrame(loop)
  │
  ├─ 1. Controls update
  │      if fly mode:  flyControls.update(min(delta/1000, 0.1))
  │      else:         orbitControls.update()
  │
  ├─ 2. potree-core LOD update
  │      potree.updatePointClouds(pointClouds, camera, renderer)
  │      → determines which octree nodes to load/unload
  │      → issues background fetch requests via RequestManager
  │
  ├─ 3. Frame callbacks
  │      forEach(frameCallbacks, cb => cb())
  │      → MinimapRenderer.update() is registered here
  │         → every 6th frame: render scene top-down to minimap GL canvas
  │         → every 2nd frame: draw camera frustum overlay on 2D canvas
  │
  ├─ 4. Main render
  │      renderer.render(scene, camera)
  │
  └─ 5. FPS counter
         if elapsed >= 1000ms: onFpsUpdate(frameCount)
```

`potree.updatePointClouds()` is called *before* the main render so that any geometry updates made by potree-core (adding/removing node meshes from the scene) take effect in the same frame they are requested.

The minimap runs in the same frame callback system, throttled to avoid burning GPU budget on the secondary renderer.

---

## 4. Provider Layer

### Why managers are stored in React state

A natural first instinct is to store manager instances in a module-level singleton or a `useRef`. The problem: toolbar and sidebar components need to *react* to managers becoming available. When `Viewport` finishes initialising and calls `setSceneManager(sm)`, every component consuming `useViewer()` needs to re-render so they can display real data.

`useRef` does not trigger re-renders. `useState` does. So all eight manager refs are stored with `useState` in `ViewerProvider`, even though their values are mutable objects. The state holds a *reference* to the manager instance — React only re-renders when the reference itself changes (i.e. when a manager is first set or replaced), not when the manager's internal state mutates.

### `ViewerProvider`

Owns two categories of state:

**Manager refs** (all `null` until Viewport initialises):
`sceneManager`, `loader`, `measurementManager`, `markerManager`, `cameraAnimator`, `exporter`, `minimap`, `clipManager`

**UI state** (immediately available):
`activeTool`, `pointBudget`, `pointSize`, `fps`, `pointCount`, `measurementList`, `showMarkers`, `showMinimap`, `selectedCamera`, `clipBoxEntries`, `selectedClipBoxId`, `colorMode`, `navigationMode`, `config`

### `DataProvider`

Fetches project metadata from the adapter using `Promise.allSettled` — if `cameras.json` is absent (it is optional) the provider still succeeds and sets `cameras` to `[]`. Image URLs in `CameraData` are resolved to absolute URLs at fetch time via `adapter.resolveUrl()`, so downstream consumers never see relative paths.

### `ThemeProvider`

Applies the resolved theme as a class on `document.documentElement` (`dark` or `light`) and as `data-theme` attribute. CSS variables in the themes are scoped to `:root` with overrides in `.dark {}`. The `system` theme value reads `window.matchMedia("(prefers-color-scheme: dark)")` at render time; it does not subscribe to changes (add a `matchMedia` listener if live system theme switching is needed).

### `LocaleProvider`

Provides the active `ViewerLocale` object via context. If no `locale` prop is passed to `<PanoCloudViewer>`, the English locale (`en`) is used by default (set in `LocaleProvider`'s implementation). Components destructure specific sections: `const t = useLocale().toolbar` to avoid re-rendering when unrelated sections change.

---

## 5. Manager Layer

### SceneManager

The foundation everything else builds on. Owns the Three.js scene graph, camera, renderer, and both control systems. The `OrbitControls` instance is always created and kept alive even in fly mode — it is simply `enabled = false` while fly mode is active. This avoids teardown/recreation cost on mode switches.

The ResizeObserver on the canvas container handles responsive resizing automatically — there is no need for external resize event listeners.

### PointCloudLoader

The only class that touches `potree-core`. It builds a `requestManager` object that proxies fetch calls through the active `FileSourceAdapter`, giving potree-core the ability to send requests with custom headers (e.g. S3 auth tokens) or use Electron's IPC bridge.

Metadata inspection for RGB detection reads `metadata.json` a second time via `adapter.fetchJson()` — this is acceptable because the browser caches the response from the initial load.

The `worldBox` property is the reliable way to get scene bounds after load — it accounts for potree-core's internal coordinate offset (`pcoGeometry.offset`) which is applied to translate the cloud to a local coordinate system.

### CameraAnimator

Uses a quartic ease-out curve (`1 - (1-t)^4`) that matches the feel of the original Potree application. The animation is pure `requestAnimationFrame` with no dependency on the SceneManager's render loop — it drives the camera directly and `OrbitControls.update()` is called inside the animation function to keep the controls in sync.

### MarkerManager

Camera markers use `THREE.Sprite` (camera-facing billboards) rather than `THREE.Mesh` because sprites automatically face the camera without needing to track camera orientation. The `depthTest: false` / `depthWrite: false` material settings ensure markers are always visible through the dense point cloud, following the same approach as the original Potree viewer.

Textures are generated at runtime on `<canvas>` elements rather than loaded from files, eliminating network requests for marker assets.

### MeasurementManager

Measurements are drawn in two phases:
1. **Active phase**: while `activeMeasurement` is set, `rebuildPreview()` is called after each point to draw a semi-transparent preview line from the accumulated points.
2. **Finalized phase**: `finish()` computes the value, builds permanent geometry (spheres at vertices, lines between them, text sprite label), and stores everything in a `Map<id, { data, objects }>` for clean removal later.

All geometry is rendered with `depthTest: false` and elevated `renderOrder` values (1, 2, 3) to ensure measurements always draw on top of the point cloud regardless of depth.

Area calculation uses the 2D shoelace formula on XY plane. Volume is approximated as bounding box volume — a deliberate simplification suitable for initial estimates.

### ClipManager

Clip boxes are applied to potree-core's material via `mat.setClipBoxes()`. potree-core expects the clip box array in a specific format: each entry needs `{ box, inverse, matrix, position }`. The `inverse` matrix is what the shader uses to transform world-space points into box-local space for the inside/outside test.

`TransformControls` are lazy-initialised (only imported and created when the user first selects a clip box) because they are a moderately heavy module and most sessions never use them.

### ExportManager

The export pipeline temporarily hijacks the renderer — it sets a `WebGLRenderTarget`, renders at the requested scale, reads pixels, then restores the render target to `null`. This means the main viewport briefly renders off-screen during capture. The viewport is restored before the function returns, so the user sees no visual glitch in practice.

### MinimapRenderer

Uses a *separate* `WebGLRenderer` instance (with `alpha: false` and `antialias: false` for performance) attached to its own `<canvas>` element. This avoids contention with the main renderer's render target state. A `try/catch` around renderer creation handles the browser's WebGL context limit gracefully — if context creation fails, the minimap falls back to the 2D overlay-only mode.

### PresentationManager

Intentionally not part of `ViewerProvider` — it is instantiated by the `ScenesPanel` component with a `sourceKey` derived from the source URL. This keeps persistence scoped per project without requiring global configuration.

---

## 6. Adapter Pattern

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
2. Add a new variant to the `PointCloudSource` union type in `types.ts`.
3. Add a `case` in `createAdapter()` in `data/file-source-adapter.ts`.

No other files need changing.

---

## 7. Viewport.tsx — Central Wiring Component

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

  // Store local refs (for event handlers, which can't read state)
  smRef.current = sm; loaderRef.current = loader; ...

  // Push managers up to ViewerProvider
  setSceneManager(sm); setLoader(loader); ...

  // Register minimap frame callback
  sm.addFrameCallback(() => minimap.update())

  // Start render loop
  sm.start()

  // Load the point cloud
  loader.load("metadata.json", pointBudget).then(() => {
    sm.flySpeed = cloudSize / 20
    minimap.setBounds(worldBox)
  })

  // Cleanup
  return () => { sm.dispose(); measure.dispose(); ... }
}, []) // empty deps — runs once
```

The empty dependency array (`[]`) is intentional and necessary. Re-running this effect would create duplicate Three.js renderers. The eslint disable comment acknowledges this.

### State sync effects (secondary useEffects)

After initialisation, Viewport watches specific provider state changes and syncs them to managers:

- `[cameras, showMarkers]` → `marker.build(cameras, worldBox)` and `marker.setVisible(showMarkers)`
- `[showMarkers]` → `marker.setVisible(showMarkers)` (visibility-only sync)
- `[navigationMode]` → `sm.setNavigationMode(navigationMode)`
- `[showMinimap]` → `minimap.attach(minimapContainerRef.current)` (re-attaches after show)

### Event handling

Mouse events on the main canvas are handled by Viewport:

- **`onClick`**: If `activeTool === "none"`, raycasts against marker sprites and fires `onCameraSelect`. If `activeTool.startsWith("measure-")`, projects the click onto a horizontal plane at the camera target Z and adds a measurement point.
- **`onMouseDown/Move/Up`**: When `activeTool === "section-box"`, these implement a drag-to-draw clip box. The drag projects start and end points onto the horizontal plane and calls `clipManager.setDraft()` during drag, then `clipManager.addBox()` on release.
- **`onContextMenu`**: Right-click finalizes an in-progress measurement (`measure.finish()`) or clears all clip boxes.

---

## 8. Navigation Modes

Three navigation modes are implemented in `SceneManager.setNavigationMode()`:

### Orbit (`OrbitControls`)
Default mode. Left-drag tumbles around the target point, right-drag pans, scroll zooms. `maxPolarAngle=π` allows the camera to go fully inverted (look up from below the scene). `screenSpacePanning=false` means right-drag pans in the orbit plane, not screen space.

### Fly (`FlyControls`)
Free-flight mode. OrbitControls is disabled (`enabled = false`) and a lazily-created `FlyControls` instance takes over. The key binding is standard: W/S forward/back, A/D strafe, hold mouse button and drag to look. `dragToLook=true` means mouse movement only looks when a button is held (rather than always tracking mouse position).

`movementSpeed` is set to `SceneManager.flySpeed`, which Viewport scales to the bounding box after load: `flySpeed = maxDim / 20`. This makes movement feel natural regardless of cloud scale.

Delta time is capped at 100ms to prevent the "first-frame jump" — see design decisions in CLAUDE.md.

### Earth (`OrbitControls` configured differently)
Configured OrbitControls to behave like a map viewer. `screenSpacePanning=true` makes left-drag pan in screen space rather than orbit. `maxPolarAngle=π/2.05` (just above 90°) prevents the camera from going below the horizontal plane. The result is Google Maps-style navigation: drag to pan, scroll to zoom, right-drag to tilt slightly.

---

## 9. Color Rendering

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

Both fixes are necessary. The renderer setting ensures the WebGL framebuffer is not double-encoded. The material setting ensures the shader does not internally gamma-compress values that are already sRGB.

---

## 10. i18n

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

## 11. Adding a New Feature — Developer Checklist

Follow these steps to add a new feature (e.g. a new measurement type, a new panel, a new tool):

**If it requires new Three.js scene logic:**
- [ ] Create a new Manager class in `packages/viewer/src/core/`.
- [ ] Keep it framework-agnostic: no React imports, use callback props for state output.
- [ ] Add `dispose()` method that removes all scene objects and disposes geometry/materials.
- [ ] Instantiate it in `Viewport.tsx` inside the one-time `useEffect`.
- [ ] Add a ref to hold the instance in Viewport (`const myMgrRef = useRef<MyManager | null>(null)`).
- [ ] Wire its callbacks to provider state setters.
- [ ] If other components need it, add `myManager: MyManager | null` and `setMyManager` to `ViewerProvider`.
- [ ] Call `setMyManager(mgr)` in Viewport after construction.
- [ ] Export the class from `index.ts`.

**If it requires new UI state:**
- [ ] Add state variables to `ViewerProvider` and expose them in `ViewerContextValue`.
- [ ] Add to the `value` object in `ViewerProvider`.

**If it requires new UI components:**
- [ ] Add `"use client"` directive at the top.
- [ ] Use `useViewer()` to access state and managers.
- [ ] Use Radix UI primitives for interactive elements (buttons, dialogs, sliders).
- [ ] Style with Tailwind CSS classes and `hsl(var(--brand))` color references.
- [ ] Use `useLocale()` for all user-visible strings — add keys to `ViewerLocale` in `i18n/types.ts` and both `en.ts` and `de.ts`.
- [ ] Export from `index.ts`.

**If it requires new types:**
- [ ] Add to `packages/viewer/src/types.ts`.
- [ ] Export from `index.ts` under the types section.

**If it requires a new source adapter capability:**
- [ ] Add the optional method to the `FileSourceAdapter` interface.
- [ ] Implement in `S3SourceAdapter` and `ElectronSourceAdapter`.
- [ ] Keep it optional (`method?:`) so existing adapters without the method don't break.
