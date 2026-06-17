import { defineConfig } from "tsup";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Build identity baked into the bundle so consumers can confirm exactly which
// viewer build is running (see src/version.ts + the settings/About UI).
const pkgVersion: string = JSON.parse(readFileSync("package.json", "utf8")).version;
let sha = "unknown";
try {
  sha = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
} catch {
  /* git not available — leave "unknown" */
}
const buildId = `${sha} · ${new Date().toISOString().slice(0, 16).replace("T", " ")}Z`;

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  define: {
    __PCV_VERSION__: JSON.stringify(pkgVersion),
    __PCV_BUILD__: JSON.stringify(buildId),
  },
  // Inline the core package's type declarations into our .d.ts so the prebuilt
  // dist resolves types without the consumer installing the core package.
  dts: { resolve: [/@der-ort\/pano-cloud-viewer-core/] },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "three"],
  // Bundle the headless core into this package's dist so the prebuilt artifact is
  // self-contained — a git-dependency consumer never resolves the core package.
  noExternal: [/@der-ort\/pano-cloud-viewer-core/],
  treeshake: true,
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
