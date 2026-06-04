"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { X, Minus, Circle, Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import { useViewer } from "../../providers/viewer-provider";
import { useLocale } from "../../i18n/locale-context";
import { usePcvRoot } from "../pano-cloud-viewer";
import { DISPLAY_PRESETS } from "@der-ort/pano-cloud-viewer-core";
import type { DisplayPreset, DisplaySettings } from "@der-ort/pano-cloud-viewer-core";

/* ── Styling constants ───────────────────────────────────────────────── */

const tabTriggerClass =
  "px-3 py-1.5 text-xs font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--brand))] -mb-px transition-colors";

/* ── Sub-components ──────────────────────────────────────────────────── */

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

/* ── Main dialog ─────────────────────────────────────────────────────── */

interface DisplaySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisplaySettingsDialog({
  open,
  onOpenChange,
}: DisplaySettingsDialogProps) {
  const viewer = useViewer();

  // Use provider displaySettings if available, otherwise local state
  const [localSettings, setLocalSettings] = useState<DisplaySettings>(
    DISPLAY_PRESETS.standard,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings: DisplaySettings =
    (viewer as any).displaySettings ?? localSettings;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setSettings: (s: DisplaySettings) => void =
    (viewer as any).setDisplaySettings ?? setLocalSettings;

  const t = useLocale().displaySettings;
  const pcvRoot = usePcvRoot();

  const applyPreset = (preset: DisplayPreset) => {
    setSettings({ ...DISPLAY_PRESETS[preset] });
  };

  const updateField = <K extends keyof DisplaySettings>(
    key: K,
    value: DisplaySettings[K],
  ) => {
    setSettings({ ...settings, [key]: value, preset: settings.preset });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={pcvRoot?.current ?? undefined}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
            <Dialog.Title className="text-sm font-semibold">
              {t.title}
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-[hsl(var(--muted)/.6)]">
              <X size={14} />
            </Dialog.Close>
          </div>

          <Tabs.Root defaultValue="presets" className="px-4 py-3">
            <Tabs.List className="mb-4 flex gap-1 border-b border-[hsl(var(--border))]">
              <Tabs.Trigger value="presets" className={tabTriggerClass}>
                {t.presetsTab}
              </Tabs.Trigger>
              <Tabs.Trigger value="advanced" className={tabTriggerClass}>
                {t.advancedTab}
              </Tabs.Trigger>
            </Tabs.List>

            {/* Presets Tab */}
            <Tabs.Content value="presets">
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
            </Tabs.Content>

            {/* Advanced Tab */}
            <Tabs.Content value="advanced">
              <div className="space-y-4">
                <SettingsSection title={t.measurementsSection}>
                  <SliderRow
                    label={t.lineWidth}
                    min={1}
                    max={6}
                    step={0.5}
                    value={settings.measurementLineWidth}
                    onChange={(v) => updateField("measurementLineWidth", v)}
                  />
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
                </SettingsSection>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
