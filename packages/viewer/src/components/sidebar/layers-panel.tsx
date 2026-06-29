"use client";

import React from "react";
import { Camera, Ruler, Map, Globe, ChevronRight, Tag } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { ClassificationPanel } from "./classification-panel";

/** A single layer row — icon, label, and an on/off switch (or a disabled hint). */
function LayerRow({
  icon,
  label,
  active,
  onToggle,
  disabled,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      title={hint ?? label}
      className={cn(
        "flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-colors text-left",
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10",
      )}
    >
      <span className={cn("text-white/50", active && !disabled && "text-[hsl(var(--brand))]")}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs text-white/80 truncate">{label}</span>
        {hint && <span className="block text-[10px] text-white/35 truncate">{hint}</span>}
      </span>
      <div
        className={cn(
          "w-7 h-4 rounded-full transition-colors flex items-center px-0.5 shrink-0",
          active && !disabled ? "bg-[hsl(var(--brand)/0.6)]" : "bg-white/15",
        )}
      >
        <div
          className={cn(
            "w-3 h-3 rounded-full bg-white transition-transform",
            active && !disabled && "translate-x-3",
          )}
        />
      </div>
    </button>
  );
}

/**
 * Layers panel — one place to toggle every overlay (panoramas, measurements,
 * minimap, map basemap). Replaces the scattered view-toggles that used to live
 * in the toolbar and the quick-settings popovers.
 */
export function LayersPanel() {
  const {
    showMarkers, setShowMarkers,
    showMeasurements, setShowMeasurements,
    showMinimap, setShowMinimap,
    showBasemap, setShowBasemap,
    basemapAvailable,
  } = useViewer();

  return (
    <div className="p-3 space-y-1 overflow-y-auto h-full">
      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-1 mb-1">
        Layers
      </p>

      <LayerRow
        icon={<Camera size={15} />}
        label="Panoramas"
        active={showMarkers}
        onToggle={() => setShowMarkers(!showMarkers)}
      />
      <LayerRow
        icon={<Ruler size={15} />}
        label="Measurements"
        active={showMeasurements}
        onToggle={() => setShowMeasurements(!showMeasurements)}
      />
      <LayerRow
        icon={<Map size={15} />}
        label="Minimap"
        active={showMinimap}
        onToggle={() => setShowMinimap(!showMinimap)}
      />
      <LayerRow
        icon={<Globe size={15} />}
        label="Map basemap"
        active={showBasemap}
        onToggle={() => setShowBasemap(!showBasemap)}
        disabled={!basemapAvailable}
        hint={basemapAvailable ? undefined : "Requires a georeferenced cloud or basemap config"}
      />

      {/* Classification — collapsed sub-section (was its own sidebar tab). */}
      <ClassificationSection />
    </div>
  );
}

/** Collapsible "Classification" block folded into the Layers panel. */
function ClassificationSection() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-1 border-t border-white/10 pt-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
      >
        <span className="text-white/50"><Tag size={15} /></span>
        <span className="flex-1 text-xs text-white/80">Classification</span>
        <ChevronRight size={14} className={cn("text-white/40 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto">
          <ClassificationPanel />
        </div>
      )}
    </div>
  );
}
