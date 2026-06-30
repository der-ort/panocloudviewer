"use client";

import { useEffect, useState } from "react";

/**
 * True on small / touch-first screens (phones and small tablets). Uses a
 * `matchMedia` width query so it updates on rotate/resize. SSR-safe (returns
 * `false` until mounted on the client).
 */
export function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpointPx : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx]);

  return isMobile;
}
