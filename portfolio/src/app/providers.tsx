"use client";

import { MotionConfig } from "framer-motion";
import { CardOpenOverlay } from "@/features/portfolio/components/transitions/CardOpenOverlay";
import { CardOpenRouteWatcher } from "@/features/portfolio/components/transitions/CardOpenRouteWatcher";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Card -> case-study "open" overlay: a singleton renderer plus the
          route watcher that tells it when the new page has committed.
          Mounted once so they exist on every page, regardless of which
          card (if any) triggered them. */}
      <CardOpenRouteWatcher />
      <CardOpenOverlay />
      {children}
    </MotionConfig>
  );
}
