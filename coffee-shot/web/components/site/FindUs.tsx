import Image from "next/image";
import facade from "@/assets/facade-plaza.jpg";
import { LOCATION, directionsUrl, mapsUrl } from "@/lib/hours";
import { HoursPlaque } from "./HoursPlaque";
import s from "./FindUs.module.css";

export function FindUs() {
  return (
    <section className={s.section} id="find-us" aria-labelledby="find-title">
      <div className={`wrap ${s.grid}`}>
        <header className={s.head}>
          <h2 id="find-title">
            On the Plaza, <em>Beacon South Quarter.</em>
          </h2>
          <p className={s.lede}>
            Glass on two sides, so you can spot the seal hanging in the window from across the square. Tables inside under the
            copper lamps, more out on the terrace.
          </p>
        </header>

        <HoursPlaque className={s.plaque} />

        <div className={s.details}>
          <address className={s.address}>
            <span className={s.label}>Where</span>
            <span>{LOCATION.address}</span>
            <span className="placeholder" title={LOCATION.address_to_confirm}>
              Unit number to confirm
            </span>
          </address>
          <div className={s.contact}>
            <span className={s.label}>Call or write</span>
            <a href={`tel:${LOCATION.phone_e164}`}>{LOCATION.phone}</a>
            <a href={`mailto:${LOCATION.email}`}>{LOCATION.email}</a>
          </div>
          <ul className={s.services} aria-label="At The Coffee Shot">
            {LOCATION.services.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <div className={s.ctas}>
            <a className="btn" href={directionsUrl} target="_blank" rel="noopener noreferrer">
              Get directions<span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
            <a className="btn btn--ghost" href={mapsUrl} target="_blank" rel="noopener noreferrer">
              See us on Google Maps<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>

        <figure className={s.photo}>
          <div className={s.frame}>
            <Image
              src={facade}
              alt="The Coffee Shot from the Plaza: the cream sign with gold lettering over the glass front, and the round seal hanging in the window."
              sizes="(min-width: 900px) 46vw, 100vw"
              className={s.img}
              placeholder="blur"
            />
            <span className={`placeholder ${s.tag}`}>Placeholder photo · replace</span>
          </div>
          <figcaption>
            <q>Great patio overlooking a square.</q> <span>From a customer review</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
