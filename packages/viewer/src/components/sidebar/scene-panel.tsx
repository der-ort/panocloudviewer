"use client";

import React from "react";
import { CloudCog, Ruler, BoxSelect, Eye, EyeOff, Trash2, Scissors } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";

export function ScenePanel() {
  const { measurementList, measurementManager, setMeasurementList, loader, clipManager, clipBoxEntries, selectedClipBoxId, uiMode } = useViewer();
  const t = useLocale().scenePanel;

  // The section (clipping) tool is Professional-only — it's gated the same way
  // in the tool rail — so don't advertise "Sections" in the sidebar in Lite mode.
  const isPro = uiMode === "professional";

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
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{t.pointClouds}</p>
        {loader?.getPointCloud() ? (
          <div className="flex items-center gap-2 py-1">
            <CloudCog size={12} className="text-[hsl(var(--brand))] shrink-0" />
            <span className="flex-1 truncate font-mono text-foreground">pointcloud</span>
          </div>
        ) : (
          <p className="text-muted-foreground text-[10px]">{t.noCloudLoaded}</p>
        )}
      </div>

      {/* Measurements */}
      <div className="p-2 border-b border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t.measurements}</p>
          {measurementList.length > 0 && (
            <button onClick={clearAll} title={t.clearAll} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={11} />
            </button>
          )}
        </div>
        {measurementList.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">{t.none}</p>
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

      {/* Clip Boxes — Professional only (the section tool is disabled in Lite) */}
      {isPro && (
      <div className="p-2">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t.sections}</p>
          {clipBoxEntries.length > 0 && (
            <button onClick={() => clipManager?.clear()} title={t.clearAll} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={11} />
            </button>
          )}
        </div>
        {clipBoxEntries.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">{t.sectionHint}</p>
        ) : (
          clipBoxEntries.map(box => (
            <div
              key={box.id}
              className={`flex items-center gap-1 py-0.5 group rounded px-0.5 ${selectedClipBoxId === box.id ? "bg-[hsl(var(--brand)/0.1)]" : ""}`}
            >
              <button
                onClick={() => clipManager?.setBoxVisible(box.id, !box.visible)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={box.visible ? "Hide" : "Show"}
              >
                {box.visible ? <Eye size={11} /> : <EyeOff size={11} />}
              </button>
              <BoxSelect size={11} className="text-[hsl(var(--brand))] shrink-0" />
              <button
                onClick={() => clipManager?.selectBox(selectedClipBoxId === box.id ? null : box.id)}
                className="flex-1 truncate font-mono text-foreground text-left hover:text-[hsl(var(--brand))] transition-colors"
              >
                {box.name}
              </button>
              <button
                onClick={() => clipManager?.setModeAll(box.mode === "outside" ? "inside" : "outside")}
                title={box.mode === "outside" ? "Keep inside (all)" : "Keep outside (all)"}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <Scissors size={10} />
              </button>
              <span className="text-[8px] text-muted-foreground font-mono w-6 text-center">
                {box.mode === "outside" ? "OUT" : "IN"}
              </span>
              <button
                onClick={() => clipManager?.removeBox(box.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))
        )}
        {clipBoxEntries.length > 1 && (
          <p className="text-[9px] text-muted-foreground mt-1 italic">{t.clipModeNote}</p>
        )}
      </div>
      )}
    </div>
  );
}
