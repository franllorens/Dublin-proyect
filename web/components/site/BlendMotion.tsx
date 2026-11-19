"use client";

import { useEffect } from "react";
import { loadGsap, reducedMotion, whenNear } from "@/lib/motion";

/** The two halves swing shut into one circle (50/50); the route line draws as you read. */
export function BlendMotion({ visual, mark, route }: { visual: string; mark: string; route: string }) {
  useEffect(() => {
    const el = document.getElementById("blend");
    if (!el || reducedMotion()) return;
    let ctx: { revert: () => void } | undefined;
    const stop = whenNear(el, () =>
      loadGsap().then(({ gsap }) => {
        ctx = gsap.context(() => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: `.${visual}`, start: "top 72%", once: true } });
          tl.from("[data-half=left]", { x: -60, rotation: -14, transformOrigin: "50% 50%", duration: 1.1, ease: "back.out(1.4)" }, 0)
            .from("[data-half=right]", { x: 60, rotation: 14, transformOrigin: "50% 50%", duration: 1.1, ease: "back.out(1.4)" }, 0)
            .from(`.${mark}`, { opacity: 0, y: 10, duration: 0.5, ease: "power2.out" }, 0.75);
          gsap.from("[data-route-line]", {
            scaleY: 0,
            ease: "none",
            scrollTrigger: { trigger: `.${route}`, start: "top 80%", end: "bottom 65%", scrub: 0.6 },
          });
        }, el);
      }),
    );
    return () => {
      stop();
      ctx?.revert();
    };
  }, [visual, mark, route]);
  return null;
}
