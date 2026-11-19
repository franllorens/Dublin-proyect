import menu from "@/data/menu.json";
import { jitter } from "@/lib/jitter";
import { BoardToggle } from "./BoardToggle";
import s from "./MenuBoard.module.css";

const eur = (n: number) => n.toFixed(2);

/** One plastic letter per character, each hung a little crooked (deterministic per position). */
function Letters({ text, seed }: { text: string; seed: number }) {
  return (
    <>
      {Array.from(text).map((c, i) =>
        c === " " ? (
          <span key={i} className={s.space} />
        ) : (
          <span key={i} className={s.ch} data-ch="">
            <span
              className={s.glyph}
              style={{
                ["--r" as string]: `${((jitter(i, seed) - 0.5) * 5).toFixed(2)}deg`,
                ["--dy" as string]: `${((jitter(i + 7, seed) - 0.5) * 1.6).toFixed(2)}px`,
              }}
            >
              {c}
            </span>
          </span>
        ),
      )}
    </>
  );
}

function Tile({ hot, iced, row, head = false }: { hot: string; iced: string; row: number; head?: boolean }) {
  return (
    <span className={`${s.tile} ${head ? s.tileHead : ""}`} style={{ ["--row" as string]: row }} aria-hidden="true" data-tile="">
      <span className={`${s.face} ${s.front}`}>
        <Letters text={hot} seed={row * 3 + 1} />
      </span>
      <span className={`${s.face} ${s.back}`}>
        <Letters text={iced} seed={row * 3 + 2} />
      </span>
    </span>
  );
}

export function MenuBoard() {
  let row = 0;
  return (
    <section className={s.section} id="menu" aria-labelledby="menu-title">
      <div className={`wrap ${s.layout}`}>
        <header className={s.head}>
          <h2 id="menu-title">What&rsquo;s on the board.</h2>
          <p>Same board you read at the window. Flip it for iced.</p>
          <BoardToggle boardId="board" />
        </header>

        <div className={s.frame}>
          <div id="board" className={s.board} data-mode="hot">
            <p className={`${s.row} ${s.title}`} data-row="" aria-hidden="true">
              <span className={s.bar} />
              <Letters text="FALLOW" seed={91} />
              <span className={s.bar} />
            </p>
            <p className={`${s.row} ${s.title2}`} data-row="" aria-hidden="true">
              <Letters text="DRINKS MENU" seed={92} />
            </p>

            {menu.sections.map((sec) => {
              const headRow = ++row;
              return (
                <div key={sec.name} className={s.group}>
                  <h3 className={`${s.row} ${s.section_}`} data-row="">
                    <span className="sr-only">{sec.name}</span>
                    <span aria-hidden="true" className={s.secName}>
                      <Letters text={sec.name.toUpperCase()} seed={headRow * 13} />
                    </span>
                    <Tile hot="HOT" iced="ICED" row={headRow} head />
                  </h3>
                  <ul className={s.items}>
                    {sec.items.map((it) => {
                      const r = ++row;
                      return (
                        <li key={it.name} className={`${s.row} ${s.item}`} data-row="">
                          <span aria-hidden="true" className={s.name}>
                            <Letters text={it.name.toUpperCase()} seed={r * 17} />
                          </span>
                          <Tile hot={eur(it.hot)} iced={it.iced == null ? "–" : eur(it.iced)} row={r} />
                          <span className="sr-only">
                            {it.name}: hot €{eur(it.hot)}, {it.iced == null ? "no iced version" : `iced €${eur(it.iced)}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            <hr className={s.rule} />
            <h3 className="sr-only">Extras</h3>
            <ul className={s.items}>
              {menu.addons.map((a) => {
                const r = ++row;
                const [name, detail] = a.name.split(" (");
                return (
                  <li key={a.name} className={`${s.row} ${s.addon}`} data-row="">
                    <span aria-hidden="true" className={s.name}>
                      <Letters text={name.toUpperCase()} seed={r * 19} />
                      {detail && (
                        <span className={s.detail}>
                          <Letters text={detail.replace(")", "").toUpperCase().replace(/, /g, "/")} seed={r * 23} />
                        </span>
                      )}
                    </span>
                    <span aria-hidden="true" className={s.addPrice}>
                      <Letters text={`+${eur(a.price)}`} seed={r * 29} />
                    </span>
                    <span className="sr-only">
                      {a.name}: plus €{eur(a.price)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <aside className={s.side} aria-labelledby="cabinet-title">
          <h3 id="cabinet-title">And in the cabinet</h3>
          <ul className={s.cabinet}>
            {menu.cabinet_no_prices.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className={s.small}>
            The cabinet changes daily, so ask at the window for prices and allergens. Drink prices in euro, from the board at
            the trailer (Nov&nbsp;2026).
          </p>
        </aside>
      </div>
    </section>
  );
}
