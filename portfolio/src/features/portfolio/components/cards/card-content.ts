/**
 * Shared display helpers for the "Collectible Cards" used by WorkSection and
 * ProjectsSection: skill-thread labels/icons/colours, index formatting, and
 * small colour-math utilities. No JSX here so it can be imported by both
 * client components and plain helpers without pulling in React types.
 */
import type { ComponentType, CSSProperties } from "react";
import { Coins, RefreshCcw, Radio, CreditCard, Puzzle, Bot } from "lucide-react";
import { SKILL_THREADS, type SkillThreadId } from "@/features/portfolio/data/site-content";

/** Short, all-caps chip labels (distinct from SKILL_THREADS' longer sentence-case labels). */
export const SKILL_CHIP_LABELS: Record<SkillThreadId, string> = {
  economy: "ECONOMY",
  retention: "RETENTION",
  liveops: "LIVEOPS",
  monetization: "MONETIZATION",
  systems: "SYSTEMS",
  ai: "AI & TOOLS",
};

export const SKILL_ICONS: Record<
  SkillThreadId,
  ComponentType<{ className?: string; style?: CSSProperties }>
> = {
  economy: Coins,
  retention: RefreshCcw,
  liveops: Radio,
  monetization: CreditCard,
  systems: Puzzle,
  ai: Bot,
};

/**
 * Static Tailwind class-name lookups for the per-skill "thread" colour.
 * Every string below must stay a complete, literal token (never built via
 * template-string concatenation) so Tailwind's content scanner can find it.
 */
export const SKILL_TEXT_CLASS: Record<SkillThreadId, string> = {
  economy: "text-thread-economy",
  retention: "text-thread-retention",
  liveops: "text-thread-liveops",
  monetization: "text-thread-monetization",
  systems: "text-thread-systems",
  ai: "text-thread-ai",
};

export const SKILL_BORDER_CLASS: Record<SkillThreadId, string> = {
  economy: "border-thread-economy",
  retention: "border-thread-retention",
  liveops: "border-thread-liveops",
  monetization: "border-thread-monetization",
  systems: "border-thread-systems",
  ai: "border-thread-ai",
};

/** Hex lookup by id, derived from the canonical SKILL_THREADS array. */
export const THREAD_COLOR: Record<SkillThreadId, string> = SKILL_THREADS.reduce(
  (acc, thread) => {
    acc[thread.id] = thread.color;
    return acc;
  },
  {} as Record<SkillThreadId, string>,
);

/** Zero-padded 2-digit index, e.g. `1` -> "01". */
export function formatCardIndex(n: number): string {
  return String(n).padStart(2, "0");
}

/** `#RRGGBB` -> `rgba(r, g, b, alpha)`. No alpha channel parsing needed for this palette. */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const int = parseInt(clean, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Deterministic small "random" rotation per index (degrees), stable across server/client renders. */
const DEAL_ROTATIONS = [-7, 5, -4, 6, -6, 4, -5, 7, -3, 3];
export function dealRotationForIndex(index: number): number {
  return DEAL_ROTATIONS[index % DEAL_ROTATIONS.length];
}

/** Timing constants (ms) shared between BoosterPack's shake/tear state machine and the fan-out entrance delay on ProjectsSection's cards, so the two stay in sync. */
export const BOOSTER_TIMING = {
  shakeAt: 60,
  tearAt: 460,
  fanAt: 520,
  doneAt: 1300,
} as const;
