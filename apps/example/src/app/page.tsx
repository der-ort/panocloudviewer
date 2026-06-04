"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

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
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <PanoCloudViewer source={SOURCE} theme="dark" />
      <Link
        href="/gallery"
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          padding: "6px 14px",
          fontSize: 12,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontWeight: 500,
          color: "rgba(255,255,255,0.8)",
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 6,
          textDecoration: "none",
          backdropFilter: "blur(6px)",
          transition: "background 0.15s",
        }}
      >
        View demo gallery →
      </Link>
    </div>
  );
}
