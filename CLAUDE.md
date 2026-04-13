# PanoCloudViewer

Embeddable React component library for viewing Potree 2.0 point clouds and 360° panoramic images. Published as `@der-ort/pano-cloud-viewer`.

## Monorepo structure

```
packages/viewer/   → Main library (React + Three.js + Potree)
apps/web/          → Next.js demo app
apps/electron/     → Electron desktop wrapper
docs/              → Documentation (Markdown)
```

## Commands

```sh
pnpm install                            # Install all dependencies
pnpm build                              # Build everything
pnpm dev                                # Run Next.js dev server
pnpm --filter @der-ort/pano-cloud-viewer build  # Build viewer library only
pnpm build:web                          # Build Next.js app (static export → apps/web/out/)
pnpm lint                               # TypeScript check
```

## Architecture

- **Provider pattern**: `ViewerProvider` (core state + managers), `DataProvider` (cameras/metadata), `ThemeProvider` (dark/light)
- **Manager classes**: `SceneManager`, `PointCloudLoader`, `MeasurementManager`, `MarkerManager`, `ExportManager`, `CameraAnimator`, `MinimapRenderer` — encapsulate Three.js logic
- **Adapter pattern**: `FileSourceAdapter` interface with `S3SourceAdapter` and `ElectronSourceAdapter` implementations
- **Lazy loading**: Viewport and potree-core are lazy-imported to avoid SSR issues

## Conventions

- TypeScript strict mode throughout
- UI primitives: Radix UI (accessible, unstyled)
- Styling: Tailwind CSS + CSS custom properties (`hsl(var(--brand))`, etc.)
- Icons: lucide-react
- Theming: CSS custom properties defined in `packages/viewer/src/themes/` — `smart-agile.css` is the default brand theme (yellow/purple on dark)
- All components use `"use client"` directive for Next.js compatibility
- potree-core must be lazy-imported (heavy, client-only)

## Data format

Potree 2.0 octree structure:
```
project/
├── metadata.json    # Octree structure, bounds, point attributes
├── hierarchy.bin    # Octree hierarchy
├── octree.bin       # Point data
└── cameras.json     # [optional] Panorama camera positions
```
