"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { loadGsap, reducedMotion } from "@/lib/motion";
import { Pass, type PassData } from "./Pass";
import s from "./Phone.module.css";

export type PhoneHandle = {
  /** Card springs into the Wallet stack, then the lock screen shows the welcome notification. */
  addCard: () => Promise<void>;
  /** Animates the seal landing in slot `index`. Call after the pass re-renders with the new count. */
  stamp: (index: number) => Promise<void>;
  /** Drop-down notification banner. */
  notify: (title: string, body: string) => void;
  /** Full lock screen with one notification. */
  lock: (title: string, body: string, ms?: number) => Promise<void>;
  el: HTMLDivElement | null;
};

function clockText() {
  const f = new Intl.DateTimeFormat("en-IE", { timeZone: "Europe/Dublin", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const d = new Intl.DateTimeFormat("en-IE", { timeZone: "Europe/Dublin", weekday: "long", day: "numeric", month: "long" });
  const now = new Date();
  return { time: f.format(now), date: d.format(now) };
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 40 40" className={s.appIcon} aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#111" />
      <rect x="7" y="9" width="26" height="8" rx="2" fill="#4cb3d4" />
      <rect x="7" y="13" width="26" height="8" rx="2" fill="#f2b33d" />
      <rect x="7" y="17" width="26" height="8" rx="2" fill="#e9534d" />
      <rect x="7" y="21" width="26" height="11" rx="2.5" fill="#2e2e30" />
    </svg>
  );
}

export const Phone = forwardRef<PhoneHandle, { pass: PassData | null }>(function Phone({ pass }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const lockEl = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState({ title: "", body: "" });
  const [lockNote, setLockNote] = useState({ title: "", body: "" });
  const [clock, setClock] = useState({ time: "11:30", date: "Wednesday 19 November" });
  const bannerTimer = useRef<number>();

  useImperativeHandle(ref, () => ({
    el: root.current,
    async addCard() {
      const c = card.current;
      if (!c) return;
      if (reducedMotion()) return;
      const { gsap } = await loadGsap();
      const others = stack.current?.querySelectorAll("[data-generic]");
      gsap.killTweensOf(c);
      const tl = gsap.timeline();
      tl.fromTo(
        c,
        { y: "115%", rotation: 5, scale: 0.9, opacity: 1 },
        { y: 0, rotation: 0, scale: 1, duration: 1.25, ease: "elastic.out(1, 0.62)" },
      );
      if (others?.length) tl.fromTo(others, { y: 0, scale: 1 }, { y: -8, scale: 0.97, duration: 0.5, ease: "back.out(2)", stagger: 0.04 }, 0.12);
      await tl;
    },
    async stamp(index: number) {
      const slot = card.current?.querySelector(`[data-slot="${index}"]`);
      const wrap = slot?.firstElementChild as HTMLElement | null;
      if (!slot || !wrap || reducedMotion()) return;
      const { gsap } = await loadGsap();
      const dots = slot.querySelectorAll("i");
      const tl = gsap.timeline();
      tl.fromTo(wrap, { scale: 2.6, opacity: 0, rotation: "-=35" }, { scale: 1, opacity: 1, rotation: "+=35", duration: 0.26, ease: "power4.in" })
        .to(card.current, { y: 3, duration: 0.06, ease: "power1.out", yoyo: true, repeat: 1 }, ">-0.02")
        .fromTo(wrap, { scale: 1 }, { scale: 1.08, duration: 0.08, yoyo: true, repeat: 1 }, "<")
        .fromTo(
          dots,
          { x: 0, opacity: 0.95, scale: 1 },
          { x: (i: number) => 18 + ((i * 7) % 9), opacity: 0, scale: 0.4, duration: 0.5, ease: "power2.out" },
          "<",
        );
      await tl;
    },
    notify(title: string, body: string) {
      setNote({ title, body });
      const b = banner.current;
      if (!b) return;
      window.clearTimeout(bannerTimer.current);
      b.dataset.show = "true";
      bannerTimer.current = window.setTimeout(() => (b.dataset.show = "false"), 2600);
    },
    async lock(title: string, body: string, ms = 2600) {
      setClock(clockText());
      setLockNote({ title, body });
      const l = lockEl.current;
      if (!l) return;
      l.dataset.show = "true";
      await new Promise((r) => setTimeout(r, ms));
      l.dataset.show = "false";
    },
  }));

  return (
    <div ref={root} className={s.phone} aria-hidden="true">
      <div className={s.screen}>
        <div className={s.status}>
          <span>{clock.time}</span>
          <span className={s.island} />
          <span className={s.icons}>
            <i />
            <i />
            <b />
          </span>
        </div>

        <div className={s.wallet}>
          <div className={s.walletHead}>
            <span>Wallet</span>
            <span className={s.plus}>+</span>
          </div>
          <div ref={stack} className={s.stack} data-has-pass={Boolean(pass)}>
            <div className={`${s.generic} ${s.g1}`} data-generic="">
              <span />
              <span />
            </div>
            <div className={`${s.generic} ${s.g2}`} data-generic="">
              <span />
              <span />
            </div>
            {pass ? (
              <Pass ref={card} data={pass} className={s.card} />
            ) : (
              <div className={s.empty}>
                <span>Your Fallow card lands here</span>
              </div>
            )}
          </div>
        </div>

        <div ref={banner} className={s.banner} data-show="false">
          <WalletIcon />
          <div>
            <p className={s.nTitle}>
              {note.title} <span>now</span>
            </p>
            <p className={s.nBody}>{note.body}</p>
          </div>
        </div>

        <div ref={lockEl} className={s.lock} data-show="false">
          <p className={s.lockDate}>{clock.date}</p>
          <p className={s.lockTime}>{clock.time}</p>
          <div className={s.lockNote}>
            <WalletIcon />
            <div>
              <p className={s.nTitle}>
                {lockNote.title} <span>now</span>
              </p>
              <p className={s.nBody}>{lockNote.body}</p>
            </div>
          </div>
          <span className={s.homebar} />
        </div>
      </div>
    </div>
  );
});
