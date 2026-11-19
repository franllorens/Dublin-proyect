import { Seal } from "@/components/brand/Seal";
import s from "./Illustrations.module.css";

/**
 * Their takeaway cup: matte black, white lid, the seal in gold line-art.
 * The seal is an HTML overlay so it can run its own intro.
 */
export function BlackCup({ id, intro = false, className }: { id: string; intro?: boolean; className?: string }) {
  return (
    <div className={`${s.cup} ${className ?? ""}`}>
      <svg viewBox="0 0 300 430" className={s.cupSvg} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-body`} x1="0" x2="1">
            <stop offset="0" stopColor="#070707" />
            <stop offset=".16" stopColor="#191919" />
            <stop offset=".33" stopColor="#2e2d2b" />
            <stop offset=".47" stopColor="#1b1b1a" />
            <stop offset=".78" stopColor="#111" />
            <stop offset="1" stopColor="#040404" />
          </linearGradient>
          <linearGradient id={`${id}-lid`} x1="0" x2="1">
            <stop offset="0" stopColor="#cfc8bb" />
            <stop offset=".3" stopColor="#fbf9f5" />
            <stop offset=".55" stopColor="#fff" />
            <stop offset=".85" stopColor="#e6e0d5" />
            <stop offset="1" stopColor="#bdb5a7" />
          </linearGradient>
          <radialGradient id={`${id}-shadow`}>
            <stop offset="0" stopColor="#3a2a1a" stopOpacity=".42" />
            <stop offset="1" stopColor="#3a2a1a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="150" cy="414" rx="132" ry="13" fill={`url(#${id}-shadow)`} />
        <path d="M28 72 L272 72 L247 406 Q150 416 53 406 Z" fill={`url(#${id}-body)`} />
        <path d="M53 406 Q150 416 247 406" fill="none" stroke="#3a3936" strokeWidth="2" />
        {/* lid */}
        <path d="M44 52 L55 27 Q59 19 69 19 L231 19 Q241 19 245 27 L256 52 Z" fill={`url(#${id}-lid)`} />
        <rect x="168" y="25" width="44" height="7" rx="3.5" fill="#b4ab9c" />
        <path
          d="M18 61 Q18 51 30 51 L270 51 Q282 51 282 61 L282 67 Q282 78 270 78 L30 78 Q18 78 18 67 Z"
          fill={`url(#${id}-lid)`}
        />
        <path d="M24 58 H276" stroke="#fff" strokeWidth="1.4" opacity=".9" />
        <path d="M30 78 Q150 84 270 78" fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="3" />
        {/* warm light from the lamp on the lid */}
        <ellipse className={s.lidGlow} cx="150" cy="30" rx="80" ry="14" fill="#ffcf8a" opacity=".38" />
      </svg>
      <div className={s.print} style={{ ["--seal-bg" as string]: "#1e1e1d" }}>
        <Seal id={`${id}-seal`} variant="line" intro={intro} />
      </div>
    </div>
  );
}

/** Copper pendant over the counter. `lit` turns the bulb on with a flicker (CSS). */
export function CopperLamp({ id, className, cord = 90, delay = 0 }: { id: string; className?: string; cord?: number; delay?: number }) {
  return (
    <div
      className={`${s.lamp} ${className ?? ""}`}
      style={{ ["--cord" as string]: `${cord}px`, ["--d" as string]: `${delay}s` }}
      aria-hidden="true"
    >
      <span className={s.cord} />
      <svg viewBox="0 0 160 116" className={s.shade}>
        <defs>
          <linearGradient id={`${id}-cu`} x1="0" x2="1">
            <stop offset="0" stopColor="#4f2a12" />
            <stop offset=".2" stopColor="#9a5a2a" />
            <stop offset=".38" stopColor="#e9a868" />
            <stop offset=".5" stopColor="#c27b3c" />
            <stop offset=".78" stopColor="#8a4d22" />
            <stop offset="1" stopColor="#3f210e" />
          </linearGradient>
          <radialGradient id={`${id}-in`} cx=".5" cy=".5" r=".6">
            <stop offset="0" stopColor="#fff7e4" />
            <stop offset=".45" stopColor="#ffd796" />
            <stop offset="1" stopColor="#d98a3e" />
          </radialGradient>
        </defs>
        <rect x="71" y="0" width="18" height="15" rx="3" fill="#3a2414" />
        <path d="M69 13 C44 17 9 54 3 106 L157 106 C151 54 116 17 91 13 Z" fill={`url(#${id}-cu)`} />
        <path d="M74 18 C60 26 40 52 34 92" fill="none" stroke="#ffd9a8" strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="80" cy="106" rx="77" ry="8.5" fill="#5a3418" />
        <ellipse className={s.inner} cx="80" cy="106" rx="73" ry="7" fill={`url(#${id}-in)`} />
      </svg>
      <span className={s.glow} />
    </div>
  );
}
