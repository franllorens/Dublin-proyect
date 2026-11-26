"use client";

import { useEffect } from "react";
import { reducedMotion } from "@/lib/motion";

/**
 * Lenis on desktop pointers only: phones keep native momentum scrolling,
 * and reduced-motion visitors get plain jumps.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    let lenis: { destroy: () => void } | undefined;
    let cancelled = false;
    const start = () =>
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: true });
      });
    const id = window.setTimeout(start, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      lenis?.destroy();
    };
  }, []);
  return null;
}
