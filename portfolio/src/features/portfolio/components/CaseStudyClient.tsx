"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, Hash } from "lucide-react";
import { defaultPortfolioContent } from "../data/site-content";
import { CaseStudyHero } from "./media/CaseStudyHero";
import { ProcessGallery } from "./media/ProcessGallery";
import { VideoShowcase } from "./media/VideoShowcase";

function Block({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id: string;
}) {
  const handleLinkClick = () => {
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="group flex items-center text-lg font-semibold text-zinc-200">
        <span>{title}</span>
        <button
          onClick={handleLinkClick}
          className="ml-2 opacity-0 transition-opacity group-hover:opacity-50 hover:!opacity-100"
          aria-label={`Link to ${title} section`}
        >
          <Hash className="w-4 h-4" />
        </button>
      </h2>
      <div className="mt-2 whitespace-pre-wrap leading-relaxed text-zinc-400">
        {children}
      </div>
    </section>
  );
}

interface TableOfContentsProps {
  sections: { id: string; title: string }[];
  activeSection: string;
}

function TableOfContents({ sections, activeSection }: TableOfContentsProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  };

  return (
    <nav className="sticky top-20 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-4 mb-8">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Contents</h3>
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center text-sm w-full text-left p-2 rounded transition-colors ${
                activeSection === section.id
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <ChevronRight className="w-3 h-3 mr-2 flex-shrink-0" />
              <span className="truncate">{section.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CaseStudyClient({ slug }: { slug: string }) {
  const study = defaultPortfolioContent.caseStudies[slug];
  const refUrl = defaultPortfolioContent.siteMeta.referencePortfolioUrl;
  const [activeSection, setActiveSection] = useState('');

  // Define sections for table of contents
  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'problem', title: 'Problem Statement' },
    { id: 'solution', title: 'Solution' },
    { id: 'constraints', title: 'Context & Constraints' },
    { id: 'results', title: 'Results' },
    ...(study?.contributions?.trim() ? [{ id: 'contributions', title: 'My Contributions' }] : []),
    ...(study?.links?.length > 0 ? [{ id: 'links', title: 'Links' }] : []),
  ];

  // Intersection observer for active section tracking
  useEffect(() => {
    const observerOptions = {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all section elements
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Check URL hash on load
    if (window.location.hash) {
      const sectionId = window.location.hash.slice(1);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(sectionId);
        }
      }, 100);
    }

    return () => observer.disconnect();
  }, [sections]);

  if (!study) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-zinc-400">No case study for &quot;{slug}&quot;.</p>
        <Link href="/" className="mt-4 inline-block text-purple-400/90">
          ← Back to home
        </Link>
      </div>
    );
  }

  const media = study.media;

  return (
    <article className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          <Link
            href="/#work"
            className="text-sm text-amber-400/90 transition hover:text-amber-300"
          >
            ← Back to work
          </Link>

          {media?.hero ? <CaseStudyHero hero={media.hero} /> : null}

          <div id="overview" className="scroll-mt-20">
            <p className="mt-8 text-sm font-medium uppercase tracking-widest text-amber-500/80">
              {study.subtitle}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-100">
              {study.title}
            </h1>
          </div>

          <div className="mt-12 space-y-10">
            <Block title="Problem statement" id="problem">{study.problem}</Block>
            <Block title="Solution" id="solution">{study.approach}</Block>
            {media?.processGallery ? (
              <ProcessGallery
                groupId={media.processGallery.groupId}
                heading={media.processGallery.heading}
                items={media.processGallery.items}
              />
            ) : null}
            <Block title="Context & constraints" id="constraints">{study.constraints}</Block>
            <Block title="Results" id="results">{study.outcome}</Block>
            {study.contributions?.trim() ? (
              <Block title="My contributions" id="contributions">{study.contributions}</Block>
            ) : null}
            {study.links.length > 0 ? (
              <section id="links" className="scroll-mt-20">
                <h2 className="group flex items-center text-lg font-semibold text-zinc-200">
                  <span>Links</span>
                  <button
                    onClick={() => window.history.replaceState(null, '', '#links')}
                    className="ml-2 opacity-0 transition-opacity group-hover:opacity-50 hover:!opacity-100"
                    aria-label="Link to Links section"
                  >
                    <Hash className="w-4 h-4" />
                  </button>
                </h2>
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

          <footer className="mt-16 pt-8 border-t border-zinc-700/50">
            <Link
              href="/#work"
              className="text-sm text-amber-400/90 transition hover:text-amber-300"
            >
              ← Back to work
            </Link>
          </footer>
        </div>

        {/* Table of Contents */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <TableOfContents sections={sections} activeSection={activeSection} />
        </div>
      </div>
    </article>
  );
}