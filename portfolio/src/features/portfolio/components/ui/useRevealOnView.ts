"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

interface RevealOnViewOptions {
  /** IntersectionObserver rootMargin. Defaults to slightly before entry. */
  rootMargin?: string;
  /** Fraction of the element that must be visible to trigger. */
  threshold?: number;
}

// React warns if `useLayoutEffect` runs during SSR (it's a no-op there). This
// component still renders once on the server, so swap to a plain `useEffect`
// in that environment; on the client we specifically need the LAYOUT timing
// below, so this must never fall back to `useEffect` there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Arms a "reveal on view" animation without ever risking a stuck-hidden
 * element for no-JS users or crawlers, AND without ever flashing content
 * from visible to hidden after first paint.
 *
 * The hidden pose (the `.reveal-item` / `.reveal-mask-word` / `.reveal-hairline`
 * rules in globals.css) is scoped to `html.js ...`. `.js` is added
 * synchronously by a plain inline script at the start of `<body>` (see
 * layout.tsx) — before the browser ever paints the content — so a below-fold
 * element that opts into this system is hidden from its very FIRST paint
 * rather than rendered visible and then yanked hidden once this hook's
 * effect gets around to arming it (the old bug: an effect runs after paint,
 * so the server-rendered "visible" frame was genuinely painted first). No-JS
 * visitors and crawlers never get `.js` at all, so those hidden-pose rules
 * never match for them — content simply stays in its natural, visible
 * position, unconditionally.
 *
 * This hook's only remaining job is deciding WHEN to reveal:
 *  1. If motion is reduced, reveal immediately with transitions suppressed
 *     (also backed by a CSS-only failsafe in globals.css, so this holds even
 *     if this effect never runs).
 *  2. Else if the element is already inside (or past) the viewport by the
 *     time this runs — e.g. landing straight on /#work, where the browser's
 *     native anchor-scroll completes before hydration — reveal it
 *     immediately and instantly too, so it never hides-then-replays an
 *     entrance it effectively already had.
 *  3. Otherwise, watch it with an IntersectionObserver and reveal (with the
 *     normal animated transition) once it scrolls into view.
 *
 * Cases 1 and 2 run inside a LAYOUT effect (not a plain effect) so the class
 * addition lands before the browser's next paint — otherwise an
 * already-in-view element would still flash its hidden pose for one frame.
 */
export function useRevealOnView<T extends HTMLElement>(
  options?: RevealOnViewOptions
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.classList.add("reveal-in", "reveal-instant");
      return;
    }

    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) {
      el.classList.add("reveal-in", "reveal-instant");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("reveal-in");
            observer.disconnect();
          }
        });
      },
      { rootMargin: options?.rootMargin ?? "0px 0px -10% 0px", threshold: options?.threshold ?? 0.1 }
    );
    // Hydrated and watching: cancel the CSS failsafe (globals.css). Its
    // timer counts from page load, so left running it would reveal every
    // below-the-fold element 2.5s in, long before anyone scrolls to it.
    el.classList.add("reveal-armed");
    observer.observe(el);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

/** Splits plain text into `.reveal-mask-word` tokens, preserving spaces. */
export function splitWords(text: string): string[] {
  return text.split(/(\s+)/).filter((token) => token.length > 0);
}
