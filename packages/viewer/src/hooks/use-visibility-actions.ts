"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";

export function useVisibilityActions() {
  const { showMarkers, setShowMarkers } = useViewer();

  const toggleMarkers = useCallback(() => {
    setShowMarkers(!showMarkers);
  }, [showMarkers, setShowMarkers]);

  return {
    showMarkers,
    toggleMarkers,
  };
}
