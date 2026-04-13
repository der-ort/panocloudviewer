"use client";

import React from "react";
import { BoxSelect, Slice } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { ToolbarIconBtn } from "./main-toolbar";

export function SectionTools() {
  const { activeTool, setActiveTool } = useViewer();

  return (
    <>
      <ToolbarIconBtn
        icon={<BoxSelect size={14} />}
        title="Clipping box"
        active={activeTool === "section-box"}
        onClick={() => setActiveTool(activeTool === "section-box" ? "none" : "section-box")}
      />
      <ToolbarIconBtn
        icon={<Slice size={14} />}
        title="Clipping plane"
        active={activeTool === "section-plane"}
        onClick={() => setActiveTool(activeTool === "section-plane" ? "none" : "section-plane")}
      />
    </>
  );
}
