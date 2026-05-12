"use client";

import React, { useCallback } from "react";
import {
  MapPin, Ruler, ArrowUpDown, Pentagon, Package, Triangle, Waypoints,
  BoxSelect, Scissors, Move, Maximize2, X, RotateCcw,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { FloatingPalette } from "./floating-palette";
import type { ActiveTool } from "../../types";
import type { ClipMode } from "../../core/clip-manager";

function ToolBtn({ icon, label, active, onClick, disabled }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors",
        active
          ? "bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        disabled && "opacity-30 cursor-not-allowed",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const MEASURE_TOOLS: { tool: ActiveTool; icon: React.ReactNode; label: string }[] = [
  { tool: "measure-point",    icon: <MapPin size={14} />,      label: "Point" },
  { tool: "measure-distance", icon: <Ruler size={14} />,       label: "Distance" },
  { tool: "measure-height",   icon: <ArrowUpDown size={14} />, label: "Height" },
  { tool: "measure-area",     icon: <Pentagon size={14} />,    label: "Area" },
  { tool: "measure-volume",   icon: <Package size={14} />,     label: "Volume" },
  { tool: "measure-angle",    icon: <Triangle size={14} />,    label: "Angle" },
  { tool: "measure-profile",  icon: <Waypoints size={14} />,   label: "Profile" },
];

export function ToolsPalette() {
  const { activeTool, setActiveTool, clipManager, loader, measurementManager, setMeasurementList, clipBoxEntries } = useViewer();

  const toggle = useCallback((tool: ActiveTool) => {
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);

  const hasClipBox = clipBoxEntries.length > 0;
  const clipMode: ClipMode = clipBoxEntries[0]?.mode ?? "outside";

  const addClipBox = useCallback(() => {
    if (!clipManager || !loader) return;
    const wb = loader.worldBox;
    if (wb.isEmpty()) return;
    const entry = clipManager.addBox(wb.clone());
    clipManager.selectBox(entry.id);
    clipManager.setTransformMode("scale");
  }, [clipManager, loader]);

  const clearClipBox = useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);

  const toggleClipMode = useCallback(() => {
    const next: ClipMode = clipMode === "outside" ? "inside" : "outside";
    for (const b of clipBoxEntries) clipManager?.setBoxMode(b.id, next);
  }, [clipManager, clipBoxEntries, clipMode]);

  return (
    <FloatingPalette title="Tools" icon={<Ruler size={12} />}>
      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1">Measure</p>
      <div className="space-y-0.5">
        {MEASURE_TOOLS.map(def => (
          <ToolBtn key={def.tool} icon={def.icon} label={def.label} active={activeTool === def.tool} onClick={() => toggle(def.tool)} />
        ))}
        <ToolBtn icon={<X size={14} />} label="Clear All" onClick={() => { measurementManager?.clearAll(); setMeasurementList([]); }} />
      </div>

      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-3 mb-1">Clipping</p>
      <div className="space-y-0.5">
        <ToolBtn icon={<BoxSelect size={14} />} label={hasClipBox ? "Remove Clip Box" : "Add Clip Box"} active={hasClipBox} onClick={hasClipBox ? clearClipBox : addClipBox} />
        {hasClipBox && (
          <>
            <ToolBtn icon={<Scissors size={14} />} label={`Mode: ${clipMode === "outside" ? "Keep Inside" : "Keep Outside"}`} onClick={toggleClipMode} />
            <div className="flex gap-1 pl-2">
              <ToolBtn icon={<Move size={12} />} label="Move" onClick={() => {
                const id = clipManager?.getSelectedId() ?? clipBoxEntries[0]?.id;
                if (id) { clipManager?.selectBox(id); clipManager?.setTransformMode("translate"); }
              }} />
              <ToolBtn icon={<Maximize2 size={12} />} label="Scale" onClick={() => {
                const id = clipManager?.getSelectedId() ?? clipBoxEntries[0]?.id;
                if (id) { clipManager?.selectBox(id); clipManager?.setTransformMode("scale"); }
              }} />
            </div>
            <ToolBtn icon={<RotateCcw size={14} />} label="Clear Clips" onClick={clearClipBox} />
          </>
        )}
      </div>
    </FloatingPalette>
  );
}
