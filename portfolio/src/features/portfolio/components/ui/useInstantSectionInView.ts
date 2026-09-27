"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export interface SectionEntranceDecision {
  /** Resting pose should be shown — either instantly (see `instant`) or via the animated entrance. */
  play: boolean;
  /**
   * True when `play` was resolved WITHOUT a scroll-triggered reveal ever
   * being needed (already on screen, or the URL hash already targets this
   * section) — the caller should render this with a zero-duration
   * transition, never the animated deal-in/fan-in.
   *
   * This distinction turned out to matter for more than aesthetics: forcing
   * a real (non-zero) spring/tween transition through this path — even
   * though the resolved VALUE never changes again afterward (confirmed by
   * instrumenting every render: `play` reliably goes false -> true exactly
   * once and stays) — occasionally left the animated entrance visibly
   * reset back to its start pose and replay a second time, on the client-
   * navigation path specifically (e.g. a case study's "<- Back to work").
   * The resolved boolean was never the bug; the animated transition's
   * own mid-flight rendering was. Routing the "should just already be
   * resting" case through a zero-duration transition instead removes the
   * only window that bug needs — there's no "mid-flight" for an instant
   * change. The genuine scroll-triggered case (a real below-the-fold
   * reveal) keeps the normal animated entrance.
   */
  instant: boolean;
}

/**
 * Owns a section's entire "should the deal-in/fan-in entrance play, and
 * should it actually animate?" decision — Work's "deal", Projects' "fan" —
 * as state set AT MOST ONCE, by exactly one of two mutually exclusive paths:
 *
 *  1. Synchronously, in a layout effect (before the browser's next paint):
 *     if the section's box already overlaps the viewport, OR the current
 *     URL hash already targets this exact section (`#work`, `#projects`) —
 *     resolve `{play: true, instant: true}`. The hash check matters for a
 *     same-page client-side navigation whose target is a hash (a case
 *     study's "<- Back to work" link, or any `/#work` link clicked while
 *     already on "/"): the actual scroll-to-hash happens slightly LATER, in
 *     the router's own effect, so at this exact instant the section may
 *     still be positioned wherever the PREVIOUS route left the scroll (e.g.
 *     the top) — checking the hash catches this before that scroll lands.
 *  2. Otherwise, an IntersectionObserver, exactly like a normal below-the-
 *     fold reveal: resolve `{play: true, instant: false}` once the section
 *     scrolls into view, so it gets the normal animated entrance.
 *
 * Both paths write through the SAME setter, guarded by a ref lock so the
 * state can only ever resolve once, never again afterward.
 */
export function useInstantSectionInView(
  ref: RefObject<HTMLElement | null>,
  sectionId: string
): SectionEntranceDecision {
  const [state, setState] = useState<SectionEntranceDecision>({ play: false, instant: false });
  const decided = useRef(false);

  const resolve = (value: SectionEntranceDecision) => {
    if (decided.current) return;
    decided.current = true;
    setState(value);
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || decided.current) return;

    const rect = el.getBoundingClientRect();
    const alreadyOnScreen = rect.top < window.innerHeight && rect.bottom > 0;
    const hashTargetsThis = window.location.hash === `#${sectionId}`;

    if (alreadyOnScreen || hashTargetsThis) {
      resolve({ play: true, instant: true });
      return; // decided — no observer needed, and none will ever run.
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            resolve({ play: true, instant: false });
            observer.disconnect();
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
