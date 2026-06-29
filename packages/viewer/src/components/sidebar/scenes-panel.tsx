"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bookmark, Plus, Trash2, Download, Upload, Play, Square, Film, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { PresentationManager, captureScene } from "@der-ort/pano-cloud-viewer-core";
import type { ViewerScene, Easing } from "@der-ort/pano-cloud-viewer-core";
import * as THREE from "three";

function InlineEditSceneName({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  if (!editing) {
    return (
      <p
        className="font-mono text-foreground truncate text-[11px] cursor-pointer hover:text-[hsl(var(--brand))] transition-colors"
        onDoubleClick={() => { setDraft(value); setEditing(true); }}
        title="Double-click to rename"
      >
        {value}
      </p>
    );
  }

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
      onBlur={save}
      className="font-mono text-foreground text-[11px] bg-muted/60 border border-[hsl(var(--border))] rounded px-1 py-0 w-full outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
    />
  );
}

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

  // ── Keyframe animation (scenes = keyframes) ──────────────────────────────
  const [showAnim, setShowAnim] = useState(false);
  const [flySec, setFlySec] = useState(2);
  const [staySec, setStaySec] = useState(1);
  const [easing, setEasing] = useState<Easing>("smooth");
  const [loop, setLoop] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef(false);
  const dwellTimer = useRef<number | null>(null);

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

  // Stop any running playback if the panel unmounts (tab switch / close).
  useEffect(() => () => {
    stopRef.current = true;
    if (dwellTimer.current != null) clearTimeout(dwellTimer.current);
    cameraAnimator?.cancel();
  }, [cameraAnimator]);

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
      sceneManager.camera.up,
    );
    pmRef.current.addScene(scene);
    setNewName("");
  };

  /** Fly the camera (position/target/up) to a scene — used by restore + playback. */
  const flyToScene = (scene: ViewerScene, durationMs: number, ease: Easing): Promise<void> => {
    if (!sceneManager) return Promise.resolve();
    const pos = new THREE.Vector3(...scene.camera.position);
    const target = new THREE.Vector3(...scene.camera.target);
    const up = scene.camera.up ? new THREE.Vector3(...scene.camera.up) : new THREE.Vector3(0, 0, 1);
    if (cameraAnimator) {
      return cameraAnimator.flyTo({ position: pos, target, up, duration: durationMs, easing: ease });
    }
    sceneManager.camera.position.copy(pos);
    sceneManager.controls.target.copy(target);
    sceneManager.camera.up.copy(up);
    sceneManager.controls.update();
    return Promise.resolve();
  };

  const handleRestore = async (scene: ViewerScene) => {
    if (!sceneManager) return;

    // Restore camera (incl. up, so presets that changed up don't tilt the view)
    await flyToScene(scene, 600, "smooth");

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
      const cm = scene.colorMode as import("@der-ort/pano-cloud-viewer-core").ColorMode;
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

  // Cancellable dwell between keyframes.
  const sleep = (ms: number) => new Promise<void>(res => {
    dwellTimer.current = window.setTimeout(() => { dwellTimer.current = null; res(); }, ms);
  });

  /** Fly through every scene once, in the displayed order, dwelling at each. */
  const runOnce = async () => {
    for (const s of scenes) {
      if (stopRef.current) return;
      await flyToScene(s, flySec * 1000, easing);
      if (stopRef.current) return;
      if (staySec > 0) await sleep(staySec * 1000);
    }
  };

  const play = async () => {
    if (scenes.length < 2 || playing) return;
    stopRef.current = false;
    setPlaying(true);
    try {
      do { await runOnce(); } while (loop && !stopRef.current);
    } finally {
      setPlaying(false);
    }
  };

  const stop = () => {
    stopRef.current = true;
    if (dwellTimer.current != null) { clearTimeout(dwellTimer.current); dwellTimer.current = null; }
    cameraAnimator?.cancel();
    setPlaying(false);
  };

  /** Record one pass of the animation to a downloadable .webm (best-effort). */
  const record = async () => {
    const canvas = sceneManager?.renderer.domElement as HTMLCanvasElement | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const capture = (canvas as any)?.captureStream?.bind(canvas);
    if (!canvas || !capture || typeof MediaRecorder === "undefined" || scenes.length < 2 || playing) {
      if (typeof MediaRecorder === "undefined") alert("Video recording isn't supported in this browser.");
      return;
    }
    const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
      .find(m => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
    const rec = new MediaRecorder(capture(30) as MediaStream, { mimeType: mime });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise<void>(r => { rec.onstop = () => r(); });

    stopRef.current = false;
    setPlaying(true);
    rec.start();
    try { await runOnce(); } finally { setPlaying(false); }
    rec.stop();
    await stopped;

    const blob = new Blob(chunks, { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scene_animation_${new Date().toISOString().slice(0, 10)}.webm`;
    a.click();
    URL.revokeObjectURL(url);
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
                <InlineEditSceneName value={scene.name} onSave={(name) => pmRef.current?.renameScene(scene.id, name)} />
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

      {/* ── Animation (scenes = keyframes) ─────────────────────────────── */}
      <div className="p-2 border-t border-[hsl(var(--border))]">
        <button
          onClick={() => setShowAnim(o => !o)}
          className="flex items-center justify-between w-full text-[10px] font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          <span>Animation</span>
          <ChevronRight size={12} className={cn("transition-transform", showAnim && "rotate-90")} />
        </button>

        {showAnim && (
          <div className="mt-2 space-y-2">
            <AnimRow label="Fly time">
              <input type="range" min={0.3} max={8} step={0.1} value={flySec}
                onChange={e => setFlySec(Number(e.target.value))}
                className="flex-1 accent-[hsl(var(--brand))] h-1" />
              <span className="w-9 text-right font-mono text-[10px]">{flySec.toFixed(1)}s</span>
            </AnimRow>
            <AnimRow label="Stay">
              <input type="range" min={0} max={8} step={0.1} value={staySec}
                onChange={e => setStaySec(Number(e.target.value))}
                className="flex-1 accent-[hsl(var(--brand))] h-1" />
              <span className="w-9 text-right font-mono text-[10px]">{staySec.toFixed(1)}s</span>
            </AnimRow>
            <AnimRow label="Type">
              <select value={easing} onChange={e => setEasing(e.target.value as Easing)}
                className="flex-1 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] text-foreground">
                <option value="smooth">Smooth</option>
                <option value="linear">Linear</option>
                <option value="easeInOut">Ease in-out</option>
              </select>
            </AnimRow>
            <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)}
                className="accent-[hsl(var(--brand))] w-3 h-3" />
              Loop
            </label>

            <div className="flex gap-1 pt-0.5">
              {!playing ? (
                <button onClick={play} disabled={scenes.length < 2}
                  className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)] disabled:opacity-40 transition-colors text-[10px]">
                  <Play size={12} /> Play
                </button>
              ) : (
                <button onClick={stop}
                  className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors text-[10px]">
                  <Square size={11} /> Stop
                </button>
              )}
              <button onClick={record} disabled={playing || scenes.length < 2} title="Record a .webm video of one pass"
                className="flex items-center justify-center gap-1 px-2 py-1 rounded border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-40 transition-colors text-[10px]">
                <Film size={12} /> Video
              </button>
            </div>
            {scenes.length < 2 && (
              <p className="text-[9px] text-muted-foreground/70">Save at least two scenes to animate.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AnimRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-[10px] text-muted-foreground shrink-0">{label}</span>
      {children}
    </div>
  );
}
