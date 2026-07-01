"use client";

import React from "react";
import { Camera, Ruler, Map, ChevronRight, Tag } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useData } from "../../providers/data-provider";
import { ClassificationPanel } from "./classification-panel";
import { ToggleRow as LayerRow } from "../../ui/toggle-row";

/**
 * Layers panel — one place to toggle every overlay (panoramas, measurements,
 * minimap). Replaces the scattered view-toggles that used to live
 * in the toolbar and the quick-settings popovers.
 */
export function LayersPanel() {
  const {
    showMarkers, setShowMarkers,
    showMeasurements, setShowMeasurements,
    showMinimap, setShowMinimap,
  } = useViewer();
  const { cameras } = useData();
  const hasPanoramas = cameras.length > 0;

  return (
    <div className="p-3 space-y-1 overflow-y-auto h-full">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-1 mb-1">
        Layers
      </p>

      {hasPanoramas && (
        <LayerRow
          icon={<Camera size={15} />}
          label="Panoramas"
          active={showMarkers}
          onToggle={() => setShowMarkers(!showMarkers)}
        />
      )}
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

      {/* Classification — collapsed sub-section (was its own sidebar tab). */}
      <ClassificationSection />
    </div>
  );
}

/** Collapsible "Classification" block folded into the Layers panel. */
function ClassificationSection() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-1 border-t border-border pt-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left"
      >
        <span className="text-muted-foreground"><Tag size={15} /></span>
        <span className="flex-1 text-xs text-foreground">Classification</span>
        <ChevronRight size={14} className={cn("text-muted-foreground/60 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto">
          <ClassificationPanel />
        </div>
      )}
    </div>
  );
}
