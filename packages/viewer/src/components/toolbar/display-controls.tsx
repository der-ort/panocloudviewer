"use client";

import React, { useState } from "react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import type { ColorMode } from "@der-ort/pano-cloud-viewer-core";
import type { CameraProjection, NavigationMode } from "@der-ort/pano-cloud-viewer-core";

const COLOR_MODES: { value: ColorMode; labelKey: string }[] = [
  { value: "rgb",                labelKey: "colorRgb" },
  { value: "height",            labelKey: "colorElevation" },
  { value: "intensity",         labelKey: "colorIntensity" },
  { value: "intensity_gradient", labelKey: "colorIntensityGradient" },
  { value: "classification",    labelKey: "colorClassification" },
  { value: "return_number",     labelKey: "colorReturnNumber" },
  { value: "source",            labelKey: "colorSource" },
];

const QUALITY_PRESETS = [
  { value: "performance", shape: 0, sizeType: 0, label: "qualityPerformance" },  // SQUARE + FIXED
  { value: "balanced",    shape: 1, sizeType: 2, label: "qualityBalanced" },      // CIRCLE + ADAPTIVE
  { value: "high",        shape: 2, sizeType: 2, label: "qualityHigh" },          // PARABOLOID + ADAPTIVE
] as const;

// ─── Wireframe cube SVG icons ────────────────────────────────────────────────
// Each icon is a wireframe cube with one face filled to indicate the view.

/** Orbit — full cube wireframe, circle arrow around it */
function OrbitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width="14" height="14">
      {/* Wireframe cube */}
      <path d="M5 8l7-4 7 4v8l-7 4-7-4V8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 8l7 4 7-4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12 12v8" stroke="currentColor" strokeWidth="1.3" />
      {/* Orbit arc arrow */}
      <path d="M20 5a9.5 9.5 0 0 0-4-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M20 5l-1.5-2M20 5l2-1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Free — cube with full-sphere rotation arrows (Blender-style) */
function FreeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width="14" height="14">
      {/* Wireframe cube (smaller) */}
      <path d="M7 9l5-3 5 3v6l-5 3-5-3V9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 9l5 3 5-3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12 12v6" stroke="currentColor" strokeWidth="1.3" />
      {/* Circular arrows — free rotation in any direction */}
      <path d="M4 8a8.5 8.5 0 0 1 2-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 8l-1.5-1.5M4 8l1.5-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Pan — cube with top face filled and horizontal arrow (map-view) */
function PanIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width="14" height="14">
      {/* Wireframe cube */}
      <path d="M5 8l7-4 7 4v8l-7 4-7-4V8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 8l7 4 7-4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12 12v8" stroke="currentColor" strokeWidth="1.3" />
      {/* Top face filled */}
      <path d="M5 8l7-4 7 4-7 4z" fill="currentColor" fillOpacity="0.25" />
      {/* Horizontal pan arrow */}
      <path d="M3 20h4M3 20l1.5-1.5M3 20l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Perspective — cube with perspective lines converging */
function PerspectiveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width="14" height="14">
      {/* Perspective cube — front face larger, back face smaller */}
      <rect x="3" y="4" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="7" width="12" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <line x1="3" y1="4" x2="9" y2="7" stroke="currentColor" strokeWidth="1.3" />
      <line x1="15" y1="4" x2="21" y2="7" stroke="currentColor" strokeWidth="1.3" />
      <line x1="3" y1="16" x2="9" y2="19" stroke="currentColor" strokeWidth="1.3" />
      <line x1="15" y1="16" x2="21" y2="19" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/** Orthographic — flat square, no perspective */
function OrthoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width="14" height="14">
      {/* Flat orthographic box — no perspective convergence */}
      <rect x="4" y="4" width="10" height="10" stroke="currentColor" strokeWidth="1.3" />
      <rect x="10" y="10" width="10" height="10" stroke="currentColor" strokeWidth="1.3" />
      <line x1="4" y1="4" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3" />
      <line x1="14" y1="4" x2="20" y2="10" stroke="currentColor" strokeWidth="1.3" />
      <line x1="4" y1="14" x2="10" y2="20" stroke="currentColor" strokeWidth="1.3" />
      <line x1="14" y1="14" x2="20" y2="20" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

const NAV_MODES: { value: NavigationMode; icon: React.FC<{ className?: string }>; titleKey: "navOrbitTitle" | "navFreeTitle" | "navPanTitle" }[] = [
  { value: "orbit", icon: OrbitIcon, titleKey: "navOrbitTitle" },
  { value: "free",  icon: FreeIcon,  titleKey: "navFreeTitle" },
  { value: "pan",   icon: PanIcon,   titleKey: "navPanTitle" },
];

const PROJ_MODES: { value: CameraProjection; icon: React.FC<{ className?: string }>; titleKey: "camPerspectiveTitle" | "camOrthographicTitle" }[] = [
  { value: "perspective",  icon: PerspectiveIcon, titleKey: "camPerspectiveTitle" },
  { value: "orthographic", icon: OrthoIcon,       titleKey: "camOrthographicTitle" },
];

export function DisplayControls() {
  const { pointBudget, setPointBudget, pointSize, setPointSize, loader, colorMode, setColorMode, navigationMode, setNavigationMode, projection, setProjection, uiMode } = useViewer();
  const t = useLocale().toolbar;
  const [quality, setQuality] = useState("balanced");

  const isPro = uiMode === "professional";

  const handleBudget = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPointBudget(val);
    loader?.setPointBudget(val);
  };

  const handleSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPointSize(val);
    loader?.setPointSize(val);
  };

  const handleColorMode = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as ColorMode;
    setColorMode(mode);
    await loader?.setColorMode(mode);
  };

  const handleQuality = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = QUALITY_PRESETS.find(p => p.value === e.target.value);
    if (!preset) return;
    setQuality(preset.value);
    loader?.setPointShape(preset.shape);
    loader?.setPointSizeType(preset.sizeType);
  };

  const selectClass = "bg-[hsl(var(--toolbar-bg))] border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand))] cursor-pointer";
  const iconBtnClass = (active: boolean) =>
    `p-1 rounded transition-colors cursor-pointer border ${
      active
        ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] border-[hsl(var(--brand)/0.4)]"
        : "text-muted-foreground hover:text-foreground border-transparent hover:border-[hsl(var(--border))]"
    }`;

  return (
    <div className="flex items-center gap-2 px-1">
      {/* Navigation mode */}
      <div className="flex items-center gap-0.5 border border-[hsl(var(--border))] rounded p-0.5">
        {NAV_MODES.map(nm => (
          <button
            key={nm.value}
            className={iconBtnClass(navigationMode === nm.value)}
            title={t[nm.titleKey]}
            onClick={() => setNavigationMode(nm.value)}
          >
            <nm.icon />
          </button>
        ))}
      </div>

      {/* Camera projection */}
      <div className="flex items-center gap-0.5 border border-[hsl(var(--border))] rounded p-0.5">
        {PROJ_MODES.map(pm => (
          <button
            key={pm.value}
            className={iconBtnClass(projection === pm.value)}
            title={t[pm.titleKey]}
            onClick={() => setProjection(pm.value)}
          >
            <pm.icon />
          </button>
        ))}
      </div>

      {/* Color mode — Professional only */}
      {isPro && (
        <select
          value={colorMode}
          onChange={handleColorMode}
          className={selectClass}
          title={t.colorMode}
        >
          {COLOR_MODES.map(cm => (
            <option key={cm.value} value={cm.value}>
              {(t as unknown as Record<string, string>)[cm.labelKey] ?? cm.value}
            </option>
          ))}
        </select>
      )}

      {/* Quality preset — Professional only */}
      {isPro && (
        <select
          value={quality}
          onChange={handleQuality}
          className={selectClass}
          title={t.quality}
        >
          {QUALITY_PRESETS.map(q => (
            <option key={q.value} value={q.value}>
              {(t as unknown as Record<string, string>)[q.label] ?? q.value}
            </option>
          ))}
        </select>
      )}

      {/* Budget slider — Professional only */}
      {isPro && (
        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <span className="hidden lg:block">{t.budget}</span>
          <input
            type="range"
            min={500_000}
            max={10_000_000}
            step={100_000}
            value={pointBudget}
            onChange={handleBudget}
            className="pcv-slider w-16"
            title={t.pointBudgetTitle(pointBudget / 1e6)}
          />
          <span className="w-8 text-right tabular-nums">{(pointBudget / 1e6).toFixed(0)}M</span>
        </label>
      )}

      {/* Size slider — Professional only */}
      {isPro && (
        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <span className="hidden lg:block">{t.size}</span>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.1}
            value={pointSize}
            onChange={handleSize}
            className="pcv-slider w-12"
            title={t.pointSizeTitle(pointSize)}
          />
        </label>
      )}
    </div>
  );
}
