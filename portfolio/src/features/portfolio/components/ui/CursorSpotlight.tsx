"use client";

import { useEffect, useRef } from "react";

/**
 * A soft, ambient light that follows the pointer — fine-pointer devices
 * only, and off entirely with `prefers-reduced-motion`. Sits on a fixed,
 * `pointer-events-none` layer (same technique as the film-grain overlay
 * in globals.css) so it never intercepts clicks or shifts layout.
 *
 * Pointer position is tracked via a plain `pointermove` listener and
 * applied through a single rAF-throttled transform update — no
 * continuous animation loop runs while the pointer is idle.
 */
export function CursorSpotlight() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || prefersReduced) return;

    const el = glowRef.current;
    if (!el) return;

    let rafId = 0;
    let x = 0;
    let y = 0;
    let revealed = false;

    const apply = () => {
      rafId = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (!revealed) {
        revealed = true;
        el.style.opacity = "1";
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      x = event.clientX;
      y = event.clientY;
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ zIndex: 1 }}>
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[56rem] w-[56rem] rounded-full opacity-0 transition-opacity duration-700 ease-out will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.05) 0%, rgba(245,241,234,0.03) 40%, transparent 72%)",
        }}
      />
    </div>
  );
}
