"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";

export function useVisibilityActions() {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap } = useViewer();

  const toggleMarkers = useCallback(() => {
    setShowMarkers(!showMarkers);
  }, [showMarkers, setShowMarkers]);

  const toggleMinimap = useCallback(() => {
    setShowMinimap(!showMinimap);
  }, [showMinimap, setShowMinimap]);

  return {
    showMarkers,
    toggleMarkers,
    showMinimap,
    toggleMinimap,
  };
}
