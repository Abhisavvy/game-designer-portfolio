"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { defaultPortfolioContent } from "../../data/site-content";

/** Builds ticker text straight from the project data — never hard-coded. */
function buildTickerItems(): string[] {
  const { projects, personalProjects } = defaultPortfolioContent;
  return [...projects, ...personalProjects]
    .filter((project) => project.stats && project.stats.length > 0)
    .map((project) => {
      const stat = project.stats![0];
      return `${project.title} · ${stat.value} ${stat.label}`;
    });
}

function TickerSet({ items, isClone }: { items: string[]; isClone: boolean }) {
  return (
    <span className="flex shrink-0 items-center" data-marquee-clone={isClone ? "true" : "false"}>
      {items.map((text, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="px-4 py-3 sm:px-5">{text}</span>
          <span className="text-accent/60" aria-hidden="true">
            /
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * A slim marquee band between the hero and the first section. Purely
 * decorative restatement of stats shown elsewhere on the page (so the
 * scrolling text itself is `aria-hidden`), plus a real, always-reachable
 * pause/play control (WCAG 2.2.2 requires a way to stop non-essential moving
 * content). Scrolls slowly and loops seamlessly (two identical tracks side
 * by side, animated -50%), pauses on hover/focus/manual toggle and while
 * scrolled offscreen, and stops entirely under reduced motion (see the
 * `.marquee-*` rules in globals.css).
 */
export function TickerBand() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const items = buildTickerItems();

  const [inView, setInView] = useState(true);
  const [userPaused, setUserPaused] = useState(false);

  // Pause the loop while it's scrolled out of view — cheap, but no sense
  // animating a marquee nobody can see.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Combined pause state: offscreen (automatic) OR user-toggled (manual).
  // Hover/focus-pause is handled separately, unconditionally, in CSS.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.dataset.paused = !inView || userPaused ? "true" : "false";
  }, [inView, userPaused]);

  if (items.length === 0) return null;

  return (
    <div className="relative max-w-full min-h-[44px] overflow-hidden border-y border-paper/10 bg-ink-2/60 [contain:paint]">
      <div ref={viewportRef} aria-hidden="true" className="marquee-viewport">
        {/* `leading-[1.2]` fixes this track's line-height instead of leaving
            it to inherit a default that can differ by a few px between the
            font-mono fallback and JetBrains Mono once it swaps in (`display:
            swap`) — confirmed via a real layout-shift entry as this band's
            single biggest CLS contributor (its own box height jumping
            ~20px -> ~42px on swap, which also pushed the hero's CTA row and
            "Follow the thread" link up by the same amount). Paired with the
            parent's `min-h-[44px]` above so the box is already the right
            height on first paint, in either font. */}
        <div className="marquee-track flex w-max items-center whitespace-nowrap font-mono text-[11px] uppercase leading-[1.2] tracking-[0.18em] text-muted sm:text-xs">
          <TickerSet items={items} isClone={false} />
          <TickerSet items={items} isClone={true} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setUserPaused((paused) => !paused)}
        aria-pressed={userPaused}
        aria-label={userPaused ? "Play ticker" : "Pause ticker"}
        className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink-2/80 text-muted backdrop-blur-sm transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-2 sm:right-3"
      >
        {userPaused ? (
          <Play className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Pause className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
