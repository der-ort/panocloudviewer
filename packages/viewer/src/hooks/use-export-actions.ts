"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";
import { ExportManager } from "@der-ort/pano-cloud-viewer-core";
import type { ExportOptions } from "@der-ort/pano-cloud-viewer-core";

export function useExportActions() {
  const { exporter } = useViewer();

  const capture = useCallback(async (options: ExportOptions) => {
    if (!exporter) return null;
    return exporter.capture(options);
  }, [exporter]);

  const download = useCallback((dataUrl: string, filename: string) => {
    ExportManager.download(dataUrl, filename);
  }, []);

  return { capture, download };
}
