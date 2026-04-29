"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CameraData } from "../types";
import type { PointCloudMetadata } from "../core/point-cloud-loader";
import type { FileSourceAdapter } from "../data/file-source-adapter";

interface DataContextValue {
  cameras: CameraData[];
  metadata: PointCloudMetadata | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

// Re-export so types are importable
export type { PointCloudMetadata };

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}

interface DataProviderProps {
  adapter: FileSourceAdapter;
  children: ReactNode;
}

export function DataProvider({ adapter, children }: DataProviderProps) {
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [metadata, setMetadata] = useState<PointCloudMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const [cams, meta] = await Promise.allSettled([
          adapter.fetchJson<CameraData[]>("cameras.json"),
          adapter.fetchJson<PointCloudMetadata>("metadata.json"),
        ]);
        if (cancelled) return;
        if (cams.status === "fulfilled") {
          const resolved = (cams.value ?? []).map(cam => ({
            ...cam,
            image: cam.image ? adapter.resolveUrl(cam.image) : null,
            thumbnail: cam.thumbnail ? adapter.resolveUrl(cam.thumbnail) : null,
          }));
          setCameras(resolved);
        }
        if (meta.status === "fulfilled") setMetadata(meta.value);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [adapter, rev]);

  const reload = () => setRev(r => r + 1);

  return (
    <DataContext.Provider value={{ cameras, metadata, loading, error, reload }}>
      {children}
    </DataContext.Provider>
  );
}
