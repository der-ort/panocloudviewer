# Custom UI

PanoCloudViewer gives you full control over the UI. You can replace the default shell entirely, use packaged alternative layouts, or compose your own from action hooks and individual components.

![Demo gallery showing the Professional, Minimal, and Workstation layout options](/screenshots/gallery.png)

*The demo gallery lets you switch between the three packaged layouts — Professional (`WorkspaceLayout`), Minimal, and Workstation.*

---

## How it works

`<PanoCloudViewer>` sets up all providers internally (`LocaleProvider`, `ThemeProvider`, `DataProvider`, `ViewerProvider`) regardless of whether you use the default or a custom UI. The `children` render prop lets you replace the default `WorkspaceLayout` with anything you want.

The render prop receives the `<Viewport>` element (already wrapped in `Suspense`) and **must render it** somewhere in the tree:

```tsx
import { PanoCloudViewer } from '@der-ort/pano-cloud-viewer';
import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';

<PanoCloudViewer source={source}>
  {(viewport) => (
    <div className="relative w-full h-full">
      {viewport}
      <MyToolbar />
    </div>
  )}
</PanoCloudViewer>
```

---

## Packaged layout components

Three ready-made layouts ship with the library. Use them as starting points or as-is.

### `<MinimalLayout>`

Full-screen viewport with a small floating toolbar: fit-to-view, navigation mode selector, and theme toggle. Good for embed widgets or read-only kiosks.

```tsx
import { PanoCloudViewer, MinimalLayout } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer source={source}>
  {(viewport) => <MinimalLayout viewport={viewport} />}
</PanoCloudViewer>
```

### `<WorkstationLayout>`

Full-screen viewport with a collapsible side-panel and a bottom status bar. The panel holds floating palettes for tools, display settings, view settings, and export.

```tsx
import { PanoCloudViewer, WorkstationLayout } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer source={source}>
  {(viewport) => (
    <WorkstationLayout
      viewport={viewport}
      sidebarSide="left"   // or "right"
    />
  )}
</PanoCloudViewer>
```

### `<WorkspaceLayout>` (default, professional)

The default full-feature layout, rendered automatically when no `children` prop is passed. It composes a top toolbar, a left tool rail (measure / section tools), the viewport, and a right collapsible sidebar. It is fully responsive — on phones the sidebar becomes a tap-to-close overlay. You can also render it explicitly inside the render prop if you only want to wrap it with extra elements:

```tsx
import { PanoCloudViewer, WorkspaceLayout } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer source={source}>
  {(_viewport) => <WorkspaceLayout />}
</PanoCloudViewer>
```

`WorkspaceLayout` takes no `viewport` prop — unlike the other two layouts, it renders its own `<Viewport>` internally.

---

## Built-in panels

The default layout's sidebar and toolbar are assembled from three panels you can also reuse in a custom UI:

- **Settings panel** (`RenderingSettings`, top-left, draggable) — the single unified settings surface: color mode, point size, point budget, quality preset, RGB / intensity / elevation / opacity sliders, and theme. Opened by the toolbar's gear/sliders button.
- **Layers panel** (`LayersPanel`, first sidebar tab) — toggles overlay visibility: panoramas, measurements, minimap, and a collapsible classification section.
- **Scenes panel** (`ScenesPanel`) — saves named viewer scenes (camera + clip boxes + display settings), plays a keyframe fly-through of them, and exports one pass to a **1080p MP4** (rendered frame-by-frame via `ExportManager.recordAnimation`; requires WebCodecs — Chrome/Edge).

---

## Action hooks

Action hooks are the primary API for custom UIs. They encapsulate groups of related actions and return stable callbacks that work inside any component descended from `<ViewerProvider>`.

Import them from `@der-ort/pano-cloud-viewer`:

```tsx
import {
  useNavigationActions,
  useMeasurementActions,
  useClipActions,
  useDisplayActions,
  useExportActions,
  useVisibilityActions,
  useDisplaySettings,
} from '@der-ort/pano-cloud-viewer';
```

### Quick reference

| Hook | Key returns |
|---|---|
| `useNavigationActions()` | `fitToView`, `flyToView(preset)`, `navigationMode`, `setNavigationMode`, `projection`, `setProjection` |
| `useMeasurementActions()` | `startTool(type)`, `cancelTool`, `measurements`, `clearAll`, `remove(id)`, `rename(id, name)`, `exportCSV` |
| `useClipActions()` | `addBox`, `clearAll`, `toggleMode`, `setModeAll(mode)`, `selectBox(id)`, `setTransformMode(mode)`, `resetRotation(id?)`, `removeBox(id)`, `setBoxVisible(id, v)`, `setEnabled(v)`, `setOutlinesVisible(v)`, `boxes`, `selectedBoxId`, `clipMode`, `hasClipBox`, `isEnabled`, `outlinesVisible` |
| `useDisplayActions()` | `colorMode`, `setColorMode`, `pointBudget`, `setPointBudget`, `pointSize`, `setPointSize`, `setQualityPreset` |
| `useExportActions()` | `capture(options)`, `download(dataUrl, filename)` |
| `useVisibilityActions()` | `showMarkers`, `toggleMarkers`, `showMinimap`, `toggleMinimap` |
| `useDisplaySettings()` | `settings`, `presets`, `applyPreset(preset)`, `updateSetting(key, value)` |

See the [API Reference](/api#12-action-hooks) for full return type details.

---

## Example: minimal custom toolbar

```tsx
"use client";

import {
  PanoCloudViewer,
  useNavigationActions,
  useMeasurementActions,
  useVisibilityActions,
} from '@der-ort/pano-cloud-viewer';
import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';

const source = { type: 's3' as const, baseUrl: 'https://my-bucket.s3.amazonaws.com/scan/' };

// This component lives inside the ViewerProvider, so hooks work here.
function MyToolbar() {
  const { fitToView, setNavigationMode, navigationMode } = useNavigationActions();
  const { startTool } = useMeasurementActions();
  const { toggleMinimap, showMinimap } = useVisibilityActions();

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2 p-2 rounded-lg bg-black/60 backdrop-blur">
      <button onClick={fitToView}>Fit</button>
      <button
        onClick={() => setNavigationMode(navigationMode === 'orbit' ? 'pan' : 'orbit')}
      >
        {navigationMode === 'orbit' ? 'Pan' : 'Orbit'}
      </button>
      <button onClick={() => startTool('distance')}>Measure</button>
      <button onClick={toggleMinimap}>{showMinimap ? 'Hide map' : 'Show map'}</button>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PanoCloudViewer source={source}>
        {(viewport) => (
          <div className="relative w-full h-full">
            {viewport}
            <MyToolbar />
          </div>
        )}
      </PanoCloudViewer>
    </div>
  );
}
```

---

## Example: camera fly-to from a list

```tsx
"use client";

import { useViewer, useData } from '@der-ort/pano-cloud-viewer';

function CameraList() {
  const { cameraAnimator } = useViewer();
  const { cameras } = useData();

  const flyTo = (cam: typeof cameras[0]) => {
    if (!cam.position || !cameraAnimator) return;
    cameraAnimator.flyTo({
      position: { x: cam.position.x, y: cam.position.y - 5, z: cam.position.z + 2 } as any,
      target: { x: cam.position.x, y: cam.position.y, z: cam.position.z } as any,
      duration: 1200,
    });
  };

  return (
    <ul>
      {cameras.map((cam) => (
        <li key={cam.index}>
          <button onClick={() => flyTo(cam)}>{cam.name}</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## Example: programmatic export

```tsx
"use client";

import { useExportActions } from '@der-ort/pano-cloud-viewer';

function ExportButton() {
  const { capture, download } = useExportActions();

  const handleExport = async () => {
    const url = await capture({
      view: 'top',
      scale: 2,
      background: 'white',
      showScaleBar: false,
      format: 'png',
    });
    if (url) download(url, 'plan_view.png');
  };

  return <button onClick={handleExport}>Export top view</button>;
}
```

---

## Using individual toolbar and sidebar components

All default UI components are also exported and can be dropped into a custom layout:

```tsx
import {
  MeasureTools,
  SectionTools,
  ExportTools,
  DisplayControls,
  Sidebar,
  PanoPanel,
  MeasurementsPanel,
} from '@der-ort/pano-cloud-viewer';

function MyLayout({ viewport }: { viewport: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <div className="w-12 flex flex-col gap-1 p-1">
        <MeasureTools />
        <SectionTools />
      </div>
      <div className="flex-1 relative">{viewport}</div>
      <div className="w-64">
        <Sidebar />
      </div>
    </div>
  );
}
```

---

## Low-level: `useViewer()` for direct manager access

For scenarios not covered by action hooks, access manager instances directly via `useViewer()`:

```tsx
import { useViewer } from '@der-ort/pano-cloud-viewer';

function AdvancedControl() {
  const { sceneManager, loader, clipManager } = useViewer();

  const addClipBox = () => {
    if (!clipManager || !loader) return;
    // addDefaultBox sizes the section to the current viewport (centered on the
    // orbit target, clamped to the cloud) so it is always fully visible and easy
    // to grab. Prefer this over addBox(worldBox.clone()), which spans the whole cloud.
    const entry = clipManager.addDefaultBox(loader.worldBox, 'My section');
    clipManager.selectBox(entry.id);
  };

  return <button onClick={addClipBox}>Add clip box</button>;
}
```

Manager instances are `null` until `<Viewport>` has initialised (the first few renders after mount). Guard with `if (!manager) return`.
