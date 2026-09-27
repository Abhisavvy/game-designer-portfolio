import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyClient } from "@/features/portfolio/components/CaseStudyClient";
import {
  caseStudySlugs,
  defaultPortfolioContent,
} from "@/features/portfolio/data/site-content";

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

/**
 * The card blurb for this slug from `projects`/`personalProjects` (owner-
 * approved copy, shorter and more concrete than a case study's `subtitle`
 * tag line) — used as the preview description when available.
 */
function findProjectBlurb(slug: string): string | undefined {
  const { projects, personalProjects } = defaultPortfolioContent;
  return [...projects, ...personalProjects].find((p) => p.slug === slug)?.blurb;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = defaultPortfolioContent.caseStudies[slug];
  if (!study) return { title: "Not found" };

  // Next merges metadata shallowly per top-level key: since this page sets
  // its own `openGraph`/`twitter`, those objects REPLACE the root layout's
  // (rather than merging into them), so each must carry everything a link
  // preview needs — title, description, url and image — not just an
  // override of the one or two fields that differ from the root's.
  const title = `${study.title} · Case study · Abhishek Dutta`;
  const description = findProjectBlurb(slug) ?? study.subtitle;
  const url = `/work/${slug}`;
  const imageUrl = `/og/work-${slug}.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: defaultPortfolioContent.siteMeta.siteName,
      locale: "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${study.title} case study`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  if (!caseStudySlugs.includes(slug)) notFound();

  return <CaseStudyClient slug={slug} />;
}
