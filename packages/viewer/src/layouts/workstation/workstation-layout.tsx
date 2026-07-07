"use client";

import React from "react";
import { pcvChromeScaleStyle as chromeScale } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useData } from "../../providers/data-provider";
import { StatusFps } from "../../components/status-fps";
import { CollapsibleSidebar } from "./collapsible-sidebar";
import { ToolsPalette } from "./tools-palette";
import { DisplayPalette } from "./display-palette";
import { ViewSettingsPalette } from "./view-settings-palette";
import { ExportPalette } from "./export-palette";

interface WorkstationLayoutProps {
  viewport: React.ReactNode;
  /** Sidebar position. Default: "left" */
  sidebarSide?: "left" | "right";
}

export function WorkstationLayout({ viewport, sidebarSide = "left" }: WorkstationLayoutProps) {
  const { pointBudget, activeTool } = useViewer();
  const { metadata } = useData();

  return (
    <div className="relative w-full h-full overflow-hidden bg-[hsl(var(--background))]">
      <div className="absolute inset-0">
        {viewport}
      </div>

      {/* Sidebar (+ its floating palettes) scales with chrome; viewport stays native. */}
      <div style={chromeScale}>
        <CollapsibleSidebar side={sidebarSide}>
          <ToolsPalette />
          <DisplayPalette />
          <ViewSettingsPalette />
          <ExportPalette />
        </CollapsibleSidebar>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-muted-foreground/70 bg-[hsl(var(--card)/0.8)] backdrop-blur-sm border-t border-[hsl(var(--border)/0.5)]"
        style={chromeScale}
      >
        {metadata && <span>{(metadata.points / 1e6).toFixed(1)}M pts</span>}
        <span>Budget: {(pointBudget / 1e6).toFixed(1)}M</span>
        <StatusFps />
        {activeTool !== "none" && <span className="text-[hsl(var(--brand))]">{activeTool}</span>}
      </div>
    </div>
  );
}
