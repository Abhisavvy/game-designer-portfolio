import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectCreateWizard } from "./ProjectCreateWizard";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

function namedField(name: string): HTMLElement {
  const el = document.querySelector(`[name="${name}"]`);
  if (!el) throw new Error(`missing field ${name}`);
  return el as HTMLElement;
}

describe("ProjectCreateWizard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);
  });

  it("posts project + case study together with /work/{slug} href (no manual path wiring)", async () => {
    const user = userEvent.setup();
    render(<ProjectCreateWizard />);

    await user.type(namedField("slug"), "wiz-case");
    await user.type(namedField("title"), "Wizard Title");
    await user.type(namedField("tag"), "Tag line");
    await user.type(
      namedField("blurb"),
      "Short blurb for the card that fits validation.",
    );
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.type(namedField("subtitle"), "Subtitle text here");
    await user.type(namedField("problem"), "Problem");
    await user.type(namedField("approach"), "Approach");
    await user.type(namedField("constraints"), "Constraints");
    await user.type(namedField("outcome"), "Outcome");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.click(screen.getByRole("button", { name: /publish project/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    const postCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === "/api/admin/content/projects",
    );
    expect(postCall).toBeDefined();
    const init = postCall![1] as RequestInit;
    expect(init.method).toBe("POST");
    const payload = JSON.parse(init.body as string);
    expect(payload.project.slug).toBe("wiz-case");
    expect(payload.project.href).toBe("/work/wiz-case");
    expect(payload.caseStudy.problem).toBe("Problem");
  });
});
