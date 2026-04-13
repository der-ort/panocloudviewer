"use client";

import React from "react";
import { MapPin, Ruler, ArrowUpDown, Pentagon, Package, Triangle, Waypoints } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { ToolbarIconBtn } from "./main-toolbar";
import type { ActiveTool, MeasurementType } from "../../types";

const TOOLS: { type: MeasurementType; tool: ActiveTool; icon: React.ReactNode; title: string }[] = [
  { type: "point",    tool: "measure-point",    icon: <MapPin size={14} />,       title: "Point coordinate" },
  { type: "distance", tool: "measure-distance", icon: <Ruler size={14} />,        title: "Distance" },
  { type: "height",   tool: "measure-height",   icon: <ArrowUpDown size={14} />,  title: "Height" },
  { type: "area",     tool: "measure-area",     icon: <Pentagon size={14} />,     title: "Area" },
  { type: "volume",   tool: "measure-volume",   icon: <Package size={14} />,      title: "Volume" },
  { type: "angle",    tool: "measure-angle",    icon: <Triangle size={14} />,     title: "Angle" },
  { type: "profile",  tool: "measure-profile",  icon: <Waypoints size={14} />,   title: "Profile" },
];

export function MeasureTools() {
  const { activeTool, setActiveTool } = useViewer();

  const toggle = (tool: ActiveTool) => {
    setActiveTool(activeTool === tool ? "none" : tool);
  };

  return (
    <>
      {TOOLS.map(t => (
        <ToolbarIconBtn
          key={t.tool}
          icon={t.icon}
          title={t.title}
          active={activeTool === t.tool}
          onClick={() => toggle(t.tool)}
        />
      ))}
    </>
  );
}
