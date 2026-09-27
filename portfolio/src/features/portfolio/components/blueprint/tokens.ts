/**
 * Shared design tokens for the case-study "Design Blueprint" redesign.
 *
 * Fonts reference CSS variables defined globally (by a parallel workstream)
 * WITH fallbacks, so this page still looks correct even if those variables
 * are not yet defined.
 */
import type { CSSProperties } from "react";

export const FONT_DISPLAY =
  'var(--font-display, "Instrument Serif", Georgia, serif)';
export const FONT_SANS = "var(--font-sans, Inter, system-ui, sans-serif)";
export const FONT_MONO =
  'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)';

/** Inline style helpers (Tailwind arbitrary-value class strings get unwieldy
 *  once a var() with a quoted, multi-fallback font stack is involved). */
export const fontDisplayStyle = { fontFamily: FONT_DISPLAY } as const;
export const fontSansStyle = { fontFamily: FONT_SANS } as const;
export const fontMonoStyle = { fontFamily: FONT_MONO } as const;

export const BP_COLORS = {
  text: "#F5F1EA",
  textDim: "rgba(245,241,234,0.88)",
  muted: "#A8A29E",
  accent: "#F97316",
  bgTop: "#0A1628",
  bgBottom: "#07101E",
  gridMinor: "rgba(125,175,255,0.07)",
  gridMajor: "rgba(125,175,255,0.13)",
  drawLine: "rgba(147,197,253,0.45)",
  drawLineDim: "rgba(147,197,253,0.28)",
  /** Solid (non-transparent) version of the drawLine hue, for small text
   *  (e.g. FIG. N caption labels) where drawLine's translucency fails WCAG
   *  AA contrast (~3:1) against the blueprint background. */
  figLabel: "#93C5FD",
} as const;

/** Fallback thread color when a project has no tagged skills. */
export const DEFAULT_THREAD_COLOR = BP_COLORS.accent;

/**
 * React's `CSSProperties` intentionally has no index signature (it's closed
 * to enable typo-checking against csstype), so a plain object literal with a
 * `--custom-property` key doesn't type-check as a `style` value. This
 * centralizes the one assertion needed to set CSS custom properties from
 * inline styles, e.g. `style={cssVars({ color: "...", "--thread": hex })}`.
 */
export function cssVars(style: Record<string, string | number | undefined>): CSSProperties {
  return style as CSSProperties;
}
