"use client";

import { motion } from "framer-motion";
import type { ProjectStat } from "@/features/portfolio/data/site-content";
import { CountUp } from "../ui/CountUp";
import { BP_COLORS, fontMonoStyle } from "./tokens";

type MetricsStripProps = {
  stats?: ProjectStat[];
  threadColor: string;
};

// Tailwind's JIT scanner only generates CSS for class names it can see as
// complete literal strings in source — an interpolated `sm:grid-cols-${n}`
// would never match any generated rule. So each supported stat count maps
// to its own literal class set, sized exactly to that count (no empty
// dashed cells from a one-size-fits-all `sm:grid-cols-4`).
const GRID_COLS_BY_COUNT: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};
const FALLBACK_GRID_COLS = "grid-cols-2 sm:grid-cols-4";

// A 4-column strip has much narrower cells than a 2- or 3-column one at the
// exact same viewport width, so even a short value like "+300 bps" or
// "+7.5%" can outgrow its cell in the sm..lg range (640-1023px) even though
// it fits comfortably once there's more width per column below 640
// (base 2-col) or at lg+ (1024px+, restored to full size — measured safe
// there for every case study's data). 2- and 3-stat strips never overflowed
// at the normal size in testing, so only the 4-stat case needs the smaller
// sm: step. Same literal-class-string constraint as the grid map above.
const VALUE_SIZE_BY_COUNT: Record<number, string> = {
  1: "text-[1.75rem] font-medium tabular-nums sm:text-4xl",
  2: "text-[1.75rem] font-medium tabular-nums sm:text-4xl",
  3: "text-[1.75rem] font-medium tabular-nums sm:text-4xl",
  4: "text-[1.75rem] font-medium tabular-nums sm:text-2xl lg:text-4xl",
};
const FALLBACK_VALUE_SIZE = "text-[1.75rem] font-medium tabular-nums sm:text-2xl lg:text-4xl";

// A long, non-numeric value like "7 days → 1 hour" is the one shape that
// can overflow even a wide (2-column) cell at any of the sizes above (every
// other value in the data — percentages, "bps", bare counts — is short
// enough not to need this). Rendering it smaller still, and letting it
// wrap, keeps it inside its cell instead of bleeding into the next one.
const LONG_VALUE_THRESHOLD = 10;

/**
 * Headline stats as large mono numbers with dashed rules between them.
 * Each value counts up from 0 via CountUp once it scrolls into view (SSR /
 * no-JS / reduced-motion all render the final "+22 bps" / "−16%" etc.
 * string verbatim — see ui/CountUp.tsx).
 */
export function MetricsStrip({ stats, threadColor }: MetricsStripProps) {
  if (!stats?.length) return null;

  const gridColsClass = GRID_COLS_BY_COUNT[stats.length] ?? FALLBACK_GRID_COLS;
  const baseValueSizeClass = VALUE_SIZE_BY_COUNT[stats.length] ?? FALLBACK_VALUE_SIZE;

  return (
    <div
      role="list"
      aria-label="Headline metrics"
      className={`grid ${gridColsClass} divide-x divide-y divide-dashed divide-white/15 border border-dashed border-white/15 sm:divide-y-0`}
    >
      {stats.map((s, i) => {
        const isLongValue = s.value.length > LONG_VALUE_THRESHOLD;
        return (
          <motion.div
            key={`${s.label}-${i}`}
            role="listitem"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
            className="bp-reveal px-4 py-5 sm:px-6"
          >
            <div
              className={isLongValue ? "text-lg font-medium tabular-nums sm:text-2xl" : baseValueSizeClass}
              style={{ ...fontMonoStyle, color: threadColor }}
            >
              {/* `wrap` is unconditional: it only takes effect when the
                  value actually contains a space, so it's a no-op safety
                  net for every plain number/percent value and an active
                  fix for space-containing ones (e.g. "+300 bps") that would
                  otherwise force a too-wide single line via `whitespace-nowrap`. */}
              <CountUp value={s.value} wrap />
            </div>
            <div
              className="mt-1.5 text-[11px] uppercase leading-snug tracking-wide"
              style={{ color: BP_COLORS.muted }}
            >
              {s.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
