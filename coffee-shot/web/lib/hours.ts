import loc from "@/data/location.json";

export const LOCATION = loc;
export type Location = typeof loc;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
 * Demo override: ?at=sun-16:45 or ?at=11:30 (today) pins the clock so the
 * open / closing soon / closed states can be shown at any hour.
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

/** Opening range for a weekday (0 = Sunday), or null when closed all day. */
export function rangeFor(day: number): [number, number] | null {
  const r = (loc.hours as Record<string, string | null>)[DAY_KEYS[day]];
  if (!r) return null;
  const [a, b] = r.split("-");
  return [toMin(a), toMin(b)];
}

export const fmt = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export type Status =
  | { open: true; closesAt: number; minutesLeft: number }
  | { open: false; opensDay: number; opensAt: number; dayOffset: number };

export function statusOf(now: DublinNow): Status {
  const today = rangeFor(now.day);
  if (today && now.minutes >= today[0] && now.minutes < today[1]) {
    return { open: true, closesAt: today[1], minutesLeft: today[1] - now.minutes };
  }
  for (let off = 0; off <= 7; off++) {
    const d = (now.day + off) % 7;
    const r = rangeFor(d);
    if (!r) continue;
    if (off === 0 && now.minutes >= r[0]) continue;
    return { open: false, opensDay: d, opensAt: r[0], dayOffset: off };
  }
  return { open: false, opensDay: now.day, opensAt: 0, dayOffset: 7 };
}

export function whenLabel(s: Extract<Status, { open: false }>) {
  const day = s.dayOffset === 0 ? "today" : s.dayOffset === 1 ? "tomorrow" : DAY_LONG[s.opensDay];
  return `${day} at ${fmt(s.opensAt)}`;
}

/** The one line under the hero. */
export function headline(now: DublinNow) {
  const s = statusOf(now);
  if (s.open) {
    const soon = s.minutesLeft <= 30;
    return {
      tone: soon ? ("soon" as const) : ("open" as const),
      text: soon ? "Closing soon" : "Open now on the Plaza",
      detail: soon ? `last orders before ${fmt(s.closesAt)}` : `till ${fmt(s.closesAt)}`,
    };
  }
  return { tone: "closed" as const, text: "Closed right now", detail: `Back ${whenLabel(s)}` };
}

/** Week rows grouped the way a door sign reads: Mon–Fri, Sat, Sun. */
export function weekRows() {
  return [
    { label: "Monday – Friday", days: [1, 2, 3, 4, 5], range: loc.hours.mon },
    { label: "Saturday", days: [6], range: loc.hours.sat },
    { label: "Sunday", days: [0], range: loc.hours.sun },
  ].map((r) => ({ ...r, text: r.range ? r.range.replace("-", " – ") : "Closed" }));
}

/** The exact listing the café shared (Google Maps short link). */
export const mapsUrl = loc.maps_url;
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat}%2C${loc.lng}`;

/**
 * Where people can leave a Google review. Swap for
 * https://search.google.com/local/writereview?placeid=... once the Place ID is confirmed.
 */
export const reviewUrl = loc.maps_url;
