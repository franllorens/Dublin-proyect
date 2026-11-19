"use client";

import { useEffect, useState } from "react";
import s from "./StickyNav.module.css";

/** Slim bar that drops in once the hero is gone, so the club is one tap away on a phone. */
export function StickyNav() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return (
    <nav className={s.bar} data-show={show} aria-label="Quick links" aria-hidden={!show}>
      <div className={`wrap ${s.inner}`}>
        <a href="#top" className={s.home} tabIndex={show ? 0 : -1}>
          <span className={s.mark}>The Coffee Shot</span>
          <span className="sr-only">, back to top</span>
        </a>
        <div className={s.links}>
          <a href="#find-us" tabIndex={show ? 0 : -1}>
            Find us
          </a>
          <a href="#menu" tabIndex={show ? 0 : -1}>
            Boards
          </a>
          <a href="#club" className={s.club} tabIndex={show ? 0 : -1}>
            Club
          </a>
        </div>
      </div>
    </nav>
  );
}
