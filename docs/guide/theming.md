# Theming

PanoCloudViewer uses CSS custom properties (CSS variables) for all colors, typography, and layout values. This makes it straightforward to match the viewer to any host application's design system.

---

## How themes work

The viewer ships two CSS files:

| File | Contents |
|---|---|
| `@der-ort/pano-cloud-viewer/themes/base.css` | Token definitions only (includes Tailwind directives). Use this as a starting point for a fully custom theme. |
| `@der-ort/pano-cloud-viewer/themes/smart-agile.css` | smart+agile brand theme — imports `base.css` and overrides tokens with the yellow-on-dark palette. |

Import exactly one of these in your application's entry point:

```tsx
// Either the smart+agile preset:
import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';

// Or the base (blank) theme to style from scratch:
import '@der-ort/pano-cloud-viewer/themes/base.css';
```

---

## CSS variable reference

All variables follow the [shadcn/ui](https://ui.shadcn.com/docs/theming) token naming convention. Values are HSL triplets **without parentheses** (e.g. `55 72% 57%`) so that components can compose them with opacity: `hsl(var(--brand) / 0.5)`.

### Color tokens

| Variable | Description | Default light | Default dark |
|---|---|---|---|
| `--background` | Page / viewport background | `0 0% 100%` | `0 0% 5%` |
| `--foreground` | Default text color | `0 0% 9%` | `0 0% 95%` |
| `--card` | Card / panel background | `0 0% 100%` | `0 0% 8%` |
| `--card-foreground` | Text on cards | `0 0% 9%` | `0 0% 95%` |
| `--primary` | Primary interactive elements | `0 0% 9%` | `0 0% 98%` |
| `--primary-foreground` | Text on primary | `0 0% 98%` | `0 0% 9%` |
| `--secondary` | Secondary / ghost buttons | `0 0% 94%` | `0 0% 13%` |
| `--muted` | Muted backgrounds | `0 0% 94%` | `0 0% 13%` |
| `--muted-foreground` | Muted text | `0 0% 45%` | `0 0% 55%` |
| `--accent` | Hover / focus backgrounds | `0 0% 94%` | `0 0% 13%` |
| `--destructive` | Destructive actions (red) | `0 84% 60%` | `0 84% 60%` |
| `--border` | UI borders | `0 0% 89%` | `0 0% 18%` |
| `--input` | Input field borders | `0 0% 89%` | `0 0% 18%` |
| `--ring` | Focus ring | `0 0% 9%` | `0 0% 83%` |
| `--brand` | Accent / highlight color | `220 90% 56%` | `220 90% 56%` |
| `--brand-foreground` | Text on brand color | `0 0% 100%` | `0 0% 100%` |

### Viewer-specific tokens

| Variable | Description |
|---|---|
| `--toolbar-bg` | Toolbar background |
| `--toolbar-border` | Toolbar bottom border |
| `--sidebar-bg` | Sidebar background |
| `--sidebar-width` | Sidebar width (default `280px`) |
| `--statusbar-bg` | Bottom status bar background |
| `--viewport-bg` | 3D viewport background (behind the WebGL canvas) |
| `--pcv-scale` | Chrome scale factor set by the `uiScale` prop (default `1`). Scales UI chrome only — the 3D canvas stays at full resolution. |

> **Readability rule:** any theme or brand preset that overrides `--background` — or the card / toolbar / sidebar / status-bar background tokens (`--card`, `--toolbar-bg`, `--sidebar-bg`, `--statusbar-bg`) — **must also set the matching foreground token** (`--foreground`, `--card-foreground`, `--muted-foreground`) so text contrast is preserved. Changing a surface color without updating its foreground produces low-contrast, unreadable UI. Always change foreground and background together.

### Typography tokens

| Variable | Description |
|---|---|
| `--font-sans` | Body / UI font family |
| `--font-mono` | Monospace font family (labels, coords) |
| `--font-heading` | Heading font (defaults to `--font-sans`) |

### Layout tokens

| Variable | Description |
|---|---|
| `--radius` | Global border radius (default `0.375rem`) |

---

## Dark and light mode

Themes declare a `:root` block for light mode and a `.dark` block for dark mode:

```css
:root {
  --background: 0 0% 100%;   /* light */
  --brand:      220 90% 56%;
}

.dark {
  --background: 0 0% 5%;     /* dark */
  --brand:      55 72% 57%;  /* can differ in dark mode */
}
```

`ThemeProvider` toggles the `dark` class on `document.documentElement` when the theme switches. Pass an initial theme to `<PanoCloudViewer>` or call `setTheme()` from `useTheme()`:

```tsx
<PanoCloudViewer source={source} theme="dark" />
```

---

## Creating a custom theme

### 1. Start from base.css

```css
/* my-theme.css */
@import '@der-ort/pano-cloud-viewer/themes/base.css';

:root {
  --brand:      200 80% 50%;     /* teal accent */
  --background: 0 0% 97%;
  --foreground: 0 0% 8%;
  --radius:     0.5rem;
  --font-sans:  'Inter', ui-sans-serif, system-ui, sans-serif;
}

.dark {
  --brand:      200 70% 60%;
  --background: 220 15% 10%;
  --foreground: 0 0% 93%;
}
```

```tsx
import './my-theme.css'; // instead of smart-agile.css
```

### 2. Override the smart+agile theme partially

Import `smart-agile.css` first, then override specific tokens in your own stylesheet:

```css
/* override.css */
:root {
  --brand: 200 80% 50%;   /* replace yellow with teal */
}
```

```tsx
import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';
import './override.css';
```

If your override changes a **background** token (e.g. `--background`, `--card`, `--toolbar-bg`, `--sidebar-bg`, `--statusbar-bg`), remember the readability rule above: set the matching `--foreground` / `--card-foreground` / `--muted-foreground` in the same block so text stays legible.

---

## Mapping to a host's shadcn tokens

If your application already uses [shadcn/ui](https://ui.shadcn.com), map your existing tokens to PanoCloudViewer's variables:

```css
/* shadcn-bridge.css */
:root {
  /* Map PanoCloudViewer tokens to your app's shadcn vars */
  --brand:      var(--primary);      /* or a specific accent color */
  --background: var(--background);   /* same name — already defined */
  --foreground: var(--foreground);
  --border:     var(--border);
  --card:       var(--card);
  --muted:      var(--muted);
  --radius:     var(--radius);
  --font-sans:  var(--font-sans);
}
```

Import this bridge **after** your shadcn global styles and **instead of** the smart-agile theme.

---

## The smart+agile theme

The bundled `smart-agile.css` theme uses:

- **Dark mode**: yellow-green brand (`#DCD546`, HSL `55 72% 57%`) on near-black (`#0A0A0A`) background, Cabinet Grotesk font.
- **Light mode**: purple accent (`#9B94FF`-ish, HSL `250 100% 61%`) on warm off-white (`#EEF0E4` / `72 19% 92%`) background.

Font files (Cabinet Grotesk, Azeret Mono) are **not bundled** — the theme falls back to system fonts. To enable the custom fonts, place `CabinetGrotesk-Variable.woff2` and `AzeretMono-Variable.woff2` in `packages/viewer/src/assets/fonts/` and uncomment the `@font-face` declarations in `smart-agile.css`.
