/**
 * Single source of truth for listing thumbnails: prefer case study `media.hero.posterSrc`,
 * then canonical `/assets/{slug}/hero-image.*` (written by admin hero upload).
 */

export type ListingImageSources = {
  src: string;
  fallbackSrc: string;
  secondaryFallback: string;
};

export function getProjectListingImageSources(
  slug: string,
  posterSrc?: string | null,
): ListingImageSources {
  const baseWebp = `/assets/${slug}/hero-image.webp`;
  const basePng = `/assets/${slug}/hero-image.png`;
  const baseJpg = `/assets/${slug}/hero-image.jpg`;
  const p = posterSrc?.trim();
  if (p && p.startsWith("/")) {
    return {
      src: p,
      fallbackSrc: baseWebp,
      secondaryFallback: basePng,
    };
  }
  return {
    src: baseWebp,
    fallbackSrc: basePng,
    secondaryFallback: baseJpg,
  };
}
