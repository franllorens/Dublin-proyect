"use client";

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Gsap = typeof import("gsap").gsap;
type ST = typeof import("gsap/ScrollTrigger").ScrollTrigger;

let gsapPromise: Promise<{ gsap: Gsap; ScrollTrigger: ST }> | null = null;

/** GSAP + ScrollTrigger, loaded once and only when a section needs them (keeps them off the LCP path). */
export function loadGsap() {
  if (!gsapPromise) {
    gsapPromise = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
      g.gsap.registerPlugin(s.ScrollTrigger);
      return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
    });
  }
  return gsapPromise;
}

/** Runs `cb` the first time `el` gets near the viewport. */
export function whenNear(el: Element, cb: () => void, rootMargin = "300px 0px") {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

export { jitter } from "./jitter";
