"use client";

import dynamic from "next/dynamic";

const PanoCloudViewer = dynamic(
  () => import("@der-ort/pano-cloud-viewer").then((m) => m.PanoCloudViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-sm text-gray-400 font-mono">Loading viewer...</p>
      </div>
    ),
  }
);

// ──────────────────────────────────────────────────────────
// Configure your point cloud source here.
//
// Option A: S3 / remote HTTP
//   const SOURCE = { type: "s3" as const, baseUrl: "https://your-bucket.s3.amazonaws.com/project/" };
//
// Option B: Local dev server (place Potree 2.0 files in public/sample/)
//   const SOURCE = { type: "local" as const, basePath: "/sample/" };
//
// Option C: Electron (desktop app with local file access)
//   const SOURCE = { type: "electron" as const, basePath: "C:/pointclouds/project/" };
// ──────────────────────────────────────────────────────────

const SOURCE = {
  type: "s3" as const,
  baseUrl: process.env.NEXT_PUBLIC_POINTCLOUD_URL ?? "/sample/",
};

export default function Page() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <PanoCloudViewer source={SOURCE} theme="dark" />
    </div>
  );
}
