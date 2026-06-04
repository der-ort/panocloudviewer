"use client";

import React, { useState, useCallback } from "react";
import {
  Orbit,
  Navigation,
  Globe,
  Maximize,
  Ruler,
  ArrowUpDown,
  Pentagon,
  Settings,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { MinimalSettingsPopover } from "./minimal-settings-popover";
import type { ActiveTool } from "@der-ort/pano-cloud-viewer-core";

function GlassButton({
  icon,
  active,
  onClick,
  title,
  className,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
        active
          ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))] shadow-[0_0_12px_hsl(var(--brand)/0.3)]"
          : "text-white/70 hover:text-white hover:bg-white/10",
        className,
      )}
    >
      {icon}
    </button>
  );
}

function Separator() {
  return <div className="w-px h-6 bg-white/15 mx-0.5" />;
}

export function MinimalToolbar() {
  const {
    activeTool,
    setActiveTool,
    navigationMode,
    setNavigationMode,
    sceneManager,
    loader,
  } = useViewer();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleMeasure = useCallback(
    (tool: ActiveTool) => {
      setActiveTool(activeTool === tool ? "none" : tool);
    },
    [activeTool, setActiveTool],
  );

  const fitToView = useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);

  const isMeasuring = activeTool.startsWith("measure-");

  return (
    <>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div
          className={cn(
            "flex items-center gap-0.5 px-2 py-1.5",
            "backdrop-blur-xl bg-black/30 dark:bg-black/40",
            "border border-white/15 dark:border-white/10",
            "rounded-2xl shadow-2xl shadow-black/20",
          )}
        >
          <GlassButton
            icon={<Orbit size={16} />}
            title="Orbit"
            active={navigationMode === "orbit"}
            onClick={() => setNavigationMode("orbit")}
          />
          <GlassButton
            icon={<Navigation size={16} />}
            title="Fly"
            active={navigationMode === "fly"}
            onClick={() => setNavigationMode("fly")}
          />
          <GlassButton
            icon={<Globe size={16} />}
            title="Earth"
            active={navigationMode === "earth"}
            onClick={() => setNavigationMode("earth")}
          />

          <Separator />

          <GlassButton
            icon={<Maximize size={16} />}
            title="Fit to view"
            onClick={fitToView}
          />

          <Separator />

          <GlassButton
            icon={<Ruler size={16} />}
            title="Distance"
            active={activeTool === "measure-distance"}
            onClick={() => toggleMeasure("measure-distance")}
          />
          <GlassButton
            icon={<ArrowUpDown size={16} />}
            title="Height"
            active={activeTool === "measure-height"}
            onClick={() => toggleMeasure("measure-height")}
          />
          <GlassButton
            icon={<Pentagon size={16} />}
            title="Area"
            active={activeTool === "measure-area"}
            onClick={() => toggleMeasure("measure-area")}
          />

          {isMeasuring && (
            <>
              <Separator />
              <GlassButton
                icon={<X size={16} />}
                title="Cancel measurement"
                onClick={() => setActiveTool("none")}
                className="text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
              />
            </>
          )}

          <Separator />

          <GlassButton
            icon={<Settings size={16} />}
            title="View settings"
            active={settingsOpen}
            onClick={() => setSettingsOpen(!settingsOpen)}
          />
        </div>
      </div>

      {settingsOpen && (
        <MinimalSettingsPopover onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
}
