# PanoCloud Viewer — Integration Guide

## Overview

`@der-ort/pano-cloud-viewer` is a modular, embeddable React component for viewing Potree 2.0 point clouds and 360° panoramic images. It ships with:

- Full 3D point cloud streaming (potree-core + Three.js)
- 360° panorama viewer — **Photo Sphere Viewer** by default, **Pannellum** as an optional fallback
- Measurement tools — point, distance, height, area, angle, volume (metric, meters with two decimals)
- Clipping / cross-sections — multiple named section boxes with move / scale / rotate handles
- Saved scenes, a keyframe camera tour, and 1080p MP4 recording
- View export — save the current view, or render orthographic top / front / side / back to PNG / JPEG
- Navigation modes (orbit / free / pan) plus a perspective / orthographic projection axis
- 2D minimap overlay and always-on world-axis widget
- smart+agile brand theme (easily overridable via CSS variables), dark / light / system modes
- Mobile-responsive layout with safe-area support, chrome-only `uiScale`, and English + German locales

---

## Quick Start

### 1. Install

The package is distributed as a **git dependency** pointing at the monorepo's `packages/viewer` folder:

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

The committed `dist/` bundles the headless core, so no build step is needed after install.

### 2. Import theme + component

```tsx
// Import the smart+agile theme (or your own — see Theming below)
import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';

import { PanoCloudViewer } from '@der-ort/pano-cloud-viewer';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100dvh' }}>
      <PanoCloudViewer
        source={{ type: 's3', baseUrl: 'https://your-bucket.s3.amazonaws.com/project/' }}
        theme="dark"
      />
    </div>
  );
}
```

### 3. Data format

The viewer expects the following folder structure (output of PanoCloudConverter):

```
project/
├── metadata.json         # Potree 2.0 octree metadata, bounds, point attributes
├── hierarchy.bin
├── octree.bin
└── cameras.json          # [optional] Panorama camera positions
```

**cameras.json schema:**

```json
[
  {
    "name": "IMG_0001",
    "index": 0,
    "image": "https://your-cdn.com/panoramas/IMG_0001.jpg",
    "position": { "x": 14.03, "y": -5.85, "z": 528.18 },
    "yaw_deg": 45.0
  }
]
```

---

## Source Adapters

### S3 / HTTP (browser + Electron)

```tsx
source={{
  type: 's3',
  baseUrl: 'https://bucket.s3.eu-central-1.amazonaws.com/project/',
  // Optional: custom auth headers
  headers: { Authorization: 'Bearer token' },
}}
```

**Required S3 CORS configuration:**

```json
[{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["Content-Range", "Accept-Ranges"],
  "MaxAgeSeconds": 3600
}]
```

### Local (dev server / `public/`)

```tsx
source={{ type: 'local', basePath: '/sample/' }}
```

`local` is served over HTTP exactly like `s3` — point `basePath` at a folder your dev server (or Next.js `public/`) exposes.

### Electron (local files)

```tsx
source={{
  type: 'electron',
  basePath: '/home/user/projects/my-scan/',
}}
```

Requires the Electron preload bridge (`window.electronFS`) — see `apps/electron/src/preload.ts`.

---

## Panorama Engine

The 360° overlay is engine-pluggable via the `panoEngine` prop:

```tsx
<PanoCloudViewer source={source} panoEngine="photo-sphere-viewer" /> {/* default */}
<PanoCloudViewer source={source} panoEngine="pannellum" />          {/* fallback */}
```

- **Photo Sphere Viewer** (default) — feature-rich, with on-screen zoom / move / fullscreen controls. Loaded from CDN with its own isolated Three.js instance, so it never clashes with the viewer's pinned Three.js version.
- **Pannellum** — lightweight, mature; loaded from CDN. Optional fallback.

Both engines load lazily from a CDN, so nothing ships in the initial bundle. The engine can also be switched at runtime through `useViewer().setPanoEngine` (the overlay header has an A/B toggle).

---

## Theming

The viewer uses CSS custom properties. Override any variable to rebrand:

```css
/* your-theme.css */
@import '@der-ort/pano-cloud-viewer/themes/base.css';

:root {
  --brand: 250 100% 61%;           /* accent color in HSL (no parens) */
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
  --font-sans: 'Your Font', sans-serif;
  --font-mono: 'Your Mono', monospace;
}

.dark {
  --brand: 55 72% 57%;
  --background: 0 0% 4%;
  --foreground: 0 0% 98%;
}
```

Then import your theme instead:

```tsx
import './your-theme.css';
```

### Available CSS variables

| Variable | Description | Default (dark) |
|---|---|---|
| `--brand` | Accent / brand color | `55 72% 57%` (#DCD546) |
| `--background` | Page background | `0 0% 4%` |
| `--foreground` | Text color | `0 0% 98%` |
| `--border` | UI borders | `0 0% 14.9%` |
| `--muted` | Muted backgrounds | `0 0% 14.9%` |
| `--card` | Card / panel backgrounds | `0 0% 7%` |
| `--font-sans` | Body font family | Cabinet Grotesk |
| `--font-mono` | Mono font family | Azeret Mono |
| `--radius` | Border radius | `0.375rem` |

> **Readability rule:** whenever you override a background token (`--background`, `--card`, or the viewer-specific `--toolbar-bg` / `--sidebar-bg` / `--statusbar-bg`), also set the matching foreground token (`--foreground`, `--card-foreground`, `--muted-foreground`) so text contrast is preserved.

Users also switch dark / light / system at runtime; the choice persists to `localStorage`.

---

## UI Scale

`uiScale` (default `1`) scales the UI **chrome only** — toolbars, tool rail, sidebar, floating palettes, dialogs — via a `--pcv-scale` CSS custom property. The 3D viewport / canvas stays at native resolution so the point cloud remains crisp.

```tsx
// Enlarge all controls by 25% for touch / high-DPI displays
<PanoCloudViewer source={source} uiScale={1.25} />
```

---

## Internationalisation

Pass a built-in locale (`en` or `de`), or supply your own `ViewerLocale`:

```tsx
import { PanoCloudViewer } from '@der-ort/pano-cloud-viewer';
import { de } from '@der-ort/pano-cloud-viewer';

<PanoCloudViewer source={source} locale={de} />
```

Use `createLocale(base, overrides)` to deep-merge a partial override onto a base locale rather than translating the whole dictionary.

---

## Next.js Setup (App Router)

The viewer uses Three.js, which is browser-only. In Next.js:

1. All viewer components already carry `"use client"` directives.
2. Load the main component dynamically with SSR disabled:

```tsx
'use client';
import dynamic from 'next/dynamic';

const PanoCloudViewer = dynamic(
  () => import('@der-ort/pano-cloud-viewer').then(m => m.PanoCloudViewer),
  { ssr: false }
);

export default function ViewerPage() {
  return (
    <div style={{ width: '100vw', height: '100dvh' }}>
      <PanoCloudViewer
        source={{ type: 's3', baseUrl: 'https://bucket.s3.amazonaws.com/project/' }}
      />
    </div>
  );
}
```

3. Transpile the package in `next.config.ts`:

```ts
const nextConfig = {
  transpilePackages: ['@der-ort/pano-cloud-viewer'],
};
export default nextConfig;
```

---

## Mobile / Responsive

The default `WorkspaceLayout` is responsive at the 768px (`md`) breakpoint: on phones the sidebar becomes a full-bleed overlay that starts closed, and floating chrome respects safe-area insets so it never hides behind the notch, OS status bar, home indicator, or browser address bar.

For the safe-area handling to take effect on mobile, **the host must opt in**:

1. Enable `viewport-fit=cover`. In the Next.js App Router:

```ts
// app/layout.tsx
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};
```

2. Size the viewer's container with **`100dvh`, not `100vh`** — `100vh` is the *tallest* mobile viewport, so bottom UI slides under the address bar:

```tsx
<div style={{ width: '100vw', height: '100dvh' }}>
  <PanoCloudViewer source={source} />
</div>
```

Both `env()` insets and `100dvh` are no-ops on desktop, so these are safe to apply everywhere.

---

## Electron Setup

1. Build the Next.js app statically: `pnpm build` in `apps/web`
2. The Electron main process loads `apps/web/out/index.html`
3. The preload script exposes `window.electronFS` — the viewer auto-detects this for the `electron` source type
4. Pass a `source` of `{ type: 'electron', basePath: folderPath }` — use the IPC `dialog:openFolder` handler to let users pick a folder

---

## Custom UI (Composable API)

Build a completely custom layout using the render prop, hooks, and individual components. The cleanest path is the `children` render prop on `PanoCloudViewer` — it sets up every provider (theme, data, viewer, locale) for you:

```tsx
import {
  PanoCloudViewer,
  MeasureTools,
  SectionTools,
  ExportTools,
  Sidebar,
  useViewer,
} from '@der-ort/pano-cloud-viewer';
import '@der-ort/pano-cloud-viewer/themes/base.css';

function StatusBar() {
  const { fps, pointBudget } = useViewer();
  return <div>FPS: {fps} | Budget: {(pointBudget / 1e6).toFixed(1)}M</div>;
}

export default function App() {
  return (
    <PanoCloudViewer source={{ type: 's3', baseUrl: 'https://...' }}>
      {(viewport) => (
        <div className="flex h-screen">
          <div className="toolbar">
            <MeasureTools />
            <SectionTools />
            <ExportTools />
          </div>
          <div className="flex-1 relative">{viewport}</div>
          <div className="w-64"><Sidebar /></div>
          <StatusBar />
        </div>
      )}
    </PanoCloudViewer>
  );
}
```

Prefer a ready-made alternative shell? `MinimalLayout` and `WorkstationLayout` are exported and can be returned directly from the render prop.

> **Provider note:** if you wire the providers yourself instead of using `PanoCloudViewer`, remember the real prop names — `DataProvider` takes an `adapter` (build one with `createAdapter(source)`), and `ThemeProvider` takes `defaultTheme`. `ViewerProvider` takes `config`.

---

## Programmatic API

Manager instances are available from `useViewer()` once the viewport has initialised (they are `null` until then).

### Camera animation

```tsx
import * as THREE from 'three';
import { useViewer } from '@der-ort/pano-cloud-viewer';

function FlyButton() {
  const { cameraAnimator } = useViewer();
  const flyTo = () => {
    cameraAnimator?.flyTo({
      position: new THREE.Vector3(10, 20, 5),
      target:   new THREE.Vector3(0, 0, 0),
      duration: 1500,
    });
  };
  return <button onClick={flyTo}>Fly to origin</button>;
}
```

### Measurements

```tsx
const { measurementManager, measurementList } = useViewer();

// Start a measurement programmatically
measurementManager?.start('distance');   // 'point' | 'distance' | 'height' | 'area' | 'angle' | 'volume'

// List all measurements (metric — meters, m², m³)
console.log(measurementList);

// Clear all
measurementManager?.clearAll();
```

### Export

```tsx
import { ExportManager, useViewer } from '@der-ort/pano-cloud-viewer';

const { exporter } = useViewer();

// view: 'current' snapshots the live camera; 'top' | 'front' | 'side' | 'back' render orthographic shots
const url = await exporter?.capture({
  view: 'top',
  scale: 2,
  background: 'white',
  showScaleBar: false,
  format: 'png',        // 'png' | 'jpeg'
});
if (url) ExportManager.download(url, 'plan_view.png');
```

### Version / build identity

```tsx
import { PCV_VERSION, PCV_BUILD, PCV_VERSION_STRING } from '@der-ort/pano-cloud-viewer';
// PCV_BUILD = "<short-git-sha> · <UTC build time>" — the real "did the update ship?" signal.
```

---

## Point Cloud Preparation

Use **PanoCloudConverter** to convert E57 scanner files into the Potree 2.0 format accepted by this viewer:

```bash
cd PanoCloudConverter
python convert.py my-scan.e57 --output ./output/
```

The output folder structure matches the expected viewer format exactly.
