import { SignPanel } from "@/components/brand/Seal";
import { BlackCup, CopperLamp } from "./Illustrations";
import { OpenNow } from "./OpenNow";
import s from "./Hero.module.css";

/**
 * The counter: white subway tile, a copper pendant that swings and switches on,
 * and their black cup, where the gold seal pours its own shot.
 * The H1 is the LCP and renders as plain text; every animation is CSS.
 */
export function Hero() {
  return (
    <header className={s.hero} id="top">
      <div className={s.wall}>
        <div className={`wrap ${s.grid}`}>
          <SignPanel className={s.sign} />

          <div className={s.scene} aria-hidden="true">
            <CopperLamp id="lampA" className={`${s.lamp} ${s.lampA}`} cord={34} />
            <CopperLamp id="lampB" className={`${s.lamp} ${s.lampB}`} cord={150} delay={0.35} />
            <BlackCup id="hero-cup" intro className={s.cup} />
            <span className={s.counter} />
          </div>

          <div className={s.copy}>
            <h1 className={s.title}>
              Speciality coffees &amp; teas, <em>freshly made to order.</em>
            </h1>
            <p className={s.lede}>
              A little café on the Plaza at Beacon South Quarter, Sandyford. Sit in under the copper lamps, take a table on the
              terrace, or grab one on your way in.
            </p>
            <div className={s.ctas}>
              <a className="btn" href="#menu">
                See the boards
              </a>
              <a className="btn btn--ghost" href="#club">
                Join the Club
              </a>
            </div>
          </div>
        </div>
      </div>
      <OpenNow />
    </header>
  );
}
