import { describe, it, expect } from "vitest";
import { getProjectListingImageSources } from "./project-media";

describe("getProjectListingImageSources", () => {
  it("uses absolute posterSrc as primary with hero-image webp/png fallbacks", () => {
    const slug = "my-project";
    const poster = "/assets/my-project/custom-hero.webp";
    const out = getProjectListingImageSources(slug, poster);
    expect(out.src).toBe(poster);
    expect(out.fallbackSrc).toBe("/assets/my-project/hero-image.webp");
    expect(out.secondaryFallback).toBe("/assets/my-project/hero-image.png");
  });

  it("ignores non-root-relative poster paths and uses canonical hero-image chain", () => {
    const slug = "tiles";
    const out = getProjectListingImageSources(slug, "https://cdn.example.com/x.png");
    expect(out.src).toBe("/assets/tiles/hero-image.webp");
    expect(out.fallbackSrc).toBe("/assets/tiles/hero-image.png");
    expect(out.secondaryFallback).toBe("/assets/tiles/hero-image.jpg");
  });

  it("treats whitespace-only poster as absent", () => {
    const slug = "a-b";
    const out = getProjectListingImageSources(slug, "   ");
    expect(out.src).toBe("/assets/a-b/hero-image.webp");
  });

  it("when poster is absent, primary matches admin hero upload convention (webp)", () => {
    const slug = "economy-pass";
    const out = getProjectListingImageSources(slug, undefined);
    expect(out.src).toBe(`/assets/${slug}/hero-image.webp`);
    expect(out.fallbackSrc).toBe(`/assets/${slug}/hero-image.png`);
    expect(out.secondaryFallback).toBe(`/assets/${slug}/hero-image.jpg`);
  });

  it("regression: case study poster path from updateProjectImage aligns with listing primary", () => {
    const slug = "word-roll";
    const heroFromUpload = `/assets/${slug}/hero-image.png`;
    const listing = getProjectListingImageSources(slug, heroFromUpload);
    expect(listing.src).toBe(heroFromUpload);
    expect(listing.fallbackSrc).toContain(`${slug}/hero-image.webp`);
  });
});
