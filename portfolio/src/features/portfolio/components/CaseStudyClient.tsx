"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultPortfolioContent, type CaseStudy } from "../data/site-content";
import { CaseStudyHero } from "./media/CaseStudyHero";
import { ProcessGallery } from "./media/ProcessGallery";
import { VideoShowcase } from "./media/VideoShowcase";
import { BlueprintBackground } from "./blueprint/BlueprintBackground";
import { NoScriptReveal } from "./blueprint/NoScriptReveal";
import { BlueprintHeader } from "./blueprint/BlueprintHeader";
import { MetricsStrip } from "./blueprint/MetricsStrip";
import { LoopDiagram } from "./blueprint/LoopDiagram";
import { SpecSection, SpecBody, SpecSubBlock } from "./blueprint/SpecSection";
import { ContentsIndex, CompactContentsIndex, type ContentsEntry } from "./blueprint/ContentsIndex";
import { MarginNoteAside, MarginNoteQuote, isLongNote } from "./blueprint/MarginNote";
import { AttachmentsList } from "./blueprint/AttachmentsList";
import { NextCaseFile } from "./blueprint/NextCaseFile";
import { getCaseFileMeta } from "./blueprint/case-file";
import { BP_COLORS, fontMonoStyle } from "./blueprint/tokens";

/**
 * Fields the upcoming content rewrite may add to `CaseStudy` — read
 * defensively (the `site-content.ts` type doesn't declare them yet, and is
 * being edited concurrently by another workstream). When present these
 * override the corresponding legacy field's body text; when absent (today,
 * always) the legacy field is used as-is. `change` has no legacy
 * equivalent — it's an entirely new, optional trailing section.
 */
type FutureCaseStudyFields = Partial<Record<"why" | "whatIDid" | "hard" | "happened" | "change", string>>;

type SpecSectionData = {
  id: string;
  number: number;
  label: string;
  body: string;
  extra?: ReactNode;
  after?: ReactNode;
  rail?: ReactNode;
};

export function CaseStudyClient({ slug }: { slug: string }) {
  const study = defaultPortfolioContent.caseStudies[slug] as (CaseStudy & FutureCaseStudyFields) | undefined;
  const meta = getCaseFileMeta(slug);
  const [activeSection, setActiveSection] = useState("");

  // Section identity (id/label/number) — the single source of truth for
  // both the sticky Contents nav and the spec sections rendered below, so
  // labels are never hard-coded in two places. Numbering comes from this
  // list's order, not from literals scattered through JSX.
  const sections = useMemo<ContentsEntry[]>(() => {
    if (!study) return [];
    const whyLabel = meta?.isPersonalProject ? "Why I built it" : "Why it mattered";
    const list: ContentsEntry[] = [
      { id: "problem", number: 1, label: whyLabel },
      { id: "approach", number: 2, label: "What I did" },
      { id: "constraints", number: 3, label: "What made it hard" },
      { id: "outcome", number: 4, label: "What happened" },
    ];
    if (study.change?.trim()) {
      list.push({ id: "change", number: 5, label: "What I'd change" });
    }
    if (study.links.length > 0) {
      list.push({ id: "attachments", label: "Attachments" });
    }
    return list;
  }, [study, meta]);

  useEffect(() => {
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const timer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveSection(id);
        }
      }, 100);
      return () => {
        window.clearTimeout(timer);
        observer.disconnect();
      };
    }

    return () => observer.disconnect();
  }, [sections]);

  if (!study || !meta) {
    return (
      <div className="relative isolate min-h-screen">
        <BlueprintBackground />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-24">
          <p style={{ ...fontMonoStyle, color: BP_COLORS.muted }}>
            No case study for &quot;{slug}&quot;.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm" style={{ color: BP_COLORS.accent }}>
            &larr; Back to home
          </Link>
        </div>
      </div>
    );
  }

  const { threadColor, caseFileNumber, backHref, backLabel, nextProject } = meta;
  const media = study.media;
  const notes = study.notes ?? [];
  const shortNotes = notes.filter((n) => !isLongNote(n));
  const longNotes = notes.filter((n) => isLongNote(n));
  const hasRail = shortNotes.length > 0;

  const approachNotesAfter = notes.length ? (
    <>
      {longNotes.map((n, i) => (
        <MarginNoteQuote key={`long-${i}`} note={n} threadColor={threadColor} />
      ))}
      {shortNotes.map((n, i) => (
        <MarginNoteQuote key={`short-${i}`} note={n} threadColor={threadColor} hideOnRail />
      ))}
    </>
  ) : null;

  const approachRail = hasRail ? (
    <>
      {shortNotes.map((n, i) => (
        <MarginNoteAside key={i} note={n} />
      ))}
    </>
  ) : undefined;

  // Body text (+ any section-specific extras) keyed by section id. Kept
  // separate from `sections` above because these need `threadColor`/notes
  // that are only available once `study`/`meta` are known non-null.
  const bodyById: Record<string, string> = {
    problem: study.why ?? study.problem,
    approach: study.whatIDid ?? study.approach,
    constraints: study.hard ?? study.constraints,
    outcome: study.happened ?? study.outcome,
    change: study.change ?? "",
  };
  const afterById: Partial<Record<string, ReactNode>> = { approach: approachNotesAfter };
  const railById: Partial<Record<string, ReactNode>> = { approach: approachRail };
  // Contributions is no longer its own numbered section — it's folded in
  // as a second block under "What I did" (and renders nothing once the
  // content rewrite removes the field, same as any other case study that
  // never had one).
  const extraById: Partial<Record<string, ReactNode>> = {
    approach: study.contributions?.trim() ? (
      <SpecSubBlock label="My contributions" text={study.contributions} threadColor={threadColor} />
    ) : undefined,
  };

  const specSections: SpecSectionData[] = sections
    .filter((s): s is ContentsEntry & { number: number } => s.id !== "attachments")
    .map((s) => ({
      id: s.id,
      number: s.number,
      label: s.label,
      body: bodyById[s.id] ?? "",
      after: afterById[s.id],
      rail: railById[s.id],
      extra: extraById[s.id],
    }));

  return (
    <div className="relative isolate min-h-screen">
      <BlueprintBackground />
      <NoScriptReveal />

      <article className="relative z-10 mx-auto max-w-[1440px] px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-12">
          <div className="min-w-0">
            <CompactContentsIndex sections={sections} activeSection={activeSection} threadColor={threadColor} />

            <BlueprintHeader
              backHref={backHref}
              backLabel={backLabel}
              caseFileNumber={caseFileNumber}
              subtitle={study.subtitle}
              title={study.title}
              skills={meta.project.skills}
              threadColor={threadColor}
              slug={slug}
            />

            {media?.hero ? (
              <div className="mt-12">
                <CaseStudyHero hero={media.hero} title={study.title} slug={slug} />
              </div>
            ) : null}

            {meta.project.stats?.length ? (
              <div className="mt-4">
                <MetricsStrip stats={meta.project.stats} threadColor={threadColor} />
              </div>
            ) : null}

            {study.loop ? (
              <div className="mt-16">
                <LoopDiagram loop={study.loop} threadColor={threadColor} />
              </div>
            ) : null}

            <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
              {specSections.map((section) => (
                <Fragment key={section.id}>
                  <SpecSection
                    id={section.id}
                    number={section.number}
                    title={section.label}
                    threadColor={threadColor}
                    after={section.after}
                    rail={section.rail}
                  >
                    <SpecBody text={section.body} threadColor={threadColor} />
                    {section.extra}
                  </SpecSection>

                  {section.id === "approach" && media?.processGallery ? (
                    <ProcessGallery
                      groupId={media.processGallery.groupId}
                      heading={media.processGallery.heading}
                      items={media.processGallery.items}
                      threadColor={threadColor}
                    />
                  ) : null}
                </Fragment>
              ))}

              <AttachmentsList links={study.links} threadColor={threadColor} />
            </div>

            {media?.showcases?.length ? (
              <div className="mt-16 space-y-10">
                {media.showcases.map((s) => (
                  <VideoShowcase key={s.id} item={s} threadColor={threadColor} />
                ))}
              </div>
            ) : null}

            <footer className="mt-20 border-t pt-10" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <NextCaseFile project={nextProject} threadColor={threadColor} />
              <Link
                href={backHref}
                className="mt-10 inline-flex min-h-[44px] items-center text-xs uppercase tracking-[0.2em] transition-colors"
                style={{ ...fontMonoStyle, color: BP_COLORS.muted }}
              >
                &larr; {backLabel}
              </Link>
            </footer>
          </div>

          <div>
            <ContentsIndex sections={sections} activeSection={activeSection} threadColor={threadColor} />
          </div>
        </div>
      </article>
    </div>
  );
}
