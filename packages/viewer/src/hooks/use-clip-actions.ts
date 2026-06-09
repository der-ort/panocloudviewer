"use client";

import { useCallback } from "react";
import * as THREE from "three";
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

    // Build a CENTERED, SHORT box. Keep X/Y half-extents at ~½ of the world
    // size, but collapse Z to a thin slab centered at the world mid-Z so the
    // default box does not extend past the top/bottom of the viewport.
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    wb.getCenter(center);
    wb.getSize(size);

    const halfX = size.x * 0.5;
    const halfY = size.y * 0.5;
    // Thin Z slab: ~1/6 of cloud height, capped at 8 units, with a small floor.
    const halfZ = Math.max(0.2, Math.min(size.z / 6, 8)) * 0.5;

    const half = new THREE.Vector3(halfX, halfY, halfZ);
    const box = new THREE.Box3(
      center.clone().sub(half),
      center.clone().add(half),
    );

    const entry = clipManager.addBox(box);
    clipManager.selectBox(entry.id);
    clipManager.setTransformMode("scale");
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
    clipManager?.setModeAll(mode);
  }, [clipManager]);

  return {
    boxes,
    selectedBoxId: selectedClipBoxId,
    hasClipBox,
    clipMode,
    isEnabled,
    addBox,
    clearAll,
    toggleMode,
    setEnabled,
    selectBox,
    setTransformMode,
    removeBox,
    setBoxVisible,
    setModeAll,
  };
}
