"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { defaultPortfolioContent } from "../data/site-content";
import { MagneticButton } from "./ui/MagneticButton";
import { HeroLoomThreads } from "./hero/HeroLoomThreads";
import { HeroLoomHand } from "./hero/HeroLoomHand";
import { HeroLoomCompact } from "./hero/HeroLoomCompact";
import { useHeroLoom } from "./hero/useHeroLoom";

/** Delay before the (purely decorative) underline starts drawing in under
 * the accent word — the text itself never hides, so it doesn't need to wait
 * on anything; this just lets the word settle on screen first. Autoplays via
 * plain CSS (see `.reveal-underline` in globals.css) — no JS/observer. */
const UNDERLINE_DELAY_MS = 260;

function delayStyle(ms: number): CSSProperties {
  return { "--reveal-delay": ms } as CSSProperties;
}

/** Pauses an element's CSS animation while it's off-screen. An infinite CSS
 * animation keeps the browser producing frames (and re-layerising the whole
 * page) even when nobody can see it, so the page never goes idle. */
function usePauseAnimationWhenOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      el.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

/** Hand-drawn-feeling underline thread beneath the italic accent word. */
function ThreadUnderline({ delayMs }: { delayMs: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 14"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-0 top-[92%] h-[0.34em] w-full min-h-[6px]"
    >
      <path
        d="M2 7 C 16 1, 30 12, 47 6 S 76 1, 98 7"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        className="reveal-underline"
        style={delayStyle(delayMs)}
      />
    </svg>
  );
}

/**
 * Splits `headline` so its LAST word becomes the italic accent word (the one
 * that carries the hand-drawn underline) — generic over content, so editing
 * `hero.headline` in site-content never requires touching this component. A
 * trailing "." on that last word is peeled off and rendered outside the
 * accent span (reads better un-italicised and in the body colour).
 */
function splitHeadlineAccent(headline: string) {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  const lastRaw = words[words.length - 1] ?? "";
  const leading = words.slice(0, -1);
  const hasTrailingPeriod = lastRaw.endsWith(".");
  const accentWord = hasTrailingPeriod ? lastRaw.slice(0, -1) : lastRaw;
  return {
    leadingText: leading.length > 0 ? `${leading.join(" ")} ` : "",
    accentWord,
    hasTrailingPeriod,
  };
}

export function HeroAnimated() {
  const { hero, person } = defaultPortfolioContent;
  // Orchestrates the desktop Loom (threads + card hand) as one unit — see
  // useHeroLoom for why this lives above both of the components it feeds.
  const loom = useHeroLoom();
  const arrowRef = useRef<HTMLSpanElement>(null);
  usePauseAnimationWhenOffscreen(arrowRef);

  const { leadingText, accentWord, hasTrailingPeriod } = splitHeadlineAccent(hero.headline);

  return (
    <section
      ref={loom.containerRef}
      // Reserves enough room for the tallest of the two font states (the
      // metrics-matched fallback vs. the real Instrument Serif/Inter/
      // JetBrains Mono once `display:swap` brings them in), so that swap
      // can't push #work and everything below it — measured via real
      // layout-shift entries in an isolated production build, not guessed.
      // Mobile no longer needs this (the eyebrow's own fix below already
      // removed its only font-swap shift); `sm:min-h-0` also leaves the
      // tablet range unset, since it isn't one of ours (or the task's)
      // measured breakpoints. Split at `xl` (1280px) rather than one `lg`
      // value because the stat pills below the subline naturally wrap to a
      // second row anywhere from 1024-1279px wide (in EITHER font state —
      // that's just not enough room at those widths, not a shift bug), so
      // the reserved height has to match each range's own natural size or
      // it'd show as a gap instead of fixing one.
      className="relative overflow-clip bg-ink py-20 sm:min-h-0 sm:py-24 lg:min-h-[792px] lg:py-28 xl:min-h-[795px]"
    >
      {/* Ambient warm glow behind the Loom — kept subtle so it doesn't wash out the threads.
          `top` is `vh`, not the Tailwind `top-1/2` percentage, for the same reason as
          HeroLoomHand's box below: a percentage here recomputes (and visibly shifts this glow)
          whenever the section's own auto height changes, e.g. once a swapped-in webfont settles. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-1/4 h-[36rem] w-[36rem] rounded-full opacity-40 blur-3xl"
        style={{
          top: "50vh",
          transform: "translateY(-50%)",
          background:
            "radial-gradient(circle, rgba(249,115,22,0.25) 0%, rgba(249,115,22,0.08) 45%, transparent 70%)",
        }}
      />

      {/* The full-bleed threads layer: six skill-colour threads spanning the
          ENTIRE section, weaving behind the text and the card hand, running
          off the right edge. Desktop-only (>=1024px) — which composition
          shows is a plain CSS media-query decision (`hidden lg:block`),
          never a post-mount measurement, so the server-rendered layout is
          already final and nothing shifts once this hydrates. */}
      <HeroLoomThreads loom={loom} className="pointer-events-none absolute inset-0 z-0 hidden lg:block" />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-12 gap-x-8 px-6">
        {/* `min-w-0`: this grid item's default automatic min-width is based
            on its content's own min-content size. The eyebrow line below is
            `whitespace-nowrap` specifically so it can't wrap to a second
            line depending on which font is currently active (see its own
            comment) — without `min-w-0` here, that nowrap text's min-content
            width could force this column wider than its `col-span` share. */}
        <div className="col-span-12 min-w-0 lg:col-span-7">
          {/* Everything in this block is the hero's LCP content: visible
              from first paint, on every load, and never hidden afterwards —
              see globals.css / useRevealOnView for why the below-the-fold
              reveal system deliberately isn't used here. */}
          <p
            className="mb-5 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] text-muted sm:mb-6 sm:text-sm"
            title={person.role}
          >
            {/* `whitespace-nowrap`: at narrow widths this line sits right at
                its wrap boundary, and the fallback font's slightly different
                glyph widths vs. the real JetBrains Mono (`display:swap`)
                were enough to flip it between one line and two — a real,
                measured layout-shift source (a ~16px jump at 390px wide).
                Forcing one line removes that; on the rare device where even
                the real font doesn't fit, `text-ellipsis` degrades it
                gracefully instead of visibly overflowing (the parent
                section clips overflow either way via `overflow-clip`, and
                `title` keeps the full text available on hover/AT). */}
            {person.role}
          </p>

          <h1
            className="font-display font-normal text-paper"
            style={{
              fontSize: "clamp(2.35rem, 5.1vw, 4.75rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
            }}
          >
            {leadingText}
            <span className="relative inline-block">
              <em className="italic text-accent">{accentWord}</em>
              <ThreadUnderline delayMs={UNDERLINE_DELAY_MS} />
            </span>
            {hasTrailingPeriod ? "." : null}
          </h1>

          <p className="mt-5 max-w-[52ch] font-sans text-base text-muted sm:mt-6 sm:text-lg lg:text-xl">
            {hero.subline}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3">
            {hero.statPills.map((stat) => (
              <div
                key={stat}
                className="flex items-center gap-2.5 font-mono text-[13px] text-muted"
              >
                <span className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full border border-accent/60">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                </span>
                {stat}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-7">
            <MagneticButton
              href="#work"
              className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-6 py-3 font-sans text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              View my work
            </MagneticButton>
            <MagneticButton
              href={person.links.resumePdf}
              download
              className="inline-flex min-h-[44px] items-center rounded-full border border-paper/25 px-6 py-3 font-sans text-sm text-paper transition-colors hover:border-paper/50 hover:bg-paper/5"
            >
              Download CV
            </MagneticButton>
          </div>
        </div>

        {/* Tablet/mobile only: the compact Loom, stacked in normal flow
            below the CTAs (col-span-12, its own row). Desktop hides this
            entirely and shows the full-bleed threads + floating hand
            instead — again a plain `lg:hidden` CSS decision. */}
        <div className="col-span-12 mt-10 lg:hidden">
          <HeroLoomCompact />
        </div>
      </div>

      <a
        href="#work"
        className="relative z-10 mt-12 flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted transition-colors hover:text-paper focus-visible:text-paper lg:mt-16"
      >
        <span ref={arrowRef} aria-hidden="true" className="thread-arrow-bob">
          ↓
        </span>
        Follow the thread
      </a>

      {/* Desktop-only card hand — floats above the section (independent of
          the text grid's column width, so cards render at their full
          ~180px size), vertically centred with the headline block. */}
      <HeroLoomHand loom={loom} className="z-10 hidden lg:block" />
    </section>
  );
}
