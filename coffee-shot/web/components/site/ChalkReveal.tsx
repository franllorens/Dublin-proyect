"use client";

import { useEffect } from "react";
import { reducedMotion, whenNear } from "@/lib/motion";

/**
 * The boards are server-rendered and readable without JS. On the client, if they're still
 * below the fold, each line gets "chalked" left to right the first time they come into view.
 */
export function ChalkReveal({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || reducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen: leave it be
    el.dataset.chalk = "armed";
    const play = () => (el.dataset.chalk = "play");
    const failsafe = window.setTimeout(play, 12000);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          window.clearTimeout(failsafe);
          play();
        }
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    const stop = whenNear(el, () => io.observe(el), "200px 0px");
    return () => {
      stop();
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [targetId]);
  return null;
}
