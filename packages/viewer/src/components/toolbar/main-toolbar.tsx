"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { ViewControls } from "./view-controls";
import { DisplayControls, ViewModeControls } from "./display-controls";
import { ExportTools } from "./export-tools";

interface ToolbarSectionProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

function ToolbarSection({ label, children, className }: ToolbarSectionProps) {
  return (
    <div className={cn("flex items-center gap-0.5 px-2 border-r border-[hsl(var(--toolbar-border))] last:border-r-0", className)}>
      {children}
      {label && (
        <span className="text-[9px] text-muted-foreground/50 ml-1 hidden xl:block font-mono uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}

export { ToolbarSection };

interface MainToolbarProps {
  onToggleRenderSettings?: () => void;
  renderSettingsOpen?: boolean;
}

export function MainToolbar({ onToggleRenderSettings, renderSettingsOpen }: MainToolbarProps) {
  const { uiMode } = useViewer();

  const isPro = uiMode === "professional";

  return (
    <div className="flex items-center h-10 px-2 gap-0 select-none overflow-x-auto">
      {/* View controls: presets + navigation mode + projection */}
      <ToolbarSection>
        <ViewControls />
        <ViewModeControls />
      </ToolbarSection>

      {/* Display quick controls + the single Settings panel toggle */}
      <ToolbarSection>
        <DisplayControls />
        {isPro && (
          <ToolbarIconBtn
            icon={<SlidersHorizontal size={14} />}
            active={renderSettingsOpen}
            onClick={onToggleRenderSettings}
            title="Settings"
          />
        )}
      </ToolbarSection>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side: export only (theme moved into Settings; layer toggles in
          the sidebar's "Layers" tab) */}
      <ToolbarSection>
        {isPro && <ExportTools />}
      </ToolbarSection>
    </div>
  );
}

interface ToolbarIconBtnProps {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}

export function ToolbarIconBtn({ icon, label, active, onClick, title }: ToolbarIconBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-1.5 py-1 rounded text-xs transition-colors",
        active
          ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      {icon}
      {label && <span className="hidden xl:block">{label}</span>}
    </button>
  );
}
