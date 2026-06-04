/**
 * CAD / Workstation Viewer
 *
 * Demonstrates the "professional technical" layout philosophy:
 *
 *  - WorkstationLayout — floating palettes (Tools, Display, View Settings,
 *    Export) attached to a collapsible sidebar. Status bar with live FPS and
 *    point count. Best for desktop power-users: surveyors, AEC professionals,
 *    and anyone who needs the full toolset visible at once.
 *
 *  - uiMode="professional" — enables the full toolset (all measurements,
 *    clipping, display controls, export).
 *
 *  - theme="dark" — dark environment suited for long CAD sessions and
 *    accurate colour perception of the point cloud.
 *
 *  - Custom technical dark brand via `.pcv.dark` token overrides:
 *    cyan (#00D8E8) primary accent, amber (#F5A623) secondary/highlight,
 *    neutral cool greys — typical of CAD/GIS applications.
 *
 * When to use WorkstationLayout:
 *   ✓ Desktop-first: users sit at a screen, may use a numpad or 3D mouse
 *   ✓ All tools need to be reachable with one click (no hamburger menus)
 *   ✓ Status feedback (FPS, active tool) is important for QA workflows
 *   ✓ Point clouds > 50 M points where display quality presets matter
 *
 * When to prefer MinimalLayout instead:
 *   ✗ Public embed or digital-twin dashboard (less UI noise)
 *   ✗ Mobile / touch-first (floating palettes need hover states)
 *
 * Usage:
 *   import CadWorkstation from './cad-workstation';
 *   <CadWorkstation />
 */
"use client";

import React from "react";
import {
  PanoCloudViewer,
  WorkstationLayout,
} from "@der-ort/pano-cloud-viewer";
import "@der-ort/pano-cloud-viewer/themes/base.css";

// ── Data source ─────────────────────────────────────────────────────────────
const SOURCE = {
  type: "s3" as const,
  baseUrl: process.env.NEXT_PUBLIC_POINTCLOUD_URL ?? "/sample/",
};

// ── CAD dark brand ───────────────────────────────────────────────────────────
// Override only `.pcv.dark` — we always use theme="dark" for this layout.
// Cyan + amber on cool neutral greys: a palette that reads well against
// coloured point clouds (RGB, classification, intensity) without fighting them.
//
// Token map:
//   --brand         Primary accent: active buttons, highlights, tooltips
//   --primary       Filled button background (same as brand here)
//   --ring          Focus ring colour
//   --background    Outermost viewer background
//   --card          Palette / sidebar surface
//   --border        Dividers + palette outlines
//   --muted         Subtle grouped backgrounds inside palettes
//   --toolbar-bg / --toolbar-border   Palette header surface
//   --sidebar-bg    Collapsible sidebar background
//   --viewport-bg   Canvas clear colour
const CAD_CSS = `
  /* Dark-only overrides — scoped to .pcv so host app is unaffected */
  .pcv.dark,
  .pcv[data-theme="dark"] {
    /* ── Accent ──────────────────────────────── */
    --brand:                 187 100% 45%;   /* cyan   #00D8E8 */
    --brand-foreground:      0 0% 5%;

    --primary:               187 100% 45%;
    --primary-foreground:    0 0% 5%;

    /* ── Amber highlight (used sparingly via .text-[hsl(var(--ring))]) */
    --ring:                  37 93% 55%;     /* amber  #F5A623 */

    /* ── Surface scale: near-black → very dark grey ── */
    --background:            220 14% 6%;
    --foreground:            210 10% 90%;

    --card:                  220 12% 10%;
    --card-foreground:       210 10% 90%;

    --popover:               220 12% 10%;
    --popover-foreground:    210 10% 90%;

    --secondary:             220 10% 14%;
    --secondary-foreground:  210 8% 80%;

    --muted:                 220 10% 13%;
    --muted-foreground:      210 6% 55%;

    --accent:                220 10% 16%;
    --accent-foreground:     210 8% 85%;

    --border:                220 10% 16%;
    --input:                 220 10% 16%;

    --destructive:           0 70% 50%;
    --destructive-foreground: 0 0% 98%;

    /* ── Viewer-specific ─────────────────────── */
    --toolbar-bg:            220 12% 9%;
    --toolbar-border:        220 10% 15%;
    --sidebar-bg:            220 12% 7%;
    --statusbar-bg:          220 12% 8%;
    --viewport-bg:           220 14% 4%;
  }
`;

// ── Component ────────────────────────────────────────────────────────────────
export default function CadWorkstation() {
  return (
    <>
      {/* Inject CAD brand — scoped to .pcv, zero host bleed */}
      <style>{CAD_CSS}</style>

      <div style={{ width: "100vw", height: "100vh" }}>
        {/*
          WorkstationLayout takes the `viewport` node and a `sidebarSide` prop
          ("left" | "right", default "left"). It renders:
            - Full-bleed viewport canvas
            - Collapsible sidebar with floating palette cards:
                ToolsPalette, DisplayPalette, ViewSettingsPalette, ExportPalette
            - Status bar: point count, budget, fps, active tool

          uiMode="professional" enables all tools in every palette.
          Omit or set to "lite" to show a reduced beginner toolset.
        */}
        <PanoCloudViewer source={SOURCE} theme="dark" uiMode="professional">
          {(viewport) => (
            <WorkstationLayout viewport={viewport} sidebarSide="left" />
          )}
        </PanoCloudViewer>
      </div>
    </>
  );
}
