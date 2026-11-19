import type { Metadata, Viewport } from "next";
import { Amatic_SC, Cinzel, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

// Sign + seal lettering: Cinzel, a Trajan-style capital close to the gold serif on the facade panel.
// Only the body face is preloaded, so the hero text paints straight away; the rest swap in.
const cinzel = Cinzel({ subsets: ["latin"], display: "swap", variable: "--font-cinzel", preload: false });
// Headlines: Cormorant Garamond, the classic, slightly old-world voice of the sign in lower case.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
  preload: false,
});
// Chalkboards: Amatic SC is the tall, narrow hand-drawn capital they chalk the menu in.
const amatic = Amatic_SC({ subsets: ["latin"], weight: ["700"], display: "swap", variable: "--font-amatic", preload: false });
// Body text.
const jost = Jost({ subsets: ["latin"], display: "swap", variable: "--font-jost" });

export const metadata: Metadata = {
  title: "The Coffee Shot · Beacon South Quarter, Sandyford",
  description:
    "Speciality coffees & teas freshly made to order, on the Plaza at Beacon South Quarter, Sandyford, Dublin 18. Badger & Dodo coffee, Suki tea, sandwiches and a terrace on the square.",
  metadataBase: new URL(process.env.APP_BASE_URL || "http://localhost:3000"),
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  robots: { index: false, follow: false }, // concept demo
};

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE" className={`${cinzel.variable} ${cormorant.variable} ${amatic.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
