"use client";

import React from "react";
import { Eye, Camera, Map, Orbit, Navigation, Globe, Box, Square } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { FloatingPalette } from "./floating-palette";

function ToggleRow({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 w-full px-1 py-1 rounded text-xs hover:bg-muted/40 transition-colors">
      <span className={cn("text-muted-foreground", active && "text-[hsl(var(--brand))]")}>{icon}</span>
      <span className="flex-1 text-left text-muted-foreground">{label}</span>
      <div className={cn("w-6 h-3.5 rounded-full transition-colors flex items-center px-0.5", active ? "bg-[hsl(var(--brand)/0.5)]" : "bg-muted/60")}>
        <div className={cn("w-2.5 h-2.5 rounded-full bg-foreground/80 transition-transform", active && "translate-x-2.5")} />
      </div>
    </button>
  );
}

function ModeBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] transition-colors",
      active ? "bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
    )}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function ViewSettingsPalette() {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap, navigationMode, setNavigationMode, projection, setProjection } = useViewer();

  return (
    <FloatingPalette title="View" icon={<Eye size={12} />} defaultCollapsed>
      <ToggleRow icon={<Camera size={13} />} label="Panoramas" active={showMarkers} onClick={() => setShowMarkers(!showMarkers)} />
      <ToggleRow icon={<Map size={13} />} label="Minimap" active={showMinimap} onClick={() => setShowMinimap(!showMinimap)} />

      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2 mb-1">Navigation</p>
      <div className="flex gap-1">
        <ModeBtn icon={<Orbit size={14} />} label="Orbit" active={navigationMode === "orbit"} onClick={() => setNavigationMode("orbit")} />
        <ModeBtn icon={<Navigation size={14} />} label="Fly" active={navigationMode === "fly"} onClick={() => setNavigationMode("fly")} />
        <ModeBtn icon={<Globe size={14} />} label="Earth" active={navigationMode === "earth"} onClick={() => setNavigationMode("earth")} />
      </div>

      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2 mb-1">Projection</p>
      <div className="flex gap-1">
        <ModeBtn icon={<Box size={14} />} label="Perspective" active={projection === "perspective"} onClick={() => setProjection("perspective")} />
        <ModeBtn icon={<Square size={14} />} label="Ortho" active={projection === "orthographic"} onClick={() => setProjection("orthographic")} />
      </div>
    </FloatingPalette>
  );
}
