"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/features/portfolio/components/media/useMediaPreferences";

export default function Template({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  // A card → case-study open already animates this page change (the overlay
  // clone in CardOpenOverlay covers the viewport until its own reveal), so
  // don't stack this fade underneath it — the card-open flow sets
  // `data-card-open` on <html> for its duration. Only client navigations can
  // hit this; on the server and during hydration it's never set.
  const inCardOpenTransition =
    typeof document !== "undefined" && document.documentElement.dataset.cardOpen === "1";

  // Always render the same wrapper element so navigation never remounts the
  // subtree — only the `initial` prop toggles, which Framer Motion reads
  // once at mount and never replays, so this cannot cause a flash later.
  //
  // Opacity only, no `y` slide: Next scrolls to a `#hash` target in the same
  // commit that mounts this wrapper, and while the wrapper still carried a
  // transform Chromium ignored that scrollIntoView on phone layouts (header
  // links like "/#work" from /resume didn't scroll at all) and landed 8px
  // short on desktop.
  return (
    <motion.div
      initial={reducedMotion || inCardOpenTransition ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1], // Custom easing for professional feel
      }}
    >
      {children}
    </motion.div>
  );
}
