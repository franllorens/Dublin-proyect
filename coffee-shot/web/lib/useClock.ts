"use client";

import { useEffect, useState } from "react";
import { dublinNow, nowFromOverride, type DublinNow } from "./hours";

/**
 * Dublin wall-clock, computed on the client only (the page is static, so the server
 * can't know the hour). null until hydrated: callers render a neutral state.
 */
export function useDublinClock(): DublinNow | null {
  const [now, setNow] = useState<DublinNow | null>(null);
  useEffect(() => {
    const read = () => nowFromOverride(window.location.search) ?? dublinNow();
    setNow(read());
    const id = window.setInterval(() => setNow(read()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
