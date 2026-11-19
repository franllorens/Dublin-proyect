/**
 * EXAMPLE DATA for the owner panel. Invented figures to show the layout; nothing here
 * comes from The Coffee Shot. Swap for queries against stamp_events / redemptions / customers.
 */
export const SAMPLE = {
  month: "November",
  members: 268,
  stamps: 1124,
  redeemed: 84,
  stories: 31,
  reviewTaps: 26,
  feedback: 5,
  savedUsual: 201,
  byHour: [
    { key: "7", label: "07:00–09:00", value: 298 },
    { key: "9", label: "09:00–11:00", value: 236 },
    { key: "11", label: "11:00–13:00", value: 214 },
    { key: "13", label: "13:00–15:00", value: 247 },
    { key: "15", label: "15:00–18:00", value: 129 },
  ],
  bySource: [
    { key: "scan", label: "Coffee at the counter", value: 1012 },
    { key: "welcome", label: "Welcome shot", value: 81 },
    { key: "story", label: "Instagram story", value: 31 },
  ],
  // What members saved as their usual (top six)
  usuals: [
    { label: "Flat white", value: 64 },
    { label: "Americano", value: 41 },
    { label: "Cappuccino", value: 37 },
    { label: "Matcha latte", value: 29 },
    { label: "Iced hazelnut", value: 18 },
    { label: "Speciality tea", value: 12 },
  ],
  // last 14 days, oldest first, ending Thursday 19 Nov; open 7 days, quieter at weekends
  daily: [
    { d: "Fri 6", v: 54 },
    { d: "Sat 7", v: 38 },
    { d: "Sun 8", v: 29 },
    { d: "Mon 9", v: 57 },
    { d: "Tue 10", v: 61 },
    { d: "Wed 11", v: 59 },
    { d: "Thu 12", v: 62 },
    { d: "Fri 13", v: 52 },
    { d: "Sat 14", v: 41 },
    { d: "Sun 15", v: 31 },
    { d: "Mon 16", v: 55 },
    { d: "Tue 17", v: 60 },
    { d: "Wed 18", v: 58 },
    { d: "Thu 19", v: 33 },
  ],
  oneAway: [
    { name: "Aoife M.", stamps: 8, last: "Yesterday", usual: "Oat flat white" },
    { name: "Conor B.", stamps: 8, last: "Today", usual: "Americano" },
    { name: "Ciara D.", stamps: 8, last: "Mon", usual: "Matcha latte" },
    { name: "Ruairí F.", stamps: 8, last: "Tue", usual: "Cappuccino" },
  ],
  oneAwayTotal: 17,
  lapsed: [
    { name: "Siobhán K.", stamps: 5, last: "28 Oct", usual: "Flat white" },
    { name: "Dev P.", stamps: 3, last: "21 Oct", usual: "Iced hazelnut" },
    { name: "Eoin O.", stamps: 6, last: "24 Oct", usual: "Americano" },
  ],
  lapsedTotal: 22,
};
