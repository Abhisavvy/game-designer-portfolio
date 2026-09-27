"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { defaultPortfolioContent } from "../../data/site-content";
import { SectionHeading } from "../ui/SectionHeading";
import { CardGrid } from "../cards/CardGrid";
import { CollectibleCard } from "../cards/CollectibleCard";
import { BoosterPack } from "../cards/BoosterPack";
import { formatCardIndex } from "../cards/card-content";
import { useInstantSectionInView } from "../ui/useInstantSectionInView";
import { usePrefersReducedMotion } from "../media/useMediaPreferences";

const FAN_SPREAD_PX = 70;

export function ProjectsSection() {
  const { personalProjects, caseStudies } = defaultPortfolioContent;
  const gridRef = useRef<HTMLDivElement>(null);
  // See WorkSection / useInstantSectionInView: owns the entire entrance
  // decision — skip it instantly if the grid is already on screen, or the
  // URL hash already targets "#projects", at mount; otherwise the normal
  // scroll-triggered reveal.
  const entranceDecision = useInstantSectionInView(gridRef, "projects");
  const reducedMotion = usePrefersReducedMotion();
  const count = personalProjects.length;

  return (
    <section
      id="projects"
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
              index="02"
              eyebrow="Personal Projects"
              title={
                <>
                  Games &amp; tools I <em>build on my own</em>
                </>
              }
              subtitle="Games and tools I build outside work, for fun and for the people around me."
            />
          </motion.div>
        </div>

        <div className="relative">
          {/* Not on the instant path (landing on /#projects): the cards are
              already dealt at rest there, so a pack tearing open over them
              would be out of order. */}
          <BoosterPack play={entranceDecision.play && !entranceDecision.instant} reducedMotion={reducedMotion} />

          <CardGrid ref={gridRef}>
            {personalProjects.map((project, index) => {
              const centeredOffset = index - (count - 1) / 2;
              return (
                <CollectibleCard
                  key={project.slug}
                  project={project}
                  displayIndex={formatCardIndex(index + 1)}
                  posterSrc={caseStudies[project.slug]?.media?.hero?.posterSrc}
                  reducedMotion={reducedMotion}
                  entrance={{
                    mode: "fan",
                    order: index,
                    play: entranceDecision.play,
                    instant: entranceDecision.instant,
                    fanOffset: -centeredOffset * FAN_SPREAD_PX,
                  }}
                />
              );
            })}
          </CardGrid>
        </div>
      </div>
    </section>
  );
}
