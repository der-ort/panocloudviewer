"use client";

import { useCallback } from "react";
import { useViewer } from "../providers/viewer-provider";
import { ExportManager } from "../core/export-manager";
import type { ExportOptions } from "../types";

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
