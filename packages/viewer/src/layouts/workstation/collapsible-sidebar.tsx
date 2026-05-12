"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface CollapsibleSidebarProps {
  side: "left" | "right";
  children: React.ReactNode;
  defaultOpen?: boolean;
  width?: string;
}

export function CollapsibleSidebar({ side, children, defaultOpen = true, width = "w-60" }: CollapsibleSidebarProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isLeft = side === "left";

  const ChevronIcon = open ? (isLeft ? ChevronLeft : ChevronRight) : (isLeft ? ChevronRight : ChevronLeft);

  return (
    <div className={cn(
      "absolute top-0 bottom-0 z-20 flex",
      isLeft ? "left-0" : "right-0",
      isLeft ? "flex-row" : "flex-row-reverse",
    )}>
      <div className={cn(
        "h-full overflow-y-auto overflow-x-hidden transition-all duration-200 bg-[hsl(var(--background)/0.95)] backdrop-blur-sm",
        isLeft ? "border-r" : "border-l",
        "border-[hsl(var(--border))]",
        open ? width : "w-0",
      )}>
        {open && (
          <div className="p-2 space-y-2 min-w-[230px]">
            {children}
          </div>
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "self-center -mx-px z-10",
          "flex items-center justify-center w-5 h-10 rounded-md",
          "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
          "text-muted-foreground hover:text-foreground transition-colors",
          "shadow-md",
        )}
      >
        <ChevronIcon size={14} />
      </button>
    </div>
  );
}
