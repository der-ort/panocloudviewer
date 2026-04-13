"use client";

import React from "react";
import { Sun, Moon, Camera, Map, Layers, Info, PanelRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useTheme } from "../../providers/theme-provider";
import { useLocale } from "../../i18n/locale-context";
import { ViewControls } from "./view-controls";
import { DisplayControls } from "./display-controls";
import { ExportTools } from "./export-tools";

// Inline brand logos as SVG components
function BildmarkeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1080 1080" className={className} aria-hidden>
      <path
        d="M920.713,554.127l-57.742-18.206-12.033-23.115,7.837-24.857,53.701-27.955-5.136-9.868v-11.13h-60.582l-18.39-18.389v-26.104l42.785-42.785-10.376-10.376-32.409,32.409v-13.721h-14.674v28.395l-8.754,8.754-29.606-29.606-19.401-37.268,10.916-5.683,27.097,8.543,4.421-14.022-13.075-4.123,28.401-14.784v45.097h14.674v-78.953h78.971v-14.703h-78.971v-78.966h-14.674v78.966h-76.858l9.961-31.593-10.628-3.351-7.864-7.864-42.808,42.808h-26.059l-18.414-18.414v-60.552h-14.674v45.878l-9.745-9.745-10.397,10.397,20.142,20.142v12.294h-41.957l-40.016-12.617,3.7-11.734,25.233-13.136-6.789-13.042-12.192,6.346,13.793-43.746-13.995-4.413-18.206,57.741-23.11,12.03-24.846-7.834-27.957-53.704-9.876,5.141h-11.129v60.512l-18.454,18.454h-26.024l-42.85-42.85-10.397,10.396,32.453,32.453h-13.729v14.703h28.432l8.706,8.706-29.693,29.693-37.154,19.341-5.713-10.976,8.539-27.081-13.995-4.413-4.126,13.086-14.761-28.357h45.068v-14.703h-78.972v-78.966h-14.674v78.966h-79v14.703h79v76.797l-31.624-9.971-3.344,10.606-7.867,7.867,42.835,42.835v26.053l-18.429,18.429h-60.571v14.703h45.868l-9.669,9.669,10.376,10.376,20.045-20.045h12.38v41.924l-12.608,39.988-11.807-3.723-13.094-25.153-13.016,6.776,6.318,12.137-43.745-13.792-4.421,14.022,57.767,18.214,12.034,23.119-7.836,24.854-53.729,27.969,5.136,9.867v11.118h60.595l18.405,18.405v26.088l-42.784,42.784,10.376,10.376,32.408-32.408v13.708h14.674v-28.381l8.746-8.746,29.625,29.625,19.386,37.241-10.917,5.683-27.122-8.552-4.421,14.022,13.1,4.131-28.398,14.783v-45.108h-14.674v78.966h-79v14.703h79v78.953h14.674v-78.953h76.857l-9.957,31.58,10.609,3.345,7.881,7.88,42.806-42.805h26.045l18.429,18.429v60.523h14.674v-45.85l9.716,9.716,10.397-10.396-20.112-20.112v-12.311h41.957l40.014,12.617-3.699,11.731-25.262,13.15,6.789,13.042,12.221-6.361-13.79,43.736,13.995,4.413,18.202-57.731,23.106-12.028,24.847,7.834,27.95,53.691,9.875-5.141h11.139v-60.501l18.452-18.452h26.011l42.836,42.836,10.397-10.396-32.439-32.439h13.716v-14.703h-28.419l-8.699-8.699,29.704-29.704,37.148-19.338,5.714,10.978-8.534,27.067,13.995,4.412,4.122-13.072,14.761,28.356h-45.095v14.703h79.001v78.953h14.674v-78.953h78.971v-14.703h-78.971v-76.797l31.595,9.962,3.346-10.612,7.865-7.865-42.806-42.806v-26.07l18.427-18.427h60.544v-14.703h-45.841l9.672-9.672-10.376-10.376-20.048,20.048h-12.379v-41.929l12.607-39.984,11.806,3.723,13.087,25.14,13.016-6.775-6.311-12.125,43.719,13.785,4.421-14.023Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
  sidebarOpen?: boolean;
}

export function MainToolbar({ onOpenAbout, onOpenCloudSelector, onToggleSidebar, sidebarOpen }: MainToolbarProps) {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap } = useViewer();
  const { resolvedTheme, toggleTheme } = useTheme();
  const t = useLocale().toolbar;

  return (
    <div className="flex items-center h-10 px-2 gap-0 select-none overflow-x-auto">
      {/* Logo */}
      <div className="flex items-center gap-1.5 pr-3 mr-1 border-r border-[hsl(var(--toolbar-border))] shrink-0">
        <BildmarkeIcon className="w-5 h-5 text-[hsl(var(--brand))]" />
        <span className="text-xs font-semibold tracking-tight hidden md:block" style={{ fontFamily: "var(--font-heading)" }}>
          PanoCloud
        </span>
      </div>

      {/* View controls */}
      <ToolbarSection label="Views">
        <ViewControls />
      </ToolbarSection>

      {/* Display settings */}
      <ToolbarSection label="Display">
        <DisplayControls />
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
        <ExportTools />
        <ToolbarIconBtn
          icon={<Layers size={14} />}
          label={t.clouds}
          active={false}
          onClick={onOpenCloudSelector}
          title={t.cloudSelector}
        />
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
