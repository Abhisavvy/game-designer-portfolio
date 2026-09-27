"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { defaultPortfolioContent } from "../../data/site-content";
import { SectionHeading } from "../ui/SectionHeading";
import { CardGrid } from "../cards/CardGrid";
import { CollectibleCard } from "../cards/CollectibleCard";
import { formatCardIndex } from "../cards/card-content";
import { useInstantSectionInView } from "../ui/useInstantSectionInView";
import { usePrefersReducedMotion } from "../media/useMediaPreferences";

export function WorkSection() {
  const { projects, caseStudies } = defaultPortfolioContent;
  const gridRef = useRef<HTMLDivElement>(null);
  // Owns the entire entrance decision (see useInstantSectionInView): skip it
  // instantly if the grid is already on screen, or the URL hash already
  // targets "#work", at mount — otherwise the normal scroll-triggered
  // reveal. threshold:0/rootMargin "-10%" (not a percentage-based threshold)
  // because the grid can be much taller than the viewport on narrow
  // single-column layouts, where "15% of the grid's own height" may never
  // be satisfied by a normal scroll-into-view.
  const entranceDecision = useInstantSectionInView(gridRef, "work");
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="work"
      className="relative bg-gradient-to-b from-zinc-950 to-black py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-6xl sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bp-reveal"
          >
            <SectionHeading
              index="01"
              eyebrow="Selected Work"
              title={
                <>
                  What I&apos;ve shipped at <em>PlaySimple</em>
                </>
              }
            />
          </motion.div>
        </div>

        <CardGrid ref={gridRef}>
          {projects.map((project, index) => (
            <CollectibleCard
              key={project.slug}
              project={project}
              displayIndex={formatCardIndex(index + 1)}
              posterSrc={caseStudies[project.slug]?.media?.hero?.posterSrc}
              reducedMotion={reducedMotion}
              entrance={{ mode: "deal", order: index, play: entranceDecision.play, instant: entranceDecision.instant }}
            />
          ))}
        </CardGrid>
      </div>
    </section>
  );
}
