import locationsData from "@/data/locations.json";

export type Location = (typeof locationsData)[number];
export const LOCATIONS: Location[] = locationsData;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Wall-clock time in Dublin, independent of the visitor's timezone. */
export type DublinNow = { day: number; minutes: number; date: Date };

export function dublinNow(date = new Date()): DublinNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = DAY_SHORT.indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")), date };
}

/**
 * Demo override: ?at=sat-11:30 or ?at=11:30 (today) pins the clock so the
 * hatch can be shown open or closed at any hour.
 */
export function nowFromOverride(search: string): DublinNow | null {
  const raw = new URLSearchParams(search).get("at");
  if (!raw) return null;
  const m = raw.toLowerCase().match(/^(?:(sun|mon|tue|wed|thu|fri|sat)[-_ ]?)?(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const base = dublinNow();
  const day = m[1] ? DAY_KEYS.indexOf(m[1] as (typeof DAY_KEYS)[number]) : base.day;
  return { day, minutes: Number(m[2]) * 60 + Number(m[3]), date: base.date };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Returns "07:30-15:00" style range for a weekday, or null when closed all day. */
export function rangeFor(loc: Location, day: number): [number, number] | null {
  const weekend = day === 0 || day === 6;
  const r = weekend ? loc.hours["sat-sun"] : loc.hours["mon-fri"];
  if (!r) return null;
  const [a, b] = r.split("-");
  return [toMin(a), toMin(b)];
}

export const fmt = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export type Status =
  | { open: true; closesAt: number; minutesLeft: number }
  | { open: false; opensDay: number; opensAt: number; dayOffset: number };

export function statusOf(loc: Location, now: DublinNow): Status {
  const today = rangeFor(loc, now.day);
  if (today && now.minutes >= today[0] && now.minutes < today[1]) {
    return { open: true, closesAt: today[1], minutesLeft: today[1] - now.minutes };
  }
  for (let off = 0; off <= 7; off++) {
    const d = (now.day + off) % 7;
    const r = rangeFor(loc, d);
    if (!r) continue;
    if (off === 0 && now.minutes >= r[0]) continue;
    return { open: false, opensDay: d, opensAt: r[0], dayOffset: off };
  }
  return { open: false, opensDay: now.day, opensAt: 0, dayOffset: 7 };
}

export function whenLabel(s: Extract<Status, { open: false }>) {
  const day = s.dayOffset === 0 ? "today" : s.dayOffset === 1 ? "tomorrow" : DAY_SHORT[s.opensDay];
  return `${day} at ${fmt(s.opensAt)}`;
}

export function hoursLabel(loc: Location) {
  const wk = loc.hours["mon-fri"]?.replace("-", "–");
  const we = loc.hours["sat-sun"]?.replace("-", "–");
  return { weekdays: wk ?? "Closed", weekends: we ?? "Closed" };
}

export const shortName = (loc: Location) => (loc.slug === "kilternan" ? "Kilternan" : loc.name);

const list = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/** The one sentence under the hero. */
export function headline(now: DublinNow) {
  const st = LOCATIONS.map((l) => ({ l, s: statusOf(l, now) }));
  const open = st.filter((x) => x.s.open) as { l: Location; s: Extract<Status, { open: true }> }[];
  if (open.length === LOCATIONS.length) {
    return { open: true, text: "All locations open. Come grab a coffee.", detail: "Sandyford till 15:00 · Kilternan till 15:30" };
  }
  if (open.length) {
    const closes = [...new Set(open.map((o) => o.s.closesAt))];
    const soon = open.every((o) => o.s.minutesLeft <= 30);
    const names = list(open.map((o) => shortName(o.l)));
    return {
      open: true,
      text: `${soon ? "Closing soon" : "Open now"} at ${names}`,
      detail: closes.length === 1 ? `till ${fmt(closes[0])}` : open.map((o) => `${shortName(o.l)} till ${fmt(o.s.closesAt)}`).join(" · "),
    };
  }
  const next = st
    .map((x) => ({ l: x.l, s: x.s as Extract<Status, { open: false }> }))
    .sort((a, b) => a.s.dayOffset * 1440 + a.s.opensAt - (b.s.dayOffset * 1440 + b.s.opensAt))[0];
  return { open: false, text: "Closed right now", detail: `Back ${whenLabel(next.s)} · ${shortName(next.l)}` };
}

/** Walking directions to the exact pin (order ahead: "walk down when it suits you"). */
export const directionsUrl = (loc: Location) =>
  `https://www.google.com/maps/dir/?api=1&destination=${loc.lat}%2C${loc.lng}&travelmode=walking`;

/** Exact pin from locations.json. */
export const mapsUrl = (loc: Location) => `https://www.google.com/maps/search/?api=1&query=${loc.lat}%2C${loc.lng}`;

/**
 * Google listing search, where people can leave a review. Swap for
 * https://search.google.com/local/writereview?placeid=... once the Place IDs are confirmed.
 */
export const reviewUrl = (loc: Location) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Fallow Speciality Coffee ${shortName(loc)}`)}`;
