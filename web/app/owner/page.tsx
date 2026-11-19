import type { Metadata } from "next";
import { clubLive } from "@/lib/mode";
import { Owner } from "@/components/owner/Owner";

export const metadata: Metadata = { title: "Fallow Club · Owner" };

export default function OwnerPage() {
  return <Owner live={clubLive()} />;
}
