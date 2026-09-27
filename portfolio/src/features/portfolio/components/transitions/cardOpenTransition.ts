/**
 * Framework-free state machine behind the card -> case-study "open" overlay.
 *
 * Why not the View Transitions API: `document.startViewTransition` freezes
 * the whole page on a snapshot until the new route's JS has compiled and
 * rendered (in dev, first compiles can take seconds), so users saw a frozen
 * hold and then an abrupt cut. This instead renders a small always-JS overlay
 * (a portalled clone of the clicked card) that we drive ourselves, so it can
 * hold on a loading state instead of freezing, and always plays the same way
 * in every browser (no feature-detection branch).
 *
 * This is a SHARED-ELEMENT landing, not just a generic expand-to-fullscreen:
 * the clone's artwork animates toward the real `CaseStudyHero` frame's own
 * rect (reported by that component once it mounts, and continuously
 * thereafter while this overlay is up — see `reportHeroTarget`), retargeting
 * smoothly if the real rect arrives or shifts mid-flight, so the reveal hands
 * off to a piece of art that's already sitting exactly where the clone left
 * it, rather than "growing to fullscreen, then cutting to a page whose real
 * image is somewhere else" (the old behaviour, visible as two images at once
 * for a frame). The fade that reveals the real page is itself gated on that
 * hand-off having actually finished animating (see `reportArtworkSettled`),
 * not on a fixed timer guess.
 *
 * Kept outside React (a tiny external store consumed via
 * `useSyncExternalStore`) because the trigger (a card deep in the tree), the
 * renderer (a singleton overlay mounted once in providers.tsx), and the
 * destination (`CaseStudyHero`, on a completely different page tree) don't
 * share a convenient common ancestor to prop-drill through. A plain module
 * with subscribe/getSnapshot is the smallest thing that connects all three.
 */

import { BP_COLORS } from "../blueprint/tokens";

export interface CardOpenRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CardOpenVisual {
  /** `img.currentSrc` — the exact URL the browser already decoded for the
   *  clicked card's artwork, not the raw `posterSrc` string, so the clone
   *  paints instantly from cache instead of re-fetching and painting
   *  progressively. */
  currentSrc: string;
  /** The source image's own computed `object-position` (cards use `top` or
   *  `center` depending on context) so the clone crops identically. */
  objectPosition: string;
  title: string;
  statValue?: string;
  statLabel?: string;
  displayIndex?: string;
  threadColor: string;
  /** Degrees the card was tilted/rotated at the moment of click — the overlay animates these back to 0 ("straightens") during the opening beat. */
  fromRotateX?: number;
  fromRotateY?: number;
  fromRotate?: number;
}

/** The destination `CaseStudyHero`'s own rendered media — reported alongside
 *  its rect once that component mounts (see `reportHeroTarget`). Some cards'
 *  own artwork now deliberately differs from the case study's hero image
 *  (e.g. a hero-hand card showing a single in-app screen while the hero
 *  banner keeps a wider collage — see LoomCard's `cardImageSrc`), so the
 *  overlay crossfades to this during the landing approach instead of
 *  cutting to a different picture the instant the panel fades. */
export interface CardOpenDestVisual {
  /** `img.currentSrc`, or the `<video>`'s `poster` when the destination
   *  renders video instead of an image (there's no equivalent "currentSrc"
   *  to read off a video, and the poster is the still frame actually
   *  visible until playback starts). */
  currentSrc: string;
  objectPosition: string;
}

export type CardOpenPhase = "opening" | "expanding" | "holding" | "leaving";

export interface CardOpenState {
  key: number;
  phase: CardOpenPhase;
  /** The href this session was opened for — used to detect a wrong-path
   *  route commit (Back, or navigating elsewhere mid-flight) and to let a
   *  duplicate activation of the SAME card be ignored rather than restart
   *  the session (see `markRouteCommitted` / `useCardOpenNavigation`). */
  href: string;
  /** The whole-card panel: animates from the clicked card's own rect to fullscreen. */
  panelRect0: CardOpenRect;
  /** The artwork sub-rect WITHIN the clicked card, in the same (viewport) coordinates as panelRect0. */
  artworkRect0: CardOpenRect;
  /** Where the artwork is currently animating toward — starts as a predicted
   *  guess (see `predictHeroRect`) and is replaced by the real measurement
   *  the moment `reportHeroTarget` delivers one (and again any time it
   *  reports a materially different rect — CaseStudyHero keeps reporting
   *  while the overlay is up, since layout can still shift after mount). */
  artworkTarget: CardOpenRect;
  targetMeasured: boolean;
  /** Bumped every time `artworkTarget` actually changes to a materially
   *  different rect. Lets `reportArtworkSettled` ignore a stale completion
   *  callback from an animation that got interrupted by a newer retarget. */
  targetVersion: number;
  /** True once the artwork has finished animating to the CURRENT
   *  `artworkTarget` (Framer's `onAnimationComplete` on that layer) — the
   *  fade that reveals the real page is gated on this, not a timer guess. */
  artworkSettled: boolean;
  /** True once a real measurement has arrived AFTER the artwork was already
   *  animating toward some other rect (i.e. a genuine mid-flight retarget,
   *  not just "the first glide already knew the real target"). The overlay
   *  uses a shorter, ease-out duration for that glide so a late measurement
   *  doesn't add a full 450ms of visible travel after everything else is
   *  ready to go. */
  lateRetarget: boolean;
  /** Set on a "quick" leave (wrong-path route commit) so the overlay fades
   *  out faster than the normal end-of-flow reveal — see `markRouteCommitted`. */
  quickLeave: boolean;
  visual: CardOpenVisual;
  /** Null until `reportHeroTarget` delivers one (or forever, if the
   *  destination never mounts — e.g. the safety path). See `CardOpenDestVisual`. */
  destVisual: CardOpenDestVisual | null;
  /** True once `destVisual` is known AND is a genuinely different picture
   *  from the source card's own artwork (see `originalImageSrc`) — the only
   *  time the overlay's crossfade layer actually needs to animate in. */
  needsCrossfade: boolean;
  /** Trivially true whenever `needsCrossfade` is false (nothing to wait
   *  for). Otherwise true once the crossfade layer reports its own
   *  `onAnimationComplete` (see `reportCrossfadeSettled`) — tracked
   *  SEPARATELY from `artworkSettled` because it's a different Framer-
   *  animated element (its own opacity, not the artwork frame's rect), so
   *  its completion isn't guaranteed to coincide with the geometric one's
   *  even given the same configured duration. */
  crossfadeSettled: boolean;
}

/** Quick "open" beat: straighten + lift + glow, before the expansion starts. */
const OPEN_MS = 150;
/** Expansion to fill the viewport / reach the (predicted or real) artwork target. */
const EXPAND_MS = 450;
/** However long the route takes, the whole thing is never seen for less than this. */
const MIN_TOTAL_MS = 600;
/** Final cross-fade that reveals the real page once it has committed AND the
 *  artwork has settled on its real target. */
export const FADE_MS = 250;
/** Force-removes the overlay if a route somehow never commits. */
const SAFETY_MS = 8000;
/** Once the route has committed, don't wait longer than this for a real
 *  target measurement / decode before leaving anyway with whatever we have —
 *  a case study missing its hero frame must never hang the overlay. */
const COMMIT_GRACE_MS = 700;
/** Best-effort wait for the destination image's own decode() before the
 *  final fade starts — bounded so a slow/failed decode can't hang the
 *  overlay either. */
const DECODE_GRACE_MS = 400;
/** Once everything else is ready to leave, bound how long we'll wait for the
 *  artwork's own retarget animation to report itself settled (see
 *  `reportArtworkSettled`) — a Framer edge case that never fires the
 *  completion callback must never hang the overlay. Measured from the first
 *  moment `tryFinish` actually needs the signal (not from the measurement
 *  itself), so it comfortably outlasts either glide duration below
 *  regardless of when in the timeline the measurement arrived. */
const SETTLE_GRACE_MS = 450;
/** Shorter, ease-out duration (ms) the overlay uses for the artwork's glide
 *  when a real measurement retargets it AFTER it was already animating
 *  toward some other rect — see `lateRetarget`. */
export const RETARGET_MOVE_MS = 320;
/** Fade-out duration (ms) for a "quick" leave: the committed route wasn't
 *  the card's target (Back, or navigating elsewhere while holding) so there
 *  is nothing to land on — get the stale overlay off the wrong page fast
 *  rather than running the normal reveal fade. */
export const QUICK_FADE_MS = 150;

/** Blueprint case-study frame's navy — this overlay's panel is a stand-in
 *  for that page's background, not literally it, but should match exactly
 *  for a seamless crossfade. */
export const CARD_OPEN_DEST_NAVY: string = BP_COLORS.bgTop;
/** Matches CaseStudyHero's own gradient overlay exactly (`from-[#07101e]/90
 *  via-[#07101e]/15 to-transparent` — Tailwind's `via` stop sits at 50%), so
 *  the crossfade lands seamlessly. */
export const CARD_OPEN_DEST_GRADIENT =
  "linear-gradient(to top, rgba(7,16,30,0.90), rgba(7,16,30,0.15) 50%, transparent)";

let state: CardOpenState | null = null;
const listeners = new Set<() => void>();
let pendingTimers: number[] = [];
let routeCommitted = false;
let routeCommittedAt = 0;
/** True only once the route has committed to THIS session's own `href` —
 *  as opposed to `routeCommitted`, which is set on ANY route commit
 *  (including a wrong-path one, see `markRouteCommitted`). Only ever true
 *  is it safe to force-scroll to the top: that must never happen on a page
 *  we didn't open this session for. */
let routeCommittedForTarget = false;
let targetMeasuredAt = 0;
let settleWaitStartedAt: number | null = null;
let startedAt = 0;
let sessionKey = 0;
/** The session key currently past the point of no return (leaving or about
 *  to). Guards against `beginLeave` running twice for the same session —
 *  unlike the phase, which flips to "leaving" only asynchronously, this is
 *  set synchronously the instant a leave is decided. */
let leavingSessionKey: number | null = null;

function clearPendingTimers() {
  pendingTimers.forEach((t) => window.clearTimeout(t));
  pendingTimers = [];
}

function emit() {
  listeners.forEach((listener) => listener());
}

function setPhase(phase: CardOpenPhase) {
  if (!state) return;
  state = { ...state, phase };
  emit();
}

const RECT_EPSILON = 0.5;
function rectsClose(a: CardOpenRect, b: CardOpenRect): boolean {
  return (
    Math.abs(a.top - b.top) < RECT_EPSILON &&
    Math.abs(a.left - b.left) < RECT_EPSILON &&
    Math.abs(a.width - b.width) < RECT_EPSILON &&
    Math.abs(a.height - b.height) < RECT_EPSILON
  );
}

/** Next.js's image optimizer resolves every `<Image>` to a `currentSrc` like
 *  `/_next/image?url=%2Fassets%2Fx.jpg&w=1920&q=75` — the SAME source image
 *  rendered at two different sizes (e.g. a mini hero card vs. the full-size
 *  case-study hero, or even the SAME element before vs. after the browser
 *  finalises its responsive-candidate pick) resolves to two DIFFERENT such
 *  URLs, even though it's visually the same picture. Compare the decoded
 *  `url=` param (the original asset path) instead of the raw string, both so
 *  same-source cards correctly skip the crossfade below, and so that URL
 *  "settling" alone never reads as a real change (see `sameDestVisual`).
 *  Falls back to the raw string for anything that isn't optimizer output
 *  (e.g. a `<video>`'s plain `poster` path). */
function originalImageSrc(src: string): string {
  try {
    const inner = new URL(src, "http://localhost").searchParams.get("url");
    return inner ? decodeURIComponent(inner) : src;
  } catch {
    return src;
  }
}

function sameDestVisual(a: CardOpenDestVisual | null, b: CardOpenDestVisual | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return originalImageSrc(a.currentSrc) === originalImageSrc(b.currentSrc) && a.objectPosition === b.objectPosition;
}

/** Width-calibrated estimate of the case-study article's fixed 1px frame
 *  border (see PinnedFrame.tsx: `border` on the element `CaseStudyHero`'s
 *  measured node fills via `absolute inset-0`), applied below. */
const FRAME_BORDER_PX = 1;

/**
 * A best-effort guess at where the destination `CaseStudyHero` frame will
 * sit, from viewport size alone (mirrors CaseStudyClient's deterministic
 * layout — max-w-[1440px] article, px-6/sm:px-10, an xl: 220px+3rem sidebar
 * gutter, aspect-video, PinnedFrame's 1px border). This is only ever a
 * starting point: the fade that reveals the real page is gated on the real
 * measurement having settled (see `reportArtworkSettled`), so an imprecise
 * guess only costs a slightly longer visible glide, never a misaligned
 * landing.
 *
 * The vertical position does NOT scale with viewport height — the hero's
 * top is entirely a function of the (fixed-height) site header plus however
 * many lines the title/subtitle/skill-chips block above it wraps to, which
 * depends only on viewport WIDTH. `HEADER_TOP_BY_WIDTH` below is calibrated
 * from real measured hero-frame positions at two widths (see
 * `scratchpad/verify/cardopen-diag.cjs`) and linearly interpolated between
 * them; outside that measured range we clamp to the nearest anchor rather
 * than extrapolate blindly.
 */
const HEADER_TOP_BY_WIDTH: Array<{ vw: number; top: number }> = [
  { vw: 390, top: 521 },
  { vw: 1440, top: 480 },
];

function estimateHeaderBlockTop(vw: number): number {
  const anchors = HEADER_TOP_BY_WIDTH;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (vw <= first.vw) return first.top;
  if (vw >= last.vw) return last.top;
  const t = (vw - first.vw) / (last.vw - first.vw);
  return first.top + (last.top - first.top) * t;
}

function predictHeroRect(): CardOpenRect {
  const vw = window.innerWidth;
  const containerW = Math.min(vw, 1440);
  const pad = vw < 640 ? 24 : 40;
  let contentW = containerW - pad * 2;
  if (vw >= 1280) contentW -= 220 + 48;
  const rawWidth = Math.max(contentW, 240);
  const rawHeight = (rawWidth * 9) / 16;
  const rawLeft = (vw - containerW) / 2 + pad;
  return {
    top: estimateHeaderBlockTop(vw),
    left: rawLeft + FRAME_BORDER_PX,
    width: rawWidth - FRAME_BORDER_PX * 2,
    height: rawHeight - FRAME_BORDER_PX * 2,
  };
}

/** Called once the expansion's minimum timeline has elapsed — decides whether to hold or leave. */
function tryFinish(key: number) {
  if (!state || state.key !== key) return;
  if (leavingSessionKey === key) return;
  if (!routeCommitted) {
    setPhase("holding");
    return;
  }
  const elapsed = performance.now() - startedAt;
  if (elapsed < MIN_TOTAL_MS) {
    pendingTimers.push(window.setTimeout(() => tryFinish(key), MIN_TOTAL_MS - elapsed));
    return;
  }
  const sinceCommit = performance.now() - routeCommittedAt;
  if (!state.targetMeasured && sinceCommit < COMMIT_GRACE_MS) {
    // Give the destination page a little longer to mount its hero frame and
    // report a real target before we give up and land on the prediction.
    pendingTimers.push(window.setTimeout(() => tryFinish(key), COMMIT_GRACE_MS - sinceCommit));
    return;
  }
  const stillSettling =
    (state.targetMeasured && !state.artworkSettled) || (state.needsCrossfade && !state.crossfadeSettled);
  if (stillSettling) {
    if (settleWaitStartedAt === null) settleWaitStartedAt = performance.now();
    const waited = performance.now() - settleWaitStartedAt;
    if (waited < SETTLE_GRACE_MS) {
      pendingTimers.push(window.setTimeout(() => tryFinish(key), SETTLE_GRACE_MS - waited));
      return;
    }
    // Gave the settle signal(s) their full grace window and they never
    // arrived — proceed anyway rather than hang the overlay indefinitely.
  } else {
    settleWaitStartedAt = null;
  }
  beginLeave(key);
}

function finishSession(key: number) {
  if (state?.key !== key) return;
  state = null;
  delete document.documentElement.dataset.cardOpen;
  clearPendingTimers();
  leavingSessionKey = null;
  emit();
}

function beginLeave(key: number, opts: { quick?: boolean } = {}) {
  if (!state || state.key !== key) return;
  if (leavingSessionKey === key) return;
  leavingSessionKey = key;
  const quick = opts.quick ?? false;

  const proceed = () => {
    if (state?.key !== key) return;
    if (routeCommittedForTarget) {
      // Instant — the fade-out that follows is what the user perceives as
      // the reveal, so any scroll animation here would fight it (and
      // `html{scroll-behavior:smooth}` would otherwise turn a plain (0,0)
      // scroll into a visible smooth-scroll). Only ever done once we've
      // actually landed on THIS session's own destination: a quick/wrong-
      // path leave must never move whatever page the user is really on.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    state = { ...state, phase: "leaving", quickLeave: quick };
    emit();
    pendingTimers.push(
      window.setTimeout(() => finishSession(key), quick ? QUICK_FADE_MS : FADE_MS),
    );
  };

  if (quick) {
    proceed();
    return;
  }

  const decodePromise = pendingDecode ?? Promise.resolve();
  const timeout = new Promise<void>((resolve) => {
    pendingTimers.push(window.setTimeout(resolve, DECODE_GRACE_MS));
  });
  Promise.race([decodePromise.catch(() => {}), timeout]).then(proceed);
}

/** Starts the overlay for a newly-activated card. Safe to call repeatedly (each call supersedes the last).
 *
 *  `navigate` is called once the panel has finished expanding over the
 *  viewport, not on click. In production the destination is prefetched and
 *  commits in ~250ms, which is before the panel covers the screen, so pushing
 *  on click flashed the new page in around the still card-sized clone. Its
 *  render also blocked the main thread mid-expansion, stalling the
 *  JS-driven animation. Deferred, the page renders under a static cover and
 *  the only cost is the "holding" beat the overlay already has. The call
 *  lives in `pendingTimers`, so a superseding card or an early leave (Back)
 *  cancels it. */
export function openCardTransition(
  href: string,
  panelRect0: CardOpenRect,
  artworkRect0: CardOpenRect,
  visual: CardOpenVisual,
  navigate?: () => void,
) {
  if (typeof window === "undefined") return;
  clearPendingTimers();
  sessionKey += 1;
  const key = sessionKey;
  routeCommitted = false;
  routeCommittedForTarget = false;
  leavingSessionKey = null;
  settleWaitStartedAt = null;
  pendingDecode = null;
  startedAt = performance.now();
  document.documentElement.dataset.cardOpen = "1";
  state = {
    key,
    phase: "opening",
    href,
    panelRect0,
    artworkRect0,
    artworkTarget: predictHeroRect(),
    targetMeasured: false,
    targetVersion: 0,
    artworkSettled: false,
    lateRetarget: false,
    quickLeave: false,
    visual,
    destVisual: null,
    needsCrossfade: false,
    crossfadeSettled: true,
  };
  emit();

  pendingTimers.push(
    window.setTimeout(() => {
      if (state?.key === key) setPhase("expanding");
    }, OPEN_MS),
  );
  pendingTimers.push(
    window.setTimeout(() => {
      if (state?.key === key && state.phase !== "leaving" && leavingSessionKey !== key) navigate?.();
      tryFinish(key);
    }, OPEN_MS + EXPAND_MS),
  );
  pendingTimers.push(
    window.setTimeout(() => {
      if (state?.key === key) beginLeave(key);
    }, SAFETY_MS),
  );
}

/** Called by `CardOpenRouteWatcher` once `usePathname()` reports the route
 *  has committed, with the new pathname. */
export function markRouteCommitted(pathname: string) {
  routeCommitted = true;
  routeCommittedAt = performance.now();
  if (!state) return;
  if (pathname !== state.href) {
    // Back, or navigating elsewhere, while the overlay was still up: there
    // is no destination hero to land on, so don't linger over the wrong
    // page for COMMIT_GRACE_MS — leave immediately with a quick fade, and
    // never touch that page's own scroll position.
    routeCommittedForTarget = false; // a normal leave may already be mid decode-wait; don't let it scroll this page
    beginLeave(state.key, { quick: true });
    return;
  }
  routeCommittedForTarget = true;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  tryFinish(state.key);
}

/** Called by `CaseStudyHero` (while `data-card-open` is set) with its own
 *  frame's rect (and, once its media element exists, that media's own
 *  `currentSrc`/`object-position` — see `CardOpenDestVisual`) — once on
 *  mount, and then continuously (rAF) until the overlay ends, since layout
 *  can still shift after the first measurement (web-font swap, image decode
 *  reflow, scroll correction). A no-op unless the rect or the visual
 *  materially changed (per `originalImageSrc`, so the browser settling on a
 *  final responsive-image candidate never itself counts as a change), so a
 *  steady, unchanged measurement never resets the settle-gate below. */
export function reportHeroTarget(rect: CardOpenRect, visual?: CardOpenDestVisual | null) {
  if (!state) return;
  const nextVisual = visual ?? null;
  const rectSame = state.targetMeasured && rectsClose(state.artworkTarget, rect);
  const visualSame = sameDestVisual(state.destVisual, nextVisual);
  if (rectSame && visualSame) return;
  const late = state.phase !== "opening";
  const needsCrossfade =
    Boolean(nextVisual?.currentSrc) && originalImageSrc(nextVisual!.currentSrc) !== originalImageSrc(state.visual.currentSrc);
  state = {
    ...state,
    artworkTarget: rect,
    targetMeasured: true,
    targetVersion: state.targetVersion + 1,
    // Only reset the GEOMETRIC settle flag if the rect itself is what
    // changed — a visual-only update (same rect) has nothing new for that
    // animation to do, so Framer won't re-fire its completion callback and
    // this would otherwise never be set true again.
    artworkSettled: rectSame ? state.artworkSettled : false,
    lateRetarget: state.lateRetarget || late,
    destVisual: nextVisual,
    needsCrossfade,
    // Symmetric reasoning for the crossfade's own settle flag: only reset
    // it when the VISUAL actually changed.
    crossfadeSettled: visualSame ? state.crossfadeSettled : !needsCrossfade,
  };
  targetMeasuredAt = performance.now();
  // Reached only when rect and/or visual actually changed — either way,
  // whatever we're now waiting on (geometric settle and/or crossfade
  // settle) is fresh, so the shared grace-period clock restarts.
  settleWaitStartedAt = null;
  emit();
  if (routeCommitted) tryFinish(state.key);
}

/** Called by `CardOpenOverlay`'s artwork layer once it finishes animating to
 *  the CURRENT `artworkTarget` (Framer's `onAnimationComplete`) — the real
 *  "the hand-off is ready" signal the fade is gated on, rather than a timer
 *  guess. `version` guards against a stale callback from an animation that
 *  got interrupted by a newer retarget before it could finish. */
export function reportArtworkSettled(key: number, version: number) {
  if (!state || state.key !== key) return;
  if (state.targetVersion !== version) return;
  if (state.artworkSettled) return;
  state = { ...state, artworkSettled: true };
  settleWaitStartedAt = null;
  emit();
  if (routeCommitted) tryFinish(key);
}

/** Called by `CardOpenOverlay`'s crossfade image layer once IT finishes
 *  animating in (Framer's `onAnimationComplete`) — tracked separately from
 *  `reportArtworkSettled` because it's a different element with its own
 *  independent animation, so its completion isn't guaranteed to land in the
 *  same tick as the artwork frame's, even with the same configured
 *  duration. A no-op once a crossfade isn't (or is no longer) needed. */
export function reportCrossfadeSettled(key: number) {
  if (!state || state.key !== key) return;
  if (!state.needsCrossfade || state.crossfadeSettled) return;
  state = { ...state, crossfadeSettled: true };
  settleWaitStartedAt = null;
  emit();
  if (routeCommitted) tryFinish(key);
}

let pendingDecode: Promise<void> | null = null;
/** Called by `CaseStudyHero` with its own `<img>`'s `decode()` promise — a
 *  best-effort signal only (see DECODE_GRACE_MS); never blocks indefinitely. */
export function reportHeroDecode(promise: Promise<void>) {
  pendingDecode = promise;
}

export function subscribeCardOpen(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCardOpenSnapshot(): CardOpenState | null {
  return state;
}

export function getCardOpenServerSnapshot(): CardOpenState | null {
  return null;
}
