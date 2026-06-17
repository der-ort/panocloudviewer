// Build identity for the viewer. The values are injected at build time by tsup
// (`define` in tsup.config.ts) so a consuming app can confirm — right in the UI
// or programmatically — that a viewer update actually shipped.
//
// `PCV_VERSION` is the package version; `PCV_BUILD` is `<short-sha> · <UTC time>`
// of the build. When run from source (not the built dist) both fall back.

declare const __PCV_VERSION__: string;
declare const __PCV_BUILD__: string;

/** Package version, e.g. "0.1.0". */
export const PCV_VERSION: string =
  typeof __PCV_VERSION__ !== "undefined" ? __PCV_VERSION__ : "0.0.0-dev";

/** Build identifier — short git SHA + UTC build time, e.g. "a1b2c3d · 2026-06-17 10:54Z". */
export const PCV_BUILD: string =
  typeof __PCV_BUILD__ !== "undefined" ? __PCV_BUILD__ : "dev";

/** Convenience: `"v0.1.0 · a1b2c3d · 2026-06-17 10:54Z"`. */
export const PCV_VERSION_STRING = `v${PCV_VERSION} · ${PCV_BUILD}`;
