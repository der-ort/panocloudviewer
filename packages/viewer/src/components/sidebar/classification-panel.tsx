"use client";

import React, { useState } from "react";
import { useViewer } from "../../providers/viewer-provider";

// Standard LAS classification codes
const CLASSES = [
  { code: 0,  label: "Never classified",  color: "#aaaaaa" },
  { code: 1,  label: "Unclassified",       color: "#888888" },
  { code: 2,  label: "Ground",             color: "#c8a46e" },
  { code: 3,  label: "Low Vegetation",     color: "#5ec45e" },
  { code: 4,  label: "Medium Vegetation",  color: "#2ea02e" },
  { code: 5,  label: "High Vegetation",    color: "#006600" },
  { code: 6,  label: "Building",           color: "#e07070" },
  { code: 7,  label: "Low Point (Noise)",  color: "#ff4444" },
  { code: 9,  label: "Water",              color: "#4488ff" },
  { code: 17, label: "Bridge Deck",        color: "#cc88ff" },
  { code: 18, label: "High Noise",         color: "#ff8800" },
];

export function ClassificationPanel() {
  const { loader } = useViewer();
  const [visible, setVisible] = useState<Record<number, boolean>>(
    Object.fromEntries(CLASSES.map(c => [c.code, true]))
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
          const hexColor = CLASSES.find(c => c.code === code)?.color ?? "#ffffff";
          mat.classification[code] = { visible: next[code], color: THREE ? new THREE.Color(hexColor) : hexColor };
        }
      }
      return next;
    });
  };

  const toggleAll = (on: boolean) => {
    const next = Object.fromEntries(CLASSES.map(c => [c.code, on]));
    setVisible(next);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">LAS Classes</p>
        <div className="flex gap-1">
          <button onClick={() => toggleAll(true)}  className="text-[9px] text-muted-foreground hover:text-foreground transition-colors">All</button>
          <span className="text-muted-foreground text-[9px]">/</span>
          <button onClick={() => toggleAll(false)} className="text-[9px] text-muted-foreground hover:text-foreground transition-colors">None</button>
        </div>
      </div>

      {CLASSES.map(cls => (
        <label key={cls.code} className="flex items-center gap-2 py-1 cursor-pointer group">
          <input
            type="checkbox"
            checked={visible[cls.code] ?? true}
            onChange={() => toggle(cls.code)}
            className="accent-[hsl(var(--brand))] w-3 h-3 shrink-0"
          />
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: cls.color }} />
          <span className="text-[10px] font-mono text-foreground">{cls.code}</span>
          <span className="text-[10px] text-muted-foreground truncate">{cls.label}</span>
        </label>
      ))}
    </div>
  );
}
