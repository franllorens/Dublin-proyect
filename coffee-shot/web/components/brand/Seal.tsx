import s from "./Seal.module.css";

/**
 * The Coffee Shot seal, redrawn as SVG from the official 400 px file (kit/). Not the
 * vector original: ask the café for it before anything is printed.
 *
 * "print": black bottle-cap ring, white field, gold lettering (the sign and the logo file).
 * "line":  gold line-art only, the way it's printed on the black takeaway cup and the card.
 */
export type SealVariant = "print" | "line";

const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 10) / 10;

/** The knurled edge: short radial ticks round the ring. */
function ticks(count: number, inner: number, outer: number) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    const c = Math.cos(a);
    const n = Math.sin(a);
    d += `M${r2(c * inner)} ${r2(n * inner)}L${r2(c * outer)} ${r2(n * outer)}`;
  }
  return d;
}
const TICKS_PRINT = ticks(120, 181, 192);
const TICKS_LINE = ticks(132, 181.5, 190.5);

// Shot glass: tapered tumbler with a heavy base. Liquid is clipped to the inside of the glass.
const GLASS_OUT = "M-35 -34 L-27 78 L27 78 L35 -34";
const GLASS_IN = "M-31.3 -31 L-26.5 36 L26.5 36 L31.3 -31 Z";
const GLASS_BASE = "M-30 36 L30 36 L27 78 L-27 78 Z";
const STEAM = [-12, 0, 12].map((x) => `M${x} -40 q-6 -6 0 -12 t0 -12`);

type Props = {
  /** Unique per page: it namespaces the arc path and clip ids. */
  id: string;
  variant?: SealVariant;
  className?: string;
  /** Plays the intro: ring screws in, the shot fills, steam draws. CSS only, off with reduced motion. */
  intro?: boolean;
  /** Accessible name; omit when decorative. */
  title?: string;
};

export function Seal({ id, variant = "print", className, intro = false, title }: Props) {
  const line = variant === "line";
  const gold = line ? "var(--seal-gold, var(--gold-light))" : "var(--gold)";
  const dark = line ? gold : "var(--black)";
  const arc = `${id}-arc`;
  const clip = `${id}-glass`;
  return (
    <svg
      viewBox="-200 -200 400 400"
      className={`${s.seal} ${intro ? s.intro : ""} ${className ?? ""}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <path id={arc} d="M-129 6 A129 129 0 0 1 129 6" />
        <clipPath id={clip}>
          <path d={GLASS_IN} />
        </clipPath>
      </defs>

      {/* ring */}
      <g className={s.ring}>
        {line ? (
          <>
            <circle r="193" fill="none" stroke={gold} strokeWidth="3" />
            <path d={TICKS_LINE} stroke={gold} strokeWidth="1.5" />
            <circle r="179" fill="none" stroke={gold} strokeWidth="1.6" />
            <circle r="171" fill="none" stroke={gold} strokeWidth="1.1" />
          </>
        ) : (
          <>
            <circle r="197" fill="var(--black)" />
            <path d={TICKS_PRINT} stroke="#fff" strokeWidth="1.7" />
            <circle r="178.5" fill="#fff" />
            <circle r="171" fill="none" stroke={gold} strokeWidth="2.4" />
          </>
        )}
      </g>

      {/* lettering */}
      <g className={s.text} fill={gold} style={{ fontFamily: "var(--font-caps)", fontWeight: 700 }}>
        <text fontSize="47" letterSpacing="1">
          <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle" textLength="372" lengthAdjust="spacing">
            THE COFFEE
          </textPath>
        </text>
        <text y="137" fontSize="52" textAnchor="middle" letterSpacing="3">
          SHOT
        </text>
      </g>

      {/* rules and the arc over the glass */}
      <g className={s.lines} stroke={dark} strokeWidth={line ? 2.2 : 2.8} fill="none" strokeLinecap="round">
        <path d="M-151 34H-50M50 34H151M-149 43H-49M49 43H149" />
        <path d="M-88 -12 A94.5 94.5 0 0 1 88 -12" />
      </g>

      {/* the shot */}
      <g className={s.glass}>
        <g clipPath={`url(#${clip})`}>
          <g className={s.liquid}>
            <rect x="-34" y="0" width="68" height="37" fill={line ? gold : "#7a5526"} opacity={line ? 0.38 : 1} />
            <rect x="-34" y="0" width="68" height="6.5" fill={line ? gold : "var(--crema)"} opacity={line ? 0.95 : 1} />
          </g>
          <rect className={s.pour} x="-2.2" y="-40" width="4.4" height="78" rx="2.2" fill={line ? gold : "#6b471f"} />
        </g>
        <g transform="translate(0 20) rotate(-14)">
          <g className={s.bean}>
            <ellipse rx="13.5" ry="9.5" fill={line ? gold : "#4b2e14"} />
            <path
              d="M-12 1.5 C-5 -4 4 6 12 -1.5"
              fill="none"
              stroke={line ? "var(--seal-bg, var(--black))" : "#c99a5b"}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        </g>
        <path d={GLASS_OUT} fill="none" stroke={gold} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M-35.5 -30H35.5" stroke={gold} strokeWidth="3.4" strokeLinecap="round" />
        <path d={GLASS_BASE} fill={gold} />
        <path d="M-21 44 L-19.5 72 M15 44 L14 72" stroke={line ? "var(--seal-bg, var(--black))" : "#fff"} strokeOpacity=".45" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M-26 -22 L-22.5 28" stroke={gold} strokeWidth="1.3" opacity=".55" strokeLinecap="round" />
      </g>

      {/* steam */}
      <g className={s.steam} stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round">
        {STEAM.map((d, i) => (
          <path key={i} d={d} pathLength={1} style={{ ["--i" as string]: i }} />
        ))}
      </g>
    </svg>
  );
}

/** The facade: cream panel, double gold rule, the name in serif capitals. */
export function SignPanel({ className, as: Tag = "p" }: { className?: string; as?: "p" | "h1" | "span" | "div" }) {
  return (
    <Tag className={`${s.sign} ${className ?? ""}`}>
      <span className={s.signText}>The Coffee Shot</span>
    </Tag>
  );
}
