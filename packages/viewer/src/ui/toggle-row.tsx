"use client";

import React from "react";
import { cn } from "../lib/utils";

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onToggle: () => void;
  /** When set, the row is dimmed and non-interactive. */
  disabled?: boolean;
  /** Optional subtitle shown under the label (also used as the tooltip). */
  hint?: string;
}

/**
 * A labelled pill switch: icon, label (+ optional hint subtitle), and an on/off
 * toggle. Shared by the Layers panel, the minimal settings popover, and the
 * workstation view-settings palette so the switch looks and behaves identically
 * everywhere.
 */
export function ToggleRow({ icon, label, active, onToggle, disabled, hint }: ToggleRowProps) {
  const on = active && !disabled;
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      title={hint ?? label}
      className={cn(
        "flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-colors text-left",
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-muted",
      )}
    >
      <span className={cn("text-muted-foreground", on && "text-[hsl(var(--brand))]")}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs text-foreground truncate">{label}</span>
        {hint && <span className="block text-[10px] text-muted-foreground/60 truncate">{hint}</span>}
      </span>
      <div
        className={cn(
          "w-7 h-4 rounded-full transition-colors flex items-center px-0.5 shrink-0",
          on ? "bg-[hsl(var(--brand)/0.6)]" : "bg-muted",
        )}
      >
        <div
          className={cn(
            "w-3 h-3 rounded-full bg-foreground transition-transform",
            on && "translate-x-3",
          )}
        />
      </div>
    </button>
  );
}
