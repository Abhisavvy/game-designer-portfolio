"use client";

import { motion } from "framer-motion";
import { BP_COLORS, fontDisplayStyle, fontMonoStyle } from "./tokens";

const LONG_NOTE_THRESHOLD = 180;

/**
 * A note rendered in the right margin beside its section — mono, italic,
 * in the page's fixed accent color (not the per-project thread color; the
 * design tokens define "accent" as its own fixed #F97316, distinct from the
 * dynamic thread color used elsewhere), with a thin leader line pointing
 * back at the text column.
 */
export function MarginNoteAside({ note }: { note: string }) {
  return (
    <motion.div
      className="bp-reveal relative mb-8 pl-6"
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <svg
        aria-hidden
        width="24"
        height="12"
        viewBox="0 0 24 12"
        className="absolute -left-0.5 top-1"
        style={{ color: BP_COLORS.accent }}
      >
        <line x1="24" y1="6" x2="4" y2="6" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M4 6 L10 2.2 L10 9.8 Z" fill="currentColor" />
      </svg>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ ...fontMonoStyle, color: BP_COLORS.accent }}
      >
        Design note
      </p>
      <p
        className="mt-1.5 text-[13px] italic leading-snug"
        style={{ ...fontMonoStyle, color: BP_COLORS.textDim }}
      >
        {note}
      </p>
    </motion.div>
  );
}

/** A pull-quote rendered inline, used below the 1280px rail breakpoint or
 *  whenever a note runs long. `hideOnRail` hides it once the aside rail
 *  takes over at >=1280px (pure CSS — no layout shift, no JS needed). */
export function MarginNoteQuote({
  note,
  threadColor,
  hideOnRail,
}: {
  note: string;
  threadColor: string;
  hideOnRail?: boolean;
}) {
  return (
    <motion.blockquote
      className={`bp-reveal my-6 max-w-[60ch] border-l-2 py-1 pl-5 ${hideOnRail ? "xl:hidden" : ""}`}
      style={{ borderColor: threadColor }}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <p className="text-[22px] italic leading-snug" style={{ ...fontDisplayStyle, color: BP_COLORS.text }}>
        &ldquo;{note}&rdquo;
      </p>
    </motion.blockquote>
  );
}

export function isLongNote(note: string): boolean {
  return note.length > LONG_NOTE_THRESHOLD;
}
