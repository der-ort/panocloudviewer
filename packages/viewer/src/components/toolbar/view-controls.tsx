"use client";

import React from "react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { ToolbarIconBtn } from "./main-toolbar";

// ─── Wireframe cube view icons ──────────────────────────────────────────────
// Each is a small isometric cube with the corresponding face filled.

/** Isometric cube base paths (shared across all icons) */
const CUBE_WIRE = (
  <>
    {/* Cube wireframe — isometric projection */}
    <path d="M12 2L22 8V16L12 22L2 16V8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
    <path d="M12 12L22 8" stroke="currentColor" strokeWidth="1.2" />
    <path d="M12 12L2 8" stroke="currentColor" strokeWidth="1.2" />
    <path d="M12 12V22" stroke="currentColor" strokeWidth="1.2" />
  </>
);

/** Top view — top face filled */
function TopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      {CUBE_WIRE}
      <path d="M2 8L12 2L22 8L12 12Z" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

/** Bottom view — bottom face (underside) filled */
function BottomIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      {CUBE_WIRE}
      <path d="M2 16L12 22L22 16L12 12Z" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

/** Front view — left-front face filled */
function FrontIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      {CUBE_WIRE}
      <path d="M2 8L12 12V22L2 16Z" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

/** Back view — right-back face filled */
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      {CUBE_WIRE}
      <path d="M22 8L12 12V22L22 16Z" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

/** Left view — left-front face filled (same as front, represents left side) */
function LeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      {CUBE_WIRE}
      <path d="M2 8L12 2V12L2 16Z" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

/** Right view — right face filled */
function RightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      {CUBE_WIRE}
      <path d="M22 8L12 2V12L22 16Z" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

const VIEW_DEFS = [
  { titleKey: "viewTop",    pos: [0, 0, 1],   up: [0, 1, 0], icon: TopIcon },
  { titleKey: "viewBottom", pos: [0, 0, -1],  up: [0, 1, 0], icon: BottomIcon },
  { titleKey: "viewFront",  pos: [0, -1, 0],  up: [0, 0, 1], icon: FrontIcon },
  { titleKey: "viewBack",   pos: [0, 1, 0],   up: [0, 0, 1], icon: BackIcon },
  { titleKey: "viewLeft",   pos: [-1, 0, 0],  up: [0, 0, 1], icon: LeftIcon },
  { titleKey: "viewRight",  pos: [1, 0, 0],   up: [0, 0, 1], icon: RightIcon },
] as const;

export function ViewControls() {
  const { sceneManager } = useViewer();
  const t = useLocale().toolbar;

  const flyToView = (pos: readonly [number, number, number], up: readonly [number, number, number]) => {
    if (!sceneManager) return;
    const { camera, controls } = sceneManager;
    const target = controls.target.clone();
    const dist = camera.position.distanceTo(target);
    const newPos = target.clone().add(
      { x: pos[0] * dist, y: pos[1] * dist, z: pos[2] * dist } as import("three").Vector3
    );
    camera.position.set(newPos.x, newPos.y, newPos.z);
    camera.up.set(up[0], up[1], up[2]);
    controls.update();
  };

  return (
    <>
      {VIEW_DEFS.map(v => (
        <ToolbarIconBtn
          key={v.titleKey}
          icon={<v.icon />}
          title={(t as unknown as Record<string, string>)[v.titleKey] ?? v.titleKey}
          active={false}
          onClick={() => flyToView(v.pos, v.up)}
        />
      ))}
    </>
  );
}
