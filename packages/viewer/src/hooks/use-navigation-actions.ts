"use client";

import { useCallback } from "react";
import * as THREE from "three";
import { useViewer } from "../providers/viewer-provider";

export type ViewPreset = "top" | "bottom" | "front" | "back" | "left" | "right";

/**
 * Camera directions for the view presets (unit-ish vectors from the orbit
 * target toward the camera). The scene is Z-up and `camera.up` must stay
 * `(0,0,1)` at ALL times — OrbitControls orbits around `camera.up`, so the old
 * approach of flipping up to `(0,1,0)` for top/bottom made every subsequent
 * drag rotate around the wrong axis (the reported "axis shift"). Instead,
 * top/bottom aim slightly OFF the ±Z pole (matching the controls' polar
 * clamps), which is visually indistinguishable from straight down/up but
 * keeps the orbit math stable with Z-up.
 */
const PRESET_DIRS: Record<ViewPreset, readonly [number, number, number]> = {
  top:    [0, -0.035, 1],
  bottom: [0, -0.035, -1],
  front:  [0, -1, 0],
  back:   [0, 1, 0],
  left:   [-1, 0, 0],
  right:  [1, 0, 0],
};

export function useNavigationActions() {
  const { sceneManager, cameraAnimator, loader, navigationMode, setNavigationMode, projection, setProjection } = useViewer();

  const fitToView = useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);

  /**
   * Fly to a standard view around the current orbit target, keeping the
   * current distance. Always restores `camera.up = (0,0,1)` (via the
   * animator's up-lerp) so a preset also HEALS any stale up-vector.
   * Note: no longer forces orthographic projection — projection is an
   * independent axis (`setProjection`).
   */
  const flyToView = useCallback((preset: ViewPreset) => {
    if (!sceneManager) return;
    const cam = sceneManager.camera;
    const controls = sceneManager.controls;
    const target = controls.target.clone();
    const dist = cam.position.distanceTo(target) || 10;

    const d = PRESET_DIRS[preset];
    const dir = new THREE.Vector3(d[0], d[1], d[2]).normalize();
    const position = target.clone().addScaledVector(dir, dist);
    const up = new THREE.Vector3(0, 0, 1);

    if (cameraAnimator) {
      cameraAnimator.flyTo({ position, target, up, duration: 600 });
    } else {
      cam.position.copy(position);
      cam.up.copy(up);
      controls.update();
    }
  }, [sceneManager, cameraAnimator]);

  return {
    navigationMode,
    setNavigationMode,
    projection,
    setProjection,
    fitToView,
    flyToView,
  };
}
