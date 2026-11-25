import Image from "next/image";
import { AntlerPair } from "@/components/brand/Logo";
import { BlendMotion } from "./BlendMotion";
import photo from "@/assets/fallow-cup-terracotta-table.webp";
import s from "./Blend.module.css";

/** Two halves of one bean-shaped circle that close together as you scroll: 50/50. */
function Halves() {
  return (
    <svg className={s.halves} viewBox="-30 -30 460 460" role="img" aria-labelledby="halves-t">
      <title id="halves-t">Fallow Blend: 50% Colombia, 50% Guatemala</title>
      <defs>
        <path id="arc-l" d="M180 396 A198 198 0 0 1 180 4" />
        <path id="arc-r" d="M220 4 A198 198 0 0 1 220 396" />
      </defs>
      <g className={s.left} data-half="left">
        <path d="M196 20 A180 180 0 0 0 196 380 Z" fill="var(--pink)" />
        <text className={s.arc}>
          <textPath href="#arc-l" startOffset="50%" textAnchor="middle">
            COLOMBIA
          </textPath>
        </text>
        <text x="116" y="238" textAnchor="middle" className={s.num}>
          50<tspan className={s.pct}>%</tspan>
        </text>
      </g>
      <g className={s.right} data-half="right">
        <path d="M204 20 A180 180 0 0 1 204 380 Z" fill="var(--cream)" />
        <text className={s.arc}>
          <textPath href="#arc-r" startOffset="50%" textAnchor="middle">
            GUATEMALA
          </textPath>
        </text>
        <text x="284" y="238" textAnchor="middle" className={s.num}>
          50<tspan className={s.pct}>%</tspan>
        </text>
      </g>
      <g color="var(--forest)" className={s.mark} transform="translate(200 120) scale(0.34)">
        <AntlerPair x={0} y={0} />
      </g>
    </svg>
  );
}

export function Blend() {
  return (
    <section className={s.section} id="blend" aria-labelledby="blend-title">
      <div className={`wrap ${s.grid}`}>
        <div className={s.copy}>
          <h2 id="blend-title">Our blend. Nobody else pours it.</h2>
          <p className={s.lede}>
            Fallow Blend is half Colombia, half Guatemala, roasted to our own spec by Full Circle Roasters here in Dublin.
            They roast it for us and only us, so you won&rsquo;t find it anywhere else.
          </p>
          <ul className={s.todo}>
            <li>
              <span className="placeholder">Tasting notes · to confirm with the team</span>
            </li>
            <li>
              <span className="placeholder">Bags at the hatch · price to confirm</span>
            </li>
          </ul>
        </div>

        <div className={s.visual}>
          <Halves />
          <p className={s.slogan} aria-hidden="true">
            Follow the Fallow
          </p>
        </div>

        <div className={s.route}>
          <span className={s.line} data-route-line="" aria-hidden="true" />
          <ol>
          <li>
            <strong>Grown</strong>
            <span>Colombia &amp; Guatemala, half and half</span>
          </li>
          <li>
            <strong>Roasted</strong>
            <span>Full Circle Roasters, Dublin, to Fallow&rsquo;s spec</span>
          </li>
          <li>
            <strong>Poured</strong>
            <span>At the hatch in Sandyford and Kilternan</span>
          </li>
          </ol>
        </div>

        <figure className={s.photo}>
          <Image
            src={photo}
            alt="A Fallow cup with the pink seal on a terracotta table, the back of the cream trailer behind it."
            sizes="(min-width: 900px) 30vw, 60vw"
            placeholder="blur"
          />
          <figcaption className="placeholder">Placeholder photo · replace</figcaption>
        </figure>
      </div>
      <BlendMotion visual={s.visual} mark={s.mark} route={s.route} />
    </section>
  );
}
