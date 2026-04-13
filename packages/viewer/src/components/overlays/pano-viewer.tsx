"use client";

import React, { useEffect, useRef } from "react";
import { X, Navigation } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";

export function PanoViewer() {
  const { selectedCamera, setSelectedCamera } = useViewer();
  const tPano = useLocale().panoViewer;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!selectedCamera?.image || !containerRef.current) return;

    // Dynamically load Pannellum
    const initPannellum = async () => {
      if (!(window as any).pannellum) {
        // Inject CSS
        if (!document.getElementById("pannellum-css")) {
          const link = document.createElement("link");
          link.id = "pannellum-css";
          link.rel = "stylesheet";
          link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
          document.head.appendChild(link);
        }
        // Inject JS
        await new Promise<void>(resolve => {
          if (document.getElementById("pannellum-js")) { resolve(); return; }
          const script = document.createElement("script");
          script.id = "pannellum-js";
          script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }

      viewerRef.current = (window as any).pannellum.viewer(containerRef.current!, {
        type: "equirectangular",
        panorama: selectedCamera.image,
        autoLoad: true,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        compass: false,
        yaw: selectedCamera.yaw_deg ?? 0,
        hfov: 100,
        minHfov: 30,
        maxHfov: 150,
      });
    };

    initPannellum().catch(console.error);

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [selectedCamera]);

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
        <button
          onClick={() => setSelectedCamera(null)}
          className="text-white/70 hover:text-white transition-colors p-1"
          title={tPano.close}
        >
          <X size={18} />
        </button>
      </div>

      {/* Pannellum container */}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
