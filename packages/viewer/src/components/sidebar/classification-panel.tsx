"use client";

import React, { useState } from "react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";

// Standard LAS classification codes (colors only — labels come from locale)
const CLASS_DEFS = [
  { code: 0,  color: "#aaaaaa" },
  { code: 1,  color: "#888888" },
  { code: 2,  color: "#c8a46e" },
  { code: 3,  color: "#5ec45e" },
  { code: 4,  color: "#2ea02e" },
  { code: 5,  color: "#006600" },
  { code: 6,  color: "#e07070" },
  { code: 7,  color: "#ff4444" },
  { code: 9,  color: "#4488ff" },
  { code: 17, color: "#cc88ff" },
  { code: 18, color: "#ff8800" },
];

export function ClassificationPanel() {
  const { loader } = useViewer();
  const t = useLocale().classificationPanel;
  const [visible, setVisible] = useState<Record<number, boolean>>(
    Object.fromEntries(CLASS_DEFS.map(c => [c.code, true]))
  );

  const toggle = (code: number) => {
    setVisible(prev => {
      const next = { ...prev, [code]: !prev[code] };
      // Apply to potree material if available
      const cloud = loader?.getPointCloud() as any;
      if (cloud?.material) {
        // potree-core exposes classification visibility via material.classification
        const mat = cloud.material as any;
        if (mat.classification) {
          const THREE = (window as any).THREE;
          const hexColor = CLASS_DEFS.find(c => c.code === code)?.color ?? "#ffffff";
          mat.classification[code] = { visible: next[code], color: THREE ? new THREE.Color(hexColor) : hexColor };
        }
      }
      return next;
    });
  };

  const toggleAll = (on: boolean) => {
    const next = Object.fromEntries(CLASS_DEFS.map(c => [c.code, on]));
    setVisible(next);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t.title}</p>
        <div className="flex gap-1">
          <button onClick={() => toggleAll(true)}  className="text-[9px] text-muted-foreground hover:text-foreground transition-colors">{t.all}</button>
          <span className="text-muted-foreground text-[9px]">/</span>
          <button onClick={() => toggleAll(false)} className="text-[9px] text-muted-foreground hover:text-foreground transition-colors">{t.none}</button>
        </div>
      </div>

      {CLASS_DEFS.map(cls => (
        <label key={cls.code} className="flex items-center gap-2 py-1 cursor-pointer group">
          <input
            type="checkbox"
            checked={visible[cls.code] ?? true}
            onChange={() => toggle(cls.code)}
            className="accent-[hsl(var(--brand))] w-3 h-3 shrink-0"
          />
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: cls.color }} />
          <span className="text-[10px] font-mono text-foreground">{cls.code}</span>
          <span className="text-[10px] text-muted-foreground truncate">{t.classLabels[cls.code] ?? String(cls.code)}</span>
        </label>
      ))}
    </div>
  );
}
