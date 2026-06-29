"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { PCV_VERSION, PCV_BUILD } from "../../version";
import type { ColorMode } from "@der-ort/pano-cloud-viewer-core";

interface QuickSettingsPopoverProps {
  onClose?: () => void;
}

const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "classification", label: "Classification" },
];

/**
 * Compact "professional mode" quick-settings popover. Mirrors the minimal-mode
 * settings popover (Panoramas + Minimap toggles, color-mode grid, point-size
 * slider) but is positioned top-right just under the main toolbar. The full
 * advanced rendering-settings modal remains available separately.
 */
export function QuickSettingsPopover({ onClose: _onClose }: QuickSettingsPopoverProps) {
  const {
    colorMode,
    setColorMode,
    pointSize,
    setPointSize,
    loader,
  } = useViewer();

  return (
    <div className="absolute top-16 right-3 z-40">
      <div
        className={cn(
          "w-56 p-3 space-y-3",
          "backdrop-blur-xl bg-black/30 dark:bg-black/40",
          "border border-white/15 dark:border-white/10",
          "rounded-xl shadow-2xl shadow-black/20",
        )}
      >
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-1">
          Display Settings
        </p>
        {/* Layer toggles (panoramas / minimap / measurements / map) live in the
            sidebar's "Layers" tab — this popover is display-only. */}

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
