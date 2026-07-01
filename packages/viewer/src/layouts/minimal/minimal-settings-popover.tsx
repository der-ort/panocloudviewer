"use client";

import React from "react";
import { Camera, Map, Ruler } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { ToggleRow } from "../../ui/toggle-row";
import { PCV_VERSION, PCV_BUILD } from "../../version";
import type { ColorMode } from "@der-ort/pano-cloud-viewer-core";

interface MinimalSettingsPopoverProps {
  onClose?: () => void;
}

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "classification", label: "Classification" },
];

export function MinimalSettingsPopover({ onClose }: MinimalSettingsPopoverProps) {
  const {
    showMarkers,
    setShowMarkers,
    showMinimap,
    setShowMinimap,
    showMeasurements,
    setShowMeasurements,
    colorMode,
    setColorMode,
    pointSize,
    setPointSize,
    loader,
  } = useViewer();

  return (
    <div className="absolute bottom-20 right-8 z-30">
      <div
        className={cn(
          "w-56 p-3 space-y-3",
          "backdrop-blur-xl bg-[hsl(var(--card)/0.72)]",
          "border border-border",
          "rounded-xl shadow-2xl shadow-black/20",
        )}
      >
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-1">
          Layers
        </p>

        <div className="space-y-0.5">
          <ToggleRow
            icon={<Camera size={14} />}
            label="Panoramas"
            active={showMarkers}
            onToggle={() => setShowMarkers(!showMarkers)}
          />
          <ToggleRow
            icon={<Ruler size={14} />}
            label="Measurements"
            active={showMeasurements}
            onToggle={() => setShowMeasurements(!showMeasurements)}
          />
          <ToggleRow
            icon={<Map size={14} />}
            label="Minimap"
            active={showMinimap}
            onToggle={() => setShowMinimap(!showMinimap)}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-1">
            Color
          </p>
          <div className="grid grid-cols-2 gap-1">
            {COLOR_MODES.map((cm) => (
              <button
                key={cm.value}
                onClick={() => {
                  setColorMode(cm.value);
                  loader?.setColorMode(cm.value);
                }}
                className={cn(
                  "text-[10px] py-1 px-2 rounded-lg transition-colors",
                  colorMode === cm.value
                    ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {cm.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-1">
            Point Size
          </p>
          <div className="px-1">
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.1}
              value={pointSize}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setPointSize(v);
                loader?.setPointSize(v);
              }}
              className="pcv-slider w-full"
            />
          </div>
        </div>

        {/* Build/version — confirm the deployed viewer build */}
        <div className="border-t border-border pt-2 px-1">
          <p className="text-[9px] font-mono text-muted-foreground/60 leading-tight" title="Viewer version · build">
            v{PCV_VERSION} · {PCV_BUILD}
          </p>
        </div>
      </div>
    </div>
  );
}
