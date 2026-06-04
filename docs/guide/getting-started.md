# Getting Started

## What is PanoCloudViewer?

`@der-ort/pano-cloud-viewer` is a modular, embeddable React component for viewing **Potree 2.0 point clouds** and **360° panoramic images**. Drop it into any React app — or compose it piece by piece with the built-in hooks and providers.

**Key capabilities:**
- Full 3D point cloud rendering (potree-core + Three.js)
- 360° panorama viewer (Pannellum) with camera markers
- Measurement tools — point, distance, height, area, volume, angle, profile
- Clipping / cross-sections — box and plane
- Orthographic image export (top, front, side, back)
- 2D minimap overlay
- Dark/light theming via CSS custom properties
- Custom UI via render prop and action hooks

---

## Packages

The library is split into two packages:

| Package | Contents |
|---|---|
| `@der-ort/pano-cloud-viewer` | React UI: components, providers, hooks, layouts, themes, i18n |
| `@der-ort/pano-cloud-viewer-core` | Headless engine: Three.js managers, data adapters, types, format helpers (no React) |

**You only need to install `@der-ort/pano-cloud-viewer`.** It bundles the core package into its `dist` at build time, so the core is self-contained — no extra install step.

---

## Installation

### Via git dependency (recommended)

The package is distributed as a git dependency pointing directly at the monorepo. Add it to your `package.json`:

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

### Via npm (if published)

```bash
pnpm add @der-ort/pano-cloud-viewer three react react-dom
```

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
    <div style={{ width: '100vw', height: '100vh' }}>
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

The viewer fills its container — give it an explicit width and height.

### 3. Provide your data

The viewer expects a **Potree 2.0** formatted folder. See [Data Format](/guide/data-format) for the full spec.

---

## Component Props

```typescript
interface PanoCloudViewerProps {
  /** Data source — S3, Electron, or local */
  source: PointCloudSource;

  /** Color theme. Default: 'dark' */
  theme?: 'light' | 'dark';

  /** Extra CSS class applied to the root element */
  className?: string;

  /** UI language override. Default: English */
  locale?: ViewerLocale;

  /**
   * Custom UI render prop. When provided, replaces the default WorkspaceLayout.
   * Receives the viewport element — it must be rendered in the returned JSX.
   */
  children?: (viewport: React.ReactNode) => React.ReactNode;
}
```

---

## Source Types

The `source` prop accepts one of three adapters:

| Type | Use case |
|---|---|
| `s3` | Remote data served over HTTP/S3 |
| `electron` | Local files in an Electron desktop app |
| `local` | Dev server or Next.js `public/` folder |

```tsx
// S3 — browser & Electron
source={{ type: 's3', baseUrl: 'https://bucket.s3.amazonaws.com/project/' }}

// Electron — local file system
source={{ type: 'electron', basePath: '/absolute/path/to/project/' }}

// Local — relative to dev server root
source={{ type: 'local', basePath: '/sample/' }}
```

---

## Next.js Setup

All viewer components include `"use client"` directives. Load the main component dynamically to prevent SSR errors:

```tsx
import dynamic from 'next/dynamic';

const PanoCloudViewer = dynamic(
  () => import('@der-ort/pano-cloud-viewer').then(m => m.PanoCloudViewer),
  { ssr: false }
);
```

Add to `next.config.ts`:

```ts
const nextConfig = {
  transpilePackages: ['@der-ort/pano-cloud-viewer'],
};
```

---

## Electron Setup

1. Build the Next.js app statically: `pnpm build` in `apps/web`
2. The Electron main process loads `apps/web/out/index.html`
3. The preload script exposes `window.electronFS` — the viewer auto-detects this for `electron` source type
4. Pass `source={{ type: 'electron', basePath: folderPath }}` — use the IPC `dialog:openFolder` handler to let users pick a folder

---

## Custom UI

Swap out the default toolbar and sidebar with your own UI using the `children` render prop and action hooks:

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

See [Custom UI](/guide/custom-ui) for a full walkthrough.

---

## Next Steps

- [Data Format](/guide/data-format) — expected folder structure and `cameras.json` schema
- [Navigation](/guide/navigation) — orbit, fly, and earth modes explained
- [Custom UI](/guide/custom-ui) — render prop, action hooks, packaged layout components
- [Theming](/guide/theming) — CSS variables, dark/light mode, shadcn integration
- [API Reference](/api) — complete component and hook documentation
- [Architecture](/architecture) — deep dive into the three-layer model and package split
