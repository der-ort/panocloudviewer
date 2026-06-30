"use client";

import React, { useState, lazy, Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { useViewer } from "../providers/viewer-provider";
import { useData } from "../providers/data-provider";
import { useLocale } from "../i18n/locale-context";
import { MainToolbar } from "./toolbar/main-toolbar";
import { ToolRail } from "./toolbar/tool-rail";
import { ClipToolbar } from "./toolbar/clip-toolbar";
import { Sidebar } from "./sidebar/sidebar";
import { PanoViewer } from "./overlays/pano-viewer";
import { RenderingSettings } from "./overlays/rendering-settings";

/**
 * Inline style that scales UI chrome via the `--pcv-scale` CSS custom property
 * (set on the `.pcv` root by `PanoCloudViewer`'s `uiScale` prop). Applied to
 * non-viewport chrome containers only — the viewport/canvas stays at native size.
 * `zoom` isn't in React's CSSProperties, so the object is cast.
 */
const chromeScale = { zoom: "var(--pcv-scale, 1)" } as React.CSSProperties;

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
        "backdrop-blur-xl bg-[hsl(var(--card)/0.72)]",
        "border border-border",
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

  const { fps, pointBudget, activeTool, selectedCamera, uiMode, clipBoxEntries } = useViewer();
  const { metadata } = useData();
  const t = useLocale().viewport;

  const isPro = uiMode === "professional";

  return (
    <div
      className={cn(
        "relative h-full w-full bg-[hsl(var(--background))] text-foreground overflow-hidden",
        // Publish the minimap's right offset so it sits just left of the sidebar
        // when open and snaps back to the edge when closed (the minimap, inside
        // the viewport, consumes `--pcv-minimap-right`).
        sidebarOpen
          ? "[--pcv-minimap-right:19.25rem] xl:[--pcv-minimap-right:21.25rem]"
          : "[--pcv-minimap-right:0.75rem]",
        className,
      )}
    >

      {/* ── Viewport fills the entire area ──────────────────────────────── */}
      <div className="absolute inset-0">
        <Suspense fallback={<ViewportFallback />}>
          <Viewport />
        </Suspense>
      </div>

      {/* ── Pano viewer overlay ─────────────────────────────────────────── */}
      {selectedCamera && <PanoViewer />}

      {/* ── Unified Settings panel (top-left) ───────────────────────────── */}
      <RenderingSettings open={renderSettingsOpen} onClose={() => setRenderSettingsOpen(false)} />

      {/* ── Top floating toolbar ────────────────────────────────────────── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={chromeScale}>
        <GlassCard className="pointer-events-auto">
          <MainToolbar
            onToggleRenderSettings={isPro ? () => setRenderSettingsOpen(o => !o) : undefined}
            renderSettingsOpen={renderSettingsOpen}
          />
        </GlassCard>
      </div>

      {/* ── Left floating tool rail ──────────────────────────────────────── */}
      {/* Positioned wrapper with explicit top/bottom gives the GlassCard a height anchor */}
      <div className="absolute left-3 top-14 bottom-14 z-30 pointer-events-none flex items-center" style={chromeScale}>
        <GlassCard className="pointer-events-auto overflow-y-auto max-h-full">
          <ToolRail />
        </GlassCard>
      </div>

      {/* ── Right collapsible sidebar ───────────────────────────────────── */}
      {/* top-16 keeps the sidebar clear of the top toolbar so it stays fully
          visible. The panel slides off the right edge when collapsed, and its
          chevron handle rides the panel's left edge so it moves out with it. */}
      <div
        className={cn(
          "absolute top-16 bottom-10 right-3 z-30 w-72 xl:w-80",
          "transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+0.75rem)]",
        )}
        style={chromeScale}
      >
        {/* Chevron handle on the sidebar's left edge — the only sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -left-7 z-40",
            "flex items-center justify-center w-7 h-16 rounded-l-lg",
            "backdrop-blur-xl bg-[hsl(var(--card)/0.85)]",
            "border border-r-0 border-border",
            "shadow-2xl shadow-black/30",
            "text-foreground hover:text-[hsl(var(--brand))] hover:bg-[hsl(var(--card))] transition-colors",
          )}
        >
          {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <GlassCard className="h-full overflow-hidden">
          <Sidebar />
        </GlassCard>
      </div>

      {/* ── Clip management toolbar (Pro + has boxes) ───────────────────── */}
      {isPro && clipBoxEntries.length > 0 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={chromeScale}>
          <GlassCard className="pointer-events-auto">
            <ClipToolbar />
          </GlassCard>
        </div>
      )}

      {/* ── Bottom status strip ─────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={chromeScale}>
        <GlassCard className="pointer-events-none">
          <div className="px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-muted-foreground select-none">
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
