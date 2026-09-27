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

/**
 * Pulls one field's source text (e.g. `blurb: "..."` or a whole
 * `stats: [...]` array literal) out of the named project's object in the
 * given source text, including the `field: ` prefix.
 *
 * Lifecycle tests use this to read whatever the real site-content.ts
 * currently says for a project *before* patching it, so their assertions
 * stay copy-agnostic: they check that a field round-trips (or is replaced)
 * relative to its current content, instead of hard-coding a specific
 * project's prose that content edits would otherwise go stale against.
 */
function extractProjectField(text: string, slug: string, field: string): string {
  const slugIdx = text.indexOf(`slug: "${slug}"`);
  if (slugIdx === -1) {
    throw new Error(`extractProjectField: slug "${slug}" not found`);
  }
  const after = text.slice(slugIdx);
  // Either a quoted scalar (`field: "...",`) or a bracketed array
  // (`field: [...],`, possibly multi-line). Project-level `stats`/`skills`
  // arrays here never nest another `[` inside, so a non-greedy match up to
  // the first `]` always lands on their own closing bracket.
  const match = after.match(
    new RegExp(`${field}: (?:"(?:[^"\\\\]|\\\\.)*"|\\[[\\s\\S]*?\\])`),
  );
  if (!match) {
    throw new Error(`extractProjectField: field "${field}" not found after slug "${slug}"`);
  }
  return match[0];
}

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

  it("updateProject: patching blurb preserves existing skills and stats exactly", () => {
    tmp = path.join(
      os.tmpdir(),
      `portfolio-site-content-${process.pid}-${Date.now()}-blurb.ts`,
    );
    fs.copyFileSync(siteContentSource, tmp);

    // Read whatever the real copy currently says for bon-voyage before
    // patching, so the assertions below don't hard-code a specific prose
    // string that later content edits would make stale.
    const before = fs.readFileSync(tmp, "utf8");
    const originalBlurb = extractProjectField(before, "bon-voyage", "blurb");
    const originalSkills = extractProjectField(before, "bon-voyage", "skills");
    const originalStats = extractProjectField(before, "bon-voyage", "stats");
    const originalTitle = extractProjectField(before, "bon-voyage", "title");
    const originalHref = extractProjectField(before, "bon-voyage", "href");

    const manipulator = new ASTManipulator(tmp);
    manipulator.updateProject("bon-voyage", {
      blurb: "Rewrote the blurb only; nothing else should change.",
    });

    const text = fs.readFileSync(tmp, "utf8");
    expect(text).toContain(
      'blurb: "Rewrote the blurb only; nothing else should change."',
    );
    // The patch actually replaced the blurb value rather than merely
    // matching a lucky substring — whatever the copy said before is gone.
    expect(text).not.toContain(originalBlurb);

    // `skills` was never touched by the patch: same AST node, same source
    // formatting, whatever its current copy happens to be.
    expect(text).toContain(originalSkills);

    // `stats` was never touched by the patch either — the whole array survives.
    expect(text).toContain(originalStats);

    // Other untouched string fields also survive.
    expect(text).toContain(originalTitle);
    expect(text).toContain(originalHref);
  });

  it("updateProject: patching stats writes the new values and drops the old ones", () => {
    tmp = path.join(
      os.tmpdir(),
      `portfolio-site-content-${process.pid}-${Date.now()}-stats.ts`,
    );
    fs.copyFileSync(siteContentSource, tmp);

    // Read whatever the real copy currently says for bon-voyage before
    // patching, so the assertions below don't hard-code a specific prose
    // string that later content edits would make stale.
    const before = fs.readFileSync(tmp, "utf8");
    const originalStats = extractProjectField(before, "bon-voyage", "stats");
    const originalSkills = extractProjectField(before, "bon-voyage", "skills");
    const originalBlurb = extractProjectField(before, "bon-voyage", "blurb");

    const manipulator = new ASTManipulator(tmp);
    manipulator.updateProject("bon-voyage", {
      stats: [
        { value: "+99%", label: "Brand new metric" },
        { value: "42", label: "Another new metric" },
      ],
    });

    const text = fs.readFileSync(tmp, "utf8");
    expect(text).toContain('value: "+99%"');
    expect(text).toContain('label: "Brand new metric"');
    expect(text).toContain('value: "42"');
    expect(text).toContain('label: "Another new metric"');

    // The old stats array is gone, not merely appended to — whatever the
    // copy's stats were before the patch, that exact array literal no
    // longer appears.
    expect(text).not.toContain(originalStats);

    // Untouched fields (skills, blurb) still survive the stats-only patch,
    // whatever their current copy happens to be.
    expect(text).toContain(originalSkills);
    expect(text).toContain(originalBlurb);
  });

  it("addProjectWithCaseStudy: serialises skills and stats for a brand-new project", () => {
    tmp = path.join(
      os.tmpdir(),
      `portfolio-site-content-${process.pid}-${Date.now()}-add.ts`,
    );
    fs.copyFileSync(siteContentSource, tmp);
    const slug = `vitest-add-${Date.now()}`;

    const manipulator = new ASTManipulator(tmp);
    manipulator.addProjectWithCaseStudy(
      {
        slug,
        title: "New Project With Skills",
        tag: "Test",
        blurb: "Blurb",
        href: `/work/${slug}`,
        externalUrl: "",
        skills: ["ai", "systems"],
        stats: [
          { value: "+1%", label: "Made up metric" },
          { value: "7", label: "Another made up metric" },
        ],
      },
      {
        title: "New Project With Skills",
        subtitle: "Sub",
        problem: "P",
        approach: "A",
        constraints: "C",
        outcome: "O",
        links: [],
      },
    );

    const text = fs.readFileSync(tmp, "utf8");
    expect(text).toContain(`slug: "${slug}"`);
    expect(text).toContain('skills: ["ai", "systems"]');
    expect(text).toContain('value: "+1%"');
    expect(text).toContain('label: "Made up metric"');
    expect(text).toContain('value: "7"');
    expect(text).toContain('label: "Another made up metric"');
  });

  it("updateProject: an unknown extra key on an existing project survives an update", () => {
    tmp = path.join(
      os.tmpdir(),
      `portfolio-site-content-${process.pid}-${Date.now()}-unknown-key.ts`,
    );
    fs.copyFileSync(siteContentSource, tmp);

    // Inject a hypothetical future/unknown field directly into the temp copy (never the
    // real file) to prove updateProject() round-trips fields it doesn't know about
    // instead of silently dropping them.
    const original = fs.readFileSync(tmp, "utf8");
    const withUnknownKey = original.replace(
      'slug: "bon-voyage",',
      'slug: "bon-voyage",\n            futureField: "from-the-future",',
    );
    expect(withUnknownKey).not.toBe(original);
    fs.writeFileSync(tmp, withUnknownKey);

    const manipulator = new ASTManipulator(tmp);
    manipulator.updateProject("bon-voyage", {
      blurb: "Only the blurb changes.",
    });

    const text = fs.readFileSync(tmp, "utf8");
    expect(text).toContain('blurb: "Only the blurb changes."');
    expect(text).toContain('futureField: "from-the-future"');
    // Known-but-unpatched fields still survive alongside the unknown one.
    expect(text).toContain('skills: ["retention", "economy", "monetization"]');
  });
});
