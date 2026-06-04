"use client";

import React from "react";
import { Sun, Moon, Camera, Map, Layers, Info, PanelRight, Sliders } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useTheme } from "../../providers/theme-provider";
import { useLocale } from "../../i18n/locale-context";
import { ViewControls } from "./view-controls";
import { DisplayControls } from "./display-controls";
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
  onOpenAbout?: () => void;
  onOpenCloudSelector?: () => void;
  onToggleSidebar?: () => void;
  onToggleRenderSettings?: () => void;
  sidebarOpen?: boolean;
  renderSettingsOpen?: boolean;
}

export function MainToolbar({ onOpenAbout, onOpenCloudSelector, onToggleSidebar, onToggleRenderSettings, sidebarOpen, renderSettingsOpen }: MainToolbarProps) {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap, uiMode } = useViewer();
  const { resolvedTheme, toggleTheme } = useTheme();
  const t = useLocale().toolbar;

  const isPro = uiMode === "professional";

  return (
    <div className="flex items-center h-10 px-2 gap-0 select-none overflow-x-auto">
      {/* View controls */}
      <ToolbarSection label="Views">
        <ViewControls />
      </ToolbarSection>

      {/* Display settings */}
      <ToolbarSection label="Display">
        <DisplayControls />
        {/* Rendering settings toggle — Professional only */}
        {isPro && (
          <ToolbarIconBtn
            icon={<Sliders size={14} />}
            active={renderSettingsOpen}
            onClick={onToggleRenderSettings}
            title="Rendering settings"
          />
        )}
      </ToolbarSection>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side: toggles + theme */}
      <ToolbarSection>
        <ToolbarIconBtn
          icon={<Camera size={14} />}
          label={t.panoramas}
          active={showMarkers}
          onClick={() => setShowMarkers(!showMarkers)}
          title={t.togglePanoramas}
        />
        <ToolbarIconBtn
          icon={<Map size={14} />}
          label={t.minimap}
          active={showMinimap}
          onClick={() => setShowMinimap(!showMinimap)}
          title={t.toggleMinimap}
        />
        {/* Export — Professional only */}
        {isPro && <ExportTools />}
        {/* Cloud selector — Professional only */}
        {isPro && (
          <ToolbarIconBtn
            icon={<Layers size={14} />}
            label={t.clouds}
            active={false}
            onClick={onOpenCloudSelector}
            title={t.cloudSelector}
          />
        )}
        <ToolbarIconBtn
          icon={resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          label={t.theme}
          active={false}
          onClick={toggleTheme}
          title={resolvedTheme === "dark" ? t.switchToLight : t.switchToDark}
        />
        <ToolbarIconBtn
          icon={<Info size={14} />}
          label={t.about}
          active={false}
          onClick={onOpenAbout}
          title={t.about}
        />
        <ToolbarIconBtn
          icon={<PanelRight size={14} />}
          label={t.sidebar}
          active={sidebarOpen}
          onClick={onToggleSidebar}
          title={t.toggleSidebar}
        />
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
