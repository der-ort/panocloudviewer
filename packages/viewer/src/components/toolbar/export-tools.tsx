"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { ToolbarIconBtn } from "./main-toolbar";
import { ExportManager } from "../../core/export-manager";
import type { ExportView, ExportFormat } from "../../types";

const VIEWS: { value: ExportView; label: string }[] = [
  { value: "top", label: "Top (Plan)" },
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" },
];

export function ExportTools() {
  const { exporter } = useViewer();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ExportView>("top");
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [bg, setBg] = useState<"white" | "black" | "transparent">("white");
  const [fmt, setFmt] = useState<ExportFormat>("png");
  const [exporting, setExporting] = useState(false);

  const doExport = async () => {
    if (!exporter) return;
    setExporting(true);
    try {
      const url = await exporter.capture({ view, scale, background: bg, showScaleBar: false, format: fmt });
      const date = new Date().toISOString().slice(0, 10);
      ExportManager.download(url, `pointcloud_${view}_${date}.${fmt}`);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <ToolbarIconBtn
        icon={<Download size={14} />}
        title="Export orthographic image"
        active={open}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-xl z-50 p-3 w-52 text-xs text-foreground">
          <p className="font-semibold mb-2 text-[hsl(var(--brand))]">Export Image</p>

          <label className="block mb-1 text-muted-foreground">View</label>
          <select value={view} onChange={e => setView(e.target.value as ExportView)}
            className="w-full mb-2 bg-muted text-foreground rounded px-1 py-0.5 text-xs border border-[hsl(var(--border))]">
            {VIEWS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>

          <label className="block mb-1 text-muted-foreground">Scale</label>
          <div className="flex gap-1 mb-2">
            {([1, 2, 4] as const).map(s => (
              <button key={s} onClick={() => setScale(s)}
                className={`flex-1 py-0.5 rounded text-xs border transition-colors ${scale === s ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`}>
                {s}x
              </button>
            ))}
          </div>

          <label className="block mb-1 text-muted-foreground">Background</label>
          <div className="flex gap-1 mb-2">
            {(["white", "black", "transparent"] as const).map(b => (
              <button key={b} onClick={() => setBg(b)}
                className={`flex-1 py-0.5 rounded text-xs border transition-colors capitalize ${bg === b ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`}>
                {b === "transparent" ? "α" : b}
              </button>
            ))}
          </div>

          <label className="block mb-1 text-muted-foreground">Format</label>
          <div className="flex gap-1 mb-3">
            {(["png", "jpeg"] as const).map(f => (
              <button key={f} onClick={() => setFmt(f)}
                className={`flex-1 py-0.5 rounded text-xs border transition-colors uppercase ${fmt === f ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={doExport}
            disabled={exporting}
            className="w-full py-1.5 bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] rounded font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
            {exporting ? "Exporting…" : "Download"}
          </button>
        </div>
      )}
    </div>
  );
}
