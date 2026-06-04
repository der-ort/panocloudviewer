import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
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
