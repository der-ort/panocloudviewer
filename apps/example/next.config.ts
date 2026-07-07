import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@der-ort/pano-cloud-viewer"],
  images: { unoptimized: true },
  // Hide the Next.js dev-mode indicator (the small badge bottom-left) so it
  // doesn't clutter the viewport corner. Dev-only; never shipped in a build.
  devIndicators: false,
};

export default nextConfig;
