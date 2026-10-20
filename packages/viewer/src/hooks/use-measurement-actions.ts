"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";
import { exportMeasurementsCSV } from "../lib/utils";
import { confirmClearAll } from "../lib/confirm-clear";
import { useLocale } from "../i18n/locale-context";
import type { ActiveTool, MeasurementType } from "@der-ort/pano-cloud-viewer-core";

export function useMeasurementActions() {
  const { activeTool, setActiveTool, measurementManager, measurementList, setMeasurementList } = useViewer();
  const confirmQuestion = useLocale().measurementsPanel.confirmClearAll;

  const startTool = useCallback((type: MeasurementType) => {
    const tool = `measure-${type}` as ActiveTool;
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);

  const cancelTool = useCallback(() => {
    setActiveTool("none");
  }, [setActiveTool]);

  const clearAll = useCallback(() => {
    if (!confirmClearAll(measurementManager, confirmQuestion)) return;
    measurementManager?.clearAll();
    setMeasurementList([]);
  }, [measurementManager, setMeasurementList, confirmQuestion]);

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
