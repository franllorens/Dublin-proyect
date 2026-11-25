"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/brand/Logo";
import { LOCATIONS, shortName } from "@/lib/hours";
import { api } from "@/lib/mode";
import { RULES, demoRedeem, demoStamp, serverSnapshot, snapshot, subscribe, type DemoEvent } from "@/lib/demo-store";
import s from "./Staff.module.css";

export type StaffMember = { id: string; name: string; location: string };

type Result = {
  tone: "ok" | "reward" | "warn" | "error";
  title: string;
  detail: string;
  serial?: string;
  canRedeem?: boolean;
};
type FeedItem = { t: number; text: string; tone: Result["tone"] };

const fmtTime = (t: number) =>
  new Intl.DateTimeFormat("en-IE", { timeZone: "Europe/Dublin", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(t);
const isToday = (t: number) => new Date(t).toDateString() === new Date().toDateString();

type Detector = { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

export function StaffApp({ live }: { live: boolean }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loc, setLoc] = useState(LOCATIONS[0].slug);
  const [staffId, setStaffId] = useState("");
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");
  const [cam, setCam] = useState<"off" | "starting" | "on" | "error">("off");
  const [camMsg, setCamMsg] = useState("");
  const [liveFeed, setLiveFeed] = useState<FeedItem[]>([]);
  const video = useRef<HTMLVideoElement>(null);
  const stopScan = useRef<() => void>(() => {});
  const lastScan = useRef({ v: "", t: 0 });

  const store = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  // live mode: baristas per location come from the wallet API
  useEffect(() => {
    if (!live) return;
    fetch(api("/api/club/staff?tenant=fallow"))
      .then((r) => (r.ok ? r.json() : []))
      .then((list: StaffMember[]) => setStaff(Array.isArray(list) ? list : []))
      .catch(() => setStaff([]));
  }, [live]);

  // remember the hatch on this device
  useEffect(() => {
    try {
      const l = localStorage.getItem("fallow-staff-loc");
      if (l && LOCATIONS.some((x) => x.slug === l)) setLoc(l);
      const p = sessionStorage.getItem("fallow-staff-pin");
      if (p) setPin(p);
    } catch {
      /* storage blocked */
    }
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/staff-sw.js", { scope: "/staff" }).catch(() => {});
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("fallow-staff-loc", loc);
    } catch {
      /* ignore */
    }
    const here = staff.filter((m) => m.location === loc);
    setStaffId((cur) => (here.some((m) => m.id === cur) ? cur : here[0]?.id ?? ""));
  }, [loc, staff]);

  const show = useCallback((r: Result) => {
    setResult(r);
    try {
      navigator.vibrate?.(r.tone === "ok" || r.tone === "reward" ? 70 : [50, 60, 50]);
    } catch {
      /* ignore */
    }
    if (live) setLiveFeed((f) => [{ t: Date.now(), text: `${r.title} · ${r.detail}`, tone: r.tone }, ...f].slice(0, 40));
  }, [live]);

  const handle = useCallback(
    async (raw: string) => {
      const serial = raw.trim().toUpperCase();
      if (!serial || busy) return;
      setBusy(true);
      try {
        if (!live) {
          const r = demoStamp(serial, { location: loc });
          if (r.ok) {
            show({
              tone: r.card.reward ? "reward" : "ok",
              title: r.card.reward ? "Free coffee unlocked" : `Stamped · ${r.card.stamps}/${RULES.goal}`,
              detail: r.card.reward ? `${r.card.name} has ${RULES.goal}/${RULES.goal}. Next one is free.` : r.message,
              serial,
            });
          } else {
            show({
              tone: r.reason === "not_found" ? "error" : "warn",
              title: r.reason === "cooldown" ? "Already stamped" : r.reason === "card_full" ? "Free coffee waiting" : "Not a club card",
              detail: r.message,
              serial,
              canRedeem: r.reason === "card_full",
            });
          }
          return;
        }
        if (!staffId || !pin) {
          show({ tone: "error", title: "Sign in first", detail: "Pick your name and type your PIN at the top." });
          return;
        }
        const res = await fetch(api("/api/club/stamp"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ serial, staffId, pin }),
        });
        const j = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; stamps?: number; reward?: boolean; reason?: string; error?: string };
        if (res.status === 401) show({ tone: "error", title: "Wrong PIN", detail: "Check the PIN and try again." });
        else if (j.ok) show({ tone: j.reward ? "reward" : "ok", title: j.reward ? "Free coffee unlocked" : `Stamped · ${j.stamps}/${RULES.goal}`, detail: j.message ?? "", serial });
        else
          show({
            tone: j.reason === "not_found" ? "error" : "warn",
            title: j.reason === "cooldown" ? "Already stamped" : j.reason === "card_full" ? "Free coffee waiting" : "Couldn't stamp",
            detail: j.message ?? j.error ?? "Try again.",
            serial,
            canRedeem: j.reason === "card_full",
          });
      } catch {
        show({ tone: "error", title: "No connection", detail: "The stamp didn't go through. Try again in a moment." });
      } finally {
        setBusy(false);
      }
    },
    [busy, live, loc, pin, show, staffId],
  );

  async function redeem(serial: string) {
    setBusy(true);
    try {
      if (!live) {
        const r = demoRedeem(serial, loc);
        show(r.ok ? { tone: "ok", title: "Redeemed", detail: r.message } : { tone: "warn", title: "Nothing to redeem", detail: r.message });
        return;
      }
      const res = await fetch(api("/api/club/redeem"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serial, staffId, pin }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
      if (res.status === 401) show({ tone: "error", title: "Wrong PIN", detail: "Check the PIN and try again." });
      else show(j.ok ? { tone: "ok", title: "Redeemed", detail: j.message ?? "" } : { tone: "warn", title: "Nothing to redeem", detail: j.message ?? j.error ?? "" });
    } catch {
      show({ tone: "error", title: "No connection", detail: "The redeem didn't go through. Try again." });
    } finally {
      setBusy(false);
    }
  }

  // ── camera ────────────────────────────────────────────────
  const onCode = useCallback(
    (v: string) => {
      const now = Date.now();
      if (v === lastScan.current.v && now - lastScan.current.t < 4000) return; // same card held up
      lastScan.current = { v, t: now };
      void handle(v);
    },
    [handle],
  );
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  async function startCamera() {
    setCam("starting");
    setCamMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      const v = video.current!;
      v.srcObject = stream;
      await v.play();
      setCam("on");
      let stopped = false;
      const W = window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector };
      if (W.BarcodeDetector) {
        const det = new W.BarcodeDetector({ formats: ["qr_code"] });
        const loop = async () => {
          if (stopped) return;
          try {
            const codes = await det.detect(v);
            if (codes[0]?.rawValue) onCodeRef.current(codes[0].rawValue);
          } catch {
            /* frame not ready */
          }
          window.setTimeout(loop, 180);
        };
        loop();
        stopScan.current = () => {
          stopped = true;
          stream.getTracks().forEach((t) => t.stop());
        };
      } else {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromVideoElement(v, (res) => {
          if (res) onCodeRef.current(res.getText());
        });
        stopScan.current = () => {
          controls.stop();
          stream.getTracks().forEach((t) => t.stop());
        };
      }
    } catch (e) {
      setCam("error");
      setCamMsg(
        (e as Error)?.name === "NotAllowedError"
          ? "Camera blocked. Allow it in the browser settings, or type the card number below."
          : "No camera here. Type the card number below, or use a demo card.",
      );
    }
  }
  function stopCamera() {
    stopScan.current();
    setCam("off");
  }
  useEffect(() => () => stopScan.current(), []);

  // ── feed ──────────────────────────────────────────────────
  const demoFeed: FeedItem[] = live
    ? []
    : (store.events as DemoEvent[])
        .filter((e) => isToday(e.t) && "location" in e && e.location === loc && (e.type === "stamp" || e.type === "redeem" || e.type === "blocked"))
        .reverse()
        .slice(0, 40)
        .map((e) => ({
          t: e.t,
          tone: e.type === "blocked" ? "warn" : "ok",
          text:
            e.type === "stamp"
              ? `${e.name} · +1 · ${e.stamps}/${RULES.goal}`
              : e.type === "redeem"
                ? `${e.name} · free coffee redeemed`
                : e.type === "blocked"
                  ? `${e.name} · ${e.reason === "cooldown" ? "double scan blocked" : "card full, redeem first"}`
                  : "",
        }));
  const feed = live ? liveFeed : demoFeed;
  const stampsToday = feed.filter((f) => f.text.includes("+1")).length;
  const cards = Object.values(store.cards);
  const here = staff.filter((m) => m.location === loc);
  const locName = shortName(LOCATIONS.find((l) => l.slug === loc)!);

  return (
    <div className={s.app}>
      <header className={s.top}>
        <Link href="/" className={s.brand} >
          <Wordmark className={s.mark} title="fallow" />
          <span>Barista</span>
          <span className="sr-only"> (back to the site)</span>
        </Link>
        <span className={s.mode} data-live={live}>
          {live ? "Live" : "Demo"}
        </span>
      </header>

      <main className={s.main}>
        <fieldset className={s.locs}>
          <legend>Which hatch are you at?</legend>
          <div className={s.seg}>
            {LOCATIONS.map((l) => (
              <label key={l.slug}>
                <input type="radio" name="loc" value={l.slug} checked={loc === l.slug} onChange={() => setLoc(l.slug)} />
                <span>{shortName(l)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {live && (
          <div className={s.signin}>
            <label>
              <span>Barista</span>
              <select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
                {here.length === 0 && <option value="">No staff set up here</option>}
                {here.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>PIN</span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  try {
                    sessionStorage.setItem("fallow-staff-pin", e.target.value);
                  } catch {
                    /* ignore */
                  }
                }}
              />
            </label>
          </div>
        )}

        <section className={s.scanner} aria-label="Scanner">
          <video ref={video} className={s.video} playsInline muted data-on={cam === "on"} />
          <div className={s.frame} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          {cam !== "on" ? (
            <div className={s.camIdle}>
              <button type="button" className={`btn btn--pink ${s.scanBtn}`} onClick={startCamera} disabled={cam === "starting"}>
                {cam === "starting" ? "Opening camera…" : "Scan a card"}
              </button>
              {camMsg && <p className={s.camMsg}>{camMsg}</p>}
            </div>
          ) : (
            <button type="button" className={s.stop} onClick={stopCamera}>
              Stop camera
            </button>
          )}
        </section>

        <div className={s.result} data-tone={result?.tone ?? "idle"} role="status" aria-live="assertive">
          {result ? (
            <>
              <p className={s.rTitle}>{result.title}</p>
              <p className={s.rDetail}>{result.detail}</p>
              {(result.canRedeem || result.tone === "reward") && result.serial && (
                <button type="button" className={`btn ${s.redeem}`} onClick={() => redeem(result.serial!)} disabled={busy}>
                  Redeem free coffee
                </button>
              )}
            </>
          ) : (
            <p className={s.rIdle}>Hold the customer&rsquo;s card up to the camera.</p>
          )}
        </div>

        <form
          className={s.manual}
          onSubmit={(e) => {
            e.preventDefault();
            void handle(manual);
            setManual("");
          }}
        >
          <label htmlFor="serial">Card number</label>
          <div>
            <input id="serial" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="FLW-…" autoCapitalize="characters" autoComplete="off" />
            <button className="btn btn--cream" type="submit" disabled={busy || !manual.trim()}>
              Stamp
            </button>
          </div>
        </form>

        {!live && (
          <section className={s.demo} aria-labelledby="demo-cards">
            <h2 id="demo-cards">Demo cards</h2>
            <p>Tap one to scan it. Cards you add on the site show up here too.</p>
            <ul>
              {cards.map((c) => (
                <li key={c.serial}>
                  <button type="button" onClick={() => handle(c.serial)} disabled={busy}>
                    <span>{c.name}</span>
                    <b>{c.reward ? "FREE" : `${c.stamps}/${RULES.goal}`}</b>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={s.feed} aria-labelledby="feed-title">
          <h2 id="feed-title">
            Today at {locName}
            <span>
              {stampsToday} {stampsToday === 1 ? "stamp" : "stamps"}
            </span>
          </h2>
          {feed.length === 0 ? (
            <p className={s.empty}>Nothing scanned yet today.</p>
          ) : (
            <ol>
              {feed.map((f, i) => (
                <li key={i} data-tone={f.tone}>
                  <time>{fmtTime(f.t)}</time>
                  <span>{f.text}</span>
                </li>
              ))}
            </ol>
          )}
          <p className={s.note}>One stamp per card every {RULES.cooldownMinutes} minutes, so a double scan in the rush can&rsquo;t give coffee away.</p>
          {live && <p className={s.note}>The feed shows scans from this device.</p>}
        </section>
      </main>
    </div>
  );
}
