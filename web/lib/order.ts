import menu from "@/data/menu.json";
import { LOCATIONS, rangeFor, statusOf, fmt, type DublinNow, type Location } from "./hours";

/**
 * Order ahead: drinks carry the exact board prices from menu.json; cabinet items have
 * no published prices, so they're "priced at the hatch" and never invented here.
 * Payment happens at the hatch in this version.
 */

export type Temp = "hot" | "iced";
export type Milk = "regular" | "oat" | "coconut";
export type Syrup = "none" | "vanilla" | "caramel" | "hazelnut";

export type DrinkLine = {
  kind: "drink";
  name: string;
  temp: Temp;
  milk: Milk;
  extraShot: boolean;
  syrup: Syrup;
  qty: number;
};
export type SnackLine = { kind: "snack"; name: string; qty: number };
export type OrderLine = DrinkLine | SnackLine;

export type OrderStatus = "received" | "making" | "ready" | "collected";
export const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "making", label: "Making it" },
  { key: "ready", label: "On the counter" },
];

export type Order = {
  id: string;
  number: string; // what the barista calls out, e.g. "N-07"
  location: string;
  name: string;
  lines: OrderLine[];
  pickupAt: number; // minutes since midnight, Dublin
  asap: boolean;
  status: OrderStatus;
  createdAt: number;
};

export const DRINKS = menu.sections.flatMap((s) => s.items.map((i) => ({ ...i, section: s.name })));
export const SNACKS = menu.cabinet_no_prices;
const ADDON = Object.fromEntries(menu.addons.map((a) => [a.name.split(" (")[0].toLowerCase(), a.price]));
// "alt milk" 0.50 · "extra shot" 1.00 · "syrup" 0.50 (exact, from the board)

export const MAX_LINES = 8;
export const MAX_QTY = 6;

export function drinkUnitPrice(l: DrinkLine): number | null {
  const d = DRINKS.find((x) => x.name === l.name);
  if (!d) return null;
  const base = l.temp === "iced" ? d.iced : d.hot;
  if (base == null) return null;
  return (
    base +
    (l.milk !== "regular" ? ADDON["alt milk"] : 0) +
    (l.extraShot ? ADDON["extra shot"] : 0) +
    (l.syrup !== "none" ? ADDON["syrup"] : 0)
  );
}

/** Drinks total in cents (avoids float drift); cabinet items are not included. */
export function drinksTotal(lines: OrderLine[]) {
  return lines.reduce((sum, l) => (l.kind === "drink" ? sum + Math.round((drinkUnitPrice(l) ?? 0) * 100) * l.qty : sum), 0);
}

export const euro = (cents: number) => `€${(cents / 100).toFixed(2)}`;

export function lineLabel(l: OrderLine) {
  if (l.kind === "snack") return l.name;
  const extras = [
    l.temp === "iced" ? "iced" : null,
    l.milk !== "regular" ? `${l.milk} milk` : null,
    l.extraShot ? "extra shot" : null,
    l.syrup !== "none" ? `${l.syrup} syrup` : null,
  ].filter(Boolean);
  return extras.length ? `${l.name} (${extras.join(", ")})` : l.name;
}

export const itemCount = (lines: OrderLine[]) => lines.reduce((n, l) => n + l.qty, 0);

/** Pickup slots for today: ASAP (about 5 min) plus every 5 minutes for the next 90, inside opening hours. */
export function pickupSlots(loc: Location, now: DublinNow) {
  const st = statusOf(loc, now);
  if (!st.open) return { open: false as const, opens: st };
  const range = rangeFor(loc, now.day)!;
  const first = Math.ceil((now.minutes + 10) / 5) * 5;
  const last = Math.min(range[1] - 5, now.minutes + 90);
  const slots: number[] = [];
  for (let m = first; m <= last; m += 5) slots.push(m);
  const asapAt = Math.min(now.minutes + 5, range[1] - 1);
  return { open: true as const, asapAt, slots, closesAt: range[1] };
}

export const ORDER_LOCATIONS = LOCATIONS;
export const prefixFor = (slug: string) => (slug === "bizquip" ? "B" : slug === "nova" ? "N" : "K");
export { fmt };
