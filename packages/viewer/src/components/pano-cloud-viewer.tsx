"use client";

import React, { createContext, useContext, useRef, useCallback, Suspense, lazy } from "react";
import { ThemeProvider, useTheme } from "../providers/theme-provider";
import { ViewerProvider, useViewer } from "../providers/viewer-provider";
import { DataProvider } from "../providers/data-provider";
import { LocaleProvider } from "../i18n/locale-context";
import { WorkspaceLayout } from "./workspace-layout";
import { PanoViewer } from "./overlays/pano-viewer";
import { ComponentsProvider } from "../providers/components-provider";
import { createAdapter } from "@der-ort/pano-cloud-viewer-core";
import type { PointCloudSource, UiMode } from "@der-ort/pano-cloud-viewer-core";
import type { ViewerLocale } from "../i18n/types";
import { cn } from "../lib/utils";
import type { ViewerComponents } from "../providers/components-provider";

const Viewport = lazy(() => import("./viewport").then(m => ({ default: m.Viewport })));

/**
 * Context that exposes the `.pcv` root element so portalled content
 * (Radix Dialog.Portal, createPortal) can render inside the scoped CSS boundary.
 */
const PcvRootContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

/**
 * Returns a ref to the `.pcv` root element.
 * Use this as the `container` prop for Radix Portal and createPortal so that
 * portalled content inherits the viewer's scoped CSS custom properties.
 *
 * @example
 * function MyDialog() {
 *   const pcvRef = usePcvRoot();
 *   return (
 *     <Dialog.Portal container={pcvRef?.current ?? undefined}>
 *       ...
 *     </Dialog.Portal>
 *   );
 * }
 */
export function usePcvRoot(): React.RefObject<HTMLDivElement | null> | null {
  return useContext(PcvRootContext);
}

/**
 * Context exposing the numeric `uiScale` factor so packaged layouts can read it
 * directly when needed. The primary scaling mechanism is the `--pcv-scale` CSS
 * custom property set on the `.pcv` root; this context is a convenience for
 * components that need the raw number (e.g. for measurement / layout math).
 */
const UiScaleContext = createContext<number>(1);

/** Returns the active UI chrome scale factor (default `1`). */
export function useUiScale(): number {
  return useContext(UiScaleContext);
}

/**
 * Inline style helper that applies the chrome scale via the CSS `zoom` property,
 * reading the `--pcv-scale` custom property set on the `.pcv` root. Apply this to
 * non-viewport chrome containers (toolbars, sidebars, floating palettes, overlay
 * panels). The 3D `Viewport`/canvas must NOT receive this style so it stays at
 * native resolution and full size.
 *
 * `zoom` is not part of React's `CSSProperties` type, so the object is cast.
 */
export const pcvChromeScaleStyle = { zoom: "var(--pcv-scale, 1)" } as React.CSSProperties;

export interface PanoCloudViewerProps {
  /** Data source: S3 bucket, local path, or Electron IPC */
  source: PointCloudSource;
  /** Initial theme. Defaults to "dark". */
  theme?: "light" | "dark";
  /** CSS class applied to the root element */
  className?: string;
  /**
   * Override UI strings for internationalisation.
   * Import a built-in locale (`en`, `de`) or supply a custom `ViewerLocale` object.
   * Defaults to English when omitted.
   *
   * @example
   * import { de } from '@der-ort/pano-cloud-viewer/i18n';
   * <PanoCloudViewer locale={de} ... />
   */
  locale?: ViewerLocale;
  /**
   * UI complexity mode.
   * - `"professional"` (default): full toolset — all measurements, clipping, display controls, export, all sidebar tabs.
   * - `"lite"`: beginner set — nav modes, basic measurements, panorama/minimap/theme toggles only.
   */
  uiMode?: UiMode;
  /**
   * Scale factor for the UI chrome (toolbars, tool-rail, sidebar, floating
   * palettes, dialogs / overlay panels, status bar). Defaults to `1`.
   *
   * Only the chrome is scaled — the 3D viewport / canvas stays at native
   * resolution and full size, so the point-cloud view remains crisp and you
   * don't lose view area. Implemented via a `--pcv-scale` CSS custom property
   * on the `.pcv` root that chrome containers consume through `zoom`.
   *
   * @example
   * // Enlarge all controls by 25% for touch / high-DPI displays
   * <PanoCloudViewer source={source} uiScale={1.25} />
   */
  uiScale?: number;
  /**
   * Custom UI via render prop. Receives the viewport element that must be rendered.
   * When omitted, the default WorkspaceLayout is used.
   *
   * @example
   * <PanoCloudViewer source={source}>
   *   {(viewport) => (
   *     <div className="relative w-full h-full">
   *       {viewport}
   *       <MyToolbar />
   *     </div>
   *   )}
   * </PanoCloudViewer>
   */
  children?: (viewport: React.ReactNode) => React.ReactNode;
  /**
   * Override any of the default shadcn-style UI primitives.
   * Shallow-merged over the built-in defaults. Useful for consumers who
   * already have a component library and want to swap out e.g. Dialog or Button.
   *
   * @example
   * import { Button } from '@/components/ui/button'; // your own shadcn button
   * <PanoCloudViewer components={{ Button }} ... />
   */
  components?: Partial<ViewerComponents>;
}

function ViewportFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">Initialising renderer…</p>
      </div>
    </div>
  );
}

function PanoOverlayBridge() {
  const { selectedCamera } = useViewer();
  if (!selectedCamera) return null;
  return <PanoViewer />;
}

interface PcvRootProps {
  className?: string;
  /** Chrome scale factor, published as the `--pcv-scale` CSS custom property. */
  uiScale?: number;
  children: React.ReactNode;
}

/**
 * Inner wrapper rendered inside ThemeProvider so it can read `useTheme()`.
 * Applies the `pcv` scoping class and the resolved theme class to the root div,
 * ensuring all CSS tokens and Tailwind `dark:` variants are scoped to this element.
 * Also exposes a ref to this element via PcvRootContext so portalled content
 * (Radix Dialog.Portal, createPortal) can be anchored inside the CSS scope.
 *
 * Publishes `--pcv-scale` so chrome containers can scale via `zoom` while the
 * viewport stays at native resolution.
 */
function PcvRoot({ className, uiScale = 1, children }: PcvRootProps) {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // `--pcv-scale` is a custom property; cast the style object since these keys
  // aren't part of React's CSSProperties.
  const rootStyle = { "--pcv-scale": uiScale } as React.CSSProperties;

  return (
    <PcvRootContext.Provider value={rootRef}>
      <UiScaleContext.Provider value={uiScale}>
        <div
          ref={rootRef}
          className={cn("pcv", resolvedTheme, "w-full h-full", className)}
          data-theme={resolvedTheme}
          style={rootStyle}
        >
          {children}
        </div>
      </UiScaleContext.Provider>
    </PcvRootContext.Provider>
  );
}

/**
 * Drop-in PanoCloud Viewer component.
 *
 * @example
 * ```tsx
 * import { PanoCloudViewer } from '@der-ort/pano-cloud-viewer';
 * import '@der-ort/pano-cloud-viewer/themes/smart-agile.css';
 *
 * <PanoCloudViewer
 *   source={{ type: 's3', baseUrl: 'https://bucket.s3.amazonaws.com/project/' }}
 *   theme="dark"
 * />
 * ```
 */
export function PanoCloudViewer({ source, theme = "dark", className, locale, uiMode, uiScale = 1, children, components }: PanoCloudViewerProps) {
  const adapter = createAdapter(source);
  const config = { source, uiMode };

  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider defaultTheme={theme}>
        <DataProvider adapter={adapter}>
          <ViewerProvider config={config}>
            <ComponentsProvider components={components}>
              <PcvRoot className={className} uiScale={uiScale}>
                {children ? (
                  <>
                    {children(
                      <Suspense fallback={<ViewportFallback />}>
                        <Viewport />
                      </Suspense>
                    )}
                    <PanoOverlayBridge />
                  </>
                ) : (
                  <WorkspaceLayout />
                )}
              </PcvRoot>
            </ComponentsProvider>
          </ViewerProvider>
        </DataProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
