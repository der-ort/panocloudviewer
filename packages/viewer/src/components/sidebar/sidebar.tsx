"use client";

import React, { useState } from "react";
import { Camera, Layers, Ruler, Tag, Bookmark, Box } from "lucide-react";
import { useLocale } from "../../i18n/locale-context";
import { useViewer } from "../../providers/viewer-provider";
import { LayersPanel } from "./layers-panel";
import { PanoPanel } from "./pano-panel";
import { ScenePanel } from "./scene-panel";
import { MeasurementsPanel } from "./measurements-panel";
import { ClassificationPanel } from "./classification-panel";
import { ScenesPanel } from "./scenes-panel";

type Tab = "layers" | "panoramas" | "scene" | "measurements" | "classification" | "scenes";

export function Sidebar() {
  const [tab, setTab] = useState<Tab>("layers");
  const t = useLocale().sidebar;
  const { uiMode } = useViewer();

  const isPro = uiMode === "professional";

  const ALL_TABS: { id: Tab; icon: React.ReactNode; label: string; proOnly?: boolean }[] = [
    { id: "layers",         icon: <Layers size={14} />,   label: t.tabLayers },
    { id: "panoramas",      icon: <Camera size={14} />,   label: t.tabPanoramas },
    { id: "scene",          icon: <Box size={14} />,      label: t.tabScene },
    { id: "measurements",   icon: <Ruler size={14} />,    label: t.tabMeasurements },
    { id: "classification", icon: <Tag size={14} />,      label: t.tabClassification, proOnly: true },
    { id: "scenes",         icon: <Bookmark size={14} />, label: t.tabScenes,         proOnly: true },
  ];

  // In Lite mode, filter out pro-only tabs
  const TABS = ALL_TABS.filter(entry => isPro || !entry.proOnly);

  // If current tab is now hidden (mode switched to Lite), fall back to panoramas
  const activeTab: Tab = TABS.some(tb => tb.id === tab) ? tab : "panoramas";

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 shrink-0">
        {TABS.map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            title={tb.label}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-mono transition-colors
              ${activeTab === tb.id
                ? "text-[hsl(var(--brand))] border-b-2 border-[hsl(var(--brand))] -mb-px"
                : "text-white/50 hover:text-white/80"}`}
          >
            {tb.icon}
            <span className="hidden xl:block">{tb.label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "layers"         && <LayersPanel />}
        {activeTab === "panoramas"      && <PanoPanel />}
        {activeTab === "scene"          && <ScenePanel />}
        {activeTab === "measurements"   && <MeasurementsPanel />}
        {activeTab === "classification" && <ClassificationPanel />}
        {activeTab === "scenes"         && <ScenesPanel />}
      </div>
    </div>
  );
}
