"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandMark } from "./BrandMark";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const TILE_LETTERS = "WORDROLL".split("");
const TOAST_DURATION_MS = 4000;

/** Fires a burst of up to 16 falling/fading letter tiles. No-op with reduced motion. */
function spawnLetterTiles() {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const width = window.innerWidth;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed; inset:0; z-index:65; pointer-events:none; overflow:hidden;";
  document.body.appendChild(layer);

  const TILE_COUNT = 16;
  for (let i = 0; i < TILE_COUNT; i++) {
    const letter = TILE_LETTERS[i % TILE_LETTERS.length];
    const tile = document.createElement("span");
    tile.textContent = letter;
    const startLeft = Math.max(8, Math.min(width - 36, Math.random() * width));
    tile.style.cssText = `
      position: absolute;
      top: -32px;
      left: ${startLeft}px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono), ui-monospace, monospace;
      font-size: 12px;
      font-weight: 700;
      color: #0b0a09;
      background: #f5f1ea;
      border: 1px solid rgba(249,115,22,0.55);
      border-radius: 4px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    `;
    layer.appendChild(tile);

    const fallDistance = 220 + Math.random() * 200;
    const rotate = (Math.random() - 0.5) * 160;
    const duration = 1300 + Math.random() * 900;
    const delay = Math.random() * 260;

    const animation = tile.animate(
      [
        { transform: "translateY(0) rotate(0deg)", opacity: 1 },
        { transform: `translateY(${fallDistance}px) rotate(${rotate}deg)`, opacity: 0 },
      ],
      { duration, delay, easing: "cubic-bezier(0.36, 0, 0.66, -0.02)", fill: "forwards" }
    );
    animation.onfinish = () => tile.remove();
  }

  window.setTimeout(() => layer.remove(), 3200);
}

/**
 * Konami-code easter egg for the homepage: an achievement-style toast plus
 * a small burst of falling letter tiles. Key tracking ignores events from
 * text inputs/textareas/contenteditable so it never fights with typing,
 * and never calls `preventDefault`, so normal key behaviour is untouched.
 */
export function KonamiEasterEgg() {
  const [visible, setVisible] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const progressRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    setVisible(true);
    setAnnouncement("Achievement unlocked: Curious Recruiter");
    spawnLetterTiles();
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setAnnouncement("");
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      const expected = KONAMI_SEQUENCE[progressRef.current];
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === expected) {
        progressRef.current += 1;
        if (progressRef.current === KONAMI_SEQUENCE.length) {
          progressRef.current = 0;
          trigger();
        }
      } else {
        progressRef.current = key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [trigger]);

  return (
    <>
      {/* Persistent live region so the announcement is reliably picked up
          even though the visual toast below mounts/unmounts. */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            aria-hidden="true"
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed inset-x-0 z-[70] flex justify-center px-4"
            style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-ink-2/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-sm sm:gap-4 sm:px-5 sm:py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white sm:h-11 sm:w-11">
                <BrandMark className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent sm:text-[11px]">
                  Achievement Unlocked
                </p>
                <p className="truncate font-display text-lg text-paper sm:text-xl">
                  Curious Recruiter
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
