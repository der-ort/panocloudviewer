"use client";

import React from "react";
import { useFps } from "../providers/viewer-provider";
import { useLocale } from "../i18n/locale-context";

/**
 * Isolated FPS readout. Subscribes to the fps store via `useFps()`, so the
 * once-per-second FPS tick re-renders ONLY this pill — not the whole layout
 * (which is what happened when the shell read `fps` from `useViewer()`).
 */
export function StatusFps() {
  const fps = useFps();
  const t = useLocale().viewport;
  return <span>{t.statusFps(fps)}</span>;
}
