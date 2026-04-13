"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "../lib/utils";
import { useViewer } from "../providers/viewer-provider";
import { useData } from "../providers/data-provider";
import { useLocale } from "../i18n/locale-context";
import { SceneManager } from "../core/scene-manager";
import { PointCloudLoader } from "../core/point-cloud-loader";
import { MeasurementManager } from "../core/measurement-manager";
import { MarkerManager } from "../core/marker-manager";
import { CameraAnimator } from "../core/camera-animator";
import { ExportManager } from "../core/export-manager";
import { MinimapRenderer } from "../core/minimap-renderer";
import { ClipManager } from "../core/clip-manager";
import { createAdapter } from "../data/file-source-adapter";
import * as THREE from "three";

interface ViewportProps {
  className?: string;
}

export function Viewport({ className }: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);
  const t = useLocale().viewport;

  const {
    config,
    setSceneManager, setLoader, setMeasurementManager, setMarkerManager,
    setCameraAnimator, setExporter, setMinimap, setClipManager,
    setFps, activeTool, pointBudget,
    showMarkers, showMinimap, setMeasurementList, setSelectedCamera,
    setClipBoxEntries, setSelectedClipBoxId,
  } = useViewer();
  const { cameras, metadata } = useData();

  // Extract Z range from metadata for clip box height
  const metaZRef = useRef<{ min: number; max: number } | null>(null);
  useEffect(() => {
    if (metadata) {
      metaZRef.current = {
        min: metadata.boundingBox.min[2],
        max: metadata.boundingBox.max[2],
      };
    }
  }, [metadata]);

  const smRef = useRef<SceneManager | null>(null);
  const markerRef = useRef<MarkerManager | null>(null);
  const measureRef = useRef<MeasurementManager | null>(null);
  const minimapRef = useRef<MinimapRenderer | null>(null);
  const clipRef = useRef<ClipManager | null>(null);

  // Clip-box drag state
  const clipDragRef = useRef<{ startWorld: THREE.Vector3; planeZ: number } | null>(null);

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

    const clipMgr = new ClipManager(sm);
    clipMgr.onChange = (boxes) => setClipBoxEntries(boxes);
    clipMgr.onSelectChange = (id) => setSelectedClipBoxId(id);

    smRef.current = sm;
    markerRef.current = markerMgr;
    measureRef.current = measureMgr;
    minimapRef.current = minimapRdr;
    clipRef.current = clipMgr;

    setSceneManager(sm);
    setLoader(loader);
    setMeasurementManager(measureMgr);
    setMarkerManager(markerMgr);
    setCameraAnimator(anim);
    setExporter(exporter);
    setMinimap(minimapRdr);
    setClipManager(clipMgr);

    // Register minimap frame callback so it redraws every frame
    const minimapFrame = () => minimapRdr.update();
    sm.addFrameCallback(minimapFrame);

    sm.start();

    // Load point cloud and set minimap bounds
    loader.load("metadata.json", pointBudget).then(() => {
      // After load, compute world bounding box for minimap
      const pc = loader.getPointCloud();
      if (pc) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pca = pc as any;
        const box = pca.pcoGeometry?.boundingBox ?? pca.boundingBox;
        const tightBox = pca.pcoGeometry?.tightBoundingBox ?? box;
        const offset = pca.pcoGeometry?.offset;
        const worldBox = new THREE.Box3();
        if (tightBox && offset) {
          worldBox.copy(tightBox);
          worldBox.min.add(offset);
          worldBox.max.add(offset);
        } else if (box) {
          worldBox.copy(box);
        } else {
          worldBox.setFromObject(pc);
        }
        if (!worldBox.isEmpty()) {
          minimapRdr.setBounds(worldBox);
        }
      }
    }).catch(console.error);

    return () => {
      sm.removeFrameCallback(minimapFrame);
      sm.dispose();
      measureMgr.dispose();
      markerMgr.dispose();
      minimapRdr.dispose();
      clipMgr.dispose();
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

  // Click-to-navigate on minimap
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const sm = smRef.current;
    const minimap = minimapRef.current;
    if (!sm || !minimap) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (e.currentTarget.width / rect.width);
    const cy = (e.clientY - rect.top) * (e.currentTarget.height / rect.height);
    const world = minimap.canvasToWorld(cx, cy);
    // Keep current camera height, just move XY
    const cam = sm.camera;
    const offset = new THREE.Vector3().subVectors(cam.position, sm.controls.target);
    sm.controls.target.set(world.x, world.y, sm.controls.target.z);
    cam.position.set(world.x + offset.x, world.y + offset.y, cam.position.z);
    sm.controls.update();
  }, []);

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

  // Helper: project NDC coords onto horizontal plane at given Z
  const projectToPlaneZ = useCallback((nx: number, ny: number, planeZ: number): THREE.Vector3 | null => {
    const sm = smRef.current;
    if (!sm) return null;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(nx, ny), sm.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -planeZ);
    const hit = new THREE.Vector3();
    return raycaster.ray.intersectPlane(plane, hit) ? hit : null;
  }, []);

  const getNDC = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      nx: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      ny: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "section-box" || e.button !== 0) return;
    const sm = smRef.current;
    if (!sm) return;
    e.preventDefault();
    sm.controls.enabled = false; // disable orbit while dragging
    const { nx, ny } = getNDC(e);
    const planeZ = sm.controls.target.z;
    const startWorld = projectToPlaneZ(nx, ny, planeZ);
    if (startWorld) {
      clipDragRef.current = { startWorld, planeZ };
    }
  }, [activeTool, projectToPlaneZ]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!clipDragRef.current || activeTool !== "section-box") return;
    const { nx, ny } = getNDC(e);
    const endWorld = projectToPlaneZ(nx, ny, clipDragRef.current.planeZ);
    if (!endWorld) return;

    const { startWorld } = clipDragRef.current;
    const sm = smRef.current;
    if (!sm) return;

    const zMin = metaZRef.current?.min ?? (sm.controls.target.z - 50);
    const zMax = metaZRef.current?.max ?? (sm.controls.target.z + 50);
    const box = new THREE.Box3(
      new THREE.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
      new THREE.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax),
    );
    clipRef.current?.setDraft(box);
  }, [activeTool, projectToPlaneZ]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sm = smRef.current;
    if (sm) sm.controls.enabled = true;

    if (!clipDragRef.current || activeTool !== "section-box") {
      clipDragRef.current = null;
      return;
    }

    const { nx, ny } = getNDC(e);
    const endWorld = projectToPlaneZ(nx, ny, clipDragRef.current.planeZ);
    if (endWorld && sm) {
      const { startWorld } = clipDragRef.current;
      const zMin = sm.controls.target.z - 50;
      const zMax = sm.controls.target.z + 50;
      const box = new THREE.Box3(
        new THREE.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
        new THREE.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax),
      );
      if (!box.isEmpty()) clipRef.current?.addBox(box);
    }
    clipDragRef.current = null;
  }, [activeTool, projectToPlaneZ]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Skip if this was end of a drag
    if (activeTool === "section-box") return;

    const sm = smRef.current;
    if (!sm) return;
    const { nx, ny } = getNDC(e);

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

    // Measurement clicks
    if (activeTool.startsWith("measure-") && measureRef.current) {
      const type = activeTool.replace("measure-", "") as import("../types").MeasurementType;
      const hit = projectToPlaneZ(nx, ny, sm.controls.target.z);
      if (hit) {
        if (!measureRef.current.activeMeasurement) measureRef.current.start(type);
        measureRef.current.addPoint(hit);
      }
    }
  }, [activeTool, cameras, config, projectToPlaneZ]);

  // Right-click to finish measurement or clear clip box
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (activeTool.startsWith("measure-") && measureRef.current?.activeMeasurement) {
      measureRef.current.finish();
    }
    if (activeTool === "section-box") {
      clipRef.current?.clear();
    }
  }, [activeTool]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-[hsl(var(--viewport-bg))]", className)}>
      {/* Main 3D canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{ cursor: activeTool === "section-box" ? "crosshair" : activeTool !== "none" ? "crosshair" : "default" }}
      />

      {/* Minimap overlay */}
      {showMinimap && (
        <div className="absolute bottom-10 left-3 w-44 h-44 rounded-lg overflow-hidden border border-white/10 shadow-lg">
          <canvas
            ref={minimapCanvasRef}
            width={176}
            height={176}
            className="w-full h-full cursor-pointer"
            onClick={handleMinimapClick}
          />
          <div className="absolute top-1 left-2 text-[9px] text-white/40 font-mono pointer-events-none">
            {t.overview}
          </div>
        </div>
      )}

      {/* Active tool hint */}
      {activeTool !== "none" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-[hsl(var(--brand))] text-xs font-mono px-3 py-1 rounded-full pointer-events-none">
          {activeTool === "measure-point" && t.hintPoint}
          {activeTool === "measure-distance" && t.hintDistance}
          {activeTool === "measure-height" && t.hintHeight}
          {activeTool === "measure-area" && t.hintArea}
          {activeTool === "measure-angle" && t.hintAngle}
          {activeTool === "section-box" && t.hintSectionBox}
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
