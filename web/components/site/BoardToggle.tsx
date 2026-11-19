"use client";

import { useEffect, useState } from "react";
import { loadGsap, reducedMotion, whenNear } from "@/lib/motion";
import s from "./MenuBoard.module.css";

/**
 * The only interactive part of the board: Hot/Iced flips the price tiles, and the
 * letters get hung one by one the first time the board scrolls into view.
 * The board itself is server-rendered (hundreds of letters, no hydration cost).
 */
export function BoardToggle({ boardId }: { boardId: string }) {
  const [mode, setMode] = useState<"hot" | "iced">("hot");

  useEffect(() => {
    const el = document.getElementById(boardId);
    if (el) el.dataset.mode = mode;
  }, [mode, boardId]);

  useEffect(() => {
    const el = document.getElementById(boardId);
    if (!el || reducedMotion()) return;
    el.dataset.armed = "true";
    const failsafe = window.setTimeout(() => (el.dataset.armed = "false"), 8000);
    let ctx: { revert: () => void } | undefined;
    const stop = whenNear(el, () => {
      loadGsap()
        .then(({ gsap }) => {
          ctx = gsap.context(() => {
            const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));
            gsap.set(el.querySelectorAll("[data-ch]"), { opacity: 0, y: -18, scale: 1.3, rotation: () => (Math.random() - 0.5) * 30 });
            el.dataset.armed = "false";
            window.clearTimeout(failsafe);
            const tl = gsap.timeline({ paused: true, defaults: { ease: "back.out(2.6)", duration: 0.32 } });
            rows.forEach((row, i) => {
              const chars = row.querySelectorAll("[data-ch]");
              if (chars.length) tl.to(chars, { opacity: 1, y: 0, scale: 1, rotation: 0, stagger: 0.022 }, i * 0.11);
            });
            gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%", once: true, onEnter: () => tl.play() } });
          }, el);
        })
        .catch(() => (el.dataset.armed = "false"));
    });
    return () => {
      stop();
      window.clearTimeout(failsafe);
      ctx?.revert();
    };
  }, [boardId]);

  return (
    <div className={s.toggle} role="group" aria-label="Show prices for">
      <button type="button" aria-pressed={mode === "hot"} onClick={() => setMode("hot")}>
        Hot
      </button>
      <button type="button" aria-pressed={mode === "iced"} onClick={() => setMode("iced")}>
        Iced
      </button>
      <span className={s.knob} data-mode={mode} aria-hidden="true" />
    </div>
  );
}
