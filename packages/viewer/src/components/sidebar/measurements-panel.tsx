"use client";

import React from "react";
import { Trash2, Download } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { formatLength, formatArea, formatVolume, formatAngle, formatCoord, exportMeasurementsCSV } from "../../lib/utils";
import type { Measurement } from "../../types";

function formatValue(m: Measurement): string {
  if (m.value === undefined) return "—";
  switch (m.type) {
    case "distance": case "height": return formatLength(m.value);
    case "area":     return formatArea(m.value);
    case "volume":   return formatVolume(m.value);
    case "angle":    return formatAngle(m.value);
    case "point":
      if (m.points[0]) return formatCoord(m.points[0].x, m.points[0].y, m.points[0].z);
      return "—";
    default: return m.value.toFixed(3);
  }
}

const TYPE_LABELS: Record<string, string> = {
  point: "Point", distance: "Distance", height: "Height",
  area: "Area", volume: "Volume", angle: "Angle", profile: "Profile",
};

export function MeasurementsPanel() {
  const { measurementList, measurementManager, setMeasurementList } = useViewer();

  const del = (id: string) => {
    measurementManager?.remove(id);
    setMeasurementList(prev => prev.filter(m => m.id !== id));
  };

  const clearAll = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };

  const downloadCSV = () => {
    const csv = exportMeasurementsCSV(measurementList);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (measurementList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2">
        <p className="text-xs text-muted-foreground">No measurements yet.</p>
        <p className="text-[10px] text-muted-foreground">Use the toolbar to start measuring.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-[hsl(var(--border))] shrink-0">
        <span className="text-[10px] font-mono text-muted-foreground">{measurementList.length} measurements</span>
        <div className="flex items-center gap-2">
          <button onClick={downloadCSV} title="Download CSV" className="text-muted-foreground hover:text-[hsl(var(--brand))] text-[10px] flex items-center gap-1 transition-colors">
            <Download size={10} /> CSV
          </button>
          <button onClick={clearAll} title="Clear all" className="text-muted-foreground hover:text-destructive text-[10px] flex items-center gap-1 transition-colors">
            <Trash2 size={10} /> Clear all
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {measurementList.map((m, i) => (
          <div key={m.id} className="flex items-center gap-2 px-2 py-2 border-b border-[hsl(var(--border)/0.4)] hover:bg-muted group transition-colors">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.color ?? "hsl(var(--brand))" }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-foreground">{TYPE_LABELS[m.type] ?? m.type} #{i + 1}</p>
              <p className="text-[10px] font-mono text-[hsl(var(--brand))]">{formatValue(m)}</p>
            </div>
            <button
              onClick={() => del(m.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
