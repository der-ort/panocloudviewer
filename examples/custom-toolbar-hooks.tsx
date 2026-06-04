/**
 * Custom Toolbar — Action Hooks + Primitive Override
 *
 * Demonstrates the third customisation axis: building your own UI from scratch
 * using the library's action hooks, with a swapped primitive (Button).
 *
 *  1. RENDER PROP — Use `children` to compose your own layout.
 *     Components that call hooks (useNavigationActions etc.) must be rendered
 *     INSIDE the render-prop tree because PanoCloudViewer's providers are only
 *     available below it. Define helper components (CustomToolbar) and render
 *     them alongside {viewport} inside the render prop.
 *
 *  2. ACTION HOOKS — Each hook encapsulates a logical group of actions:
 *       useNavigationActions()   orbit/free/pan modes, fitToView, flyToView
 *       useMeasurementActions()  start distance/height/area, clearAll
 *       useDisplayActions()      colorMode, setColorMode, pointBudget, pointSize
 *       useVisibilityActions()   showMarkers, showMinimap toggles
 *     All returned callbacks are stable (memoised) — safe in onClick props.
 *
 *  3. COMPONENTS PROP — Pass `components={{ Button: MyButton }}` to override
 *     any shadcn-style primitive used internally by the library. The override
 *     is shallow-merged over the defaults, so you only need to supply the slots
 *     you want to replace. The library forwards all ButtonProps to your
 *     component, including `variant` ("default"|"secondary"|"ghost"|"outline"|
 *     "destructive") and `size` ("sm"|"md"|"icon").
 *
 * Usage:
 *   import CustomToolbarHooks from './custom-toolbar-hooks';
 *   <CustomToolbarHooks />
 */
"use client";

import React from "react";
import {
  PanoCloudViewer,
  useNavigationActions,
  useMeasurementActions,
  useDisplayActions,
  useVisibilityActions,
  cn,
} from "@der-ort/pano-cloud-viewer";
import type { ButtonProps } from "@der-ort/pano-cloud-viewer";
import "@der-ort/pano-cloud-viewer/themes/base.css";

// ── Data source ─────────────────────────────────────────────────────────────
const SOURCE = {
  type: "s3" as const,
  baseUrl: process.env.NEXT_PUBLIC_POINTCLOUD_URL ?? "/sample/",
};

// ── 1. Custom Button primitive ───────────────────────────────────────────────
// Match the ButtonProps signature exactly. The library passes `variant`,
// `size`, `className`, `onClick`, `disabled`, and `children` via spread.
//
// This example uses pure Tailwind + CSS vars so it stays self-contained — in
// a real project you'd import your existing button component instead:
//
//   import { Button as MyButton } from '@/components/ui/button';
//   <PanoCloudViewer components={{ Button: MyButton }} ... />
const MyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variantClass: Record<string, string> = {
      default:
        "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90",
      secondary:
        "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:opacity-80",
      ghost:
        "bg-transparent hover:bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
      outline:
        "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))]",
      destructive:
        "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-85",
    };
    const sizeClass: Record<string, string> = {
      sm:   "h-7 px-2.5 text-xs",
      md:   "h-9 px-4 text-sm",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles — note: rounded-lg instead of the default rounded-md
          // so you can visually confirm your button is being used by the library.
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
          "rounded-lg font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClass[variant ?? "default"],
          sizeClass[size ?? "md"],
          className,
        )}
        {...props}
      />
    );
  },
);
MyButton.displayName = "MyButton";

// ── 2. Custom toolbar — calls action hooks ───────────────────────────────────
// IMPORTANT: This component must be rendered inside PanoCloudViewer's render
// prop because it calls hooks that depend on ViewerProvider context.
function CustomToolbar() {
  const nav = useNavigationActions();
  const measure = useMeasurementActions();
  const display = useDisplayActions();
  const visibility = useVisibilityActions();

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[hsl(var(--card)/0.85)] backdrop-blur-md border border-[hsl(var(--border))] shadow-lg">

      {/* Navigation modes */}
      <ToolGroup label="Navigate">
        <ToolBtn
          active={nav.navigationMode === "orbit"}
          title="Orbit (tumble around target)"
          onClick={() => nav.setNavigationMode("orbit")}
        >
          Orbit
        </ToolBtn>
        <ToolBtn
          active={nav.navigationMode === "free"}
          title="Free (Blender-style: left+middle drag rotates)"
          onClick={() => nav.setNavigationMode("free")}
        >
          Free
        </ToolBtn>
        <ToolBtn
          active={nav.navigationMode === "pan"}
          title="Pan (map mode: left-drag pans, horizon locked)"
          onClick={() => nav.setNavigationMode("pan")}
        >
          Pan
        </ToolBtn>
        <ToolBtn
          active={false}
          title="Fit entire point cloud in view"
          onClick={nav.fitToView}
        >
          Fit
        </ToolBtn>
      </ToolGroup>

      <Divider />

      {/* Measurement tools */}
      <ToolGroup label="Measure">
        <ToolBtn
          active={measure.activeTool === "measure-distance"}
          title="Distance between two points"
          onClick={() => measure.startTool("distance")}
        >
          Dist
        </ToolBtn>
        <ToolBtn
          active={measure.activeTool === "measure-height"}
          title="Vertical height between two points"
          onClick={() => measure.startTool("height")}
        >
          Height
        </ToolBtn>
        <ToolBtn
          active={measure.activeTool === "measure-area"}
          title="Polygon area (click 3+ points, right-click to finish)"
          onClick={() => measure.startTool("area")}
        >
          Area
        </ToolBtn>
        <ToolBtn
          active={false}
          title="Clear all measurements"
          onClick={measure.clearAll}
          danger
        >
          Clear
        </ToolBtn>
      </ToolGroup>

      <Divider />

      {/* Display / colour mode */}
      <ToolGroup label="Colour">
        {(["rgb", "height", "intensity", "classification"] as const).map((mode) => (
          <ToolBtn
            key={mode}
            active={display.colorMode === mode}
            title={`Colour by ${mode}`}
            onClick={() => display.setColorMode(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1, 3)}
          </ToolBtn>
        ))}
      </ToolGroup>

      <Divider />

      {/* Visibility toggles */}
      <ToolGroup label="Show">
        <ToolBtn
          active={visibility.showMarkers}
          title="Toggle panorama camera markers"
          onClick={visibility.toggleMarkers}
        >
          Pano
        </ToolBtn>
        <ToolBtn
          active={visibility.showMinimap}
          title="Toggle top-down minimap"
          onClick={visibility.toggleMinimap}
        >
          Map
        </ToolBtn>
      </ToolGroup>
    </div>
  );
}

// ── Small helper components (no action hooks — local only) ───────────────────
function ToolGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={label}>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[hsl(var(--border))] mx-0.5" />;
}

function ToolBtn({
  active,
  danger = false,
  title,
  onClick,
  children,
}: {
  active: boolean;
  danger?: boolean;
  title?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "px-2 h-7 rounded text-xs font-medium transition-colors",
        active
          ? "bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))]"
          : danger
            ? "text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.12)]"
            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
      )}
    >
      {children}
    </button>
  );
}

// ── 3. Root component ────────────────────────────────────────────────────────
export default function CustomToolbarHooks() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/*
        components={{ Button: MyButton }} — shallow-merged over the defaults.
        The library will use MyButton wherever it renders a Button internally
        (toolbar icon buttons, dialog actions, popover triggers, etc.).
        Only pass the slots you want to override; omitted slots keep their defaults.

        children render prop — receives the lazy-loaded Viewport element.
        Compose any JSX here; components that call action hooks must live
        inside this tree so they can access ViewerProvider context.
      */}
      <PanoCloudViewer
        source={SOURCE}
        theme="dark"
        components={{ Button: MyButton }}
      >
        {(viewport) => (
          <div className="relative w-full h-full overflow-hidden">
            {/* Full-bleed 3D viewport */}
            <div className="absolute inset-0">{viewport}</div>

            {/*
              CustomToolbar is rendered inside the render-prop tree — it can
              safely call useNavigationActions, useMeasurementActions, etc.
              because ViewerProvider is an ancestor.
            */}
            <CustomToolbar />
          </div>
        )}
      </PanoCloudViewer>
    </div>
  );
}
