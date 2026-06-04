# PanoCloud Viewer — Integration Guide

## Overview

`@der-ort/pano-cloud-viewer` is a modular, embeddable React component for viewing Potree 2.0 point clouds and 360° panoramic images. It ships with:

- Full 3D point cloud rendering (potree-core + Three.js)
- Panorama viewer (Pannellum)
- Measurement tools (point, distance, height, area, volume, angle)
- Clipping / cross-sections (box + plane)
- Orthographic image export (top, front, side, back)
- 2D minimap overlay
- smart+agile brand theme (easily overridable via CSS variables)

---

## Quick Start

### 1. Install

```bash
pnpm add @der-ort/pano-cloud-viewer three react react-dom
```

### 2. Import theme + component

```tsx
// Import the smart+agile theme (or your own — see Theming below)
import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';

import { PanoCloudViewer } from '@der-ort/pano-cloud-viewer';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
├── metadata.json         # Potree 2.0 octree metadata
├── hierarchy.bin
├── octree.bin
└── cameras.json          # Panorama camera positions
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

### S3 (browser + Electron)

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

### Electron (local files)

```tsx
source={{
  type: 'electron',
  basePath: '/home/user/projects/my-scan/',
}}
```

Requires the Electron preload bridge — see `apps/electron/src/preload.ts`.

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

---

## Custom UI (Composable API)

Build a completely custom layout using hooks and individual components:

```tsx
import {
  ViewerProvider,
  DataProvider,
  ThemeProvider,
  Viewport,
  MainToolbar,
  MeasureTools,
  SectionTools,
  ExportTools,
  Sidebar,
  useViewer,
  useMeasurements,
} from '@der-ort/pano-cloud-viewer';
import '@der-ort/pano-cloud-viewer/themes/base.css';

const source = { type: 's3', baseUrl: 'https://...' };

function MyCustomViewer() {
  const { fps, pointBudget } = useViewer();

  return (
    <div className="flex h-screen">
      {/* Custom toolbar */}
      <div className="toolbar">
        <MeasureTools />
        <SectionTools />
        <ExportTools />
      </div>

      <div className="flex-1 relative">
        <Viewport />
      </div>

      {/* Custom sidebar */}
      <div className="w-64">
        <Sidebar />
      </div>

      <div className="statusbar">
        FPS: {fps} | Budget: {(pointBudget / 1e6).toFixed(1)}M
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider initialTheme="dark">
      <DataProvider source={source}>
        <ViewerProvider config={{ source }}>
          <MyCustomViewer />
        </ViewerProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
```

---

## Programmatic API

### Camera animation

```tsx
import { useViewer } from '@der-ort/pano-cloud-viewer';

function MyControl() {
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
measurementManager?.start('distance');

// List all measurements
console.log(measurementList);

// Clear all
measurementManager?.clearAll();
```

### Export

```tsx
const { exporter } = useViewer();

const url = await exporter?.capture({
  view: 'top',
  scale: 2,
  background: 'white',
  showScaleBar: false,
  format: 'png',
});
ExportManager.download(url, 'plan_view.png');
```

---

## Next.js Setup

The viewer components use Three.js which requires the browser environment. In Next.js:

1. All viewer components already include `"use client"` directives.
2. Load the main component dynamically:

```tsx
const PanoCloudViewer = dynamic(
  () => import('@der-ort/pano-cloud-viewer').then(m => m.PanoCloudViewer),
  { ssr: false }
);
```

3. Add to `next.config.ts`:

```ts
transpilePackages: ['@der-ort/pano-cloud-viewer'],
```

---

## Electron Setup

1. Build the Next.js app statically: `pnpm build` in `apps/web`
2. The Electron main process loads `apps/web/out/index.html`
3. The preload script exposes `window.electronFS` — the viewer auto-detects this for `electron` source type
4. Pass `source={{ type: 'electron', basePath: folderPath }}` — use the IPC `dialog:openFolder` handler to let users pick a folder

---

## Point Cloud Preparation

Use **PanoCloudConverter** to convert E57 scanner files into the Potree 2.0 format accepted by this viewer:

```bash
cd PanoCloudConverter
python convert.py my-scan.e57 --output ./output/
```

Output folder structure matches the expected viewer format exactly.
