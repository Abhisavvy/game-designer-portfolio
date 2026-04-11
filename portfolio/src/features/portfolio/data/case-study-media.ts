/**
 * Optional rich media for case study pages (hero video, galleries, demos).
 * Paths are under Next.js `public/` (served from site root).
 */

export type CaseStudyGalleryItem = {
  thumb: string;
  full: string;
  alt: string;
  label: string;
};

export type CaseStudyMedia = {
  hero?: {
    /** H.264 MP4 under `/public`, e.g. `/assets/food-fiesta/feature-demo.mp4` */
    videoSrc?: string;
    posterSrc: string;
  };
  processGallery?: {
    groupId: string;
    heading: string;
    items: CaseStudyGalleryItem[];
  };
  showcases?: {
    id: string;
    posterSrc: string;
    videoSrc?: string;
    playLabel: string;
    ariaLabel: string;
  }[];
};

export function mergeCaseStudyMedia(
  base: CaseStudyMedia | undefined,
  patch: CaseStudyMedia | undefined,
): CaseStudyMedia | undefined {
  if (!base && !patch) return undefined;
  if (!patch) return base;
  if (!base) return patch;
  return {
    hero:
      patch.hero !== undefined
        ? { ...base.hero, ...patch.hero }
        : base.hero,
    processGallery: patch.processGallery ?? base.processGallery,
    showcases: patch.showcases ?? base.showcases,
  };
}
