"use client";

import { LOCATION, weekRows } from "@/lib/hours";
import { headline } from "@/lib/hours";
import { useNow } from "./Clock";
import s from "./FindUs.module.css";

/** The opening hours as gold vinyl on the black door, with today picked out. */
export function HoursPlaque({ className }: { className?: string }) {
  const now = useNow();
  const h = now ? headline(now) : null;
  const rows = weekRows();
  return (
    <div className={`${s.plaqueBox} ${className ?? ""}`}>
      <p className={s.plaqueTitle}>Opening hours</p>
      <dl className={s.rows}>
        {rows.map((r) => {
          const today = now != null && r.days.includes(now.day);
          return (
            <div key={r.label} className={s.row} data-today={today || undefined}>
              <dt>
                {r.label}
                {today && <span className={s.today}>Today</span>}
              </dt>
              <dd>
                {r.text}
                {r.label === "Sunday" && (
                  <span className={`placeholder ${s.confirm}`} title={LOCATION.hours_to_confirm}>
                    close to confirm
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className={s.live} data-tone={h?.tone ?? "idle"} aria-live="polite">
        <span className={s.liveDot} aria-hidden="true" />
        {h ? (
          <span>
            <b>{h.text}</b> · {h.detail}
          </span>
        ) : (
          <span>Dublin time</span>
        )}
      </p>
    </div>
  );
}
