import type { ProjectItem } from "@/features/portfolio/data/site-content";

/** Same shape as portfolio `ProjectItem` defaults in `site-content.ts` (single source of truth). */
export type AdminProject = ProjectItem;

export interface AdminCaseStudy {
  title: string;
  subtitle: string;
  problem: string;
  approach: string;
  constraints: string;
  outcome: string;
  /** Optional “My contributions” block (Webflow-style). */
  contributions?: string;
  links: Array<{ label: string; href: string }>;
  media: {
    hero: { posterSrc: string };
    processGallery?: {
      groupId: string;
      heading: string;
      items: Array<{
        thumb: string;
        full: string;
        alt: string;
        label: string;
      }>;
    };
  };
}

export interface AdminPersonalInfo {
  name: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  aboutTitle: string;
  aboutBody: string;
  aboutImage: string;
}

export type CVBulletFormat = "tight" | "standard" | "narrative";

export type CVBulletConfidence = "high" | "medium" | "low";

export interface CVBullet {
  id: string;
  format: CVBulletFormat;
  content: string;
  /** Where the bullet was derived from (case study section, blurb, etc.). */
  source: string;
  confidence: CVBulletConfidence;
  approved?: boolean;
}

export type ConsistencyIssueSeverity = "high" | "medium" | "low";

export interface ConsistencyIssue {
  type: string;
  severity: ConsistencyIssueSeverity;
  projectSlug: string;
  field: string;
  message: string;
  suggestion?: string;
  cvValue?: string;
  portfolioValue?: string;
}

export interface ImageMetadata {
  altText: string;
  caption?: string;
  category: "hero" | "gallery" | "process" | "profile";
  usageContext: string;
}
