"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { SkillThreadId } from "@/features/portfolio/data/site-content";
import { skillColor, skillLabel } from "./case-file";
import { BP_COLORS, fontDisplayStyle, fontMonoStyle } from "./tokens";

type BlueprintHeaderProps = {
  backHref: string;
  backLabel: string;
  caseFileNumber: string;
  subtitle: string;
  title: string;
  skills?: SkillThreadId[];
  threadColor: string;
  /** No longer used internally (the card-open overlay landing is rect-based,
   *  not a shared-element `viewTransitionName`) — kept so callers passing it
   *  don't need to change. */
  slug: string;
};

export function BlueprintHeader({
  backHref,
  backLabel,
  caseFileNumber,
  subtitle,
  title,
  skills,
  threadColor,
}: BlueprintHeaderProps) {
  // `initial`/`animate` are the SAME on server and client for every step —
  // no branching on a reduced-motion hook here (that hook resolves to
  // `null` on the server and to the live boolean on the client's very
  // first render, so branching on it would reintroduce a hydration
  // mismatch). The app-wide `<MotionConfig reducedMotion="user">` (see
  // src/app/providers.tsx) neutralises the `y` transform for reduced-motion
  // visitors.
  //
  // Opacity starts at 1, never 0: this header (back link, eyebrow, H1,
  // skill chips) is above the fold, and Framer bakes `initial` into the
  // server-rendered HTML. An opacity:0 start left it invisible until
  // hydration AND this component's first effect flush — on a throttled
  // phone (4x CPU, fast-4G) that measured ~4s after first paint (see
  // scratchpad/codereview/22-casestudy-lcp.js). Only `y` (a transform)
  // animates now, which never hides the text — a small offset is fine to
  // be visible pre-hydration, an invisible heading is not.
  const step = (i: number) => ({
    initial: { opacity: 1, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.05 + i * 0.07, ease: "easeOut" },
  });

  return (
    <header>
      <motion.div {...step(0)} className="bp-reveal">
        <Link
          href={backHref}
          className="group inline-flex min-h-[44px] items-center gap-1.5 text-xs uppercase tracking-[0.2em] transition-colors"
          style={{ ...fontMonoStyle, color: BP_COLORS.muted }}
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          {backLabel}
        </Link>
      </motion.div>

      <motion.div
        {...step(1)}
        className="bp-reveal mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.25em]"
        style={{ ...fontMonoStyle, color: threadColor }}
      >
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: threadColor }} />
        Case File No. {caseFileNumber}
      </motion.div>

      <motion.p
        {...step(2)}
        className="bp-reveal mt-3 text-xs uppercase tracking-[0.18em] sm:text-sm"
        style={{ ...fontMonoStyle, color: BP_COLORS.muted }}
      >
        {subtitle}
      </motion.p>

      <motion.h1
        {...step(3)}
        className="bp-reveal mt-3 text-[clamp(2.5rem,8vw,6rem)] leading-[1.05] tracking-tight"
        style={{ ...fontDisplayStyle, color: BP_COLORS.text }}
      >
        {title}
      </motion.h1>

      {skills?.length ? (
        <motion.ul
          {...step(4)}
          className="bp-reveal mt-6 flex flex-wrap gap-2"
          aria-label="Skill threads"
        >
          {skills.map((id) => {
            const color = skillColor(id);
            return (
              <li
                key={id}
                className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-wide"
                style={{ borderColor: color, color, ...fontMonoStyle }}
              >
                {skillLabel(id)}
              </li>
            );
          })}
        </motion.ul>
      ) : null}
    </header>
  );
}
