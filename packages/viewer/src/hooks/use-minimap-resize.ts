"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { MinimapRenderer } from "@der-ort/pano-cloud-viewer-core";

/**
 * Minimap pixel size plus a corner-drag handler to resize it.
 *
 * The drag listeners live on `window` (so the pointer can leave the small
 * minimap while dragging) and are tracked in a ref, so a drag interrupted by an
 * unmount is torn down instead of leaking listeners that reference stale state.
 * The current size is read from a ref inside the handler, keeping the callback
 * stable (no re-creation on every size change during a drag).
 */
export function useMinimapResize(
  minimapRef: React.RefObject<MinimapRenderer | null>,
  initialSize = 176,
) {
  const [minimapSize, setMinimapSize] = useState(initialSize);
  const sizeRef = useRef(initialSize);
  sizeRef.current = minimapSize;
  const draggingRef = useRef(false);
  const removeListenersRef = useRef<(() => void) | null>(null);

  const handleMinimapResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    const startY = e.clientY;
    const startSize = sizeRef.current;

    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = startY - ev.clientY; // drag up = larger
      setMinimapSize(Math.max(120, Math.min(400, startSize + delta)));
      minimapRef.current?.resize();
    };
    const onUp = () => {
      draggingRef.current = false;
      removeListenersRef.current?.();
      removeListenersRef.current = null;
      // Re-sync canvas dimensions after the final React state flush.
      setTimeout(() => minimapRef.current?.resize(), 0);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    removeListenersRef.current = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [minimapRef]);

  // Drop any in-flight drag listeners if the component unmounts mid-drag.
  useEffect(() => () => removeListenersRef.current?.(), []);

  return { minimapSize, handleMinimapResizeStart };
}
