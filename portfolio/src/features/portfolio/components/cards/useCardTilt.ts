"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

export interface CardTiltHandlers {
  /**
   * Attach to a STATIC, never-transformed hit-area element (the card's
   * outer sizing box). Pointer math and hover-state both key off this
   * element's `getBoundingClientRect()` — never off the element that
   * actually receives `rotateX`/`rotateY`, since measuring a rect that is
   * itself mid-rotation feeds back into its own input and produces visible
   * jitter (the rect shrinks/shifts as the card tilts, which shifts the
   * computed tilt, which shifts the rect again).
   */
  hitRef: React.RefObject<HTMLDivElement | null>;
  /** Bind to the INNER (visual-only) element's `style` — never receives pointer events itself. */
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: (event: React.PointerEvent<HTMLDivElement>) => void;
}

/**
 * Pointer-driven 3D tilt + specular-highlight position for a "holographic"
 * trading card. `rotateX`/`rotateY` are Framer Motion springs (bound directly
 * to a `motion.div`'s `style` so updates never trigger a React re-render).
 * `--mx`/`--my` (used by the specular/foil overlays) are written straight to
 * the DOM node inside the same rAF-throttled handler for the same reason.
 *
 * Spring constants are deliberately soft (stiffness ~165 / damping ~20) —
 * stiff enough to feel responsive, soft enough that fast pointer movement
 * never overshoots into a visible oscillation.
 *
 * Disabled entirely (handlers are no-ops) when `enabled` is false — callers
 * pass `pointer:fine && !prefersReducedMotion`.
 */
export function useCardTilt(enabled: boolean, maxDegrees = 10): CardTiltHandlers {
  const hitRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const latestPointRef = useRef<{ x: number; y: number } | null>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 165, damping: 20, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 165, damping: 20, mass: 0.6 });

  // A single rAF drains the most recent pointer position — rapid pointermove
  // events only ever update a ref (no React state, no per-event work); the
  // actual rect read + motion-value writes happen at most once per frame.
  const flush = useCallback(() => {
    rafRef.current = null;
    const node = hitRef.current;
    const point = latestPointRef.current;
    if (!node || !point) return;
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const px = Math.min(1, Math.max(0, (point.x - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (point.y - rect.top) / rect.height));
    rotateY.set((px - 0.5) * 2 * maxDegrees);
    rotateX.set(-(py - 0.5) * 2 * maxDegrees);
    // Written only to the small holo/shine overlays that actually read
    // these (via `var(--mx)`/`var(--my)` in their own background), not to
    // this hit-area root: a custom property set on the root is inherited,
    // so every pointer-move frame was invalidating computed style for the
    // WHOLE card subtree just to update two decorative gradients.
    const mx = `${(px * 100).toFixed(1)}%`;
    const my = `${(py * 100).toFixed(1)}%`;
    node.querySelectorAll<HTMLElement>("[data-holo]").forEach((el) => {
      el.style.setProperty("--mx", mx);
      el.style.setProperty("--my", my);
    });
  }, [maxDegrees, rotateX, rotateY]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      latestPointRef.current = { x: event.clientX, y: event.clientY };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(flush);
    },
    [enabled, flush],
  );

  const onPointerLeave = useCallback(
    (_event: React.PointerEvent<HTMLDivElement>) => {
      latestPointRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      rotateX.set(0);
      rotateY.set(0);
      const node = hitRef.current;
      if (node) {
        node.querySelectorAll<HTMLElement>("[data-holo]").forEach((el) => {
          el.style.setProperty("--mx", "50%");
          el.style.setProperty("--my", "50%");
        });
      }
    },
    [rotateX, rotateY],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { hitRef, rotateX: springX, rotateY: springY, onPointerMove, onPointerLeave };
}
