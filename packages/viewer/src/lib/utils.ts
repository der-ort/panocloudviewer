import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
