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
    if (loader.worldBox.isEmpty()) return;

    // Sized to fit the current viewport (centered on the view target, clamped to
    // the cloud) so the box is always fully visible and easy to grab.
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  }, [clipManager, loader]);

  const clearAll = useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);

  const toggleMode = useCallback(() => {
    const next: ClipMode = clipMode === "outside" ? "inside" : "outside";
    clipManager?.setModeAll(next);
  }, [clipManager, clipMode]);

  const setEnabled = useCallback((enabled: boolean) => {
    clipManager?.setEnabled(enabled);
  }, [clipManager]);

  const isEnabled = clipManager?.isEnabled() ?? true;
  const outlinesVisible = clipManager?.areOutlinesVisible() ?? true;

  const setOutlinesVisible = useCallback((visible: boolean) => {
    clipManager?.setOutlinesVisible(visible);
  }, [clipManager]);

  const selectBox = useCallback((id: string | null) => {
    clipManager?.selectBox(id);
  }, [clipManager]);

  const resetRotation = useCallback((id?: string) => {
    clipManager?.resetRotation(id);
  }, [clipManager]);

  /**
   * @deprecated Move/scale/rotate handles now show simultaneously on the
   * selected box — there are no modes. Selecting a box is all that's needed;
   * kept so existing custom UIs keep compiling.
   */
  const setTransformMode = useCallback((_mode: "translate" | "scale" | "rotate") => {
    if (!clipManager) return;
    if (!clipManager.getSelectedId() && boxes[0]) clipManager.selectBox(boxes[0].id);
  }, [clipManager, boxes]);

  const removeBox = useCallback((id: string) => {
    clipManager?.removeBox(id);
  }, [clipManager]);

  const setBoxVisible = useCallback((id: string, visible: boolean) => {
    clipManager?.setBoxVisible(id, visible);
  }, [clipManager]);

  const setModeAll = useCallback((mode: "outside" | "inside") => {
    clipManager?.setModeAll(mode);
  }, [clipManager]);

  return {
    boxes,
    selectedBoxId: selectedClipBoxId,
    hasClipBox,
    clipMode,
    isEnabled,
    outlinesVisible,
    addBox,
    clearAll,
    toggleMode,
    setEnabled,
    setOutlinesVisible,
    selectBox,
    resetRotation,
    setTransformMode,
    removeBox,
    setBoxVisible,
    setModeAll,
  };
}
