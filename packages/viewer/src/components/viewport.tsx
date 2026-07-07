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
import { MagnifierRenderer } from "@der-ort/pano-cloud-viewer-core";
import { createAdapter } from "@der-ort/pano-cloud-viewer-core";
import { useMinimapResize } from "../hooks/use-minimap-resize";
import { useSnapThrottle } from "../hooks/use-snap-throttle";
import * as THREE from "three";

interface ViewportProps {
  className?: string;
}


export function Viewport({ className }: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const t = useLocale().viewport;

  const {
    config,
    setSceneManager, setLoader, setMeasurementManager, setMarkerManager,
    setCameraAnimator, setExporter, setMinimap, setClipManager,
    setFps, activeTool, setPointBudget,
    showMarkers, showMinimap, showMeasurements, showMagnifier, setMeasurementList, selectedCamera, setSelectedCamera,
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
  const animRef = useRef<CameraAnimator | null>(null);
  const axisRef = useRef<AxisWidget | null>(null);
  const magRef = useRef<MagnifierRenderer | null>(null);

  // Minimap pixel size + corner-drag resize (window listeners cleaned up on unmount).
  const { minimapSize, handleMinimapResizeStart } = useMinimapResize(minimapRef);

  // Clip-box cursor-drop state: current draft box + pointer-down screen pos
  // (used to distinguish a placement click from an orbit drag).
  const clipDraftRef = useRef<THREE.Box3 | null>(null);
  const clipDownRef = useRef<{ x: number; y: number } | null>(null);

  // Volume measurement drag state (two-phase: footprint → height). The
  // footprint plane sits at the Z of the CLOUD POINT picked at drag start (so
  // the box is anchored to real geometry, not an arbitrary plane), and the
  // height phase grows the box from that base plane.
  const volumeDragRef = useRef<{
    phase: "footprint" | "height";
    startWorld: THREE.Vector3;
    planeZ: number;
    footprintBox?: THREE.Box3;
    startClientY?: number;
    /** Z of the footprint base plane the height grows from. */
    baseZ?: number;
  } | null>(null);

  /**
   * World units per screen pixel at the orbit target's distance — the same
   * scale OrbitControls uses for screen-space panning. Used to make the
   * volume height drag feel consistent at any zoom level.
   */
  const worldUnitsPerPixel = useCallback((): number => {
    const sm = smRef.current;
    if (!sm || !containerRef.current) return 0.05;
    const cam = sm.camera;
    const dist = cam.position.distanceTo(sm.controls.target) || 10;
    const vfov = THREE.MathUtils.degToRad(cam.fov || 60);
    return (2 * dist * Math.tan(vfov / 2)) / Math.max(containerRef.current.clientHeight, 1);
  }, []);

  /** Thin footprint preview slab: base plane + a sliver of height. */
  const footprintSlab = useCallback((a: THREE.Vector3, b: THREE.Vector3, baseZ: number): THREE.Box3 => {
    const diag = Math.hypot(b.x - a.x, b.y - a.y);
    const sliver = Math.max(0.5, diag * 0.05);
    return new THREE.Box3(
      new THREE.Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), baseZ),
      new THREE.Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), baseZ + sliver),
    );
  }, []);

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

    // Picking magnifier — zoom inset while measuring (post-render, no-op when off).
    // Hide the (pixelated) measurement snap crosshair inside the inset — the
    // magnifier draws its own crisp crosshair at the same point.
    const magnifier = new MagnifierRenderer(sm);
    magnifier.hideDuringRender(() => measureMgr.snapIndicator);
    magRef.current = magnifier;
    const magFrame = () => magnifier.render();
    sm.addPostRenderCallback(magFrame);

    sm.start();

    // Load point cloud and set minimap bounds. Budget: pass only an explicit
    // config value through — otherwise the loader derives it from the cloud's
    // total point count, and we sync the applied value back into React state
    // so sliders/status show the real number.
    loader.load("metadata.json", config.pointBudget).then(() => {
      setPointBudget(loader.appliedBudget);
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
      sm.removePostRenderCallback(magFrame);
      magnifier.dispose();
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

  // Attach minimap container after init; release its WebGL context while
  // hidden (contexts are a scarce browser resource — holding one for an
  // invisible minimap is what pushed other tabs/instances over the limit).
  useEffect(() => {
    if (showMinimap && minimapRef.current && minimapContainerRef.current) {
      minimapRef.current.attach(minimapContainerRef.current);
      return () => minimapRef.current?.dispose();
    }
  }, [showMinimap]);

  // Minimap navigation: move the orbit target (and camera, keeping its offset)
  // to the world position under the given minimap pixel.
  const navigateMinimap = useCallback((el: HTMLElement, clientX: number, clientY: number) => {
    const sm = smRef.current;
    const minimap = minimapRef.current;
    if (!sm || !minimap) return;
    const rect = el.getBoundingClientRect();
    const world = minimap.canvasToWorld(clientX - rect.left, clientY - rect.top);
    const cam = sm.camera;
    const offset = new THREE.Vector3().subVectors(cam.position, sm.controls.target);
    sm.controls.target.set(world.x, world.y, sm.controls.target.z);
    cam.position.set(world.x + offset.x, world.y + offset.y, cam.position.z);
    sm.controls.update();
  }, []);

  // Click OR drag on the minimap to navigate — dragging pans the main view
  // continuously, like scrubbing a map.
  const minimapDragRef = useRef(false);
  const handleMinimapPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    minimapDragRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    navigateMinimap(e.currentTarget, e.clientX, e.clientY);
  }, [navigateMinimap]);
  const handleMinimapPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (minimapDragRef.current) navigateMinimap(e.currentTarget, e.clientX, e.clientY);
  }, [navigateMinimap]);
  const handleMinimapPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    minimapDragRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);
  // Double-click the minimap → frame the whole cloud in the main view.
  const handleMinimapDblClick = useCallback(() => {
    const wb = loaderRef.current?.worldBox;
    if (wb && !wb.isEmpty()) smRef.current?.fitToBox(wb);
  }, []);

  // Rebuild markers when cameras load; mirror the positions onto the minimap.
  useEffect(() => {
    if (markerRef.current && cameras.length > 0) {
      const wb = loaderRef.current?.worldBox;
      markerRef.current.build(cameras, wb && !wb.isEmpty() ? wb : undefined);
      markerRef.current.setVisible(showMarkers);
    }
    minimapRef.current?.setPois(
      cameras.filter(c => c.position).map(c => ({ x: c.position!.x, y: c.position!.y })),
    );
  }, [cameras, showMarkers]);

  // Highlight the opened panorama on the minimap.
  useEffect(() => {
    minimapRef.current?.setSelectedPoi(
      selectedCamera?.position
        ? { x: selectedCamera.position.x, y: selectedCamera.position.y }
        : null,
    );
  }, [selectedCamera]);

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
    lastSnapRef.current = null;
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

  // Magnifier is active only while a measurement tool is selected AND toggled on.
  useEffect(() => {
    magRef.current?.setEnabled(showMagnifier && activeTool.startsWith("measure-"));
  }, [showMagnifier, activeTool]);

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

  // Live snap-crosshair preview, throttled to one GPU pick per frame. The last
  // previewed point is kept so a click commits EXACTLY what the crosshair shows
  // (WYSIWYG) instead of re-picking — re-picking could land on a different point.
  const lastSnapRef = useRef<THREE.Vector3 | null>(null);
  const { scheduleSnap, cancelSnap } = useSnapThrottle((nx, ny) => {
    const hit = pickVisiblePoint(nx, ny);
    lastSnapRef.current = hit;
    if (hit) measureRef.current?.updateSnap(hit);
  });

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

    // Face-resize arrows — checked before other interactions
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isAttached() && e.button === 0) {
      if (fh.onPointerDown(e.clientX, e.clientY)) {
        e.preventDefault();
        sm.controls.enabled = false;
        return;
      }
    }

    // Rotation arcs — skipped if the translate gizmo already claimed this press
    // (its native pointerdown listener fires before React's synthetic event).
    const rr = clipRef.current?.rotationRings;
    if (rr && rr.isAttached() && e.button === 0 && !clipRef.current?.isGizmoDragging()) {
      if (rr.onPointerDown(e.clientX, e.clientY)) {
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
      // Start phase 1: footprint drag — anchor the base plane to the actual
      // cloud point under the cursor (falls back to the target plane inside
      // pickVisiblePoint when nothing is picked).
      e.preventDefault();
      sm.controls.enabled = false;
      const { nx, ny } = getNDC(e);
      const startWorld = pickVisiblePoint(nx, ny);
      if (startWorld) {
        volumeDragRef.current = {
          phase: "footprint",
          startWorld,
          planeZ: startWorld.z,
          baseZ: startWorld.z,
        };
      }
      return;
    }

    if (activeTool !== "section-box" || e.button !== 0) return;
    // Cursor-drop placement: record the down position so mouseup can tell a
    // placement click apart from an orbit drag. Controls stay enabled.
    clipDownRef.current = { x: e.clientX, y: e.clientY };
  }, [activeTool, pickVisiblePoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Face-resize arrow drag
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerMove(e.clientX, e.clientY);
      return;
    }
    // Rotation-arc drag
    const rr = clipRef.current?.rotationRings;
    if (rr && rr.isDragging()) {
      rr.onPointerMove(e.clientX, e.clientY);
      return;
    }
    // Hover highlights
    if (fh && fh.isAttached()) fh.updateHover(e.clientX, e.clientY);
    if (rr && rr.isAttached()) rr.updateHover(e.clientX, e.clientY);

    // Volume measurement drag preview
    const vd = volumeDragRef.current;
    if (vd && activeTool === "measure-volume") {
      if (vd.phase === "footprint") {
        const { nx, ny } = getNDC(e);
        const endWorld = projectToPlaneZ(nx, ny, vd.planeZ);
        if (!endWorld) return;
        // Thin slab on the picked base plane — not a full-height tower.
        measureRef.current?.setVolumeDraft(
          footprintSlab(vd.startWorld, endWorld, vd.baseZ ?? vd.planeZ),
        );
      } else if (vd.phase === "height" && vd.footprintBox && vd.startClientY !== undefined) {
        // Height grows FROM the base plane: drag up extends up, down extends
        // down. Sensitivity matches the view (world units per screen pixel).
        const deltaY = vd.startClientY - e.clientY; // up = positive
        const extent = Math.max(0.1, Math.abs(deltaY) * worldUnitsPerPixel());
        const base = vd.baseZ ?? vd.footprintBox.min.z;
        const box = vd.footprintBox.clone();
        if (deltaY >= 0) { box.min.z = base; box.max.z = base + extent; }
        else            { box.min.z = base - extent; box.max.z = base; }
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
    // Throttled (see useSnapThrottle) to stay responsive on dense clouds.
    if (activeTool.startsWith("measure-") && smRef.current) {
      const { nx, ny } = getNDC(e);
      scheduleSnap(nx, ny);
      // Feed the magnifier inset (no-op unless enabled)
      const rect = e.currentTarget.getBoundingClientRect();
      magRef.current?.update(nx, ny, e.clientX - rect.left, e.clientY - rect.top);
    }
  }, [activeTool, scheduleSnap, buildClipDraftAt, footprintSlab, worldUnitsPerPixel]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sm = smRef.current;

    // Face handle drag end
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerUp();
      if (sm) sm.controls.enabled = true;
      return;
    }

    // Rotation-arc drag end
    const rrUp = clipRef.current?.rotationRings;
    if (rrUp && rrUp.isDragging()) {
      rrUp.onPointerUp();
      if (sm) sm.controls.enabled = true;
      return;
    }

    // Volume measurement: transition from footprint → height phase
    const vdUp = volumeDragRef.current;
    if (vdUp && vdUp.phase === "footprint" && activeTool === "measure-volume") {
      const { nx, ny } = getNDC(e);
      const endWorld = projectToPlaneZ(nx, ny, vdUp.planeZ);
      if (endWorld) {
        const base = vdUp.baseZ ?? vdUp.planeZ;
        const box = footprintSlab(vdUp.startWorld, endWorld, base);
        if (!box.isEmpty()) {
          volumeDragRef.current = {
            phase: "height",
            startWorld: vdUp.startWorld,
            planeZ: vdUp.planeZ,
            footprintBox: box,
            startClientY: e.clientY,
            baseZ: base,
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
  }, [activeTool, buildClipDraftAt, footprintSlab]);

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

    // Measurement clicks — commit the point the crosshair is previewing (WYSIWYG);
    // fall back to a fresh pick when there is no preview (e.g. touch, no mousemove).
    // Volume uses drag, not clicks.
    if (activeTool.startsWith("measure-") && activeTool !== "measure-volume" && measureRef.current) {
      const type = activeTool.replace("measure-", "") as import("@der-ort/pano-cloud-viewer-core").MeasurementType;
      const hit = lastSnapRef.current ?? pickVisiblePoint(nx, ny);
      if (hit) {
        if (!measureRef.current.activeMeasurement) measureRef.current.start(type);
        measureRef.current.addPoint(hit.clone());
      }
    }
  }, [activeTool, cameras, config, pickVisiblePoint, showMarkers]);

  // Hide the snap crosshair (and drop any pending pick) when the cursor leaves.
  const handleMouseLeave = useCallback(() => {
    cancelSnap();
    lastSnapRef.current = null; // a later click must not commit a stale preview
    measureRef.current?.clearSnap();
    magRef.current?.clearCursor();
  }, [cancelSnap]);

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
          // Keep the OS cursor visible while measuring — the user must never
          // lose the pointer. The 3D snap crosshair shows where the pick will
          // LAND (it can differ from the cursor when snapping), the OS
          // crosshair shows where the mouse IS.
          cursor: activeTool === "section-box" || activeTool.startsWith("measure-")
            ? "crosshair"
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
          onPointerDown={handleMinimapPointerDown}
          onPointerMove={handleMinimapPointerMove}
          onPointerUp={handleMinimapPointerUp}
          onDoubleClick={handleMinimapDblClick}
        >
          <div
            ref={minimapContainerRef}
            className="relative w-full h-full"
          />
          <div className="absolute top-1 left-2 text-[9px] text-white/40 font-mono pointer-events-none">
            {t.overview}
          </div>
          {/* Resize handle — top-right corner. stopPropagation on pointerdown so
              starting a resize doesn't also trigger minimap navigation. */}
          <div
            onMouseDown={handleMinimapResizeStart}
            onPointerDown={(e) => e.stopPropagation()}
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
          {activeTool === "measure-volume" && (volumeDragRef.current?.phase === "height" ? t.hintVolumeHeight : t.hintVolumeFootprint)}
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
