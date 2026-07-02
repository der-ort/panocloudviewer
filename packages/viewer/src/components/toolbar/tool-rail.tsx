"use client";

import React from "react";
import {
  MapPin, Ruler, ArrowUpDown, Pentagon, Package, Triangle, Waypoints,
  BoxSelect, X, ZoomIn,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import type { ActiveTool, MeasurementType } from "@der-ort/pano-cloud-viewer-core";

interface RailBtnProps {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  compact?: boolean;
}

function RailBtn({ icon, title, active, onClick, disabled, compact }: RailBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center rounded transition-colors",
        compact ? "w-7 h-7" : "w-9 h-9",
        active
          ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        disabled && "opacity-30 cursor-not-allowed",
      )}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="h-px w-6 mx-auto bg-[hsl(var(--border))] my-0.5" />;
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50 text-center leading-none mt-1">
      {children}
    </span>
  );
}

// ── Measurement tool definitions grouped by category ─────────────────────────

const BASIC_MEASURES: { type: MeasurementType; tool: ActiveTool; icon: React.ReactNode; titleKey: string }[] = [
  { type: "point",    tool: "measure-point",    icon: <MapPin size={15} />,      titleKey: "measurePoint" },
  { type: "distance", tool: "measure-distance", icon: <Ruler size={15} />,       titleKey: "measureDistance" },
  { type: "height",   tool: "measure-height",   icon: <ArrowUpDown size={15} />, titleKey: "measureHeight" },
];

const ADVANCED_MEASURES: { type: MeasurementType; tool: ActiveTool; icon: React.ReactNode; titleKey: string }[] = [
  { type: "area",    tool: "measure-area",    icon: <Pentagon size={15} />,  titleKey: "measureArea" },
  { type: "volume",  tool: "measure-volume",  icon: <Package size={15} />,   titleKey: "measureVolume" },
  { type: "angle",   tool: "measure-angle",   icon: <Triangle size={15} />,  titleKey: "measureAngle" },
  { type: "profile", tool: "measure-profile", icon: <Waypoints size={15} />, titleKey: "measureProfile" },
];

export function ToolRail() {
  const { activeTool, setActiveTool, clipManager, loader, measurementManager, setMeasurementList, uiMode, selectedClipBoxId, showMagnifier, setShowMagnifier } = useViewer();
  const t = useLocale().toolRail;

  const isPro = uiMode === "professional";

  const toggle = (tool: ActiveTool) => setActiveTool(activeTool === tool ? "none" : tool);

  const boxes = clipManager?.getBoxes() ?? [];
  const hasClipBox = boxes.length > 0;
  const clipSelected = !!selectedClipBoxId;

  // Toggle the section box. Crucially, deselecting does NOT delete it — the crop
  // stays active so you can keep looking inside the cloud. Removal is a separate
  // action (the X button / the Clip panel trash).
  const toggleClipBox = () => {
    if (!clipManager || !loader) return;
    if (!hasClipBox) {
      if (loader.worldBox.isEmpty()) return;
      const entry = clipManager.addDefaultBox(loader.worldBox);
      clipManager.selectBox(entry.id);
    } else if (clipSelected) {
      clipManager.selectBox(null); // deselect — clipping remains applied
    } else {
      clipManager.selectBox(boxes[0].id); // re-select to edit
    }
  };

  const clearClipBox = () => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  };

  const clearMeasurements = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };

  return (
    <div className="flex flex-col items-center gap-0.5 py-2 px-1 w-10 shrink-0">
      {/* ── Measure: Basic ──────────────────────── */}
      <GroupLabel>{t.measureGroup}</GroupLabel>
      {BASIC_MEASURES.map(def => (
        <RailBtn
          key={def.tool}
          icon={def.icon}
          title={(t as unknown as Record<string, string>)[def.titleKey] ?? def.type}
          active={activeTool === def.tool}
          onClick={() => toggle(def.tool)}
        />
      ))}

      {/* ── Measure: Advanced (Professional only) ─── */}
      {/* Divided from the basic tools by a plain rule — no group labels. */}
      {isPro && (
        <>
          <Divider />
          {ADVANCED_MEASURES.map(def => (
            <RailBtn
              key={def.tool}
              icon={def.icon}
              title={(t as unknown as Record<string, string>)[def.titleKey] ?? def.type}
              active={activeTool === def.tool}
              onClick={() => toggle(def.tool)}
            />
          ))}
        </>
      )}
      {/* Picking magnifier toggle — zoom inset while measuring */}
      <RailBtn
        icon={<ZoomIn size={14} />}
        title={t.magnifier}
        active={showMagnifier}
        onClick={() => setShowMagnifier(!showMagnifier)}
        compact
      />
      <RailBtn
        icon={<X size={13} />}
        title={t.clearMeasurements}
        onClick={clearMeasurements}
        compact
      />

      {/* ── Clipping (Professional only) ────────── */}
      {isPro && (
        <>
          <Divider />

          <GroupLabel>{t.sectionGroup}</GroupLabel>
          <RailBtn
            icon={<BoxSelect size={15} />}
            title={!hasClipBox ? t.drawClipBox : clipSelected ? "Deselect section (crop stays active)" : "Edit section"}
            active={clipSelected}
            onClick={toggleClipBox}
          />
          {hasClipBox && (
            <RailBtn
              icon={<X size={13} />}
              title={t.removeClipBox}
              onClick={clearClipBox}
              compact
            />
          )}
        </>
      )}
    </div>
  );
}
