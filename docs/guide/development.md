# Development Guide

Everything you need to set up the monorepo locally and start contributing to `@der-ort/pano-cloud-viewer`.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18 or later |
| pnpm | 9 or later (`npm install -g pnpm`) |
| Git | any recent version |

---

## 1. Clone and install

```sh
git clone https://github.com/der-ort/pano-cloud-viewer.git
cd pano-cloud-viewer

pnpm install          # installs all workspace packages at once
```

pnpm automatically links `packages/viewer` into the apps so you can work on the library and see changes live.

---

## 2. Start the Next.js demo app

```sh
pnpm dev              # → http://localhost:3000
```

This runs the `apps/web` Next.js app. The viewer library (`packages/viewer`) is loaded directly from source — no build step needed for the dev loop.

To use the standalone example app instead:

```sh
pnpm dev:example      # builds viewer first, then starts apps/example
```

---

## 3. Build

```sh
pnpm build            # build everything (core → viewer → apps), in dependency order
pnpm build:viewer     # build viewer library only → packages/viewer/dist/
pnpm build:web        # build Next.js static export → apps/web/out/
```

`pnpm build` runs `pnpm -r build`, which respects workspace dependencies: **`packages/core` builds first, then `packages/viewer`** (which imports it). Building the viewer alone (`build:viewer`) also builds core first if it's stale.

**Self-contained dist:** the viewer's tsup config bundles `core` into `packages/viewer/dist` (`noExternal` + `dts.resolve`), so the published artifact resolves core internally — consumers of the git dependency never install `@der-ort/pano-cloud-viewer-core` separately.

---

## 4. TypeScript check

```sh
pnpm lint             # tsc --noEmit across all packages
```

There are no unit tests yet — TypeScript strict mode and the running demo serve as the primary verification.

---

## 5. Docs

The docs site lives in `docs/` and uses [VitePress](https://vitepress.dev/). It is **not** a pnpm workspace package, so it must be run from inside the folder:

```sh
cd docs
pnpm install          # once
pnpm dev              # → http://localhost:5173
pnpm build            # static output → docs/.vitepress/dist/
pnpm preview          # preview the build → http://localhost:4173
```

---

## Monorepo structure

The library is split into **two packages**:

```
packages/core/          → Headless engine — no React, no UI
  src/
    core/               → Manager classes (SceneManager, PointCloudLoader, …)
    data/               → FileSourceAdapter and implementations
    format.ts           → Format helpers (lengths, areas, volumes)
    types.ts            → All exported TypeScript types
    index.ts            → Core public exports

packages/viewer/        → React UI library (depends on core)
  src/
    components/         → React UI (toolbar, sidebar, overlays, viewport)
    hooks/              → Action hooks (useNavigationActions, …)
    layouts/            → MinimalLayout, WorkstationLayout, palettes
    providers/          → React context providers
    i18n/               → ViewerLocale interface, en/de locales
    themes/             → CSS custom property themes
    index.ts            → Public exports (re-exports core + viewer UI)

apps/web/               → Next.js demo / documentation app
apps/example/           → Standalone example app (consumes the built viewer)
apps/electron/          → Electron desktop wrapper
docs/                   → VitePress documentation site
```

- **`@der-ort/pano-cloud-viewer-core`** — the headless engine: Three.js manager classes, data adapters, shared types, format helpers. Zero React / UI dependencies.
- **`@der-ort/pano-cloud-viewer`** — the React UI: providers, hooks, components, layouts, themes, i18n. Re-exports everything from core, so consumers import only this package.

---

## Architecture overview

The library uses a **three-layer model**:

1. **React / Provider layer** — `ViewerProvider`, `DataProvider`, `ThemeProvider`, `LocaleProvider` hold all UI state. Manager instances are stored in React state so toolbar and sidebar components re-render when they become available.

2. **Manager layer** — Plain TypeScript classes (`SceneManager`, `PointCloudLoader`, `CameraAnimator`, etc.) own all Three.js objects and implement the 3D logic. They know nothing about React; they call back into state via `onChange` / `onFpsUpdate` callbacks injected at construction time.

3. **Renderer layer** — `THREE.WebGLRenderer`, `potree-core` octree streaming, and the Three.js controls.

The `Viewport` component is the wiring point: it creates all managers in a one-time `useEffect`, registers callbacks, and passes the instances up to `ViewerProvider`. Everything else in the UI reads from context.

See [`/architecture`](/architecture) for the full deep-dive.

---

## Key conventions

- **TypeScript strict mode** — no `any` except where potree-core's untyped API forces it (always marked with `// eslint-disable`).
- **All components carry `"use client"`** — Three.js is browser-only; no SSR.
- **potree-core must always be lazy-imported** inside `async` functions:
  ```ts
  const { Potree, PointColorType } = await import("potree-core");
  ```
  Never import it at the top level — it will break Next.js SSR.
- **Colors via CSS custom properties** — `hsl(var(--brand))`, never hardcoded hex in JSX.
- **UI primitives**: Radix UI (accessible, unstyled) + Tailwind CSS.
- **Icons**: `lucide-react`.

---

## Adding a feature — checklist

1. **Three.js logic** → add a method to the relevant manager class in `packages/core/src/core/`, or create a new manager (export it from `packages/core/src/index.ts`).
2. **Types** → add / export any new public types from `packages/core/src/types.ts`; they re-export through the viewer package automatically.
3. **UI state** → if the feature needs React state, add it to `ViewerProvider` (state + setter) and its context interface.
4. **Wiring** → sync provider state to the manager in `Viewport` via a `useEffect`.
5. **UI components** → add toolbar buttons, sidebar panels, or overlays in `packages/viewer/src/components/`.
6. **Action hook** → for custom-UI consumers, expose the feature through a hook in `packages/viewer/src/hooks/`.
7. **i18n** → add all UI strings to `ViewerLocale` in `i18n/types.ts`, then to `i18n/en.ts` and `i18n/de.ts`.
8. **Type-check** → run `pnpm lint` and fix all errors before committing.

---

## Common pitfalls

- **Never import potree-core at the top level** — always `await import("potree-core")` inside async functions.
- **After any `setColorMode()` call**, re-apply `mat.outputColorEncoding = 1` or RGB clouds show incorrect brightness. See [architecture docs](/architecture#color-rendering) for the full explanation.
- **`renderer.outputColorSpace` must stay `THREE.LinearSRGBColorSpace`**. Changing to `SRGBColorSpace` whitewashes the point cloud.
- **`SceneManager.flySpeed`** is a legacy field kept for API compatibility — it no longer drives navigation (orbit/free/pan all run on a single `OrbitControls`). Don't rely on it.
- **Navigation uses one `OrbitControls`** — don't add a second controller per mode. `controls.target` is shared by clipping, the minimap, `CameraAnimator.flyTo`, and the ortho-camera sync, so a separate target would desync them.
- **Marker sprites** use `sizeAttenuation:false` (constant on-screen pin size) and `depthTest=false` (always render on top). Don't re-enable `sizeAttenuation` (pins would scale with zoom) or remove `depthTest=false` (pins would hide behind the cloud).
- **`TransformControls` (three r170)** is not an `Object3D` — add its gizmo with `scene.add(tc.getHelper())`, never `scene.add(tc)`.
