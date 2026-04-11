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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const study = defaultPortfolioContent.caseStudies[slug];
  if (!study) return { title: "Not found" };
  return {
    title: `${study.title} — Case study`,
    description: study.subtitle,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  if (!caseStudySlugs.includes(slug)) notFound();

  return <CaseStudyClient slug={slug} />;
}
