"use client";

import React from "react";
import { Trash2, Download } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { formatLength, formatArea, formatVolume, formatAngle, formatCoord, exportMeasurementsCSV } from "../../lib/utils";
import { InlineEdit } from "./inline-edit";
import type { Measurement } from "@der-ort/pano-cloud-viewer-core";

// Resolved at runtime inside the component — see TYPE_LABELS below
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

export function MeasurementsPanel() {
  const { measurementList, measurementManager, setMeasurementList } = useViewer();
  const t = useLocale().measurementsPanel;
  const TYPE_LABELS: Record<string, string> = {
    point: t.typePoint, distance: t.typeDistance, height: t.typeHeight,
    area: t.typeArea, volume: t.typeVolume, angle: t.typeAngle, profile: t.typeProfile,
  };

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

  const handleRename = (id: string, name: string) => {
    measurementManager?.rename(id, name);
    setMeasurementList(prev => prev.map(m => m.id === id ? { ...m, label: name } : m));
  };

  if (measurementList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2">
        <p className="text-xs text-muted-foreground">{t.noMeasurements}</p>
        <p className="text-[10px] text-muted-foreground">{t.useMeasureToolHint}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-[hsl(var(--border))] shrink-0">
        <span className="text-[10px] font-mono text-muted-foreground">{t.measurementCount(measurementList.length)}</span>
        <div className="flex items-center gap-2">
          <button onClick={downloadCSV} title={t.downloadCsv} className="text-muted-foreground hover:text-[hsl(var(--brand))] text-[10px] flex items-center gap-1 transition-colors">
            <Download size={10} /> {t.csv}
          </button>
          <button onClick={clearAll} title={t.clearAll} className="text-muted-foreground hover:text-destructive text-[10px] flex items-center gap-1 transition-colors">
            <Trash2 size={10} /> {t.clearAll}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {measurementList.map((m) => (
          <div key={m.id} className="flex items-center gap-2 px-2 py-2 border-b border-[hsl(var(--border)/0.4)] hover:bg-muted group transition-colors">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.color ?? "hsl(var(--brand))" }} />
            <div className="flex-1 min-w-0">
              <InlineEdit
                value={m.label}
                onSave={(name) => handleRename(m.id, name)}
                activateOn="click"
                title="Click to rename"
                displayClassName="text-[10px] font-semibold text-foreground cursor-pointer hover:text-[hsl(var(--brand))] transition-colors truncate"
                inputClassName="text-[10px] font-semibold text-foreground bg-muted/60 border border-[hsl(var(--border))] rounded px-1 py-0 w-full outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
              />
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
