"use client";

import React from "react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { ToolbarIconBtn } from "./main-toolbar";

const VIEW_DEFS = [
  { labelKey: "viewTopLabel",   titleKey: "viewTop",   pos: [0, 0, 1],  up: [0, 1, 0] },
  { labelKey: "viewFrontLabel", titleKey: "viewFront", pos: [0, -1, 0], up: [0, 0, 1] },
  { labelKey: "viewBackLabel",  titleKey: "viewBack",  pos: [0, 1, 0],  up: [0, 0, 1] },
  { labelKey: "viewLeftLabel",  titleKey: "viewLeft",  pos: [-1, 0, 0], up: [0, 0, 1] },
  { labelKey: "viewRightLabel", titleKey: "viewRight", pos: [1, 0, 0],  up: [0, 0, 1] },
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
          key={v.labelKey}
          icon={<span className="font-mono text-[10px] font-bold">{t[v.labelKey]}</span>}
          title={t[v.titleKey]}
          active={false}
          onClick={() => flyToView(v.pos, v.up)}
        />
      ))}
    </>
  );
}
