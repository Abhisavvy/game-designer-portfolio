"use client";

import { motion } from "framer-motion";
import { POSITION_KEYS } from "./loom-geometry";
import { LoomCard } from "./LoomCard";
import type { HeroLoomHandle } from "./useHeroLoom";

/**
 * DOM order left, centre, right — matching the visual left-to-right
 * reading/tab order (axe/keyboard-nav fix). Paint stacking (centre frontmost
 * over its overlapping neighbours, like a held fan of cards) is handled
 * independently by each LoomCard's own fixed `z-index` (see
 * `stableZIndex` in LoomCard.tsx), so reordering the DOM here doesn't change
 * what's on top.
 */
const CARD_DOM_ORDER = [0, 1, 2];

/**
 * The desktop card hand: three collectible-card minis, positioned within
 * `layout.handBox`. The box is a true SQUARE (`aspect-ratio: 1`, sized by
 * `min(widthPct%, Nvh)` so it's bounded by whichever of the section's width
 * or the viewport's height is tighter) — matching `handViewBox`'s own square
 * aspect, so the cards inside never get stretched regardless of the
 * section's real (auto-height, viewport-width-driven) aspect ratio (see the
 * H2 fix in the round-4 audit). `useHeroLoom`'s ResizeObserver measures this
 * box's REAL rect (via `handBoxRef`) each time it changes, and that — not
 * the static percentages alone — is what keeps `HeroLoomThreads`' checkpoint
 * rings glued to these cards' left edges.
 */
export function HeroLoomHand({ loom, className }: { loom: HeroLoomHandle; className?: string }) {
  const {
    layout,
    cards,
    cardMotion,
    handTiltX,
    handTiltY,
    pose,
    reducedMotion,
    onHoverChange,
    entranceDelay,
    handBoxRef,
    isDesktopViewport,
    handActive,
  } = loom;
  const handBox = layout.handBox;
  const handViewBox = layout.handViewBox;
  if (!handBox || !handViewBox) return null;

  return (
    <div
      ref={handBoxRef}
      className={className}
      style={{
        position: "absolute",
        left: `${handBox.leftPct}%`,
        // top stays `vh`, not `%` of the section — the section's own height
        // is `auto` (driven by the text column's content height), which can
        // change by a few tens of px once a swapped-in webfont settles (see
        // next/font's `display: "swap"` in layout.tsx, a file outside this
        // component's ownership). A percentage here would recompute against
        // that new section height and shift this whole box; `vh` is pinned
        // to the viewport instead, so it never moves just because the
        // section around it resized.
        top: `${handBox.topPct}vh`,
        // width (and, via `aspect-ratio`, height) is bounded by BOTH the
        // section's width and the viewport's height, so a very tall-narrow
        // OR short-wide viewport can't blow this square box up past what
        // either axis can comfortably hold (the old `heightPct vh` value
        // alone let it overflow/clip at some real aspect ratios — see the
        // H2 desktop finding). 72vh is sized so 1440x900 (the "bigger
        // cards" reference viewport) lands around a ~243px card width.
        width: `min(${handBox.widthPct}%, 72vh)`,
        aspectRatio: "1",
        pointerEvents: "none",
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          pointerEvents: "auto",
          // Hover-shimmer fix: a PERMANENT `perspective(1000px)` (even with
          // rotateX/Y at 0) still puts every card in a 3D rendering context,
          // which was forcing their title text to re-rasterise on every one
          // of the idle float's continuous sub-pixel frames — read as
          // flicker, worst while hovering (see useLoomLoop's updateCards).
          // `handActive` is edge-triggered true only while a fine pointer is
          // over the hand and/or the tilt hasn't settled back to exactly 0
          // yet, so at rest this renders a literal `transform: none` — no
          // 3D context at all — and only re-enters one while the tilt is
          // actually live.
          ...(handActive
            ? { rotateX: handTiltX, rotateY: handTiltY, transformPerspective: 1000 }
            : { transform: "none" }),
          // `flat` (not `preserve-3d`): each card is flattened before
          // compositing, so the three overlapping cards' paint order is
          // plain DOM/z-index stacking — never re-sorted by 3D depth as the
          // tilt changes (that was flickering the hover target between
          // neighbouring cards), and no card gets a perspective-projection
          // size "pop" at rest. The group's rotateX/rotateY tilt still
          // applies to the whole flattened hand.
          transformStyle: "flat",
        }}
      >
        {CARD_DOM_ORDER.map((i) => (
          <LoomCard
            key={cards[i].slug}
            card={cards[i]}
            index={i}
            compact={false}
            slot={layout.cards[POSITION_KEYS[i]]}
            viewBox={handViewBox}
            motionSet={cardMotion[i]}
            pose={pose}
            reducedMotion={reducedMotion}
            entranceDelay={entranceDelay(i)}
            onHoverChange={onHoverChange}
            // Only the variant actually visible at this breakpoint should
            // trigger next/image's eager preload — `isDesktopViewport`
            // starts `false` (SSR-safe) and flips true synchronously via a
            // layout effect once matchMedia confirms it, so phones never
            // preload this (CSS-hidden) card's image (see M6).
            priority={i === 1 && isDesktopViewport}
            align={i === 2 ? "end" : "start"}
          />
        ))}
      </motion.div>
    </div>
  );
}
