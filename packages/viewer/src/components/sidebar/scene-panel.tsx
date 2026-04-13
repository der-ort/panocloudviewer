"use client";

import React from "react";
import { CloudCog, Ruler, BoxSelect, Eye, EyeOff, Trash2 } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";

export function ScenePanel() {
  const { measurementList, measurementManager, setMeasurementList, loader } = useViewer();

  const deleteMeasurement = (id: string) => {
    measurementManager?.remove(id);
    setMeasurementList(prev => prev.filter(m => m.id !== id));
  };

  const clearAll = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto text-xs">
      {/* Point Clouds */}
      <div className="p-2 border-b border-[hsl(var(--border))]">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Point Clouds</p>
        {loader?.getPointCloud() ? (
          <div className="flex items-center gap-2 py-1">
            <CloudCog size={12} className="text-[hsl(var(--brand))] shrink-0" />
            <span className="flex-1 truncate font-mono text-foreground">pointcloud</span>
          </div>
        ) : (
          <p className="text-muted-foreground text-[10px]">No cloud loaded</p>
        )}
      </div>

      {/* Measurements */}
      <div className="p-2 border-b border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Measurements</p>
          {measurementList.length > 0 && (
            <button onClick={clearAll} title="Clear all" className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={11} />
            </button>
          )}
        </div>
        {measurementList.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">None</p>
        ) : (
          measurementList.map(m => (
            <div key={m.id} className="flex items-center gap-1.5 py-0.5 group">
              <Ruler size={11} className="text-muted-foreground shrink-0" />
              <span className="flex-1 truncate font-mono text-foreground capitalize">{m.type}</span>
              {m.value !== undefined && (
                <span className="font-mono text-[10px] text-[hsl(var(--brand))]">{m.value.toFixed(2)}</span>
              )}
              <button
                onClick={() => deleteMeasurement(m.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Sections */}
      <div className="p-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Sections</p>
        <p className="text-[10px] text-muted-foreground">Use toolbar to add clipping volumes</p>
      </div>
    </div>
  );
}
