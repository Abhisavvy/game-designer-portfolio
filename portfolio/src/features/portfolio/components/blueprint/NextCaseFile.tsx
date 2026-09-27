"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ProjectItem } from "@/features/portfolio/data/site-content";
import { BP_COLORS, fontDisplayStyle, fontMonoStyle } from "./tokens";

export function NextCaseFile({ project, threadColor }: { project: ProjectItem; threadColor: string }) {
  const headline = project.stats?.[0];

  return (
    <motion.div
      className="bp-reveal"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link
        href={project.href}
        className="group block border-t pt-8 transition-colors"
        style={{ borderColor: "rgba(255,255,255,0.15)" }}
      >
        <p className="text-xs uppercase tracking-[0.22em]" style={{ ...fontMonoStyle, color: BP_COLORS.muted }}>
          Next case file &rarr;
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h3
            className="text-3xl transition-transform duration-300 group-hover:translate-x-1.5 sm:text-4xl"
            style={{ ...fontDisplayStyle, color: BP_COLORS.text }}
          >
            {project.title}
          </h3>
          {headline ? (
            <div className="text-right">
              <div className="text-2xl tabular-nums" style={{ ...fontMonoStyle, color: threadColor }}>
                {headline.value}
              </div>
              <div className="text-[11px] uppercase tracking-wide" style={{ color: BP_COLORS.muted }}>
                {headline.label}
              </div>
            </div>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
