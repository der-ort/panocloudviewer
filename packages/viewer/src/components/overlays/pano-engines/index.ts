import type { PanoEngine } from "@der-ort/pano-cloud-viewer-core";
import type { PanoEngineInit } from "./types";
import { initPannellum } from "./pannellum";
import { initPhotoSphere } from "./photo-sphere";

export type { PanoEngineInit, PanoEngineInstance } from "./types";

/** Maps the `panoEngine` config value to its lazy CDN-loaded engine adapter. */
const ENGINES: Record<PanoEngine, PanoEngineInit> = {
  pannellum: initPannellum,
  "photo-sphere-viewer": initPhotoSphere,
};

/** Resolve an engine adapter, falling back to the default (PSV) for unknown values. */
export function getPanoEngine(engine: PanoEngine): PanoEngineInit {
  return ENGINES[engine] ?? initPhotoSphere;
}
