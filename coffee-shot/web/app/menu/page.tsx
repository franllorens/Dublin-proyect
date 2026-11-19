import type { Metadata } from "next";
import { MenuBoard } from "@/components/site/MenuBoard";
import { SiteBar } from "@/components/site/SiteBar";

export const metadata: Metadata = {
  title: "Full menu · The Coffee Shot, Beacon South Quarter",
  description: "Every coffee, tea, sandwich and iced drink on The Coffee Shot's chalkboards, as written behind the counter.",
};

export default function MenuPage() {
  return (
    <>
      <SiteBar />
      <main>
        <MenuBoard />
      </main>
    </>
  );
}
