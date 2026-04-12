// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { triggerHotReload, triggerHotReloadAndDeploy } from "./hot-reload";

const fsMock = vi.hoisted(() => ({
  stat: vi.fn().mockResolvedValue({}),
  utimes: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("fs", () => ({
  promises: fsMock,
}));

const deployMock = vi.hoisted(() => ({
  deployToVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./git-deploy", () => deployMock);

describe("hot-reload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsMock.stat.mockResolvedValue({});
    fsMock.utimes.mockResolvedValue(undefined);
    fsMock.writeFile.mockResolvedValue(undefined);
    fsMock.unlink.mockResolvedValue(undefined);
    deployMock.deployToVercel.mockResolvedValue(undefined);
    vi.spyOn(process, "cwd").mockReturnValue("/tmp/portfolio-app");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("touches site-content and trigger file so dev picks changes without manual restart", async () => {
    const target = "/tmp/portfolio-app/src/features/portfolio/data/site-content.ts";
    await triggerHotReload(target);
    expect(fsMock.stat).toHaveBeenCalledWith(target);
    expect(fsMock.utimes).toHaveBeenCalled();
    expect(fsMock.writeFile).toHaveBeenCalledWith(
      "/tmp/portfolio-app/.next-hot-reload-trigger",
      expect.any(String),
    );
    expect(fsMock.unlink).toHaveBeenCalledWith(
      "/tmp/portfolio-app/.next-hot-reload-trigger",
    );
  });

  it("triggerHotReloadAndDeploy always attempts deploy after touch (cache / prod workflow)", async () => {
    const target = "/tmp/portfolio-app/site-content.ts";
    await triggerHotReloadAndDeploy(target, "msg");
    expect(deployMock.deployToVercel).toHaveBeenCalledWith({ message: "msg" });
  });

  it("does not throw when deploy fails (local edits still apply)", async () => {
    deployMock.deployToVercel.mockRejectedValueOnce(new Error("git unavailable"));
    await expect(
      triggerHotReloadAndDeploy("/tmp/x.ts", "x"),
    ).resolves.toBeUndefined();
  });
});
