// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  buildAssetPublicUrl,
  resolveUploadedFilename,
  sanitizeUploadBaseName,
} from "./upload-helpers";

describe("sanitizeUploadBaseName", () => {
  it("lowercases and strips unsafe characters", () => {
    expect(sanitizeUploadBaseName("My Shot!! FINAL.png")).toBe("my-shot-final");
  });
});

describe("resolveUploadedFilename", () => {
  it("uses stable hero-image name for hero + project slug (prevents card/page drift)", () => {
    const { filename } = resolveUploadedFilename({
      category: "hero",
      projectSlug: "demo-game",
      originalFileName: "Screen Shot 2024.png",
      now: 1,
    });
    expect(filename).toBe("hero-image.png");
  });

  it("overwrites same logical asset name on re-upload (no timestamped hero clutter)", () => {
    const a = resolveUploadedFilename({
      category: "hero",
      projectSlug: "x",
      originalFileName: "a.jpg",
      now: 1,
    });
    const b = resolveUploadedFilename({
      category: "hero",
      projectSlug: "x",
      originalFileName: "b.jpeg",
      now: 2,
    });
    expect(a.filename).toBe("hero-image.jpg");
    expect(b.filename).toBe("hero-image.jpeg");
  });

  it("maps unknown extensions to safe hero ext while keeping distinct filenames for gallery", () => {
    const hero = resolveUploadedFilename({
      category: "hero",
      projectSlug: "p",
      originalFileName: "x.bmp",
      now: 99,
    });
    expect(hero.filename).toBe("hero-image.png");
    const gallery = resolveUploadedFilename({
      category: "gallery",
      projectSlug: "p",
      originalFileName: "x.bmp",
      now: 99,
    });
    expect(gallery.filename).toBe(`x-99.bmp`);
  });

  it("timestamped filenames for non-hero avoid naming collisions", () => {
    const one = resolveUploadedFilename({
      category: "gallery",
      projectSlug: "p",
      originalFileName: "shot.png",
      now: 111,
    });
    const two = resolveUploadedFilename({
      category: "gallery",
      projectSlug: "p",
      originalFileName: "shot.png",
      now: 222,
    });
    expect(one.filename).not.toBe(two.filename);
  });
});

describe("buildAssetPublicUrl", () => {
  it("prefixes project assets under /assets/{slug}/", () => {
    expect(buildAssetPublicUrl("foo", "hero-image.webp")).toBe(
      "/assets/foo/hero-image.webp",
    );
  });

  it("sends non-project uploads to /assets/general/", () => {
    expect(buildAssetPublicUrl(undefined, "avatar-1.png")).toBe(
      "/assets/general/avatar-1.png",
    );
  });
});
