"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { clsx } from "clsx";
import { hexToRgba, type LoomCardData } from "./loom-content";
import type { CardSlot } from "./loom-geometry";
import type { CardMotionSet } from "./useLoomLoop";
import { useCardOpenNavigation } from "../transitions/useCardOpenNavigation";
import { isPlainLeftClick, captureArtwork } from "../transitions/cardActivation";

export interface LoomCardProps {
  card: LoomCardData;
  index: number;
  compact: boolean;
  slot: CardSlot;
  viewBox: { w: number; h: number };
  motionSet: CardMotionSet;
  pose: "resting" | "start";
  reducedMotion: boolean;
  entranceDelay: number;
  onHoverChange: (index: number | null) => void;
  priority?: boolean;
  /**
   * Which edge the text block hugs. The fanned hand overlaps every card with
   * its neighbour, and whichever neighbour paints on top always covers the
   * side nearest the centre — so the card whose exposed sliver is on its
   * right (typically the rightmost card) right-aligns its text instead of
   * losing it under the card in front.
   */
  align?: "start" | "end";
}

/**
 * One mini collectible card in HeroLoom's fanned "hand". Structure, outer to
 * inner:
 *  1. A plain, statically-positioned outer box (percentage slot from the
 *     shared layout viewBox) — never transformed.
 *  2. A static hit-area layer: pointer/focus/click all key off THIS element's
 *     own (never-moving) box. Lifting or fanning the card below must never
 *     shift what triggers hover — that was the source of the reported
 *     enter/leave "flapping" jitter.
 *  3. A declarative entrance layer (deals in from below-right, once, on mount).
 *  4. An ambient layer whose `y`/`rotate`/`scale` are Framer `MotionValue`s
 *     (springs) driven every frame by `useLoomLoop` (idle float, hover lift,
 *     fan angle) — never by this component, so there is exactly one
 *     animation authority per property.
 */
export function LoomCard({
  card,
  index,
  compact,
  slot,
  viewBox,
  motionSet,
  pose,
  reducedMotion,
  entranceDelay,
  onHoverChange,
  priority,
  align = "start",
}: LoomCardProps) {
  const borderColor = hexToRgba(card.color, 0.45);
  const glowColor = hexToRgba(card.color, 0.5);

  // Hydration-flash fix, part 2: `globals.css`'s `.js .loom-card-entrance`
  // rule needs `!important` to hide this from the very FIRST paint (Framer
  // renders an inline `opacity` even in the SSR markup, which a
  // non-important stylesheet rule can never beat) — but a stylesheet
  // `!important` ALSO beats every later, non-important inline opacity
  // React/Framer ever sets, including the real entrance animation's OWN
  // 0->1, which left the cards permanently stuck invisible once hydrated.
  // The fix: only apply that class before hydration. `mounted` starts
  // `false` (matching SSR) and flips `true` in a layout effect — the SAME
  // synchronous pre-paint timing the entrance pose-flip effect (in
  // useHeroLoom/HeroLoomCompact) already uses, so the class is removed in
  // the exact same commit that switches this card to Framer-native control,
  // with no extra frame in between for a flash either way.
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const entering = pose === "start";
  const tumble = (index - 1) * 16; // left tumbles -16deg in, right +16deg in, centre straight
  const dealX = slot.w * 0.22;
  const dealY = slot.h * 0.34;

  // The resting->start leg (mount snapping into its pre-entrance pose) must be
  // instant — only the start->resting leg is the real, visible deal-in
  // animation. Using the same delayed transition for both would let the
  // second (near-immediate) pose change cancel the first before its delay
  // even elapsed, and the card would never appear to move at all.
  const entranceTransition: Transition =
    reducedMotion || entering
      ? { duration: 0 }
      : { type: "spring", stiffness: 210, damping: 24, delay: entranceDelay };

  // Hero cards never show a stat (see the card-open `visual` below) — the
  // accessible name is always just the title, matching what's on screen.
  const label = `${card.title} case study`;

  // A fixed per-card z-index — never touched by hover/tilt — so the fanned
  // hand's stacking order (centre card frontmost over its overlapping
  // neighbours) stays stable no matter how the shared hand-wide pointer
  // tilt changes, and independently of DOM order (which is left-to-right,
  // matching visual/tab order — see CARD_DOM_ORDER in HeroLoomHand/HeroLoomCompact).
  // (Previously this used a per-card `translateZ` under the hand's shared
  // `preserve-3d` context, but any translateZ there is subject to that
  // context's perspective projection — at rest, with no tilt at all, it
  // still makes the centre card ~2.7% larger than its neighbours, which
  // reads as an unwanted "pop". The hand wrapper now uses `transform-style:
  // flat` instead (see HeroLoomHand/HeroLoomCompact), which flattens each
  // card before compositing — so paint order is plain DOM/z-index stacking,
  // never re-sorted by 3D depth, and no card is ever magnified at rest.)
  const stableZIndex = index === 1 ? 2 : 1;

  const hitRef = useRef<HTMLDivElement>(null);
  const { activate, prefetch } = useCardOpenNavigation();

  // These cards sit above the fold — prefetch immediately rather than
  // waiting on an intersection observer for a box that's already in view.
  useEffect(() => {
    prefetch(card.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnter() {
    onHoverChange(index);
    prefetch(card.href);
  }
  function handleLeave() {
    onHoverChange(null);
  }

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(event)) return;
      const node = hitRef.current;
      const rect = node?.getBoundingClientRect();
      const artwork = captureArtwork(node);
      activate(event, {
        href: card.href,
        reducedMotion,
        panelRect: rect
          ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
          : { top: 0, left: 0, width: 0, height: 0 },
        artworkRect: artwork ?? (rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : { top: 0, left: 0, width: 0, height: 0 }),
        visual: {
          // Falls back to whichever src the card itself would render
          // (matches the <Image src> above) on the rare chance `artwork`
          // came back null (e.g. the image hadn't mounted yet) — keeps this
          // in lockstep with the ACTUAL rendered image, per the artwork
          // override above, for the overlay/transitions code that reads it.
          currentSrc: artwork?.currentSrc ?? card.cardImageSrc ?? card.posterSrc,
          objectPosition: artwork?.objectPosition ?? card.objectPosition ?? "center",
          title: card.title,
          // No stat, no displayIndex here — hero cards show neither any more
          // (see CollectibleCard for Work cards, which still pass
          // statValue/statLabel/displayIndex untouched), so the overlay's
          // brief "opening" beat doesn't flash a number the card itself
          // never showed.
          threadColor: card.color,
          fromRotate: motionSet.rotate.get(),
        },
      });
    },
    [activate, reducedMotion, card, motionSet],
  );

  return (
    <div
      data-testid="loom-card"
      data-slug={card.slug}
      className="absolute [perspective:900px]"
      style={{
        left: `${(slot.cx / viewBox.w) * 100}%`,
        top: `${(slot.cy / viewBox.h) * 100}%`,
        width: `${(slot.w / viewBox.w) * 100}%`,
        height: `${(slot.h / viewBox.h) * 100}%`,
        zIndex: stableZIndex,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        ref={hitRef}
        className="relative h-full w-full"
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        <motion.div
          // Hydration-flash fix: `.js .loom-card-entrance` in globals.css
          // hides this (opacity:0, `!important`) from the very FIRST paint
          // a JS-capable browser does — including the RAW SSR HTML, before
          // React has even hydrated — because `pose` itself can't start
          // hidden (it starts at "resting"/visible, deliberately, so a
          // no-JS visitor and the SSR markup both show the cards). Without
          // this, slow/throttled hydration meant users briefly saw the
          // fully-visible resting pose (the SSR/pre-hydration paint), THEN
          // watched it snap hidden and deal back in once React mounted and
          // this component's own `entering` logic caught up. The class
          // (and so the CSS rule) is only present pre-`mounted` — see the
          // `!mounted` guard above for why this can't just stay applied
          // forever with reduced-motion's `!important` override handling
          // that visitor instead: it would ALSO block every later,
          // non-important inline `opacity` Framer ever sets, permanently
          // freezing the card invisible once the real entrance (or
          // reduced-motion's instant-visible) animation tried to run.
          className={clsx(!mounted && "loom-card-entrance", "h-full w-full")}
          initial={false}
          animate={
            entering
              ? { x: dealX, y: dealY, rotate: tumble, opacity: 0 }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={entranceTransition}
        >
          <motion.div
            className="group h-full w-full"
            style={{
              // Hover-shimmer fix: hints the browser to promote this to its
              // own GPU layer, so the idle float / hover lift (translate
              // only — `scale` never leaves 1; see useLoomLoop's
              // updateCards) moves the already-rasterised card instead of
              // repainting its text every frame.
              willChange: "transform",
              y: motionSet.y,
              rotate: motionSet.rotate,
              scale: motionSet.scale,
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[14px] opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-90 group-focus-within:opacity-90"
              style={{ backgroundColor: glowColor }}
            />

            <Link
              href={card.href}
              aria-label={label}
              onClick={handleOpen}
              className="relative block h-full w-full overflow-hidden rounded-[14px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[13px] bg-ink-2 [container-type:inline-size]">
                <div className="pointer-events-none absolute inset-[1px] z-10 rounded-[12px] shadow-[inset_0_0_0_1px_rgba(245,241,234,0.08)]" />

                {/* Artwork — ~70% of the card height (up from the old 50%):
                    with the stat block gone, the freed space goes entirely to
                    the art so these read as big-art collectible cards rather
                    than stat tiles. */}
                <div className="relative h-[70%] w-full shrink-0 overflow-hidden bg-ink">
                  {card.cardImageSrc || card.posterSrc ? (
                    <Image
                      // The hero card prefers its own artwork override
                      // (a single in-app screen, legible at this small
                      // size) over the case-study hero poster (often a
                      // wider multi-screen collage that reads poorly this
                      // small) — see `cardImageSrc` in loom-content.ts. The
                      // case study's own hero banner is untouched either
                      // way; this only changes what THIS card shows.
                      src={card.cardImageSrc || card.posterSrc}
                      alt=""
                      fill
                      priority={priority}
                      // `sizes` describes the RENDERED (post object-cover)
                      // width, not the box width. The art box's aspect is a
                      // constant ~1.02 now (both variants lock their OUTER
                      // box to a fixed aspect — see the H2 fix in
                      // HeroLoomCompact/HeroLoomHand — so cardH is always
                      // 1.4x cardW, and this box is always 70% of that).
                      // Habiteer/Woven's portrait single-screen overrides
                      // (~0.46 aspect) are always NARROWER than the box, so
                      // cover matches them to the box's own width with no
                      // extra zoom — same regime as a plain box-width fit.
                      // Bon Voyage's ~2:1 banner is still WIDER than the
                      // box, so it's still height-constrained, scaled up
                      // ~1.96x past the box's own width, and remains the
                      // worst case driving this value. Sized from that
                      // worst case at the largest real card width each
                      // variant reaches (the compact box caps around 171px
                      // wide on a capped tablet; the desktop box around
                      // 292px wide at 1920x1080) — see the round-4/round-5
                      // art-box audits — so nothing is upscaled more than
                      // ~1.15x at DPR 2.
                      sizes={compact ? "300px" : "500px"}
                      className="object-cover"
                      style={{ objectPosition: card.objectPosition ?? "center" }}
                    />
                  ) : null}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-2/30 via-transparent to-transparent"
                  />
                </div>

                {/* Title plate — no stat block, and no "No. 0X" index either
                    (see LoomCardProps' handleOpen: neither is passed to the
                    card-open overlay any more): Habiteer and Bon Voyage are
                    each "No. 01" in their own separate series, so side by
                    side an index would read as duplicated/wrong. Just the
                    title, generously padded, on a plate divided from the
                    artwork by a hairline in the card's own thread colour.
                    Title uses `cqw` (relative to this panel's own
                    `container-type: inline-size`, set above) so it scales
                    continuously with the card's REAL rendered size — which
                    varies well beyond the compact/desktop split alone (e.g.
                    the compact card is a different real px width on phone
                    vs tablet) — instead of jumping between two fixed sizes.
                    A non-heading element (not `<h3>`): these are link
                    captions, not document-outline headings, and having them
                    immediately follow the page's own `<h1>` was flagged as
                    an axe heading-order violation. */}
                <div
                  className={clsx(
                    "relative z-10 flex flex-1 flex-col justify-center border-t bg-ink-2",
                    compact ? "px-3 py-2.5" : "px-4 py-3.5",
                    align === "end" && "text-right",
                  )}
                  style={{ borderColor: hexToRgba(card.color, 0.28) }}
                >
                  {/* Titles are capped to ~48% of the plate's width and
                      pinned to the OUTER edge (self-start/self-end,
                      matching `align`): the fanned hand overlaps each side
                      card by roughly 45% on its INNER side, and a
                      full-width, single-line "Bon Voyage" (the longest
                      title) reached far enough across the plate that its
                      leading "B" fell under the centre card. Capping the
                      width keeps every glyph on the outer, uncovered side;
                      `line-clamp-2` (plain Tailwind core, no plugin) lets a
                      title that doesn't fit on one line wrap ("Bon" /
                      "Voyage") instead of colliding with the centre card —
                      verified via Range-based text-node bounds against the
                      centre card's rect at all 7 tested viewports. */}
                  <div
                    className={clsx(
                      "line-clamp-2 max-w-[48%] font-display leading-tight text-paper",
                      align === "end" ? "self-end" : "self-start",
                      compact
                        ? "text-[clamp(15px,calc(4px_+_9cqw),22px)]"
                        : "text-[clamp(18px,calc(7px_+_7cqw),29px)]",
                    )}
                  >
                    {card.title}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
