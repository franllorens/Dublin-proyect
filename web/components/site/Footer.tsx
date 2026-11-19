import Link from "next/link";
import { Lockup } from "@/components/brand/Logo";
import { LOCATIONS, hoursLabel, mapsUrl } from "@/lib/hours";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`wrap ${s.grid}`}>
        <div className={s.brand}>
          <Lockup className={s.lockup} decorative />
          <p>Roasted with passion, served with love.</p>
          <a className={s.ig} href="https://www.instagram.com/fallowspecialitycoffee/" target="_blank" rel="noopener noreferrer">
            @fallowspecialitycoffee
            <span className="sr-only">on Instagram (opens in a new tab)</span>
          </a>
        </div>
        <ul className={s.locs}>
          {LOCATIONS.map((l) => {
            const h = hoursLabel(l);
            return (
              <li key={l.slug}>
                <h3>{l.name}</h3>
                <p>{l.address}</p>
                <p className={s.hrs}>
                  Mon–Fri {h.weekdays}
                  {l.hours["sat-sun"] ? ` · Sat–Sun ${h.weekends}` : ""}
                </p>
                <a href={mapsUrl(l)} target="_blank" rel="noopener noreferrer">
                  Google Maps<span className="sr-only"> for {l.name} (opens in a new tab)</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={`wrap ${s.bottom}`}>
        <p>Concept demo by Workflowers. Photos are placeholders.</p>
        <nav aria-label="Demo views" className={s.views}>
          <Link href="/staff">Barista view</Link>
          <Link href="/owner">Owner view</Link>
        </nav>
      </div>
    </footer>
  );
}
