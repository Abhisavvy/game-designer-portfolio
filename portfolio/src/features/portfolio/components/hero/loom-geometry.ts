/**
 * Pure geometry/math for the hero Loom: layout numbers (card slots, thread
 * routes) for the desktop (full-bleed) and compact (tablet/mobile)
 * compositions, plus small helpers for building smooth cubic-bezier paths,
 * sine undulation, pointer attraction, and the glint dash-offset sweep. No
 * React, no DOM access — everything here is a plain function so it can be
 * called from render (SSR-safe) and from the rAF loop alike.
 */
import type { SkillThreadId } from "@/features/portfolio/data/site-content";
import { THREAD_COLOR, type LoomCardSlug } from "./loom-content";

export type Point = { x: number; y: number };

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Low-amplitude sine wobble, radians-based, evaluated at time `tMs`. */
export function sineOffset(tMs: number, speed: number, phase: number, amplitude: number): number {
  return Math.sin(tMs * speed + phase) * amplitude;
}

/** Left-edge midpoint of a `w`-wide box centred at (cx,cy) and rotated by `angleDeg`. */
export function cardLeftEdgeAnchor(cx: number, cy: number, w: number, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  const half = w / 2;
  return {
    x: cx - half * Math.cos(rad),
    y: cy - half * Math.sin(rad),
  };
}

/**
 * Builds a smooth multi-segment cubic-bezier "d" string through `points`
 * (2 or more). Each segment's control points sit at the horizontal midpoint
 * between its endpoints, taking each endpoint's own y — this guarantees a
 * horizontal (C1-continuous) tangent at every waypoint with zero extra
 * bookkeeping, which is what gives the threads their smooth, flowing look.
 */
export function buildSmoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const midX = a.x + (b.x - a.x) * 0.5;
    d += ` C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}

/** Polyline-sampled approximate length of a smooth path through `points` (see buildSmoothPath). */
export function approxPathLength(points: Point[], samplesPerSegment = 12): number {
  if (points.length < 2) return 0;
  let total = 0;
  let prev = points[0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const midX = a.x + (b.x - a.x) * 0.5;
    const c1 = { x: midX, y: a.y };
    const c2 = { x: midX, y: b.y };
    for (let s = 1; s <= samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const mt = 1 - t;
      const x =
        mt * mt * mt * a.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * b.x;
      const y =
        mt * mt * mt * a.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * b.y;
      total += Math.hypot(x - prev.x, y - prev.y);
      prev = { x, y };
    }
  }
  return total;
}

/** dasharray/dashoffset for a bright "glint" segment sweeping from the path's start (p=0) to its end (p=1). */
export function glintDash(p: number, glintLen: number, pathLen: number): { dasharray: string; dashoffset: number } {
  const gap = pathLen + glintLen;
  return {
    dasharray: `${glintLen} ${gap}`,
    dashoffset: glintLen - p * (pathLen + glintLen),
  };
}

export type CardSlot = { cx: number; cy: number; w: number; h: number; rotate: number };

export type HandPosition = "left" | "centre" | "right";

export type ThreadRoute = {
  id: SkillThreadId;
  color: string;
  /** Set for the 3 threads pinned to a card edge; null for the 3 ambient/background threads. */
  cardPosition: HandPosition | null;
  anchored: boolean;
  /** Base (undisturbed) waypoints: [start, mid, end], in the layout's own `viewBox` space. */
  points: Point[];
  /** Per-waypoint sine amplitude in viewBox units (x,y) — index-aligned with `points`. */
  amp: Point[];
  /** Per-waypoint sine speed (rad/ms) — index-aligned with `points`. */
  speed: number[];
  /** Per-waypoint sine phase (rad) — index-aligned with `points`. */
  phase: number[];
  /** Approximate nominal length, used for the glint sweep. */
  nominalLength: number;
};

/** A box positioned as percentages of some outer box — used to place the desktop card hand within the full-bleed section. */
export type PercentBox = { leftPct: number; topPct: number; widthPct: number; heightPct: number };

export type LoomLayout = {
  compact: boolean;
  viewBox: { w: number; h: number };
  grid: { size: number };
  /** Card slots keyed by hand position, left to right — in the layout's own `viewBox` space (== section space for compact; == hand-local space for desktop, see `handBox`/`handViewBox`). */
  cards: Record<HandPosition, CardSlot>;
  cardOrderForSlug: Record<LoomCardSlug, HandPosition>;
  routes: ThreadRoute[];
  /** Desktop only: where the (separately-scaled) card-hand box sits within the full-bleed section, as percentages. */
  handBox?: PercentBox;
  /** Desktop only: the local coordinate space `cards` above is expressed in — LoomCard maps `cards[pos]` against THIS box, not `viewBox`. */
  handViewBox?: { w: number; h: number };
};

const HAND_SLUGS: Record<HandPosition, LoomCardSlug> = {
  left: "habiteer",
  centre: "woven",
  right: "bon-voyage",
};

/**
 * Each position's anchored thread is the actual FIRST skill each project
 * lists in site-content (`project.skills[0]`, same lookup `loom-content.ts`
 * uses for the card's own colour) — never a skill the project doesn't
 * claim. economy -> habiteer (left), systems -> woven (centre, the
 * thread/weaving puzzle project — fitting, given the hero's own weaving
 * lines), retention -> bon-voyage (right). No two positions share a colour.
 */
const ANCHOR_SKILL_FOR_POSITION: Record<HandPosition, SkillThreadId> = {
  left: "economy",
  centre: "systems",
  right: "retention",
};

export const POSITION_KEYS: HandPosition[] = ["left", "centre", "right"];

function makeRoute(
  id: SkillThreadId,
  cardPosition: HandPosition | null,
  points: Point[],
  ampScale: number,
  seed: number,
): ThreadRoute {
  const midAmp = cardPosition ? ampScale * 0.55 : ampScale; // anchored threads wobble less right at the card
  const amp: Point[] = points.map((_, i) =>
    i === 1
      ? { x: midAmp * 0.5, y: midAmp } // the mid waypoint wobbles the most (it's the "control point")
      : { x: ampScale * 0.15, y: ampScale * 0.35 }, // start/end stay closer to their anchors
  );
  const speed = points.map((_, i) => 0.00028 + (seed % 5) * 0.00004 + i * 0.00003);
  const phase = points.map((_, i) => seed * 1.7 + i * 1.31);
  return {
    id,
    color: THREAD_COLOR[id],
    cardPosition,
    anchored: cardPosition !== null,
    points,
    amp,
    speed,
    phase,
    nominalLength: approxPathLength(points),
  };
}

const cardOrderForSlug = {
  [HAND_SLUGS.left]: "left",
  [HAND_SLUGS.centre]: "centre",
  [HAND_SLUGS.right]: "right",
} as Record<LoomCardSlug, HandPosition>;

// ---------------------------------------------------------------------------
// Desktop (>=1024px): a full-bleed threads layer spanning the ENTIRE hero
// section, plus a card hand positioned within it via `handBox` (percentages
// of the section box). The hand's own 3 card slots live in a small local
// coordinate space (`handViewBox`) — the same kind of numbers the original
// single-box Loom used — and `sectionPoint()` below is the one place that
// projects a point from that local space into section space, so the
// anchored threads' checkpoints land exactly on the card edges with no
// runtime measurement anywhere.
// ---------------------------------------------------------------------------

/** Nominal full-bleed canvas — an arbitrary but wide (~2.4:1) coordinate space stretched
 *  (`preserveAspectRatio="none"`) to fill the section's actual box, whatever its real aspect
 *  ratio turns out to be at a given viewport width. */
const SECTION_VIEWBOX = { w: 1200, h: 500 };
const HAND_VIEWBOX = { w: 600, h: 600 };
/**
 * `widthPct`/`heightPct` here are a SQUARE (equal) static guess only — used
 * for `sectionPoint()` below (the SSR-safe first-paint anchor, before any
 * measurement has run) and as the actual CSS width's percentage component in
 * HeroLoomHand. The REAL rendered hand box is sized `min(widthPct%, Nvh)`
 * with `aspect-ratio: 1` (see HeroLoomHand.tsx) so it's always a true square
 * — matching `HAND_VIEWBOX` — regardless of the section's own (auto-height,
 * viewport-width) aspect ratio; `useHeroLoom`'s ResizeObserver then measures
 * that real box and overrides this static guess once mounted, which is what
 * actually keeps the checkpoint rings on the card edges (see round-4 H2
 * audit — the OLD vh-based height made the box's real aspect diverge from
 * this static percentage math, sometimes badly).
 */
const HAND_BOX: PercentBox = { leftPct: 55, topPct: 15, widthPct: 45, heightPct: 45 };

function pctPoint(xPct: number, yPct: number): Point {
  return { x: (xPct / 100) * SECTION_VIEWBOX.w, y: (yPct / 100) * SECTION_VIEWBOX.h };
}

/** Projects a point from the hand's local space into full section space via `HAND_BOX`. */
function sectionPoint(local: Point): Point {
  const xPct = HAND_BOX.leftPct + (local.x / HAND_VIEWBOX.w) * HAND_BOX.widthPct;
  const yPct = HAND_BOX.topPct + (local.y / HAND_VIEWBOX.h) * HAND_BOX.heightPct;
  return pctPoint(xPct, yPct);
}

function buildDesktopLayout(): LoomLayout {
  const hand = { x: 300, y: 300 };
  // 225 (up from 185) — "make the cards bigger" — see HeroLoomHand's box
  // sizing for how this maps to real on-screen px at a given viewport.
  const cardW = 225;
  const cardH = Math.round((cardW * 7) / 5);

  // 134 (up from 124) — a modest fan-widening (round-6 fix): a side
  // card's title, right up against its OWN outer padding, could still
  // reach far enough across the card to have its leading glyph land under
  // the centre card at ~124's overlap (confirmed via Range-based text
  // bounds vs the centre card's rect: "Bon Voyage"'s "B" was covered at
  // several viewports). ~10 fewer local units of overlap buys every title
  // measured ~8-10px more real clearance, on top of the title-plate's own
  // max-width/wrap fix in LoomCard.tsx.
  const spacing = 134;
  const cards: LoomLayout["cards"] = {
    left: { cx: hand.x - spacing, cy: hand.y + 27, w: cardW, h: cardH, rotate: -9 },
    centre: { cx: hand.x, cy: hand.y - 12, w: cardW, h: cardH, rotate: 0 },
    right: { cx: hand.x + spacing, cy: hand.y + 27, w: cardW, h: cardH, rotate: 9 },
  };

  const anchorFor = (pos: HandPosition) => {
    const c = cards[pos];
    return sectionPoint(cardLeftEdgeAnchor(c.cx, c.cy, c.w, c.rotate));
  };

  const leftAnchor = anchorFor("left");
  const centreAnchor = anchorFor("centre");
  const rightAnchor = anchorFor("right");

  const routes: ThreadRoute[] = [
    // Ambient (unanchored) threads — pure background weave, spanning the
    // entire section edge-to-edge (the left fade and right run-off are both
    // handled by the layer's own CSS mask, not by these coordinates).
    // Together with the 3 anchored routes below, these cover all 6
    // SKILL_THREADS ids exactly once — "monetization" (previously the
    // centre anchor) moved here now that "systems" anchors Woven's card;
    // it used to be "systems", which would otherwise collide (duplicate
    // React key / duplicate thread) with the new centre anchor below.
    makeRoute("liveops", null, [pctPoint(-3, 20), pctPoint(34, 12), pctPoint(104, 16)], 22, 1),
    makeRoute("monetization", null, [pctPoint(-3, 78), pctPoint(30, 84), pctPoint(104, 74)], 24, 2),
    makeRoute("ai", null, [pctPoint(-3, 92), pctPoint(38, 89), pctPoint(104, 96)], 18, 3),
    // Anchored threads — pinned to each card's left edge, per ANCHOR_SKILL_FOR_POSITION.
    makeRoute(ANCHOR_SKILL_FOR_POSITION.left, "left", [pctPoint(-3, 34), leftAnchor, pctPoint(104, 28)], 16, 4),
    makeRoute(ANCHOR_SKILL_FOR_POSITION.centre, "centre", [pctPoint(-3, 60), centreAnchor, pctPoint(104, 66)], 16, 5),
    makeRoute(ANCHOR_SKILL_FOR_POSITION.right, "right", [pctPoint(-3, 8), rightAnchor, pctPoint(104, 52)], 16, 6),
  ];

  return {
    compact: false,
    viewBox: SECTION_VIEWBOX,
    grid: { size: 34 },
    cards,
    cardOrderForSlug,
    routes,
    handBox: HAND_BOX,
    handViewBox: HAND_VIEWBOX,
  };
}

/** Builds the compact (tablet/mobile, stacked-below-CTAs) layout: a small self-contained box with only the 3 card-anchored threads. */
function buildCompactLayout(): LoomLayout {
  const viewBox = { w: 360, h: 300 };
  const hand = { x: 195, y: 150 };
  // 140 (up from 116) — "make the cards bigger". The outer box that this
  // viewBox is stretched into is now a fixed `aspect-[6/5]` box (see
  // HeroLoomCompact.tsx), so — unlike before — X/Y scale together and these
  // cards render at their true nominal aspect at every width.
  const cardW = 140;
  const cardH = Math.round((cardW * 7) / 5);

  // 83 (up from 75) — same modest fan-widening as the desktop layout, see
  // its comment; kept just shy of proportionally identical (75->134 would
  // be ~84) to leave a bit more margin against this viewBox's own edges.
  const spacing = 83;
  const cards: LoomLayout["cards"] = {
    left: { cx: hand.x - spacing, cy: hand.y + 12, w: cardW, h: cardH, rotate: -9 },
    centre: { cx: hand.x, cy: hand.y - 6, w: cardW, h: cardH, rotate: 0 },
    right: { cx: hand.x + spacing, cy: hand.y + 12, w: cardW, h: cardH, rotate: 9 },
  };

  const anchorFor = (pos: HandPosition) => {
    const c = cards[pos];
    return cardLeftEdgeAnchor(c.cx, c.cy, c.w, c.rotate);
  };

  const routes: ThreadRoute[] = [
    makeRoute(
      ANCHOR_SKILL_FOR_POSITION.left,
      "left",
      [{ x: -8, y: 108 }, anchorFor("left"), { x: 368, y: 82 }],
      6,
      4,
    ),
    makeRoute(
      ANCHOR_SKILL_FOR_POSITION.centre,
      "centre",
      [{ x: -8, y: 196 }, anchorFor("centre"), { x: 368, y: 214 }],
      6,
      5,
    ),
    makeRoute(
      ANCHOR_SKILL_FOR_POSITION.right,
      "right",
      [{ x: -8, y: 56 }, anchorFor("right"), { x: 368, y: 188 }],
      6,
      6,
    ),
  ];

  return { compact: true, viewBox, grid: { size: 20 }, cards, cardOrderForSlug, routes };
}

const DESKTOP_LAYOUT = buildDesktopLayout();
const COMPACT_LAYOUT = buildCompactLayout();

/** Both layouts are precomputed once at module scope (pure, deterministic — safe for SSR). */
export function getLoomLayout(compact: boolean): LoomLayout {
  return compact ? COMPACT_LAYOUT : DESKTOP_LAYOUT;
}

/** The skill-thread id "owned" by the card at array index 0/1/2 (left/centre/right). */
export function skillForCardIndex(index: number): SkillThreadId {
  return ANCHOR_SKILL_FOR_POSITION[POSITION_KEYS[index]];
}

/**
 * Projects a fraction (0..1, 0..1) of the section's OWN real rendered box
 * into SECTION_VIEWBOX units. Used by `useHeroLoom`'s ResizeObserver to turn
 * a MEASURED hand-box rect (as fractions of the measured section rect) into
 * the same coordinate space `HeroLoomThreads` draws in — the runtime
 * equivalent of `sectionPoint()` above, but from real geometry instead of a
 * static guess, which is what actually keeps the checkpoint rings glued to
 * the card edges regardless of the section's real (auto-height,
 * viewport-width-driven) aspect ratio.
 */
function sectionFractionToViewBox(xFrac: number, yFrac: number): Point {
  return { x: xFrac * SECTION_VIEWBOX.w, y: yFrac * SECTION_VIEWBOX.h };
}

export { HAND_SLUGS, ANCHOR_SKILL_FOR_POSITION, SECTION_VIEWBOX, sectionFractionToViewBox };
