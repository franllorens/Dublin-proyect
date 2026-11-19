"use client";

import { forwardRef, useMemo } from "react";
import { AntlerPair } from "@/components/brand/Logo";
import { WORDMARK_D } from "@/components/brand/wordmark-path";
import { qrPath } from "@/lib/qr";
import { jitter } from "@/lib/motion";
import s from "./Pass.module.css";

export type PassData = { serial: string; name: string; stamps: number; reward: boolean };
export const GOAL = 9;

/** One pink seal stamp, inked a little unevenly. */
export function StampSeal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" fill="var(--pink)" filter="url(#ink)" />
      <circle cx="20" cy="20" r="15.2" fill="none" stroke="#c98d9c" strokeWidth="0.8" opacity="0.7" />
      <g color="var(--forest)" transform="translate(20 9.5) scale(0.12)">
        <AntlerPair x={0} y={0} />
      </g>
      <path d={WORDMARK_D} fill="var(--forest)" transform="translate(9.8 27.2) scale(0.038)" />
    </svg>
  );
}

/** Apple Wallet store card, laid out like the real pass the backend generates. */
export const Pass = forwardRef<HTMLDivElement, { data: PassData; className?: string }>(function Pass({ data, className }, ref) {
  const qr = useMemo(() => qrPath(data.serial), [data.serial]);
  const left = GOAL - data.stamps;
  return (
    <div ref={ref} className={`${s.pass} ${className ?? ""}`} data-reward={data.reward}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="ink">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
      </svg>
      <div className={s.top}>
        <svg className={s.logo} viewBox="0 -264 546 268" aria-hidden="true" fill="currentColor">
          <AntlerPair x={273} y={-258} />
          <path d={WORDMARK_D} />
        </svg>
        <div className={s.header}>
          <span className={s.label}>STAMPS</span>
          <span className={s.value}>{data.reward ? "FREE" : `${data.stamps}/${GOAL}`}</span>
        </div>
      </div>
      <div className={s.strip}>
        {Array.from({ length: GOAL }).map((_, i) => (
          <span key={i} className={s.slot} data-slot={i} data-on={i < data.stamps}>
            {i < data.stamps && (
              <span className={s.sealWrap} style={{ ["--rot" as string]: `${((jitter(i, 3) - 0.5) * 34).toFixed(1)}deg` }}>
                <StampSeal className={s.seal} />
              </span>
            )}
            <span className={s.burst} aria-hidden="true">
              {Array.from({ length: 7 }).map((__, k) => (
                <i key={k} style={{ ["--a" as string]: `${k * 51 + jitter(k, i) * 20}deg` }} />
              ))}
            </span>
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
          <span className={s.label}>VALID AT</span>
          <span className={s.small}>All Fallow locations</span>
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
