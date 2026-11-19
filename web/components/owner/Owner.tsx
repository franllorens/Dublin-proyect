"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/brand/Logo";
import { SAMPLE } from "@/lib/sample";
import { serverSnapshot, snapshot, subscribe } from "@/lib/demo-store";
import p from "@/components/club/Phone.module.css";
import s from "./Owner.module.css";

const nf = new Intl.NumberFormat("en-IE");

type Row = { label: string; value: number; live?: number };

/** Horizontal bars, one series, one colour; value at the data end; tooltip on hover/focus. */
function Bars({ rows, unit, id }: { rows: Row[]; unit: string; id: string }) {
  const max = Math.max(...rows.map((r) => r.value + (r.live ?? 0)));
  const total = rows.reduce((a, r) => a + r.value + (r.live ?? 0), 0);
  return (
    <>
      <ul className={s.bars} aria-describedby={`${id}-t`}>
        {rows.map((r) => {
          const v = r.value + (r.live ?? 0);
          return (
            <li key={r.label} className={s.barRow} tabIndex={0} aria-label={`${r.label}: ${nf.format(v)} ${unit}`}>
              <span className={s.barLabel}>{r.label}</span>
              <span className={s.track}>
                <span className={s.bar} style={{ width: `${(v / max) * 100}%` }} />
                <span className={s.tip} role="tooltip">
                  <b>{nf.format(v)}</b> {unit} · {Math.round((v / total) * 100)}%{r.live ? ` · ${r.live} live` : ""}
                </span>
              </span>
              <span className={s.barValue}>{nf.format(v)}</span>
            </li>
          );
        })}
      </ul>
      <details className={s.table} id={`${id}-t`}>
        <summary>Show as a table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Where</th>
              <th scope="col">{unit}</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const v = r.value + (r.live ?? 0);
              return (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td>{nf.format(v)}</td>
                  <td>{Math.round((v / total) * 100)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </>
  );
}

function Columns({ days }: { days: { d: string; v: number }[] }) {
  const top = 170;
  return (
    <>
      <div className={s.cols}>
        <div className={s.grid} aria-hidden="true">
          {[150, 100, 50].map((g) => (
            <span key={g} style={{ bottom: `${(g / top) * 100}%` }}>
              <i>{g}</i>
            </span>
          ))}
        </div>
        <ol className={s.colList}>
          {days.map((x, i) => (
            <li key={x.d} tabIndex={0} aria-label={`${x.d}: ${x.v} stamps`} className={s.col}>
              <span className={s.colBar} style={{ height: `${(x.v / top) * 100}%` }} data-today={i === days.length - 1} />
              <span className={s.tip} role="tooltip">
                {x.d} · <b>{x.v}</b> stamps
              </span>
              <span className={s.colLabel} aria-hidden="true">
                {i % 2 === 0 || i === days.length - 1 ? x.d.split(" ")[1] : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <p className={s.axisNote}>Weekends are Kilternan only. Last bar is today so far.</p>
    </>
  );
}

const AUDIENCES = [
  { key: "all", label: "Every card", n: SAMPLE.members },
  { key: "oneAway", label: "1 away from free", n: SAMPLE.oneAwayTotal },
  { key: "lapsed", label: "Not seen in 3 weeks", n: SAMPLE.lapsedTotal },
] as const;

export function Owner({ live }: { live: boolean }) {
  const store = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [aud, setAud] = useState<(typeof AUDIENCES)[number]["key"]>("lapsed");
  const [msg, setMsg] = useState("Cold out there. Your next coffee is waiting at the hatch.");
  const [sent, setSent] = useState<string | null>(null);

  // What the visitor did in the other views (this browser), added on top of the example month.
  const d = useMemo(() => {
    const ev = store.events;
    const stamps = ev.filter((e) => e.type === "stamp");
    const today = new Date().toDateString();
    return {
      joins: ev.filter((e) => e.type === "join").length,
      stamps: stamps.length,
      today: stamps.filter((e) => new Date(e.t).toDateString() === today).length,
      byLoc: (slug: string) => stamps.filter((e) => e.type === "stamp" && e.location === slug).length,
      bySrc: (src: string) => stamps.filter((e) => e.type === "stamp" && e.source === src).length,
      redeemed: ev.filter((e) => e.type === "redeem").length,
      reviewTaps: ev.filter((e) => e.type === "review_tap").length,
      feedback: ev.filter((e) => e.type === "feedback").length,
    };
  }, [store]);

  const kpis = [
    { label: "Members", v: SAMPLE.members, live: d.joins },
    { label: "Stamps this month", v: SAMPLE.stamps, live: d.stamps },
    { label: "Free coffees given", v: SAMPLE.redeemed, live: d.redeemed },
    { label: "Story stamps", v: SAMPLE.stories, live: d.bySrc("story") },
    { label: "Taps on “Review us”", v: SAMPLE.reviewTaps, live: d.reviewTaps, foot: `${SAMPLE.feedback + d.feedback} private notes` },
  ];
  const daily = SAMPLE.daily.map((x, i, a) => (i === a.length - 1 ? { ...x, v: x.v + d.today } : x));
  const audience = AUDIENCES.find((a) => a.key === aud)!;

  return (
    <div className={s.page}>
      <header className={s.top}>
        <div className={`${s.wrap} ${s.topInner}`}>
          <Link href="/" className={s.brand} >
            <Wordmark className={s.mark} title="fallow" />
            <span>Club</span>
          <span className="sr-only"> (back to the site)</span>
          </Link>
          <nav aria-label="Demo views" className={s.views}>
            <Link href="/">Site</Link>
            <Link href="/staff">Barista</Link>
          </nav>
        </div>
      </header>

      <main className={s.wrap}>
        <div className={s.head}>
          <h1>Fallow Club, {SAMPLE.month}</h1>
          <p className={s.sample}>
            <span className="placeholder">Example data</span>
            Invented figures to show the layout, plus whatever you do in the Site and Barista views, live in this browser.
            {live ? " Live mode: wire these tiles to Supabase next." : ""}
          </p>
        </div>

        <dl className={s.kpis}>
          {kpis.map((k) => (
            <div key={k.label} className={s.kpi}>
              <dt>{k.label}</dt>
              <dd>
                {nf.format(k.v + k.live)}
                {k.live > 0 && <span className={s.delta}>+{k.live} live</span>}
              </dd>
              {k.foot && <dd className={s.foot}>{k.foot}</dd>}
            </div>
          ))}
        </dl>

        <div className={s.panels}>
          <section className={`${s.panel} ${s.wide}`} aria-labelledby="daily-t">
            <h2 id="daily-t">Stamps per day, last two weeks</h2>
            <Columns days={daily} />
          </section>

          <section className={s.panel} aria-labelledby="loc-t">
            <h2 id="loc-t">Stamps by location</h2>
            <Bars id="loc" unit="stamps" rows={SAMPLE.byLocation.map((r) => ({ label: r.label, value: r.value, live: d.byLoc(r.slug) }))} />
          </section>

          <section className={s.panel} aria-labelledby="src-t">
            <h2 id="src-t">Where stamps come from</h2>
            <Bars id="src" unit="stamps" rows={SAMPLE.bySource.map((r) => ({ label: r.label, value: r.value, live: d.bySrc(r.key) }))} />
          </section>

          <section className={s.panel} aria-labelledby="away-t">
            <h2 id="away-t">
              One away from a free coffee <span>{SAMPLE.oneAwayTotal}</span>
            </h2>
            <People rows={SAMPLE.oneAway} onNudge={() => setAud("oneAway")} nudge="Nudge them" />
          </section>

          <section className={s.panel} aria-labelledby="lapsed-t">
            <h2 id="lapsed-t">
              Not seen in 3 weeks <span>{SAMPLE.lapsedTotal}</span>
            </h2>
            <People rows={SAMPLE.lapsed} onNudge={() => setAud("lapsed")} nudge="Send them a note" />
          </section>

          <section className={`${s.panel} ${s.wide} ${s.composer}`} aria-labelledby="comp-t">
            <div className={s.compForm}>
              <h2 id="comp-t">Message on the card</h2>
              <p className={s.help}>Shows on the lock screen of everyone you pick, straight from their Wallet card.</p>
              <fieldset className={s.aud}>
                <legend>Send to</legend>
                {AUDIENCES.map((a) => (
                  <label key={a.key}>
                    <input type="radio" name="aud" checked={aud === a.key} onChange={() => setAud(a.key)} />
                    <span>
                      {a.label} <b>{a.n}</b>
                    </span>
                  </label>
                ))}
              </fieldset>
              <label className={s.msg}>
                <span>
                  Message <small>{msg.length}/90</small>
                </span>
                <textarea value={msg} maxLength={90} rows={3} onChange={(e) => setMsg(e.target.value)} />
              </label>
              <button
                type="button"
                className="btn"
                disabled={!msg.trim()}
                onClick={() => setSent(`Queued for ${audience.n} cards (demo). Nothing was sent.`)}
              >
                Send to {audience.n} cards
              </button>
              <p className={s.help} role="status">
                {sent ?? "Google Wallet allows 3 messages a day per card. Apple shows it when the card updates. Sending needs the broadcast endpoint, the next backend step."}
              </p>
            </div>
            <div className={s.preview} aria-label={`Lock screen preview: Fallow Club, ${msg}`} role="img">
              <div className={p.phone} style={{ ["--pw" as string]: "250px" }} aria-hidden="true">
                <div className={p.screen}>
                  <div className={p.lock} data-show="true">
                    <p className={p.lockDate}>Thursday 20 November</p>
                    <p className={p.lockTime}>08:12</p>
                    <div className={p.lockNote}>
                      <svg viewBox="0 0 40 40" className={p.appIcon} aria-hidden="true">
                        <rect width="40" height="40" rx="9" fill="#111" />
                        <rect x="7" y="9" width="26" height="8" rx="2" fill="#4cb3d4" />
                        <rect x="7" y="13" width="26" height="8" rx="2" fill="#f2b33d" />
                        <rect x="7" y="17" width="26" height="8" rx="2" fill="#e9534d" />
                        <rect x="7" y="21" width="26" height="11" rx="2.5" fill="#2e2e30" />
                      </svg>
                      <div>
                        <p className={p.nTitle}>
                          Fallow Club <span>now</span>
                        </p>
                        <p className={p.nBody}>{msg || "…"}</p>
                      </div>
                    </div>
                    <span className={p.homebar} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function People({ rows, onNudge, nudge }: { rows: { name: string; stamps: number; last: string; where: string }[]; onNudge: () => void; nudge: string }) {
  return (
    <>
      <table className={s.people}>
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Card</th>
            <th scope="col">Last visit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <th scope="row">
                {r.name}
                <span>{r.where}</span>
              </th>
              <td>
                <span className="sr-only">{r.stamps} of 9 stamps</span>
                <span className={s.dots} aria-hidden="true">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <i key={i} data-on={i < r.stamps} />
                  ))}
                </span>
              </td>
              <td>{r.last}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={s.peopleFoot}>
        Example names.{" "}
        <a
          href="#comp-t"
          onClick={() => {
            onNudge();
          }}
        >
          {nudge}
        </a>
      </p>
    </>
  );
}
