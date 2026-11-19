import { ClockProvider } from "@/components/site/Clock";
import { Hero } from "@/components/site/Hero";
import { StickyNav } from "@/components/site/StickyNav";
import { Locations } from "@/components/site/Locations";
import { MenuBoard } from "@/components/site/MenuBoard";
import { Blend } from "@/components/site/Blend";
import { Club } from "@/components/club/Club";
import { Stories } from "@/components/site/Stories";
import { Reviews } from "@/components/site/Reviews";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { clubLive } from "@/lib/mode";

export default function Home() {
  const live = clubLive();
  return (
    <ClockProvider>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SmoothScroll />
      <StickyNav />
      <Hero />
      <main id="main">
        <Locations />
        <MenuBoard />
        <Blend />
        <Club live={live} />
        <Stories />
        <Reviews live={live} />
      </main>
      <Footer />
    </ClockProvider>
  );
}
