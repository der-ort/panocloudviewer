"use client";

import React, { useState, useMemo } from "react";
import { Search, Navigation } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useData } from "../../providers/data-provider";
import { useLocale } from "../../i18n/locale-context";

export function PanoPanel() {
  const { cameraAnimator, markerManager, setSelectedCamera } = useViewer();
  const { cameras } = useData();
  const t = useLocale().panoPanel;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return cameras.filter(c => !q || c.name.toLowerCase().includes(q) || String(c.index).includes(q));
  }, [cameras, query]);

  const flyTo = (idx: number) => {
    const cam = cameras[idx];
    if (!cam || !cameraAnimator) return;
    setSelected(idx);
    markerManager?.setSelected(idx);
    if (cam.position) {
      cameraAnimator.flyToCamera([cam.position.x, cam.position.y, cam.position.z], cam.yaw_deg ?? 0);
    }
  };

  const openPano = (idx: number) => {
    const cam = cameras[idx];
    if (!cam) return;
    setSelected(idx);
    setSelectedCamera(cam);
    markerManager?.setSelected(idx);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-2 border-b border-[hsl(var(--border))] shrink-0">
        <div className="flex items-center gap-1.5 bg-muted rounded px-2 py-1">
          <Search size={11} className="text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">{filtered.length} / {cameras.length}</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-8 px-4">{t.noResults}</p>
        ) : (
          filtered.map(cam => (
            <div
              key={cam.index}
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-[hsl(var(--border)/0.4)] hover:bg-muted transition-colors
                ${selected === cam.index ? "bg-[hsl(var(--brand)/0.12)] border-l-2 border-l-[hsl(var(--brand))]" : ""}`}
              onClick={() => openPano(cam.index)}
            >
              {/* Thumbnail or placeholder */}
              <div className="w-10 h-7 rounded shrink-0 bg-muted overflow-hidden">
                {cam.image ? (
                  <img
                    src={cam.image}
                    alt={cam.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Navigation size={10} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono truncate text-foreground">{cam.name}</p>
                {cam.position && (
                  <p className="text-[9px] text-muted-foreground font-mono">
                    {cam.position.x.toFixed(1)}, {cam.position.y.toFixed(1)}, {cam.position.z.toFixed(1)}
                  </p>
                )}
              </div>

              <button
                onClick={e => { e.stopPropagation(); flyTo(cam.index); }}
                title={t.flyTo}
                className="shrink-0 text-muted-foreground hover:text-[hsl(var(--brand))] transition-colors"
              >
                <Navigation size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
