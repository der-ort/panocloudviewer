"use client";

import React from "react";
import { useViewer } from "../../providers/viewer-provider";
import { ToolbarIconBtn } from "./main-toolbar";

const VIEWS = [
  { label: "T", title: "Top view", pos: [0, 0, 1], up: [0, 1, 0] },
  { label: "Fr", title: "Front view", pos: [0, -1, 0], up: [0, 0, 1] },
  { label: "Bk", title: "Back view", pos: [0, 1, 0], up: [0, 0, 1] },
  { label: "L", title: "Left view", pos: [-1, 0, 0], up: [0, 0, 1] },
  { label: "R", title: "Right view", pos: [1, 0, 0], up: [0, 0, 1] },
] as const;

export function ViewControls() {
  const { sceneManager } = useViewer();

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
      {VIEWS.map(v => (
        <ToolbarIconBtn
          key={v.label}
          icon={<span className="font-mono text-[10px] font-bold">{v.label}</span>}
          title={v.title}
          active={false}
          onClick={() => flyToView(v.pos, v.up)}
        />
      ))}
    </>
  );
}
