"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bookmark, Plus, Trash2, Download, Upload, Play } from "lucide-react";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { PresentationManager, captureScene } from "../../core/presentation-manager";
import type { ViewerScene } from "../../core/presentation-manager";
import * as THREE from "three";

export function ScenesPanel() {
  const {
    sceneManager, cameraAnimator, clipManager, loader,
    clipBoxEntries, colorMode, pointSize, pointBudget,
    setColorMode, setPointSize, setPointBudget, config,
  } = useViewer();
  const t = useLocale().scenesPanel;

  const [scenes, setScenes] = useState<ViewerScene[]>([]);
  const [newName, setNewName] = useState("");
  const pmRef = useRef<PresentationManager | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive a storage key from the source config
  useEffect(() => {
    const key =
      config.source.type === "s3" ? config.source.baseUrl :
      config.source.type === "electron" ? config.source.basePath :
      "local";
    const pm = new PresentationManager(key);
    pm.onChange = (s) => setScenes(s);
    pmRef.current = pm;
    setScenes(pm.getScenes());
  }, [config.source]);

  const handleSave = () => {
    if (!sceneManager || !pmRef.current) return;
    const name = newName.trim() || `Scene ${scenes.length + 1}`;
    const scene = captureScene(
      name,
      sceneManager.camera.position,
      sceneManager.controls.target,
      clipBoxEntries,
      colorMode,
      pointSize,
      pointBudget,
    );
    pmRef.current.addScene(scene);
    setNewName("");
  };

  const handleRestore = async (scene: ViewerScene) => {
    if (!sceneManager) return;

    // Restore camera
    const pos = new THREE.Vector3(...scene.camera.position);
    const target = new THREE.Vector3(...scene.camera.target);

    if (cameraAnimator) {
      await cameraAnimator.flyTo({ position: pos, target, duration: 600 });
    } else {
      sceneManager.camera.position.copy(pos);
      sceneManager.controls.target.copy(target);
      sceneManager.controls.update();
    }

    // Restore clip boxes
    if (clipManager) {
      clipManager.clear();
      for (const cb of scene.clipBoxes) {
        const box = new THREE.Box3(
          new THREE.Vector3(...cb.min),
          new THREE.Vector3(...cb.max),
        );
        const entry = clipManager.addBox(box, cb.name);
        if (cb.mode !== entry.mode) clipManager.setBoxMode(entry.id, cb.mode);
        if (!cb.visible) clipManager.setBoxVisible(entry.id, false);
      }
    }

    // Restore color mode
    if (scene.colorMode && loader) {
      const cm = scene.colorMode as import("../../core/point-cloud-loader").ColorMode;
      await loader.setColorMode(cm);
      setColorMode(cm);
    }

    // Restore point size & budget
    if (scene.pointSize) {
      loader?.setPointSize(scene.pointSize);
      setPointSize(scene.pointSize);
    }
    if (scene.pointBudget) {
      loader?.setPointBudget(scene.pointBudget);
      setPointBudget(scene.pointBudget);
    }
  };

  const handleExport = () => {
    if (!pmRef.current) return;
    const json = pmRef.current.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenes_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pmRef.current) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      pmRef.current?.importJSON(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto text-xs">
      {/* Save new scene */}
      <div className="p-2 border-b border-[hsl(var(--border))]">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{t.saveScene}</p>
        <div className="flex gap-1">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            placeholder={t.namePlaceholder}
            className="flex-1 bg-muted/40 border border-[hsl(var(--border))] rounded px-1.5 py-0.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
          />
          <button
            onClick={handleSave}
            title={t.save}
            className="px-2 py-0.5 rounded bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)] transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Scenes list */}
      <div className="p-2 flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t.savedScenes}</p>
          <div className="flex gap-1">
            <button onClick={handleExport} title={t.exportJson} className="text-muted-foreground hover:text-foreground transition-colors">
              <Download size={11} />
            </button>
            <button onClick={() => fileInputRef.current?.click()} title={t.importJson} className="text-muted-foreground hover:text-foreground transition-colors">
              <Upload size={11} />
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
        </div>

        {scenes.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">{t.noScenes}</p>
        ) : (
          scenes.map(scene => (
            <div key={scene.id} className="flex items-center gap-1.5 py-1 group border-b border-[hsl(var(--border)/0.3)] last:border-0">
              <Bookmark size={11} className="text-[hsl(var(--brand))] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-foreground truncate text-[11px]">{scene.name}</p>
                <p className="text-[8px] text-muted-foreground font-mono">
                  {new Date(scene.createdAt).toLocaleDateString()}
                  {scene.clipBoxes.length > 0 && ` \u00b7 ${scene.clipBoxes.length} clip`}
                </p>
              </div>
              <button
                onClick={() => handleRestore(scene)}
                title={t.restore}
                className="text-[hsl(var(--brand))] hover:text-foreground transition-colors shrink-0"
              >
                <Play size={12} />
              </button>
              <button
                onClick={() => pmRef.current?.removeScene(scene.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
