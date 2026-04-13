"use client";

import React, { useState, lazy, Suspense } from "react";
import { cn } from "../lib/utils";
import { useViewer } from "../providers/viewer-provider";
import { useData } from "../providers/data-provider";
import { MainToolbar } from "./toolbar/main-toolbar";
import { Sidebar } from "./sidebar/sidebar";
import { PanoViewer } from "./overlays/pano-viewer";

// Viewport is lazy-loaded so it only runs in browser environments
const Viewport = lazy(() => import("./viewport").then(m => ({ default: m.Viewport })));

function ViewportFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">Initialising renderer…</p>
      </div>
    </div>
  );
}

interface WorkspaceLayoutProps {
  className?: string;
}

export function WorkspaceLayout({ className }: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { fps, pointBudget, activeTool, selectedCamera } = useViewer();
  const { metadata } = useData();

  return (
    <div className={cn("flex flex-col h-full w-full bg-[hsl(var(--background))] text-foreground overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="shrink-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--toolbar-bg,var(--card)))] z-20">
        <MainToolbar onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Viewport */}
        <div className="flex-1 relative overflow-hidden">
          <Suspense fallback={<ViewportFallback />}>
            <Viewport />
          </Suspense>
          {/* Panorama overlay — renders on top of viewport */}
          {selectedCamera && <PanoViewer />}
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
        {metadata && <span>{(metadata.points / 1e6).toFixed(1)}M pts</span>}
        <span>Budget: {(pointBudget / 1e6).toFixed(1)}M</span>
        <span>{fps} fps</span>
        {activeTool !== "none" && (
          <span className="text-[hsl(var(--brand))]">{activeTool}</span>
        )}
      </div>
    </div>
  );
}
