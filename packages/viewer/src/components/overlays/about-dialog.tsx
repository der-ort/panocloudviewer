"use client";

import React from "react";
import { X } from "lucide-react";

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl p-6 w-80 text-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-[hsl(var(--brand))] font-mono text-xs uppercase tracking-widest">About</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="mb-4">
          <p className="font-bold text-foreground text-base">PanoCloud Viewer</p>
          <p className="text-muted-foreground text-xs mt-0.5">@der-ort/pano-cloud-viewer</p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          A modular point cloud and panorama viewer built with Next.js 15,
          potree-core, Three.js, and shadcn/ui.
        </p>

        <div className="space-y-1 text-xs text-muted-foreground border-t border-[hsl(var(--border))] pt-3">
          <p>Engine: potree-core + Three.js</p>
          <p>Panoramas: Pannellum 2.5.6</p>
          <p>UI: shadcn/ui + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
