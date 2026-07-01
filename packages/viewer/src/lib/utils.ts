import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CSSProperties } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
