"use client";

import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  Button,
  Slider,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Toggle,
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "../ui";
import type { ButtonProps } from "../ui/button";
import type { SliderProps } from "../ui/slider";
import type { ToggleProps } from "../ui/toggle";

/* ── ViewerComponents interface ─────────────────────────────────────────────── */

// Re-using component ref types from Radix primitives via React.ComponentType.
// Each slot is typed against the default primitive's own props interface so
// consumer overrides must be prop-compatible.

export interface ViewerComponents {
  // Buttons
  Button: React.ComponentType<ButtonProps>;

  // Form controls
  Slider: React.ComponentType<SliderProps>;
  Toggle: React.ComponentType<ToggleProps>;

  // Dialog
  Dialog: typeof Dialog;
  DialogTrigger: typeof DialogTrigger;
  DialogContent: typeof DialogContent;
  DialogHeader: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
  DialogTitle: typeof DialogTitle;
  DialogClose: typeof DialogClose;

  // Tabs
  Tabs: typeof Tabs;
  TabsList: typeof TabsList;
  TabsTrigger: typeof TabsTrigger;
  TabsContent: typeof TabsContent;

  // Popover
  Popover: typeof Popover;
  PopoverTrigger: typeof PopoverTrigger;
  PopoverContent: typeof PopoverContent;

  // Tooltip
  TooltipProvider: typeof TooltipProvider;
  Tooltip: typeof Tooltip;
  TooltipTrigger: typeof TooltipTrigger;
  TooltipContent: typeof TooltipContent;

  // Select
  Select: typeof Select;
  SelectGroup: typeof SelectGroup;
  SelectValue: typeof SelectValue;
  SelectTrigger: typeof SelectTrigger;
  SelectContent: typeof SelectContent;
  SelectLabel: typeof SelectLabel;
  SelectItem: typeof SelectItem;
  SelectSeparator: typeof SelectSeparator;
}

/* ── Default components ──────────────────────────────────────────────────────── */

export const defaultComponents: ViewerComponents = {
  Button,
  Slider,
  Toggle,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};

/* ── Context ─────────────────────────────────────────────────────────────────── */

const ComponentsContext = createContext<ViewerComponents>(defaultComponents);

/* ── Provider ────────────────────────────────────────────────────────────────── */

export interface ComponentsProviderProps {
  /** Partial overrides merged over the shadcn-style defaults. */
  components?: Partial<ViewerComponents>;
  children: ReactNode;
}

export function ComponentsProvider({
  components,
  children,
}: ComponentsProviderProps) {
  const merged = useMemo<ViewerComponents>(
    () =>
      components
        ? ({ ...defaultComponents, ...components } as ViewerComponents)
        : defaultComponents,
    [components],
  );

  return (
    <ComponentsContext.Provider value={merged}>
      {children}
    </ComponentsContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────────────────────── */

/**
 * Returns the active component set from the nearest ComponentsProvider.
 * Falls back to `defaultComponents` if no provider is present so that
 * individual primitives used outside a full PanoCloudViewer tree still work.
 */
export function useComponents(): ViewerComponents {
  return useContext(ComponentsContext);
}
