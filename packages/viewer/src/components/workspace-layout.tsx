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

/**
 * Glass card wrapper — matches the minimal-toolbar glass style.
 * Used for all floating UI clusters.
 */
export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "backdrop-blur-xl bg-black/30 dark:bg-black/40",
        "border border-white/15 dark:border-white/10",
        "rounded-2xl shadow-2xl shadow-black/20",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface WorkspaceLayoutProps {
  className?: string;
}

export function WorkspaceLayout({ className }: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renderSettingsOpen, setRenderSettingsOpen] = useState(false);

  const { fps, pointBudget, activeTool, selectedCamera, uiMode } = useViewer();
  const { metadata } = useData();
  const t = useLocale().viewport;

  const isPro = uiMode === "professional";

  return (
    <div className={cn("relative h-full w-full bg-[hsl(var(--background))] text-foreground overflow-hidden", className)}>

      {/* ── Viewport fills the entire area ──────────────────────────────── */}
      <div className="absolute inset-0">
        <Suspense fallback={<ViewportFallback />}>
          <Viewport />
        </Suspense>
      </div>

      {/* ── Pano viewer overlay ─────────────────────────────────────────── */}
      {selectedCamera && <PanoViewer />}

      {/* ── Rendering settings panel overlay ────────────────────────────── */}
      <RenderingSettings open={renderSettingsOpen} onClose={() => setRenderSettingsOpen(false)} />

      {/* ── Top floating toolbar ────────────────────────────────────────── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <GlassCard className="pointer-events-auto">
          <MainToolbar
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            sidebarOpen={sidebarOpen}
            onToggleRenderSettings={isPro ? () => setRenderSettingsOpen(o => !o) : undefined}
            renderSettingsOpen={renderSettingsOpen}
          />
        </GlassCard>
      </div>

      {/* ── Left floating tool rail ──────────────────────────────────────── */}
      {/* Positioned wrapper with explicit top/bottom gives the GlassCard a height anchor */}
      <div className="absolute left-3 top-14 bottom-14 z-30 pointer-events-none flex items-center">
        <GlassCard className="pointer-events-auto overflow-y-auto max-h-full">
          <ToolRail />
        </GlassCard>
      </div>

      {/* ── Right collapsible sidebar ───────────────────────────────────── */}
      <div
        className={cn(
          "absolute top-3 bottom-10 right-3 z-30",
          "transition-all duration-200",
          sidebarOpen ? "w-72 xl:w-80" : "w-0 overflow-hidden",
        )}
      >
        {sidebarOpen && (
          <GlassCard className="h-full overflow-hidden">
            <Sidebar />
          </GlassCard>
        )}
      </div>

      {/* ── Bottom status strip ─────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <GlassCard className="pointer-events-none">
          <div className="px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-white/50 select-none">
            {metadata && <span>{t.statusPts(metadata.points / 1e6)}</span>}
            <span>{t.statusBudget(pointBudget / 1e6)}</span>
            <span>{t.statusFps(fps)}</span>
            {activeTool !== "none" && (
              <span className="text-[hsl(var(--brand))]">{activeTool}</span>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
