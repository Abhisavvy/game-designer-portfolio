"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ProjectItem } from "../../data/site-content";
import { usePrefersReducedMotion } from "../media/useMediaPreferences";

/** Simple, elegant link cards to a few case studies — title, tag, first stat if present. */
export function CaseStudiesRow({ projects }: { projects: ProjectItem[] }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {projects.map((project, index) => {
        const firstStat = project.stats?.[0];
        return (
          <motion.div
            key={project.slug}
            className="bp-reveal h-full"
            initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={project.href}
              className="group flex h-full min-h-[44px] flex-col gap-2 rounded-xl border border-paper/10 p-5 transition-colors hover:border-accent/50 hover:bg-ink-2/60"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {project.tag}
              </p>
              <h3 className="font-display text-lg text-paper transition-colors group-hover:text-accent">
                {project.title}
              </h3>
              {firstStat ? (
                <p className="mt-auto pt-2 font-mono text-sm text-accent">
                  {firstStat.value} <span className="text-muted">{firstStat.label}</span>
                </p>
              ) : null}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
