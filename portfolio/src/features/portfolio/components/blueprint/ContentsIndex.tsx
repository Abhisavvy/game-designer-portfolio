"use client";

import { usePrefersReducedMotion } from "../media/useMediaPreferences";
import { BP_COLORS, fontMonoStyle } from "./tokens";

export type ContentsEntry = { id: string; label: string; number?: number };

type ContentsIndexProps = {
  sections: ContentsEntry[];
  activeSection: string;
  threadColor: string;
};

/** Height of the fixed site header (see SiteHeader.tsx / app/layout.tsx) —
 *  both nav variants below sit flush beneath it. */
const HEADER_OFFSET = "calc(88px + env(safe-area-inset-top))";

/** Shared scroll-to-section behaviour for both nav variants: smooth by
 *  default, instant under `prefers-reduced-motion`. */
function useScrollToSection() {
  const reduced = usePrefersReducedMotion();
  return (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
  };
}

/**
 * Sticky spec index — hidden below `xl` (1280px); see `CompactContentsIndex`
 * for the <1280px equivalent. Tablet widths (768–1279) intentionally don't
 * get a squeezed-in sidebar; they get the compact chip bar instead (see
 * CaseStudyClient's outer grid).
 */
export function ContentsIndex({ sections, activeSection, threadColor }: ContentsIndexProps) {
  const scrollToSection = useScrollToSection();

  return (
    <nav
      className="sticky top-24 hidden border-l pl-5 xl:block"
      style={{ borderColor: "rgba(255,255,255,0.12)" }}
      aria-label="Section contents"
    >
      <p className="text-[11px] uppercase tracking-[0.22em]" style={{ ...fontMonoStyle, color: BP_COLORS.muted }}>
        Contents
      </p>
      <ul className="mt-4 space-y-1">
        {sections.map((section) => {
          const active = activeSection === section.id;
          return (
            <li key={section.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-5 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full transition-opacity"
                style={{ background: threadColor, opacity: active ? 1 : 0 }}
              />
              <button
                type="button"
                onClick={() => scrollToSection(section.id)}
                aria-current={active ? "true" : undefined}
                className="flex min-h-[44px] w-full items-center gap-2.5 py-2 text-left text-[13px] leading-snug transition-colors"
                style={{
                  ...fontMonoStyle,
                  color: active ? BP_COLORS.text : BP_COLORS.muted,
                }}
              >
                {section.number !== undefined ? (
                  <>
                    <span className="tabular-nums" style={{ color: threadColor }}>
                      {String(section.number).padStart(2, "0")}
                    </span>
                    {/* Whitespace-only text collapses out of flex layout —
                        see the matching comment in SpecSection.tsx. */}
                    {" "}
                  </>
                ) : null}
                <span>{section.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Short, readable labels for the compact chip bar — distinct from the
 *  fuller labels used in the desktop index / section headings (e.g. "What
 *  made it hard" -> "The hard part"). Keyed by section id; "problem"'s
 *  label depends on whether the full label was already personalised for a
 *  personal project ("Why I built it" is short enough as-is). */
const COMPACT_LABELS: Record<string, string> = {
  approach: "What I did",
  constraints: "The hard part",
  outcome: "Results",
  change: "What I'd change",
};

function compactLabel(section: ContentsEntry): string {
  if (section.id === "problem") {
    return section.label === "Why I built it" ? "Why I built it" : "Why";
  }
  return COMPACT_LABELS[section.id] ?? section.label;
}

/**
 * Horizontal sticky chip bar — shown below `xl` (1280px) in place of the
 * vertical sidebar index. Sits flush under the fixed site header, scrolls
 * horizontally past its own edges (fade masks hint at overflow), and never
 * shows a number without a label (chips are label-only by design). The
 * "Attachments" entry (unnumbered) is intentionally left out here — it
 * still gets a row in the desktop index.
 */
export function CompactContentsIndex({ sections, activeSection, threadColor }: ContentsIndexProps) {
  const scrollToSection = useScrollToSection();
  const chips = sections.filter((s) => s.id !== "attachments");
  if (!chips.length) return null;

  return (
    <div
      className="sticky z-30 -mx-6 border-b sm:-mx-10 xl:hidden"
      style={{
        top: HEADER_OFFSET,
        borderColor: "rgba(255,255,255,0.1)",
        background: "rgba(7,16,30,0.92)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Scoped scrollbar hiding for the chip row — kept local to this
          component (no globals.css edits) via a plain inline <style>, same
          technique NoScriptReveal.tsx uses for its own scoped rule. */}
      <style>{`.bp-chip-row::-webkit-scrollbar{display:none}`}</style>
      <div className="relative">
        <nav
          className="bp-chip-row flex gap-2 overflow-x-auto px-6 py-3 sm:px-10"
          style={{ scrollbarWidth: "none" }}
          aria-label="Section contents"
        >
          {chips.map((section) => {
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                aria-current={active ? "true" : undefined}
                className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors"
                style={{
                  borderColor: active ? threadColor : "rgba(255,255,255,0.16)",
                  background: active ? threadColor : "rgba(255,255,255,0.03)",
                  // Dark (not black) text on the thread-colour fill: verified
                  // >=4.5:1 contrast against every SKILL_THREADS colour.
                  color: active ? BP_COLORS.bgBottom : BP_COLORS.textDim,
                }}
              >
                {compactLabel(section)}
              </button>
            );
          })}
        </nav>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-8"
          style={{ background: "linear-gradient(to right, rgba(7,16,30,0.92), transparent)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8"
          style={{ background: "linear-gradient(to left, rgba(7,16,30,0.92), transparent)" }}
        />
      </div>
    </div>
  );
}
