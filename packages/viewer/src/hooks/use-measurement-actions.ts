"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";
import { exportMeasurementsCSV } from "../lib/utils";
import type { ActiveTool, MeasurementType } from "../types";

export function useMeasurementActions() {
  const { activeTool, setActiveTool, measurementManager, measurementList, setMeasurementList } = useViewer();

  const startTool = useCallback((type: MeasurementType) => {
    const tool = `measure-${type}` as ActiveTool;
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);

  const cancelTool = useCallback(() => {
    setActiveTool("none");
  }, [setActiveTool]);

  const clearAll = useCallback(() => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  }, [measurementManager, setMeasurementList]);

  const remove = useCallback((id: string) => {
    measurementManager?.remove(id);
  }, [measurementManager]);

  const rename = useCallback((id: string, name: string) => {
    measurementManager?.rename(id, name);
  }, [measurementManager]);

  const exportCSV = useCallback(() => {
    exportMeasurementsCSV(measurementList);
  }, [measurementList]);

  return {
    activeTool,
    startTool,
    cancelTool,
    measurements: measurementList,
    clearAll,
    remove,
    rename,
    exportCSV,
  };
}
