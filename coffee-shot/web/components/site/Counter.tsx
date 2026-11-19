import Image, { type StaticImageData } from "next/image";
import menu from "@/data/menu.json";
import porridge from "@/assets/interior-counter-porridge.jpg";
import cappuccino from "@/assets/cappuccino-terrace.jpg";
import croissant from "@/assets/croissant-board.jpg";
import matcha from "@/assets/matcha-latte-toastie.jpg";
import chocolate from "@/assets/hot-chocolate-latte.jpg";
import butty from "@/assets/bacon-butty.jpg";
import caramel from "@/assets/salted-caramel-iced-latte-tart.jpg";
import s from "./Counter.module.css";

type Shot = { src: StaticImageData; alt: string; cap: string; pos?: string; wide?: boolean };

// Customers' photos (Google, TripAdvisor) as placeholders. Captions only say what's in the picture.
const SHOTS: Shot[] = [
  { src: porridge, alt: "Porridge with strawberries and blueberries, a pot of tea, and the counter with the chalkboards behind.", cap: "Porridge and a pot of tea, under the boards", wide: true, pos: "50% 70%" },
  { src: cappuccino, alt: "A cappuccino with a heart in the foam, in the black Coffee Shot cup, on a terrace table.", cap: "Cappuccino in the black cup, on the terrace" },
  { src: croissant, alt: "A croissant on a wooden board with butter and a small jar of jam.", cap: "Croissant, butter and jam on the board", pos: "50% 60%" },
  { src: matcha, alt: "A matcha latte with leaf latte art next to a toasted sandwich.", cap: "Matcha latte and a toastie" },
  { src: chocolate, alt: "A hot chocolate topped with cream and mini marshmallows, next to a latte.", cap: "Hot chocolate with the works" },
  { src: caramel, alt: "A salted caramel iced latte and a pear and almond tart on a pink plate.", cap: "Salted caramel iced latte, pear & almond tart", pos: "50% 55%" },
  { src: butty, alt: "A bacon butty in a soft roll with a pot of ketchup.", cap: "The bacon butty" },
];

export function Counter() {
  return (
    <section className={s.section} id="counter" aria-labelledby="counter-title">
      <div className={`wrap ${s.head}`}>
        <h2 id="counter-title">
          What comes <em>over the counter.</em>
        </h2>
        <p>
          Coffee in a cup and saucer if you&rsquo;re staying, the black cup if you&rsquo;re not. And whatever&rsquo;s in the curved
          cabinet that morning.
        </p>
        <span className="placeholder">Customers&rsquo; photos from Google &amp; TripAdvisor · replace with your own</span>
      </div>

      <ul className={s.strip} aria-label="Photos from The Coffee Shot">
        {SHOTS.map((x, i) => (
          <li key={i} className={s.shot} data-wide={x.wide || undefined}>
            <figure>
              <div className={s.frame}>
                <Image
                  src={x.src}
                  alt={x.alt}
                  sizes="(min-width: 1000px) 25vw, (min-width: 640px) 40vw, 74vw"
                  className={s.img}
                  style={{ objectPosition: x.pos ?? "50% 50%" }}
                  placeholder="blur"
                />
              </div>
              <figcaption>{x.cap}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className={`wrap ${s.cabinet}`}>
        <h3>In the curved cabinet</h3>
        <ul>
          {menu.new_on_instagram_no_prices.cabinet.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className={s.small}>From their Instagram. It changes day to day, so ask at the counter for today&rsquo;s bakes and allergens.</p>
      </div>
    </section>
  );
}
