"use client";

import dynamic from "next/dynamic";
import { HeroAnimated } from "./HeroAnimated";
import { defaultPortfolioContent } from "../data/site-content";

// Dynamic imports for below-the-fold sections  
const StickySkillsSection = dynamic(() => import("./StickySkillsSection").then(mod => ({ default: mod.StickySkillsSection })), {
  ssr: true
});

const WorkSection = dynamic(() => import("./sections/WorkSection").then(mod => ({ default: mod.WorkSection })), {
  ssr: true
});

const AboutSection = dynamic(() => import("./sections/AboutSection").then(mod => ({ default: mod.AboutSection })), {
  ssr: true
});

const ContactSection = dynamic(() => import("./sections/ContactSection").then(mod => ({ default: mod.ContactSection })), {
  ssr: true
});

export function HomePageContent() {
  const { hero } = defaultPortfolioContent;

  return (
    <>
      {/* Animated Hero Section - Keep synchronous (above fold) */}
      <HeroAnimated
        headline={hero.headline}
        subline={hero.subline}
        statPills={hero.statPills}
      />

      {/* Below-the-fold sections - Code split for better performance */}
      <StickySkillsSection />
      <WorkSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
