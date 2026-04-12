// @vitest-environment node
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { ASTManipulator } from "./ast-manipulator";
import { getProjectListingImageSources } from "@/features/portfolio/utils/project-media";

const siteContentSource = path.join(
  process.cwd(),
  "src/features/portfolio/data/site-content.ts",
);

describe("ASTManipulator + listing media contract", () => {
  let tmp: string | undefined;

  afterEach(() => {
    if (tmp && fs.existsSync(tmp)) {
      fs.unlinkSync(tmp);
    }
    tmp = undefined;
  });

  it("writes matching project row and case study; hero update uses path listing layer understands", () => {
    tmp = path.join(
      os.tmpdir(),
      `portfolio-site-content-${process.pid}-${Date.now()}.ts`,
    );
    fs.copyFileSync(siteContentSource, tmp);
    const slug = `vitest-${Date.now()}`;
    const manipulator = new ASTManipulator(tmp);
    manipulator.addProjectWithCaseStudy(
      {
        slug,
        title: "Vitest Project",
        tag: "Test",
        blurb: "Blurb",
        href: `/work/${slug}`,
        externalUrl: "",
      },
      {
        title: "Vitest Project",
        subtitle: "Sub",
        problem: "P",
        approach: "A",
        constraints: "C",
        outcome: "O",
        links: [],
      },
    );

    let text = fs.readFileSync(tmp, "utf8");
    expect(text).toContain(`slug: "${slug}"`);
    expect(text).toContain("/assets/placeholder-image.svg");

    const heroPublic = `/assets/${slug}/hero-image.webp`;
    manipulator.updateProjectImage(slug, heroPublic);
    text = fs.readFileSync(tmp, "utf8");
    expect(text).toContain(heroPublic);

    const listing = getProjectListingImageSources(slug, heroPublic);
    expect(listing.src).toBe(heroPublic);
  });
});
