"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { ToolbarIconBtn } from "./main-toolbar";
import { ExportManager } from "../../core/export-manager";
import type { ExportView, ExportFormat } from "../../types";

export function ExportTools() {
  const { exporter } = useViewer();
  const t = useLocale().exportPanel;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ExportView>("top");
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [bg, setBg] = useState<"white" | "black" | "transparent">("white");
  const [fmt, setFmt] = useState<ExportFormat>("png");
  const [exporting, setExporting] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  // Update position when popover opens
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [open]);

  // Close on click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
      btnRef.current && !btnRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

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

  const views: { value: ExportView; label: string }[] = [
    { value: "top",   label: t.viewTop },
    { value: "front", label: t.viewFront },
    { value: "side",  label: t.viewSide },
    { value: "back",  label: t.viewBack },
  ];

  const bgLabels: Record<"white" | "black" | "transparent", string> = {
    white:       t.bgWhite,
    black:       t.bgBlack,
    transparent: t.bgTransparent,
  };

  return (
    <div ref={btnRef}>
      <ToolbarIconBtn
        icon={<Download size={14} />}
        title={t.exportImageTitle}
        active={open}
        onClick={() => setOpen(!open)}
      />
      {open && createPortal(
        <div
          ref={popoverRef}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
          className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-xl p-3 w-52 text-xs text-foreground"
        >
          <p className="font-semibold mb-2 text-[hsl(var(--brand))]">{t.title}</p>

          <label className="block mb-1 text-muted-foreground">{t.view}</label>
          <select value={view} onChange={e => setView(e.target.value as ExportView)}
            className="w-full mb-2 bg-muted text-foreground rounded px-1 py-0.5 text-xs border border-[hsl(var(--border))]">
            {views.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>

          <label className="block mb-1 text-muted-foreground">{t.scale}</label>
          <div className="flex gap-1 mb-2">
            {([1, 2, 4] as const).map(s => (
              <button key={s} onClick={() => setScale(s)}
                className={`flex-1 py-0.5 rounded text-xs border transition-colors ${scale === s ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`}>
                {s}x
              </button>
            ))}
          </div>

          <label className="block mb-1 text-muted-foreground">{t.background}</label>
          <div className="flex gap-1 mb-2">
            {(["white", "black", "transparent"] as const).map(b => (
              <button key={b} onClick={() => setBg(b)}
                className={`flex-1 py-0.5 rounded text-xs border transition-colors ${bg === b ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`}>
                {bgLabels[b]}
              </button>
            ))}
          </div>

          <label className="block mb-1 text-muted-foreground">{t.format}</label>
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
            {exporting ? t.exporting : t.download}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
