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

  /** Fly to `dir` around the building (`loader.frameBox`), at the distance that frames it. */
  const flyToFrame = useCallback((dir?: THREE.Vector3) => {
    if (!sceneManager || !loader) return;
    const box = loader.frameBox;
    if (box.isEmpty()) return;
    const { position, target } = sceneManager.fitParams(box, dir);
    const up = new THREE.Vector3(0, 0, 1);
    if (cameraAnimator) {
      cameraAnimator.flyTo({ position, target, up, duration: 600 });
    } else {
      sceneManager.camera.position.copy(position);
      sceneManager.camera.up.copy(up);
      sceneManager.controls.target.copy(target);
      sceneManager.controls.update();
    }
  }, [sceneManager, loader, cameraAnimator]);

  /** "Gebäude einpassen": back to the opening view of the building, from wherever the camera is. */
  const fitToView = useCallback(() => flyToFrame(), [flyToFrame]);

  /**
   * Fly to a standard view of the building: centred on `loader.frameBox` and
   * at the distance that frames it, so a top view shows the building and not
   * the street around it. Always restores `camera.up = (0,0,1)` (via the
   * animator's up-lerp) so a preset also HEALS any stale up-vector.
   * Note: no longer forces orthographic projection — projection is an
   * independent axis (`setProjection`).
   */
  const flyToView = useCallback((preset: ViewPreset) => {
    const d = PRESET_DIRS[preset];
    flyToFrame(new THREE.Vector3(d[0], d[1], d[2]));
  }, [flyToFrame]);

  return {
    navigationMode,
    setNavigationMode,
    projection,
    setProjection,
    fitToView,
    flyToView,
  };
}
