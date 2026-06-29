"use client";

import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, Sun, Moon } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useTheme } from "../../providers/theme-provider";
import { useDisplayActions } from "../../hooks/use-display-actions";
import { useLocale } from "../../i18n/locale-context";
import { usePcvRoot } from "../pano-cloud-viewer";
import { useDraggable } from "../../hooks/use-draggable";
import type { ColorMode } from "@der-ort/pano-cloud-viewer-core";

interface RenderingSettingsProps {
  open: boolean;
  onClose: () => void;
}

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "classification", label: "Classification" },
];

const QUALITY = [
  { value: "performance" as const, label: "Performance" },
  { value: "balanced" as const, label: "Balanced" },
  { value: "high" as const, label: "High" },
];

/**
 * Unified Settings panel (top-left) — display + appearance + theme in one place.
 * Replaces the separate quick-settings popover and rendering-settings modal.
 * Appearance sliders write to the potree-core material **uniforms** (the shader
 * reads `uniforms.*.value`; writing `mat.rgbGamma` was a no-op).
 */
export function RenderingSettings({ open, onClose }: RenderingSettingsProps) {
  const { loader, colorMode, setColorMode, pointSize, setPointSize, pointBudget, setPointBudget } = useViewer();
  const { setQualityPreset } = useDisplayActions();
  const { resolvedTheme, toggleTheme } = useTheme();
  const t = useLocale().renderingSettings;
  const pcvRoot = usePcvRoot();
  const { position, onDragStart, reset } = useDraggable({ bounds: pcvRoot ?? undefined });

  useEffect(() => { if (!open) reset(); }, [open, reset]);

  const [rgbGamma, setRgbGamma] = useState(1.0);
  const [rgbBrightness, setRgbBrightness] = useState(0);
  const [rgbContrast, setRgbContrast] = useState(0);
  const [intensityGamma, setIntensityGamma] = useState(1.0);
  const [intensityBrightness, setIntensityBrightness] = useState(0);
  const [intensityContrast, setIntensityContrast] = useState(0);
  const [intensityRange, setIntensityRange] = useState<[number, number]>([0, 65535]);
  const [heightMin, setHeightMin] = useState(0);
  const [heightMax, setHeightMax] = useState(100);
  const [opacity, setOpacity] = useState(1.0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mat = (): any => loader?.getPointCloud() ? (loader.getPointCloud() as any).material : null;

  // Load current values from the material uniforms on open.
  useEffect(() => {
    if (!open) return;
    const m = mat();
    if (!m) return;
    const u = m.uniforms ?? {};
    setRgbGamma(u.rgbGamma?.value ?? 1.0);
    setRgbBrightness(u.rgbBrightness?.value ?? 0);
    setRgbContrast(u.rgbContrast?.value ?? 0);
    setIntensityGamma(u.intensityGamma?.value ?? 1.0);
    setIntensityBrightness(u.intensityBrightness?.value ?? 0);
    setIntensityContrast(u.intensityContrast?.value ?? 0);
    setOpacity(m.opacity ?? 1.0);
    const ir = u.intensityRange?.value;
    if (ir) setIntensityRange([ir[0] ?? 0, ir[1] ?? 65535]);
    const er = u.elevationRange?.value;
    const wb = loader?.worldBox;
    if (er) setHeightMin(er[0]), setHeightMax(er[1]);
    else if (wb && !wb.isEmpty()) setHeightMin(wb.min.z), setHeightMax(wb.max.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loader]);

  /** Set a material shader uniform (the real, effective path). */
  const setUniform = (setter: (v: number) => void, name: string, value: number) => {
    setter(value);
    const m = mat();
    if (m?.uniforms?.[name]) m.uniforms[name].value = value;
  };
  const setElevation = (min: number, max: number) => {
    setHeightMin(min); setHeightMax(max);
    const m = mat();
    if (m) m.elevationRange = [min, max]; // potree-core setter → updates the uniform
  };
  const setIntensity = (min: number, max: number) => {
    setIntensityRange([min, max]);
    const m = mat();
    if (m?.uniforms?.intensityRange) m.uniforms.intensityRange.value = [min, max];
  };
  const setOpacityVal = (v: number) => {
    setOpacity(v);
    const m = mat();
    if (m) { m.opacity = v; m.transparent = v < 1; m.needsUpdate = true; }
  };

  if (!open) return null;

  const wb = loader?.worldBox;
  const zMin = wb && !wb.isEmpty() ? wb.min.z : -100;
  const zMax = wb && !wb.isEmpty() ? wb.max.z : 100;
  const zRange = Math.max(1, zMax - zMin);

  return (
    <div
      className="absolute top-3 left-3 z-50 w-72 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-xl"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {/* Header — drag handle */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))] cursor-move select-none"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[hsl(var(--brand))]" />
          <span className="text-xs font-semibold">Settings</span>
        </div>
        <button
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-4 text-xs">
        {/* ── Display ────────────────────────────────────────────── */}
        <Section title="Display">
          <div className="grid grid-cols-2 gap-1">
            {COLOR_MODES.map(cm => (
              <button
                key={cm.value}
                onClick={() => { setColorMode(cm.value); loader?.setColorMode(cm.value); }}
                className={
                  colorMode === cm.value
                    ? "text-[10px] py-1 px-2 rounded bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]"
                    : "text-[10px] py-1 px-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }
              >
                {cm.label}
              </button>
            ))}
          </div>
          <Slider label="Point size" value={pointSize} min={0.2} max={5} step={0.1}
            onChange={v => { setPointSize(v); loader?.setPointSize(v); }} />
          <Slider label="Budget" value={pointBudget} min={200_000} max={10_000_000} step={100_000}
            onChange={v => { setPointBudget(v); loader?.setPointBudget(v); }}
            display={v => (v / 1e6).toFixed(1) + "M"} />
          <div className="flex items-center gap-1 pt-0.5">
            {QUALITY.map(q => (
              <button key={q.value} onClick={() => setQualityPreset(q.value)}
                className="flex-1 text-[10px] py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60">
                {q.label}
              </button>
            ))}
          </div>
        </Section>

        {/* ── RGB ────────────────────────────────────────────────── */}
        <Section title={t.rgbSection}>
          <Slider label={t.gamma} value={rgbGamma} min={0.1} max={4} step={0.05}
            onChange={v => setUniform(setRgbGamma, "rgbGamma", v)} />
          <Slider label={t.brightness} value={rgbBrightness} min={-1} max={1} step={0.02}
            onChange={v => setUniform(setRgbBrightness, "rgbBrightness", v)} />
          <Slider label={t.contrast} value={rgbContrast} min={-1} max={1} step={0.02}
            onChange={v => setUniform(setRgbContrast, "rgbContrast", v)} />
        </Section>

        {/* ── Intensity ──────────────────────────────────────────── */}
        <Section title={t.intensitySection}>
          <Slider label={t.gamma} value={intensityGamma} min={0.1} max={4} step={0.05}
            onChange={v => setUniform(setIntensityGamma, "intensityGamma", v)} />
          <Slider label={t.brightness} value={intensityBrightness} min={-1} max={1} step={0.02}
            onChange={v => setUniform(setIntensityBrightness, "intensityBrightness", v)} />
          <Slider label={t.contrast} value={intensityContrast} min={-1} max={1} step={0.02}
            onChange={v => setUniform(setIntensityContrast, "intensityContrast", v)} />
          <div className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground">{t.range}</span>
            <input type="number" value={intensityRange[0]} min={0} max={65535}
              onChange={e => setIntensity(Number(e.target.value), intensityRange[1])}
              className="w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono" />
            <span className="text-muted-foreground">–</span>
            <input type="number" value={intensityRange[1]} min={0} max={65535}
              onChange={e => setIntensity(intensityRange[0], Number(e.target.value))}
              className="w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono" />
          </div>
        </Section>

        {/* ── Elevation ──────────────────────────────────────────── */}
        <Section title={t.elevationSection}>
          <Slider label={t.elevMin} value={heightMin} min={zMin - zRange * 0.1} max={zMax + zRange * 0.1} step={zRange / 200}
            onChange={v => setElevation(v, heightMax)} display={v => v.toFixed(1) + "m"} />
          <Slider label={t.elevMax} value={heightMax} min={zMin - zRange * 0.1} max={zMax + zRange * 0.1} step={zRange / 200}
            onChange={v => setElevation(heightMin, v)} display={v => v.toFixed(1) + "m"} />
        </Section>

        {/* ── General ────────────────────────────────────────────── */}
        <Section title={t.generalSection}>
          <Slider label={t.opacity} value={opacity} min={0} max={1} step={0.02}
            onChange={setOpacityVal} />
        </Section>

        {/* ── Theme ──────────────────────────────────────────────── */}
        <Section title="Theme">
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
            {resolvedTheme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            <span className="text-[11px]">{resolvedTheme === "dark" ? "Switch to light" : "Switch to dark"}</span>
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: (v: number) => string;
}

function Slider({ label, value, min, max, step, onChange, display }: SliderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-muted-foreground shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-[hsl(var(--brand))] h-1"
      />
      <span className="w-12 text-right font-mono text-[10px] tabular-nums">
        {display ? display(value) : value.toFixed(2)}
      </span>
    </div>
  );
}
