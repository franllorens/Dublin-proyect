"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { demoSetOrderStatus, serverSnapshot, snapshot, subscribe } from "@/lib/demo-store";
import { api } from "@/lib/mode";
import { fmt, lineLabel, type Order, type OrderStatus } from "@/lib/order";
import s from "./Staff.module.css";

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  received: { to: "making", label: "Start making" },
  making: { to: "ready", label: "On the counter" },
  ready: { to: "collected", label: "Collected" },
};

const today = () => new Date().toDateString();

/** Order-ahead tickets for this hatch, earliest pickup first. */
export function OrdersQueue({ live, loc, locName, staffId, pin }: { live: boolean; loc: string; locName: string; staffId: string; pin: string }) {
  const store = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [remote, setRemote] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string> | null>(null);

  // live mode: poll the hatch's queue (PIN-checked on the server)
  useEffect(() => {
    if (!live || !staffId || !pin) return;
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch(api("/api/orders/queue"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ staffId, pin }),
        });
        if (r.status === 401) return setError("Wrong PIN: orders hidden.");
        if (!r.ok) throw new Error();
        const list = (await r.json()) as Order[];
        if (!stop) {
          setRemote(list);
          setError(null);
        }
      } catch {
        if (!stop) setError("Can't reach the order queue. Retrying…");
      }
    };
    load();
    const id = window.setInterval(load, 10000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [live, staffId, pin]);

  const orders = useMemo(
    () =>
      live
        ? remote
        : Object.values(store.orders)
            .filter((o) => o.location === loc && o.status !== "collected" && new Date(o.createdAt).toDateString() === today())
            .sort((a, b) => a.pickupAt - b.pickupAt || a.createdAt - b.createdAt),
    [live, remote, store, loc],
  );

  // flag and buzz for tickets that just arrived
  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id));
    if (seen.current) {
      const added = [...ids].filter((id) => !seen.current!.has(id));
      if (added.length) {
        setFresh((f) => new Set([...f, ...added]));
        try {
          navigator.vibrate?.([80, 60, 80]);
        } catch {
          /* ignore */
        }
        window.setTimeout(() => setFresh((f) => new Set([...f].filter((x) => !added.includes(x)))), 6000);
      }
    }
    seen.current = ids;
  }, [orders]);

  async function advance(o: Order) {
    const step = NEXT[o.status];
    if (!step) return;
    if (!live) {
      demoSetOrderStatus(o.id, step.to);
      return;
    }
    setRemote((list) => list.map((x) => (x.id === o.id ? { ...x, status: step.to } : x)).filter((x) => x.status !== "collected"));
    try {
      const r = await fetch(api(`/api/orders/${o.id}/status`), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ staffId, pin, status: step.to }),
      });
      if (!r.ok) throw new Error();
    } catch {
      setError("That update didn't go through. It'll refresh in a moment.");
    }
  }

  return (
    <section className={s.orders} aria-labelledby="orders-title">
      <h2 id="orders-title">
        Orders for {locName}
        <span>{orders.length ? `${orders.length} waiting` : "none waiting"}</span>
      </h2>
      {error && <p className={s.ordersError}>{error}</p>}
      {orders.length === 0 ? (
        <p className={s.empty}>New orders from the site land here, earliest pickup first.</p>
      ) : (
        <ol className={s.orderList} aria-live="polite">
          {orders.map((o) => {
            const step = NEXT[o.status];
            return (
              <li key={o.id} className={s.order} data-status={o.status} data-new={fresh.has(o.id)}>
                <div className={s.orderTop}>
                  <b className={s.orderNo}>{o.number}</b>
                  <span className={s.orderWho}>
                    {o.name}
                    <small>
                      {o.asap ? "ASAP · " : ""}
                      for {fmt(o.pickupAt)}
                    </small>
                  </span>
                  <span className={s.orderState}>{o.status === "received" ? "New" : o.status === "making" ? "Making" : "On the counter"}</span>
                </div>
                <ul className={s.orderLines}>
                  {o.lines.map((l, i) => (
                    <li key={i}>
                      <b>{l.qty}×</b> {lineLabel(l)}
                    </li>
                  ))}
                </ul>
                {step && (
                  <button type="button" className={`btn ${o.status === "ready" ? "btn--cream" : "btn--pink"} ${s.orderBtn}`} onClick={() => advance(o)}>
                    {step.label}
                    <span className="sr-only"> for order {o.number}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
