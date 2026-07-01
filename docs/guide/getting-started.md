# Getting Started

## What is PanoCloudViewer?

`@der-ort/pano-cloud-viewer` is a modular, embeddable React component for viewing **Potree 2.0 point clouds** and **360° panoramic images**. Drop it into any React app — or compose it piece by piece with the built-in hooks and providers.

![PanoCloudViewer default professional workspace: top toolbar, left tool rail, right Layers sidebar, bottom-right minimap, bottom-left axis widget, and yellow panorama pins over a point cloud](/screenshots/workspace-dark.png)

*The default `WorkspaceLayout` — top toolbar, left tool rail, right sidebar, bottom-right minimap, bottom-left axis widget, and panorama pins.*

**Key capabilities:**
- Full 3D point cloud streaming (potree-core + Three.js)
- 360° panorama viewer — **Photo Sphere Viewer** by default, **Pannellum** as an optional fallback
- Measurement tools — point, distance, height, area, angle, volume (metric, meters with two decimals)
- Clipping / cross-sections — multiple named section boxes with move / scale / rotate handles
- Saved scenes, a keyframe camera tour, and 1080p MP4 recording
- View export — save the current view, or render orthographic top / front / side / back to PNG / JPEG
- 2D minimap overlay and always-on world-axis widget
- Navigation modes (orbit / free / pan) plus a perspective / orthographic projection axis
- Dark / light / system theming, English + German locales, mobile-responsive layout
- Custom UI via render prop and action hooks

---

## Packages

The library is split into two packages:

| Package | Contents |
|---|---|
| `@der-ort/pano-cloud-viewer` | React UI: components, providers, hooks, layouts, themes, i18n |
| `@der-ort/pano-cloud-viewer-core` | Headless engine: Three.js managers, data adapters, types, format helpers (no React) |

**You only need to install `@der-ort/pano-cloud-viewer`.** It bundles the core package into its `dist` at build time, so the core is self-contained — no extra install step, and consumers never resolve core separately.

---

## Installation

The package is distributed as a **git dependency** pointing directly at the monorepo's `packages/viewer` folder. Add it to your `package.json`:

```json
{
  "dependencies": {
    "@der-ort/pano-cloud-viewer": "github:der-ort/panocloudviewer&path:packages/viewer",
    "react": ">=18",
    "react-dom": ">=18",
    "three": ">=0.160.0"
  }
}
```

Then install:

```bash
pnpm install
# or
npm install
# or
yarn
```

The committed `dist/` in the package is self-contained (core bundled in), so **no build step is needed** after install.

---

## Quick Start

### 1. Import a theme

The viewer requires a CSS theme. Import the included `smart-agile` theme, or [create your own](/guide/theming).

```tsx
import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';
```

### 2. Render the component

```tsx
import { PanoCloudViewer } from '@der-ort/pano-cloud-viewer';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100dvh' }}>
      <PanoCloudViewer
        source={{
          type: 's3',
          baseUrl: 'https://your-bucket.s3.amazonaws.com/project/',
        }}
        theme="dark"
      />
    </div>
  );
}
```

The viewer fills its container — give it an explicit width and height. Use `100dvh`
rather than `100vh` so bottom-edge UI stays clear of mobile browser chrome (see
[Integration](/integration) for the mobile requirements).

### 3. Provide your data

The viewer expects a **Potree 2.0** folder — the output of PanoCloudConverter:

```
project/
├── metadata.json    # Octree metadata, bounds, point attributes (RGB is auto-detected)
├── hierarchy.bin    # Octree node hierarchy
├── octree.bin       # Binary point data
└── cameras.json     # [optional] Panorama camera positions and image URLs
```

`cameras.json` is optional — omit it for a plain point cloud with no panorama pins. See [Data Format](/guide/data-format) for the full `cameras.json` schema.

---

## Component Props

```typescript
interface PanoCloudViewerProps {
  /** Data source — S3 / local, or Electron */
  source: PointCloudSource;

  /** Initial theme. Default: 'dark' */
  theme?: 'light' | 'dark';

  /** Extra CSS class applied to the root element */
  className?: string;

  /** UI language override (import `en` or `de`, or supply your own). Default: English */
  locale?: ViewerLocale;

  /** UI complexity: 'professional' (default, full toolset) or 'lite' */
  uiMode?: 'professional' | 'lite';

  /** 360° panorama engine. Default: 'photo-sphere-viewer' */
  panoEngine?: 'photo-sphere-viewer' | 'pannellum';

  /** Scale factor for the UI chrome only (not the canvas). Default: 1 */
  uiScale?: number;

  /**
   * Custom UI render prop. When provided, replaces the default WorkspaceLayout.
   * Receives the viewport element — it must be rendered in the returned JSX.
   */
  children?: (viewport: React.ReactNode) => React.ReactNode;

  /** Override any of the built-in shadcn-style UI primitives (shallow-merged) */
  components?: Partial<ViewerComponents>;
}
```

---

## Source Types

The `source` prop accepts one of three adapters:

| Type | Use case | Field |
|---|---|---|
| `s3` | Remote data served over HTTP / S3 | `baseUrl` (ends with `/`) |
| `local` | Dev server or Next.js `public/` folder | `basePath` |
| `electron` | Local files in an Electron desktop app | `basePath` |

```tsx
// S3 — browser & Electron (optional auth headers)
source={{ type: 's3', baseUrl: 'https://bucket.s3.amazonaws.com/project/' }}

// Local — served by your dev server
source={{ type: 'local', basePath: '/sample/' }}

// Electron — local file system via the window.electronFS bridge
source={{ type: 'electron', basePath: '/absolute/path/to/project/' }}
```

`local` is served exactly like `s3` (over HTTP by the dev server); `electron` uses the `window.electronFS` IPC bridge.

---

## Display & Rendering Settings

A single **Settings panel** (top-left, draggable — open it from the toolbar's sliders button) holds all display and rendering controls: color mode, point size, point budget, quality preset, per-channel RGB / Intensity / Elevation / Opacity adjustments, and the theme switch.

![The unified Settings panel showing color mode, point size, point budget, RGB / Intensity / Elevation / Opacity sliders, and a theme selector](/screenshots/settings-panel.png)

*The unified Settings panel — display, rendering, and theme controls in one place.*

---

## Custom UI

Swap out the default toolbar and sidebar with your own UI using the `children` render prop and the action hooks:

```tsx
import {
  PanoCloudViewer,
  useNavigationActions,
  useMeasurementActions,
} from '@der-ort/pano-cloud-viewer';

function MyToolbar() {
  const { fitToView } = useNavigationActions();
  const { startTool } = useMeasurementActions();

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
      <button onClick={fitToView}>Fit to view</button>
      <button onClick={() => startTool('distance')}>Measure distance</button>
    </div>
  );
}

<PanoCloudViewer source={source}>
  {(viewport) => (
    <div className="relative w-full h-full">
      {viewport}
      <MyToolbar />
    </div>
  )}
</PanoCloudViewer>
```

Prefer a ready-made alternative shell? `MinimalLayout` and `WorkstationLayout` are exported and can be dropped into the render prop. See [Custom UI](/guide/custom-ui) for a full walkthrough.

---

## Next Steps

- [Integration](/integration) — Next.js / Electron setup, theming, mobile, programmatic API
- [Data Format](/guide/data-format) — expected folder structure and `cameras.json` schema
- [Navigation](/guide/navigation) — orbit, free, and pan modes plus projection
- [Custom UI](/guide/custom-ui) — render prop, action hooks, packaged layout components
- [Theming](/guide/theming) — CSS variables, dark / light mode, shadcn integration
- [API Reference](/api) — complete component and hook documentation
- [Architecture](/architecture) — the three-layer model and package split
