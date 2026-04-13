"use client";

import React from "react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";

export function DisplayControls() {
  const { pointBudget, setPointBudget, pointSize, setPointSize, loader } = useViewer();
  const t = useLocale().toolbar;

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

  return (
    <div className="flex items-center gap-2 px-1">
      <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
        <span className="hidden lg:block">{t.budget}</span>
        <input
          type="range"
          min={500_000}
          max={10_000_000}
          step={100_000}
          value={pointBudget}
          onChange={handleBudget}
          className="w-16 accent-[hsl(var(--brand))] h-1"
          title={t.pointBudgetTitle(pointBudget / 1e6)}
        />
        <span className="w-8 text-right tabular-nums">{(pointBudget / 1e6).toFixed(0)}M</span>
      </label>

      <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
        <span className="hidden lg:block">{t.size}</span>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.1}
          value={pointSize}
          onChange={handleSize}
          className="w-12 accent-[hsl(var(--brand))] h-1"
          title={t.pointSizeTitle(pointSize)}
        />
      </label>
    </div>
  );
}
