"use client";

import React from "react";
import { Palette } from "lucide-react";
import { cn, budgetSliderRange } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useData } from "../../providers/data-provider";
import { FloatingPalette } from "./floating-palette";
import type { ColorMode } from "@der-ort/pano-cloud-viewer-core";

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "intensity_gradient", label: "Intensity Grad." },
  { value: "classification", label: "Classification" },
  { value: "return_number", label: "Return #" },
  { value: "source", label: "Source" },
];

const QUALITY_PRESETS = [
  { label: "Perf", shape: 0, sizeType: 0 },
  { label: "Balanced", shape: 1, sizeType: 2 },
  { label: "High", shape: 2, sizeType: 2 },
];

export function DisplayPalette() {
  const { loader, colorMode, setColorMode, pointBudget, setPointBudget, pointSize, setPointSize } = useViewer();
  const { metadata } = useData();
  // Budget slider scales with the loaded cloud — no fixed 10M cap.
  const budgetRange = budgetSliderRange(metadata?.points);

  return (
    <FloatingPalette title="Display" icon={<Palette size={12} />}>
      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1">Color</p>
      <div className="flex flex-wrap gap-1">
        {COLOR_MODES.map(cm => (
          <button
            key={cm.value}
            onClick={() => { setColorMode(cm.value); loader?.setColorMode(cm.value); }}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded transition-colors",
              colorMode === cm.value
                ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            {cm.label}
          </button>
        ))}
      </div>

      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-3 mb-1">Quality</p>
      <div className="flex gap-1">
        {QUALITY_PRESETS.map(q => (
          <button
            key={q.label}
            onClick={() => { loader?.setPointShape(q.shape); loader?.setPointSizeType(q.sizeType); }}
            className="text-[10px] px-2 py-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 mt-2">
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
            <span>Budget</span>
            <span>{(pointBudget / 1e6).toFixed(1)}M</span>
          </div>
          <input type="range" min={budgetRange.min} max={budgetRange.max} step={budgetRange.step} value={pointBudget}
            onChange={e => { const v = parseInt(e.target.value); setPointBudget(v); loader?.setPointBudget(v); }}
            className="pcv-slider w-full" />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
            <span>Point Size</span>
            <span>{pointSize.toFixed(1)}</span>
          </div>
          <input type="range" min={0.5} max={5} step={0.1} value={pointSize}
            onChange={e => { const v = parseFloat(e.target.value); setPointSize(v); loader?.setPointSize(v); }}
            className="pcv-slider w-full" />
        </div>
      </div>
    </FloatingPalette>
  );
}
