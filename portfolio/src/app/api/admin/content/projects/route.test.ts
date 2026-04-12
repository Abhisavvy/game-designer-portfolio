// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, GET, POST, PUT } from "./route";

const hoisted = vi.hoisted(() => ({
  projects: [] as Array<Record<string, unknown>>,
  addProjectWithCaseStudy: vi.fn(),
  addProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  deploy: vi.fn(),
}));

vi.mock("@/features/portfolio/data/site-content", () => ({
  get defaultPortfolioContent() {
    return {
      projects: hoisted.projects,
      caseStudies: {},
    };
  },
}));

vi.mock("@/features/admin/utils/ast-manipulator", () => ({
  ASTManipulator: vi.fn().mockImplementation(() => ({
    addProjectWithCaseStudy: hoisted.addProjectWithCaseStudy,
    addProject: hoisted.addProject,
    updateProject: hoisted.updateProject,
    deleteProject: hoisted.deleteProject,
  })),
}));

vi.mock("@/features/admin/utils/hot-reload", () => ({
  triggerHotReloadAndDeploy: hoisted.deploy,
}));

describe("/api/admin/content/projects", () => {
  beforeEach(() => {
    hoisted.projects.length = 0;
    vi.clearAllMocks();
  });

  it("GET returns serialized projects from site content", async () => {
    hoisted.projects.push({
      slug: "a",
      title: "A",
      tag: "t",
      blurb: "b",
      href: "/work/a",
      externalUrl: "",
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].slug).toBe("a");
  });

  it("POST creates project + case study and triggers hot reload / deploy hook", async () => {
    const req = new NextRequest("http://localhost/api/admin/content/projects", {
      method: "POST",
      body: JSON.stringify({
        project: {
          slug: "new-proj",
          title: "T",
          tag: "g",
          blurb: "b",
          href: "/work/new-proj",
          externalUrl: "",
        },
        caseStudy: {
          title: "T",
          subtitle: "s",
          problem: "p",
          approach: "a",
          constraints: "c",
          outcome: "o",
          links: [],
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(hoisted.addProjectWithCaseStudy).toHaveBeenCalledOnce();
    expect(hoisted.deploy).toHaveBeenCalledWith(
      expect.stringMatching(/site-content\.ts$/),
      expect.stringContaining("new-proj"),
    );
  });

  it("POST rejects duplicate slug without touching AST (data consistency)", async () => {
    hoisted.projects.push({
      slug: "dup",
      title: "Old",
      tag: "x",
      blurb: "x",
      href: "/work/dup",
      externalUrl: "",
    });
    const req = new NextRequest("http://localhost/api/admin/content/projects", {
      method: "POST",
      body: JSON.stringify({
        project: {
          slug: "dup",
          title: "N",
          tag: "n",
          blurb: "n",
          href: "/work/dup",
          externalUrl: "",
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(hoisted.addProjectWithCaseStudy).not.toHaveBeenCalled();
  });

  it("POST accepts legacy flat body { slug, title, ... }", async () => {
    const req = new NextRequest("http://localhost/api/admin/content/projects", {
      method: "POST",
      body: JSON.stringify({
        slug: "flat-slug",
        title: "T",
        tag: "g",
        blurb: "b",
        href: "/work/flat-slug",
        externalUrl: "",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(hoisted.addProject).toHaveBeenCalledOnce();
  });

  it("PUT updates project and triggers deploy", async () => {
    const req = new NextRequest("http://localhost/api/admin/content/projects", {
      method: "PUT",
      body: JSON.stringify({
        slug: "x",
        project: {
          slug: "x",
          title: "New",
          tag: "t",
          blurb: "b",
          href: "/work/x",
          externalUrl: "",
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(hoisted.updateProject).toHaveBeenCalledWith("x", expect.any(Object));
    expect(hoisted.deploy).toHaveBeenCalled();
  });

  it("PUT returns 400 when slug missing", async () => {
    const req = new NextRequest("http://localhost/api/admin/content/projects", {
      method: "PUT",
      body: JSON.stringify({
        project: {
          slug: "x",
          title: "T",
          tag: "t",
          blurb: "b",
          href: "/work/x",
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("DELETE removes project and triggers deploy", async () => {
    const req = new NextRequest(
      "http://localhost/api/admin/content/projects?slug=rm",
      { method: "DELETE" },
    );
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(hoisted.deleteProject).toHaveBeenCalledWith("rm");
    expect(hoisted.deploy).toHaveBeenCalled();
  });
});
