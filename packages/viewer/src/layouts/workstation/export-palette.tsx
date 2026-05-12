"use client";

import React, { useState, useCallback } from "react";
import { Download, Image } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { ExportManager } from "../../core/export-manager";
import { FloatingPalette } from "./floating-palette";
import type { ExportView, ExportFormat } from "../../types";

const VIEWS: { value: ExportView; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" },
];

export function ExportPalette() {
  const { exporter } = useViewer();
  const [view, setView] = useState<ExportView>("top");
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [bg, setBg] = useState<"white" | "black" | "transparent">("white");
  const [exporting, setExporting] = useState(false);

  const doExport = useCallback(async () => {
    if (!exporter) return;
    setExporting(true);
    try {
      const url = await exporter.capture({ view, scale, background: bg, format, showScaleBar: false });
      ExportManager.download(url, `export-${view}-${scale}x.${format}`);
    } finally {
      setExporting(false);
    }
  }, [exporter, view, scale, bg, format]);

  return (
    <FloatingPalette title="Export" icon={<Image size={12} />} defaultCollapsed>
      <div className="flex gap-1">
        {VIEWS.map(v => (
          <button key={v.value} onClick={() => setView(v.value)} className={cn(
            "text-[10px] px-2 py-0.5 rounded transition-colors",
            view === v.value ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40",
          )}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-1">
        <div className="flex gap-1">
          {([1, 2, 4] as const).map(s => (
            <button key={s} onClick={() => setScale(s)} className={cn(
              "text-[10px] px-1.5 py-0.5 rounded transition-colors",
              scale === s ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40",
            )}>
              {s}x
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["png", "jpeg"] as const).map(f => (
            <button key={f} onClick={() => setFormat(f)} className={cn(
              "text-[10px] px-1.5 py-0.5 rounded transition-colors",
              format === f ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40",
            )}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mt-1">
        {(["white", "black", "transparent"] as const).map(b => (
          <button key={b} onClick={() => setBg(b)} className={cn(
            "text-[10px] px-1.5 py-0.5 rounded transition-colors",
            bg === b ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40",
          )}>
            {b === "transparent" ? "Alpha" : b}
          </button>
        ))}
      </div>

      <button
        onClick={doExport}
        disabled={!exporter || exporting}
        className={cn(
          "flex items-center justify-center gap-1.5 w-full mt-2 py-1.5 rounded text-xs font-medium transition-colors",
          "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)]",
          (!exporter || exporting) && "opacity-40 cursor-not-allowed",
        )}
      >
        <Download size={12} />
        {exporting ? "Exporting..." : "Download"}
      </button>
    </FloatingPalette>
  );
}
