"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "../lib/utils";
import { useViewer } from "../providers/viewer-provider";
import { useData } from "../providers/data-provider";
import { SceneManager } from "../core/scene-manager";
import { PointCloudLoader } from "../core/point-cloud-loader";
import { MeasurementManager } from "../core/measurement-manager";
import { MarkerManager } from "../core/marker-manager";
import { CameraAnimator } from "../core/camera-animator";
import { ExportManager } from "../core/export-manager";
import { MinimapRenderer } from "../core/minimap-renderer";
import { createAdapter } from "../data/file-source-adapter";
import * as THREE from "three";

interface ViewportProps {
  className?: string;
}

export function Viewport({ className }: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  const {
    config,
    setSceneManager, setLoader, setMeasurementManager, setMarkerManager,
    setCameraAnimator, setExporter, setMinimap,
    setFps, activeTool, pointBudget,
    showMarkers, showMinimap, setMeasurementList, setSelectedCamera,
  } = useViewer();
  const { cameras, metadata } = useData();

  const smRef = useRef<SceneManager | null>(null);
  const markerRef = useRef<MarkerManager | null>(null);
  const measureRef = useRef<MeasurementManager | null>(null);
  const minimapRef = useRef<MinimapRenderer | null>(null);

  // Init Three.js scene once
  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;

    const adapter = createAdapter(config.source);
    const sm = new SceneManager({
      canvas: containerRef.current,
      onFpsUpdate: setFps,
    });

    const loader = new PointCloudLoader(sm, adapter);
    const measureMgr = new MeasurementManager(sm.scene);
    measureMgr.onChange = (list) => setMeasurementList(list);

    const markerMgr = new MarkerManager(sm.scene);
    const anim = new CameraAnimator(sm.camera, sm.controls);
    const exporter = new ExportManager(sm);
    const minimapRdr = new MinimapRenderer(sm);

    smRef.current = sm;
    markerRef.current = markerMgr;
    measureRef.current = measureMgr;
    minimapRef.current = minimapRdr;

    setSceneManager(sm);
    setLoader(loader);
    setMeasurementManager(measureMgr);
    setMarkerManager(markerMgr);
    setCameraAnimator(anim);
    setExporter(exporter);
    setMinimap(minimapRdr);

    sm.start();

    // Load point cloud
    loader.load("metadata.json", pointBudget).catch(console.error);

    return () => {
      sm.dispose();
      measureMgr.dispose();
      markerMgr.dispose();
      minimapRdr.dispose();
      initialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach minimap canvas after init
  useEffect(() => {
    if (minimapRef.current && minimapCanvasRef.current) {
      minimapRef.current.attach(minimapCanvasRef.current);
    }
  }, [showMinimap]);

  // Rebuild markers when cameras load
  useEffect(() => {
    if (markerRef.current && cameras.length > 0) {
      markerRef.current.build(cameras);
      markerRef.current.setVisible(showMarkers);
    }
  }, [cameras, showMarkers]);

  // Sync marker visibility
  useEffect(() => {
    markerRef.current?.setVisible(showMarkers);
  }, [showMarkers]);

  // Sync point budget
  useEffect(() => {
    smRef.current?.pointClouds && (smRef.current as SceneManager & { loader?: PointCloudLoader });
    // Access through context loader
  }, [pointBudget]);

  // Click handler for measurements and marker clicks
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sm = smRef.current;
    if (!sm) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Marker click
    if (activeTool === "none" && markerRef.current) {
      const hits = sm.raycast(nx, ny, markerRef.current.getMeshes());
      if (hits.length > 0) {
        const idx: number = (hits[0].object as THREE.Mesh).userData.cameraIndex;
        markerRef.current.setSelected(idx);
        setSelectedCamera(cameras[idx]);
        config.onCameraSelect?.(cameras[idx]);
      }
    }

    // Measurement clicks — raycast against point cloud
    if (activeTool.startsWith("measure-") && measureRef.current) {
      const type = activeTool.replace("measure-", "") as import("../types").MeasurementType;
      // Try to hit the point cloud or a helper plane at average Z
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), sm.camera);
      const planeZ = sm.controls.target.z;
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -planeZ);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hit);
      if (hit) {
        if (!measureRef.current.activeMeasurement) {
          measureRef.current.start(type);
        }
        measureRef.current.addPoint(hit);
      }
    }
  }, [activeTool, cameras, config]);

  // Right-click to finish measurement
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (activeTool.startsWith("measure-") && measureRef.current?.activeMeasurement) {
      measureRef.current.finish();
    }
  }, [activeTool]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-[hsl(var(--viewport-bg))]", className)}>
      {/* Main 3D canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ cursor: activeTool !== "none" ? "crosshair" : "default" }}
      />

      {/* Minimap overlay */}
      {showMinimap && (
        <div className="absolute bottom-10 left-3 w-44 h-44 rounded-lg overflow-hidden border border-white/10 shadow-lg">
          <canvas
            ref={minimapCanvasRef}
            width={176}
            height={176}
            className="w-full h-full"
          />
          <div className="absolute top-1 left-2 text-[9px] text-white/40 font-mono pointer-events-none">
            OVERVIEW
          </div>
        </div>
      )}

      {/* Active tool hint */}
      {activeTool !== "none" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-[hsl(var(--brand))] text-xs font-mono px-3 py-1 rounded-full pointer-events-none">
          {activeTool === "measure-point" && "Click to place point • Esc to cancel"}
          {activeTool === "measure-distance" && "Click 2 points • Right-click to finish"}
          {activeTool === "measure-height" && "Click start then end point"}
          {activeTool === "measure-area" && "Click polygon vertices • Right-click to close"}
          {activeTool === "measure-angle" && "Click 3 points (vertex is middle)"}
          {activeTool === "section-box" && "Drag to define clipping box"}
        </div>
      )}

      {/* Loading metadata info */}
      {metadata && (
        <div className="absolute bottom-10 right-3 text-[10px] font-mono text-white/30 text-right pointer-events-none">
          {(metadata.points / 1e6).toFixed(1)}M pts
        </div>
      )}
    </div>
  );
}
