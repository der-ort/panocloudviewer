import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@der-ort/pano-cloud-viewer"],
  images: { unoptimized: true },
};

export default nextConfig;
