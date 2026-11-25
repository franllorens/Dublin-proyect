import type { Metadata, Viewport } from "next";
import { clubLive } from "@/lib/mode";
import { StaffApp } from "@/components/staff/StaffApp";

export const metadata: Metadata = {
  title: "Fallow · Barista",
  manifest: "/staff.webmanifest",
  appleWebApp: { capable: true, title: "Fallow Barista", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#0b221d" };

export default function StaffPage() {
  return <StaffApp live={clubLive()} />;
}
