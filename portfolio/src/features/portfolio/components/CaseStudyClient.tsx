"use client";

import Link from "next/link";
import { defaultPortfolioContent } from "../data/site-content";
import { CaseStudyHero } from "./media/CaseStudyHero";
import { ProcessGallery } from "./media/ProcessGallery";
import { VideoShowcase } from "./media/VideoShowcase";

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-200">{title}</h2>
      <div className="mt-2 whitespace-pre-wrap leading-relaxed text-zinc-400">
        {children}
      </div>
    </section>
  );
}

export function CaseStudyClient({ slug }: { slug: string }) {
  const study = defaultPortfolioContent.caseStudies[slug];
  const refUrl = defaultPortfolioContent.siteMeta.referencePortfolioUrl;


  if (!study) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-zinc-400">No case study for “{slug}”.</p>
        <Link href="/" className="mt-4 inline-block text-purple-400/90">
          ← Back to home
        </Link>
      </div>
    );
  }

  const media = study.media;

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <Link
        href="/#work"
        className="text-sm text-amber-400/90 transition hover:text-amber-300"
      >
        ← Back to work
      </Link>

      {media?.hero ? <CaseStudyHero hero={media.hero} /> : null}

      <p className="mt-8 text-sm font-medium uppercase tracking-widest text-amber-500/80">
        {study.subtitle}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-100">
        {study.title}
      </h1>

      <div className="mt-12 space-y-10">
        <Block title="Problem statement">{study.problem}</Block>
        <Block title="Solution">{study.approach}</Block>
        {media?.processGallery ? (
          <ProcessGallery
            groupId={media.processGallery.groupId}
            heading={media.processGallery.heading}
            items={media.processGallery.items}
          />
        ) : null}
        <Block title="Context & constraints">{study.constraints}</Block>
        <Block title="Results">{study.outcome}</Block>
        {study.contributions?.trim() ? (
          <Block title="My contributions">{study.contributions}</Block>
        ) : null}
        {study.links.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-zinc-200">Links</h2>
            <ul className="mt-2 list-inside list-disc text-amber-400/90">
              {study.links.map((l) => (
                <li key={l.href + l.label}>
                  <a href={l.href} className="hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {media?.showcases?.length ? (
        <div className="mt-12 space-y-8">
          {media.showcases.map((s) => (
            <VideoShowcase key={s.id} item={s} />
          ))}
        </div>
      ) : null}

      {refUrl ? (
        <p className="mt-16 border-t border-zinc-800 pt-8 text-xs text-zinc-600">
          Original narrative reference:{" "}
          <a
            href={refUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline"
          >
            Webflow portfolio
          </a>
        </p>
      ) : null}
    </article>
  );
}
