"use client";

import React from "react";
import {
  BoxSelect,
  Eye,
  EyeOff,
  Maximize2,
  Move,
  Plus,
  Power,
  RotateCcw,
  RotateCw,
  Scissors,
  ScissorsLineDashed,
  Trash2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useClipActions } from "../../hooks/use-clip-actions";
import { useLocale } from "../../i18n/locale-context";

export function ClipToolbar() {
  const { boxes, selectedBoxId: selectedClipBoxId, addBox, clearAll, setModeAll, selectBox, removeBox, setBoxVisible, isEnabled, setEnabled, outlinesVisible, setOutlinesVisible, resetRotation, setTransformMode } =
    useClipActions();
  const t = useLocale().clipToolbar;

  // Local mirrors of the manager flags so the buttons re-render on click.
  // Seeded from the manager and re-synced whenever the box list changes.
  const [enabled, setEnabledLocal] = React.useState<boolean>(isEnabled);
  const [outlines, setOutlinesLocal] = React.useState<boolean>(outlinesVisible);
  const [mode, setMode] = React.useState<"translate" | "scale" | "rotate">("scale");
  React.useEffect(() => {
    setEnabledLocal(isEnabled);
    setOutlinesLocal(outlinesVisible);
  }, [isEnabled, outlinesVisible, boxes]);

  const TRANSFORM_MODES = [
    { m: "translate" as const, icon: <Move size={12} />, label: t.move },
    { m: "scale" as const, icon: <Maximize2 size={12} />, label: t.scale },
    { m: "rotate" as const, icon: <RotateCw size={12} />, label: t.rotateZ },
  ];

  if (boxes.length === 0) return null;

  // Use first *visible* box's mode to match ClipManager.applyAll() which derives
  // the effective clip mode from visible[0].mode — not the overall boxes[0].mode.
  const firstVisible = boxes.find(b => b.visible);
  const isInside = (firstVisible?.mode ?? "outside") === "inside";

  return (
    <div className="flex flex-col w-52 py-2 px-1 select-none">
      {/* Header row */}
      <div className="flex items-center justify-between px-1 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <BoxSelect size={13} className="text-[hsl(var(--brand))]" />
          <span>{t.title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            title={t.addBox}
            onClick={addBox}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Plus size={12} />
            <span className="text-[11px]">{t.addBox}</span>
          </button>
          <button
            title={t.clearAll}
            onClick={clearAll}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mx-1 mb-1.5" />

      {/* Global clipping on/off toggle */}
      <div className="px-1 mb-1.5">
        <button
          onClick={() => {
            const next = !enabled;
            setEnabledLocal(next);
            setEnabled(next);
          }}
          title={enabled ? "Clipping on" : "Clipping off"}
          className={cn(
            "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border",
            enabled
              ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]"
              : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          {enabled ? <Scissors size={12} /> : <ScissorsLineDashed size={12} />}
          <span className="flex-1 text-left">{enabled ? "Clipping on" : "Clipping off"}</span>
          <Power size={12} className={enabled ? "text-[hsl(var(--brand))]" : "text-muted-foreground"} />
        </button>
      </div>

      {/* Global outlines on/off — hides all box wireframes/handles for clean
          screenshots WITHOUT turning clipping off. */}
      <div className="px-1 mb-1.5">
        <button
          onClick={() => {
            const next = !outlines;
            setOutlinesLocal(next);
            setOutlinesVisible(next);
          }}
          title={outlines ? "Outlines visible" : "Outlines hidden"}
          className={cn(
            "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border",
            outlines
              ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]"
              : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          {outlines ? <Eye size={12} /> : <EyeOff size={12} />}
          <span className="flex-1 text-left">{outlines ? "Outlines on" : "Outlines off"}</span>
        </button>
      </div>

      {/* Global clip mode toggle */}
      <div className="px-1 mb-1.5">
        <button
          onClick={() => setModeAll(isInside ? "outside" : "inside")}
          className={cn(
            "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors",
            "border",
            isInside
              ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]"
              : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Scissors size={12} />
          <span>{isInside ? t.keepInside : t.keepOutside}</span>
        </button>
      </div>

      {/* Volume rows */}
      <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5 px-1">
        {boxes.map((box) => {
          const isSelected = box.id === selectedClipBoxId;
          return (
            <div
              key={box.id}
              className={cn(
                "flex items-center gap-1 rounded px-1 py-0.5 transition-colors",
                isSelected ? "bg-[hsl(var(--brand)/0.15)]" : "hover:bg-muted/40"
              )}
            >
              {/* Visibility toggle */}
              <button
                title={box.visible ? t.hide : t.show}
                onClick={() => setBoxVisible(box.id, !box.visible)}
                className="flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                {box.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>

              {/* Name — click to select / deselect */}
              <button
                title={box.name}
                onClick={() => selectBox(isSelected ? null : box.id)}
                className={cn(
                  "flex-1 text-left text-xs truncate rounded transition-colors",
                  isSelected ? "text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {box.name}
              </button>

              {/* Delete */}
              <button
                title={t.delete}
                onClick={() => removeBox(box.id)}
                className="flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Transform mode for the selected box — one handle set at a time
          (move arrows / resize spheres / XYZ rotation rings). */}
      {selectedClipBoxId && (
        <>
          <div className="h-px bg-white/10 mx-1 mt-1.5 mb-1.5" />
          <div className="flex items-center gap-1 px-1">
            {TRANSFORM_MODES.map(({ m, icon, label }) => (
              <button
                key={m}
                onClick={() => { setMode(m); setTransformMode(m); }}
                title={label}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded text-xs transition-colors border",
                  mode === m
                    ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {icon}
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>
          {/* Reset the box back to axis-aligned (handy after free rotation) */}
          <div className="px-1 mt-1">
            <button
              onClick={() => resetRotation()}
              title="Reset the box back to axis-aligned"
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[10px] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset rotation</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
