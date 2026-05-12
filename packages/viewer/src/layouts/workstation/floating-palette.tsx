"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface FloatingPaletteProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
}

export function FloatingPalette({ title, icon, children, defaultCollapsed = false, className }: FloatingPaletteProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={cn(
      "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden",
      "min-w-[220px]",
      className,
    )}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-muted/40 transition-colors"
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="flex-1 text-left">{title}</span>
        {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[hsl(var(--border))]">
          {children}
        </div>
      )}
    </div>
  );
}
