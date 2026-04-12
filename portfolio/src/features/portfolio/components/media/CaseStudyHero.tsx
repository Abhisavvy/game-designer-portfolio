"use client";

import Image from "next/image";
import type { CaseStudyMedia } from "../../data/case-study-media";
import { usePrefersReducedMotion, useViewportMinMd } from "./useMediaPreferences";

type Hero = NonNullable<CaseStudyMedia["hero"]>;

export function CaseStudyHero({ hero }: { hero: Hero }) {
  const md = useViewportMinMd();
  const reduced = usePrefersReducedMotion();
  const videoOk = Boolean(hero.videoSrc) && md && !reduced;

  return (
    <div
      className="relative mb-10 w-full aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
      role="img"
      aria-label="Case study hero visual"
    >
      {videoOk && hero.videoSrc ? (
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover object-center opacity-30"
          autoPlay
          muted
          loop
          playsInline
          poster={hero.posterSrc}
        >
          <source src={hero.videoSrc} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={hero.posterSrc}
          alt="Case study hero image"
          fill
          sizes="100vw"
          priority
          className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent"
        aria-hidden
      />
    </div>
  );
}
