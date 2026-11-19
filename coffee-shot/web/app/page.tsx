import { ClockProvider } from "@/components/site/Clock";
import { Hero } from "@/components/site/Hero";
import { StickyNav } from "@/components/site/StickyNav";
import { FindUs } from "@/components/site/FindUs";
import { MenuBoard } from "@/components/site/MenuBoard";
import { Counter } from "@/components/site/Counter";
import { Sourced } from "@/components/site/Sourced";
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
        <FindUs />
        <MenuBoard />
        <Counter />
        <Sourced />
        <Club live={live} />
        <Stories />
        <Reviews live={live} />
      </main>
      <Footer />
    </ClockProvider>
  );
}
