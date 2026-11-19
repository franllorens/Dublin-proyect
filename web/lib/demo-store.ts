"use client";

/**
 * Demo mode backend: lives in this browser only (localStorage + BroadcastChannel),
 * mirrors the rules of backend/fallow-wallet (goal 9, welcome stamp, 10-minute
 * cooldown on scans, one story stamp a week). Nothing leaves the page.
 */

export const RULES = { goal: 9, welcome: 1, cooldownMinutes: 10, storyPerWeek: 1 };

export type Source = "scan" | "welcome" | "story";
export type DemoCard = { serial: string; name: string; stamps: number; reward: boolean; lastStampAt: number | null; example?: boolean };
export type DemoEvent =
  | { t: number; type: "join"; serial: string; name: string }
  | { t: number; type: "stamp"; serial: string; name: string; source: Source; location: string | null; stamps: number }
  | { t: number; type: "redeem"; serial: string; name: string; location: string | null }
  | { t: number; type: "blocked"; serial: string; name: string; reason: string; location: string | null }
  | { t: number; type: "review_tap"; location: string }
  | { t: number; type: "feedback"; location: string | null };

type State = { cards: Record<string, DemoCard>; events: DemoEvent[] };

const KEY = "fallow-demo-v1";
const CH = "fallow-demo";

// A few example cards so the barista view has something to scan. Marked as examples.
const SEED: DemoCard[] = [
  { serial: "FLW-DEMO01", name: "Aoife (example)", stamps: 8, reward: false, lastStampAt: null, example: true },
  { serial: "FLW-DEMO02", name: "Conor (example)", stamps: 3, reward: false, lastStampAt: null, example: true },
  { serial: "FLW-DEMO03", name: "Niamh (example)", stamps: 9, reward: true, lastStampAt: null, example: true },
];

function fresh(): State {
  return { cards: Object.fromEntries(SEED.map((c) => [c.serial, { ...c }])), events: [] };
}

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    /* private mode or blocked storage: fall through */
  }
  return fresh();
}

let memory: State | null = null;
function load(): State {
  if (!memory) memory = typeof window === "undefined" ? fresh() : read();
  return memory;
}

let bc: BroadcastChannel | null = null;
const listeners = new Set<() => void>();

function save(s: State) {
  memory = s;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  try {
    bc ??= new BroadcastChannel(CH);
    bc.postMessage("changed");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      memory = read();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(CH);
    ch.onmessage = () => {
      memory = read();
      cb();
    };
  } catch {
    /* ignore */
  }
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
    ch?.close();
  };
}

export const snapshot = () => load();
const SERVER = fresh();
/** Stable state for SSR/hydration; the client snapshot takes over right after. */
export const serverSnapshot = () => SERVER;

const serialId = () => "FLW-" + Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

export function demoJoin(name: string) {
  const s = structuredClone(load());
  const serial = serialId();
  const now = Date.now();
  s.cards[serial] = { serial, name, stamps: RULES.welcome, reward: false, lastStampAt: null };
  s.events.push({ t: now, type: "join", serial, name });
  s.events.push({ t: now, type: "stamp", serial, name, source: "welcome", location: null, stamps: RULES.welcome });
  save(s);
  return s.cards[serial];
}

export type StampOutcome =
  | { ok: true; card: DemoCard; message: string }
  | { ok: false; reason: "not_found" | "cooldown" | "card_full" | "story_limit"; message: string; card?: DemoCard };

/** Same checks as src/lib/stamps.ts addStamp(). `force` skips the cooldown (the site's "play barista" button). */
export function demoStamp(serial: string, opts: { source?: Source; location?: string | null; force?: boolean } = {}): StampOutcome {
  const s = structuredClone(load());
  const c = s.cards[serial];
  const source = opts.source ?? "scan";
  const location = opts.location ?? null;
  if (!c) return { ok: false, reason: "not_found", message: "This card isn't in the club. Ask them to scan the QR to join." };
  if (c.reward) {
    s.events.push({ t: Date.now(), type: "blocked", serial, name: c.name, reason: "card_full", location });
    save(s);
    return { ok: false, reason: "card_full", message: `${c.name} has a free coffee waiting. Redeem it first.`, card: c };
  }
  if (source === "scan" && !opts.force && c.lastStampAt) {
    const mins = (Date.now() - c.lastStampAt) / 60000;
    if (mins < RULES.cooldownMinutes) {
      s.events.push({ t: Date.now(), type: "blocked", serial, name: c.name, reason: "cooldown", location });
      save(s);
      return {
        ok: false,
        reason: "cooldown",
        message: `Already stamped ${Math.floor(mins)} min ago. One stamp every ${RULES.cooldownMinutes} minutes.`,
        card: c,
      };
    }
  }
  c.stamps = Math.min(RULES.goal, c.stamps + 1);
  c.reward = c.stamps >= RULES.goal;
  if (source === "scan" && !opts.force) c.lastStampAt = Date.now();
  s.events.push({ t: Date.now(), type: "stamp", serial, name: c.name, source, location, stamps: c.stamps });
  save(s);
  return {
    ok: true,
    card: c,
    message: c.reward ? `${c.name} · ${c.stamps}/${RULES.goal} · free coffee unlocked` : `${c.name} · +1 · ${c.stamps}/${RULES.goal}`,
  };
}

export function demoRedeem(serial: string, location: string | null = null): StampOutcome {
  const s = structuredClone(load());
  const c = s.cards[serial];
  if (!c) return { ok: false, reason: "not_found", message: "Card not found." };
  if (!c.reward) return { ok: false, reason: "card_full", message: `${c.name} has ${c.stamps}/${RULES.goal}. Nothing to redeem yet.`, card: c };
  c.stamps = 0;
  c.reward = false;
  s.events.push({ t: Date.now(), type: "redeem", serial, name: c.name, location });
  save(s);
  return { ok: true, card: c, message: `Redeemed. ${c.name}'s card starts again.` };
}

export function demoLog(e: Extract<DemoEvent, { type: "review_tap" | "feedback" }>) {
  const s = structuredClone(load());
  s.events.push(e);
  save(s);
}

export function demoReset() {
  save(fresh());
}
