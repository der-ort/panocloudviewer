"use client";

import React from "react";
import { MinimalToolbar } from "./minimal-toolbar";

interface MinimalLayoutProps {
  viewport: React.ReactNode;
}

export function MinimalLayout({ viewport }: MinimalLayoutProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0">{viewport}</div>
      <MinimalToolbar />
    </div>
  );
}
