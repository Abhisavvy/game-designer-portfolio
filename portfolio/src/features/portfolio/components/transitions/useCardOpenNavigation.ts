"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { isPlainLeftClick } from "./cardActivation";
import { getCardOpenSnapshot, openCardTransition, type CardOpenRect, type CardOpenVisual } from "./cardOpenTransition";

export interface CardActivationInput {
  href: string;
  reducedMotion: boolean;
  panelRect: CardOpenRect;
  artworkRect: CardOpenRect;
  visual: CardOpenVisual;
}

/**
 * Shared activation logic for both the collectible cards (Work/Projects) and
 * the hero Loom cards: prefetch on hover/focus/in-view, and on a plain left
 * click, kick off the overlay-clone "open" animation, which pushes the route
 * once its panel covers the viewport (reduced motion pushes immediately,
 * with no overlay). Anything else (modifier keys, middle/right click)
 * is left alone so the real `<a href>` still gets native new-tab/context-menu
 * behaviour.
 */
export function useCardOpenNavigation() {
  const router = useRouter();

  const prefetch = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router],
  );

  const activate = useCallback(
    (event: MouseEvent, input: CardActivationInput) => {
      if (!isPlainLeftClick(event)) return;
      event.preventDefault();

      if (input.reducedMotion) {
        router.push(input.href);
        return;
      }

      const current = getCardOpenSnapshot();
      if (current && current.phase !== "leaving" && current.href === input.href) {
        // Already opening this exact card — a rapid duplicate activation
        // (double-click, double-Enter) must do nothing extra: not restart
        // the animation, and not push the same route a second time.
        return;
      }

      // The push is handed to the transition, which fires it once the panel
      // covers the viewport (see openCardTransition).
      openCardTransition(input.href, input.panelRect, input.artworkRect, input.visual, () =>
        router.push(input.href),
      );
    },
    [router],
  );

  return { activate, prefetch };
}
