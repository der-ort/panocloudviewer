"use client";

import React, { useState, useMemo } from "react";
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

interface BrandPreset {
  id: BrandId;
  label: string;
  /** CSS snippet injected into the page as a <style> block. Empty = use theme defaults. */
  overrideCSS: string;
}

const BRAND_PRESETS: BrandPreset[] = [
  {
    id: "smart-agile",
    label: "Smart-Agile",
    overrideCSS: "", // use the imported smart-agile.css as-is
  },
  {
    id: "teal-orange",
    label: "Teal / Orange",
    overrideCSS: `
.pcv {
  --brand: 174 72% 40%;
  --brand-foreground: 0 0% 100%;
  --primary: 174 72% 40%;
  --primary-foreground: 0 0% 100%;
  --ring: 174 72% 40%;
}
.pcv.dark {
  --brand: 174 65% 50%;
  --brand-foreground: 0 0% 5%;
  --primary: 174 65% 50%;
  --primary-foreground: 0 0% 5%;
  --ring: 174 65% 50%;
  --background: 200 15% 6%;
  --card: 200 12% 9%;
  --toolbar-bg: 200 12% 8%;
  --sidebar-bg: 200 14% 5%;
  --statusbar-bg: 200 12% 7%;
  --accent: 25 90% 52%;
  --accent-foreground: 0 0% 100%;
}
.pcv.light {
  --brand: 174 72% 36%;
  --brand-foreground: 0 0% 100%;
  --primary: 174 72% 36%;
  --primary-foreground: 0 0% 100%;
  --ring: 174 72% 36%;
  --toolbar-bg: 174 20% 94%;
  --sidebar-bg: 174 16% 90%;
}
`,
  },
  {
    id: "cad-cyan",
    label: "CAD Cyan / Amber",
    overrideCSS: `
.pcv {
  --brand: 195 100% 45%;
  --brand-foreground: 0 0% 5%;
  --primary: 195 100% 45%;
  --primary-foreground: 0 0% 5%;
  --ring: 195 100% 45%;
}
.pcv.dark {
  --background: 220 18% 5%;
  --card: 220 16% 8%;
  --toolbar-bg: 220 16% 7%;
  --toolbar-border: 220 14% 12%;
  --sidebar-bg: 220 18% 4%;
  --statusbar-bg: 220 16% 6%;
  --brand: 195 100% 50%;
  --brand-foreground: 0 0% 5%;
  --primary: 195 100% 50%;
  --primary-foreground: 0 0% 5%;
  --ring: 195 100% 50%;
  --accent: 38 95% 55%;
  --accent-foreground: 0 0% 5%;
  --border: 220 14% 14%;
}
.pcv.light {
  --brand: 195 100% 38%;
  --brand-foreground: 0 0% 100%;
  --primary: 195 100% 38%;
  --primary-foreground: 0 0% 100%;
  --ring: 195 100% 38%;
  --toolbar-bg: 195 30% 94%;
  --sidebar-bg: 195 22% 90%;
}
`,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

type ThemeValue = "light" | "dark";

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

  // Re-key viewer when any major config changes so it cleanly remounts
  const viewerKey = `${layoutPreset}-${theme}-${brand}`;

  const activeBrand = useMemo(
    () => BRAND_PRESETS.find((b) => b.id === brand)!,
    [brand]
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
      {/* ── Brand override style injection ──────────────────────────────── */}
      {activeBrand.overrideCSS && (
        <style dangerouslySetInnerHTML={{ __html: activeBrand.overrideCSS }} />
      )}

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
            onChange={setTheme}
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
          Axes: CSS tokens · components prop · render-prop/layouts
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
             screens can never collapse the viewer to 0px) ──────────────── */}
      <div style={{ flex: 1, minHeight: 360, position: "relative" }}>
        {viewer}
      </div>
    </div>
  );
}
