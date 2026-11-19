import { AntlerPair } from "@/components/brand/Logo";
import { WORDMARK_D } from "@/components/brand/wordmark-path";
import s from "./Trailer.module.css";

/**
 * The cream teardrop trailer, front-on. The hatch is a top-hinged panel: we draw it as a
 * quad whose free edge travels with cos(angle), widening a touch as it swings toward us.
 * Past 90° we see its wooden underside. Server-rendered closed; HeroMotion (client)
 * drives the angle through setTrailerAngle().
 */

import { hatchPath, edgePath } from "./trailerGeometry";

export { hatchPath, edgePath };

export function Trailer({ className }: { className?: string }) {
  return (
    <svg
      id="trailer"
      className={`${s.trailer} ${className ?? ""}`}
      viewBox="0 0 480 300"
      aria-hidden="true"
      focusable="false"
      style={{ ["--open" as string]: 0 }}
    >
      <defs>
        <linearGradient id="tr-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf6ea" />
          <stop offset="0.55" stopColor="#f3ecdd" />
          <stop offset="1" stopColor="#ddd0b4" />
        </linearGradient>
        <linearGradient id="tr-hatch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f1e4" />
          <stop offset="1" stopColor="#ebe1cc" />
        </linearGradient>
        <linearGradient id="tr-under" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6e4527" />
          <stop offset="0.35" stopColor="#a8743f" />
          <stop offset="1" stopColor="#c99459" />
        </linearGradient>
        <linearGradient id="tr-inside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2c21" />
          <stop offset="1" stopColor="#1f1712" />
        </linearGradient>
        <radialGradient id="tr-glow" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#ffd98f" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#f6c26b" stopOpacity="0.25" />
          <stop offset="1" stopColor="#f6c26b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tr-spill" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98f" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffd98f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tr-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c58f57" />
          <stop offset="1" stopColor="#8f5d33" />
        </linearGradient>
        <linearGradient id="tr-pink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecc3cc" />
          <stop offset="1" stopColor="#d49fac" />
        </linearGradient>
        <linearGradient id="tr-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f2f0" />
          <stop offset="0.5" stopColor="#a9adb0" />
          <stop offset="1" stopColor="#e3e4e2" />
        </linearGradient>
        <clipPath id="tr-window">
          <rect x="130" y="76" width="192" height="90" rx="3" />
        </clipPath>
        <pattern id="tr-turf" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#3f7148" />
          <path d="M1 6 L1.6 3 M3.5 6 L4 2.6 M5.4 6 L5 3.8" stroke="#5a8c5a" strokeWidth="0.8" />
        </pattern>
        <pattern id="tr-holes" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="var(--pink)" />
          <circle cx="1.5" cy="1.5" r="0.45" fill="#b98896" />
        </pattern>
      </defs>

      {/* ground */}
      <rect x="-2400" y="258" width="5280" height="60" fill="url(#tr-turf)" />
      <ellipse cx="240" cy="262" rx="215" ry="9" fill="#0b221d" opacity="0.45" />
      <ellipse className={s.spill} cx="226" cy="262" rx="120" ry="14" fill="url(#tr-spill)" />

      {/* hitch + jockey wheel */}
      <path d="M44 222 L6 240 L44 236" fill="none" stroke="#2c2f2d" strokeWidth="4" strokeLinejoin="round" />
      <rect x="11" y="232" width="5" height="18" rx="2" fill="#3a3d3b" />
      <circle cx="13.5" cy="253" r="5" fill="#1d1f1e" />

      {/* jack stands */}
      <path d="M84 230 V258 M78 258 H90 M404 230 V258 M398 258 H410" stroke="#8d9290" strokeWidth="3.2" strokeLinecap="round" />

      {/* body */}
      <path
        d="M128 40 H372 C414 40 440 70 440 116 V212 C440 225 431 233 418 233 H62 C49 233 40 225 40 212 V128 C40 74 76 40 128 40 Z"
        fill="url(#tr-body)"
      />
      {/* roof highlight + trim */}
      <path d="M78 58 C92 47 108 44 128 44 H372 C392 44 410 51 422 64" fill="none" stroke="#fffdf7" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M40 196 H440" stroke="#d8cbaf" strokeWidth="1.4" />
      <path d="M40 202 H440" stroke="#fffaf0" strokeWidth="1" opacity="0.7" />

      {/* reflectors */}
      <rect x="45" y="205" width="6" height="11" rx="2" fill="var(--orange)" />
      <rect x="429" y="205" width="6" height="11" rx="2" fill="var(--orange)" />

      {/* wheel arch + wheel */}
      <path d="M302 233 C302 210 318 198 338 198 C358 198 374 210 374 233 Z" fill="#cdbf9f" />
      <circle cx="338" cy="236" r="25" fill="#1c1d1c" />
      <circle cx="338" cy="236" r="15" fill="url(#tr-chrome)" />
      <circle cx="338" cy="236" r="5" fill="#8d9290" />
      <path d="M326 228 A14 14 0 0 1 344 223" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

      {/* left: wordmark straight on the cream body */}
      <g transform="translate(51 104) scale(0.122)" fill="var(--forest)" color="var(--forest)">
        <g transform="translate(0 264)">
          <AntlerPair x={273} y={-258} />
          <path d={WORDMARK_D} />
        </g>
      </g>

      {/* right: little wooden plank menu + wordmark */}
      <g transform="translate(350 86) scale(0.12)" fill="var(--forest)">
        <path d={WORDMARK_D} transform="translate(0 150)" />
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x="352" y={110 + i * 11} width="64" height="8" rx="1.2" fill="url(#tr-wood)" />
          <path d={`M357 ${114 + i * 11} H${380 + ((i * 7) % 18)} M${396} ${114 + i * 11} H410`} stroke="#f3ecdd" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
        </g>
      ))}

      {/* window frame */}
      <rect x="125" y="71" width="202" height="100" rx="5" fill="#9b6a3d" />
      <g clipPath="url(#tr-window)">
        <rect x="130" y="76" width="192" height="90" fill="url(#tr-inside)" />
        <rect className={s.glow} x="110" y="70" width="232" height="110" fill="url(#tr-glow)" />
        {/* shelf with cups + bags */}
        <rect x="130" y="103" width="192" height="4" fill="#8a5a33" />
        {[140, 152, 164].map((x, i) => (
          <g key={x}>
            <path d={`M${x} ${103 - 22 + i * 4} h10 l-1 ${22 - i * 4} h-8 Z`} fill="#f7f3ea" />
            {[0, 1, 2, 3].map((k) => (
              <path key={k} d={`M${x} ${103 - 22 + i * 4 + 3 + k * 4} h10`} stroke="#d9d2c4" strokeWidth="0.7" />
            ))}
          </g>
        ))}
        {[284, 300].map((x) => (
          <g key={x}>
            <path d={`M${x} 83 h12 l1 20 h-14 Z`} fill="#fbf8f1" />
            <circle cx={x + 6} cy="93" r="3.6" fill="var(--pink)" />
          </g>
        ))}
        {/* the pink espresso machine */}
        <rect x="150" y="118" width="88" height="5" rx="2" fill="url(#tr-chrome)" />
        <rect x="148" y="122" width="92" height="40" rx="6" fill="url(#tr-pink)" />
        <rect x="148" y="150" width="92" height="12" rx="3" fill="#c990a0" />
        <rect x="156" y="128" width="76" height="2" rx="1" fill="#f6dde3" opacity="0.9" />
        {[176, 212].map((x) => (
          <g key={x}>
            <path d={`M${x - 7} 134 h14 l-2 9 h-10 Z`} fill="url(#tr-chrome)" />
            <rect x={x - 6} y="143" width="12" height="4" rx="1.5" fill="#3a3a38" />
            <path d={`M${x + 4} 145 l14 6`} stroke="#1c1c1b" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
        <path d="M232 132 q6 10 2 22" fill="none" stroke="#b9bcbd" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="152" y="158" width="84" height="5" rx="1.5" fill="url(#tr-chrome)" />
        {/* grinder */}
        <path d="M254 108 h18 l-4 18 h-10 Z" fill="#4c3527" opacity="0.9" />
        <rect x="252" y="126" width="22" height="37" rx="3" fill="#1e1e1d" />
        <rect x="256" y="148" width="14" height="4" rx="1" fill="#444" />
      </g>

      {/* counter ledge */}
      <rect x="114" y="164" width="224" height="9" rx="2" fill="url(#tr-wood)" />
      <rect x="114" y="172" width="224" height="3" fill="#6e4527" opacity="0.6" />

      {/* the cup that lands on the counter once the hatch is up */}
      <g className={s.cup} data-cup="">
        <path d="M292 141 h20 l-2.5 23 h-15 Z" fill="#fbf8f1" />
        <rect x="290.5" y="138" width="23" height="4.5" rx="2" fill="#fdfcf8" />
        <rect x="292.5" y="135.5" width="19" height="3.5" rx="1.6" fill="#f1ede4" />
        <circle cx="302" cy="153" r="5.6" fill="var(--pink)" />
        <path d="M299.6 151.2 l1.4 1.6 M304.4 151.2 l-1.4 1.6" stroke="var(--forest)" strokeWidth="0.8" strokeLinecap="round" />
        <path className={s.steam} d="M298 132 c-3 -4 3 -6 0 -11 M305 131 c-3 -4 3 -6 0 -10" fill="none" stroke="#fbf8f1" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* gas struts (only once open) */}
      <g className={s.struts} stroke="#5d6260" strokeWidth="1.6" strokeLinecap="round">
        <path d="M128 118 L118 40" />
        <path d="M324 118 L334 40" />
      </g>

      {/* hatch */}
      <path id="trailer-hatch" d={hatchPath(0)} fill="url(#tr-hatch)" stroke="#d6c8aa" strokeWidth="1" />
      <path id="trailer-edge" d={edgePath(0)} fill="#efe6d2" opacity="0" />
      <g id="trailer-seam">
        <rect x="131" y="78" width="190" height="86" rx="3" fill="none" stroke="#dfd3b9" strokeWidth="1" />
        <rect x="214" y="160" width="24" height="4" rx="2" fill="#9a8f78" />
      </g>

      {/* closed sign: a tiny pegboard hung on the hatch */}
      {(
        <g id="trailer-sign" className={s.sign} visibility="hidden">
          <path d="M214 98 L226 88 L238 98" fill="none" stroke="#8a7f6a" strokeWidth="1" />
          <circle cx="226" cy="88" r="1.6" fill="#8a7f6a" />
          <rect x="186" y="97" width="80" height="36" rx="2.5" fill="url(#tr-holes)" stroke="#c99aa6" strokeWidth="1.2" />
          <text x="226" y="111" textAnchor="middle" className={s.signText} fontSize="10.5">
            CLOSED
          </text>
          <text id="trailer-sign-text" x="226" y="126" textAnchor="middle" className={s.signText} fontSize="9">
            BACK SOON
          </text>
        </g>
      )}
    </svg>
  );
}
