"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";
import type { ClipMode } from "@der-ort/pano-cloud-viewer-core";

export function useClipActions() {
  const { clipManager, loader, clipBoxEntries, selectedClipBoxId, activeTool, setActiveTool } = useViewer();

  const boxes = clipBoxEntries;
  const hasClipBox = boxes.length > 0;
  // Match ClipManager.applyAll() which derives the effective clip mode from the
  // first *visible* box — not necessarily boxes[0].
  const clipMode: ClipMode = (boxes.find(b => b.visible)?.mode) ?? "outside";

  const addBox = useCallback(() => {
    if (!clipManager || !loader) return;
    const wb = loader.worldBox;
    if (wb.isEmpty()) return;
    const entry = clipManager.addBox(wb.clone());
    clipManager.selectBox(entry.id);
    clipManager.setTransformMode("scale");
  }, [clipManager, loader]);

  const clearAll = useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);

  const toggleMode = useCallback(() => {
    const next: ClipMode = clipMode === "outside" ? "inside" : "outside";
    for (const b of boxes) {
      clipManager?.setBoxMode(b.id, next);
    }
  }, [clipManager, boxes, clipMode]);

  const selectBox = useCallback((id: string | null) => {
    clipManager?.selectBox(id);
  }, [clipManager]);

  const setTransformMode = useCallback((mode: "translate" | "scale" | "rotate") => {
    if (!clipManager) return;
    const id = clipManager.getSelectedId();
    if (id) {
      clipManager.setTransformMode(mode);
    } else if (boxes[0]) {
      clipManager.selectBox(boxes[0].id);
      clipManager.setTransformMode(mode);
    }
  }, [clipManager, boxes]);

  const removeBox = useCallback((id: string) => {
    clipManager?.removeBox(id);
  }, [clipManager]);

  const setBoxVisible = useCallback((id: string, visible: boolean) => {
    clipManager?.setBoxVisible(id, visible);
  }, [clipManager]);

  const setModeAll = useCallback((mode: "outside" | "inside") => {
    for (const b of boxes) {
      clipManager?.setBoxMode(b.id, mode);
    }
  }, [clipManager, boxes]);

  return {
    boxes,
    selectedBoxId: selectedClipBoxId,
    hasClipBox,
    clipMode,
    addBox,
    clearAll,
    toggleMode,
    selectBox,
    setTransformMode,
    removeBox,
    setBoxVisible,
    setModeAll,
  };
}
