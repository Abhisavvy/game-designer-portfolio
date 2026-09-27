"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

interface ParsedValue {
  /** Text before the number (and its sign, if any). */
  prefix: string;
  /** "+", "-", "−", or "". Stays fixed throughout the animation. */
  sign: string;
  /** The parsed numeric target. */
  target: number;
  /** Decimal places in the original number, e.g. "7.5" -> 1. */
  decimals: number;
  /** Text after the number. */
  suffix: string;
}

// Lazy prefix + optional sign immediately before the first digit run. This
// finds the first number in the string regardless of what comes before or
// after it, without swallowing an unrelated "+"/"-" elsewhere (e.g. the
// trailing "+" in "40k+" is *not* a sign — there's no digit right after it).
const NUMBER_RE = /^(.*?)([+\-−]?)(\d+(?:\.\d+)?)([\s\S]*)$/;

function parseValue(value: string): ParsedValue | null {
  // Values that read wrong mid-count render as-is: more than one number
  // ("7 days → 1 hour" would show "0 days → 1 hour", a range "3–8%" would
  // show "0–8%") or a target below 2 ("1 tap" would show "0 tap").
  if ((value.match(/\d+(?:\.\d+)?/g) ?? []).length > 1) return null;
  const match = NUMBER_RE.exec(value);
  if (!match) return null;
  const [, prefix, sign, numberText, suffix] = match;
  const target = parseFloat(numberText);
  if (Number.isNaN(target) || target < 2) return null;
  const decimals = numberText.includes(".") ? numberText.split(".")[1].length : 0;
  return { prefix, sign, target, decimals, suffix };
}

function formatFrame(parsed: ParsedValue, current: number): string {
  const magnitude = Math.abs(current).toFixed(parsed.decimals);
  return `${parsed.prefix}${parsed.sign}${magnitude}${parsed.suffix}`;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function isInViewport(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return (
    r.bottom > 0 &&
    r.right > 0 &&
    r.top < (window.innerHeight || document.documentElement.clientHeight) &&
    r.left < (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Animates the first number found in `value` (counting up from `from` to
 * that number) once the element scrolls into view, keeping any prefix/sign/
 * suffix text fixed — e.g. `<CountUp value="40k+" from={4} />` counts
 * "4k+" -> "40k+".
 *
 * - Server HTML (and no-JS) always shows the final `value` string exactly.
 * - After mount, if the element is currently off-screen, it switches to the
 *   start value (invisible to the user, since it's off-screen) and animates
 *   once an IntersectionObserver reports it entering view. If it's already
 *   in view at mount, the count-up is skipped entirely — the spec allows
 *   this fallback rather than risking a visible final -> start flash.
 * - `prefers-reduced-motion`: always the final value, no animation.
 * - A layout-only, `visibility:hidden` copy of the final string reserves
 *   the box's width/height so the animating digits never shift layout.
 * - Screen readers get the final value (a `sr-only` node); the visibly
 *   animated text is `aria-hidden`.
 */
export function CountUp({
  value,
  from = 0,
  duration = 1600,
  delay = 0,
  className,
  wrap = false,
}: {
  value: string;
  from?: number;
  duration?: number;
  /** Extra delay (ms) after the element enters view, for staggering. */
  delay?: number;
  /** Applied to the visible text itself (safe for a `background-clip:text` gradient etc.), not a shared wrapper. */
  className?: string;
  /**
   * Allow the value to wrap onto multiple lines instead of forcing one
   * `nowrap` line. Off by default (matches every existing call site's
   * short numeric values); turn on for long non-numeric values — e.g. a
   * stat like "7 days → 1 hour" — that would otherwise overflow a narrow
   * cell instead of wrapping at its spaces.
   */
  wrap?: boolean;
}) {
  const parsed = parseValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  // Only ever used for the two states React actually needs to know about —
  // the very first ("start value") and last ("exact original string") frame.
  // Every frame IN BETWEEN is written straight to the DOM (see the `animate`
  // call below), bypassing React entirely: a plain `useState` tick here was
  // ~96 `setState` calls (one per animation frame at 60fps/1600ms) for each
  // of the 4 stat boxes on the page, which is what showed up as a burst of
  // React commits when they scrolled into view.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!parsed) return; // no number found — `value` renders as-is, nothing to animate
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // stays at the final value
    }

    let controls: ReturnType<typeof animate> | undefined;

    const runCountUp = () => {
      controls = animate(from, parsed.target, {
        duration: duration / 1000,
        delay: delay / 1000,
        ease: (t: number) => 1 - Math.pow(1 - t, 3), // easeOutCubic, matching the previous animation exactly
        onUpdate: (v) => {
          if (textRef.current) textRef.current.textContent = formatFrame(parsed, v);
        },
        onComplete: () => {
          if (textRef.current) textRef.current.textContent = value; // exact original string — guaranteed match
        },
      });
    };

    if (isInViewport(el)) {
      // Already visible at mount — switching to the start value here would
      // flash in front of the user, so just leave the final value showing.
      return;
    }

    // Off-screen: safe to switch to the start value now.
    setDisplay(formatFrame(parsed, from));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCountUp();
            observer.disconnect();
          }
        });
      },
      // Start as soon as any of it is on screen. A -10% bottom margin left a
      // number resting in the bottom tenth of the viewport showing its start
      // value ("+0%") until the user scrolled further, which reads as a real
      // stat (the first Work card on phones sits exactly there).
      { threshold: 0 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    // The invisible sizer and the visible digits are stacked in the same
    // CSS grid cell (not absolutely positioned) so the reserved width never
    // resizes as the count runs. Absolute positioning was tried first, but
    // an ancestor's `background-clip:text` gradient (used by the stats
    // band's number styling) doesn't clip absolutely-positioned descendant
    // text — it rendered invisible. Grid stacking keeps the visible text a
    // normal in-flow child, so ancestor `background-clip:text`/`color`
    // inherit and paint correctly.
    //
    // `className` (e.g. a `background-clip:text` gradient) is applied only
    // to the *visible* text span below, never to a shared ancestor. A
    // `background-clip:text` ancestor clips to the union of *all*
    // descendant text geometry, including a `visibility:hidden` one — the
    // hidden sizer's glyph shapes still counted toward the clip mask, so
    // both strings visibly "ghosted" through the gradient at once. Scoping
    // the gradient classes to only the live text sidesteps that entirely.
    <span ref={ref} className={`relative inline-grid ${wrap ? "whitespace-normal" : "whitespace-nowrap"}`}>
      <span aria-hidden="true" className="invisible tabular-nums [grid-area:1/1]">
        {value}
      </span>
      <span ref={textRef} aria-hidden="true" className={`tabular-nums [grid-area:1/1] ${className ?? ""}`}>
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
