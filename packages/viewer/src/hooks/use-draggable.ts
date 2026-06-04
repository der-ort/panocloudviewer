"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface DraggableState {
  /** offset applied via transform: translate(x, y) */
  position: { x: number; y: number };
  /** attach to the drag-handle element's onMouseDown */
  onDragStart: (e: React.MouseEvent) => void;
  /** reset back to {0,0} */
  reset: () => void;
}

export interface UseDraggableOptions {
  /** Optional container; the grabbed point is kept within its bounds so the panel can't be lost off-screen. */
  bounds?: React.RefObject<HTMLElement | null>;
}

/**
 * Drag-to-move hook. Attach `onDragStart` to a header element's `onMouseDown`
 * and apply `transform: translate(position.x, position.y)` to the panel.
 */
export function useDraggable(options?: UseDraggableOptions): DraggableState {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });

  // Keep the latest bounds ref without making onDragStart depend on the options object.
  const boundsRef = useRef(options?.bounds);
  boundsRef.current = options?.bounds;

  // Track the in-flight drag listeners so we can detach them on unmount.
  const moveRef = useRef<((e: MouseEvent) => void) | null>(null);
  const upRef = useRef<(() => void) | null>(null);

  const endDrag = useCallback(() => {
    if (moveRef.current) window.removeEventListener("mousemove", moveRef.current);
    if (upRef.current) window.removeEventListener("mouseup", upRef.current);
    moveRef.current = null;
    upRef.current = null;
  }, []);

  // Detach any in-flight drag if the component unmounts mid-drag.
  useEffect(() => endDrag, [endDrag]);

  const reset = useCallback(() => {
    positionRef.current = { x: 0, y: 0 };
    setPosition({ x: 0, y: 0 });
  }, []);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const baseX = positionRef.current.x;
      const baseY = positionRef.current.y;
      // Read the container rect ONCE here (not per mousemove) to avoid layout thrashing.
      const rect = boundsRef.current?.current?.getBoundingClientRect() ?? null;

      const onMove = (ev: MouseEvent) => {
        let dx = ev.clientX - startX;
        let dy = ev.clientY - startY;
        if (rect) {
          // Clamp the grabbed point to the container so the header stays reachable.
          const cx = Math.min(rect.right, Math.max(rect.left, ev.clientX));
          const cy = Math.min(rect.bottom, Math.max(rect.top, ev.clientY));
          dx = cx - startX;
          dy = cy - startY;
        }
        const next = { x: baseX + dx, y: baseY + dy };
        positionRef.current = next;
        setPosition(next);
      };

      moveRef.current = onMove;
      upRef.current = endDrag;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", endDrag);
    },
    [endDrag],
  );

  return { position, onDragStart, reset };
}
