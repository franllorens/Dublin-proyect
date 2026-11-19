"use client";

import { useEffect, useMemo, useRef } from "react";
import { headline, LOCATIONS, statusOf, fmt, DAY_SHORT, type Status } from "@/lib/hours";
import { loadGsap, reducedMotion } from "@/lib/motion";
import { useNow } from "./Clock";
import { hatchPath, edgePath } from "./trailerGeometry";
import s from "./Hero.module.css";

const OPEN_DEG = 112;

function setTrailerAngle(deg: number) {
  const under = deg > 90;
  const k = Math.cos((deg * Math.PI) / 180);
  const hatch = document.getElementById("trailer-hatch");
  const edge = document.getElementById("trailer-edge");
  const seam = document.getElementById("trailer-seam");
  hatch?.setAttribute("d", hatchPath(deg));
  hatch?.setAttribute("fill", under ? "url(#tr-under)" : "url(#tr-hatch)");
  edge?.setAttribute("d", edgePath(deg));
  edge?.setAttribute("opacity", under ? "1" : "0");
  seam?.setAttribute("transform", `translate(0 70) scale(1 ${Math.max(k, 0.001)}) translate(0 -70)`);
  seam?.setAttribute("opacity", k > 0.05 ? "1" : "0");
  document.getElementById("trailer")?.style.setProperty("--open", String(Math.min(1, Math.max(0, deg / 110))));
}

function useHeroState() {
  const now = useNow();
  return useMemo(() => {
    if (!now) return null;
    const h = headline(now);
    let sign: string | null = null;
    if (!h.open) {
      const next = LOCATIONS.map((l) => statusOf(l, now) as Extract<Status, { open: false }>).sort(
        (a, b) => a.dayOffset * 1440 + a.opensAt - (b.dayOffset * 1440 + b.opensAt),
      )[0];
      const day = next.dayOffset === 0 ? "" : next.dayOffset === 1 ? "TMRW " : `${DAY_SHORT[next.opensDay].toUpperCase()} `;
      sign = `BACK ${day}${fmt(next.opensAt)}`;
    }
    return { ...h, sign };
  }, [now]);
}

/** Opens the hatch when at least one hatch is open in Dublin right now; hangs the sign when not. */
export function HeroMotion() {
  const state = useHeroState();
  const played = useRef(false);

  useEffect(() => {
    if (!state) return;
    const scene = document.getElementById("hero-scene");
    const sign = document.getElementById("trailer-sign");
    const signText = document.getElementById("trailer-sign-text");
    if (!state.open) {
      setTrailerAngle(0);
      scene?.classList.remove("cup-in");
      if (signText && state.sign) signText.textContent = state.sign;
      sign?.setAttribute("visibility", "visible");
      sign?.setAttribute("data-show", "true");
      return;
    }
    sign?.setAttribute("visibility", "hidden");
    if (played.current) return;
    played.current = true;
    if (reducedMotion()) {
      setTrailerAngle(OPEN_DEG);
      scene?.classList.add("cup-in");
      return;
    }
    let killed = false;
    loadGsap().then(({ gsap }) => {
      if (killed) return;
      const p = { a: 0 };
      gsap
        .timeline({ delay: 0.2 })
        .to(p, { a: 18, duration: 0.35, ease: "power1.in", onUpdate: () => setTrailerAngle(p.a) })
        .to(p, { a: OPEN_DEG, duration: 1.15, ease: "back.out(1.25)", onUpdate: () => setTrailerAngle(p.a) })
        .add(() => scene?.classList.add("cup-in"), "-=0.45");
    });
    return () => {
      killed = true;
    };
  }, [state]);

  // Gentle depth on scroll: the building drifts, the trailer stays planted.
  useEffect(() => {
    const root = document.getElementById("top");
    if (reducedMotion() || !root) return;
    let ctx: { revert: () => void } | undefined;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        const st = { trigger: root, start: "top top", end: "bottom top", scrub: true };
        gsap.to(`.${s.cladding}`, { yPercent: 18, ease: "none", scrollTrigger: st });
        gsap.to(`.${s.copy}`, { y: -40, ease: "none", scrollTrigger: st });
      }, root);
    });
    return () => ctx?.revert();
  }, []);

  return null;
}

export function StatusLine() {
  const state = useHeroState();
  return (
    <>
      <span className={s.dot} data-open={state ? String(state.open) : "unknown"} aria-hidden="true" />
      <p className={s.statusText}>
        {state ? (
          <>
            <strong>{state.text}</strong>
            <span className={s.sep} aria-hidden="true">
              ·
            </span>
            <span>{state.detail}</span>
          </>
        ) : (
          <span className={s.checking}>Checking the hatches…</span>
        )}
      </p>
    </>
  );
}
