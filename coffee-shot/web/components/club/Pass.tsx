"use client";

import { forwardRef, useMemo } from "react";
import { Seal } from "@/components/brand/Seal";
import { qrPath } from "@/lib/qr";
import s from "./Pass.module.css";

export type PassData = { serial: string; name: string; stamps: number; reward: boolean; usual?: string; pouring?: number };
export const GOAL = 9;

/**
 * One stamp = one shot glass on the card. Empty: just the outline. Stamped: espresso and crema.
 * data-liquid / data-pour / data-steam are what Phone.stamp() animates.
 */
export function ShotDefs({ id = "shot-inner" }: { id?: string }) {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <path d="M-18.5 -20 L-14.6 30 L14.6 30 L18.5 -20 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function ShotGlass({
  filled,
  pouring = false,
  className,
  clipId = "shot-inner",
}: {
  filled: boolean;
  pouring?: boolean;
  className?: string;
  clipId?: string;
}) {
  const full = filled && !pouring;
  return (
    <svg className={className} viewBox="-30 -46 60 112" aria-hidden="true">
      <g data-steam="" opacity={full ? 1 : 0}>
        <path d="M-7 -26 q-4 -4 0 -8 t0 -8" />
        <path d="M0 -26 q-4 -4 0 -8 t0 -8" />
        <path d="M7 -26 q-4 -4 0 -8 t0 -8" />
      </g>
      <g clipPath={`url(#${clipId})`}>
        <g data-liquid="" opacity={full ? undefined : 0}>
          <rect x="-22" y="-6" width="44" height="37" fill="#5a3818" />
          <rect x="-22" y="-6" width="44" height="7" fill="#c99a5b" />
        </g>
        <rect data-pour="" x="-1.6" y="-30" width="3.2" height="60" rx="1.6" fill="#6b4520" opacity="0" />
      </g>
      <path d="M-21 -22 L-16 58 L16 58 L21 -22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M-22 -22 H22" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M-17.6 30 L17.6 30 L16 58 L-16 58 Z" fill="currentColor" opacity={filled ? 1 : 0.35} />
    </svg>
  );
}

/** Apple Wallet store card, laid out like the real pass the backend generates. Black, like the cup. */
export const Pass = forwardRef<HTMLDivElement, { data: PassData; className?: string }>(function Pass({ data, className }, ref) {
  const qr = useMemo(() => qrPath(data.serial), [data.serial]);
  const left = GOAL - data.stamps;
  return (
    <div ref={ref} className={`${s.pass} ${className ?? ""}`} data-reward={data.reward}>
      <ShotDefs />
      <div className={s.top}>
        <div className={s.brand}>
          <Seal id="pass-seal" variant="line" className={s.seal} />
          <span className={s.name}>
            The Coffee Shot
            <span>Club</span>
          </span>
        </div>
        <div className={s.header}>
          <span className={s.label}>SHOTS</span>
          <span className={s.value}>{data.reward ? "FREE" : `${data.stamps}/${GOAL}`}</span>
        </div>
      </div>
      <div className={s.strip}>
        {Array.from({ length: GOAL }).map((_, i) => (
          <span key={i} className={s.slot} data-slot={i} data-on={i < data.stamps}>
            <ShotGlass filled={i < data.stamps} pouring={data.pouring === i} className={s.glass} />
          </span>
        ))}
      </div>
      <div className={s.primary}>
        <span className={s.label}>NEXT REWARD</span>
        <span className={s.big}>{data.reward ? "Free coffee ready" : `${left} to a free coffee`}</span>
      </div>
      <div className={s.row}>
        <div>
          <span className={s.label}>MEMBER</span>
          <span className={s.small}>{data.name}</span>
        </div>
        <div>
          <span className={s.label}>YOUR USUAL</span>
          <span className={s.small}>{data.usual || "Tell us at the counter"}</span>
        </div>
      </div>
      <div className={s.qrBox}>
        <svg viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`} className={s.qr} aria-hidden="true">
          <rect x="-2" y="-2" width={qr.size + 4} height={qr.size + 4} fill="#fff" />
          <path d={qr.d} fill="#111" shapeRendering="crispEdges" />
        </svg>
        <span>{data.serial}</span>
      </div>
    </div>
  );
});
