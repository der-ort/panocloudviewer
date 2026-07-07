"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, pcvChromeScaleStyle as chromeScale } from "../lib/utils";
import { useViewer } from "../providers/viewer-provider";
import { useData } from "../providers/data-provider";
import { useLocale } from "../i18n/locale-context";
import { useIsMobile } from "../hooks/use-is-mobile";
import { MainToolbar } from "./toolbar/main-toolbar";
import { ToolRail } from "./toolbar/tool-rail";
import { ClipToolbar } from "./toolbar/clip-toolbar";
import { Sidebar } from "./sidebar/sidebar";
import { PanoViewer } from "./overlays/pano-viewer";
import { RenderingSettings } from "./overlays/rendering-settings";
import { StatusFps } from "./status-fps";

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
  const isMobile = useIsMobile();
  // Sidebar starts closed on phones/small tablets so the viewport is usable.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768,
  );
  const [renderSettingsOpen, setRenderSettingsOpen] = useState(false);

  const { pointBudget, activeTool, selectedCamera, uiMode, clipBoxEntries } = useViewer();
  const { metadata } = useData();
  const t = useLocale().viewport;

  const isPro = uiMode === "professional";

  // Selecting a measurement tool opens the sidebar (which auto-switches to the
  // measurements tab) — but not on mobile, where it would cover the viewport.
  useEffect(() => {
    if (activeTool.startsWith("measure-") && !isMobile) setSidebarOpen(true);
  }, [activeTool, isMobile]);

  return (
    <div
      className={cn(
        "relative h-full w-full bg-[hsl(var(--background))] text-foreground overflow-hidden",
        // The minimap sits bottom-left (the axis gizmo is bottom-right). Publish
        // `--pcv-minimap-left` so it clears the left tool rail (~0.75rem + its
        // 2.5rem width + a gap) and the notch inset on mobile. Being on the left,
        // it never overlaps the right-hand sidebar in any state.
        "[--pcv-minimap-left:calc(3.75rem+env(safe-area-inset-left))]",
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

      {/* ── Top floating toolbar (caps to screen width on mobile, scrolls) ─ */}
      {/* `env(safe-area-inset-top)` keeps it clear of the notch / OS status bar
          (resolves to 0 on desktop and when the host omits viewport-fit=cover). */}
      <div className="absolute top-[calc(0.75rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[calc(100vw-1.5rem)]" style={chromeScale}>
        <GlassCard className="pointer-events-auto max-w-full overflow-hidden">
          <MainToolbar
            onToggleRenderSettings={isPro ? () => setRenderSettingsOpen(o => !o) : undefined}
            renderSettingsOpen={renderSettingsOpen}
          />
        </GlassCard>
      </div>

      {/* ── Left floating tool rail ──────────────────────────────────────── */}
      {/* Positioned wrapper with explicit top/bottom gives the GlassCard a height anchor.
          Safe-area insets keep the rail off the notch / home indicator on mobile. */}
      <div className="absolute left-[calc(0.75rem+env(safe-area-inset-left))] top-[calc(3.5rem+env(safe-area-inset-top))] bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 pointer-events-none flex items-center" style={chromeScale}>
        <GlassCard className="pointer-events-auto overflow-y-auto max-h-full">
          <ToolRail />
        </GlassCard>
      </div>

      {/* ── Mobile backdrop (tap to close the full-screen sidebar) ──────── */}
      {isMobile && sidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Right collapsible sidebar ───────────────────────────────────── */}
      {/* On md+ it sits beside the viewport and slides off the right edge when
          collapsed; on mobile it's a full-bleed overlay over the viewport. */}
      <div
        className={cn(
          "absolute z-30 transition-transform duration-200",
          // Mobile: full-bleed overlay inset from the notch / home indicator so
          // its scroll area isn't hidden by the OS status bar or browser nav bar.
          "top-[calc(3.5rem+env(safe-area-inset-top))] md:top-16",
          // md+: stop ~9rem above the bottom so the bottom-right axis gizmo
          // (native ViewHelper, 128px corner) stays fully clear of the sidebar.
          // Mobile: full-bleed overlay (it covers the gizmo intentionally when open).
          "bottom-[env(safe-area-inset-bottom)] md:bottom-36",
          "right-[env(safe-area-inset-right)] md:right-3",
          "w-full max-w-sm md:w-72 xl:w-80",
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
        <div className="absolute bottom-[calc(3rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={chromeScale}>
          <GlassCard className="pointer-events-auto">
            <ClipToolbar />
          </GlassCard>
        </div>
      )}

      {/* ── Bottom status strip (hidden on mobile to free screen space) ──── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden md:block" style={chromeScale}>
        <GlassCard className="pointer-events-none">
          <div className="px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-muted-foreground select-none">
            {metadata && <span>{t.statusPts(metadata.points / 1e6)}</span>}
            <span>{t.statusBudget(pointBudget / 1e6)}</span>
            <StatusFps />

            {activeTool !== "none" && (
              <span className="text-[hsl(var(--brand))]">{activeTool}</span>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
