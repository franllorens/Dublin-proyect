import Image from "next/image";
import brand from "@/data/brand.json";
import counter from "@/assets/counter-red-rock.jpg";
import s from "./Sourced.module.css";

const coffee = brand.suppliers[0];
const rest = brand.suppliers.slice(1);

export function Sourced() {
  return (
    <section className={s.section} id="sourced" aria-labelledby="sourced-title">
      <div className={`wrap ${s.grid}`}>
        <blockquote className={s.quote}>
          <p id="sourced-title">
            &ldquo;Everything from the coffee to the crisps has been thoughtfully and carefully sourced.&rdquo;
          </p>
          <footer>Georgina Campbell&rsquo;s Ireland Guide</footer>
        </blockquote>

        <div className={s.coffee}>
          <p className={s.kicker}>{coffee.what}</p>
          <h2 className={s.roaster}>{coffee.who}</h2>
          <p className={s.where}>Roasted in {coffee.where}</p>
          <p className={s.blend}>
            <span>
              On the counter: the <b>Red Rock Espresso Blend</b>.
            </span>
            <span className="placeholder">still the house blend? to confirm</span>
          </p>
        </div>

        <div className={s.aside}>
        <figure className={s.photo}>
          <div className={s.frame}>
            <Image
              src={counter}
              alt="The counter at The Coffee Shot: the white espresso machine, a Badger & Dodo Red Rock Espresso Blend card, and the seal on the window behind."
              sizes="(min-width: 900px) 40vw, 100vw"
              className={s.img}
              placeholder="blur"
            />
            <span className={`placeholder ${s.tag}`}>Placeholder photo · replace</span>
          </div>
        </figure>
        <blockquote className={s.own}>
          <p>&ldquo;We love coffee, are serious about coffee and have sourced the best beans to make it.&rdquo;</p>
          <footer>The Coffee Shot, in their own words</footer>
        </blockquote>
        </div>

        <dl className={s.ledger}>
          {rest.map((x) => (
            <div key={x.who} className={s.line}>
              <dt>{x.what}</dt>
              <span className={s.leader} aria-hidden="true" />
              <dd>
                <span>
                  <b>{x.who}</b>
                  {x.where ? `, ${x.where}` : ""}
                </span>
                {x.detail && <small>{x.detail}</small>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
