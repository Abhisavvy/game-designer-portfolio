"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  CARD_OPEN_DEST_GRADIENT,
  CARD_OPEN_DEST_NAVY,
  FADE_MS,
  QUICK_FADE_MS,
  RETARGET_MOVE_MS,
  getCardOpenServerSnapshot,
  getCardOpenSnapshot,
  reportArtworkSettled,
  reportCrossfadeSettled,
  subscribeCardOpen,
  type CardOpenRect,
  type CardOpenState,
} from "./cardOpenTransition";

const BP_GRID_MINOR = "rgba(125,175,255,0.07)";
const BP_GRID_MAJOR = "rgba(125,175,255,0.13)";
const PANEL_REST_BG = "#141210"; // ink-2, matches the card's own panel background

const EASE = [0.22, 1, 0.36, 1] as const;
/** The panel's expansion length, in seconds (EXPAND_MS in cardOpenTransition). */
const EXPAND_S = 0.45;

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const int = parseInt(clean, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Singleton overlay — mounted once (in providers.tsx) alongside
 * `CardOpenRouteWatcher`. Renders nothing until a card calls
 * `openCardTransition`, then portals TWO independent fixed-position pieces
 * to `document.body`:
 *  - a "panel" (the card's whole rect -> fullscreen backdrop), and
 *  - an "artwork" clone, animating from the card's own artwork rect toward
 *    the real `CaseStudyHero` frame's rect (predicted at first, retargeted
 *    the moment that component reports its real measurement) — the
 *    shared-element landing, so the reveal hands off to art that's already
 *    sitting exactly where the clone left it.
 */
export function CardOpenOverlay() {
  const state = useSyncExternalStore(subscribeCardOpen, getCardOpenSnapshot, getCardOpenServerSnapshot);
  if (!state || typeof document === "undefined") return null;
  return createPortal(<OverlayBody key={state.key} state={state} />, document.body);
}

function rectStyle(r: CardOpenRect) {
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function OverlayBody({ state }: { state: CardOpenState }) {
  const {
    key,
    phase,
    panelRect0,
    artworkRect0,
    artworkTarget,
    targetVersion,
    lateRetarget,
    quickLeave,
    visual,
    destVisual,
    needsCrossfade,
  } = state;
  const expanded = phase !== "opening";
  const leaving = phase === "leaving";
  const holding = phase === "holding";
  const opening = phase === "opening";

  const vw = typeof window !== "undefined" ? window.innerWidth : panelRect0.width;
  const vh = typeof window !== "undefined" ? window.innerHeight : panelRect0.height;

  const moveDuration = expanded ? EXPAND_S : 0.15;
  // A retarget that arrives after the artwork was already animating toward
  // some other rect gets a shorter, ease-out glide instead of the full
  // expand duration — the fade is gated on this finishing (see
  // `onAnimationComplete` below), so a long glide here would add visible
  // delay after everything else is already ready to reveal.
  const artworkMoveDuration = expanded && lateRetarget ? RETARGET_MOVE_MS / 1000 : moveDuration;
  const fadeDuration = (quickLeave ? QUICK_FADE_MS : FADE_MS) / 1000;
  const glowColor = hexToRgba(visual.threadColor, 0.7);

  const fullscreen: CardOpenRect = { top: 0, left: 0, width: vw, height: vh };
  const panelTarget = expanded ? fullscreen : panelRect0;
  const artworkAnimTarget = expanded ? artworkTarget : artworkRect0;

  return (
    <>
      {/* Panel: the card's own rect -> fullscreen backdrop (navy + grid). The
          artwork clone (below, higher z-index) paints over whatever part of
          this it overlaps, so the grid can simply run full-bleed underneath
          it with no "hole" to cut. */}
      <motion.div
        aria-hidden="true"
        data-testid="card-open-overlay"
        data-phase={phase}
        style={{
          position: "fixed",
          zIndex: 2147483000,
          // Auto except while leaving: a second click during the ~0.9s
          // animation must land on THIS overlay (and do nothing) instead of
          // passing through to whatever the destination page already
          // mounted underneath it. Once leaving, the real page needs to be
          // interactive again immediately as it fades in.
          pointerEvents: leaving ? "none" : "auto",
          overflow: "hidden",
          background: PANEL_REST_BG,
          willChange: "top, left, width, height",
        }}
        initial={{
          ...rectStyle(panelRect0),
          borderRadius: 18,
          rotateX: visual.fromRotateX ?? 0,
          rotateY: visual.fromRotateY ?? 0,
          rotate: visual.fromRotate ?? 0,
          opacity: 1,
        }}
        animate={{
          ...rectStyle(panelTarget),
          borderRadius: expanded ? 0 : 18,
          backgroundColor: expanded ? CARD_OPEN_DEST_NAVY : PANEL_REST_BG,
          rotateX: 0,
          rotateY: 0,
          rotate: 0,
          opacity: leaving ? 0 : 1,
        }}
        transition={{
          top: { duration: moveDuration, ease: EASE },
          left: { duration: moveDuration, ease: EASE },
          width: { duration: moveDuration, ease: EASE },
          height: { duration: moveDuration, ease: EASE },
          borderRadius: { duration: moveDuration, ease: EASE },
          backgroundColor: { duration: moveDuration, ease: EASE },
          rotateX: { duration: 0.15, ease: EASE },
          rotateY: { duration: 0.15, ease: EASE },
          rotate: { duration: 0.15, ease: EASE },
          opacity: { duration: leaving ? fadeDuration : 0.05 },
        }}
      >
        {/* Thread-colour glow — the "open beat" punch. */}
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "inherit",
            boxShadow: `0 18px 60px -10px ${glowColor}, 0 0 0 1px ${glowColor}`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opening ? 1 : 0 }}
          transition={{ duration: opening ? 0.1 : 0.25 }}
        />

        {/* Blueprint grid. Fades in only once the panel has finished growing:
            four gradient layers across a box that changes size every frame
            meant a full repaint per frame on large screens, and that was the
            main source of dropped frames during the desktop expansion. */}
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: [
              `linear-gradient(to right, ${BP_GRID_MAJOR} 1px, transparent 1px)`,
              `linear-gradient(to bottom, ${BP_GRID_MAJOR} 1px, transparent 1px)`,
              `linear-gradient(to right, ${BP_GRID_MINOR} 1px, transparent 1px)`,
              `linear-gradient(to bottom, ${BP_GRID_MINOR} 1px, transparent 1px)`,
            ].join(", "),
            backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.3, delay: expanded ? EXPAND_S : 0 }}
        />

        {holding ? (
          <ShimmerLine
            color={visual.threadColor}
            // Clamp into view: the PREDICTED target (used until the real
            // hero frame reports in) can sit far enough down that its own
            // bottom edge falls below the fold — the shimmer must still be
            // visible even then, so cap it well within the viewport.
            top={Math.min(Math.max(0, artworkTarget.top + artworkTarget.height - panelTarget.top), vh - 48)}
          />
        ) : null}
      </motion.div>

      {/* Artwork clone — an independent fixed element (never a child of the
          panel above) so its rect animates in plain viewport coordinates,
          toward the real CaseStudyHero frame's rect, regardless of what the
          panel is doing. Painted after (so: on top of) the panel. */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "fixed",
          zIndex: 2147483001,
          pointerEvents: leaving ? "none" : "auto",
          overflow: "hidden",
          willChange: "top, left, width, height",
        }}
        initial={{ ...rectStyle(artworkRect0), borderRadius: 14, opacity: 1 }}
        animate={{
          ...rectStyle(artworkAnimTarget),
          borderRadius: expanded ? 0 : 14,
          opacity: leaving ? 0 : 1,
        }}
        transition={{
          top: { duration: artworkMoveDuration, ease: EASE },
          left: { duration: artworkMoveDuration, ease: EASE },
          width: { duration: artworkMoveDuration, ease: EASE },
          height: { duration: artworkMoveDuration, ease: EASE },
          borderRadius: { duration: artworkMoveDuration, ease: EASE },
          opacity: { duration: leaving ? fadeDuration : 0.05 },
        }}
        onAnimationComplete={() => {
          // Only meaningful while actually gliding toward a real (or
          // predicted) target — ignore the "opening" beat (no motion yet)
          // and anything firing after we've already started leaving.
          if (phase === "opening" || phase === "leaving") return;
          reportArtworkSettled(key, targetVersion);
        }}
      >
        {visual.currentSrc ? (
          // A clone of the card's ALREADY-DECODED image via `currentSrc`
          // (the exact srcset candidate the browser picked), not a fresh
          // managed <Image> load — this must paint instantly from cache.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={visual.currentSrc}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: visual.objectPosition || "center",
            }}
          />
        ) : null}
        {/* The destination's OWN picture, layered on top and faded in over
            the same glide the geometry uses (so both finish together — see
            `onAnimationComplete` above) whenever it's a genuinely different
            picture (`needsCrossfade`) — by the time the panel fades, this is
            fully opaque and the hand-off is identical in every sense, not
            just geometrically. Always mounted (never conditionally, even
            though it's invisible until needed): a same-source card renders
            this at a permanent opacity 0, so its `src` never changes and
            nothing is ever fetched for it, but a card that DOES need it
            never mounts this fresh mid-flight — which left its own enter
            transition starting a frame behind the already-running geometric
            one, occasionally missing the settle deadline below. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={needsCrossfade ? destVisual!.currentSrc : visual.currentSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: needsCrossfade ? destVisual!.objectPosition || "center" : visual.objectPosition,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: needsCrossfade && expanded ? 1 : 0 }}
          transition={{ duration: artworkMoveDuration, ease: EASE }}
          onAnimationComplete={() => {
            // Tracked separately from the artwork frame's own settle (see
            // `reportCrossfadeSettled`) — a different Framer-animated
            // element, so its completion isn't guaranteed to land in the
            // same tick as the geometric one's.
            if (!needsCrossfade || phase === "opening" || phase === "leaving") return;
            reportCrossfadeSettled(key);
          }}
        />
        {/* Crossfades to CaseStudyHero's own gradient overlay exactly, so once
            the panel fades away underneath, nothing visibly changes here. */}
        <motion.div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0 }}
          initial={{ background: "linear-gradient(to top, rgba(20,18,16,0.35), transparent 45%)" }}
          animate={{ background: expanded ? CARD_OPEN_DEST_GRADIENT : "linear-gradient(to top, rgba(20,18,16,0.35), transparent 45%)" }}
          transition={{ duration: moveDuration, ease: EASE }}
        />

        {/* Title/stat text — only ever visible during the brief "opening"
            beat, positioned just below the artwork's OWN (still small) box,
            matching where the source card's text panel sits. Faded out well
            before the artwork starts moving toward its target. */}
        <motion.div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            padding: "12px 16px",
            color: "#F5F1EA",
            fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: opening ? 1 : 0 }}
          transition={{ duration: 0.12 }}
        >
          {visual.displayIndex ? (
            <div style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.7, letterSpacing: "0.08em" }}>
              No. {visual.displayIndex}
            </div>
          ) : null}
          <div style={{ fontSize: 17, marginTop: 4, fontWeight: 500 }}>{visual.title}</div>
          {visual.statValue ? (
            <div style={{ fontFamily: "monospace", fontSize: 18, color: visual.threadColor, marginTop: 6 }}>
              {visual.statValue}
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </>
  );
}

/** A thin sweeping highlight bar — the only signal, while the route is still loading, that
 *  something is happening (never a frozen hold). */
function ShimmerLine({ color, top }: { color: string; top: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        height: 3,
        overflow: "hidden",
        background: "rgba(245,241,234,0.08)",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "40%",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
        initial={{ x: "-100%" }}
        animate={{ x: "350%" }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
