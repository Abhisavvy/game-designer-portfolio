"use client";

import { forwardRef, type ReactNode } from "react";
import { clsx } from "clsx";

export interface CardGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared responsive layout for both the Work and Projects card grids.
 *
 * Flex-wrap (not CSS Grid auto-flow) is deliberate: with `justify-center`,
 * flexbox centres each *wrapped line* independently, so a partial last row
 * (Work's 7 cards = 4 + 3) is centred under itself rather than left-aligned
 * under a full-width track. Each card carries its own fixed width per
 * breakpoint (see CollectibleCard) and never grows/shrinks, so columns are
 * never stretched.
 */
export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(function CardGrid(
  { children, className },
  ref,
) {
  return (
    <div
      ref={ref}
      data-testid="card-grid"
      className={clsx("flex flex-wrap justify-center gap-x-6 gap-y-12 sm:gap-y-14", className)}
    >
      {children}
    </div>
  );
});
