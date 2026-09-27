"use client";

import type { CSSProperties, ReactNode } from "react";
import { MaskedWords } from "./MaskedWords";
import { useRevealOnView } from "./useRevealOnView";

export interface SectionHeadingProps {
  /** Two-digit section number, e.g. "01". */
  index: string;
  /** Short mono/uppercase label shown next to the index. */
  eyebrow: string;
  /** Display-serif heading. Wrap the emphasised word(s) in <em>. */
  title: ReactNode;
  /** Optional supporting copy, capped to a readable line length. */
  subtitle?: string;
  align?: "left" | "center";
  id?: string;
}

const eyebrowDelay = { "--reveal-delay": 60 } as CSSProperties;
const subtitleDelay = { "--reveal-delay": 360 } as CSSProperties;

/**
 * The single heading system for all major sections: a mono eyebrow row
 * (index + accent hairline + label), a display-serif title where <em>
 * renders italic in the accent colour, and an optional muted subtitle.
 * No gradient-clip text — colour comes from the token palette only.
 *
 * On first entering the viewport, the hairline draws in and the title
 * words slide up out of a mask, once. With reduced motion or no JS,
 * everything simply renders in its final, visible position — see
 * `useRevealOnView` for how that guarantee holds.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  subtitle,
  align = "left",
  id,
}: SectionHeadingProps) {
  const centered = align === "center";
  const revealRef = useRevealOnView<HTMLDivElement>();

  return (
    <div id={id} ref={revealRef} className={centered ? "text-center" : "text-left"}>
      <div
        className={`mb-5 flex items-center gap-3 ${
          centered ? "justify-center" : "justify-start"
        }`}
      >
        <span aria-hidden="true" className="reveal-hairline h-px w-8 shrink-0 bg-accent" />
        <p
          className="reveal-item font-mono text-[12px] uppercase tracking-[0.2em] text-muted sm:text-[13px]"
          style={eyebrowDelay}
        >
          <span className="text-paper/70">{index}</span>
          <span className="mx-2 text-muted/60">—</span>
          {eyebrow}
        </p>
      </div>

      <h2
        className="font-display font-normal text-paper [&_em]:italic [&_em]:text-accent"
        style={{
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          lineHeight: 1.02,
          letterSpacing: "-0.01em",
        }}
      >
        <MaskedWords delayStep={45} baseDelay={120}>
          {title}
        </MaskedWords>
      </h2>

      {subtitle ? (
        <p
          className={`reveal-item mt-5 max-w-[60ch] text-base leading-relaxed text-muted sm:text-lg ${
            centered ? "mx-auto" : ""
          }`}
          style={subtitleDelay}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
