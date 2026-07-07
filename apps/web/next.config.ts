import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Electron compatibility
  output: "export",

  // Transpile the viewer package so Next.js handles its JSX/TS
  transpilePackages: ["@der-ort/pano-cloud-viewer"],

  // Disable image optimization for static export
  images: { unoptimized: true },

  // Hide the Next.js dev-mode indicator (bottom-left badge) — dev-only clutter.
  devIndicators: false,

  // Required for Three.js / potree-core
  webpack(config) {
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { loader: "worker-loader" },
    });
    return config;
  },
};

export default nextConfig;
