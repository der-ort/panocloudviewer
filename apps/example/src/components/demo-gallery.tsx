"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import "@der-ort/pano-cloud-viewer/themes/smart-agile.css";

// ── Dynamic imports (SSR-safe) ─────────────────────────────────────────────

const PanoCloudViewer = dynamic(
  () =>
    import("@der-ort/pano-cloud-viewer").then((m) => m.PanoCloudViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-sm text-gray-400 font-mono">Loading viewer…</p>
      </div>
    ),
  }
);

const MinimalLayout = dynamic(
  () =>
    import("@der-ort/pano-cloud-viewer").then((m) => m.MinimalLayout),
  { ssr: false }
);

const WorkstationLayout = dynamic(
  () =>
    import("@der-ort/pano-cloud-viewer").then((m) => m.WorkstationLayout),
  { ssr: false }
);

// ── Source ─────────────────────────────────────────────────────────────────

const SOURCE = {
  type: "s3" as const,
  baseUrl: process.env.NEXT_PUBLIC_POINTCLOUD_URL ?? "/sample/",
};

// ── Preset definitions ─────────────────────────────────────────────────────

type LayoutPresetId =
  | "default-professional"
  | "default-lite"
  | "minimal"
  | "workstation";

interface LayoutPreset {
  id: LayoutPresetId;
  label: string;
  description: string;
}

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "default-professional",
    label: "Default · Professional",
    description:
      "Full toolset: measurements, clipping, display controls, export, and all sidebar tabs.",
  },
  {
    id: "default-lite",
    label: "Default · Lite",
    description:
      "Beginner-friendly set: navigation modes, basic measurements, and panorama/minimap toggles only.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description:
      "Render-prop layout: viewport fills the container with a single floating nav toolbar.",
  },
  {
    id: "workstation",
    label: "Workstation",
    description:
      "Render-prop layout: floating tool palettes and a collapsible sidebar for power users.",
  },
];

// ── Brand definitions ──────────────────────────────────────────────────────

type BrandId = "smart-agile" | "teal-orange" | "cad-cyan";

type ThemeValue = "light" | "dark";

/** A map of CSS custom-property name → `H S% L%` value (no `hsl(...)` wrapper). */
type TokenMap = Record<string, string>;

interface BrandPreset {
  id: BrandId;
  label: string;
  /**
   * Per-theme token overrides. `null` for a theme means "use the imported
   * smart-agile.css / base theme defaults as-is" (no override injected).
   *
   * Each token set must be COMPLETE for readability: whenever a background
   * token (`--background`/`--card`/`--toolbar-bg`/`--sidebar-bg`) is overridden,
   * the matching `--foreground`, `--muted-foreground` and `--border` are set too,
   * so text always has good contrast on the customised surfaces.
   */
  tokens: Record<ThemeValue, TokenMap | null>;
}

const BRAND_PRESETS: BrandPreset[] = [
  {
    id: "smart-agile",
    label: "Smart-Agile",
    // Use the imported smart-agile.css as-is for both themes.
    tokens: { dark: null, light: null },
  },
  {
    id: "teal-orange",
    label: "Teal / Orange",
    tokens: {
      dark: {
        "--brand": "174 65% 50%",
        "--brand-foreground": "0 0% 5%",
        "--primary": "174 65% 50%",
        "--primary-foreground": "0 0% 5%",
        "--ring": "174 65% 50%",
        "--background": "200 15% 6%",
        "--foreground": "180 12% 92%",
        "--card": "200 12% 9%",
        "--card-foreground": "180 12% 92%",
        "--popover": "200 12% 9%",
        "--popover-foreground": "180 12% 92%",
        "--muted": "200 12% 14%",
        "--muted-foreground": "180 8% 64%",
        "--secondary": "200 12% 14%",
        "--secondary-foreground": "180 12% 92%",
        "--toolbar-bg": "200 12% 8%",
        "--toolbar-border": "200 12% 16%",
        "--sidebar-bg": "200 14% 5%",
        "--statusbar-bg": "200 12% 7%",
        "--accent": "25 90% 52%",
        "--accent-foreground": "0 0% 100%",
        "--border": "200 12% 16%",
        "--input": "200 12% 16%",
      },
      light: {
        "--brand": "174 72% 36%",
        "--brand-foreground": "0 0% 100%",
        "--primary": "174 72% 36%",
        "--primary-foreground": "0 0% 100%",
        "--ring": "174 72% 36%",
        "--background": "174 25% 98%",
        "--foreground": "200 18% 14%",
        "--card": "0 0% 100%",
        "--card-foreground": "200 18% 14%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "200 18% 14%",
        "--muted": "174 16% 92%",
        "--muted-foreground": "200 10% 38%",
        "--secondary": "174 16% 92%",
        "--secondary-foreground": "200 18% 14%",
        "--toolbar-bg": "174 20% 94%",
        "--toolbar-border": "174 16% 84%",
        "--sidebar-bg": "174 16% 90%",
        "--statusbar-bg": "174 18% 92%",
        "--accent": "25 90% 48%",
        "--accent-foreground": "0 0% 100%",
        "--border": "174 16% 84%",
        "--input": "174 16% 84%",
      },
    },
  },
  {
    id: "cad-cyan",
    label: "CAD Cyan / Amber",
    tokens: {
      dark: {
        "--brand": "195 100% 50%",
        "--brand-foreground": "0 0% 5%",
        "--primary": "195 100% 50%",
        "--primary-foreground": "0 0% 5%",
        "--ring": "195 100% 50%",
        "--background": "220 18% 5%",
        "--foreground": "210 16% 92%",
        "--card": "220 16% 8%",
        "--card-foreground": "210 16% 92%",
        "--popover": "220 16% 8%",
        "--popover-foreground": "210 16% 92%",
        "--muted": "220 14% 14%",
        "--muted-foreground": "210 10% 64%",
        "--secondary": "220 14% 14%",
        "--secondary-foreground": "210 16% 92%",
        "--toolbar-bg": "220 16% 7%",
        "--toolbar-border": "220 14% 14%",
        "--sidebar-bg": "220 18% 4%",
        "--statusbar-bg": "220 16% 6%",
        "--accent": "38 95% 55%",
        "--accent-foreground": "0 0% 5%",
        "--border": "220 14% 14%",
        "--input": "220 14% 14%",
      },
      light: {
        "--brand": "195 100% 38%",
        "--brand-foreground": "0 0% 100%",
        "--primary": "195 100% 38%",
        "--primary-foreground": "0 0% 100%",
        "--ring": "195 100% 38%",
        "--background": "200 30% 98%",
        "--foreground": "220 22% 14%",
        "--card": "0 0% 100%",
        "--card-foreground": "220 22% 14%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "220 22% 14%",
        "--muted": "200 24% 92%",
        "--muted-foreground": "220 12% 38%",
        "--secondary": "200 24% 92%",
        "--secondary-foreground": "220 22% 14%",
        "--toolbar-bg": "195 30% 94%",
        "--toolbar-border": "195 22% 82%",
        "--sidebar-bg": "195 22% 90%",
        "--statusbar-bg": "195 26% 92%",
        "--accent": "38 92% 46%",
        "--accent-foreground": "0 0% 5%",
        "--border": "195 22% 82%",
        "--input": "195 22% 82%",
      },
    },
  },
];

/**
 * Build a theme-aware brand override stylesheet. Only the token block for the
 * currently selected theme is emitted.
 *
 * The block is scoped to the active theme's selector (`.pcv.dark` /
 * `.pcv[data-theme="dark"]` for dark, `.pcv.light` / `.pcv[data-theme="light"]`
 * for light) rather than plain `.pcv`. This is deliberate: the imported
 * `smart-agile.css` defines its DARK tokens under `.pcv.dark` (specificity
 * 0,2,0). A plain `.pcv` block (0,1,0) would lose the cascade to it in dark
 * mode, so the brand override would silently have no effect. Matching the
 * `.pcv.dark` specificity — and relying on the injected `<style>` coming later
 * in source order than the imported stylesheet — lets the brand tokens win in
 * both themes. Because we re-mount the viewer on theme change (see `viewerKey`)
 * and regenerate this string each render, flipping the theme cleanly swaps the
 * visible tokens with no stale opposite-theme block lingering.
 */
function buildBrandCSS(brand: BrandPreset, theme: ThemeValue): string {
  const tokens = brand.tokens[theme];
  if (!tokens) return "";
  const decls = Object.entries(tokens)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  // Cover both the class-based (`.dark`/`.light`) and attribute-based
  // (`[data-theme]`) selectors the viewer root carries, matching how base.css
  // and smart-agile.css target each theme.
  const selector = `.pcv.${theme}, .pcv[data-theme="${theme}"]`;
  return `${selector} {\n${decls}\n}`;
}

// ── UI scale ────────────────────────────────────────────────────────────────

const UI_SCALES = [0.85, 1, 1.25, 1.5] as const;
type UiScale = (typeof UI_SCALES)[number];

// ── Helpers ────────────────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "rgba(255,255,255,0.07)",
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontWeight: value === opt.value ? 600 : 400,
            background:
              value === opt.value
                ? "rgba(255,255,255,0.18)"
                : "transparent",
            color:
              value === opt.value
                ? "#fff"
                : "rgba(255,255,255,0.6)",
            border: "none",
            cursor: "pointer",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            transition: "background 0.15s, color 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Main Gallery Component ─────────────────────────────────────────────────

export function DemoGallery() {
  const [layoutPreset, setLayoutPreset] =
    useState<LayoutPresetId>("default-professional");
  const [theme, setTheme] = useState<ThemeValue>("dark");
  const [brand, setBrand] = useState<BrandId>("smart-agile");
  // UI scale is applied via a local `zoom` wrapper (see render below), so it
  // does NOT need to be part of `viewerKey` — changing it must not trigger an
  // expensive WebGL/point-cloud reload.
  const [uiScale, setUiScale] = useState<UiScale>(1);

  // Re-key viewer when layout/theme/brand changes so it cleanly remounts.
  const viewerKey = `${layoutPreset}-${theme}-${brand}`;

  // The viewer's <ThemeProvider> seeds its initial theme from localStorage
  // (`pcv-theme`) and only falls back to the `theme` prop when that key is
  // absent. Once anything has persisted a value there, the prop is ignored on
  // remount — which is why the gallery's Dark/Light toggle previously appeared
  // to do nothing. We keep the persisted value in sync with the gallery's
  // selection BEFORE the keyed remount, so the freshly-mounted provider reads
  // the theme we actually selected. Writing in the event handler (below) runs
  // ahead of React's re-render, so the new provider's lazy initializer picks
  // it up. This effect covers the initial mount.
  useEffect(() => {
    try {
      window.localStorage.setItem("pcv-theme", theme);
    } catch {
      /* localStorage may be unavailable (private mode); toggle still works via remount */
    }
  }, [theme]);

  const handleThemeChange = (next: ThemeValue) => {
    try {
      window.localStorage.setItem("pcv-theme", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  };

  const activeBrand = useMemo(
    () => BRAND_PRESETS.find((b) => b.id === brand)!,
    [brand]
  );

  // Theme-aware brand override CSS — only the selected theme's tokens are
  // emitted, so flipping the theme visibly swaps the brand-customised tokens.
  const brandCSS = useMemo(
    () => buildBrandCSS(activeBrand, theme),
    [activeBrand, theme]
  );

  const activePreset = useMemo(
    () => LAYOUT_PRESETS.find((p) => p.id === layoutPreset)!,
    [layoutPreset]
  );

  // Viewer element based on selected preset
  const viewer = useMemo(() => {
    if (layoutPreset === "default-professional") {
      return (
        <PanoCloudViewer
          key={viewerKey}
          source={SOURCE}
          theme={theme}
          uiMode="professional"
        />
      );
    }
    if (layoutPreset === "default-lite") {
      return (
        <PanoCloudViewer
          key={viewerKey}
          source={SOURCE}
          theme={theme}
          uiMode="lite"
        />
      );
    }
    if (layoutPreset === "minimal") {
      return (
        <PanoCloudViewer key={viewerKey} source={SOURCE} theme={theme}>
          {(viewport) => <MinimalLayout viewport={viewport} />}
        </PanoCloudViewer>
      );
    }
    // workstation
    return (
      <PanoCloudViewer key={viewerKey} source={SOURCE} theme={theme}>
        {(viewport) => <WorkstationLayout viewport={viewport} />}
      </PanoCloudViewer>
    );
  }, [layoutPreset, theme, viewerKey]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0a",
        overflow: "auto",
      }}
    >
      {/* ── Brand override style injection (theme-aware) ────────────────── */}
      {brandCSS && <style dangerouslySetInnerHTML={{ __html: brandCSS }} />}

      {/* ── Control bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "8px 16px",
          background: "rgba(10,10,10,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
          zIndex: 100,
          flexWrap: "wrap",
        }}
      >
        {/* Logo / label */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.06em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            marginRight: 4,
            whiteSpace: "nowrap",
          }}
        >
          Demo Gallery
        </span>

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.1)",
          }}
        />

        {/* Preset switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            Preset
          </span>
          <SegmentedControl
            options={LAYOUT_PRESETS.map((p) => ({
              value: p.id,
              label: p.label,
            }))}
            value={layoutPreset}
            onChange={setLayoutPreset}
          />
        </div>

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.1)",
          }}
        />

        {/* Theme switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Theme
          </span>
          <SegmentedControl
            options={[
              { value: "dark" as const, label: "Dark" },
              { value: "light" as const, label: "Light" },
            ]}
            value={theme}
            onChange={handleThemeChange}
          />
        </div>

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.1)",
          }}
        />

        {/* Brand switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Brand
          </span>
          <SegmentedControl
            options={BRAND_PRESETS.map((b) => ({
              value: b.id,
              label: b.label,
            }))}
            value={brand}
            onChange={setBrand}
          />
        </div>

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.1)",
          }}
        />

        {/* UI scale switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            UI Scale
          </span>
          <SegmentedControl
            options={UI_SCALES.map((s) => ({
              value: String(s),
              label: `${s}×`,
            }))}
            value={String(uiScale)}
            onChange={(v) => setUiScale(Number(v) as UiScale)}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Caption */}
        <span
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
            fontFamily: "ui-monospace, monospace",
            whiteSpace: "nowrap",
          }}
        >
          Axes: layout · theme · brand tokens · UI scale
        </span>
      </div>

      {/* ── Description strip ───────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          padding: "5px 16px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {activePreset.label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          —
        </span>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          {activePreset.description}
        </span>
      </div>

      {/* ── Viewer area (minHeight floor so a wrapped control bar on narrow
             screens can never collapse the viewer to 0px).

             UI scaling is applied LOCALLY here via the CSS `zoom` property on a
             wrapper — supported in current Chromium/Firefox/Safari. This scales
             the entire demo viewer (chrome + viewport) without remounting, so
             the point cloud is not reloaded on scale change. NOTE: production
             apps can instead use the library's `uiScale` prop to scale only the
             chrome (toolbar/sidebar) while keeping the 3D viewport at 1×. ──── */}
      <div style={{ flex: 1, minHeight: 360, position: "relative" }}>
        <div
          style={{
            zoom: uiScale,
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {viewer}
        </div>
      </div>
    </div>
  );
}
