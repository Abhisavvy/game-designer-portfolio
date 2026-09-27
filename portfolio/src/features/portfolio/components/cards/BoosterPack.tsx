"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrandMark } from "@/features/portfolio/components/ui/BrandMark";
import { BOOSTER_TIMING } from "./card-content";

export interface BoosterPackProps {
  /** True once the Projects section has entered the viewport (single trigger owned by the parent section). */
  play: boolean;
  reducedMotion: boolean;
}

type Phase = "idle" | "shake" | "tear" | "fan" | "done";

/**
 * A foil-wrapped "booster pack" overlay that shakes, tears open, and fades
 * away once — a pure progressive enhancement layered on top of the actual
 * card grid (which is always rendered directly by ProjectsSection). Renders
 * nothing when motion is reduced, so reduced-motion visitors see the cards
 * with no pack theatrics at all.
 */
export function BoosterPack({ play, reducedMotion }: BoosterPackProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  // Once the fade-out finishes, the pack is removed from the flow entirely
  // (rather than left sitting at opacity 0) so it can never linger as an
  // invisible, click-blocking layer over the card grid beneath it.
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (!play || reducedMotion) return;
    const timers = [
      window.setTimeout(() => setPhase("shake"), BOOSTER_TIMING.shakeAt),
      window.setTimeout(() => setPhase("tear"), BOOSTER_TIMING.tearAt),
      window.setTimeout(() => setPhase("fan"), BOOSTER_TIMING.fanAt),
      window.setTimeout(() => setPhase("done"), BOOSTER_TIMING.doneAt),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [play, reducedMotion]);

  if (reducedMotion || !play || removed) return null;

  const torn = phase === "tear" || phase === "fan" || phase === "done";
  const gone = phase === "done";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
    >
      <motion.div
        className="relative flex aspect-[5/7] w-[220px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[18px] border border-paper/15"
        style={{
          background:
            "linear-gradient(155deg, #1c1815 0%, #141210 38%, #241a10 62%, #141210 100%)",
        }}
        initial={{ opacity: 1, scale: 1 }}
        animate={
          gone
            ? { opacity: 0, scale: 0.85, y: -12 }
            : phase === "shake"
              ? { opacity: 1, scale: 1, x: [0, -6, 6, -5, 5, -3, 3, 0], rotate: [0, -1.5, 1.5, -1, 1, -0.5, 0.5, 0] }
              : { opacity: 1, scale: 1 }
        }
        transition={
          gone
            ? { duration: 0.4, ease: "easeIn" }
            : phase === "shake"
              ? { duration: 0.38, ease: "easeInOut" }
              : { duration: 0.3 }
        }
        onAnimationComplete={() => {
          if (gone) setRemoved(true);
        }}
      >
        {/* iridescent foil sheen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
          style={{
            background:
              "conic-gradient(from 120deg at 50% 40%, #F97316, #FACC15, #38BDF8, #A78BFA, #2DD4BF, #FB7185, #F97316)",
          }}
        />

        {/* tear strip */}
        <motion.div
          className="absolute inset-x-0 top-0 flex h-9 items-center justify-center border-b border-dashed border-paper/30 bg-ink/50"
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={torn ? { y: -48, rotate: -10, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.32, ease: "easeIn" }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-paper/70">
            Tear here
          </span>
        </motion.div>

        <BrandMark className="relative h-9 w-9 text-paper" />
        <p className="relative px-4 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-paper/85">
          Personal Projects
          <br />
          Booster
        </p>
      </motion.div>
    </div>
  );
}
