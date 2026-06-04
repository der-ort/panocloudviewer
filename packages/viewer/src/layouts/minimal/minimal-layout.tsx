"use client";

import React from "react";
import { MinimalToolbar } from "./minimal-toolbar";

interface MinimalLayoutProps {
  viewport: React.ReactNode;
}

/**
 * Scales UI chrome via the `--pcv-scale` CSS custom property (set on the `.pcv`
 * root by `PanoCloudViewer`'s `uiScale` prop). Applied to chrome only — never the
 * viewport. `zoom` isn't in React's CSSProperties, so the object is cast.
 */
const chromeScale = { zoom: "var(--pcv-scale, 1)" } as React.CSSProperties;

export function MinimalLayout({ viewport }: MinimalLayoutProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0">{viewport}</div>
      {/* Chrome (toolbar + its settings popover) scales; the viewport above does not. */}
      <div style={chromeScale}>
        <MinimalToolbar />
      </div>
    </div>
  );
}
