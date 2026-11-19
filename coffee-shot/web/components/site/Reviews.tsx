"use client";

import { useId, useState } from "react";
import { LOCATION, reviewUrl } from "@/lib/hours";
import { demoLog } from "@/lib/demo-store";
import s from "./Reviews.module.css";

/**
 * Google's rules: no incentives for reviews and no review gating. So both doors are
 * always shown, side by side, to everyone, and neither one is rewarded.
 */
export function Reviews({ live }: { live: boolean }) {
  const where = LOCATION.slug;
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState<"no" | "sending" | "yes" | "error">("no");
  const formId = useId();

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;
    setSent("sending");
    demoLog({ t: Date.now(), type: "feedback", location: where });
    if (live) {
      try {
        const r = await fetch("/api/feedback", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tenant: "coffeeshot", location: where, message: msg }),
        });
        if (!r.ok) throw new Error();
      } catch {
        setSent("error");
        return;
      }
    }
    setSent("yes");
  }

  return (
    <section className={s.section} id="reviews" aria-labelledby="reviews-title">
      <div className={`wrap ${s.grid}`}>
        <header className={s.head}>
          <h2 id="reviews-title">How was your coffee?</h2>
          <p>Good or bad, we read every word. It&rsquo;s the biggest help a small café can get.</p>
        </header>

        <div className={s.box}>

          <div className={s.doors}>
            <a
              className={`btn ${s.door}`}
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => demoLog({ t: Date.now(), type: "review_tap", location: where })}
            >
              Review us on Google
              <span className="sr-only">(opens Google Maps in a new tab)</span>
              <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                <path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </a>
            <button
              type="button"
              className={`btn btn--ghost ${s.door}`}
              aria-expanded={open}
              aria-controls={formId}
              onClick={() => setOpen((o) => !o)}
            >
              Tell the team privately
            </button>
          </div>

          <div id={formId} hidden={!open}>
            {sent === "yes" ? (
              <p className={s.thanks} role="status">
                {live
                  ? "Thanks. That goes straight to the team behind the counter."
                  : "Thanks. On the live site this goes straight to the team; in this demo it stays on the page."}
              </p>
            ) : (
              <form className={s.form} onSubmit={send}>
                <label htmlFor={`${formId}-m`}>What should we know?</label>
                <textarea id={`${formId}-m`} rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={1200} required />
                <div className={s.formRow}>
                  <button className="btn" type="submit" disabled={sent === "sending"}>
                    {sent === "sending" ? "Sending…" : "Send to the team"}
                  </button>
                  {!live && <span className={s.small}>Demo: nothing leaves this page.</span>}
                </div>
                {sent === "error" && (
                  <p className={s.small} role="alert">
                    That didn&rsquo;t go through. Try again, or tell us at the counter.
                  </p>
                )}
              </form>
            )}
          </div>

          <p className={s.rule}>
            Everyone sees both options, whatever kind of day they had. There&rsquo;s no stamp or reward for a review.
          </p>
        </div>
      </div>
    </section>
  );
}
