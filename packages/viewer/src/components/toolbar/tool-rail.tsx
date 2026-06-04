"use client";

import React from "react";
import {
  MapPin, Ruler, ArrowUpDown, Pentagon, Package, Triangle, Waypoints,
  BoxSelect, X,
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

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[7px] font-mono uppercase tracking-wider text-muted-foreground/30 text-center leading-none">
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
  const { activeTool, setActiveTool, clipManager, loader, measurementManager, setMeasurementList, uiMode } = useViewer();
  const t = useLocale().toolRail;

  const isPro = uiMode === "professional";

  const toggle = (tool: ActiveTool) => setActiveTool(activeTool === tool ? "none" : tool);

  const boxes = clipManager?.getBoxes() ?? [];
  const hasClipBox = boxes.length > 0;

  const clearClipBox = () => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  };

  const addClipBox = () => {
    if (!clipManager || !loader) return;
    const wb = loader.worldBox;
    if (wb.isEmpty()) return;
    const entry = clipManager.addBox(wb.clone());
    clipManager.selectBox(entry.id);
    clipManager.setTransformMode("scale");
  };

  const clearMeasurements = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };

  return (
    <div className="flex flex-col items-center gap-0.5 py-2 px-1 w-10 shrink-0">
      {/* ── Measure: Basic ──────────────────────── */}
      <GroupLabel>{t.measureGroup}</GroupLabel>
      <SubLabel>Basic</SubLabel>
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
      {isPro && (
        <>
          <SubLabel>Advanced</SubLabel>
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
            title={hasClipBox ? t.removeClipBox : t.drawClipBox}
            active={hasClipBox}
            onClick={hasClipBox ? clearClipBox : addClipBox}
          />
        </>
      )}
    </div>
  );
}
