"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";
import { DISPLAY_PRESETS } from "@der-ort/pano-cloud-viewer-core";
import type { DisplayPreset, DisplaySettings } from "@der-ort/pano-cloud-viewer-core";

/**
 * Read/update the viewer's display settings (color mode, point size, marker
 * label mode, …). Thin wrapper over the `ViewerProvider` context that adds
 * preset application and single-key updates.
 */
export function useDisplaySettings() {
  const { displaySettings: settings, setDisplaySettings } = useViewer();

  const applyPreset = useCallback((preset: DisplayPreset) => {
    setDisplaySettings({ ...DISPLAY_PRESETS[preset] });
  }, [setDisplaySettings]);

  const updateSetting = useCallback(<K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    // Any manual tweak drops the "which preset" label to "standard" (custom).
    setDisplaySettings({ ...settings, preset: "standard" as DisplayPreset, [key]: value });
  }, [settings, setDisplaySettings]);

  return {
    settings,
    presets: DISPLAY_PRESETS,
    applyPreset,
    updateSetting,
  };
}
