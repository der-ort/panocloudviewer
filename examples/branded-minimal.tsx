/**
 * Branded Minimal Viewer
 *
 * Demonstrates two customisation axes together:
 *
 *  1. THEMING — Override `.pcv` CSS custom properties to apply a custom brand.
 *     Tokens are scoped to `.pcv` so they never bleed into the host app.
 *     Override both light (`.pcv`) and dark (`.pcv.dark`) modes independently.
 *
 *  2. LAYOUT PHILOSOPHY — Use `MinimalLayout` via the `children` render prop.
 *     MinimalLayout renders the viewport full-bleed with a compact floating
 *     toolbar (navigation modes + fit-to-view + settings popover). It is the
 *     right choice for public-facing embeds, digital-twin dashboards, and any
 *     scenario where the UI should stay out of the way.
 *
 * Copy-paste this file into apps/web/src/app/page.tsx and run `pnpm dev`.
 *
 * Usage:
 *   import BrandedMinimal from './branded-minimal';
 *   <BrandedMinimal />
 */
"use client";

import React from "react";
import {
  PanoCloudViewer,
  MinimalLayout,
} from "@der-ort/pano-cloud-viewer";
import "@der-ort/pano-cloud-viewer/themes/base.css";

// ── Data source ─────────────────────────────────────────────────────────────
// Replace with your S3 bucket URL or a local dev-server path.
const SOURCE = {
  type: "s3" as const,
  baseUrl: process.env.NEXT_PUBLIC_POINTCLOUD_URL ?? "/sample/",
};

// ── Brand token overrides ────────────────────────────────────────────────────
// All tokens are scoped to `.pcv` — they only apply inside the viewer element
// and will not affect the rest of your page.
//
// Light mode: teal accent (#00B4A6) on a warm off-white background.
// Dark mode:  orange accent (#FF7A3D) on a near-black background.
//
// Token reference:
//   --brand              Primary accent colour (buttons, active states, links)
//   --brand-foreground   Text/icon colour on brand backgrounds
//   --background         Viewer background
//   --foreground         Primary text colour
//   --card / --card-foreground   Toolbar, sidebar surfaces
//   --border             Dividers, outlines
//   --muted / --muted-foreground  Subtle backgrounds and secondary text
//   --toolbar-bg         Floating toolbar background (viewer-specific)
//   --toolbar-border     Floating toolbar border  (viewer-specific)
//   --sidebar-bg         Sidebar surface          (viewer-specific)
//   --viewport-bg        Canvas background        (viewer-specific)
const BRAND_CSS = `
  /* ── Light mode ──────────────────────────────────────────────── */
  .pcv {
    --brand:                 174 100% 35%;   /* teal  #00B4A6 */
    --brand-foreground:      0 0% 100%;

    --background:            40 20% 96%;
    --foreground:            0 0% 10%;

    --card:                  0 0% 100%;
    --card-foreground:       0 0% 10%;
    --border:                40 10% 88%;
    --muted:                 40 10% 92%;
    --muted-foreground:      0 0% 45%;

    --primary:               174 100% 35%;
    --primary-foreground:    0 0% 100%;

    --toolbar-bg:            0 0% 100%;
    --toolbar-border:        40 10% 85%;
    --sidebar-bg:            40 15% 94%;
    --viewport-bg:           0 0% 8%;
  }

  /* ── Dark mode ───────────────────────────────────────────────── */
  .pcv.dark,
  .pcv[data-theme="dark"] {
    --brand:                 20 100% 61%;    /* orange #FF7A3D */
    --brand-foreground:      0 0% 5%;

    --background:            0 0% 4%;
    --foreground:            0 0% 92%;

    --card:                  0 0% 8%;
    --card-foreground:       0 0% 92%;
    --border:                0 0% 14%;
    --muted:                 0 0% 12%;
    --muted-foreground:      0 0% 50%;

    --primary:               20 100% 61%;
    --primary-foreground:    0 0% 5%;

    --toolbar-bg:            0 0% 7%;
    --toolbar-border:        0 0% 13%;
    --sidebar-bg:            0 0% 5%;
    --viewport-bg:           0 0% 2%;
  }
`;

// ── Component ────────────────────────────────────────────────────────────────
export default function BrandedMinimal() {
  return (
    <>
      {/* Brand overrides scoped to .pcv (rendered inline by React) — zero host bleed */}
      <style>{BRAND_CSS}</style>

      <div style={{ width: "100vw", height: "100vh" }}>
        {/*
          The `children` render prop gives you full layout control.
          PanoCloudViewer sets up all providers (ViewerProvider, DataProvider,
          ThemeProvider, LocaleProvider, ComponentsProvider) and then calls
          children(viewport) — hand `viewport` to the layout of your choice.

          MinimalLayout places the canvas full-bleed and overlays a compact
          floating toolbar built with the same action hooks used below in
          custom-toolbar-hooks.tsx.
        */}
        <PanoCloudViewer source={SOURCE} theme="dark">
          {(viewport) => <MinimalLayout viewport={viewport} />}
        </PanoCloudViewer>
      </div>
    </>
  );
}
