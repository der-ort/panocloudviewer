import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CSSProperties } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Point-budget slider bounds, scaled to the loaded cloud's total point count
 * so the budget is never artificially capped (old fixed max: 10M). Falls back
 * to 10M while the total is unknown. ~100 steps, rounded to 100K.
 */
export function budgetSliderRange(totalPoints?: number) {
  const max = totalPoints && totalPoints > 1_000_000 ? totalPoints : 10_000_000;
  const step = Math.max(100_000, Math.round(max / 100 / 100_000) * 100_000);
  return { min: 500_000, max, step };
}

/**
 * Inline style that scales UI chrome via the `--pcv-scale` CSS custom property
 * (set on the `.pcv` root by `PanoCloudViewer`'s `uiScale` prop). Apply to
 * non-viewport chrome containers only — the viewport/canvas stays at native
 * size. `zoom` isn't in React's CSSProperties, so the object is cast.
 */
export const pcvChromeScaleStyle = { zoom: "var(--pcv-scale, 1)" } as CSSProperties;

// Formatting helpers live in the headless core; re-exported here so existing
// `../lib/utils` imports across the UI keep working unchanged.
export {
  formatLength,
  formatArea,
  formatVolume,
  formatAngle,
  formatCoord,
  exportMeasurementsCSV,
} from "@der-ort/pano-cloud-viewer-core";
