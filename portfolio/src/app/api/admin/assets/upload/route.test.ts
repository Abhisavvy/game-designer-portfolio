// @vitest-environment node
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const hoisted = vi.hoisted(() => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  existsSync: vi.fn().mockReturnValue(true),
  updateProjectImage: vi.fn(),
  addGalleryImage: vi.fn(),
  deploy: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  writeFile: hoisted.writeFile,
  mkdir: hoisted.mkdir,
}));

vi.mock("fs", () => ({
  existsSync: hoisted.existsSync,
}));

vi.mock("@/features/admin/utils/ast-manipulator", () => ({
  ASTManipulator: vi.fn().mockImplementation(() => ({
    updateProjectImage: hoisted.updateProjectImage,
    addGalleryImage: hoisted.addGalleryImage,
  })),
}));

vi.mock("@/features/admin/utils/hot-reload", () => ({
  triggerHotReloadAndDeploy: hoisted.deploy,
}));

function makePngFile(name = "Screen Shot.png") {
  return new File([new Uint8Array([0x89, 0x50])], name, {
    type: "image/png",
  });
}

describe("POST /api/admin/assets/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.existsSync.mockReturnValue(true);
  });

  it("writes hero to canonical filename and updates AST poster path", async () => {
    const form = new FormData();
    form.append("file", makePngFile());
    form.append(
      "metadata",
      JSON.stringify({
        category: "hero",
        projectSlug: "demo",
        altText: "Hero",
        usageContext: "Case study hero",
      }),
    );
    const res = await POST(new NextRequest("http://localhost/api/upload", { method: "POST", body: form }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.asset.publicUrl).toBe("/assets/demo/hero-image.png");
    expect(hoisted.writeFile).toHaveBeenCalled();
    const writtenPath = hoisted.writeFile.mock.calls[0][0] as string;
    expect(writtenPath).toBe(
      path.join(process.cwd(), "public", "assets", "demo", "hero-image.png"),
    );
    expect(hoisted.updateProjectImage).toHaveBeenCalledWith(
      "demo",
      "/assets/demo/hero-image.png",
    );
    expect(hoisted.deploy).toHaveBeenCalled();
  });

  it("rejects missing file", async () => {
    const form = new FormData();
    form.append(
      "metadata",
      JSON.stringify({
        category: "gallery",
        projectSlug: "demo",
        altText: "a",
        usageContext: "ctx",
      }),
    );
    const res = await POST(new NextRequest("http://localhost/api/upload", { method: "POST", body: form }));
    expect(res.status).toBe(400);
  });

  it("rejects oversize file (no disk write)", async () => {
    const big = new Uint8Array(6 * 1024 * 1024);
    const form = new FormData();
    form.append("file", new File([big], "big.png", { type: "image/png" }));
    form.append(
      "metadata",
      JSON.stringify({
        category: "hero",
        projectSlug: "demo",
        altText: "a",
        usageContext: "ctx",
      }),
    );
    const res = await POST(new NextRequest("http://localhost/api/upload", { method: "POST", body: form }));
    expect(res.status).toBe(400);
    expect(hoisted.writeFile).not.toHaveBeenCalled();
  });

  it("rejects invalid metadata with 400", async () => {
    const form = new FormData();
    form.append("file", makePngFile());
    form.append(
      "metadata",
      JSON.stringify({
        category: "hero",
        projectSlug: "demo",
        altText: "",
        usageContext: "ctx",
      }),
    );
    const res = await POST(new NextRequest("http://localhost/api/upload", { method: "POST", body: form }));
    expect(res.status).toBe(400);
  });
});
