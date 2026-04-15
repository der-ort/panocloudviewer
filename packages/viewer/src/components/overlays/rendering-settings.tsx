"use client";

import React, { useState, useEffect } from "react";
import { X, Sliders } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";

interface RenderingSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function RenderingSettings({ open, onClose }: RenderingSettingsProps) {
  const { loader } = useViewer();
  const t = useLocale().renderingSettings;

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

  // Load current values from material on open
  useEffect(() => {
    if (!open || !loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mat = (pc as any).material;
    if (!mat) return;

    setRgbGamma(mat.uniforms?.rgbGamma?.value ?? mat.rgbGamma ?? 1.0);
    setRgbBrightness(mat.uniforms?.rgbBrightness?.value ?? mat.rgbBrightness ?? 0);
    setRgbContrast(mat.uniforms?.rgbContrast?.value ?? mat.rgbContrast ?? 0);
    setIntensityGamma(mat.uniforms?.intensityGamma?.value ?? mat.intensityGamma ?? 1.0);
    setIntensityBrightness(mat.uniforms?.intensityBrightness?.value ?? mat.intensityBrightness ?? 0);
    setIntensityContrast(mat.uniforms?.intensityContrast?.value ?? mat.intensityContrast ?? 0);
    setOpacity(mat.opacity ?? 1.0);

    const wb = loader.worldBox;
    if (wb && !wb.isEmpty()) {
      setHeightMin(mat.uniforms?.heightMin?.value ?? mat.heightMin ?? wb.min.z);
      setHeightMax(mat.uniforms?.heightMax?.value ?? mat.heightMax ?? wb.max.z);
    }

    const ir = mat.uniforms?.intensityRange?.value ?? mat.intensityRange;
    if (ir) setIntensityRange([ir[0] ?? 0, ir[1] ?? 65535]);
  }, [open, loader]);

  const apply = (setter: (v: number) => void, prop: string, value: number) => {
    setter(value);
    if (!loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mat = (pc as any).material;
    if (!mat) return;
    mat[prop] = value;
    mat.needsUpdate = true;
  };

  const applyIntensityRange = (min: number, max: number) => {
    setIntensityRange([min, max]);
    if (!loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mat = (pc as any).material;
    if (!mat) return;
    mat.intensityRange = [min, max];
    mat.needsUpdate = true;
  };

  if (!open) return null;

  const wb = loader?.worldBox;
  const zMin = wb && !wb.isEmpty() ? wb.min.z : -100;
  const zMax = wb && !wb.isEmpty() ? wb.max.z : 100;
  const zRange = zMax - zMin;

  return (
    <div className="absolute top-12 left-12 z-50 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-[hsl(var(--brand))]" />
          <span className="text-xs font-semibold">{t.title}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-4 text-xs">
        {/* RGB Adjustments */}
        <Section title={t.rgbSection}>
          <Slider label={t.gamma} value={rgbGamma} min={0.1} max={4} step={0.05}
            onChange={v => apply(setRgbGamma, "rgbGamma", v)} />
          <Slider label={t.brightness} value={rgbBrightness} min={-1} max={1} step={0.02}
            onChange={v => apply(setRgbBrightness, "rgbBrightness", v)} />
          <Slider label={t.contrast} value={rgbContrast} min={-1} max={1} step={0.02}
            onChange={v => apply(setRgbContrast, "rgbContrast", v)} />
        </Section>

        {/* Intensity Adjustments */}
        <Section title={t.intensitySection}>
          <Slider label={t.gamma} value={intensityGamma} min={0.1} max={4} step={0.05}
            onChange={v => apply(setIntensityGamma, "intensityGamma", v)} />
          <Slider label={t.brightness} value={intensityBrightness} min={-1} max={1} step={0.02}
            onChange={v => apply(setIntensityBrightness, "intensityBrightness", v)} />
          <Slider label={t.contrast} value={intensityContrast} min={-1} max={1} step={0.02}
            onChange={v => apply(setIntensityContrast, "intensityContrast", v)} />
          <div className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground">{t.range}</span>
            <input type="number" value={intensityRange[0]} min={0} max={65535}
              onChange={e => applyIntensityRange(Number(e.target.value), intensityRange[1])}
              className="w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono" />
            <span className="text-muted-foreground">–</span>
            <input type="number" value={intensityRange[1]} min={0} max={65535}
              onChange={e => applyIntensityRange(intensityRange[0], Number(e.target.value))}
              className="w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono" />
          </div>
        </Section>

        {/* Elevation Range */}
        <Section title={t.elevationSection}>
          <Slider label={t.elevMin} value={heightMin} min={zMin - zRange * 0.1} max={zMax + zRange * 0.1} step={zRange / 200}
            onChange={v => apply(setHeightMin, "heightMin", v)} display={v => v.toFixed(1) + "m"} />
          <Slider label={t.elevMax} value={heightMax} min={zMin - zRange * 0.1} max={zMax + zRange * 0.1} step={zRange / 200}
            onChange={v => apply(setHeightMax, "heightMax", v)} display={v => v.toFixed(1) + "m"} />
        </Section>

        {/* General */}
        <Section title={t.generalSection}>
          <Slider label={t.opacity} value={opacity} min={0} max={1} step={0.02}
            onChange={v => apply(setOpacity, "opacity", v)} />
        </Section>

        {/* Reset button */}
        <button
          onClick={() => {
            apply(setRgbGamma, "rgbGamma", 1.0);
            apply(setRgbBrightness, "rgbBrightness", 0);
            apply(setRgbContrast, "rgbContrast", 0);
            apply(setIntensityGamma, "intensityGamma", 1.0);
            apply(setIntensityBrightness, "intensityBrightness", 0);
            apply(setIntensityContrast, "intensityContrast", 0);
            apply(setOpacity, "opacity", 1.0);
            if (wb && !wb.isEmpty()) {
              apply(setHeightMin, "heightMin", wb.min.z);
              apply(setHeightMax, "heightMax", wb.max.z);
            }
            applyIntensityRange(0, 65535);
          }}
          className="w-full py-1.5 text-center rounded bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors text-[10px] font-mono"
        >
          {t.reset}
        </button>
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
