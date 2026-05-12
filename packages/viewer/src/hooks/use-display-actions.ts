"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";
import type { ColorMode } from "../core/point-cloud-loader";

type QualityPreset = "performance" | "balanced" | "high";

export function useDisplayActions() {
  const { loader, colorMode, setColorMode, pointBudget, setPointBudget, pointSize, setPointSize } = useViewer();

  const setQualityPreset = useCallback((preset: QualityPreset) => {
    if (!loader) return;
    switch (preset) {
      case "performance":
        loader.setPointShape(0); // SQUARE
        loader.setPointSizeType(0); // FIXED
        break;
      case "balanced":
        loader.setPointShape(1); // CIRCLE
        loader.setPointSizeType(2); // ADAPTIVE
        break;
      case "high":
        loader.setPointShape(2); // PARABOLOID
        loader.setPointSizeType(2); // ADAPTIVE
        break;
    }
  }, [loader]);

  return {
    colorMode,
    setColorMode: setColorMode as (mode: ColorMode) => void,
    pointBudget,
    setPointBudget,
    pointSize,
    setPointSize,
    setQualityPreset,
  };
}
