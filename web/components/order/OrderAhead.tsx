"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNow } from "@/components/site/Clock";
import { LOCATIONS, statusOf, whenLabel, shortName, directionsUrl } from "@/lib/hours";
import { api, clubLive } from "@/lib/mode";
import { demoPlaceOrder, demoSetOrderStatus, serverSnapshot, snapshot, subscribe } from "@/lib/demo-store";
import { reducedMotion } from "@/lib/motion";
import {
  DRINKS,
  SNACKS,
  MAX_LINES,
  MAX_QTY,
  STATUS_STEPS,
  drinkUnitPrice,
  drinksTotal,
  euro,
  fmt,
  itemCount,
  lineLabel,
  pickupSlots,
  type DrinkLine,
  type Milk,
  type Order,
  type OrderLine,
  type OrderStatus,
  type Syrup,
  type Temp,
} from "@/lib/order";
import s from "./OrderAhead.module.css";

const LAST = "fallow-last-order";
const live = clubLive();

function Steps() {
  return (
    <ol className={s.how}>
      <li>
        <b>1</b>
        <span>Order here, from your desk</span>
      </li>
      <li>
        <b>2</b>
        <span>Walk down when it suits you</span>
      </li>
      <li>
        <b>3</b>
        <span>It&rsquo;s on the counter. Pay at the hatch</span>
      </li>
    </ol>
  );
}

/** Live status of a placed order: Received → Making it → On the counter. */
function Tracker({ status }: { status: OrderStatus }) {
  const idx = status === "collected" ? 3 : STATUS_STEPS.findIndex((x) => x.key === status);
  return (
    <ol className={s.tracker} style={{ ["--done" as string]: Math.min(idx, 2) / 2 }}>
      {STATUS_STEPS.map((st, i) => (
        <li key={st.key} data-state={i < idx ? "done" : i === idx ? "now" : "next"}>
          <i aria-hidden="true" />
          <span>{st.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderAhead() {
  const now = useNow();
  const store = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  const [loc, setLoc] = useState<string>("nova");
  const [drink, setDrink] = useState(DRINKS[1].name); // Latte / Cappuccino
  const [temp, setTemp] = useState<Temp>("hot");
  const [milk, setMilk] = useState<Milk>("regular");
  const [shot, setShot] = useState(false);
  const [syrup, setSyrup] = useState<Syrup>("none");
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [slot, setSlot] = useState<string>("asap");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [liveStatus, setLiveStatus] = useState<OrderStatus | null>(null);
  const [isDemoOrder, setIsDemoOrder] = useState(!live);
  const [said, setSaid] = useState("");
  const ticket = useRef<HTMLDivElement>(null);

  const d = DRINKS.find((x) => x.name === drink)!;
  const icedOk = d.iced != null;
  useEffect(() => {
    if (!icedOk && temp === "iced") setTemp("hot");
  }, [icedOk, temp]);

  // Pre-select the first hatch that's open right now (Sandyford first: that's the office crowd).
  const didPick = useRef(false);
  useEffect(() => {
    if (!now || didPick.current) return;
    didPick.current = true;
    const open = LOCATIONS.find((l) => statusOf(l, now).open);
    if (open) setLoc(open.slug);
  }, [now]);

  // Restore an order placed earlier today (refresh, or coming back from the barista view).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST);
      if (!raw) return;
      const o = JSON.parse(raw) as Order & { demo?: boolean };
      if (new Date(o.createdAt).toDateString() !== new Date().toDateString()) return;
      setPlaced(o);
      setIsDemoOrder(o.demo !== false);
    } catch {
      /* ignore */
    }
  }, []);

  const location = LOCATIONS.find((l) => l.slug === loc)!;
  const slots = useMemo(() => (now ? pickupSlots(location, now) : null), [location, now]);

  const draft: DrinkLine = { kind: "drink", name: drink, temp, milk, extraShot: shot, syrup, qty: 1 };
  const draftPrice = drinkUnitPrice(draft);
  const total = drinksTotal(lines);
  const snacksIn = lines.filter((l) => l.kind === "snack").length > 0;
  const canOrder = Boolean(slots?.open && lines.length && name.trim() && !busy);

  // Status of the placed order: demo store (barista view updates it live) or the API.
  const demoOrder = placed && isDemoOrder ? store.orders[placed.id] : null;
  const status: OrderStatus | null = placed ? (isDemoOrder ? demoOrder?.status ?? placed.status : liveStatus ?? placed.status) : null;

  useEffect(() => {
    if (!placed || isDemoOrder) return;
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch(api(`/api/orders/${placed.id}`));
        if (r.ok) {
          const j = (await r.json()) as { status: OrderStatus };
          if (!stop) setLiveStatus(j.status);
        }
      } catch {
        /* keep the last status */
      }
    };
    tick();
    const id = window.setInterval(tick, 8000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [placed, isDemoOrder]);

  // Demo autopilot, so a solo demo still shows the whole flow. A barista in /staff can move it faster.
  useEffect(() => {
    if (!placed || !isDemoOrder) return;
    const t1 = window.setTimeout(() => demoSetOrderStatus(placed.id, "making"), 5000);
    const t2 = window.setTimeout(() => demoSetOrderStatus(placed.id, "ready"), 15000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [placed, isDemoOrder]);

  useEffect(() => {
    if (status === "making") setSaid(`Order ${placed?.number}: they're making it.`);
    if (status === "ready") setSaid(`Order ${placed?.number} is on the counter at ${shortName(location)}.`);
  }, [status, placed, location]);

  function addDrink() {
    if (draftPrice == null) return;
    setLines((ls) => {
      const same = ls.findIndex((l) => l.kind === "drink" && lineLabel(l) === lineLabel(draft));
      if (same >= 0) return ls.map((l, i) => (i === same ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l));
      return ls.length >= MAX_LINES ? ls : [...ls, draft];
    });
    setSaid(`${lineLabel(draft)} added.`);
    setMilk("regular");
    setSyrup("none");
    setShot(false);
    setTemp("hot");
  }

  function toggleSnack(n: string) {
    setLines((ls) =>
      ls.some((l) => l.kind === "snack" && l.name === n)
        ? ls.filter((l) => !(l.kind === "snack" && l.name === n))
        : ls.length >= MAX_LINES
          ? ls
          : [...ls, { kind: "snack", name: n, qty: 1 }],
    );
  }

  const bump = (i: number, by: number) =>
    setLines((ls) => ls.flatMap((l, k) => (k !== i ? [l] : l.qty + by <= 0 ? [] : [{ ...l, qty: Math.min(MAX_QTY, l.qty + by) }])));

  async function place(e: React.FormEvent) {
    e.preventDefault();
    if (!canOrder || !slots?.open) return;
    setBusy(true);
    setError(null);
    const asap = slot === "asap";
    const pickupAt = asap ? slots.asapAt : Number(slot);
    const payload = { location: loc, name: name.trim().slice(0, 40), lines, pickupAt, asap };
    let order: Order | null = null;
    let demo = !live;
    if (live) {
      try {
        const r = await fetch(api("/api/orders"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tenant: "fallow", ...payload }),
        });
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as { id: string; number: string; status: OrderStatus };
        order = { ...payload, id: j.id, number: j.number, status: j.status, createdAt: Date.now() };
      } catch {
        setError("Couldn't reach the hatch, so this one is a demo order. Nothing was sent.");
        demo = true;
      }
    }
    if (!order) order = demoPlaceOrder(payload);
    setIsDemoOrder(demo);
    setLiveStatus(null);
    setPlaced(order);
    try {
      localStorage.setItem(LAST, JSON.stringify({ ...order, demo }));
    } catch {
      /* ignore */
    }
    setSaid(`Order ${order.number} placed. Ready about ${fmt(pickupAt)} at ${shortName(location)}.`);
    setBusy(false);
    ticket.current?.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
  }

  function newOrder() {
    setPlaced(null);
    setLines([]);
    setSlot("asap");
    setError(null);
    try {
      localStorage.removeItem(LAST);
    } catch {
      /* ignore */
    }
  }

  const stamp = now ? `${fmt(now.minutes)}` : "--:--";
  const placedLoc = placed ? LOCATIONS.find((l) => l.slug === placed.location)! : location;

  return (
    <section className={s.section} id="order" aria-labelledby="order-title">
      <div className={`wrap ${s.grid}`}>
        <header className={s.head}>
          <h2 id="order-title">Order from your desk. Grab it at the hatch.</h2>
          <p className={s.lede}>
            Working in Sandyford? Order your coffee and something from the cabinet, walk down when it suits you, and
            it&rsquo;s waiting on the counter. Skip the lunchtime queue.
          </p>
          <Steps />
          <p className={s.mode}>
            {live
              ? "Orders go straight to the barista's screen at the hatch you pick."
              : "Demo: orders stay in this browser. Open the barista view to see them come in."}{" "}
            {!live && (
              <a href="/staff" target="_blank" rel="noopener">
                Barista view<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </p>
        </header>

        <div ref={ticket} className={s.ticket} data-placed={Boolean(placed)}>
          <p className="sr-only" role="status" aria-live="polite">
            {said}
          </p>
          <div className={s.ticketHead} aria-hidden="true">
            <span>Order ahead</span>
            <span>{placed ? `No. ${placed.number}` : `No. --`}</span>
            <span>{placed ? fmt(placed.pickupAt) : stamp}</span>
          </div>

          {placed && status ? (
            <div className={s.done}>
              <p className={s.number}>
                <span>Your order</span>
                {placed.number}
              </p>
              <p className={s.when}>
                {status === "ready" || status === "collected"
                  ? `It's on the counter at ${shortName(placedLoc)}.`
                  : `Ready about ${fmt(placed.pickupAt)} at ${shortName(placedLoc)}.`}
              </p>
              <Tracker status={status} />
              <ul className={s.recap}>
                {placed.lines.map((l, i) => (
                  <li key={i}>
                    <span>
                      {l.qty}× {lineLabel(l)}
                    </span>
                    <span>{l.kind === "drink" ? euro(Math.round((drinkUnitPrice(l) ?? 0) * 100) * l.qty) : "at the hatch"}</span>
                  </li>
                ))}
              </ul>
              <p className={s.pay}>
                Pay {euro(drinksTotal(placed.lines))}
                {placed.lines.some((l) => l.kind === "snack") ? " plus the cabinet items" : ""} at the hatch, card or cash.
                Show your Fallow Club card for your stamp.
              </p>
              <div className={s.doneActions}>
                <a className="btn" href={directionsUrl(placedLoc)} target="_blank" rel="noopener noreferrer">
                  Walking directions<span className="sr-only"> (opens Google Maps in a new tab)</span>
                </a>
                <button type="button" className="btn btn--ghost" onClick={newOrder}>
                  New order
                </button>
              </div>
              {isDemoOrder && <p className={s.small}>Demo: time runs fast here, and nothing reaches a real hatch.</p>}
            </div>
          ) : (
            <form className={s.form} onSubmit={place}>
              <fieldset className={s.block}>
                <legend>Pick up at</legend>
                <div className={s.locs}>
                  {LOCATIONS.map((l) => {
                    const st = now ? statusOf(l, now) : null;
                    return (
                      <label key={l.slug} data-closed={st ? !st.open : undefined}>
                        <input type="radio" name="order-loc" value={l.slug} checked={loc === l.slug} onChange={() => setLoc(l.slug)} />
                        <span>
                          <b>{shortName(l)}</b>
                          <small>{!st ? "…" : st.open ? `till ${fmt(st.closesAt)}` : `opens ${whenLabel(st)}`}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className={s.block}>
                <legend>Your coffee</legend>
                <div className={s.drinks}>
                  {DRINKS.map((x) => (
                    <label key={x.name}>
                      <input type="radio" name="order-drink" value={x.name} checked={drink === x.name} onChange={() => setDrink(x.name)} />
                      <span>
                        {x.name}
                        <small>{euro(Math.round(x.hot * 100))}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <div className={s.opts}>
                  <div className={s.seg} role="radiogroup" aria-label="Hot or iced">
                    {(["hot", "iced"] as Temp[]).map((t) => (
                      <label key={t} data-disabled={t === "iced" && !icedOk}>
                        <input type="radio" name="order-temp" checked={temp === t} disabled={t === "iced" && !icedOk} onChange={() => setTemp(t)} />
                        <span>{t === "hot" ? "Hot" : icedOk ? "Iced" : "Iced –"}</span>
                      </label>
                    ))}
                  </div>
                  <label className={s.check}>
                    <input type="checkbox" checked={shot} onChange={(e) => setShot(e.target.checked)} />
                    <span>Extra shot +€1.00</span>
                  </label>
                  <label className={s.select}>
                    <span>Milk</span>
                    <select value={milk} onChange={(e) => setMilk(e.target.value as Milk)}>
                      <option value="regular">Regular</option>
                      <option value="oat">Oat +€0.50</option>
                      <option value="coconut">Coconut +€0.50</option>
                    </select>
                  </label>
                  <label className={s.select}>
                    <span>Syrup</span>
                    <select value={syrup} onChange={(e) => setSyrup(e.target.value as Syrup)}>
                      <option value="none">None</option>
                      <option value="vanilla">Vanilla +€0.50</option>
                      <option value="caramel">Caramel +€0.50</option>
                      <option value="hazelnut">Hazelnut +€0.50</option>
                    </select>
                  </label>
                </div>
                <button type="button" className={`btn btn--pink ${s.add}`} onClick={addDrink} disabled={draftPrice == null || lines.length >= MAX_LINES}>
                  Add to order{draftPrice != null ? ` · ${euro(Math.round(draftPrice * 100))}` : ""}
                </button>
              </fieldset>

              <fieldset className={s.block}>
                <legend>
                  From the cabinet <small>priced at the hatch</small>
                </legend>
                <div className={s.snacks}>
                  {SNACKS.map((n) => {
                    const on = lines.some((l) => l.kind === "snack" && l.name === n);
                    return (
                      <button key={n} type="button" aria-pressed={on} onClick={() => toggleSnack(n)}>
                        {n}
                      </button>
                    );
                  })}
                </div>
                <p className={s.small}>The cabinet changes daily. If something&rsquo;s gone, the team will tell you at the hatch.</p>
              </fieldset>

              <div className={s.docket} aria-label="Your order">
                {lines.length === 0 ? (
                  <p className={s.empty}>Nothing on the ticket yet.</p>
                ) : (
                  <ul>
                    {lines.map((l, i) => (
                      <li key={i}>
                        <span className={s.lineName}>{lineLabel(l)}</span>
                        <span className={s.qty}>
                          <button type="button" onClick={() => bump(i, -1)} aria-label={`One less ${lineLabel(l)}`}>
                            −
                          </button>
                          <b>
                            <span className="sr-only">Quantity </span>
                            {l.qty}
                          </b>
                          <button type="button" onClick={() => bump(i, 1)} disabled={l.qty >= MAX_QTY} aria-label={`One more ${lineLabel(l)}`}>
                            +
                          </button>
                        </span>
                        <span className={s.price}>
                          {l.kind === "drink" ? euro(Math.round((drinkUnitPrice(l) ?? 0) * 100) * l.qty) : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className={s.total}>
                  <span>
                    {itemCount(lines)} {itemCount(lines) === 1 ? "item" : "items"}
                  </span>
                  <b>{euro(total)}</b>
                </p>
                {snacksIn && <p className={s.small}>Plus the cabinet items, priced at the hatch.</p>}
              </div>

              <div className={s.block}>
                <label className={s.select}>
                  <span>Ready for</span>
                  <select value={slot} onChange={(e) => setSlot(e.target.value)} disabled={!slots?.open}>
                    {slots?.open ? (
                      <>
                        <option value="asap">As soon as it&rsquo;s made (about {fmt(slots.asapAt)})</option>
                        {slots.slots.map((m) => (
                          <option key={m} value={m}>
                            {fmt(m)}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="asap">—</option>
                    )}
                  </select>
                </label>
                <label className={s.select}>
                  <span>Name for the order</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={40} placeholder="The barista calls it out" />
                </label>
              </div>

              {slots && !slots.open && (
                <p className={s.closed} role="note">
                  {shortName(location)} is closed right now. Orders open {whenLabel(slots.opens)}.
                </p>
              )}
              {error && <p className={s.closed}>{error}</p>}

              <button className={`btn ${s.place}`} type="submit" disabled={!canOrder}>
                {busy ? "Sending…" : lines.length ? `Place order · ${euro(total)}` : "Place order"}
              </button>
              <p className={s.small}>You pay at the hatch, card or cash. Show your Fallow Club card for your stamp.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
