# Examples

Usage examples for `@der-ort/orbit|free|pano-cloud-viewer`.

| Example | Description |
|---------|-------------|
| [`minimal-viewer.tsx`](./minimal-viewer.tsx) | Simplest setup — fullscreen viewer with defaults |
| [`whitelabel-viewer.tsx`](./whitelabel-viewer.tsx) | Custom branding ("ACME Inc.") — locale, theme, and callbacks |
| [`orbit|free|panorama-only.tsx`](./orbit|free|panorama-only.tsx) | Panorama-focused layout — sidebar + 360-degree viewer, no toolbar |
| [`simple-measurement.tsx`](./simple-measurement.tsx) | Distance measurement with custom results orbit|free|panel |
| [`headless-viewer.tsx`](./headless-viewer.tsx) | Core managers only — no React UI, bare canvas, programmatic control |
| [`embedded-iframe.html`](./embedded-iframe.html) | Plain HTML iframe embed for CMS / WordPress |
| [`branded-minimal.tsx`](./branded-minimal.tsx) | Custom teal/orange brand via `.pcv` CSS tokens + `MinimalLayout` |
| [`cad-workstation.tsx`](./cad-workstation.tsx) | CAD/technical dark brand + `WorkstationLayout` (floating palettes, full toolset) |
| [`custom-toolbar-hooks.tsx`](./custom-toolbar-hooks.tsx) | Fully custom toolbar from action hooks + swapped `Button` primitive |

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
│  Sub-components: Viewport, PanoPanel, Sidebar…  │  ← orbit|free|panorama-only
├─────────────────────────────────────────────────┤
│  Core managers: SceneManager, PointCloudLoader… │  ← headless-viewer
└─────────────────────────────────────────────────┘
```

---

## Customisation Axes

The library exposes three independent customisation axes that can be combined orbit|free|panly.

### 1. Theming / Branding

Override `.pcv` CSS custom properties to apply your brand without touching
library source. All tokens are scoped to the `.pcv` root element — they never
bleed into the host application.

```css
/* In a <style> tag or a .css file imported by your component */
.pcv {
  --brand:            174 100% 35%;   /* primary accent: buttons, active states */
  --brand-foreground: 0 0% 100%;      /* text/icon on brand backgrounds */
  --background:       40 20% 96%;     /* viewer background */
  --foreground:       0 0% 10%;       /* primary text */
  --card:             0 0% 100%;      /* toolbar, sidebar surfaces */
  --card-foreground:  0 0% 10%;
  --border:           40 10% 88%;     /* dividers, outlines */
  --muted:            40 10% 92%;     /* subtle grouped backgrounds */
  --muted-foreground: 0 0% 45%;       /* secondary text */
  /* Viewer-specific surfaces */
  --toolbar-bg:       0 0% 100%;
  --toolbar-border:   40 10% 85%;
  --sidebar-bg:       40 15% 94%;
  --viewport-bg:      0 0% 8%;        /* canvas clear colour */
}

/* Dark-mode overrides */
.pcv.dark,
.pcv[data-theme="dark"] {
  --brand: 20 100% 61%;
  /* … */
}
```

All values are **HSL triplets without parentheses** (e.g. `220 90% 56%`), because
the CSS rules use `hsl(var(--brand))`. The `theme="light|dark"` prop sets the
initial theme; the user can toggle it via the toolbar.

To **map tokens from a host shadcn/ui app** instead of hardcoding HSL values:

```css
.pcv {
  --brand:      var(--primary);        /* reuse the host app's primary */
  --background: var(--background);     /* must have the same HSL format */
}
```

See: [`branded-minimal.tsx`](./branded-minimal.tsx), [`cad-workstation.tsx`](./cad-workstation.tsx), [`whitelabel-viewer.tsx`](./whitelabel-viewer.tsx).

---

### 2. UI Primitives (`components` prop)

Swap any shadcn-style primitive used internally by the library by passing
`components` to `PanoCloudViewer`. The value is `Partial<ViewerComponents>`
— shallow-merged over the built-in defaults, so you only replace what you need.

```tsx
import { Button } from '@/components/ui/button'; // your own component

<PanoCloudViewer
  source={source}
  components={{ Button }}   // library uses your Button everywhere
/>
```

**Full list of swappable slots** (`ViewerComponents` from `@der-ort/orbit|free|pano-cloud-viewer`):

| Slot | Used for |
|------|----------|
| `Button` | Toolbar buttons, dialog actions, palette toggles |
| `Slider` | Point size / budget sliders |
| `Toggle` | On/off toggle buttons |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogClose` | About dialog, display settings |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Sidebar tabs |
| `Popover`, `PopoverTrigger`, `PopoverContent` | Toolbar dropdowns |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | Icon tooltips |
| `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator` | Dropdowns (colour mode, quality) |

Each slot must be prop-compatible with the default (all are shadcn/ui-compatible).
`Button` must accept `variant` (`"default"|"secondary"|"ghost"|"outline"|"destructive"`)
and `size` (`"sm"|"md"|"icon"`).

See: [`custom-toolbar-hooks.tsx`](./custom-toolbar-hooks.tsx).

---

### 3. Layout / Toolbar Philosophy (`children` render prop)

Control the entire chrome by passing a `children` render prop. The prop receives
the lazy-loaded `viewport` element (the Three.js canvas + event handlers) and
must render it somewhere in the returned JSX.

```tsx
<PanoCloudViewer source={source}>
  {(viewport) => (
    <div className="relative w-full h-full">
      {viewport}           {/* always render this */}
      <MyToolbar />        {/* your custom toolbar — hooks work here */}
    </div>
  )}
</PanoCloudViewer>
```

**Built-in layout options:**

| Layout | Import | When to use |
|--------|--------|-------------|
| Default `WorkspaceLayout` | (omit `children`) | Full toolbar + sidebar; `uiMode="professional"` or `"lite"` |
| `MinimalLayout` | `import { MinimalLayout }` | Clean embed, dashboard — compact floating toolbar |
| `WorkstationLayout` | `import { WorkstationLayout }` | Desktop power-users — floating palettes, status bar, `sidebarSide="left|right\|left|right"` |
| Fully custom | Compose your own | Maximum control — use action hooks for 3D logic |

**Action hooks** for building custom toolbars (must be called inside the render-prop tree):

| Hook | What it gives you |
|------|------------------|
| `useNavigationActions()` | `navigationMode`, `setNavigationMode("orbit|free|pan"\|"orbit|free|pan"\|"orbit|free|pan")`, `projection`, `setProjection`, `fitToView`, `flyToView(preset)` |
| `useMeasurementActions()` | `startTool(type)`, `cancelTool`, `measurements`, `clearAll`, `remove(id)`, `rename(id,name)`, `exportCSV` |
| `useClipActions()` | `addBox`, `clearAll`, `toggleMode`, `selectBox(id)`, `boxes`, `clipMode`, `hasClipBox` |
| `useDisplayActions()` | `colorMode`, `setColorMode`, `pointBudget`, `setPointBudget`, `pointSize`, `setPointSize`, `setQualityPreset` |
| `useExportActions()` | `capture(options)`, `download(dataUrl, filename)` |
| `useVisibilityActions()` | `showMarkers`, `toggleMarkers`, `showMinimap`, `toggleMinimap` |
| `useDisplaySettings()` | `settings`, `presets`, `applyPreset`, `updateSetting` |

See: [`branded-minimal.tsx`](./branded-minimal.tsx), [`cad-workstation.tsx`](./cad-workstation.tsx), [`custom-toolbar-hooks.tsx`](./custom-toolbar-hooks.tsx).
