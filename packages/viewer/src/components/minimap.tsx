"use client";

import React from "react";
import { Map } from "lucide-react";
import { cn } from "../lib/utils";
import { useViewer } from "../providers/viewer-provider";

interface MinimapProps {
  className?: string;
}

/** Minimap toggle button (the canvas is rendered inside Viewport for WebGL sharing) */
export function MinimapToggle({ className }: MinimapProps) {
  const { showMinimap, setShowMinimap } = useViewer();
  return (
    <button
      title={showMinimap ? "Hide minimap" : "Show minimap"}
      onClick={() => setShowMinimap(!showMinimap)}
      className={cn(
        "p-1.5 rounded transition-colors",
        showMinimap
          ? "text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Map size={14} />
    </button>
  );
}
