/**
 * Minimal Viewer
 *
 * The simplest possible setup — just the PanoCloudViewer component with a
 * point cloud source. Renders a fullscreen 3D point cloud viewer with all
 * default controls, toolbar, and sidebar.
 *
 * Usage:
 *   import MinimalViewer from './minimal-viewer';
 *   <MinimalViewer />
 */
"use client";

import React from "react";
import { PanoCloudViewer } from "@der-ort/pano-cloud-viewer";
import "@der-ort/pano-cloud-viewer/themes/smart-agile.css";

const SOURCE = {
  type: "s3" as const,
  baseUrl: "/sample/", // Replace with your S3 bucket URL
};

export default function MinimalViewer() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <PanoCloudViewer source={SOURCE} theme="dark" />
    </div>
  );
}
