"use client";

import { HeroAnimated } from "./HeroAnimated";
import { TickerBand } from "./ui/TickerBand";
import { CursorSpotlight } from "./ui/CursorSpotlight";
import { KonamiEasterEgg } from "./ui/KonamiEasterEgg";
import { NoScriptReveal } from "./blueprint/NoScriptReveal";
// Sections are imported statically on purpose. They were next/dynamic before, and
// even with ssr:true the client discards the server HTML behind an empty Suspense
// fallback until each chunk loads, collapsing #work to 0px and then snapping it back
// (a measured CLS of ~0.2). Every section renders on first load anyway, so splitting
// them saved nothing.
import { StickySkillsSection } from "./StickySkillsSection";
import { WorkSection } from "./sections/WorkSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { AboutSection } from "./sections/AboutSection";
import { ContactSection } from "./sections/ContactSection";

export function HomePageContent() {
  return (
    <>
      {/* Same progressive-enhancement safety net /resume and /work/* use:
          forces every `bp-reveal` element visible with no JS or reduced
          motion, since Framer's `initial={{opacity:0}}` is otherwise baked
          into the server HTML and never gets undone. */}
      <NoScriptReveal />

      {/* Ambient, fixed, pointer-events-none — safe to mount once at the top. */}
      <CursorSpotlight />

      {/* Animated Hero Section - Keep synchronous (above fold) */}
      <HeroAnimated />

      <TickerBand />

      {/* Order matches the nav: Work, Projects, Skills, About, Contact. */}
      <WorkSection />
      <ProjectsSection />
      <StickySkillsSection />
      <AboutSection />
      <ContactSection />

      {/* Homepage-only easter egg (Konami code); no visual footprint until triggered. */}
      <KonamiEasterEgg />
    </>
  );
}
