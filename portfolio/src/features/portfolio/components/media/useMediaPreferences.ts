"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** `true` when viewport is at least Tailwind `md` (768px). */
export function useViewportMinMd() {
  const [md, setMd] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const fn = () => setMd(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return md;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Safe default for SSR and the hydration render: "reduced" (i.e. resting,
 * fully visible, no motion) — matches the pose every consumer of this hook
 * already treats as its non-animating baseline. */
function getReducedMotionServerSnapshot() {
  return true;
}

/**
 * Whether the visitor's OS asked for reduced motion.
 *
 * Uses `useSyncExternalStore` (not `useState` + `useEffect`) specifically so
 * the "safe default" (true, matching SSR) never gets PAINTED before the real
 * value is known: an effect-based correction runs AFTER the browser's first
 * paint, so anything that branches its render output on this value (the
 * Work/Projects cards' entrance pose, Template's page-fade `initial`, etc.)
 * would flash from one pose to the other post-hydration. React resolves a
 * `useSyncExternalStore` mismatch between the server snapshot and the live
 * client value synchronously, before that first paint — so on the client
 * the very first frame already reflects the real preference, with no
 * intermediate flash of the wrong pose. Consumers that must still render a
 * visible/resting pose on the server and at first paint (the collectible
 * cards) get that for free, because `true` is exactly the pose they treat as
 * "don't animate, just show the resting state".
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}
