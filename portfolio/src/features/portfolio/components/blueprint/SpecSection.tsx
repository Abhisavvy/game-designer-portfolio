"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import { BP_COLORS, fontMonoStyle, fontSansStyle } from "./tokens";

type SpecSectionProps = {
  id: string;
  number?: number;
  title: string;
  threadColor: string;
  children: ReactNode;
  /** Extra content rendered after the body (e.g. margin-note pull-quotes). */
  after?: ReactNode;
  /** Renders the body + `after` in a two-column grid at >=1280px, with a
   *  margin-note rail as the second column (see MarginNote usage). */
  rail?: ReactNode;
};

export function SpecSectionHeading({
  id,
  number,
  title,
  threadColor,
}: {
  id: string;
  number?: number;
  title: string;
  threadColor: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group flex items-center gap-4">
      {/* The copy-link button is a SIBLING of the <h2>, not a child of it —
          nesting it inside the heading would fold the button's own
          accessible name ("Copy link to X section") into the heading's
          computed accessible name, making every section heading's a11y
          name read as a doubled-up mess for screen-reader users navigating
          by headings. Visually it's still immediately beside the text
          (this wrapping div reproduces the flex row the button used to
          share with the heading's own children). */}
      <div className="flex items-center gap-2">
        <h2
          className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.22em] sm:text-sm"
          style={{ ...fontMonoStyle, color: BP_COLORS.text }}
        >
          {/* Same eyebrow system as the homepage SectionHeading (mono
              two-digit index + short hairline + label) instead of the old
              section-sign prefix — see ui/SectionHeading.tsx. */}
          {number !== undefined ? (
            <>
              <span className="tabular-nums" style={{ color: threadColor }}>
                {String(number).padStart(2, "0")}
              </span>
              <span aria-hidden className="h-px w-5 shrink-0" style={{ background: threadColor }} />
              {/* Whitespace-only text is collapsed out of flex layout (so
                  this adds no visible gap beyond the flex `gap-2` above) but
                  keeps the heading's text/accessible name properly spaced
                  ("01 Why it mattered", not "01Why it mattered"). */}
              {" "}
            </>
          ) : null}
          <span>{title}</span>
        </h2>
        <button
          type="button"
          onClick={() => {
            window.history.replaceState(null, "", `#${id}`);
            void navigator.clipboard?.writeText(window.location.href).catch(() => {});
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          // Padding + negative margin gives a >=44px tap target without
          // disturbing the heading's visual spacing. Always at least dimly
          // visible (not hover-only) so it's discoverable on touch devices.
          className="-m-4 rounded p-4 opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          style={{ color: BP_COLORS.text }}
          aria-label={`Copy link to ${title} section`}
        >
          <Hash className="h-3.5 w-3.5" />
        </button>
        {copied ? <span className="text-[10px] normal-case tracking-normal" style={{ color: BP_COLORS.muted }}>copied</span> : null}
      </div>
      <span aria-hidden className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.25), transparent)" }} />
    </div>
  );
}

type BodyRun = { kind: "bullets" | "text"; lines: string[] };

/** Groups already-trimmed, non-empty lines into consecutive runs of
 *  "- "/"• " bullet lines vs. plain text lines, preserving order — so a
 *  block that mixes a lead-in sentence with a list (no blank line between
 *  them) still renders the list as a real `<ul>` rather than literal
 *  "- " text. */
function groupIntoRuns(lines: string[]): BodyRun[] {
  const runs: BodyRun[] = [];
  for (const line of lines) {
    const kind: BodyRun["kind"] = /^[-•]\s+/.test(line) ? "bullets" : "text";
    const last = runs[runs.length - 1];
    if (last && last.kind === kind) {
      last.lines.push(line);
    } else {
      runs.push({ kind, lines: [line] });
    }
  }
  return runs;
}

/** Renders body copy preserving \n\n paragraph breaks.
 *  - A block whose every line matches "1. " / "1) " renders as a numbered
 *    list.
 *  - Any block containing "- " / "• " lines renders those lines as a
 *    bulleted list (thread-colour dot markers), with any non-bullet lines
 *    in the same block rendered as ordinary paragraph text around it.
 *  - Everything else renders as a plain paragraph. */
export function SpecBody({ text, threadColor }: { text: string; threadColor: string }) {
  const blocks = text.trim().split(/\n\n+/);

  return (
    <div className="mt-5 max-w-[68ch] space-y-4 text-[18px] leading-[1.7]" style={{ ...fontSansStyle, color: BP_COLORS.textDim }}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const isNumbered = lines.length > 1 && lines.every((l) => /^\d+[.)]\s+/.test(l));

        if (isNumbered) {
          return (
            <ol key={i} className="space-y-2.5">
              {lines.map((line, j) => {
                const m = line.match(/^(\d+)[.)]\s+(.*)$/);
                return (
                  <li key={j} className="flex gap-3">
                    <span
                      className="mt-0.5 shrink-0 text-sm tabular-nums"
                      style={{ ...fontMonoStyle, color: threadColor }}
                    >
                      {(m?.[1] ?? String(j + 1)).padStart(2, "0")}
                    </span>
                    <span>{m?.[2] ?? line}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        const hasBullets = lines.some((l) => /^[-•]\s+/.test(l));
        if (hasBullets) {
          const runs = groupIntoRuns(lines);
          return (
            <div key={i} className="space-y-3">
              {runs.map((run, k) =>
                run.kind === "bullets" ? (
                  <ul key={`${i}-${k}`} className="space-y-2">
                    {run.lines.map((line, j) => (
                      <li key={j} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: threadColor }}
                        />
                        <span>{line.replace(/^[-•]\s+/, "")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={`${i}-${k}`} className="whitespace-pre-line">
                    {run.lines.join("\n")}
                  </p>
                ),
              )}
            </div>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        );
      })}
    </div>
  );
}

/** A secondary labeled prose block rendered within a section — e.g.
 *  "My contributions" folded into the "What I did" section as a second
 *  block rather than its own numbered section. Shares `SpecBody`'s
 *  paragraph/list rendering. */
export function SpecSubBlock({
  label,
  text,
  threadColor,
}: {
  label: string;
  text: string;
  threadColor: string;
}) {
  return (
    <div className="mt-8">
      <p
        className="text-xs font-semibold uppercase tracking-[0.22em]"
        style={{ ...fontMonoStyle, color: BP_COLORS.muted }}
      >
        {label}
      </p>
      <SpecBody text={text} threadColor={threadColor} />
    </div>
  );
}

export function SpecSection({ id, number, title, threadColor, children, after, rail }: SpecSectionProps) {
  // `initial`/`whileInView` are the same on server and client — see
  // NoScriptReveal.tsx for how reduced-motion visitors still end up fully
  // visible without branching this prop on a hook that differs at SSR.
  return (
    <motion.section
      id={id}
      // Below xl (1280px) the sticky site header PLUS the compact chip bar
      // (see ContentsIndex.tsx's CompactContentsIndex) sit on top of the
      // content — together they measure ~157px tall (see
      // scratchpad/codereview/18-chips.js), more than globals.css's plain
      // `section[id]{scroll-margin-top:88px}` (header only) accounts for.
      // At xl+ that compact bar is hidden (a sidebar index is used
      // instead), so the original header-only offset is enough again.
      className="bp-reveal scroll-mt-[160px] xl:scroll-mt-28"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div>
        <SpecSectionHeading id={id} number={number} title={title} threadColor={threadColor} />
        {rail ? (
          <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_240px] xl:items-start xl:gap-10">
            <div className="min-w-0">
              {children}
              {after}
            </div>
            <aside className="hidden xl:block" aria-label="Design notes">
              {rail}
            </aside>
          </div>
        ) : (
          <>
            {children}
            {after}
          </>
        )}
      </div>
    </motion.section>
  );
}
