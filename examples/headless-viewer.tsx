/**
 * Headless Viewer
 *
 * Uses the core manager classes directly (no React UI components) to load
 * and render a point cloud into a bare canvas. Useful for:
 *  - Embedding in non-React apps (wrap in a Web Component or vanilla JS)
 *  - Custom rendering pipelines
 *  - Automated screenshots / exports
 *
 * This example creates the Three.js scene, loads the point cloud, and
 * exposes the SceneManager for programmatic camera control.
 *
 * Usage:
 *   import HeadlessViewer from './headless-viewer';
 *   <HeadlessViewer />
 */
"use client";

import React, { useEffect, useRef } from "react";
import {
  SceneManager,
  PointCloudLoader,
  CameraAnimator,
  AxisWidget,
  createAdapter,
} from "@der-ort/pano-cloud-viewer";

const SOURCE = {
  type: "s3" as const,
  baseUrl: "/sample/",
};

export default function HeadlessViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;

    // 1. Create the Three.js scene
    const sm = new SceneManager({ canvas: containerRef.current });
    const adapter = createAdapter(SOURCE);
    const loader = new PointCloudLoader(sm, adapter);
    const animator = new CameraAnimator(sm.camera, sm.controls);

    // 2. Add the axis orientation widget
    const axis = new AxisWidget(sm);
    sm.addPostRenderCallback(() => axis.render());

    // 3. Start the render loop
    sm.start();

    // 4. Load the point cloud
    loader.load("metadata.json", 3_000_000).then(() => {
      console.log("Point cloud loaded:", loader.worldBox);

      // Example: programmatically fly to a specific view after 2 seconds
      setTimeout(() => {
        const center = loader.worldBox.getCenter(
          new (window as any).THREE?.Vector3?.() ??
            { x: 0, y: 0, z: 0 }
        );
        animator.flyTo({
          position: { x: center.x + 50, y: center.y - 50, z: center.z + 30 } as any,
          target: center as any,
          duration: 1500,
        });
      }, 2000);
    });

    return () => {
      sm.dispose();
      axis.dispose();
      initialized.current = false;
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
