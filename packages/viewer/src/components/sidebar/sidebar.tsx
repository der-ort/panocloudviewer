"use client";

import React, { useState } from "react";
import { Camera, Layers, Ruler, Tag } from "lucide-react";
import { PanoPanel } from "./pano-panel";
import { ScenePanel } from "./scene-panel";
import { MeasurementsPanel } from "./measurements-panel";
import { ClassificationPanel } from "./classification-panel";

type Tab = "panoramas" | "scene" | "measurements" | "classification";

const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: "panoramas",      icon: <Camera size={14} />,  label: "Panoramas" },
  { id: "scene",          icon: <Layers size={14} />,  label: "Scene" },
  { id: "measurements",   icon: <Ruler size={14} />,   label: "Measurements" },
  { id: "classification", icon: <Tag size={14} />,     label: "Classification" },
];

export function Sidebar() {
  const [tab, setTab] = useState<Tab>("panoramas");

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--sidebar-bg,var(--card)))] border-l border-[hsl(var(--border))]">
      {/* Tab bar */}
      <div className="flex border-b border-[hsl(var(--border))] shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            title={t.label}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-mono transition-colors
              ${tab === t.id
                ? "text-[hsl(var(--brand))] border-b-2 border-[hsl(var(--brand))] -mb-px"
                : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.icon}
            <span className="hidden xl:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {tab === "panoramas"      && <PanoPanel />}
        {tab === "scene"          && <ScenePanel />}
        {tab === "measurements"   && <MeasurementsPanel />}
        {tab === "classification" && <ClassificationPanel />}
      </div>
    </div>
  );
}
