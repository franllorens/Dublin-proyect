import { WORDMARK_D, WORDMARK_VIEWBOX } from "./wordmark-path";

/**
 * Fallow lockup, redrawn for this demo: Fraunces glyph outlines for the wordmark and
 * hand-drawn antlers traced from photos of the cup seal. NOT the official artwork.
 */

// Left antler in a 70x100 box, base bottom-right. The right one is mirrored.
export const ANTLER_STROKES: [string, number][] = [
  ["M68 97 C48 90 22 83 12 71 C4 61 2 40 6 17", 8.5],
  ["M17 76 C19 52 22 24 29 4", 6.2],
  ["M29 81 C31 63 34 48 41 33", 5.6],
  ["M46 88 C47 80 48 72 51 65", 5.2],
  ["M68 97 C60 95 52 92 44 88", 10],
];

export function AntlerPair({ x, y, scale = 1, gap = 9, className }: { x: number; y: number; scale?: number; gap?: number; className?: string }) {
  const side = (mirror: boolean) => (
    <g
      transform={
        mirror
          ? `translate(${x + gap * scale + 70 * scale} ${y}) scale(${-scale} ${scale})`
          : `translate(${x - gap * scale - 70 * scale} ${y}) scale(${scale})`
      }
    >
      {ANTLER_STROKES.map(([d, w], i) => (
        <path key={i} d={d} strokeWidth={w} pathLength={1} data-antler="" />
      ))}
    </g>
  );
  return (
    <g className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {side(false)}
      {side(true)}
    </g>
  );
}

const [wx, wy, ww, wh] = WORDMARK_VIEWBOX;

export function Wordmark({ className, title = "fallow" }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox={`${wx} ${wy} ${ww} ${wh}`} role="img" aria-label={title} fill="currentColor">
      <path d={WORDMARK_D} />
    </svg>
  );
}

/** Antlers + wordmark (+ tracked tagline). viewBox units match the wordmark outlines. */
export function Lockup({
  className,
  tagline = true,
  title = "Fallow Speciality Coffee",
  decorative = false,
}: {
  className?: string;
  tagline?: boolean;
  title?: string;
  decorative?: boolean;
}) {
  const h = tagline ? 322 : 268;
  return (
    <svg
      className={className}
      viewBox={`0 -264 546 ${h}`}
      fill="currentColor"
      {...(decorative ? { "aria-hidden": true, focusable: false } : { role: "img", "aria-label": title })}
    >
      <AntlerPair x={273} y={-258} />
      <path d={WORDMARK_D} />
      {tagline && (
        <text
          x="273"
          y="48"
          textAnchor="middle"
          fontSize="27"
          letterSpacing="11.5"
          style={{ fontFamily: "var(--font-sans), Helvetica, Arial, sans-serif", fontWeight: 500 }}
        >
          SPECIALITY COFFEE
        </text>
      )}
    </svg>
  );
}

/** The pink circular cup seal. */
export function Seal({ className, decorative = true }: { className?: string; decorative?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      {...(decorative ? { "aria-hidden": true, focusable: false } : { role: "img", "aria-label": "Fallow cup seal" })}
    >
      <circle cx="200" cy="200" r="200" fill="var(--pink)" />
      <g transform="translate(62 222) scale(0.505)" fill="var(--forest)" color="var(--forest)">
        <AntlerPair x={273} y={-258} />
        <path d={WORDMARK_D} />
        <text
          x="273"
          y="62"
          textAnchor="middle"
          fontSize="30"
          letterSpacing="12"
          style={{ fontFamily: "var(--font-sans), Helvetica, Arial, sans-serif", fontWeight: 500 }}
        >
          SPECIALITY COFFEE
        </text>
      </g>
    </svg>
  );
}
