"use client";

import { motion, useScroll } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../media/useMediaPreferences";

/**
 * The "thread" timeline motif: a 2px accent line on the left with ringed
 * checkpoint dots at each entry (see `TimelineEntry`). The accent line
 * draws itself in (scaleY) as the timeline scrolls through view, and stays
 * fully drawn (static) when the viewer prefers reduced motion.
 */
export function ThreadTimeline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.6"],
  });

  return (
    // The line's centre-x is anchored at `left-1` (4px) and pulled back by
    // half its own width via `-translate-x-1/2`, so its centre sits exactly
    // at x=4px regardless of its own thickness. Each TimelineEntry's dot
    // anchors to that same x=4px point (see ThreadTimeline.tsx's comment on
    // the dot) so the two always stay perfectly centred on one another.
    <div ref={ref} className="relative space-y-9 pl-8">
      <div
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 w-0.5 -translate-x-1/2 bg-paper/15"
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 w-0.5 -translate-x-1/2 origin-top bg-accent"
        style={{ scaleY: reducedMotion ? 1 : scrollYProgress }}
      />
      {children}
    </div>
  );
}

export function TimelineEntry({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className="bp-reveal relative"
      initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {/*
        The line lives in the ThreadTimeline container's coordinate space
        (centred at that container's x=4px, i.e. its own `left-1`). This
        span is positioned relative to THIS entry instead, which sits
        `pl-8` (32px) to the right of that container — so centring here at
        entry-relative x=-28px lands at the same container-relative x=4px
        (-28 + 32 = 4), and `-translate-x-1/2` centres the dot's own 16px
        width on that point, same as the line. Keep this in sync with
        ThreadTimeline's `left-1` if that ever changes.
      */}
      <span
        aria-hidden="true"
        className="absolute -left-[28px] top-1 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-ink ring-2 ring-accent/50"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      {children}
    </motion.div>
  );
}
