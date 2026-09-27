"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";

const RANGE = 80; // px — pointer must be within this radius of the button centre
const MAX_PULL = 8; // px — capped magnetic travel

/**
 * A CTA `<a>` that pulls gently toward the pointer when it comes within
 * ~80px, and springs back when it leaves. Fine-pointer devices only, off
 * with `prefers-reduced-motion` — on touch/reduced-motion it's a plain
 * static link with zero behavioural difference.
 */
export function MagneticButton({
  href,
  download,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  download?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 22, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 320, damping: 22, mass: 0.6 });

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || prefersReduced) return;

    const reset = () => {
      x.set(0);
      y.set(0);
    };

    const onMove = (event: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const distance = Math.hypot(dx, dy);
      if (distance < RANGE) {
        const pull = (1 - distance / RANGE) * MAX_PULL;
        const angle = Math.atan2(dy, dx);
        x.set(Math.cos(angle) * pull);
        y.set(Math.sin(angle) * pull);
      } else {
        reset();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", reset);
    };
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={href}
      download={download}
      aria-label={ariaLabel}
      className={className}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.a>
  );
}
