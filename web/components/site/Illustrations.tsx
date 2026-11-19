import { AntlerPair } from "@/components/brand/Logo";

/** Side-on teardrop trailer, used as the Sandyford location mark. */
export function MiniTrailer({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 72" aria-hidden="true" focusable="false">
      <path d="M10 56 L1 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path
        d="M34 8 H92 C106 8 116 20 116 34 V52 C116 56 113 59 109 59 H16 C12 59 9 56 9 52 V36 C9 20 20 8 34 8 Z"
        fill="var(--paper)"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <rect x="36" y="20" width="44" height="22" rx="2" fill="currentColor" opacity="0.9" />
      <path d="M33 19 L83 19 L86 9 L30 9 Z" fill="var(--wood)" />
      <rect x="40" y="31" width="14" height="9" rx="2" fill="var(--pink)" />
      <rect x="33" y="42" width="50" height="3" rx="1" fill="var(--wood)" />
      <circle cx="90" cy="60" r="9" fill="currentColor" />
      <circle cx="90" cy="60" r="4" fill="var(--cream-deep)" />
    </svg>
  );
}

/** Kilternan: green container, pink-tiled front, rooftop "COFFEE DRIVE THRU" cube. */
export function Container({ className }: { className?: string }) {
  const tiles = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) tiles.push(<rect key={`${r}-${c}`} x={124 + c * 11} y={78 + r * 11} width="10" height="10" rx="1" fill="var(--pink)" />);
  return (
    <svg className={className} viewBox="0 0 360 230" aria-hidden="true" focusable="false">
      <ellipse cx="180" cy="214" rx="170" ry="8" fill="#000" opacity="0.12" />
      {/* rooftop cube */}
      <g>
        <rect x="150" y="12" width="64" height="40" rx="2" fill="var(--forest)" />
        <rect x="150" y="12" width="64" height="9" fill="var(--pink)" />
        <text x="182" y="34" textAnchor="middle" fontSize="9.5" fontWeight="700" letterSpacing="1.2" fill="var(--cream)" style={{ fontFamily: "var(--font-body)" }}>
          COFFEE
        </text>
        <text x="182" y="46" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="1" fill="var(--pink)" style={{ fontFamily: "var(--font-body)" }}>
          DRIVE THRU
        </text>
        <rect x="178" y="52" width="8" height="12" fill="#2a2d2b" />
      </g>
      {/* container body */}
      <rect x="20" y="64" width="320" height="146" rx="3" fill="var(--forest)" />
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={24 + i * 10.6} y="66" width="4" height="142" fill="#fff" opacity="0.05" />
      ))}
      <rect x="20" y="64" width="320" height="6" fill="#0f2c25" />
      {/* pink tile facade with the antlers, Kilternan mural style */}
      <rect x="118" y="72" width="108" height="138" fill="#e9c6ce" />
      <g>{tiles}</g>
      <rect x="118" y="155" width="108" height="55" fill="#e9c6ce" />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 9 }).map((__, c) => (
          <rect key={`b${r}-${c}`} x={124 + c * 11} y={157 + r * 11} width="10" height="10" rx="1" fill="var(--pink)" />
        )),
      )}
      <g color="var(--forest)">
        <g transform="translate(172 84) scale(0.3)">
          <AntlerPair x={0} y={0} />
        </g>
      </g>
      {/* walk-up window */}
      <rect x="138" y="130" width="68" height="34" rx="2" fill="#2a1f18" />
      <rect x="138" y="130" width="68" height="34" rx="2" fill="url(#ct-glow)" />
      <rect x="134" y="163" width="76" height="5" rx="1.5" fill="var(--wood)" />
      <text x="172" y="125" textAnchor="middle" fontSize="7.5" fontWeight="700" letterSpacing="1.4" fill="var(--forest)" style={{ fontFamily: "var(--font-body)" }}>
        ORDER
      </text>
      {/* drive-thru windows on the green */}
      <rect x="40" y="104" width="56" height="44" rx="3" fill="#2a1f18" />
      <rect x="40" y="104" width="56" height="44" rx="3" fill="url(#ct-glow)" />
      <text x="68" y="98" textAnchor="middle" fontSize="7.5" fontWeight="700" letterSpacing="1.2" fill="var(--pink)" style={{ fontFamily: "var(--font-body)" }}>
        COLLECT
      </text>
      <rect x="250" y="104" width="70" height="44" rx="3" fill="#2a1f18" />
      <rect x="250" y="104" width="70" height="44" rx="3" fill="url(#ct-glow)" />
      {/* string lights */}
      <path d="M20 70 Q70 92 118 72 M226 72 Q283 92 340 70" fill="none" stroke="#2a2d2b" strokeWidth="1" />
      {[34, 52, 70, 88, 104, 240, 258, 276, 294, 312, 328].map((x, i) => (
        <circle key={x} cx={x} cy={x < 118 ? 70 + Math.sin(((x - 20) / 98) * Math.PI) * 11 : 70 + Math.sin(((x - 226) / 114) * Math.PI) * 11} r="2.6" fill="var(--bulb)" className="bulb" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
      <defs>
        <linearGradient id="ct-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd98f" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  );
}
