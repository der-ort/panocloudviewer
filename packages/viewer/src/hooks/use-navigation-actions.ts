"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";

type ViewPreset = "top" | "bottom" | "front" | "back" | "left" | "right";

export function useNavigationActions() {
  const { sceneManager, loader, navigationMode, setNavigationMode, projection, setProjection } = useViewer();

  const fitToView = useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);

  const flyToView = useCallback((preset: ViewPreset) => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (wb.isEmpty()) return;

    const cam = sceneManager.camera;
    const controls = sceneManager.controls;
    const target = controls.target.clone();
    const dist = cam.position.distanceTo(target);

    const dirs: Record<ViewPreset, [number, number, number]> = {
      top:    [0, 0, 1],
      bottom: [0, 0, -1],
      front:  [0, -1, 0],
      back:   [0, 1, 0],
      left:   [-1, 0, 0],
      right:  [1, 0, 0],
    };
    const [dx, dy, dz] = dirs[preset];

    setProjection("orthographic");
    cam.position.set(
      target.x + dx * dist,
      target.y + dy * dist,
      target.z + dz * dist,
    );
    cam.up.set(0, preset === "top" || preset === "bottom" ? 1 : 0, preset === "top" || preset === "bottom" ? 0 : 1);
    controls.update();
  }, [sceneManager, loader, setProjection]);

  return {
    navigationMode,
    setNavigationMode,
    projection,
    setProjection,
    fitToView,
    flyToView,
  };
}
