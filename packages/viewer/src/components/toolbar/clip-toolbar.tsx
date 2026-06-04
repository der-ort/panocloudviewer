"use client";

import React from "react";
import {
  BoxSelect,
  Eye,
  EyeOff,
  Maximize2,
  Move,
  Plus,
  RotateCw,
  Scissors,
  Trash2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useClipActions } from "../../hooks/use-clip-actions";
import { useLocale } from "../../i18n/locale-context";

export function ClipToolbar() {
  const { boxes, selectedBoxId: selectedClipBoxId, addBox, clearAll, setModeAll, selectBox, removeBox, setBoxVisible, setTransformMode } =
    useClipActions();
  const t = useLocale().clipToolbar;

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

      {/* Transform buttons — shown only when a box is selected */}
      {selectedClipBoxId && (
        <>
          <div className="h-px bg-white/10 mx-1 mt-1.5 mb-1.5" />
          <div className="flex items-center gap-1 px-1">
            <button
              title={t.move}
              onClick={() => setTransformMode("translate")}
              className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Move size={12} />
              <span className="text-[10px]">{t.move}</span>
            </button>
            <button
              title={t.scale}
              onClick={() => setTransformMode("scale")}
              className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Maximize2 size={12} />
              <span className="text-[10px]">{t.scale}</span>
            </button>
            <button
              title={t.rotateZ}
              onClick={() => setTransformMode("rotate")}
              className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <RotateCw size={12} />
              <span className="text-[10px]">{t.rotateZ}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
