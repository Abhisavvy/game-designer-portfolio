export interface AdminProject {
  slug: string;
  title: string;
  tag: string;
  blurb: string;
  href: string;
  externalUrl: string;
}

export interface AdminCaseStudy {
  title: string;
  subtitle: string;
  problem: string;
  approach: string;
  constraints: string;
  outcome: string;
  contributions: string;
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
  bio: string;
}

export interface CVBullet {
  format: "tight" | "standard" | "narrative";
  content: string;
  approved: boolean;
}

export interface ConsistencyIssue {
  field: string;
  cvValue: string;
  portfolioValue: string;
  severity: "warning" | "error";
  suggestion: string;
}

export interface ImageMetadata {
  altText: string;
  caption?: string;
  category: "hero" | "gallery" | "process" | "profile";
  usageContext: string;
}
