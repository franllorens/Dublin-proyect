import Link from "next/link";
import brand from "@/data/brand.json";
import { SignPanel } from "@/components/brand/Seal";
import { LOCATION, mapsUrl, weekRows } from "@/lib/hours";
import { IG_HANDLE } from "@/lib/brand";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`wrap ${s.top}`}>
        <SignPanel className={s.sign} />
        <p className={s.sign_off}>See you on the Plaza. As ever&hellip;&hellip;</p>
      </div>
      <div className={`wrap ${s.grid}`}>
        <div className={s.col}>
          <h3>Visit</h3>
          <p>{LOCATION.address}</p>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            Google Maps<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className={s.col}>
          <h3>Hours</h3>
          <ul>
            {weekRows().map((r) => (
              <li key={r.label}>
                {r.label} <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={s.col}>
          <h3>Say hello</h3>
          <a href={`tel:${LOCATION.phone_e164}`}>{LOCATION.phone}</a>
          <a href={`mailto:${LOCATION.email}`}>{LOCATION.email}</a>
          <a href={brand.socials.facebook} target="_blank" rel="noopener noreferrer">
            Facebook<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href={`https://www.instagram.com/${IG_HANDLE.slice(1)}/`} target="_blank" rel="noopener noreferrer">
            Instagram {IG_HANDLE}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className={s.col}>
          <h3>Gift cards</h3>
          <p>Treat someone to a coffee: gift cards are on me2you.</p>
          <a href={brand.socials.gift_cards} target="_blank" rel="noopener noreferrer">
            me2you.ie<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
      <div className={`wrap ${s.bottom}`}>
        <p>Concept demo by Workflowers. Photos are placeholders. The seal is redrawn from their logo file, not the original vector.</p>
        <nav aria-label="Demo views" className={s.views}>
          <Link href="/staff">Barista view</Link>
          <Link href="/owner">Owner view</Link>
        </nav>
      </div>
    </footer>
  );
}
