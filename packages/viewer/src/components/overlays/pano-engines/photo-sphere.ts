"use client";

import type { PanoEngineInit } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any -- PSV is loaded at runtime from CDN, untyped here */

const PSV_VERSION = "5";
/**
 * jsDelivr's `+esm` endpoint rewrites the package's bare `three` import to a
 * resolved CDN ESM URL, so PSV pulls its OWN Three.js (currently ^0.184) without
 * an importmap and without clashing with the viewer's pinned three@0.170. The
 * panorama overlay is a fully separate scene, so two Three.js copies coexisting
 * is fine.
 */
const PSV_ESM_URL = `https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@${PSV_VERSION}/+esm`;
const PSV_CSS_URL = `https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@${PSV_VERSION}/index.css`;

/**
 * Runtime dynamic import that is opaque to the bundler. Using `new Function`
 * stops esbuild/webpack/Next from trying to statically resolve (and choke on)
 * the absolute `https://` module URL; the browser executes a native `import()`.
 */
const runtimeImport = new Function("u", "return import(u)") as (url: string) => Promise<any>;

let psvModulePromise: Promise<any> | null = null;
function loadPsv(): Promise<any> {
  if (!psvModulePromise) psvModulePromise = runtimeImport(PSV_ESM_URL);
  return psvModulePromise;
}

/**
 * Photo Sphere Viewer engine (https://photo-sphere-viewer.js.org).
 * Opt-in via `panoEngine="photo-sphere-viewer"`. Loaded lazily from CDN.
 */
export const initPhotoSphere: PanoEngineInit = async (container, camera) => {
  if (!camera.image) return { destroy() {} };

  if (!document.getElementById("psv-core-css")) {
    const link = document.createElement("link");
    link.id = "psv-core-css";
    link.rel = "stylesheet";
    link.href = PSV_CSS_URL;
    document.head.appendChild(link);
  }

  const mod = await loadPsv();
  const Viewer = mod.Viewer;
  if (!Viewer) throw new Error("Photo Sphere Viewer: `Viewer` export not found on CDN module");

  const viewer = new Viewer({
    container,
    panorama: camera.image,
    // PSV accepts an angle string; convert the camera's yaw (degrees) directly.
    defaultYaw: `${camera.yaw_deg ?? 0}deg`,
    // Built-in controls: zoom in/out, pan/move, and fullscreen. Mouse-wheel zoom
    // and drag-to-look are on by default; these add the on-screen buttons.
    navbar: ["zoom", "move", "fullscreen"],
    mousewheel: true,
    loadingTxt: "",
  });

  return {
    destroy() {
      try { viewer.destroy(); } catch { /* already torn down */ }
    },
  };
};
