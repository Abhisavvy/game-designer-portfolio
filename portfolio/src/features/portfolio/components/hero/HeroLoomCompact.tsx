"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, type Transition } from "framer-motion";
import { clsx } from "clsx";
import { getLoomCards } from "./loom-content";
import { buildSmoothPath, getLoomLayout, POSITION_KEYS } from "./loom-geometry";
import { LoomCard } from "./LoomCard";
import { GLOW_STROKE_EXTRA, MAIN_STROKE, useLoomLoop, type CardMotionSet } from "./useLoomLoop";

const THREAD_ENTRANCE_DURATION = 0.7;
const THREAD_ENTRANCE_STAGGER = 0.14;
const CARD_ENTRANCE_BASE_DELAY = 1.15;
const CARD_ENTRANCE_STAGGER = 0.15;
/** `(min-width: 1024px)` — Tailwind's `lg` breakpoint, matching the `lg:hidden` CSS on this component's own wrapper in HeroAnimated. */
const DESKTOP_MQ = "(min-width: 1024px)";
/**
 * Card array indices (0=left, 1=centre, 2=right), in DOM order — matching
 * the visual left-to-right reading/tab order (axe/keyboard-nav fix; this
 * used to be `[0, 2, 1]`, painting right before centre). Paint stacking
 * (centre frontmost over its overlapping neighbours) is independent of DOM
 * order — each LoomCard sets its own fixed `z-index` (see `stableZIndex` in
 * LoomCard.tsx) — so reordering the DOM here doesn't change what's on top.
 */
const CARD_DOM_ORDER = [0, 1, 2];

/** Same edge-fade treatment as the desktop threads layer: left/top/bottom
 *  fade into the section, right edge stays opaque so the anchored threads
 *  visibly continue past the card hand instead of dissolving right where
 *  they'd otherwise read as "cut off behind the cards". */
const COMPACT_MASK =
  "linear-gradient(to right, transparent 0%, black 12%, black 100%), " +
  "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)";

export interface HeroLoomCompactProps {
  className?: string;
}

/**
 * The tablet/mobile Loom: a small self-contained box (three skill-colour
 * threads weaving behind a compact card hand) stacked below the hero's CTAs.
 * Always renders this composition — which variant shows is purely a CSS
 * (`lg:hidden`) decision made by the parent, never a runtime measurement —
 * so there is nothing here that can reflow after mount.
 */
export function HeroLoomCompact({ className }: HeroLoomCompactProps) {
  const reactId = useId();
  const blurId = `loom-compact-blur-${reactId}`;
  const gridId = `loom-compact-grid-${reactId}`;
  const clipIdBase = `loom-compact-clip-${reactId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mainRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const glintRefs = useRef<(SVGPathElement | null)[]>([]);
  const checkpointRefs = useRef<(SVGGElement | null)[]>([]);
  const hoveredIndexRef = useRef<number | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [pose, setPose] = useState<"resting" | "start">("resting");
  // SSR-safe default (M6) — flipped by the layout effect below, and kept in
  // sync across the 1024px breakpoint. Gates `priority` on the centre
  // card's image so a request that turns out to be a DESKTOP viewport never
  // eager-preloads this (CSS-hidden, `lg:hidden`) variant's image.
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  // Hover-shimmer fix: whether the hand-wide pointer tilt is currently
  // live — see `onHandActiveChange` in useLoomLoop.
  const [handActive, setHandActive] = useState(false);

  const cards = useMemo(() => getLoomCards(), []);
  const layout = useMemo(() => getLoomLayout(true), []);
  const fanAngles = useMemo(() => POSITION_KEYS.map((k) => layout.cards[k].rotate), [layout]);

  const y0 = useMotionValue(0);
  const y1 = useMotionValue(0);
  const y2 = useMotionValue(0);
  const rotate0 = useMotionValue(fanAngles[0] ?? 0);
  const rotate1 = useMotionValue(fanAngles[1] ?? 0);
  const rotate2 = useMotionValue(fanAngles[2] ?? 0);
  const scale0 = useMotionValue(1);
  const scale1 = useMotionValue(1);
  const scale2 = useMotionValue(1);
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

  useEffect(() => {
    cardMotion.forEach((cm, i) => cm.rotate.set(fanAngles[i] ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fanAngles]);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReducedMotion(true);
      return;
    }
    setPose("start");
  }, []);

  useLayoutEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    setIsCompactViewport(!mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsCompactViewport(!e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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

  const handleHoverChange = useCallback((index: number | null) => {
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
    cardMotion,
    fanAngles,
    handTiltX,
    handTiltY,
    onHandActiveChange: setHandActive,
  });

  const threadTransition = (index: number): Transition =>
    pose === "start"
      ? { duration: 0 }
      : { duration: THREAD_ENTRANCE_DURATION, delay: index * THREAD_ENTRANCE_STAGGER, ease: "easeOut" };

  // See HeroLoomThreads for why the entrance is a clipPath rect wipe (in
  // user-space) rather than a `pathLength` dasharray — the latter doesn't
  // compose correctly with `vector-effect: non-scaling-stroke` under this
  // SVG's anisotropic `preserveAspectRatio="none"` stretch and visibly
  // truncated every thread partway.
  const margin = { x: layout.viewBox.w * 0.15, y: layout.viewBox.h * 0.15 };
  const clipRectX = -margin.x;
  const clipRectY = -margin.y;
  const clipRectH = layout.viewBox.h + margin.y * 2;
  const clipRectFullW = layout.viewBox.w + margin.x * 2;

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
      }}
      data-loom-state="idle"
      // H2 fix: a FIXED aspect ratio (matching the 360x300 viewBox exactly),
      // not a fixed pixel height with `w-full` — the old fixed-300px-height
      // + full-bleed-width combo meant this box's real rendered aspect
      // ratio varied with viewport width (X/Y scaled independently under
      // the SVG's `preserveAspectRatio="none"` stretch below), so the cards
      // inside visibly squashed/stretched at some widths (most severely on
      // tablet). Locking the OUTER box to the viewBox's own aspect makes
      // X-scale == Y-scale always, so the cards render at their true
      // nominal aspect at every width. `max-w` caps how big that gets on a
      // wide tablet; `mx-auto` centres it once the cap engages.
      className={clsx("relative mx-auto w-full max-w-[440px] overflow-visible", className)}
      style={{ aspectRatio: `${layout.viewBox.w} / ${layout.viewBox.h}` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          WebkitMaskImage: COMPACT_MASK,
          maskImage: COMPACT_MASK,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <svg
          ref={svgRef}
          data-testid="loom-compact-svg"
          viewBox={`0 0 ${layout.viewBox.w} ${layout.viewBox.h}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <filter id={blurId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
            <pattern id={gridId} width={layout.grid.size} height={layout.grid.size} patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.2" fill="var(--paper, #F5F1EA)" />
            </pattern>
            {layout.routes.map((route, i) => (
              <clipPath key={`clip-${route.id}`} id={`${clipIdBase}-${i}`} clipPathUnits="userSpaceOnUse">
                <motion.rect
                  x={clipRectX}
                  y={clipRectY}
                  height={clipRectH}
                  initial={false}
                  animate={{ width: pose === "resting" ? clipRectFullW : 0 }}
                  transition={threadTransition(i)}
                />
              </clipPath>
            ))}
          </defs>

          <rect x={0} y={0} width={layout.viewBox.w} height={layout.viewBox.h} fill={`url(#${gridId})`} opacity={0.05} />

          {layout.routes.map((route, i) => (
            <path
              key={`glow-${route.id}`}
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              d={buildSmoothPath(route.points)}
              fill="none"
              stroke={route.color}
              strokeWidth={MAIN_STROKE + GLOW_STROKE_EXTRA}
              strokeLinecap="round"
              filter={`url(#${blurId})`}
              clipPath={`url(#${clipIdBase}-${i})`}
              style={{ opacity: 0.32 }}
            />
          ))}

          {layout.routes.map((route, i) => (
            <path
              key={`main-${route.id}`}
              ref={(el) => {
                mainRefs.current[i] = el;
              }}
              d={buildSmoothPath(route.points)}
              fill="none"
              stroke={route.color}
              strokeWidth={MAIN_STROKE}
              strokeLinecap="round"
              clipPath={`url(#${clipIdBase}-${i})`}
              style={{ opacity: 0.85 }}
            />
          ))}

          {[0, 1].map((slotIndex) => (
            <path
              key={`glint-${slotIndex}`}
              ref={(el) => {
                glintRefs.current[slotIndex] = el;
              }}
              d=""
              fill="none"
              strokeLinecap="round"
              strokeWidth={MAIN_STROKE + 1.1}
              style={{ opacity: 0, mixBlendMode: "screen" }}
            />
          ))}

          {layout.routes
            .filter((route) => route.cardPosition != null)
            .map((route) => {
              const posIndex = POSITION_KEYS.indexOf(route.cardPosition!);
              const anchor = route.points[1];
              return (
                <g
                  key={`checkpoint-${route.id}`}
                  ref={(el) => {
                    checkpointRefs.current[posIndex] = el;
                  }}
                  transform={`translate(${anchor.x}, ${anchor.y})`}
                >
                  <circle r={4} fill="none" stroke={route.color} strokeWidth={1.4} opacity={0.85} />
                  <circle r={1.6} fill={route.color} />
                </g>
              );
            })}
        </svg>
      </div>

      <motion.div
        className="absolute inset-0"
        style={{
          // Hover-shimmer fix: see HeroLoomHand — a literal `transform:
          // none` at rest instead of an always-on `perspective(1000px)`,
          // which was forcing text to re-rasterise every idle-float frame.
          ...(handActive
            ? { rotateX: handTiltX, rotateY: handTiltY, transformPerspective: 1000 }
            : { transform: "none" }),
          // See HeroLoomHand: `flat`, not `preserve-3d` — flattens each card
          // before compositing so paint order stays plain DOM/z-index
          // stacking (never re-sorted by 3D depth) and no card is magnified
          // by perspective projection at rest.
          transformStyle: "flat",
        }}
      >
        {/* DOM order left, centre, right (visual/tab order) — see CARD_DOM_ORDER. */}
        {CARD_DOM_ORDER.map((i) => (
          <LoomCard
            key={cards[i].slug}
            card={cards[i]}
            index={i}
            compact
            slot={layout.cards[POSITION_KEYS[i]]}
            viewBox={layout.viewBox}
            motionSet={cardMotion[i]}
            pose={pose}
            reducedMotion={reducedMotion}
            entranceDelay={CARD_ENTRANCE_BASE_DELAY + i * CARD_ENTRANCE_STAGGER}
            onHoverChange={handleHoverChange}
            // Only this (currently visible-below-lg) variant's centre card
            // should eager-preload its image — see M6 / isCompactViewport.
            priority={i === 1 && isCompactViewport}
            align={i === 2 ? "end" : "start"}
          />
        ))}
      </motion.div>
    </div>
  );
}
