import path from "path";
import { describe, expect, it } from "vitest";
import { isSafeFilename, isSafeSlug, resolveInside } from "./safe-paths";

describe("safe-paths", () => {
  it("accepts normal slugs and rejects traversal", () => {
    expect(isSafeSlug("bon-voyage")).toBe(true);
    expect(isSafeSlug("../../src")).toBe(false);
    expect(isSafeSlug("a/b")).toBe(false);
    expect(isSafeSlug("")).toBe(false);
  });

  it("accepts bare filenames only", () => {
    expect(isSafeFilename("hero-image.webp")).toBe(true);
    expect(isSafeFilename("../x.png")).toBe(false);
    expect(isSafeFilename("a\\b.png")).toBe(false);
    expect(isSafeFilename(".env")).toBe(false);
  });

  it("keeps resolved paths inside the base dir, including sibling-prefix dirs", () => {
    const base = path.resolve("/tmp/public/assets");
    expect(resolveInside(base, "tiles", "a.png")).toBe(path.join(base, "tiles", "a.png"));
    expect(resolveInside(base, "..", "..", "src")).toBeNull();
    expect(resolveInside(base, "../assets-x/a.png")).toBeNull();
  });
});
