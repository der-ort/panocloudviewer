"use client";

import React from "react";
import { BoxSelect, Slice } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { ToolbarIconBtn } from "./main-toolbar";

export function SectionTools() {
  const { activeTool, setActiveTool, clipManager, loader } = useViewer();

  const addClipBox = () => {
    if (!clipManager || !loader) return;
    const boxes = clipManager.getBoxes();
    if (boxes.length > 0) {
      // Already have a clip box — clear it instead (toggle off)
      clipManager.clear();
      return;
    }
    const wb = loader.worldBox;
    if (wb.isEmpty()) return;
    const entry = clipManager.addBox(wb.clone());
    clipManager.selectBox(entry.id);
    clipManager.setTransformMode("scale");
  };

  const hasClipBox = (clipManager?.getBoxes().length ?? 0) > 0;

  return (
    <>
      <ToolbarIconBtn
        icon={<BoxSelect size={14} />}
        title="Clipping box"
        active={hasClipBox}
        onClick={addClipBox}
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
