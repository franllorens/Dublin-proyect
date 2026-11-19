"use client";

import { useEffect, useRef, useState } from "react";
import { demoJoin, demoRedeem, demoStamp } from "@/lib/demo-store";
import { loadGsap, reducedMotion, whenNear } from "@/lib/motion";
import { Phone, type PhoneHandle } from "./Phone";
import { GOAL, type PassData } from "./Pass";
import s from "./Club.module.css";

type Links = { apple: string; google: string | null };
const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const ua = () => (typeof navigator === "undefined" ? "" : navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/.test(ua()) || (ua().includes("Mac") && "ontouchend" in document);
const isAndroid = () => /Android/.test(ua());

export function Club({ live }: { live: boolean }) {
  const phone = useRef<PhoneHandle>(null);
  const section = useRef<HTMLElement>(null);
  const [name, setName] = useState("");
  const [pass, setPass] = useState<PassData | null>(null);
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState<Links | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const [isDemo, setIsDemo] = useState(!live);

  // Warm GSAP up before the visitor reaches the phone.
  useEffect(() => (section.current ? whenNear(section.current, () => void loadGsap(), "600px 0px") : undefined), []);

  const showPhone = () =>
    phone.current?.el?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });

  async function join(kind: "apple" | "google") {
    if (busy) return;
    const first = name.trim() || "Friend";
    setBusy(true);
    setNotice(null);
    let data: PassData | null = null;
    let got: Links | null = null;
    if (live) {
      try {
        const r = await fetch("/api/club/join", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tenant: "fallow", firstName: first }),
        });
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as { serial: string; apple: string; google: string | null };
        data = { serial: j.serial, name: first, stamps: 1, reward: false };
        got = { apple: j.apple, google: j.google };
        setIsDemo(false);
      } catch {
        setNotice("Couldn't reach the club server, so this one is a demo card.");
      }
    }
    if (!data) {
      const c = demoJoin(first);
      data = { serial: c.serial, name: c.name, stamps: c.stamps, reward: c.reward };
      setIsDemo(true);
    }
    setPass(data);
    setLinks(got);
    showPhone();
    await frame();
    // Real card: hand the pass to the phone's own wallet
    if (got) {
      if (kind === "apple" && isIOS()) window.setTimeout(() => (window.location.href = got!.apple), 700);
      if (kind === "google" && isAndroid() && got.google) window.setTimeout(() => (window.location.href = got!.google!), 700);
    }
    await phone.current?.addCard();
    setSaid(`${kind === "apple" ? "Apple" : "Google"} Wallet card added for ${first}. 1 of ${GOAL} stamps: the first one is on us.`);
    await phone.current?.lock("Fallow Club", `Your Fallow card: 1/${GOAL}`);
    setBusy(false);
  }

  async function stamp() {
    if (!pass || busy) return;
    setBusy(true);
    let next: PassData;
    if (isDemo) {
      const r = demoStamp(pass.serial, { force: true, location: null });
      next = r.ok ? { ...pass, stamps: r.card.stamps, reward: r.card.reward } : pass;
    } else {
      // Real cards only get stamped from the barista scanner; this just plays it on the mock.
      const st = Math.min(GOAL, pass.stamps + 1);
      next = { ...pass, stamps: st, reward: st >= GOAL };
    }
    setPass(next);
    await frame();
    await phone.current?.stamp(next.stamps - 1);
    phone.current?.notify("Fallow Club", `Your Fallow card: ${next.reward ? "FREE" : `${next.stamps}/${GOAL}`}`);
    setSaid(next.reward ? `Stamped. ${GOAL} of ${GOAL}: free coffee ready.` : `Stamped. ${next.stamps} of ${GOAL}.`);
    setBusy(false);
  }

  async function redeem() {
    if (!pass || busy) return;
    if (isDemo) demoRedeem(pass.serial);
    const next = { ...pass, stamps: 0, reward: false };
    setPass(next);
    phone.current?.notify("Fallow Club", `Your Fallow card: 0/${GOAL}`);
    setSaid("Free coffee redeemed. The card starts again.");
  }

  function reset() {
    setPass(null);
    setLinks(null);
    setSaid("Card removed from the preview.");
  }

  return (
    <section ref={section} className={s.section} id="club" aria-labelledby="club-title">
      <div className={`wrap ${s.grid}`}>
        <header className={s.head}>
          <h2 id="club-title">Nine stamps, then a coffee on us.</h2>
          <p>
            Fallow Club is a stamp card that lives in Apple Wallet or Google Wallet, next to your boarding passes. No app
            to download, no paper card to lose in the car.
          </p>
        </header>

        <ol className={s.rules}>
          <li>
            <b>1</b>
            <span>stamp on the house when you join</span>
          </li>
          <li>
            <b>+1</b>
            <span>for every coffee, at any of the three hatches</span>
          </li>
          <li>
            <b>+1</b>
            <span>when you share your cup to your story, once a week</span>
          </li>
          <li>
            <b>9</b>
            <span>stamps and the next coffee is free</span>
          </li>
        </ol>

        <div className={s.stage}>
          <Phone ref={phone} pass={pass} />
        </div>

        <div className={s.controls}>
          <p className="sr-only" role="status" aria-live="polite">
            {said}
          </p>
          {!pass ? (
            <form
              className={s.form}
              onSubmit={(e) => {
                e.preventDefault();
                const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
                void join(submitter?.value === "google" ? "google" : "apple");
              }}
            >
              <label className={s.field}>
                <span>Your first name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                  maxLength={40}
                  placeholder="It goes on the card"
                />
              </label>
              <div className={s.walletBtns}>
                <button className={`btn btn--black ${s.wbtn}`} type="submit" value="apple" disabled={busy}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  Add to Apple Wallet
                </button>
                <button className={`btn btn--black ${s.wbtn}`} type="submit" value="google" disabled={busy}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z M4 8l3-4h10l3 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                  Save to Google Wallet
                </button>
              </div>
              <p className={s.mode}>
                {live
                  ? "Creates a real Fallow Club card. On iPhone it opens Apple Wallet, on Android Google Wallet."
                  : "Demo mode: this plays on the page only. No card is created and nothing is sent."}
              </p>
            </form>
          ) : (
            <div className={s.after}>
              {pass.reward ? (
                <button className={`btn ${s.big}`} type="button" onClick={redeem} disabled={busy}>
                  Redeem the free coffee
                </button>
              ) : (
                <button className={`btn ${s.big}`} type="button" onClick={stamp} disabled={busy}>
                  <span className={s.stampIcon} aria-hidden="true" />
                  Be the barista: stamp a coffee
                </button>
              )}
              <p className={s.mode}>
                {pass.reward
                  ? "That's nine. The barista scans it once more to give the free one."
                  : "Each tap is one coffee at the hatch. Watch the seal land."}{" "}
                {!isDemo && "Real stamps come from the barista's scanner; this button only plays it on the preview."}
              </p>
              {links && (
                <p className={s.links}>
                  Card didn&rsquo;t open?{" "}
                  <a href={links.apple}>Add to Apple Wallet</a>
                  {links.google && (
                    <>
                      {" · "}
                      <a href={links.google}>Save to Google Wallet</a>
                    </>
                  )}
                </p>
              )}
              <button type="button" className={s.reset} onClick={reset}>
                Start over
              </button>
            </div>
          )}
          {notice && <p className={s.notice}>{notice}</p>}
          <p className={s.fine}>
            Card preview. The live card shows the count as text today (4/9); the drawn stamp strip is the backend&rsquo;s next
            step.
          </p>
        </div>
      </div>
    </section>
  );
}
