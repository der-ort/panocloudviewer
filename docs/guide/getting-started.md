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

---

## Installation

Install the package and its peer dependencies:

```bash
pnpm add @der-ort/pano-cloud-viewer three react react-dom
```

```bash
npm install @der-ort/pano-cloud-viewer three react react-dom
```

```bash
yarn add @der-ort/pano-cloud-viewer three react react-dom
```

---

## Quick Start

### 1. Import a theme

The viewer requires a CSS theme to render correctly. Import the included `smart-agile` theme, or [create your own](/theming).

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

The viewer expects a **Potree 2.0** formatted folder. See [Data Format](/guide/data-format) for the full spec, and [Point Cloud Preparation](/guide/point-cloud-preparation) to convert raw scanner files.

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

See [Integrations](/integrations/react) for framework-specific setup.

---

## Next Steps

- [Data Format](/guide/data-format) — expected folder structure and `cameras.json` schema
- [Point Cloud Preparation](/guide/point-cloud-preparation) — convert E57 files with PanoCloudConverter
- [Theming](/theming) — customize colors, fonts, and radius with CSS variables
- [Composable API](/composable-api) — build a fully custom layout with hooks and providers
- [API Reference](/api/components) — complete component and hook documentation
