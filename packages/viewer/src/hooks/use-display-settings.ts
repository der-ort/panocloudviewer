"use client";

import { useCallback, useState } from "react";
import { useViewer } from "../providers/viewer-provider";
import { DISPLAY_PRESETS } from "@der-ort/pano-cloud-viewer-core";
import type { DisplayPreset, DisplaySettings } from "@der-ort/pano-cloud-viewer-core";

export function useDisplaySettings() {
  const viewer = useViewer();

  // Use provider state if available (added by foundation worker), otherwise local state
  const [localSettings, setLocalSettings] = useState<DisplaySettings>(DISPLAY_PRESETS.standard);

  const settings: DisplaySettings = (viewer as any).displaySettings ?? localSettings;
  const setSettings: (s: DisplaySettings) => void = (viewer as any).setDisplaySettings ?? setLocalSettings;

  const applyPreset = useCallback((preset: DisplayPreset) => {
    setSettings({ ...DISPLAY_PRESETS[preset] });
  }, [setSettings]);

  const updateSetting = useCallback(<K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    setSettings({ ...settings, preset: "standard" as DisplayPreset, [key]: value });
  }, [settings, setSettings]);

  return {
    settings,
    presets: DISPLAY_PRESETS,
    applyPreset,
    updateSetting,
  };
}
