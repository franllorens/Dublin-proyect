import Image from "next/image";
import { LOCATIONS, hoursLabel, mapsUrl, type Location } from "@/lib/hours";
import { Pill, Week } from "./LocationStatus";
import { MiniTrailer, Container } from "./Illustrations";
import photo from "@/assets/fallow-cup-trailer-bizquip.webp";
import s from "./Locations.module.css";

function Hours({ loc }: { loc: Location }) {
  const h = hoursLabel(loc);
  return (
    <dl className={s.hours}>
      <div>
        <dt>Mon–Fri</dt>
        <dd>{h.weekdays}</dd>
      </div>
      <div>
        <dt>Sat–Sun</dt>
        <dd>{h.weekends}</dd>
      </div>
    </dl>
  );
}

function MapLink({ loc }: { loc: Location }) {
  return (
    <a className={s.map} href={mapsUrl(loc)} target="_blank" rel="noopener noreferrer">
      Open in Google Maps
      <span className="sr-only"> for {loc.name}</span>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

const SANDYFORD_NOTE: Record<string, string> = {
  bizquip: "The original. A cream teardrop trailer on Burton Hall Road, out front of Bizquip.",
  nova: "Trailer number two, across the business park at Nova Atria on Blackthorn Road.",
};

export function Locations() {
  const sandyford = LOCATIONS.filter((l) => l.slug !== "kilternan");
  const kil = LOCATIONS.find((l) => l.slug === "kilternan")!;
  return (
    <section className={s.section} id="find-us" aria-labelledby="find-us-title">
      <div className="wrap">
        <header className={s.head}>
          <h2 id="find-us-title">Two trailers and a drive-thru.</h2>
          <p>All in south Dublin, all to go. There&rsquo;s no café to sit in, just a hatch, a quick hello and your coffee.</p>
        </header>

        <div className={s.grid}>
          <article className={s.sandyford} aria-labelledby="sandyford-title">
            <figure className={s.photo}>
              <Image
                src={photo}
                alt="A Fallow cup with the pink seal held up in front of the cream trailer at Bizquip, Sandyford."
                sizes="(min-width: 900px) 40vw, 100vw"
              />
              <figcaption className="placeholder">Placeholder photo · replace</figcaption>
            </figure>
            <div className={s.sandyBody}>
              <h3 id="sandyford-title" className={s.groupTitle}>
                Sandyford Business Park
                <span>Weekdays, office hours</span>
              </h3>
              <ul className={s.list}>
                {sandyford.map((loc) => (
                  <li key={loc.slug} className={s.place}>
                    <MiniTrailer className={s.mini} />
                    <div className={s.placeBody}>
                      <div className={s.placeTop}>
                        <h4>{loc.name}</h4>
                        <Pill slug={loc.slug} />
                      </div>
                      <p className={s.note}>{SANDYFORD_NOTE[loc.slug]}</p>
                      <div className={s.meta}>
                        <Week slug={loc.slug} />
                        <Hours loc={loc} />
                      </div>
                      <address>{loc.address}</address>
                      <MapLink loc={loc} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={s.kilternan} aria-labelledby="kil-title">
            <div className={s.tiles} aria-hidden="true" />
            <div className={s.kilInner}>
              <p className={s.badge}>Open weekends too</p>
              <h3 id="kil-title" className={s.kilTitle}>
                Kilternan Drive-Thru
              </h3>
              <Container className={s.container} />
              <div className={s.placeTop}>
                <Pill slug={kil.slug} />
              </div>
              <p className={s.kilNote}>
                Fallow 3.0. A green container with a pink-tiled front at the rugby club, designed by Third Mind Design.
                Drive up two cars at a time, or walk up to the window.
              </p>
              <div className={s.meta}>
                <Week slug={kil.slug} />
                <Hours loc={kil} />
              </div>
              <address>{kil.address}</address>
              <MapLink loc={kil} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
