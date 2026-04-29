# Examples

Usage examples for `@der-ort/pano-cloud-viewer`.

| Example | Description |
|---------|-------------|
| [`minimal-viewer.tsx`](./minimal-viewer.tsx) | Simplest setup — fullscreen viewer with defaults |
| [`whitelabel-viewer.tsx`](./whitelabel-viewer.tsx) | Custom branding ("ACME Inc.") — locale, theme, and callbacks |
| [`panorama-only.tsx`](./panorama-only.tsx) | Panorama-focused layout — sidebar + 360-degree viewer, no toolbar |
| [`simple-measurement.tsx`](./simple-measurement.tsx) | Distance measurement with custom results panel |
| [`headless-viewer.tsx`](./headless-viewer.tsx) | Core managers only — no React UI, bare canvas, programmatic control |
| [`embedded-iframe.html`](./embedded-iframe.html) | Plain HTML iframe embed for CMS / WordPress |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Build the viewer library
pnpm build:viewer

# 3. Copy any example into apps/web/src/app/page.tsx and run
pnpm dev
```

## Customisation Layers

```
┌─────────────────────────────────────────────────┐
│  PanoCloudViewer  (all-in-one, zero config)     │  ← minimal-viewer
├─────────────────────────────────────────────────┤
│  Props: source, theme, locale, className        │  ← whitelabel-viewer
├─────────────────────────────────────────────────┤
│  Sub-components: Viewport, PanoPanel, Sidebar…  │  ← panorama-only
├─────────────────────────────────────────────────┤
│  Core managers: SceneManager, PointCloudLoader… │  ← headless-viewer
└─────────────────────────────────────────────────┘
```
