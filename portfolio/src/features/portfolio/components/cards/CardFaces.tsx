"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ProjectItem, SkillThreadId } from "@/features/portfolio/data/site-content";
import { CountUp } from "../ui/CountUp";
import {
  SKILL_CHIP_LABELS,
  SKILL_ICONS,
  SKILL_TEXT_CLASS,
  SKILL_BORDER_CLASS,
  THREAD_COLOR,
  hexToRgba,
} from "./card-content";

// The box widths this card renders at (340/300/280px), scaled up by ~1.35x:
// `sizes` needs to describe the RENDERED width, not the box width, and
// `object-cover` scales a poster wider than this card's ~1.4:1 artwork box
// up to cover its height — a 16:9 poster overflows the box width by
// image-aspect/box-aspect (~1.27x), a 3:1 banner-crop poster by far more.
// The 1.35x margin covers every current poster up to about a 21:9 aspect at
// both DPR 1 and 2; a couple of the widest (3:1+) crops are still capped by
// their own low native resolution regardless of this value — see the image
// audit in the round-2 report.
const IMAGE_SIZES = "(max-width: 639px) 460px, (max-width: 1023px) 405px, 380px";

interface CardArtworkProps {
  src: string;
  fallbackSrc: string;
  secondaryFallback: string;
  alt: string;
  priority?: boolean;
}

/**
 * The artwork image, filling its positioned parent edge-to-edge (`fill` + `object-cover`)
 * instead of a fixed intrinsic width/height. A fixed-size `<Image>` only matches its box when
 * the box happens to match that exact aspect ratio; at any other card width (this card's artwork
 * box is a different aspect ratio at each breakpoint) it letterboxes, leaving an empty band. Same
 * three-tier fallback chain as the shared OptimizedImage (webp -> poster fallback -> jpg), kept
 * local to this file rather than changing that shared component's non-fill contract.
 */
function CardArtwork({ src, fallbackSrc, secondaryFallback, alt, priority }: CardArtworkProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (currentSrc === src) setCurrentSrc(fallbackSrc);
    else if (currentSrc === fallbackSrc) setCurrentSrc(secondaryFallback);
    else setFailed(true);
  };

  if (failed) {
    return <div className="h-full w-full bg-gradient-to-br from-ink-2 to-ink" />;
  }

  return (
    <Image
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      fill
      priority={priority}
      sizes={IMAGE_SIZES}
      className="object-cover object-top"
      onError={handleError}
    />
  );
}

/** The idle "alive" shimmer sweep — a single diagonal highlight bar cycling across the front face. */
function ShimmerSweep({ delay }: { delay: number }) {
  return (
    <div
      className="card-shimmer-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-paper/10 to-transparent"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

export interface CardFrontProps {
  project: ProjectItem;
  displayIndex: string;
  imageSrc: string;
  fallbackSrc: string;
  secondaryFallback: string;
  primarySkill: SkillThreadId;
  threadColor: string;
  priority?: boolean;
  /** Holographic tilt/foil overlays — pointer:fine and !reducedMotion only. */
  holoEnabled?: boolean;
  /** Idle shimmer sweep — off when reduced motion, offscreen, or not yet settled. */
  shimmerActive?: boolean;
  shimmerDelay?: number;
  /** Opens the case study directly from the front (the title), without flipping first. */
  onOpen?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  titleLinkRef?: React.Ref<HTMLAnchorElement>;
  artworkRef?: React.Ref<HTMLDivElement>;
}

/**
 * Front face: artwork (top ~52%) + a solid text panel below it — never text over the image.
 *
 * The holo/foil/shimmer overlays are rendered INSIDE this same `overflow-hidden` root (not as
 * separate siblings elsewhere in the tree) so they are always clipped to the card's rounded rect
 * and — critically — share this element's own `backface-visibility: hidden` and 3D rotation.
 * A decorative layer that lived outside the rotating face would stay full-opacity and unrotated
 * through the whole flip, bleeding its colour through once the face itself is foreshortened
 * near the midpoint of the rotation. Keeping every coloured layer (border, glow, foil) scoped to
 * its own face is what makes each face fully invisible at all rotation angles, not just at 0/180.
 *
 * This whole root is `pointer-events-none`: the caller (CollectibleCard) layers an invisible
 * full-bleed flip button *underneath* it, and only the title link here re-enables
 * `pointer-events-auto`, so a tap anywhere else still flips the card while the title opens the
 * case study directly — two interactive targets, but siblings rather than nested (nesting a link
 * inside the flip `<button>` would be invalid HTML and would break keyboard access to one of them).
 */
export function CardFront({
  project,
  displayIndex,
  imageSrc,
  fallbackSrc,
  secondaryFallback,
  primarySkill,
  threadColor,
  priority,
  holoEnabled,
  shimmerActive,
  shimmerDelay = 0,
  onOpen,
  titleLinkRef,
  artworkRef,
}: CardFrontProps) {
  const SkillIcon = SKILL_ICONS[primarySkill];
  const headlineStat = project.stats?.[0];

  return (
    <div className="pointer-events-none relative flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-ink-2">
      {/* inner hairline, inset from the coloured border */}
      <div className="pointer-events-none absolute inset-[1px] z-10 rounded-[17px] shadow-[inset_0_0_0_1px_rgba(245,241,234,0.08)]" />

      {holoEnabled ? (
        <>
          <div
            aria-hidden="true"
            data-holo=""
            className="pointer-events-none absolute inset-0 z-20 rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
            style={{
              background: "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.4), transparent 55%)",
            }}
          />
          <div
            aria-hidden="true"
            data-holo=""
            className="pointer-events-none absolute inset-0 z-20 rounded-[18px] opacity-0 mix-blend-color-dodge transition-opacity duration-300 group-hover:opacity-[0.16] group-focus-within:opacity-[0.16]"
            style={{
              background:
                "conic-gradient(from 0deg at var(--mx, 50%) var(--my, 50%), #F97316, #FACC15, #38BDF8, #A78BFA, #2DD4BF, #FB7185, #F97316)",
            }}
          />
        </>
      ) : null}

      {shimmerActive ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[18px]">
          <ShimmerSweep delay={shimmerDelay} />
        </div>
      ) : null}

      {/* Artwork — top ~52%. Only decorative corner chips may sit on top of it. */}
      <div ref={artworkRef} className="relative h-[52%] w-full shrink-0 overflow-hidden bg-ink">
        <CardArtwork
          src={imageSrc}
          fallbackSrc={fallbackSrc}
          secondaryFallback={secondaryFallback}
          alt=""
          priority={priority}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-2/25 via-transparent to-transparent"
        />

        {/* skill glyph — solid chip, top-left, never obscures the art broadly */}
        <div
          aria-hidden="true"
          className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink-2/85 backdrop-blur-sm"
          style={{ boxShadow: `0 0 0 1px ${hexToRgba(threadColor, 0.4)}` }}
        >
          <SkillIcon className="h-3.5 w-3.5" style={{ color: threadColor }} />
        </div>

        {/* flip hint — solid chip, top-right */}
        <div
          aria-hidden="true"
          className="absolute right-2.5 top-2.5 rounded-full bg-ink-2/85 px-2 py-1 font-mono text-[10.5px] uppercase tracking-wide text-paper/90 backdrop-blur-sm"
        >
          ↻ Flip
        </div>
      </div>

      {/* Solid text panel — bg-ink-2, all copy lives here. */}
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-2 bg-ink-2 px-3.5 py-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              No. {displayIndex}
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wide"
              style={{
                color: threadColor,
                backgroundColor: hexToRgba(threadColor, 0.14),
                border: `1px solid ${hexToRgba(threadColor, 0.4)}`,
              }}
            >
              {SKILL_CHIP_LABELS[primarySkill]}
            </span>
          </div>

          <h3 className="mt-1.5 flex min-w-0 items-baseline gap-1">
            <Link
              ref={titleLinkRef}
              href={project.href}
              data-testid="card-title"
              onClick={onOpen}
              className="pointer-events-auto min-w-0 truncate rounded-sm font-display text-[26px] leading-tight text-paper transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-2"
            >
              {project.title}
            </Link>
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 translate-y-0.5 text-muted"
            />
          </h3>

          <p
            data-testid="card-blurb"
            className="mt-1 line-clamp-2 text-[14.5px] leading-[1.5] text-paper/85"
          >
            {project.blurb}
          </p>
        </div>

        {headlineStat ? (
          <div className="mt-1">
            <div
              className="font-mono text-[27px] leading-none tracking-tight"
              style={{ color: threadColor }}
            >
              <CountUp value={headlineStat.value} />
            </div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wide text-muted">
              {headlineStat.label}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export interface CardBackProps {
  project: ProjectItem;
  displayIndex: string;
  threadColor: string;
  linkRef: React.RefObject<HTMLAnchorElement | null>;
  onFlipBack: () => void;
  onOpen?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/** Back face: full stat sheet, skill chips, tag line, and the case-study link. */
export function CardBack({ project, displayIndex, threadColor, linkRef, onFlipBack, onOpen }: CardBackProps) {
  const skills = project.skills ?? [];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-ink-2">
      <div className="pointer-events-none absolute inset-[1px] rounded-[17px] shadow-[inset_0_0_0_1px_rgba(245,241,234,0.08)]" />

      <div className="flex flex-1 flex-col justify-between px-3.5 py-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Stats · No. {displayIndex}
          </p>

          <div className="mt-2.5 flex flex-col gap-1.5">
            {(project.stats ?? []).map((stat) => (
              <div
                key={stat.label}
                className="flex items-baseline justify-between gap-3 border-b border-paper/10 pb-1.5"
              >
                <span
                  className="font-mono text-[15px] font-semibold leading-tight"
                  style={{ color: threadColor }}
                >
                  {stat.value}
                </span>
                <span className="text-right font-mono text-[10px] uppercase tracking-wide text-muted">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((skillId) => (
                <span
                  key={skillId}
                  className={`rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide ${SKILL_TEXT_CLASS[skillId]} ${SKILL_BORDER_CLASS[skillId]}`}
                  style={{ backgroundColor: hexToRgba(THREAD_COLOR[skillId], 0.1) }}
                >
                  {SKILL_CHIP_LABELS[skillId]}
                </span>
              ))}
            </div>
          ) : null}

          <p className="mt-3 text-[11px] leading-snug text-muted">{project.tag}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Link
            ref={linkRef}
            href={project.href}
            onClick={onOpen}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-1 font-sans text-[13.5px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-2"
            style={{ color: threadColor }}
          >
            Read the case study
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={onFlipBack}
            aria-label="Flip back to front"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-2 font-mono text-[12px] text-muted transition-colors hover:text-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-2"
          >
            ↺ Flip back
          </button>
        </div>
      </div>
    </div>
  );
}
