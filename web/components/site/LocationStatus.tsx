"use client";

import { LOCATIONS, statusOf, fmt, whenLabel, rangeFor } from "@/lib/hours";
import { useNow } from "./Clock";
import s from "./Locations.module.css";

const byslug = (slug: string) => LOCATIONS.find((l) => l.slug === slug)!;

const DAYS = ["M", "T", "W", "T", "F", "S", "S"]; // Monday first
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Week({ slug }: { slug: string }) {
  const loc = byslug(slug);
  const now = useNow();
  const today = now ? (now.day + 6) % 7 : -1;
  const open = DAYS.map((_, i) => rangeFor(loc, (i + 1) % 7) !== null);
  return (
    <ol className={s.week} aria-hidden="true">
      {DAYS.map((d, i) => (
        <li key={i} data-open={open[i]} data-today={i === today} title={DAY_NAMES[i]}>
          {d}
        </li>
      ))}
    </ol>
  );
}

export function Pill({ slug }: { slug: string }) {
  const loc = byslug(slug);
  const now = useNow();
  if (!now) return <span className={s.pill} data-state="unknown">Checking…</span>;
  const st = statusOf(loc, now);
  return st.open ? (
    <span className={s.pill} data-state="open">
      <i aria-hidden="true" /> Open · till {fmt(st.closesAt)}
    </span>
  ) : (
    <span className={s.pill} data-state="closed">
      <i aria-hidden="true" /> Closed · opens {whenLabel(st)}
    </span>
  );
}

