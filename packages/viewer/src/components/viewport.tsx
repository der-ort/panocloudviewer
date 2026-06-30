"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "../lib/utils";
import { useViewer } from "../providers/viewer-provider";
import { useData } from "../providers/data-provider";
import { useLocale } from "../i18n/locale-context";
import { SceneManager } from "@der-ort/pano-cloud-viewer-core";
import { PointCloudLoader } from "@der-ort/pano-cloud-viewer-core";
import { MeasurementManager } from "@der-ort/pano-cloud-viewer-core";
import { MarkerManager } from "@der-ort/pano-cloud-viewer-core";
import { CameraAnimator } from "@der-ort/pano-cloud-viewer-core";
import { ExportManager } from "@der-ort/pano-cloud-viewer-core";
import { MinimapRenderer } from "@der-ort/pano-cloud-viewer-core";
import { ClipManager } from "@der-ort/pano-cloud-viewer-core";
import { AxisWidget } from "@der-ort/pano-cloud-viewer-core";
import { createAdapter } from "@der-ort/pano-cloud-viewer-core";
import * as THREE from "three";

interface ViewportProps {
  className?: string;
}


export function Viewport({ className }: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [minimapSize, setMinimapSize] = React.useState(176);
  const t = useLocale().viewport;

  const {
    config,
    setSceneManager, setLoader, setMeasurementManager, setMarkerManager,
    setCameraAnimator, setExporter, setMinimap, setClipManager,
    setFps, activeTool, pointBudget,
    showMarkers, showMinimap, showMeasurements, setMeasurementList, setSelectedCamera,
    clipBoxEntries, setClipBoxEntries, setSelectedClipBoxId,
    navigationMode, projection, displaySettings,
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
  const loaderRef = useRef<PointCloudLoader | null>(null);
  const markerRef = useRef<MarkerManager | null>(null);
  const measureRef = useRef<MeasurementManager | null>(null);
  const minimapRef = useRef<MinimapRenderer | null>(null);
  const clipRef = useRef<ClipManager | null>(null);
  // Measurement snap throttle: pick at most once per animation frame (a GPU pick
  // on every mousemove stalls badly on dense clouds).
  const snapRafRef = useRef<number | null>(null);
  const snapNdcRef = useRef<{ nx: number; ny: number } | null>(null);
  const animRef = useRef<CameraAnimator | null>(null);
  const axisRef = useRef<AxisWidget | null>(null);

  // Clip-box cursor-drop state: current draft box + pointer-down screen pos
  // (used to distinguish a placement click from an orbit drag).
  const clipDraftRef = useRef<THREE.Box3 | null>(null);
  const clipDownRef = useRef<{ x: number; y: number } | null>(null);

  // Volume measurement drag state (two-phase: footprint → height)
  const volumeDragRef = useRef<{
    phase: "footprint" | "height";
    startWorld: THREE.Vector3;
    planeZ: number;
    footprintBox?: THREE.Box3;
    startClientY?: number;
    baseZMin?: number;
    baseZMax?: number;
  } | null>(null);

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
    loaderRef.current = loader;
    markerRef.current = markerMgr;
    measureRef.current = measureMgr;
    minimapRef.current = minimapRdr;
    clipRef.current = clipMgr;
    animRef.current = anim;

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

    // Axis widget — post-render so it draws on top
    const axisWidget = new AxisWidget(sm);
    axisRef.current = axisWidget;
    const axisFrame = () => axisWidget.render();
    sm.addPostRenderCallback(axisFrame);

    sm.start();

    // Load point cloud and set minimap bounds
    loader.load("metadata.json", pointBudget).then(() => {
      const pc = loader.getPointCloud();

      // After load, compute world bounding box for minimap
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
      sm.removePostRenderCallback(axisFrame);
      sm.dispose();
      measureMgr.dispose();
      markerMgr.dispose();
      minimapRdr.dispose();
      clipMgr.dispose();
      axisWidget.dispose();
      initialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach minimap container after init
  useEffect(() => {
    if (minimapRef.current && minimapContainerRef.current) {
      minimapRef.current.attach(minimapContainerRef.current);
    }
  }, [showMinimap]);

  // Click-to-navigate on minimap
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sm = smRef.current;
    const minimap = minimapRef.current;
    if (!sm || !minimap) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const world = minimap.canvasToWorld(cx, cy);
    const cam = sm.camera;
    const offset = new THREE.Vector3().subVectors(cam.position, sm.controls.target);
    sm.controls.target.set(world.x, world.y, sm.controls.target.z);
    cam.position.set(world.x + offset.x, world.y + offset.y, cam.position.z);
    sm.controls.update();
  }, []);

  // Resize minimap via corner drag
  const minimapResizeRef = useRef(false);
  const handleMinimapResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    minimapResizeRef.current = true;
    const startY = e.clientY;
    const startSize = minimapSize;
    const onMove = (ev: MouseEvent) => {
      if (!minimapResizeRef.current) return;
      const delta = startY - ev.clientY;
      setMinimapSize(Math.max(120, Math.min(400, startSize + delta)));
      minimapRef.current?.resize();
    };
    const onUp = () => {
      minimapResizeRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setTimeout(() => minimapRef.current?.resize(), 0);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [minimapSize]);

  // Rebuild markers when cameras load
  useEffect(() => {
    if (markerRef.current && cameras.length > 0) {
      const wb = loaderRef.current?.worldBox;
      markerRef.current.build(cameras, wb && !wb.isEmpty() ? wb : undefined);
      markerRef.current.setVisible(showMarkers);
    }
  }, [cameras, showMarkers]);

  // Sync marker visibility
  useEffect(() => {
    markerRef.current?.setVisible(showMarkers);
  }, [showMarkers]);

  // Sync measurement-layer visibility (Layers panel toggle)
  useEffect(() => {
    measureRef.current?.setVisible(showMeasurements);
  }, [showMeasurements]);


  // Cull panorama markers that fall outside the active clip region. Re-runs on
  // every clip mutation (add/remove/move/mode/enable all refresh clipBoxEntries).
  useEffect(() => {
    const mm = markerRef.current;
    const cm = clipRef.current;
    if (!mm) return;
    mm.applyClipFilter(cm ? (p) => cm.isPointVisible(p) : null);
  }, [clipBoxEntries]);

  // Clear snap/draft preview when switching away from a measurement tool
  useEffect(() => {
    if (!activeTool.startsWith("measure-")) {
      measureRef.current?.clearSnap();
    }
    if (activeTool !== "measure-volume") {
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
    }
    if (activeTool !== "section-box") {
      clipDraftRef.current = null;
      clipDownRef.current = null;
      clipRef.current?.setDraft(null);
    }
  }, [activeTool]);

  // Sync navigation mode
  useEffect(() => {
    smRef.current?.setNavigationMode(navigationMode);
  }, [navigationMode]);

  // Sync camera projection
  useEffect(() => {
    smRef.current?.setProjection(projection);
  }, [projection]);

  // Sync display settings to managers
  useEffect(() => {
    measureRef.current?.applyDisplaySettings(displaySettings);
    markerRef.current?.applyDisplaySettings(displaySettings);
  }, [displaySettings]);

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

  // Pick the front-most VISIBLE cloud point under the cursor (GPU pick already
  // returns the closest rendered point). Points clipped away by an active
  // section box are rejected so measuring never snaps to hidden geometry; falls
  // back to a ground-plane projection when nothing valid is picked.
  const pickVisiblePoint = useCallback((nx: number, ny: number): THREE.Vector3 | null => {
    const sm = smRef.current;
    if (!sm) return null;
    const picked = sm.pickPoint(nx, ny);
    if (picked && (!clipRef.current || clipRef.current.isPointVisible(picked))) {
      return picked;
    }
    return projectToPlaneZ(nx, ny, sm.controls.target.z);
  }, [projectToPlaneZ]);

  // Build a section-box draft centered at the cursor's ground point. The box is
  // kept compact (flat in Z) so all six face handles stay on screen.
  const buildClipDraftAt = useCallback((nx: number, ny: number): THREE.Box3 | null => {
    const sm = smRef.current;
    if (!sm) return null;
    const zMid = metaZRef.current
      ? (metaZRef.current.min + metaZRef.current.max) / 2
      : sm.controls.target.z;
    const center = projectToPlaneZ(nx, ny, zMid);
    if (!center) return null;

    // Compact box so all six face handles stay in frame. X/Y capped at ~1/4 of
    // the project bounds; Z made much flatter (~1/12, with a small absolute cap)
    // so even a tall/huge dataset never produces a tall column that pushes the
    // +Z/-Z handles off-screen.
    const wb = loaderRef.current?.worldBox;
    const bounds = new THREE.Vector3(20, 20, 20);
    if (wb && !wb.isEmpty()) wb.getSize(bounds);
    const half = new THREE.Vector3(
      Math.max(0.1, Math.min(bounds.x, bounds.x / 4)) / 2,
      Math.max(0.1, Math.min(bounds.y, bounds.y / 4)) / 2,
      Math.max(0.2, Math.min(bounds.z, bounds.z / 12, 8)) / 2,
    );
    return new THREE.Box3(
      center.clone().sub(half),
      center.clone().add(half),
    );
  }, [projectToPlaneZ]);

  const getNDC = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      nx: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      ny: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  };

  // Double-click to re-focus orbit target at the clicked world position
  const handleDblClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sm = smRef.current;
    const anim = animRef.current;
    if (!sm || !anim) return;
    const { nx, ny } = getNDC(e);
    // Snap to point cloud first, fall back to plane
    const hit = sm.pickPoint(nx, ny) ?? projectToPlaneZ(nx, ny, sm.controls.target.z);
    if (!hit) return;
    // Keep camera position fixed — only shift the orbit target
    anim.flyTo({ position: sm.camera.position.clone(), target: hit, duration: 600 });
  }, [projectToPlaneZ]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sm = smRef.current;
    if (!sm) return;

    // Face handle drag — check before other interactions
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isAttached() && e.button === 0) {
      if (fh.onPointerDown(e.clientX, e.clientY)) {
        e.preventDefault();
        sm.controls.enabled = false;
        return;
      }
    }

    // Volume measurement drag — phase 1 (footprint) or phase 2 (height confirm)
    if (activeTool === "measure-volume" && e.button === 0) {
      const vd = volumeDragRef.current;
      if (vd && vd.phase === "height") {
        // Phase 2 click: finalize the volume
        if (vd.footprintBox) {
          measureRef.current?.addVolumeMeasurement(vd.footprintBox);
        }
        volumeDragRef.current = null;
        sm.controls.enabled = true;
        return;
      }
      // Start phase 1: footprint drag
      e.preventDefault();
      sm.controls.enabled = false;
      const { nx, ny } = getNDC(e);
      const planeZ = sm.controls.target.z;
      const startWorld = projectToPlaneZ(nx, ny, planeZ);
      if (startWorld) {
        volumeDragRef.current = { phase: "footprint", startWorld, planeZ };
      }
      return;
    }

    if (activeTool !== "section-box" || e.button !== 0) return;
    // Cursor-drop placement: record the down position so mouseup can tell a
    // placement click apart from an orbit drag. Controls stay enabled.
    clipDownRef.current = { x: e.clientX, y: e.clientY };
  }, [activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Face handle drag
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerMove(e.clientX, e.clientY);
      return;
    }
    // Face handle hover
    if (fh && fh.isAttached()) {
      fh.updateHover(e.clientX, e.clientY);
    }

    // Volume measurement drag preview
    const vd = volumeDragRef.current;
    if (vd && activeTool === "measure-volume") {
      if (vd.phase === "footprint") {
        const { nx, ny } = getNDC(e);
        const endWorld = projectToPlaneZ(nx, ny, vd.planeZ);
        if (!endWorld) return;
        const { startWorld } = vd;
        const zMin = metaZRef.current?.min ?? (vd.planeZ - 10);
        const zMax = metaZRef.current?.max ?? (vd.planeZ + 10);
        const box = new THREE.Box3(
          new THREE.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
          new THREE.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax),
        );
        measureRef.current?.setVolumeDraft(box);
      } else if (vd.phase === "height" && vd.footprintBox && vd.startClientY !== undefined) {
        // Map vertical mouse movement to box Z range
        const deltaY = vd.startClientY! - e.clientY; // up = positive
        const sensitivity = 0.1; // world units per pixel
        const zExtent = Math.max(0.1, Math.abs(deltaY) * sensitivity);
        const midZ = (vd.baseZMin! + vd.baseZMax!) / 2;
        const box = vd.footprintBox.clone();
        box.min.z = midZ - zExtent / 2;
        box.max.z = midZ + zExtent / 2;
        vd.footprintBox.copy(box);
        measureRef.current?.setVolumeDraft(box);
      }
      return;
    }

    // Clip-box cursor-drop preview — draft box follows the cursor on the ground.
    if (activeTool === "section-box") {
      const { nx, ny } = getNDC(e);
      const box = buildClipDraftAt(nx, ny);
      clipDraftRef.current = box;
      clipRef.current?.setDraft(box);
      return;
    }

    // Measurement snap preview — show where the point will land before clicking.
    // Throttled to one GPU pick per animation frame so it stays responsive on
    // dense clouds (mousemove can fire far faster than we can pick).
    if (activeTool.startsWith("measure-") && smRef.current) {
      const { nx, ny } = getNDC(e);
      snapNdcRef.current = { nx, ny };
      if (snapRafRef.current == null) {
        snapRafRef.current = requestAnimationFrame(() => {
          snapRafRef.current = null;
          const p = snapNdcRef.current;
          if (!p || !measureRef.current) return;
          const hit = pickVisiblePoint(p.nx, p.ny);
          if (hit) measureRef.current.updateSnap(hit);
        });
      }
    }
  }, [activeTool, pickVisiblePoint, buildClipDraftAt]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sm = smRef.current;

    // Face handle drag end
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerUp();
      if (sm) sm.controls.enabled = true;
      return;
    }

    // Volume measurement: transition from footprint → height phase
    const vdUp = volumeDragRef.current;
    if (vdUp && vdUp.phase === "footprint" && activeTool === "measure-volume") {
      const { nx, ny } = getNDC(e);
      const endWorld = projectToPlaneZ(nx, ny, vdUp.planeZ);
      if (endWorld) {
        const { startWorld } = vdUp;
        const zMin = metaZRef.current?.min ?? (vdUp.planeZ - 10);
        const zMax = metaZRef.current?.max ?? (vdUp.planeZ + 10);
        const box = new THREE.Box3(
          new THREE.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
          new THREE.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax),
        );
        if (!box.isEmpty()) {
          volumeDragRef.current = {
            phase: "height",
            startWorld: vdUp.startWorld,
            planeZ: vdUp.planeZ,
            footprintBox: box,
            startClientY: e.clientY,
            baseZMin: zMin,
            baseZMax: zMax,
          };
          // Keep controls disabled during height phase
          return;
        }
      }
      // Invalid footprint — cancel
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
      if (sm) sm.controls.enabled = true;
      return;
    }

    if (sm) sm.controls.enabled = true;

    // Section-box cursor-drop: place a box on a click (down→up without an orbit drag).
    if (activeTool === "section-box" && e.button === 0) {
      const down = clipDownRef.current;
      clipDownRef.current = null;
      const DRAG_THRESHOLD = 5; // px — beyond this we treat it as an orbit drag, not a drop
      const moved = down
        ? Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_THRESHOLD
        : true;
      if (!moved) {
        const { nx, ny } = getNDC(e);
        const box = clipDraftRef.current ?? buildClipDraftAt(nx, ny);
        if (box && !box.isEmpty() && clipRef.current) {
          const entry = clipRef.current.addBox(box);
          clipRef.current.selectBox(entry.id);
          clipDraftRef.current = null;
          clipRef.current.setDraft(null);
        }
      }
      return;
    }
  }, [activeTool, buildClipDraftAt]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "section-box") return;

    const sm = smRef.current;
    if (!sm) return;
    const { nx, ny } = getNDC(e);

    // Marker click — only when markers are visible
    if (activeTool === "none" && showMarkers && markerRef.current) {
      const hits = sm.raycast(nx, ny, markerRef.current.getMeshes());
      if (hits.length > 0) {
        const idx: number = (hits[0].object as THREE.Mesh).userData.cameraIndex;
        markerRef.current.setSelected(idx);
        setSelectedCamera(cameras[idx]);
        config.onCameraSelect?.(cameras[idx]);
      }
    }

    // Measurement clicks — snap to the front-most VISIBLE point (rejects points
    // clipped away by a section box); volume uses drag, not clicks.
    if (activeTool.startsWith("measure-") && activeTool !== "measure-volume" && measureRef.current) {
      const type = activeTool.replace("measure-", "") as import("@der-ort/pano-cloud-viewer-core").MeasurementType;
      const hit = pickVisiblePoint(nx, ny);
      if (hit) {
        if (!measureRef.current.activeMeasurement) measureRef.current.start(type);
        measureRef.current.addPoint(hit);
      }
    }
  }, [activeTool, cameras, config, pickVisiblePoint, showMarkers]);

  // Hide the snap crosshair when the cursor leaves the viewport.
  const handleMouseLeave = useCallback(() => {
    measureRef.current?.clearSnap();
  }, []);

  // Right-click to finish measurement, cancel volume drag, or clear clip box
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Cancel volume drag
    if (volumeDragRef.current) {
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
      const sm = smRef.current;
      if (sm) sm.controls.enabled = true;
      return;
    }
    if (activeTool.startsWith("measure-") && measureRef.current?.activeMeasurement) {
      measureRef.current.finish();
    }
    if (activeTool === "section-box") {
      clipDraftRef.current = null;
      clipDownRef.current = null;
      clipRef.current?.setDraft(null);
      clipRef.current?.clear();
    }
  }, [activeTool]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-[hsl(var(--viewport-bg))]", className)}>
      {/* Main 3D canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full select-none"
        onClick={handleClick}
        onDoubleClick={handleDblClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        onDragStart={(e) => e.preventDefault()}
        style={{
          // Hide the OS cursor while point-snapping so only the 3D crosshair
          // shows (no doubled cross); keep a crosshair for the section tool.
          cursor: activeTool === "section-box"
            ? "crosshair"
            : activeTool.startsWith("measure-")
              ? "none"
              : "default",
        }}
      />


      {/* Minimap overlay */}
      {showMinimap && (
        <div
          className="absolute rounded-lg overflow-hidden border border-white/10 shadow-lg cursor-pointer transition-[right] duration-200"
          style={{
            width: minimapSize,
            height: minimapSize,
            right: "var(--pcv-minimap-right, 0.75rem)",
            // Lift above the OS home indicator / browser nav bar on mobile.
            bottom: "calc(2.5rem + env(safe-area-inset-bottom))",
          }}
          onClick={handleMinimapClick}
        >
          <div
            ref={minimapContainerRef}
            className="relative w-full h-full"
          />
          <div className="absolute top-1 left-2 text-[9px] text-white/40 font-mono pointer-events-none">
            {t.overview}
          </div>
          {/* Resize handle — top-right corner */}
          <div
            onMouseDown={handleMinimapResizeStart}
            className="absolute top-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center"
            title="Resize minimap"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" className="text-white/30">
              <path d="M0 8L8 0M3 8L8 3M6 8L8 6" stroke="currentColor" strokeWidth="1" />
            </svg>
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
          {activeTool === "measure-volume" && (volumeDragRef.current?.phase === "height" ? "Move mouse up/down to set height, click to confirm" : "Drag to draw volume footprint")}
          {activeTool === "section-box" && t.hintSectionBox}
        </div>
      )}

      {/* Loading metadata info */}
      {metadata && (
        <div className="absolute top-3 left-3 text-[10px] font-mono text-white/30 pointer-events-none">
          {(metadata.points / 1e6).toFixed(1)}M pts
        </div>
      )}
    </div>
  );
}
