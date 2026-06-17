import type { CameraData } from "@der-ort/pano-cloud-viewer-core";

/**
 * A live panorama engine instance. Engines render an equirectangular 360° image
 * into a host element and expose a single `destroy()` for teardown.
 */
export interface PanoEngineInstance {
  /** Tear down the engine, free GPU/DOM resources, and detach listeners. */
  destroy(): void;
}

/**
 * An engine adapter: given a container element and the selected camera, mount a
 * 360° viewer and return a handle to destroy it. Implementations load their
 * heavy WebGL libraries lazily (CDN) so nothing ships in the SSR/initial bundle.
 */
export type PanoEngineInit = (
  container: HTMLElement,
  camera: CameraData,
) => Promise<PanoEngineInstance>;
