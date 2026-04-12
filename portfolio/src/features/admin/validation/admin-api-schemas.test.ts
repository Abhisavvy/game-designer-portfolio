// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  adminAssetUploadMetadataSchema,
  adminCaseStudyScalarSchema,
  adminCreateProjectBodySchema,
  adminProjectItemSchema,
} from "./admin-api-schemas";

describe("adminProjectItemSchema", () => {
  it("accepts valid slugs and href", () => {
    const r = adminProjectItemSchema.safeParse({
      slug: "my-game",
      title: "My Game",
      tag: "Design",
      blurb: "Short",
      href: "/work/my-game",
      externalUrl: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid slug casing and spaces (prevents broken routes)", () => {
    expect(
      adminProjectItemSchema.safeParse({
        slug: "Bad_Slug",
        title: "t",
        tag: "t",
        blurb: "b",
        href: "/work/bad",
      }).success,
    ).toBe(false);
  });

  it("rejects malformed externalUrl when provided", () => {
    expect(
      adminProjectItemSchema.safeParse({
        slug: "ok",
        title: "t",
        tag: "t",
        blurb: "b",
        href: "/work/ok",
        externalUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });
});

describe("adminCreateProjectBodySchema", () => {
  it("accepts wrapped { project, caseStudy }", () => {
    const r = adminCreateProjectBodySchema.safeParse({
      project: {
        slug: "x",
        title: "T",
        tag: "g",
        blurb: "b",
        href: "/work/x",
      },
      caseStudy: {
        title: "T",
        subtitle: "s",
        problem: "p",
        approach: "a",
        constraints: "c",
        outcome: "o",
      },
    });
    expect(r.success).toBe(true);
  });
});

describe("adminAssetUploadMetadataSchema", () => {
  it("requires alt and usage context (server rejects incomplete metadata)", () => {
    expect(
      adminAssetUploadMetadataSchema.safeParse({
        category: "hero",
        altText: "",
        usageContext: "hero",
      }).success,
    ).toBe(false);
  });
});

describe("adminCaseStudyScalarSchema", () => {
  it("requires all copy fields", () => {
    expect(
      adminCaseStudyScalarSchema.safeParse({
        title: "t",
        subtitle: "s",
        problem: "",
        approach: "a",
        constraints: "c",
        outcome: "o",
      }).success,
    ).toBe(false);
  });
});
