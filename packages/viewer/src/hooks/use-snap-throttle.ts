"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Throttle expensive measurement point-snap picks to at most one per animation
 * frame. A GPU pick on every `mousemove` stalls badly on dense clouds, so we
 * store only the latest cursor NDC and resolve it once per frame.
 *
 * The pending frame is cancelled on unmount so it can't fire into a torn-down
 * scene (a real hazard under React StrictMode's mount/unmount/mount cycle).
 *
 * @param pick Called with the latest cursor NDC once per frame. May be a fresh
 *             closure each render — the newest is always used without rescheduling.
 */
export function useSnapThrottle(pick: (nx: number, ny: number) => void) {
  const rafRef = useRef<number | null>(null);
  const ndcRef = useRef<{ nx: number; ny: number } | null>(null);
  const pickRef = useRef(pick);
  pickRef.current = pick;

  const scheduleSnap = useCallback((nx: number, ny: number) => {
    ndcRef.current = { nx, ny };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const p = ndcRef.current;
        if (p) pickRef.current(p.nx, p.ny);
      });
    }
  }, []);

  const cancelSnap = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => cancelSnap, [cancelSnap]);

  return { scheduleSnap, cancelSnap };
}
