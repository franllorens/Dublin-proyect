import { Lockup } from "@/components/brand/Logo";
import { Trailer } from "./Trailer";
import { HeroMotion, StatusLine } from "./HeroMotion";
import s from "./Hero.module.css";

export function Hero() {
  return (
    <header className={s.hero} id="top">
      <nav className={`wrap ${s.topbar}`} aria-label="Sections">
        <p>Sandyford Business Park · Kilternan</p>
        <div className={s.topnav}>
          <a href="#find-us">Find us</a>
          <a href="#menu">Menu</a>
          <a href="#blend">The blend</a>
          <a href="#club">Fallow Club</a>
        </div>
      </nav>
      <div className={`wrap ${s.grid}`}>
        <div className={s.copy}>
          <h1 className={s.title}>
            <Lockup className={s.lockup} title="Fallow Speciality Coffee" />
          </h1>
          <p className={s.lede}>
            Speciality coffee to go, from two vintage trailers in Sandyford Business Park and a drive-thru in Kilternan.
          </p>
          <div className={s.ctas}>
            <a className="btn btn--pink" href="#menu">
              See the board
            </a>
            <a className={`btn btn--ghost ${s.ghost}`} href="#club">
              Join Fallow Club
            </a>
          </div>
        </div>
        <div id="hero-scene" className={s.scene}>
          <div className={s.cladding} aria-hidden="true" />
          <Trailer />
        </div>
      </div>
      <div className={s.status} role="status" aria-live="polite">
        <div className={`wrap ${s.statusInner}`}>
          <StatusLine />
          <a className={s.statusLink} href="#find-us">
            Hours &amp; maps
          </a>
        </div>
      </div>
      <HeroMotion />
    </header>
  );
}
