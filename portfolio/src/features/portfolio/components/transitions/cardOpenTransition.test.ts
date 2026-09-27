import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardOpenRect, CardOpenVisual } from "./cardOpenTransition";

type TransitionModule = typeof import("./cardOpenTransition");

const RECT: CardOpenRect = { top: 100, left: 100, width: 200, height: 120 };
const TARGET_RECT: CardOpenRect = { top: 480, left: 41, width: 1090, height: 612 };
const VISUAL_A: CardOpenVisual = {
  currentSrc: "https://example.com/a.png",
  objectPosition: "center",
  title: "Card A",
  threadColor: "#ff8800",
};
const VISUAL_B: CardOpenVisual = {
  currentSrc: "https://example.com/b.png",
  objectPosition: "top",
  title: "Card B",
  threadColor: "#38bdf8",
};

// Real timings from cardOpenTransition.ts. Most aren't exported (only
// FADE_MS/QUICK_FADE_MS/RETARGET_MOVE_MS are, for CardOpenOverlay to share) —
// these are re-declared here for test readability and kept in sync manually
// with that file's own constants block.
const OPEN_MS = 150;
const EXPAND_MS = 450;
const MIN_TOTAL_MS = 600;
const SAFETY_MS = 8000;
const QUICK_FADE_MS = 150;

let mod: TransitionModule;
let scrollToSpy: ReturnType<typeof vi.spyOn>;

async function loadFreshModule(): Promise<TransitionModule> {
  // Every test gets its own module instance: the store's session key,
  // pending-timer list, and committed-route flags are all plain module
  // state, so re-importing after `resetModules` is the cleanest way to
  // guarantee one test's session can never leak into the next.
  vi.resetModules();
  return import("./cardOpenTransition");
}

describe("cardOpenTransition", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    document.documentElement.removeAttribute("data-card-open");
    scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    mod = await loadFreshModule();
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-card-open");
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("supersede: opening a second card cleanly replaces the first session", async () => {
    mod.openCardTransition("/work/first", RECT, RECT, VISUAL_A);
    const first = mod.getCardOpenSnapshot();
    expect(first?.href).toBe("/work/first");
    const firstKey = first?.key;

    // First session is mid-flight (measured, but not yet settled/committed)
    // when it gets superseded by a second card.
    mod.reportHeroTarget(TARGET_RECT);
    expect(mod.getCardOpenSnapshot()?.targetMeasured).toBe(true);

    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    mod.openCardTransition("/work/second", RECT, RECT, VISUAL_B);

    const second = mod.getCardOpenSnapshot();
    expect(second?.key).not.toBe(firstKey);
    expect(second?.href).toBe("/work/second");
    expect(second?.phase).toBe("opening");
    // A fresh session never inherits the old one's measurement/settle state.
    expect(second?.targetMeasured).toBe(false);
    expect(second?.artworkSettled).toBe(false);
    expect(second?.targetVersion).toBe(0);
    // The superseded session's own pending timers (OPEN_MS/EXPAND_MS/SAFETY_MS) were cleared.
    expect(clearTimeoutSpy).toHaveBeenCalled();

    // The old session's timers firing later (had they NOT been cleared)
    // must never resurrect it or touch the new/current session.
    await vi.advanceTimersByTimeAsync(SAFETY_MS + 1000);
    expect(mod.getCardOpenSnapshot()?.key ?? null).not.toBe(firstKey);
  });

  it("commit-before-minimum: an instantly-committed, already-settled route still waits out MIN_TOTAL_MS before leaving", async () => {
    mod.openCardTransition("/work/first", RECT, RECT, VISUAL_A);
    const key = mod.getCardOpenSnapshot()!.key;

    // Route commits, hero measures, and the artwork settles almost
    // immediately — far sooner than the minimum visible duration.
    mod.markRouteCommitted("/work/first");
    mod.reportHeroTarget(TARGET_RECT);
    mod.reportArtworkSettled(key, mod.getCardOpenSnapshot()!.targetVersion);
    expect(mod.getCardOpenSnapshot()?.phase).not.toBe("leaving");

    await vi.advanceTimersByTimeAsync(MIN_TOTAL_MS - 1);
    expect(mod.getCardOpenSnapshot()?.phase).not.toBe("leaving");

    // The instant MIN_TOTAL_MS is crossed, the already-ready session leaves.
    await vi.advanceTimersByTimeAsync(1);
    expect(mod.getCardOpenSnapshot()?.phase).toBe("leaving");
    expect(mod.getCardOpenSnapshot()?.quickLeave).toBe(false);
  });

  it("safety path: a route that never commits force-leaves after SAFETY_MS without touching scroll", async () => {
    mod.openCardTransition("/work/first", RECT, RECT, VISUAL_A);

    await vi.advanceTimersByTimeAsync(OPEN_MS + EXPAND_MS);
    expect(mod.getCardOpenSnapshot()?.phase).toBe("holding");

    await vi.advanceTimersByTimeAsync(SAFETY_MS - (OPEN_MS + EXPAND_MS));
    expect(mod.getCardOpenSnapshot()?.phase).toBe("leaving");
    // Never committed, so the home page's own scroll position must be
    // untouched — this is the regression this session's L1 fix covers.
    expect(scrollToSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);
    expect(mod.getCardOpenSnapshot()).toBeNull();
  });

  it("wrong-path commit: Back (or navigating elsewhere) leaves immediately with a quick fade, no scroll", async () => {
    mod.openCardTransition("/work/first", RECT, RECT, VISUAL_A);

    mod.markRouteCommitted("/resume"); // not the card's own href
    const snap = mod.getCardOpenSnapshot();
    expect(snap?.phase).toBe("leaving");
    expect(snap?.quickLeave).toBe(true);
    expect(scrollToSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(QUICK_FADE_MS);
    expect(mod.getCardOpenSnapshot()).toBeNull();
  });

  it("no double leave: a duplicate route-commit notification never double-schedules the leave", async () => {
    mod.openCardTransition("/work/first", RECT, RECT, VISUAL_A);
    const key = mod.getCardOpenSnapshot()!.key;
    mod.reportHeroTarget(TARGET_RECT);
    mod.reportArtworkSettled(key, mod.getCardOpenSnapshot()!.targetVersion);

    // Simulate CardOpenRouteWatcher's effect notifying the commit twice for
    // the same navigation (e.g. React re-running an effect) — both reach
    // "ready to leave" at the same moment.
    mod.markRouteCommitted("/work/first");
    mod.markRouteCommitted("/work/first");
    expect(scrollToSpy).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(MIN_TOTAL_MS);
    expect(mod.getCardOpenSnapshot()?.phase).toBe("leaving");

    await vi.advanceTimersByTimeAsync(300);
    expect(mod.getCardOpenSnapshot()).toBeNull();

    // Nothing dangling (a second finishSession, a stale SAFETY_MS timer for
    // this same session) resurrects state or throws later.
    await vi.advanceTimersByTimeAsync(SAFETY_MS);
    expect(mod.getCardOpenSnapshot()).toBeNull();
  });
});
