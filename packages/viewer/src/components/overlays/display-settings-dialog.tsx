"use client";

import React, { useEffect } from "react";
import { X, Minus, Circle, Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { usePcvRoot } from "../pano-cloud-viewer";
import { useComponents } from "../../providers/components-provider";
import { useDraggable } from "../../hooks/use-draggable";
import { DISPLAY_PRESETS } from "@der-ort/pano-cloud-viewer-core";
import type { DisplayPreset, DisplaySettings } from "@der-ort/pano-cloud-viewer-core";

/* ── Sub-components ──────────────────────────────────────────────────────── */

const PRESET_ICONS: Record<DisplayPreset, React.ReactNode> = {
  compact: <Minus size={18} />,
  standard: <Circle size={18} />,
  prominent: <Plus size={18} />,
};

function PresetCard({
  preset,
  label,
  description,
  active,
  onClick,
}: {
  preset: DisplayPreset;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-md border p-3 text-center transition-colors",
        "hover:bg-[hsl(var(--muted)/.4)]",
        active
          ? "border-[hsl(var(--brand))] bg-[hsl(var(--brand)/.08)]"
          : "border-[hsl(var(--border))]",
      )}
    >
      <span
        className={cn(
          "text-muted-foreground",
          active && "text-[hsl(var(--brand))]",
        )}
      >
        {PRESET_ICONS[preset]}
      </span>
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[10px] leading-tight text-muted-foreground">
        {description}
      </span>
    </button>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <input
        type="range"
        className="pcv-slider flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
        {value.toFixed(step < 0.1 ? 2 : 1)}
      </span>
    </div>
  );
}

function SegmentedRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 overflow-hidden rounded-md border border-[hsl(var(--border))]">
        {options.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 px-2 py-1 text-xs transition-colors",
              i > 0 && "border-l border-[hsl(var(--border))]",
              value === opt.value
                ? "bg-[hsl(var(--brand)/.15)] font-semibold text-[hsl(var(--brand))]"
                : "text-muted-foreground hover:bg-[hsl(var(--muted)/.4)]",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main dialog ─────────────────────────────────────────────────────────── */

interface DisplaySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisplaySettingsDialog({
  open,
  onOpenChange,
}: DisplaySettingsDialogProps) {
  const viewer = useViewer();
  const {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
  } = useComponents();

  const settings = viewer.displaySettings;
  const setSettings = viewer.setDisplaySettings;

  const t = useLocale().displaySettings;
  // The marker-label-mode strings are not part of the strict ViewerLocale
  // interface, so they live here as fallbacks (English + German). We pick the
  // language heuristically from an existing localized string, then allow the
  // locale dictionary to override if a future build adds the keys.
  const tx = t as typeof t & Partial<Record<string, string>>;
  const isDe = t.advancedTab === "Erweitert";
  const labelStr = {
    markerLabels: isDe ? "Beschriftungen" : "Labels",
    markerLabelHover: isDe ? "Bei Hover" : "On hover",
    markerLabelAlways: isDe ? "Immer" : "Always",
    markerLabelHidden: isDe ? "Aus" : "Hidden",
  };
  const pcvRoot = usePcvRoot();
  const { position, onDragStart, reset } = useDraggable();

  // Recenter the dialog each time it is reopened.
  useEffect(() => { if (!open) reset(); }, [open, reset]);

  const applyPreset = (preset: DisplayPreset) => {
    setSettings({ ...DISPLAY_PRESETS[preset] });
  };

  const updateField = <K extends keyof DisplaySettings>(
    key: K,
    value: DisplaySettings[K],
  ) => {
    // Manual tweak → "custom", so no preset card claims the diverged values.
    setSettings({ ...settings, [key]: value, preset: "custom" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[420px]"
        container={pcvRoot?.current ?? undefined}
        dragOffset={position}
      >
        {/* Header — drag handle */}
        <DialogHeader
          className="cursor-move select-none"
          onMouseDown={onDragStart}
        >
          <DialogTitle>{t.title}</DialogTitle>
          <DialogClose onMouseDown={(e) => e.stopPropagation()}>
            <X size={14} />
          </DialogClose>
        </DialogHeader>

        <Tabs defaultValue="presets" className="px-4 py-3">
          <TabsList className="mb-4">
            <TabsTrigger value="presets">{t.presetsTab}</TabsTrigger>
            <TabsTrigger value="advanced">{t.advancedTab}</TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets">
            <div className="grid grid-cols-3 gap-3">
              {(["compact", "standard", "prominent"] as DisplayPreset[]).map(
                (preset) => (
                  <PresetCard
                    key={preset}
                    preset={preset}
                    label={
                      (t[`preset_${preset}` as keyof typeof t] as string) ??
                      preset
                    }
                    description={
                      (t[
                        `preset_${preset}_desc` as keyof typeof t
                      ] as string) ?? ""
                    }
                    active={settings.preset === preset}
                    onClick={() => applyPreset(preset)}
                  />
                ),
              )}
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <div className="space-y-4">
              <SettingsSection title={t.measurementsSection}>
                {/* Line width slider removed — LineBasicMaterial.linewidth is a
                    WebGL no-op, the slider never had a visible effect. */}
                <SliderRow
                  label={t.labelScale}
                  min={0.3}
                  max={2.5}
                  step={0.1}
                  value={settings.measurementLabelScale}
                  onChange={(v) => updateField("measurementLabelScale", v)}
                />
                <SliderRow
                  label={t.sphereRadius}
                  min={0.02}
                  max={0.5}
                  step={0.01}
                  value={settings.measurementSphereRadius}
                  onChange={(v) => updateField("measurementSphereRadius", v)}
                />
              </SettingsSection>
              <SettingsSection title={t.markersSection}>
                <SliderRow
                  label={t.markerScale}
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  value={settings.markerSphereScale}
                  onChange={(v) => updateField("markerSphereScale", v)}
                />
                <SliderRow
                  label={t.markerOpacity}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={settings.markerSphereOpacity}
                  onChange={(v) => updateField("markerSphereOpacity", v)}
                />
                <SliderRow
                  label={t.markerLabelScale}
                  min={0.3}
                  max={2.5}
                  step={0.1}
                  value={settings.markerLabelScale}
                  onChange={(v) => updateField("markerLabelScale", v)}
                />
                <SegmentedRow<NonNullable<DisplaySettings["markerLabelMode"]>>
                  label={tx.markerLabels ?? labelStr.markerLabels}
                  value={settings.markerLabelMode ?? "hover"}
                  options={[
                    { value: "hover", label: tx.markerLabelHover ?? labelStr.markerLabelHover },
                    { value: "always", label: tx.markerLabelAlways ?? labelStr.markerLabelAlways },
                    { value: "hidden", label: tx.markerLabelHidden ?? labelStr.markerLabelHidden },
                  ]}
                  onChange={(v) => updateField("markerLabelMode", v)}
                />
              </SettingsSection>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
