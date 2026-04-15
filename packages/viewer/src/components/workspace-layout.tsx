"use client";

import React, { useState, lazy, Suspense } from "react";
import { cn } from "../lib/utils";
import { useViewer } from "../providers/viewer-provider";
import { useData } from "../providers/data-provider";
import { useLocale } from "../i18n/locale-context";
import { MainToolbar } from "./toolbar/main-toolbar";
import { ToolRail } from "./toolbar/tool-rail";
import { Sidebar } from "./sidebar/sidebar";
import { PanoViewer } from "./overlays/pano-viewer";
import { RenderingSettings } from "./overlays/rendering-settings";

const Viewport = lazy(() => import("./viewport").then(m => ({ default: m.Viewport })));

function ViewportFallback() {
  const t = useLocale().viewport;
  return (
    <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">{t.initialisingRenderer}</p>
      </div>
    </div>
  );
}

interface WorkspaceLayoutProps {
  className?: string;
}

export function WorkspaceLayout({ className }: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renderSettingsOpen, setRenderSettingsOpen] = useState(false);
  const { fps, pointBudget, activeTool, selectedCamera } = useViewer();
  const { metadata } = useData();
  const t = useLocale().viewport;

  return (
    <div className={cn("flex flex-col h-full w-full bg-[hsl(var(--background))] text-foreground overflow-hidden", className)}>
      {/* Top toolbar — logo, views, display, toggles */}
      <div className="shrink-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--toolbar-bg,var(--card)))] z-20">
        <MainToolbar
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          sidebarOpen={sidebarOpen}
          onToggleRenderSettings={() => setRenderSettingsOpen(o => !o)}
          renderSettingsOpen={renderSettingsOpen}
        />
      </div>

      {/* Main content: tool rail + viewport + right sidebar */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left tool rail */}
        <ToolRail />

        {/* Viewport */}
        <div className="flex-1 relative overflow-hidden">
          <Suspense fallback={<ViewportFallback />}>
            <Viewport />
          </Suspense>
          {selectedCamera && <PanoViewer />}
          <RenderingSettings open={renderSettingsOpen} onClose={() => setRenderSettingsOpen(false)} />
        </div>

        {/* Right sidebar */}
        <div
          className={cn(
            "border-l border-[hsl(var(--border))] shrink-0 overflow-hidden transition-all duration-200",
            sidebarOpen ? "w-72 xl:w-80" : "w-0"
          )}
        >
          {sidebarOpen && <Sidebar />}
        </div>
      </div>

      {/* Status bar */}
      <div className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
        {metadata && <span>{t.statusPts(metadata.points / 1e6)}</span>}
        <span>{t.statusBudget(pointBudget / 1e6)}</span>
        <span>{t.statusFps(fps)}</span>
        {activeTool !== "none" && (
          <span className="text-[hsl(var(--brand))]">{activeTool}</span>
        )}
      </div>
    </div>
  );
}
