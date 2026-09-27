"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import type { ProjectItem } from "@/features/portfolio/data/site-content";
import { getProjectListingImageSources } from "@/features/portfolio/utils/project-media";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { clsx } from "clsx";
import { CardFront, CardBack } from "./CardFaces";
import { useCardTilt } from "./useCardTilt";
import { useFinePointer } from "./useFinePointer";
import { THREAD_COLOR, hexToRgba, dealRotationForIndex } from "./card-content";
import { useCardOpenNavigation } from "../transitions/useCardOpenNavigation";
import { isPlainLeftClick, captureArtwork } from "../transitions/cardActivation";

export type CardEntranceMode = "deal" | "fan" | "none";

export interface CardEntrance {
  /** "deal" = Work section's dealt-from-the-deck reveal; "fan" = Projects' booster-pack fan-out; "none" = no viewport entrance choreography. */
  mode: CardEntranceMode;
  /** 0-based stagger order within its reveal group. */
  order: number;
  /** True once the section has entered the viewport (single trigger, owned by the parent section). */
  play: boolean;
  /**
   * True when `play` resolved WITHOUT ever needing a scroll-triggered
   * reveal (see `useInstantSectionInView`) — the resting pose should just
   * already BE there, with no transition at all, rather than replaying the
   * animated deal-in/fan-in it never actually needed. Forcing a real
   * transition through this path was the source of a real, reproduced bug:
   * the animated entrance occasionally reset back to its start pose and
   * replayed once, specifically on a same-page client navigation (e.g. "<-
   * Back to work") — even though `play` itself never flipped back to
   * false. A zero-duration transition removes the only window that needed.
   */
  instant?: boolean;
  /** "fan" only — a small px offset pulling the card toward the booster pack's centre before it fans out to its grid slot. */
  fanOffset?: number;
}

export interface CollectibleCardProps {
  project: ProjectItem;
  /** Zero-padded index within its section, e.g. "01". */
  displayIndex: string;
  posterSrc?: string | null;
  entrance: CardEntrance;
  reducedMotion: boolean;
  className?: string;
}

const STAGGER_SECONDS: Record<CardEntranceMode, number> = { deal: 0.07, fan: 0.12, none: 0 };
/** Lets the booster pack's shake + tear read before the cards start fanning out. */
const FAN_BASE_DELAY = 0.5;

interface EntranceState {
  opacity: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

function getEntranceState(entrance: CardEntrance, reducedMotion: boolean, rotationSeed: number): EntranceState {
  if (reducedMotion || entrance.mode === "none") {
    return { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 };
  }
  if (!entrance.play) {
    if (entrance.mode === "deal") {
      return { opacity: 0, x: 0, y: 64, rotate: rotationSeed, scale: 0.9 };
    }
    return { opacity: 0, x: entrance.fanOffset ?? 0, y: 28, rotate: rotationSeed, scale: 0.86 };
  }
  return { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 };
}

function getEntranceDelay(entrance: CardEntrance): number {
  const stagger = STAGGER_SECONDS[entrance.mode] * entrance.order;
  return entrance.mode === "fan" ? FAN_BASE_DELAY + stagger : stagger;
}

export function CollectibleCard({
  project,
  displayIndex,
  posterSrc,
  entrance,
  reducedMotion: reducedMotionProp,
  className,
}: CollectibleCardProps) {
  const primarySkill = project.skills?.[0] ?? "systems";
  const threadColor = THREAD_COLOR[primarySkill];
  const { src, fallbackSrc, secondaryFallback } = getProjectListingImageSources(project.slug, posterSrc ?? null);

  const [flipped, setFlipped] = useState(false);
  const rootBtnRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  // `reducedMotionProp` (usePrefersReducedMotion, a useSyncExternalStore hook
  // — see useMediaPreferences.ts) uses a "safe" SSR default of `true` for
  // both the server render and the FIRST client render, then corrects to the
  // real value. That correction is a genuinely SEPARATE, LATER commit here —
  // measured up to ~150ms after hydration (scratchpad/qa/results/
  // work-reset-*.json) — and while `entrance.play` is still false (the
  // common case: the section hasn't scrolled into view yet), the gap
  // between those two commits painted a real, visible frame: reducedMotion
  // true -> entranceState visible (opacity 1) -> corrects to false ->
  // entranceState hidden (opacity 0, since play hasn't resolved), a genuine
  // flash that a subsequently-resolving `entrance.play` could then read as
  // having "reset". Resolving `matchMedia` ourselves in a layout effect
  // fixes it the same way LoomCard/useHeroLoom already fix their own
  // hydration-flash: synchronously, before the browser's first paint, so
  // this card's branching never sees the transient default at all. The
  // follow-up effect keeps tracking the live prop afterward (skipping only
  // its own first, mount-time run) so a real mid-session OS preference
  // change still propagates, same as before.
  const [reducedMotion, setReducedMotion] = useState(reducedMotionProp);
  useLayoutEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const skippedMountSyncRef = useRef(false);
  useEffect(() => {
    if (!skippedMountSyncRef.current) {
      skippedMountSyncRef.current = true;
      return;
    }
    setReducedMotion(reducedMotionProp);
  }, [reducedMotionProp]);

  const finePointer = useFinePointer();
  const holoEnabled = finePointer && !reducedMotion;
  const tilt = useCardTilt(holoEnabled);
  const { activate, prefetch } = useCardOpenNavigation();

  const { ref: visibilityRef, isIntersecting: cardVisible } = useIntersectionObserver({
    threshold: 0,
    triggerOnce: false,
  });

  // One static outer box serves three purposes at once: intersection
  // visibility, the tilt's pointer/rect hit-area, and (via handleOpen) the
  // card-open overlay's start rect. It is never itself transformed, so none
  // of those measurements ever read a moving target.
  const setCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      visibilityRef.current = node;
      tilt.hitRef.current = node;
    },
    [visibilityRef, tilt.hitRef],
  );

  // Prefetch as soon as the card is on-screen; hover/focus (below) cover the
  // rest. router.prefetch is idempotent/cheap to call repeatedly.
  useEffect(() => {
    if (cardVisible) prefetch(project.href);
  }, [cardVisible, prefetch, project.href]);

  const flipToBack = useCallback(() => setFlipped(true), []);
  const flipToFront = useCallback(() => {
    setFlipped(false);
    requestAnimationFrame(() => rootBtnRef.current?.focus());
  }, []);

  // When flipped, move focus onto the case-study link once the flip has (mostly) settled.
  useEffect(() => {
    if (!flipped) return;
    const delay = reducedMotion ? 60 : 380;
    const t = window.setTimeout(() => linkRef.current?.focus(), delay);
    return () => window.clearTimeout(t);
  }, [flipped, reducedMotion]);

  const handleBackKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        flipToFront();
      }
    },
    [flipToFront],
  );

  // Triggered by either the front title's "Open" link or the back face's "Read the case study"
  // link. Plain left-clicks measure the card's own (static) box, hand it to the overlay-clone
  // "open" animation, and push the route immediately; anything else (modifier keys, middle/right
  // click) is left alone so the browser's native new-tab/context-menu behaviour on the real
  // <a href> still works.
  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(event)) return;

      const node = tilt.hitRef.current;
      const rect = node?.getBoundingClientRect();
      const artwork = captureArtwork(node);
      tilt.onPointerLeave(event as unknown as React.PointerEvent<HTMLDivElement>);

      activate(event, {
        href: project.href,
        reducedMotion,
        panelRect: rect
          ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
          : { top: 0, left: 0, width: 0, height: 0 },
        artworkRect: artwork ?? (rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : { top: 0, left: 0, width: 0, height: 0 }),
        visual: {
          currentSrc: artwork?.currentSrc ?? src,
          objectPosition: artwork?.objectPosition ?? "center",
          title: project.title,
          statValue: project.stats?.[0]?.value,
          statLabel: project.stats?.[0]?.label,
          displayIndex,
          threadColor,
          fromRotateX: tilt.rotateX.get(),
          fromRotateY: tilt.rotateY.get(),
        },
      });
    },
    [tilt, activate, reducedMotion, project.href, project.title, project.stats, src, displayIndex, threadColor],
  );

  const rotationSeed = dealRotationForIndex(entrance.order);
  const entranceDelay = getEntranceDelay(entrance);

  // Memoized on the underlying PRIMITIVE fields, not on `entrance`/the
  // returned objects themselves: `entrance` is a fresh object literal from
  // the parent section on every one of ITS renders (WorkSection/
  // ProjectsSection re-render for all sorts of unrelated reasons — a
  // sibling's scroll listener, etc. — not just when this card's own
  // entrance actually changes), so recomputing a brand new `transition`/
  // `animate`-target object every render regardless is needless churn.
  // Keeping the SAME object reference whenever the actual values haven't
  // changed is just good practice with Framer Motion in general.
  const entranceState = useMemo(
    () => getEntranceState(entrance, reducedMotion, rotationSeed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entrance.play, entrance.mode, entrance.fanOffset, reducedMotion, rotationSeed]
  );

  const sharedTransition: Transition = useMemo(() => {
    // `entrance.instant`: force zero-duration regardless of `play` — see
    // `CardEntrance.instant`'s own comment for why.
    const entranceTransition: Transition =
      entrance.play && !entrance.instant
        ? { type: "spring", stiffness: 240, damping: 23, delay: entranceDelay }
        : { duration: 0 };
    // In reduced motion the opacity IS the flip mechanism (front/back crossfade instead of
    // rotating), so it needs to read as a quick, deliberate "instant swap" rather than reusing the
    // slower entrance-settle fade.
    const entranceOpacityTransition: Transition = reducedMotion
      ? { duration: 0.15 }
      : entrance.play && !entrance.instant
        ? { duration: 0.4, delay: entranceDelay }
        : { duration: 0 };
    const flipTransition: Transition = reducedMotion
      ? { duration: 0 }
      : { type: "spring", stiffness: 170, damping: 20 };
    return {
      default: entranceTransition,
      opacity: entranceOpacityTransition,
      rotateY: flipTransition,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrance.play, entrance.instant, entranceDelay, reducedMotion]);

  const frontOpacity = reducedMotion ? (flipped ? 0 : 1) : entranceState.opacity;
  const backOpacity = reducedMotion ? (flipped ? 1 : 0) : entranceState.opacity;
  const frontRotateY = reducedMotion ? 0 : flipped ? 180 : 0;
  const backRotateY = reducedMotion ? 0 : flipped ? 360 : 180;

  const frontAnimate = useMemo(
    () => ({
      opacity: frontOpacity,
      x: entranceState.x,
      y: entranceState.y,
      rotate: entranceState.rotate,
      scale: entranceState.scale,
      rotateY: frontRotateY,
    }),
    [frontOpacity, entranceState, frontRotateY]
  );
  const backAnimate = useMemo(
    () => ({
      opacity: backOpacity,
      x: entranceState.x,
      y: entranceState.y,
      rotate: entranceState.rotate,
      scale: entranceState.scale,
      rotateY: backRotateY,
    }),
    [backOpacity, entranceState, backRotateY]
  );

  const shimmerAllowed = !reducedMotion && (entrance.mode === "none" || entrance.play);
  const shimmerDelay = (entrance.order % 5) * 1.1;
  const threadGlow = hexToRgba(threadColor, 0.55);
  const threadBorder = hexToRgba(threadColor, 0.45);

  // Each face's own glow — a `box-shadow` on the SAME element that carries that face's
  // `backfaceVisibility: hidden` and rotateY. A box-shadow is part of that element's own paint,
  // so when the face rotates edge-on/away it is hidden along with the rest of the face; nothing
  // is left behind to bleed through mid-flip the way a separate, non-rotating glow layer would.
  const faceBaseStyle: React.CSSProperties = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    overflow: "hidden",
    border: `1px solid ${threadBorder}`,
    boxShadow: "0 0 0 0 transparent",
  };

  return (
    <div
      ref={setCardRef}
      data-testid="collectible-card"
      data-slug={project.slug}
      className={clsx(
        "relative aspect-[5/7] w-[min(100%,340px)] shrink-0 grow-0 rounded-[18px] [perspective:1200px] sm:w-[300px] lg:w-[280px]",
        // The flip button underneath CardFront is full-bleed (`inset-0`) and
        // its own :focus-visible ring is drawn by an element that has
        // `overflow: hidden` (faceBaseStyle, right below) — a ring extends
        // outside its box, and overflow:hidden clips an element's own
        // box-shadow along with everything else, so that ring was rendering
        // fully invisible. Drawn instead on this outer box, which has no
        // overflow clipping of its own and wraps both faces.
        "has-[[data-testid=card-flip-button]:focus-visible]:ring-2 has-[[data-testid=card-flip-button]:focus-visible]:ring-accent has-[[data-testid=card-flip-button]:focus-visible]:ring-offset-2 has-[[data-testid=card-flip-button]:focus-visible]:ring-offset-ink",
        className,
      )}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onPointerEnter={() => prefetch(project.href)}
      onFocus={() => prefetch(project.href)}
    >
      {/* Inner, transformed layer — the tilt springs live here, never on the
          static hit-area above, so lifting/rotating this never moves what
          the pointer handlers are attached to. */}
      <motion.div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
      >
        <motion.div
          className="group absolute inset-0 z-10 rounded-[18px] transition-shadow duration-300 hover:shadow-[0_0_44px_-6px_var(--thread-glow)] focus-within:shadow-[0_0_44px_-6px_var(--thread-glow)]"
          style={{ ...faceBaseStyle, ["--thread-glow" as string]: threadGlow }}
          initial={false}
          animate={frontAnimate}
          transition={sharedTransition}
        >
          {/*
            An invisible full-bleed flip button UNDER the visual content, plus a real, separately
            focusable "open" link (the title, inside CardFront) ON TOP of it — siblings, not
            nested, so both stay keyboard-reachable and the HTML stays valid. CardFront's own root
            is pointer-events-none so clicks fall through to this button everywhere except the
            title link, which re-enables pointer-events itself.
          */}
          <button
            ref={rootBtnRef}
            type="button"
            data-testid="card-flip-button"
            aria-pressed={flipped}
            aria-label={`${project.title}: show stats`}
            className="absolute inset-0 z-0 rounded-[18px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            onClick={flipToBack}
            inert={flipped ? true : undefined}
            tabIndex={flipped ? -1 : 0}
          />
          <CardFront
            project={project}
            displayIndex={displayIndex}
            imageSrc={src}
            fallbackSrc={fallbackSrc}
            secondaryFallback={secondaryFallback}
            primarySkill={primarySkill}
            threadColor={threadColor}
            // Never eager: these cards are Work/Projects grid items, well
            // below the fold on every breakpoint we ship, including the
            // first couple in the grid on a narrow single-column layout. A
            // DPR-3 phone was fetching w=1920 posters for up to four
            // never-yet-scrolled-to cards before `priority` was removed.
            holoEnabled={!flipped && holoEnabled}
            shimmerActive={!flipped && shimmerAllowed && cardVisible}
            shimmerDelay={shimmerDelay}
            onOpen={handleOpen}
          />
        </motion.div>

        <motion.div
          className="group absolute inset-0 z-10 rounded-[18px] transition-shadow duration-300 hover:shadow-[0_0_44px_-6px_var(--thread-glow)] focus-within:shadow-[0_0_44px_-6px_var(--thread-glow)]"
          style={{ ...faceBaseStyle, ["--thread-glow" as string]: threadGlow }}
          initial={false}
          animate={backAnimate}
          transition={sharedTransition}
          onKeyDown={handleBackKeyDown}
          inert={!flipped ? true : undefined}
        >
          <CardBack
            project={project}
            displayIndex={displayIndex}
            threadColor={threadColor}
            linkRef={linkRef}
            onFlipBack={flipToFront}
            onOpen={handleOpen}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
