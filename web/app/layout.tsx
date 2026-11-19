import type { Metadata, Viewport } from "next";
import { Antonio, Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Display serif: Fraunces (OFL, Google Fonts), soft terminals + editorial contrast, the closest
// free match to the trailer sign. Instanced at SOFT 70 / opsz 72, weight 500–700: 33 KB instead of 118 KB.
const fraunces = localFont({
  src: "./fonts/fraunces-soft70-opsz72.woff2",
  weight: "500 700",
  display: "swap",
  variable: "--font-fraunces",
  preload: false,
  adjustFontFallback: "Times New Roman",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});
// Condensed letterboard letters for the pegboard menu.
const antonio = Antonio({ subsets: ["latin"], display: "swap", variable: "--font-antonio", preload: false });
// Body + tracked captions ("SPECIALITY COFFEE").
const sans = Instrument_Sans({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Fallow Speciality Coffee · Sandyford & Kilternan",
  description:
    "Speciality coffee to go from two vintage trailers in Sandyford Business Park and a drive-thru in Kilternan. Our own Fallow Blend, roasted by Full Circle Roasters.",
  metadataBase: new URL(process.env.APP_BASE_URL || "http://localhost:3000"),
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  robots: { index: false, follow: false }, // concept demo
};

export const viewport: Viewport = {
  themeColor: "#173f35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE" className={`${fraunces.variable} ${antonio.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
