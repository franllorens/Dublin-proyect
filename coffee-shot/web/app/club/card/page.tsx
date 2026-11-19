import type { Metadata } from "next";
import { Club } from "@/components/club/Club";
import { SiteBar } from "@/components/site/SiteBar";
import { clubLive } from "@/lib/mode";

export const metadata: Metadata = {
  title: "Your club card · The Coffee Shot",
  description: "Add The Coffee Shot Club card to Apple Wallet or Google Wallet: nine coffees, the tenth on us.",
};
export const dynamic = "force-dynamic";

/** The home page's club form lands here (GET): the name and the usual come prefilled; the visitor picks a Wallet. */
export default function ClubCardPage({ searchParams }: { searchParams: { name?: string; usual?: string } }) {
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";
  return (
    <>
      <SiteBar />
      <main>
        <Club live={clubLive()} initialName={one(searchParams.name)} initialUsual={one(searchParams.usual)} />
      </main>
    </>
  );
}
