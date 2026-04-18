"use client";

import { motion } from "framer-motion";
import { ProjectCardAnimated } from "../ProjectCardAnimated";
import { defaultPortfolioContent } from "../../data/site-content";

export function WorkSection() {
  const { projects, workSection, caseStudies } = defaultPortfolioContent;

  return (
    <section
      id="work"
      className="relative bg-gradient-to-b from-zinc-950 to-black py-20"
      style={{ scrollMarginTop: '3.5rem' }}
    >
      <div id="featured-work" className="absolute top-0" style={{ scrollMarginTop: '3.5rem' }}></div>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400/80 mb-4">
            {workSection.eyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              {workSection.title}
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Case studies showcasing systems design, LiveOps execution, and measurable business impact
          </p>
        </motion.div>

        <div className="flex flex-wrap -mx-3 lg:-mx-4">
          {projects.map((project, index) => (
              <div key={project.slug} className="w-full md:w-1/2 lg:w-1/3 px-3 lg:px-4 mb-6 lg:mb-8">
                <ProjectCardAnimated
                  project={project}
                  index={index}
                  listingPosterSrc={
                    caseStudies[project.slug]?.media?.hero?.posterSrc
                  }
                />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}