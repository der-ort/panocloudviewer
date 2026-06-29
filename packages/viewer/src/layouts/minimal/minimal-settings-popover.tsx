"use client";

import React from "react";
import { Camera, Map, Ruler } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
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

function ToggleRow({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
    >
      <span className={cn("text-white/50", active && "text-[hsl(var(--brand))]")}>
        {icon}
      </span>
      <span className="text-xs text-white/80 flex-1 text-left">{label}</span>
      <div
        className={cn(
          "w-7 h-4 rounded-full transition-colors flex items-center px-0.5",
          active ? "bg-[hsl(var(--brand)/0.6)]" : "bg-white/15",
        )}
      >
        <div
          className={cn(
            "w-3 h-3 rounded-full bg-white transition-transform",
            active && "translate-x-3",
          )}
        />
      </div>
    </button>
  );
}

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
          "backdrop-blur-xl bg-black/30 dark:bg-black/40",
          "border border-white/15 dark:border-white/10",
          "rounded-xl shadow-2xl shadow-black/20",
        )}
      >
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-1">
          Layers
        </p>

        <div className="space-y-0.5">
          <ToggleRow
            icon={<Camera size={14} />}
            label="Panoramas"
            active={showMarkers}
            onClick={() => setShowMarkers(!showMarkers)}
          />
          <ToggleRow
            icon={<Ruler size={14} />}
            label="Measurements"
            active={showMeasurements}
            onClick={() => setShowMeasurements(!showMeasurements)}
          />
          <ToggleRow
            icon={<Map size={14} />}
            label="Minimap"
            active={showMinimap}
            onClick={() => setShowMinimap(!showMinimap)}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-1">
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
                    : "text-white/60 hover:text-white hover:bg-white/10",
                )}
              >
                {cm.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-1">
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
        <div className="border-t border-white/10 pt-2 px-1">
          <p className="text-[9px] font-mono text-white/35 leading-tight" title="Viewer version · build">
            v{PCV_VERSION} · {PCV_BUILD}
          </p>
        </div>
      </div>
    </div>
  );
}
