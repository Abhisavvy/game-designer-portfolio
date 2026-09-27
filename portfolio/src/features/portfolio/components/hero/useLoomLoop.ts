"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import {
  buildSmoothPath,
  clamp,
  glintDash,
  lerp,
  POSITION_KEYS,
  sineOffset,
  skillForCardIndex,
  type LoomLayout,
  type Point,
} from "./loom-geometry";

/** Tailwind's `lg` breakpoint — matches the `lg:hidden`/`hidden lg:block` CSS split in HeroAnimated. */
const DESKTOP_MQ = "(min-width: 1024px)";

/** Control points within this many SVG-viewBox units of the pointer bend toward it. */
const PULL_RADIUS = 140;
/** Maximum bend displacement at zero distance. */
const MAX_PULL = 22;
/** Exponential-ease factor applied per frame when chasing the pointer target (and springing back). */
const BEND_EASE = 0.1;

export const MAIN_STROKE = 2.2;
const MAIN_STROKE_HOVER = 3.4;
export const GLOW_STROKE_EXTRA = 7;

const GLINT_LEN = 30;
const GLINT_MIN_INTERVAL = 2600;
const GLINT_MAX_INTERVAL = 5200;
const GLINT_MIN_DURATION = 950;
const GLINT_MAX_DURATION = 1500;

const CARD_FLOAT_AMP = 6;
const CARD_FLOAT_SPEED = 0.00062;
const CARD_FLOAT_PHASES = [0, 2.1, 4.3];
const HOVER_LIFT = -10;
const HAND_TILT_MAX_DEG = 6;
/** How long a card must stay hovered before its lift is force-settled (see
 *  `cardMotionSettled` below) — long enough that the CARD_SPRING transition
 *  is always visually finished (worst case, the full idle-float amplitude
 *  away from HOVER_LIFT, settles to sub-pixel well under 250ms), short
 *  enough to land comfortably inside the ~700ms a real hover-shimmer check
 *  holds still for. */
const HOVER_SETTLE_MS = 350;

/** Lerps `current` toward `target`, snapping to the EXACT target once within
 *  `epsilon` — plain `lerp` alone only asymptotically approaches a target,
 *  technically changing by a shrinking (but non-zero) amount forever, which
 *  reads as continuous sub-pixel motion even once visually "settled" (see
 *  the hover-shimmer fix in `updateCards`). Snapping is what lets a value
 *  genuinely stop changing frame-to-frame. */
function approach(current: number, target: number, rate: number, epsilon = 0.02): number {
  const next = lerp(current, target, rate);
  return Math.abs(next - target) < epsilon ? target : next;
}

export type CardMotionSet = {
  y: MotionValue<number>;
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
};

export interface UseLoomLoopArgs {
  layout: LoomLayout;
  /** Off entirely under prefers-reduced-motion: no loop, no listeners, paths stay at their base `d`. */
  reducedMotion: boolean;
  /** Gate for actually starting the loop — flips true once the entrance sequence has settled. */
  enabled: boolean;
  /** The section-level (or, for the compact variant, the small box's own) element — pointer-bend tracking and the offscreen-pause IntersectionObserver both key off it. */
  containerRef: React.RefObject<HTMLElement | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  mainRefs: React.RefObject<(SVGPathElement | null)[]>;
  glowRefs: React.RefObject<(SVGPathElement | null)[]>;
  glintRefs: React.RefObject<(SVGPathElement | null)[]>;
  checkpointRefs: React.RefObject<(SVGGElement | null)[]>;
  hoveredIndexRef: React.RefObject<number | null>;
  cardMotion: CardMotionSet[];
  /** The SAME 3 properties as `cardMotion`, but the spring-SMOOTHED values
   *  actually bound to each card's rendered style (see `useHeroLoom`'s
   *  `y0/rotate0/scale0`, etc.) — passed here ONLY so a sustained hover can
   *  force-settle them (see `HOVER_SETTLE_MS`). A physically-simulated
   *  spring never reaches its target in EXACTLY finite time (it keeps
   *  emitting shrinking-but-nonzero updates until its own internal rest
   *  threshold trips), which occasionally hadn't crossed that threshold
   *  within a ~700ms hold — leaving a still-technically-live spring
   *  re-rasterising the title text a few sub-pixel steps more. Optional:
   *  the COMPACT variant's `cardMotion` values are plain `useMotionValue`s
   *  with no spring layer at all (`updateCards` writes them directly, so
   *  they're already bit-exact the instant the target itself stops
   *  changing) — only the desktop hook (`useHeroLoom`), which wraps each
   *  property in `useSpring`, needs to pass this.
   */
  cardMotionSettled?: CardMotionSet[];
  fanAngles: number[];
  handTiltX: MotionValue<number>;
  handTiltY: MotionValue<number>;
  /** Desktop only: live-measured left-edge anchors (SECTION_VIEWBOX space),
   *  index-aligned with card index — see `useHeroLoom`'s ResizeObserver.
   *  When an entry is non-null, it REPLACES that anchored route's static
   *  `points[1]` as the sway/bend base point (still swaying/bending exactly
   *  as before, just around a measured point instead of a guessed one). */
  anchorsRef?: React.RefObject<(Point | null)[]>;
  /** Edge-triggered (only called on an actual true<->false transition, not
   *  every frame) — `true` while the hand-wide pointer-parallax tilt is
   *  live (a fine pointer is over the hand and/or the tilt hasn't settled
   *  back to exactly 0 yet), `false` once fully at rest. The component
   *  uses this to render a literal `transform: none` at rest instead of an
   *  always-on `perspective(1000px)` — see the hover-shimmer fix. */
  onHandActiveChange?: (active: boolean) => void;
}

type GlintState = { routeIndex: number; start: number; duration: number };

/**
 * Owns HeroLoom's single rAF loop: thread undulation + pointer attraction,
 * the glint sweep, and the card hand's idle float / hover lift / pointer
 * parallax tilt. Everything here writes directly to DOM attributes or
 * Framer `MotionValue`s (no React state, no re-renders) so the ongoing
 * animation never causes layout thrash.
 *
 * Paused via IntersectionObserver (offscreen) and `document.visibilitychange`
 * (backgrounded tab); never started at all when `reducedMotion` is true.
 * The container's `data-loom-state` attribute reflects the current status
 * for debugging/instrumentation.
 */
export function useLoomLoop({
  layout,
  reducedMotion,
  enabled,
  containerRef,
  svgRef,
  mainRefs,
  glowRefs,
  glintRefs,
  checkpointRefs,
  hoveredIndexRef,
  cardMotion,
  cardMotionSettled,
  fanAngles,
  handTiltX,
  handTiltY,
  anchorsRef,
  onHandActiveChange,
}: UseLoomLoopArgs) {
  const bendStatesRef = useRef<Point[][]>([]);
  const pointerRef = useRef<Point | null>(null);

  useEffect(() => {
    bendStatesRef.current = layout.routes.map((route) => route.points.map(() => ({ x: 0, y: 0 })));
  }, [layout]);

  useEffect(() => {
    const container = containerRef.current;

    if (reducedMotion || !enabled) {
      if (container) container.dataset.loomState = reducedMotion ? "reduced" : "idle";
      return;
    }

    const svg = svgRef.current;
    const finePointer = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

    // M5 fix: this hook runs for BOTH the compact and desktop compositions,
    // which are always both mounted (only CSS `hidden`/`lg:hidden` toggles
    // which one is visible — see HeroAnimated). Without this, the desktop
    // loop's own IntersectionObserver (below) sees its always-present
    // `<section>` container as "intersecting" and runs full-speed even on a
    // phone where its SVG/cards are `display:none`, running TWO loops at
    // once. `layout.compact` tells each instance which breakpoint it's
    // FOR, so it can gate itself to only the matching side of that same
    // `lg` split.
    const desktopMq = typeof window !== "undefined" ? window.matchMedia(DESKTOP_MQ) : null;
    let breakpointOk = desktopMq ? (layout.compact ? !desktopMq.matches : desktopMq.matches) : true;

    let rafId: number | null = null;
    let visible = true;
    // Hover-shimmer fix: whether the hand-wide tilt is currently live — see
    // `onHandActiveChange` and `updateCards` below.
    let handActive = false;
    // Hover-shimmer fix (force-settle): per-card wall-clock timestamp of when
    // its CURRENT hover session started (`null` when not hovered), and
    // whether that session has already been force-settled — see
    // `cardMotionSettled`/`HOVER_SETTLE_MS` in `updateCards`.
    const hoverStartedAt: (number | null)[] = cardMotion.map(() => null);
    const hoverSettled: boolean[] = cardMotion.map(() => false);
    const glints: GlintState[] = [];
    let nextGlintAt = performance.now() + 900 + Math.random() * 1200;
    // L7 fix: per-route write caches so a frame that changes nothing about a
    // route's hover/dim state (the overwhelming majority of frames, since
    // hover only toggles occasionally) skips the `style.opacity`/
    // `setAttribute("stroke-width", ...)` writes entirely instead of
    // reapplying an identical value 60 times a second.
    const lastMainOpacity: (string | null)[] = [];
    const lastStrokeWidth: (string | null)[] = [];
    const lastGlowOpacity: (string | null)[] = [];

    function toSvgPoint(clientX: number, clientY: number): Point | null {
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      return {
        x: ((clientX - rect.left) / rect.width) * layout.viewBox.w,
        y: ((clientY - rect.top) / rect.height) * layout.viewBox.h,
      };
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      pointerRef.current = toSvgPoint(e.clientX, e.clientY);
    }
    function onPointerLeave() {
      pointerRef.current = null;
    }

    if (finePointer && container) {
      container.addEventListener("pointermove", onPointerMove, { passive: true });
      container.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    function updateThreads(t: number) {
      const pointer = pointerRef.current;
      const hovered = hoveredIndexRef.current;

      layout.routes.forEach((route, i) => {
        const bendState = bendStatesRef.current[i];
        const measuredAnchorIndex = route.cardPosition != null ? POSITION_KEYS.indexOf(route.cardPosition) : -1;
        const measuredAnchor = measuredAnchorIndex >= 0 ? anchorsRef?.current?.[measuredAnchorIndex] : null;
        const pts = route.points.map((base, wi) => {
          // Anchored routes' mid waypoint (wi 1) tracks the card's REAL,
          // measured left-edge position once available (see useHeroLoom's
          // ResizeObserver) instead of the static build-time guess — same
          // sway/bend maths on top either way, just a different base point.
          const effectiveBase = wi === 1 && measuredAnchor ? measuredAnchor : base;
          const swayX = effectiveBase.x + sineOffset(t, route.speed[wi], route.phase[wi], route.amp[wi].x);
          const swayY =
            effectiveBase.y + sineOffset(t, route.speed[wi] * 1.3, route.phase[wi] + 0.7, route.amp[wi].y);

          let targetX = 0;
          let targetY = 0;
          if (pointer) {
            const dx = pointer.x - swayX;
            const dy = pointer.y - swayY;
            const dist = Math.hypot(dx, dy);
            if (dist < PULL_RADIUS && dist > 0.001) {
              const pull = (1 - dist / PULL_RADIUS) * MAX_PULL;
              targetX = (dx / dist) * pull;
              targetY = (dy / dist) * pull;
            }
          }
          const bend = bendState?.[wi];
          if (bend) {
            bend.x = lerp(bend.x, targetX, BEND_EASE);
            bend.y = lerp(bend.y, targetY, BEND_EASE);
          }
          return { x: swayX + (bend?.x ?? 0), y: swayY + (bend?.y ?? 0) };
        });

        const d = buildSmoothPath(pts);
        const mainEl = mainRefs.current?.[i];
        const glowEl = glowRefs.current?.[i];
        if (mainEl) mainEl.setAttribute("d", d);
        if (glowEl) glowEl.setAttribute("d", d);

        const isMine = hovered != null && route.cardPosition != null && route.id === skillForCardIndex(hovered);
        const dimmed = hovered != null && !isMine;
        if (mainEl) {
          const opacityVal = isMine ? "1" : dimmed ? "0.4" : "0.85";
          if (lastMainOpacity[i] !== opacityVal) {
            mainEl.style.opacity = opacityVal;
            lastMainOpacity[i] = opacityVal;
          }
          const strokeWidthVal = String(isMine ? MAIN_STROKE_HOVER : MAIN_STROKE);
          if (lastStrokeWidth[i] !== strokeWidthVal) {
            mainEl.setAttribute("stroke-width", strokeWidthVal);
            lastStrokeWidth[i] = strokeWidthVal;
          }
        }
        if (glowEl) {
          const glowOpacityVal = isMine ? "0.55" : dimmed ? "0.12" : "0.32";
          if (lastGlowOpacity[i] !== glowOpacityVal) {
            glowEl.style.opacity = glowOpacityVal;
            lastGlowOpacity[i] = glowOpacityVal;
          }
        }

        if (route.cardPosition != null) {
          const cardIndex = POSITION_KEYS.indexOf(route.cardPosition);
          const node = checkpointRefs.current?.[cardIndex];
          const mid = pts[1];
          if (node && mid) node.setAttribute("transform", `translate(${mid.x}, ${mid.y})`);
        }
      });
    }

    function updateGlints(t: number) {
      if (t > nextGlintAt && glints.length < (glintRefs.current?.length ?? 0)) {
        const routeIndex = Math.floor(Math.random() * layout.routes.length);
        glints.push({
          routeIndex,
          start: t,
          duration: GLINT_MIN_DURATION + Math.random() * (GLINT_MAX_DURATION - GLINT_MIN_DURATION),
        });
        nextGlintAt = t + GLINT_MIN_INTERVAL + Math.random() * (GLINT_MAX_INTERVAL - GLINT_MIN_INTERVAL);
      }

      let slot = 0;
      for (let gi = glints.length - 1; gi >= 0; gi--) {
        const g = glints[gi];
        const p = (t - g.start) / g.duration;
        if (p >= 1) {
          glints.splice(gi, 1);
          continue;
        }
      }
      for (const g of glints) {
        const el = glintRefs.current?.[slot];
        if (!el) {
          slot++;
          continue;
        }
        const route = layout.routes[g.routeIndex];
        const mainEl = mainRefs.current?.[g.routeIndex];
        const liveD = mainEl?.getAttribute("d");
        if (liveD) el.setAttribute("d", liveD);
        const p = clamp((t - g.start) / g.duration, 0, 1);
        const { dasharray, dashoffset } = glintDash(p, GLINT_LEN, route.nominalLength);
        el.setAttribute("stroke-dasharray", dasharray);
        el.setAttribute("stroke-dashoffset", String(dashoffset));
        el.setAttribute("stroke", route.color);
        el.style.opacity = String(Math.sin(Math.PI * p) * 0.95);
        slot++;
      }
      for (let i = slot; i < (glintRefs.current?.length ?? 0); i++) {
        const el = glintRefs.current?.[i];
        if (el) el.style.opacity = "0";
      }
    }

    function updateCards(t: number) {
      const hovered = hoveredIndexRef.current;
      cardMotion.forEach((cm, i) => {
        const isHover = hovered === i;
        // Hover-shimmer fix (part 1): a hovered/focused card must come to a
        // COMPLETE rest. Previously the idle float (`idle + HOVER_LIFT`)
        // kept feeding the spring a continuously-changing sub-pixel target
        // even while hovered, and `HOVER_SCALE` (!= 1) re-rasterises text on
        // every one of those frames — together, continuous text
        // re-rasterisation read as flicker. Now a hovered card's `y` target
        // is the FIXED `HOVER_LIFT` (no idle sine term at all — the spring
        // settles onto it, exactly, and then genuinely stops), and `scale`
        // never leaves 1 (lift + the existing CSS glow/border are the hover
        // affordance instead).
        const yTarget = isHover ? HOVER_LIFT : sineOffset(t, CARD_FLOAT_SPEED, CARD_FLOAT_PHASES[i % CARD_FLOAT_PHASES.length], CARD_FLOAT_AMP);
        cm.y.set(yTarget);
        // `rotate` never changes on hover any more either (previously
        // `fan * 0.35`, a "straighten slightly" cue): for the two ±9deg
        // side cards, that was itself a ~6deg spring step, which — at the
        // title's distance from the card's rotation centre (its own
        // middle, well above the title plate) — took noticeably longer to
        // fully settle than the lift alone, leaving a residual sub-pixel
        // rotation (and thus re-rasterising text) for several more frames
        // after the lift had already stopped moving. Lift + the existing
        // CSS glow/border are the whole hover affordance now.
        cm.rotate.set(fanAngles[i] ?? 0);
        cm.scale.set(1);

        // Hover-shimmer fix (force-settle): `cm` here is the RAW target —
        // CARD_SPRING (in useHeroLoom) smooths it into the value actually
        // rendered, and that spring keeps emitting shrinking-but-nonzero
        // updates for a while after `yTarget` stops moving (a physical
        // spring simulation, never a hard binary "arrived"). Framer's own
        // rest-detection eventually stops it, but occasionally not inside
        // a ~700ms hold — measured as a handful of still-changing
        // sub-pixel frames, re-rasterising the title text each time. Once
        // a hover has PLAINLY lasted long enough for that transition to be
        // visually over (see `HOVER_SETTLE_MS`), jump the rendered value
        // to the exact target once — stopping its animation outright —
        // rather than trust every possible timing/step-size combination to
        // cross Framer's internal threshold in time on its own.
        if (isHover) {
          if (hoverStartedAt[i] == null) hoverStartedAt[i] = t;
          const dwell = t - (hoverStartedAt[i] ?? t);
          if (!hoverSettled[i] && dwell > HOVER_SETTLE_MS) {
            const sprung = cardMotionSettled?.[i];
            if (sprung) {
              sprung.y.jump(HOVER_LIFT);
              sprung.rotate.jump(fanAngles[i] ?? 0);
              sprung.scale.jump(1);
            }
            hoverSettled[i] = true;
          }
        } else {
          hoverStartedAt[i] = null;
          hoverSettled[i] = false;
        }
      });

      // Hover-shimmer fix (part 2): the hand-wide pointer-parallax tilt
      // previously lerped toward its target/toward 0 forever, asymptotically
      // — technically still changing (by a shrinking but non-zero amount)
      // every frame even once visually "settled", which is exactly the kind
      // of continuous sub-pixel change that forces text re-rasterisation
      // under the wrapper's permanent 3D perspective context (see
      // HeroLoomHand/HeroLoomCompact's `onHandActiveChange` for the other
      // half of this fix — removing that permanent perspective at rest).
      // `approach()` below snaps to the EXACT target once within a small
      // epsilon, so both values genuinely stop changing — and this loop
      // reports that "at rest" transition (not per-frame) via
      // `onHandActiveChange`, letting the component switch to a literal
      // `transform: none` instead of an always-on `perspective(1000px)`.
      const pointer = pointerRef.current;
      let tx: number;
      let ty: number;
      let active: boolean;
      if (finePointer && pointer) {
        const nx = clamp((pointer.x - layout.viewBox.w / 2) / (layout.viewBox.w / 2), -1, 1);
        const ny = clamp((pointer.y - layout.viewBox.h / 2) / (layout.viewBox.h / 2), -1, 1);
        // Rate bumped from 0.12 -> 0.25: a stationary pointer needs this to
        // fully converge (see `approach()`) well inside the ~700ms a user
        // actually holds still for — 0.12 was still leaving a few frames of
        // (sub-pixel, but non-zero) residual motion at title positions far
        // from the hand's own centre, which re-rasterised that text a few
        // more times after the pointer had already stopped moving.
        ty = approach(handTiltY.get(), nx * HAND_TILT_MAX_DEG, 0.25);
        tx = approach(handTiltX.get(), -ny * HAND_TILT_MAX_DEG, 0.25);
        active = true;
      } else {
        tx = approach(handTiltX.get(), 0, 0.08);
        ty = approach(handTiltY.get(), 0, 0.08);
        active = !(tx === 0 && ty === 0);
      }
      if (handTiltX.get() !== tx) handTiltX.set(tx);
      if (handTiltY.get() !== ty) handTiltY.set(ty);
      if (active !== handActive) {
        handActive = active;
        onHandActiveChange?.(active);
      }
    }

    // L7 fix: `shouldRun()`/`ensureRunning()` are the single source of truth
    // for whether a frame gets scheduled at all — every pause reason
    // (offscreen, backgrounded tab, wrong breakpoint) now actually STOPS the
    // rAF chain instead of the callback firing every frame regardless and
    // merely skipping its own work.
    // A card-open overlay (`data-card-open` on <html>) covers the hero, and
    // the loop's per-frame path and filter work would otherwise compete with
    // the overlay's own animation for the main thread, stalling its first
    // frames on desktop.
    function cardOpening() {
      return document.documentElement.dataset.cardOpen === "1";
    }

    function shouldRun() {
      return visible && !document.hidden && breakpointOk && !cardOpening();
    }

    function updateLoomStateAttr() {
      if (!container) return;
      if (document.hidden) container.dataset.loomState = "paused-hidden";
      else if (cardOpening()) container.dataset.loomState = "paused-card-open";
      else if (!breakpointOk) container.dataset.loomState = "paused-breakpoint";
      else if (!visible) container.dataset.loomState = "paused-offscreen";
      else container.dataset.loomState = "active";
    }

    function frame(t: number) {
      if (!shouldRun()) {
        rafId = null;
        updateLoomStateAttr();
        return;
      }
      rafId = requestAnimationFrame(frame);
      updateThreads(t);
      updateGlints(t);
      updateCards(t);
    }

    function ensureRunning() {
      updateLoomStateAttr();
      if (rafId == null && shouldRun()) {
        rafId = requestAnimationFrame(frame);
      }
    }

    ensureRunning();

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        ensureRunning();
      },
      // Shrinks the effective viewport by the fixed header's height from
      // the top, so scrolling to "#work" (past the hero, but with a
      // sliver still technically within an unshrunk viewport, hidden
      // behind that fixed header) reports "not intersecting" — and this
      // loop actually stops — as soon as the hero is visually gone, not
      // only once it's fully scrolled past the raw viewport edge.
      { threshold: 0, rootMargin: "-88px 0px 0px 0px" },
    );
    if (container) io.observe(container);

    function onVisibilityChange() {
      ensureRunning();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Resume once a card-open overlay clears without navigating away (e.g.
    // Back while it was still covering the hero).
    const cardOpenObserver = new MutationObserver(() => ensureRunning());
    cardOpenObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-card-open"] });

    function onBreakpointChange(e: MediaQueryListEvent) {
      breakpointOk = layout.compact ? !e.matches : e.matches;
      ensureRunning();
    }
    desktopMq?.addEventListener("change", onBreakpointChange);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      io.disconnect();
      cardOpenObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      desktopMq?.removeEventListener("change", onBreakpointChange);
      if (container) {
        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerleave", onPointerLeave);
        container.dataset.loomState = "idle";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, reducedMotion, enabled]);
}
