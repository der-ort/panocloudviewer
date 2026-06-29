"use client";

import React from "react";
import { X } from "lucide-react";
import { useLocale } from "../../i18n/locale-context";
import { useViewer } from "../../providers/viewer-provider";
import { PCV_VERSION, PCV_BUILD } from "../../version";

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const t = useLocale().about;
  const { loader } = useViewer();
  const geo = loader?.getGeoInfo();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl p-6 w-80 text-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-[hsl(var(--brand))] font-mono text-xs uppercase tracking-widest">{t.title}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="mb-4">
          <p className="font-bold text-foreground text-base">{t.productName}</p>
          <p className="text-muted-foreground text-xs mt-0.5">@der-ort/pano-cloud-viewer</p>
          <p className="text-[10px] font-mono text-muted-foreground/70 mt-1" title="Viewer version · build">
            v{PCV_VERSION} · {PCV_BUILD}
          </p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t.description}</p>

        <div className="space-y-1 text-xs text-muted-foreground border-t border-[hsl(var(--border))] pt-3">
          <p>{t.engineLabel}</p>
          <p>{t.panoramasLabel}</p>
          <p>{t.uiLabel}</p>
        </div>

        {/* Georeference status — whether the loaded cloud carries a CRS. */}
        {geo && (
          <div className="text-xs text-muted-foreground border-t border-[hsl(var(--border))] pt-3 mt-3">
            <p>
              <span className="text-foreground">Georeference:</span>{" "}
              {geo.georeferenced ? "yes" : "no (local coordinates)"}
            </p>
            {geo.georeferenced && (
              <p className="font-mono text-[10px] mt-0.5 break-all" title={geo.projection}>
                {geo.projection.length > 80 ? geo.projection.slice(0, 80) + "…" : geo.projection}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
