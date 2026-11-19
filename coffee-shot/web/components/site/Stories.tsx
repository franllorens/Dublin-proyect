"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Seal } from "@/components/brand/Seal";
import { ShotDefs, ShotGlass } from "@/components/club/Pass";
import { reducedMotion } from "@/lib/motion";
import { IG_HANDLE } from "@/lib/brand";
import photo from "@/assets/black-cup-plaza.jpg";
import s from "./Stories.module.css";


const STEPS = [
  { t: "You post your cup to your story", d: "The black cup, a cappuccino on the terrace, whatever you've got." },
  { t: "Instagram lets us know", d: `Tagging ${IG_HANDLE} sends us a mention.` },
  { t: "We DM you a link", d: "One tap, one time, just for you." },
  { t: "+1 shot on your card", d: "It lands in your Wallet. Once a week, per card." },
];

export function Sticker({ className }: { className?: string }) {
  return (
    <div className={`${s.sticker} ${className ?? ""}`}>
      <Seal id="sticker-seal" variant="line" className={s.stickerMark} />
      <span className={s.handle}>{IG_HANDLE}</span>
      <span className={s.ad}>#Ad</span>
    </div>
  );
}

export function Stories() {
  const [step, setStep] = useState(-1);
  const timer = useRef<number[]>([]);

  function play() {
    timer.current.forEach(clearTimeout);
    const frame = document.getElementById("story-frame");
    const r = frame?.getBoundingClientRect();
    if (frame && r && (r.top < 0 || r.bottom > window.innerHeight))
      frame.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    const gap = reducedMotion() ? 0 : 1300;
    if (!gap) return setStep(3);
    setStep(0);
    timer.current = [1, 2, 3].map((i) => window.setTimeout(() => setStep(i), i * gap));
  }

  return (
    <section className={s.section} id="stories" aria-labelledby="stories-title">
      <div className={`wrap ${s.grid}`}>
        <div className={s.copy}>
          <h2 id="stories-title">Share your cup, get a shot.</h2>
          <p className={s.lede}>
            Post your Coffee Shot cup to your Instagram story with our sticker. We&rsquo;ll send you a DM with a link, and a shot
            lands on your card.
          </p>

          <ol className={s.steps}>
            {STEPS.map((x, i) => (
              <li key={i} data-active={i === step} data-done={i < step} aria-current={i === step ? "step" : undefined}>
                <span className={s.n} aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <strong>{x.t}</strong>
                  <span>{x.d}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className={s.why}>
            <p>
              <strong>Why #Ad?</strong> You get a stamp for posting, so under Irish advertising guidance (CCPC and ASAI) the
              story should say it&rsquo;s an ad. The sticker does it for you.
            </p>
            <p className={s.fine}>
              One story stamp a week, per card. Story stamps switch on once Instagram approves the connection.{" "}
              <span className="placeholder">which Instagram is the official one? to confirm</span>
            </p>
          </div>
        </div>

        <div className={s.storyCol}>
          <div className={s.story} data-step={step} aria-hidden="true">
            <div className={s.storyFrame} id="story-frame">
              <Image src={photo} alt="" fill sizes="(min-width: 900px) 340px, 72vw" className={s.storyImg} />
              <div className={s.bars}>
                <i />
                <i />
              </div>
              <div className={s.who}>
                <span className={s.avatar} />
                <span>Your story</span>
                <span className={s.when}>now</span>
              </div>
              <Sticker className={s.onPhoto} />
              <div className={s.mention}>
                <span className={s.mDot} />
                Mentioned {IG_HANDLE}
              </div>
              <div className={s.dm}>
                <p className={s.dmFrom}>{IG_HANDLE.slice(1)}</p>
                <p>Thanks for sharing your cup! Here&rsquo;s your shot for this week.</p>
                <span className={s.dmLink}>Tap to add +1 shot</span>
              </div>
              <div className={s.plus}>
                <ShotDefs id="shot-inner-story" />
                <ShotGlass filled clipId="shot-inner-story" className={s.plusSeal} />
                <b>+1</b>
              </div>
              <span
                className="placeholder"
                style={{ position: "absolute", right: 10, top: 56, color: "#fff", background: "rgba(0,0,0,.45)" }}
              >
                Placeholder photo
              </span>
            </div>
          </div>
          <button type="button" className={`btn btn--gold ${s.play}`} onClick={play}>
            {step === 3 ? "Play it again" : "Show me how it works"}
          </button>
        </div>
      </div>
    </section>
  );
}
