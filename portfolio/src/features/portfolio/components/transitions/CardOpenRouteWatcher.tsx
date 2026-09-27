"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { markRouteCommitted } from "./cardOpenTransition";

/**
 * Mounted once (providers.tsx), alongside `CardOpenOverlay`. `usePathname()`
 * changes exactly when the new route has committed its first render — the
 * one signal `cardOpenTransition`'s state machine needs to know it may stop
 * "holding" and start its leave (subject to its own minimum-duration timer).
 * Renders nothing; this is pure plumbing between the App Router and the
 * overlay's external store.
 */
export function CardOpenRouteWatcher() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    markRouteCommitted(pathname);
  }, [pathname]);

  return null;
}
