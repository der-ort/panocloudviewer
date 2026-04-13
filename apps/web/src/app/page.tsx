"use client";

import dynamic from "next/dynamic";

// PanoCloudViewer must be loaded client-side (Three.js requires browser)
const PanoCloudViewer = dynamic(
  () => import("@der-ort/pano-cloud-viewer").then(m => m.PanoCloudViewer),
  { ssr: false, loading: () => <LoadingScreen /> }
);

function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-mono">Loading viewer…</p>
      </div>
    </div>
  );
}

// Configure your data source here
const SOURCE = {
  type: "s3" as const,
  // Replace with your S3 bucket URL or local path
  baseUrl: process.env.NEXT_PUBLIC_POINTCLOUD_URL ?? "/sample/",
};

export default function Page() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <PanoCloudViewer source={SOURCE} theme="dark" />
    </div>
  );
}
