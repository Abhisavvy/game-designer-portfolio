"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CaseStudyMedia } from "../../data/case-study-media";
import { usePrefersReducedMotion, useViewportMinMd } from "./useMediaPreferences";
import { PinnedFrame } from "../blueprint/PinnedFrame";
import { reportHeroDecode, reportHeroTarget } from "../transitions/cardOpenTransition";

type Hero = NonNullable<CaseStudyMedia["hero"]>;

export function CaseStudyHero({ hero, title, slug }: { hero: Hero; title: string; slug: string }) {
  const md = useViewportMinMd();
  const reduced = usePrefersReducedMotion();
  const videoOk = Boolean(hero.videoSrc) && md && !reduced;
  const heroAlt = `${title}: key art`;
  // Mirrors template.tsx's identical check: only client navigations that
  // land mid-card-open-overlay ever see this set, and only at this
  // component's first render (Framer reads `initial` once, at mount).
  const inCardOpen =
    typeof document !== "undefined" && document.documentElement.dataset.cardOpen === "1";

  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Shared-element landing: report this frame's real rect (and the hero
  // image's own decode()) back to the card-open overlay so it can retarget
  // its artwork clone from a predicted guess to the exact real position —
  // only meaningful while an overlay landing is actually in flight.
  //
  // The rect is reported on every frame (not just once at mount) for as
  // long as the overlay is up: layout can still shift after the first
  // measurement (a web-font swap, the hero image's own decode reflowing
  // the page, a late scroll correction), and `reportHeroTarget` itself is a
  // no-op unless the rect actually changed, so a settled layout costs
  // nothing beyond a cheap rect comparison each frame.
  //
  // Also reported alongside the rect: this frame's own rendered media
  // (currentSrc + object-position), so the overlay can crossfade its clone
  // to it — some cards' own artwork now deliberately differs from this
  // page's hero image (see LoomCard's `cardImageSrc`), so without this the
  // reveal would visibly swap pictures the instant the panel fades.
  useEffect(() => {
    if (!inCardOpen) return;
    const node = frameRef.current;
    if (!node) return;

    const img = imgRef.current;
    if (img) {
      reportHeroDecode(typeof img.decode === "function" ? img.decode() : Promise.resolve());
    }

    let raf = 0;
    const measure = () => {
      if (document.documentElement.dataset.cardOpen !== "1") return; // overlay ended
      const rect = node.getBoundingClientRect();
      let destVisual: { currentSrc: string; objectPosition: string } | null = null;
      if (imgRef.current) {
        destVisual = {
          currentSrc: imgRef.current.currentSrc || hero.posterSrc,
          objectPosition: getComputedStyle(imgRef.current).objectPosition || "center",
        };
      } else if (videoRef.current) {
        // No "currentSrc" equivalent worth reading off a <video> — the
        // poster IS the still frame actually visible until playback
        // starts, and is the closest analog to a destination photo here.
        destVisual = {
          currentSrc: hero.posterSrc,
          objectPosition: getComputedStyle(videoRef.current).objectPosition || "center",
        };
      }
      reportHeroTarget({ top: rect.top, left: rect.left, width: rect.width, height: rect.height }, destVisual);
      raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="bp-reveal mb-10"
      data-card-open-target={slug}
      // Opacity is 1 in BOTH `initial` and `whileInView` — this hero image
      // is the page's priority/LCP element, so it must never fade in from
      // opacity:0 (that delays when Chrome considers it "painted" for LCP
      // timing). Only `y` animates: a transform-only entrance on the
      // frame, which never hides the image itself. While a card-open
      // overlay landing is in flight (`data-card-open` on <html>), skip
      // even that: the real image must sit fully still and settled
      // underneath the overlay, which is what's actually animating in.
      initial={inCardOpen ? false : { opacity: 1, y: 20 }}
      whileInView={inCardOpen ? undefined : { opacity: 1, y: 0 }}
      animate={inCardOpen ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <PinnedFrame figureLabel="FIG. 1" caption={title}>
        <div ref={frameRef} className="absolute inset-0" role="img" aria-label={heroAlt}>
          {videoOk && hero.videoSrc ? (
            <video
              ref={videoRef}
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
              ref={imgRef}
              src={hero.posterSrc}
              alt={heroAlt}
              fill
              // The frame's real width at each breakpoint (article padding,
              // plus the xl contents sidebar), times 1.125: a poster up to
              // 2:1 overflows this 16:9 box's width by that much under
              // object-cover. Matches the measured frame width at every
              // viewport without over-fetching on phones.
              sizes="(min-width: 1440px) 1229px, (min-width: 1280px) calc(112.5vw - 392px), (min-width: 640px) calc(112.5vw - 90px), calc(112.5vw - 54px)"
              priority
              className="absolute inset-0 z-0 h-full w-full object-cover object-center"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#07101e]/90 via-[#07101e]/15 to-transparent"
            aria-hidden
          />
        </div>
      </PinnedFrame>
    </motion.div>
  );
}
