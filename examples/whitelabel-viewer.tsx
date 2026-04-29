/**
 * White-label Viewer — "ACME Inc."
 *
 * Demonstrates how to customise the viewer for a client brand:
 *  - Custom locale strings (company name, UI labels)
 *  - Custom theme via CSS custom properties
 *  - Custom callback when a panorama camera is selected
 *
 * Usage:
 *   import AcmeViewer from './whitelabel-viewer';
 *   <AcmeViewer />
 */
"use client";

import React from "react";
import {
  PanoCloudViewer,
  createLocale,
  en,
} from "@der-ort/pano-cloud-viewer";
import "@der-ort/pano-cloud-viewer/themes/base.css";

// ── 1. Custom locale ────────────────────────────────────────────────────────
// Override only the strings you need — createLocale deep-merges into a base.
const acmeLocale = createLocale(en, {
  toolbar: {
    about: "About ACME Viewer",
  },
  about: {
    title: "ACME Point Cloud Viewer",
    version: "Powered by PanoCloud Viewer",
    description:
      "Internal tool for reviewing point cloud scans. Contact engineering@acme.inc for support.",
    close: "Close",
  },
});

// ── 2. Custom theme via CSS ─────────────────────────────────────────────────
// Inject CSS custom properties to override the default theme colours.
const ACME_THEME_CSS = `
  :root {
    --brand: 210 100% 50%;           /* ACME blue */
    --brand-foreground: 0 0% 100%;
    --font-heading: 'Inter', system-ui, sans-serif;
  }
  .dark {
    --brand: 210 100% 60%;
    --background: 220 20% 8%;
    --toolbar-bg: 220 20% 10%;
    --sidebar-bg: 220 20% 7%;
    --viewport-bg: 220 20% 4%;
  }
`;

// ── 3. Data source ──────────────────────────────────────────────────────────
const SOURCE = {
  type: "s3" as const,
  baseUrl: "https://scans.acme.inc/project-42/",
  // Optional: pass auth headers for private S3 buckets
  // headers: { Authorization: "Bearer <token>" },
};

export default function AcmeViewer() {
  return (
    <>
      {/* Inject the ACME theme overrides */}
      <style>{ACME_THEME_CSS}</style>

      <div style={{ width: "100vw", height: "100vh" }}>
        <PanoCloudViewer
          source={SOURCE}
          theme="dark"
          locale={acmeLocale}
        />
      </div>
    </>
  );
}
