"use client";

import React, { useState } from "react";
import { Camera, Layers, Ruler, Tag, Bookmark } from "lucide-react";
import { useLocale } from "../../i18n/locale-context";
import { PanoPanel } from "./pano-panel";
import { ScenePanel } from "./scene-panel";
import { MeasurementsPanel } from "./measurements-panel";
import { ClassificationPanel } from "./classification-panel";
import { ScenesPanel } from "./scenes-panel";

type Tab = "panoramas" | "scene" | "measurements" | "classification" | "scenes";

export function Sidebar() {
  const [tab, setTab] = useState<Tab>("panoramas");
  const t = useLocale().sidebar;

  const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "panoramas",      icon: <Camera size={14} />,  label: t.tabPanoramas },
    { id: "scene",          icon: <Layers size={14} />,  label: t.tabScene },
    { id: "measurements",   icon: <Ruler size={14} />,   label: t.tabMeasurements },
    { id: "classification", icon: <Tag size={14} />,     label: t.tabClassification },
    { id: "scenes",         icon: <Bookmark size={14} />, label: t.tabScenes },
  ];

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
        {tab === "scenes"         && <ScenesPanel />}
      </div>
    </div>
  );
}
