"use client";

import { useEffect, useState } from "react";

/** `true` when viewport is at least Tailwind `md` (768px). */
export function useViewportMinMd() {
  const [md, setMd] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const fn = () => setMd(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return md;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true); // Safe default to prevent motion flash
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}
