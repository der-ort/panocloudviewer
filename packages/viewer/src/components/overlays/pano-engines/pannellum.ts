"use client";

import type { PanoEngineInit } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any -- Pannellum ships no types */

const PANNELLUM_VERSION = "2.5.6";
const CDN = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build`;

/**
 * Cached load promise that resolves only once `window.pannellum` is actually
 * ready. Reusing a single promise (instead of re-checking for the `<script>`
 * tag) avoids a race where a second caller sees the tag already injected but
 * the global not yet defined — which previously crashed with
 * `window.pannellum.viewer` being `undefined` (e.g. under React StrictMode's
 * double-invoked effects, or when switching engines mid-load).
 */
let pannellumPromise: Promise<any> | null = null;

function loadPannellum(): Promise<any> {
  const w = window as any;
  if (w.pannellum) return Promise.resolve(w.pannellum);
  if (pannellumPromise) return pannellumPromise;

  pannellumPromise = new Promise<any>((resolve, reject) => {
    if (!document.getElementById("pannellum-css")) {
      const link = document.createElement("link");
      link.id = "pannellum-css";
      link.rel = "stylesheet";
      link.href = `${CDN}/pannellum.css`;
      document.head.appendChild(link);
    }

    const onLoad = () => resolve((window as any).pannellum);
    const onError = () => {
      pannellumPromise = null; // allow a later retry
      reject(new Error("Failed to load Pannellum from CDN"));
    };

    const existing = document.getElementById("pannellum-js") as HTMLScriptElement | null;
    if (existing) {
      // A previous load is already in flight — wait for it rather than racing.
      if ((window as any).pannellum) { onLoad(); return; }
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }

    const script = document.createElement("script");
    script.id = "pannellum-js";
    script.src = `${CDN}/pannellum.js`;
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);
  });
  return pannellumPromise;
}

/**
 * Pannellum engine — optional fallback panorama renderer (Photo Sphere Viewer is
 * the default). Loaded as a UMD global from CDN via injected <script>/<link>, so
 * it stays out of the SSR/initial bundle.
 */
export const initPannellum: PanoEngineInit = async (container, camera) => {
  if (!camera.image) return { destroy() {} };

  const pannellum = await loadPannellum();

  const viewer = pannellum.viewer(container, {
    type: "equirectangular",
    panorama: camera.image,
    autoLoad: true,
    showZoomCtrl: false,
    showFullscreenCtrl: false,
    compass: false,
    yaw: camera.yaw_deg ?? 0,
    hfov: 100,
    minHfov: 30,
    maxHfov: 150,
  });

  return {
    destroy() {
      try { viewer.destroy(); } catch { /* already torn down */ }
    },
  };
};
