import type { Measurement } from "./types";

/** Format a number in meters with appropriate precision */
export function formatLength(meters: number): string {
  if (meters < 1) return `${(meters * 100).toFixed(1)} cm`;
  if (meters < 100) return `${meters.toFixed(2)} m`;
  return `${meters.toFixed(1)} m`;
}

/** Format area in m² */
export function formatArea(m2: number): string {
  if (m2 < 1) return `${(m2 * 10000).toFixed(1)} cm²`;
  return `${m2.toFixed(2)} m²`;
}

/** Format volume in m³ */
export function formatVolume(m3: number): string {
  return `${m3.toFixed(3)} m³`;
}

/** Format angle in degrees */
export function formatAngle(radians: number): string {
  return `${((radians * 180) / Math.PI).toFixed(1)}°`;
}

/** Format a 3D coordinate for display */
export function formatCoord(x: number, y: number, z: number, decimals = 2): string {
  const f = (v: number) => v.toFixed(decimals);
  return `X: ${f(x)}, Y: ${f(y)}, Z: ${f(z)}`;
}

/** Unit string for a measurement type */
function measurementUnit(type: string): string {
  switch (type) {
    case "distance": case "height": return "m";
    case "area": return "m²";
    case "volume": return "m³";
    case "angle": return "°";
    default: return "";
  }
}

/** Raw display value for CSV (no unit suffix) */
function rawValue(m: Measurement): string {
  if (m.value === undefined) return "";
  switch (m.type) {
    case "distance": case "height": return m.value.toFixed(4);
    case "area": return m.value.toFixed(4);
    case "volume": return m.value.toFixed(4);
    case "angle": return ((m.value * 180) / Math.PI).toFixed(2);
    case "point": return "";
    default: return m.value.toFixed(4);
  }
}

/** Escape a CSV field (quote if it contains commas, quotes, or newlines) */
function csvField(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/** Export measurements as a CSV string */
export function exportMeasurementsCSV(measurements: Measurement[]): string {
  const maxPoints = measurements.reduce((max, m) => Math.max(max, m.points.length), 0);

  // Header
  const header = ["#", "Type", "Label", "Value", "Unit"];
  for (let i = 1; i <= maxPoints; i++) {
    header.push(`Point ${i} X`, `Point ${i} Y`, `Point ${i} Z`);
  }

  const rows = [header.join(",")];

  measurements.forEach((m, idx) => {
    const fields: string[] = [
      String(idx + 1),
      csvField(m.type),
      csvField(m.label),
      rawValue(m),
      measurementUnit(m.type),
    ];
    for (let i = 0; i < maxPoints; i++) {
      const p = m.points[i];
      if (p) {
        fields.push(p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4));
      } else {
        fields.push("", "", "");
      }
    }
    rows.push(fields.join(","));
  });

  return rows.join("\n");
}
