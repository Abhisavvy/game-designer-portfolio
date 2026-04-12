// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, PUT } from "./route";

const hoisted = vi.hoisted(() => ({
  study: null as Record<string, unknown> | null,
  updateCaseStudyScalars: vi.fn(),
  deploy: vi.fn(),
}));

vi.mock("@/features/portfolio/data/site-content", () => ({
  get defaultPortfolioContent() {
    return {
      projects: [],
      caseStudies: hoisted.study
        ? { "my-slug": hoisted.study }
        : ({} as Record<string, unknown>),
    };
  },
}));

vi.mock("@/features/admin/utils/ast-manipulator", () => ({
  ASTManipulator: vi.fn().mockImplementation(() => ({
    updateCaseStudyScalars: hoisted.updateCaseStudyScalars,
  })),
}));

vi.mock("@/features/admin/utils/hot-reload", () => ({
  triggerHotReloadAndDeploy: hoisted.deploy,
}));

describe("/api/admin/content/case-studies", () => {
  beforeEach(() => {
    hoisted.study = null;
    vi.clearAllMocks();
  });

  it("GET returns 400 when projectSlug missing", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/admin/content/case-studies"),
    );
    expect(res.status).toBe(400);
  });

  it("GET returns empty draft when case study missing", async () => {
    const res = await GET(
      new NextRequest(
        "http://localhost/api/admin/content/case-studies?projectSlug=missing",
      ),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.caseStudy.title).toBe("");
    expect(body.caseStudy.media.hero.posterSrc).toBe("");
  });

  it("GET returns merged case study including media defaults", async () => {
    hoisted.study = {
      title: "T",
      subtitle: "S",
      problem: "P",
      approach: "A",
      constraints: "C",
      outcome: "O",
      contributions: "",
      links: [{ label: "L", href: "/x" }],
      media: { hero: { posterSrc: "/assets/my-slug/hero-image.png" } },
    };
    const res = await GET(
      new NextRequest(
        "http://localhost/api/admin/content/case-studies?projectSlug=my-slug",
      ),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.caseStudy.media.hero.posterSrc).toBe(
      "/assets/my-slug/hero-image.png",
    );
  });

  it("PUT validates scalars and triggers deploy (cache invalidation path)", async () => {
    const req = new NextRequest("http://localhost/api/admin/content/case-studies", {
      method: "PUT",
      body: JSON.stringify({
        projectSlug: "x",
        caseStudy: {
          title: "T",
          subtitle: "S",
          problem: "P",
          approach: "A",
          constraints: "C",
          outcome: "O",
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(hoisted.updateCaseStudyScalars).toHaveBeenCalledWith(
      "x",
      expect.objectContaining({ title: "T" }),
    );
    expect(hoisted.deploy).toHaveBeenCalledWith(
      expect.stringMatching(/site-content\.ts$/),
      expect.stringContaining("x"),
    );
  });

  it("PUT returns 400 for invalid payload", async () => {
    const req = new NextRequest("http://localhost/api/admin/content/case-studies", {
      method: "PUT",
      body: JSON.stringify({
        projectSlug: "x",
        caseStudy: { title: "", subtitle: "s", problem: "p", approach: "a", constraints: "c", outcome: "o" },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    expect(hoisted.updateCaseStudyScalars).not.toHaveBeenCalled();
  });
});
