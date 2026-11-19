/**
 * EXAMPLE DATA for the owner panel. Invented figures to show the layout; nothing here
 * comes from Fallow. Swap for queries against stamp_events / redemptions / customers.
 */
export const SAMPLE = {
  month: "November",
  members: 412,
  stamps: 1846,
  redeemed: 138,
  stories: 57,
  reviewTaps: 41,
  feedback: 9,
  byLocation: [
    { slug: "bizquip", label: "Bizquip", value: 812 },
    { slug: "nova", label: "Nova Atria", value: 604 },
    { slug: "kilternan", label: "Kilternan", value: 430 },
  ],
  bySource: [
    { key: "scan", label: "Coffee at the hatch", value: 1671 },
    { key: "welcome", label: "Welcome stamp", value: 118 },
    { key: "story", label: "Instagram story", value: 57 },
  ],
  // last 14 days, oldest first; weekends are Kilternan only
  daily: [
    { d: "Thu 6", v: 141 },
    { d: "Fri 7", v: 128 },
    { d: "Sat 8", v: 39 },
    { d: "Sun 9", v: 33 },
    { d: "Mon 10", v: 118 },
    { d: "Tue 11", v: 137 },
    { d: "Wed 12", v: 146 },
    { d: "Thu 13", v: 152 },
    { d: "Fri 14", v: 131 },
    { d: "Sat 15", v: 44 },
    { d: "Sun 16", v: 37 },
    { d: "Mon 17", v: 124 },
    { d: "Tue 18", v: 143 },
    { d: "Wed 19", v: 98 },
  ],
  oneAway: [
    { name: "Aoife M.", stamps: 8, last: "Yesterday", where: "Bizquip" },
    { name: "Conor B.", stamps: 8, last: "Today", where: "Nova Atria" },
    { name: "Ciara D.", stamps: 8, last: "Mon", where: "Kilternan" },
    { name: "Ruairí F.", stamps: 8, last: "Mon", where: "Bizquip" },
  ],
  oneAwayTotal: 23,
  lapsed: [
    { name: "Siobhán K.", stamps: 5, last: "28 Oct", where: "Nova Atria" },
    { name: "Dev P.", stamps: 3, last: "21 Oct", where: "Bizquip" },
    { name: "Mark O.", stamps: 6, last: "24 Oct", where: "Kilternan" },
  ],
  lapsedTotal: 31,
};
