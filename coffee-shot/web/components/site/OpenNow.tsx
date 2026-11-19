"use client";

import { headline } from "@/lib/hours";
import { useNow } from "./Clock";
import s from "./Hero.module.css";

/** Live line under the hero, from Dublin time and data/location.json. */
export function OpenNow() {
  const now = useNow();
  const h = now ? headline(now) : null;
  return (
    <div className={s.status} data-tone={h?.tone ?? "idle"}>
      <div className={`wrap ${s.statusInner}`}>
        <span className={s.dot} aria-hidden="true" />
        <p aria-live="polite">
          {h ? (
            <>
              <strong>{h.text}</strong> <span className={s.detail}>· {h.detail}</span>
            </>
          ) : (
            <strong>Mon–Fri 7:00–18:00 · Sat 8:00–18:00 · Sun 9:00–17:00</strong>
          )}
        </p>
        <a href="#find-us" className={s.statusLink}>
          Hours &amp; directions
        </a>
      </div>
    </div>
  );
}
