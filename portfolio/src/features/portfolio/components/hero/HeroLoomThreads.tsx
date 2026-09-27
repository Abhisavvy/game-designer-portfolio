"use client";

import { useId } from "react";
import { motion, type Transition } from "framer-motion";
import { buildSmoothPath, POSITION_KEYS } from "./loom-geometry";
import { GLOW_STROKE_EXTRA, MAIN_STROKE } from "./useLoomLoop";
import type { HeroLoomHandle } from "./useHeroLoom";

const THREAD_ENTRANCE_DURATION = 0.9;
const THREAD_ENTRANCE_STAGGER = 0.12;

/**
 * Fades the whole layer's left/top/bottom edges into the section background
 * — the right edge is deliberately left fully opaque all the way to 100%,
 * since threads are meant to visibly run off that edge, not fade into it.
 * Two mask layers combined with `intersect`/`source-in` (both syntaxes, for
 * engine coverage) so corners fade along both axes at once instead of the
 * layers simply adding together into a hard-edged box.
 */
const THREADS_MASK =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.14) 12%, rgba(0,0,0,0.18) 42%, black 66%, black 100%), " +
  "linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)";

/**
 * The full-bleed threads layer: absolute, inset across the entire hero
 * section, behind everything else. Pure decoration (`pointer-events-none`,
 * `aria-hidden`) — pointer-bend tracking lives on the section element
 * itself (see `useHeroLoom`'s `containerRef`), not here, precisely because
 * this layer must stay click-through.
 */
export function HeroLoomThreads({ loom, className }: { loom: HeroLoomHandle; className?: string }) {
  const reactId = useId();
  const blurId = `loom-blur-${reactId}`;
  const gridId = `loom-grid-${reactId}`;
  const clipIdBase = `loom-clip-${reactId}`;
  const { layout, pose, svgRef, mainRefs, glowRefs, glintRefs, checkpointRefs } = loom;

  const threadTransition = (index: number): Transition =>
    pose === "start"
      ? { duration: 0 }
      : { duration: THREAD_ENTRANCE_DURATION, delay: index * THREAD_ENTRANCE_STAGGER, ease: "easeOut" };

  // Entrance wipe: a per-thread clipPath rect whose WIDTH animates 0 -> full,
  // in the SAME user-space/viewBox coordinates as the thread paths — not a
  // `pathLength` dasharray. `pathLength` normalisation + `vector-effect:
  // non-scaling-stroke` + this SVG's anisotropic `preserveAspectRatio="none"`
  // stretch don't compose correctly (the dash gets laid out against the
  // un-stretched user-space length while the stroke itself paints in device
  // pixels), which visibly truncated every thread partway — a bug, not a
  // stylistic choice. A clip rect has no such unit mismatch: it's clipped in
  // the exact same coordinate space the path geometry lives in, so it scales
  // WITH the path (however anisotropically) instead of against it.
  const margin = { x: layout.viewBox.w * 0.15, y: layout.viewBox.h * 0.15 };
  const clipRectX = -margin.x;
  const clipRectY = -margin.y;
  const clipRectH = layout.viewBox.h + margin.y * 2;
  const clipRectFullW = layout.viewBox.w + margin.x * 2;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        WebkitMaskImage: THREADS_MASK,
        maskImage: THREADS_MASK,
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    >
      <svg
        ref={svgRef}
        data-testid="loom-threads-svg"
        viewBox={`0 0 ${layout.viewBox.w} ${layout.viewBox.h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id={blurId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
          <pattern id={gridId} width={layout.grid.size} height={layout.grid.size} patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="1.2" fill="var(--paper, #F5F1EA)" />
          </pattern>
          {layout.routes.map((route, i) => (
            <clipPath key={`clip-${route.id}`} id={`${clipIdBase}-${i}`} clipPathUnits="userSpaceOnUse">
              <motion.rect
                x={clipRectX}
                y={clipRectY}
                height={clipRectH}
                initial={false}
                animate={{ width: pose === "resting" ? clipRectFullW : 0 }}
                transition={threadTransition(i)}
              />
            </clipPath>
          ))}
        </defs>

        <rect
          x={0}
          y={0}
          width={layout.viewBox.w}
          height={layout.viewBox.h}
          fill={`url(#${gridId})`}
          opacity={0.05}
        />

        {layout.routes.map((route, i) => (
          <path
            key={`glow-${route.id}`}
            ref={(el) => {
              glowRefs.current[i] = el;
            }}
            d={buildSmoothPath(route.points)}
            fill="none"
            stroke={route.color}
            strokeWidth={MAIN_STROKE + GLOW_STROKE_EXTRA}
            strokeLinecap="round"
            filter={`url(#${blurId})`}
            clipPath={`url(#${clipIdBase}-${i})`}
            style={{ opacity: 0.32 }}
          />
        ))}

        {layout.routes.map((route, i) => (
          <path
            key={`main-${route.id}`}
            ref={(el) => {
              mainRefs.current[i] = el;
            }}
            d={buildSmoothPath(route.points)}
            fill="none"
            stroke={route.color}
            strokeWidth={MAIN_STROKE}
            strokeLinecap="round"
            clipPath={`url(#${clipIdBase}-${i})`}
            style={{ opacity: 0.85 }}
          />
        ))}

        {[0, 1].map((slotIndex) => (
          <path
            key={`glint-${slotIndex}`}
            ref={(el) => {
              glintRefs.current[slotIndex] = el;
            }}
            d=""
            fill="none"
            strokeLinecap="round"
            strokeWidth={MAIN_STROKE + 1.1}
            style={{ opacity: 0, mixBlendMode: "screen" }}
          />
        ))}

        {layout.routes
          .filter((route) => route.cardPosition != null)
          .map((route) => {
            const posIndex = POSITION_KEYS.indexOf(route.cardPosition!);
            const anchor = route.points[1];
            return (
              <g
                key={`checkpoint-${route.id}`}
                ref={(el) => {
                  checkpointRefs.current[posIndex] = el;
                }}
                transform={`translate(${anchor.x}, ${anchor.y})`}
              >
                <circle r={7} fill="none" stroke={route.color} strokeWidth={1.4} opacity={0.85} />
                <circle r={2.6} fill={route.color} />
              </g>
            );
          })}
      </svg>
    </div>
  );
}
