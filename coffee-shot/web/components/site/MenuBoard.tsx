import menu from "@/data/menu.json";
import { ChalkReveal } from "./ChalkReveal";
import s from "./MenuBoard.module.css";

type Item = { name: string; price: number | null; note?: string; addon?: boolean };
type Board = { slug: string; title: string; items: Item[]; footnote?: string };

const boards = menu.boards as Board[];
const bySlug = (slug: string) => boards.find((b) => b.slug === slug)!;
const eur = (n: number) => n.toFixed(2);

function Rows({ board, start }: { board: Board; start: number }) {
  return (
    <div className={s.list}>
      <h3 className={`${s.boardHead} ${s.row}`} style={{ ["--i" as string]: start }}>
        {board.title}
      </h3>
      <ul>
        {board.items.map((it, k) => (
          <li
            key={it.name}
            className={`${s.row} ${s.item}`}
            data-long-note={it.note && it.note.length > 10 ? "" : undefined}
            style={{ ["--i" as string]: start + k + 1 }}
          >
            <span className={s.name}>
              {it.name}
              {it.note && <small className={s.note}>{it.note}</small>}
            </span>
            <span className={s.dots} aria-hidden="true" />
            {it.price == null ? (
              <span className={`${s.price} ${s.unread}`}>
                <span aria-hidden="true">€ –</span>
                <span className="sr-only">price to confirm</span>
              </span>
            ) : (
              <span className={s.price}>
                {it.addon ? "+ " : ""}€&thinsp;{eur(it.price)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MenuBoard() {
  const hot = bySlug("hot");
  const sand = bySlug("sandwiches");
  const iced = bySlug("iced");
  const lately = menu.new_on_instagram_no_prices.drinks;
  return (
    <section className={s.section} id="menu" aria-labelledby="menu-title">
      <div className={`wrap ${s.wrap}`}>
        <header className={s.head}>
          <h1 id="menu-title">The full menu</h1>
          <p>
            Chalked up behind the counter, the same as you&rsquo;d read them inside. Every sandwich can go on a gluten-free bagel
            or a tomato wrap.
          </p>
        </header>

        <div id="boards" className={s.boards}>
          <div className={`${s.board} ${s.big}`}>
            <p className={`${s.marquee} ${s.row}`} style={{ ["--i" as string]: 0 }} aria-hidden="true">
              The Coffee Shot
            </p>
            <div className={s.cols}>
              <Rows board={hot} start={1} />
              <Rows board={sand} start={2} />
            </div>
            <p className={`${s.foot} ${s.row}`} style={{ ["--i" as string]: 13 }}>
              {sand.footnote}
            </p>
          </div>

          <div className={`${s.board} ${s.narrow}`}>
            <Rows board={iced} start={2} />
            <hr className={s.rule} />
            <div className={s.list}>
              <h3 className={`${s.boardHead} ${s.row}`} style={{ ["--i" as string]: 8 }}>
                Lately
              </h3>
              <p className={`${s.sub} ${s.row}`} style={{ ["--i" as string]: 9 }}>
                as seen on our Instagram
              </p>
              <ul>
                {lately.map((x, k) => (
                  <li key={x} className={`${s.row} ${s.plain}`} style={{ ["--i" as string]: 10 + k }}>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className={s.tag}>
            <span>Prices read off an older photo of the boards.</span> <b>To confirm before going live.</b>
          </p>
        </div>
        <ChalkReveal targetId="boards" />
      </div>
    </section>
  );
}
