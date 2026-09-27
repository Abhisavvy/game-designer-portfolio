"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { getLoomCards, type LoomCardData } from "./loom-content";
import {
  cardLeftEdgeAnchor,
  getLoomLayout,
  POSITION_KEYS,
  sectionFractionToViewBox,
  type LoomLayout,
  type Point,
} from "./loom-geometry";
import { useLoomLoop, type CardMotionSet } from "./useLoomLoop";

const CARD_ENTRANCE_BASE_DELAY = 1.15;
const CARD_ENTRANCE_STAGGER = 0.15;

/** Soft enough that fast hover toggles never overshoot into a visible
 *  oscillation (see useCardTilt). Stiffness bumped from 170 (hover-shimmer
 *  fix): at 170 the lift spring was still ~1 frame from its EXACT rest
 *  value 700ms after a hover starts — an imperceptible but non-zero
 *  residual that still re-rasterised text once or twice more. 220 clears
 *  that within the same window (damping ratio was already ~0.99, so more
 *  stiffness mostly means "faster", not "springier"). */
const CARD_SPRING = { stiffness: 220, damping: 20, mass: 0.6 };

/** `(min-width: 1024px)` — Tailwind's `lg` breakpoint, matching the `lg:hidden`/`hidden lg:block` CSS split in HeroAnimated. */
const DESKTOP_MQ = "(min-width: 1024px)";

export interface HeroLoomHandle {
  cards: LoomCardData[];
  layout: LoomLayout;
  fanAngles: number[];
  /** Spring-smoothed — bind these to the rendered card's style. */
  cardMotion: CardMotionSet[];
  handTiltX: MotionValue<number>;
  handTiltY: MotionValue<number>;
  pose: "resting" | "start";
  reducedMotion: boolean;
  /** Attach to the outermost section-level element — pointer-bend + offscreen-pause key off it. */
  containerRef: React.RefObject<HTMLElement | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  mainRefs: React.RefObject<(SVGPathElement | null)[]>;
  glowRefs: React.RefObject<(SVGPathElement | null)[]>;
  glintRefs: React.RefObject<(SVGPathElement | null)[]>;
  checkpointRefs: React.RefObject<(SVGGElement | null)[]>;
  onHoverChange: (index: number | null) => void;
  entranceDelay: (index: number) => number;
  /** Attach to HeroLoomHand's own positioned (square) box — measured by a
   *  ResizeObserver below so `anchorsRef` can track its REAL rect instead of
   *  trusting the static `handBox` percentages (see the H2 checkpoint fix). */
  handBoxRef: React.RefObject<HTMLDivElement | null>;
  /** Live-measured left-edge anchor points (SECTION_VIEWBOX space) for the 3
   *  anchored routes, index-aligned with `POSITION_KEYS`/card index. Read by
   *  `useLoomLoop` in place of each route's static `points[1]` once
   *  populated; `null` entries fall back to the static value (pre-mount /
   *  before the first measurement). */
  anchorsRef: React.RefObject<(Point | null)[]>;
  /** `true` once `matchMedia("(min-width: 1024px)")` is confirmed to match.
   *  Starts `false` (SSR-safe) so the desktop hand's centre-card image never
   *  gets an eager preload on a request that turns out to be a phone (M6). */
  isDesktopViewport: boolean;
  /** `true` while the hand-wide pointer-parallax tilt is live; `false` once
   *  fully settled to 0. HeroLoomHand renders a literal `transform: none`
   *  when `false` instead of an always-on `perspective(1000px)` — a
   *  permanent 3D context was forcing the cards' text to re-rasterise every
   *  frame even at rest (see the hover-shimmer fix). */
  handActive: boolean;
}

/**
 * Orchestrates the desktop Loom composition: owns the shared refs, motion
 * values, entrance pose, and the single rAF loop (`useLoomLoop`) that both
 * `HeroLoomThreads` (the full-bleed SVG) and `HeroLoomHand` (the 3-card
 * hand) render from. Split out of the render tree so those two components
 * can be independent DOM layers (required for correct stacking/masking)
 * while still moving in lockstep — the checkpoint nodes drawn by one need to
 * track the card positions rendered by the other, frame for frame.
 */
export function useHeroLoom(): HeroLoomHandle {
  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mainRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const glintRefs = useRef<(SVGPathElement | null)[]>([]);
  const checkpointRefs = useRef<(SVGGElement | null)[]>([]);
  const hoveredIndexRef = useRef<number | null>(null);
  const handBoxRef = useRef<HTMLDivElement>(null);
  const anchorsRef = useRef<(Point | null)[]>([null, null, null]);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [pose, setPose] = useState<"resting" | "start">("resting");
  // SSR-safe default (see HeroLoomHandle's doc comment) — flipped by the
  // layout effect below, and kept in sync across the 1024px breakpoint.
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  // Hover-shimmer fix: whether the hand-wide pointer tilt is currently
  // live — see `onHandActiveChange` in useLoomLoop and HeroLoomHand's box.
  const [handActive, setHandActive] = useState(false);

  const cards = useMemo(() => getLoomCards(), []);
  const layout = useMemo(() => getLoomLayout(false), []);
  const fanAngles = useMemo(() => POSITION_KEYS.map((k) => layout.cards[k].rotate), [layout]);

  // Ambient (continuously loop-driven) per-card motion — always exactly 3
  // cards, so 3 fixed sets of calls, never conditional. Each property is a
  // raw "target" value the loop writes to every frame, spring-wrapped into
  // the value actually bound to style: this is what composes idle float +
  // hover lift + fan-angle into ONE smoothly-interpolated transform instead
  // of the hover delta being a hard, jitter-prone step.
  const y0Target = useMotionValue(0);
  const y1Target = useMotionValue(0);
  const y2Target = useMotionValue(0);
  const rotate0Target = useMotionValue(fanAngles[0] ?? 0);
  const rotate1Target = useMotionValue(fanAngles[1] ?? 0);
  const rotate2Target = useMotionValue(fanAngles[2] ?? 0);
  const scale0Target = useMotionValue(1);
  const scale1Target = useMotionValue(1);
  const scale2Target = useMotionValue(1);

  const y0 = useSpring(y0Target, CARD_SPRING);
  const y1 = useSpring(y1Target, CARD_SPRING);
  const y2 = useSpring(y2Target, CARD_SPRING);
  const rotate0 = useSpring(rotate0Target, CARD_SPRING);
  const rotate1 = useSpring(rotate1Target, CARD_SPRING);
  const rotate2 = useSpring(rotate2Target, CARD_SPRING);
  const scale0 = useSpring(scale0Target, CARD_SPRING);
  const scale1 = useSpring(scale1Target, CARD_SPRING);
  const scale2 = useSpring(scale2Target, CARD_SPRING);

  const cardMotionTarget: CardMotionSet[] = useMemo(
    () => [
      { y: y0Target, rotate: rotate0Target, scale: scale0Target },
      { y: y1Target, rotate: rotate1Target, scale: scale1Target },
      { y: y2Target, rotate: rotate2Target, scale: scale2Target },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const cardMotion: CardMotionSet[] = useMemo(
    () => [
      { y: y0, rotate: rotate0, scale: scale0 },
      { y: y1, rotate: rotate1, scale: scale1 },
      { y: y2, rotate: rotate2, scale: scale2 },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handTiltX = useMotionValue(0);
  const handTiltY = useMotionValue(0);

  // Keep the ambient rotate TARGETS correct whenever the layout (fan angles)
  // changes, even if the loop isn't running yet (reduced motion, or still
  // mid-entrance) to drive them itself.
  useEffect(() => {
    cardMotionTarget.forEach((cm, i) => cm.rotate.set(fanAngles[i] ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fanAngles]);

  // Entrance orchestration. `pose` starts (and stays, under reduced motion)
  // at "resting" — the static composition — matching the server render
  // exactly. For everyone else, a layout effect (pre-paint) snaps to
  // "start" so the very first thing painted is the pre-entrance pose, then
  // a follow-up effect releases it back to "resting" with a real
  // transition, which is the entrance animation the user actually sees.
  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReducedMotion(true);
      return;
    }
    setPose("start");
  }, []);

  // Desktop-breakpoint detection for `priority` gating (M6) — see
  // HeroLoomHandle's doc comment. A layout effect (not a plain effect) so it
  // resolves before the browser paints, minimising the window where a real
  // desktop load renders with `isDesktopViewport` still `false`.
  useLayoutEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    setIsDesktopViewport(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktopViewport(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // H2 checkpoint fix: measure the hand box's REAL rect (now a true square —
  // see HeroLoomHand's `aspect-ratio: 1` box) as fractions of the SECTION's
  // real rect, and project each card's local left-edge anchor through that
  // MEASURED mapping instead of trusting the static `handBox` percentages
  // (which can't account for the section's real, auto-height/viewport-width
  // aspect ratio). `useLoomLoop` reads `anchorsRef` every frame in place of
  // each anchored route's static `points[1]` once it's populated.
  useLayoutEffect(() => {
    if (layout.compact || !layout.handViewBox) return;
    const section = containerRef.current;
    const handBox = handBoxRef.current;
    if (!section || !handBox) return;

    function measure() {
      const sRect = section!.getBoundingClientRect();
      const hRect = handBox!.getBoundingClientRect();
      if (sRect.width === 0 || sRect.height === 0 || hRect.width === 0 || hRect.height === 0) return;
      const leftFrac = (hRect.left - sRect.left) / sRect.width;
      const topFrac = (hRect.top - sRect.top) / sRect.height;
      const wFrac = hRect.width / sRect.width;
      const hFrac = hRect.height / sRect.height;

      POSITION_KEYS.forEach((pos, i) => {
        const slot = layout.cards[pos];
        const local = cardLeftEdgeAnchor(slot.cx, slot.cy, slot.w, slot.rotate);
        const lxFrac = local.x / layout.handViewBox!.w;
        const lyFrac = local.y / layout.handViewBox!.h;
        anchorsRef.current[i] = sectionFractionToViewBox(leftFrac + lxFrac * wFrac, topFrac + lyFrac * hFrac);
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(handBox);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  useEffect(() => {
    if (reducedMotion || pose !== "start") return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPose("resting"));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [reducedMotion, pose]);

  // Read by the imperative rAF loop only (never drives a re-render) — the
  // loop polls this ref every frame to brighten/dim threads and lift the
  // hovered card. Under reduced motion the loop never runs, so hover falls
  // back to the plain CSS glow/border affordance on the card itself.
  const onHoverChange = useCallback((index: number | null) => {
    hoveredIndexRef.current = index;
  }, []);

  useLoomLoop({
    layout,
    reducedMotion,
    enabled: !reducedMotion && pose === "resting",
    containerRef,
    svgRef,
    mainRefs,
    glowRefs,
    glintRefs,
    checkpointRefs,
    hoveredIndexRef,
    cardMotion: cardMotionTarget,
    // Hover-shimmer fix (force-settle): also hand the loop the spring-
    // SMOOTHED values actually bound to each card's rendered style, so a
    // sustained hover can `.jump()` them to their exact target instead of
    // trusting Framer's own spring rest-detection to have crossed its
    // threshold within the hold time a stationary-hover check uses — see
    // `HOVER_SETTLE_MS` in useLoomLoop.
    cardMotionSettled: cardMotion,
    fanAngles,
    handTiltX,
    handTiltY,
    anchorsRef,
    onHandActiveChange: setHandActive,
  });

  const entranceDelay = useCallback(
    (index: number) => CARD_ENTRANCE_BASE_DELAY + index * CARD_ENTRANCE_STAGGER,
    [],
  );

  return {
    cards,
    layout,
    fanAngles,
    cardMotion,
    handTiltX,
    handTiltY,
    pose,
    reducedMotion,
    containerRef,
    svgRef,
    mainRefs,
    glowRefs,
    glintRefs,
    checkpointRefs,
    onHoverChange,
    entranceDelay,
    handBoxRef,
    anchorsRef,
    isDesktopViewport,
    handActive,
  };
}
