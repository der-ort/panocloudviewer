"use client";

import React, { useEffect, useRef } from "react";
import { X, Navigation } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { getPanoEngine, type PanoEngineInstance } from "./pano-engines";

export function PanoViewer() {
  const { selectedCamera, setSelectedCamera, panoEngine, setPanoEngine } = useViewer();
  const tPano = useLocale().panoViewer;
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<PanoEngineInstance | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!selectedCamera?.image || !container) return;

    let cancelled = false;
    const init = getPanoEngine(panoEngine);

    // Tear down any previous engine before mounting the next.
    instanceRef.current?.destroy();
    instanceRef.current = null;

    init(container, selectedCamera)
      .then(instance => {
        // The camera/engine may have changed while the CDN module loaded.
        if (cancelled) { instance.destroy(); return; }
        instanceRef.current = instance;
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [selectedCamera, panoEngine]);

  if (!selectedCamera) return null;

  return (
    <div className="absolute inset-0 z-40 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <Navigation size={14} className="text-[hsl(var(--brand))]" />
          <span className="text-sm font-mono text-white">{selectedCamera.name}</span>
          {selectedCamera.position && (
            <span className="text-xs text-white/50 font-mono hidden sm:block">
              {selectedCamera.position.x.toFixed(2)}, {selectedCamera.position.y.toFixed(2)}, {selectedCamera.position.z.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Engine switch — A/B compare Pannellum vs Photo Sphere Viewer */}
          <div className="flex items-center rounded-md border border-white/15 overflow-hidden text-[11px] font-mono">
            {(["pannellum", "photo-sphere-viewer"] as const).map((eng) => (
              <button
                key={eng}
                onClick={() => setPanoEngine(eng)}
                className={
                  panoEngine === eng
                    ? "px-2 py-0.5 bg-[hsl(var(--brand))] text-black"
                    : "px-2 py-0.5 text-white/60 hover:text-white hover:bg-white/10"
                }
                title={eng === "pannellum" ? "Pannellum" : "Photo Sphere Viewer"}
              >
                {eng === "pannellum" ? "Pannellum" : "PSV"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedCamera(null)}
            className="text-white/70 hover:text-white transition-colors p-1"
            title={tPano.close}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Panorama engine mounts here (Pannellum / Photo Sphere Viewer) */}
      <div ref={containerRef} key={panoEngine} className="flex-1" />
    </div>
  );
}
