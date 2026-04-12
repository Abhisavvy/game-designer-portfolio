import type { CaseStudy, ProjectItem } from "@/features/portfolio/data/site-content";
import type {
  CVBullet,
  CVBulletFormat,
  ConsistencyIssue,
} from "@/features/admin/types/admin";

export type BulletFocusArea =
  | "impact"
  | "technical"
  | "leadership"
  | "process";

export interface BulletGenerationOptions {
  format: CVBulletFormat;
  focusArea?: BulletFocusArea;
}

const WORD_ROLL = "Word Roll";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function collectCvPlainText(cvData: unknown): string {
  if (cvData === null || cvData === undefined) return "";
  if (typeof cvData === "string") return cvData;

  const parts: string[] = [];

  const walk = (node: unknown): void => {
    if (node === null || node === undefined) return;
    if (typeof node === "string") {
      parts.push(node);
      return;
    }
    if (typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    for (const v of Object.values(node as Record<string, unknown>)) {
      walk(v);
    }
  };

  walk(cvData);
  return stripHtml(parts.join(" \n "));
}

/** Reactive Resume–style JSON: basics + sections/items/summary/content. */
export function extractCvPlainText(cvData: unknown): string {
  const raw = collectCvPlainText(cvData);
  return raw.replace(/\s+/g, " ").trim();
}

export class CVBulletGenerator {
  /**
   * Generate CV bullets from a project row plus its case study (if any).
   */
  generateBullets(
    project: ProjectItem,
    caseStudy: CaseStudy | undefined,
    options: BulletGenerationOptions,
  ): CVBullet[] {
    const bullets: CVBullet[] = [];

    if (!caseStudy) {
      return [
        {
          id: `${project.slug}-basic`,
          format: options.format,
          content: this.generateBasicBullet(project, options.format, options.focusArea),
          source: "project-basic",
          confidence: "medium",
        },
      ];
    }

    if (caseStudy.problem) {
      bullets.push({
        id: `${project.slug}-problem`,
        format: options.format,
        content: this.generateProblemBullet(
          project,
          caseStudy,
          options.format,
          options.focusArea,
        ),
        source: "case-study-problem",
        confidence: "high",
      });
    }

    if (caseStudy.outcome) {
      bullets.push({
        id: `${project.slug}-outcome`,
        format: options.format,
        content: this.generateOutcomeBullet(
          project,
          caseStudy,
          options.format,
          options.focusArea,
        ),
        source: "case-study-outcome",
        confidence: "high",
      });
    }

    if (
      caseStudy.approach &&
      (options.focusArea === "process" || options.focusArea === "technical")
    ) {
      bullets.push({
        id: `${project.slug}-approach`,
        format: options.format,
        content: this.generateApproachBullet(
          project,
          caseStudy,
          options.format,
          options.focusArea,
        ),
        source: "case-study-approach",
        confidence: "medium",
      });
    }

    return bullets;
  }

  /**
   * Validate portfolio defaults and optional Reactive Resume JSON for glossary / metric drift.
   */
  validateConsistency(
    projects: ProjectItem[],
    caseStudies: Record<string, CaseStudy>,
    cvData?: unknown,
  ): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const cvPlain = cvData ? extractCvPlainText(cvData) : "";

    projects.forEach((project) => {
      const cs = caseStudies[project.slug];
      const tagParts = this.splitTag(project.tag);
      issues.push(...this.validateTagNaming(tagParts, project.slug));
      issues.push(...this.validateBlurbTechNaming(project.blurb, project.slug));

      if (cs?.subtitle?.includes(WORD_ROLL)) {
        issues.push(...this.validateWordRollCasing(cs.subtitle, project.slug));
      }

      if (cvPlain && cs) {
        issues.push(
          ...this.compareProjectAgainstCv(project, cs, cvPlain),
        );
      }
    });

    if (cvPlain && typeof cvData === "object" && cvData !== null) {
      const basics = (cvData as { basics?: { name?: string } }).basics;
      issues.push(...this.validateWordRollInCvText(cvPlain));
      if (basics?.name) {
        issues.push({
          type: "cv-json-shape",
          severity: "low",
          projectSlug: "__site__",
          field: "cv.basics.name",
          message: "CV JSON includes basics.name — confirm it matches portfolio person.name in site content when syncing.",
          suggestion: "Compare /admin/personal with Reactive Resume basics after edits.",
        });
      }
    }

    return issues;
  }

  private compareProjectAgainstCv(
    project: ProjectItem,
    caseStudy: CaseStudy,
    cvPlain: string,
  ): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const blob = `${project.title}\n${project.blurb}\n${caseStudy.outcome}`;
    const tokens = this.extractMetricTokens(blob);
    if (tokens.length === 0) return issues;

    const titleHit =
      cvPlain.includes(project.title) ||
      cvPlain.toLowerCase().includes(project.slug.replace(/-/g, " "));
    if (!titleHit) {
      issues.push({
        type: "cv-coverage",
        severity: "medium",
        projectSlug: project.slug,
        field: "cv-text",
        message: `CV text does not obviously reference "${project.title}" — portfolio metrics may be missing or summarized differently on the CV.`,
        suggestion:
          "Add a bullet that names the feature and mirrors key outcome numbers from the case study.",
      });
    }

    const lowered = cvPlain.toLowerCase();
    for (const token of tokens) {
      if (!cvPlain.includes(token) && !lowered.includes(token.toLowerCase())) {
        issues.push({
          type: "metric-cv-alignment",
          severity: "medium",
          projectSlug: project.slug,
          field: "outcome",
          message: `Portfolio text includes "${token}" but the same token was not found in the pasted CV JSON text.`,
          suggestion:
            "Copy the metric verbatim into a CV bullet or reconcile if the CV uses a newer experiment readout.",
          portfolioValue: token,
        });
      }
    }

    return issues;
  }

  private validateWordRollInCvText(cvPlain: string): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const bad = /\bword roll\b/i.exec(cvPlain);
    if (bad && !cvPlain.includes(WORD_ROLL)) {
      issues.push({
        type: "glossary-word-roll",
        severity: "low",
        projectSlug: "__site__",
        field: "cv-text",
        message: 'CV text references Word Roll without the canonical "Word Roll" casing.',
        suggestion: `Standardize on "${WORD_ROLL}" everywhere (portfolio, CV, store-facing copy).`,
        cvValue: bad[0],
        portfolioValue: WORD_ROLL,
      });
    }
    return issues;
  }

  private validateWordRollCasing(
    subtitle: string,
    projectSlug: string,
  ): ConsistencyIssue[] {
    if (subtitle.includes(WORD_ROLL)) return [];
    if (subtitle.toLowerCase().includes("word roll")) {
      return [
        {
          type: "glossary-word-roll",
          severity: "low",
          projectSlug,
          field: "caseStudy.subtitle",
          message: "Subtitle references Word Roll with non-standard casing.",
          suggestion: `Use "${WORD_ROLL}" for consistency with workspace rules.`,
          portfolioValue: subtitle,
        },
      ];
    }
    return [];
  }

  private splitTag(tag: string): string[] {
    return tag
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private techNamingChecks(): Array<{ re: RegExp; expected: string }> {
    return [
      { re: /javascript/i, expected: "JavaScript" },
      { re: /typescript/i, expected: "TypeScript" },
      { re: /\breact\b/i, expected: "React" },
      { re: /\bunity\b/i, expected: "Unity" },
      { re: /\bnext\.?js\b/i, expected: "Next.js" },
    ];
  }

  private validateTagNaming(parts: string[], projectSlug: string): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const checks = this.techNamingChecks();

    for (const part of parts) {
      for (const { re, expected } of checks) {
        if (re.test(part) && part !== expected && !part.includes(expected)) {
          issues.push({
            type: "tech-naming",
            severity: "low",
            projectSlug,
            field: "tag",
            message: `Inconsistent tech naming in project tag segment: "${part}"`,
            suggestion: `Prefer standard capitalization (e.g., ${expected}).`,
            portfolioValue: part,
          });
        }
      }
    }
    return issues;
  }

  private validateBlurbTechNaming(blurb: string, projectSlug: string): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    if (!blurb) return issues;
    const checks = this.techNamingChecks();
    for (const { re, expected } of checks) {
      const m = blurb.match(re);
      if (!m) continue;
      const found = m[0];
      if (found !== expected && !blurb.includes(expected)) {
        issues.push({
          type: "tech-naming",
          severity: "low",
          projectSlug,
          field: "blurb",
          message: `Inconsistent tech naming in blurb: "${found}"`,
          suggestion: `Prefer standard capitalization (e.g., ${expected}).`,
          portfolioValue: found,
        });
      }
    }
    return issues;
  }

  private generateBasicBullet(
    project: ProjectItem,
    format: CVBulletFormat,
    focus?: BulletFocusArea,
  ): string {
    const action = this.getActionVerb(project, focus);
    const scope = project.blurb || project.title;
    const impact = this.extractImpactFromBlurb(project.blurb);

    switch (format) {
      case "tight":
        return `${action} ${project.title}${impact ? ` — ${impact}` : ""}`;
      case "standard":
        return `${action} ${project.title}: ${scope}${impact ? `; ${impact}` : ""}`;
      case "narrative":
        return `${action} ${project.title} (${project.tag}). ${scope}${impact ? ` Outcome highlight: ${impact}.` : ""}`;
      default:
        return `${action} ${project.title}`;
    }
  }

  private generateProblemBullet(
    project: ProjectItem,
    caseStudy: CaseStudy,
    format: CVBulletFormat,
    focus?: BulletFocusArea,
  ): string {
    const problem = caseStudy.problem;
    const action =
      focus === "leadership" ? "Aligned stakeholders on" : this.getActionVerb(project, focus);
    const summary = this.summarizeProblem(problem);

    switch (format) {
      case "tight":
        return `${action} ${project.title} for ${summary}`;
      case "standard":
        return `${action} ${project.title}, addressing ${summary}${
          caseStudy.subtitle?.includes(WORD_ROLL) ? " (Word Roll)" : ""
        }`;
      case "narrative":
        return `${action} ${project.title} by framing and solving ${summary}, balancing live constraints documented in the portfolio case study.`;
      default:
        return `${action} ${project.title}`;
    }
  }

  private generateOutcomeBullet(
    project: ProjectItem,
    caseStudy: CaseStudy,
    format: CVBulletFormat,
    focus?: BulletFocusArea,
  ): string {
    const outcome = caseStudy.outcome;
    const metrics = this.extractMetricTokens(outcome);
    const action =
      focus === "technical"
        ? "Shipped and measured"
        : this.getActionVerb(project, focus);
    const metricPhrase =
      metrics.length > 0 ? metrics.slice(0, 3).join(", ") : "measurable live impact";

    switch (format) {
      case "tight":
        return `${action} ${project.title} — ${metricPhrase}`;
      case "standard":
        return `${action} ${project.title}, delivering ${metricPhrase} (see portfolio outcome block for confidence notes).`;
      case "narrative":
        return `${action} ${project.title}; key readouts included ${metricPhrase}, with tradeoffs and experiment caveats captured in the case study.`;
      default:
        return `${action} ${project.title}`;
    }
  }

  private generateApproachBullet(
    project: ProjectItem,
    caseStudy: CaseStudy,
    format: CVBulletFormat,
    focus?: BulletFocusArea,
  ): string {
    const approach = caseStudy.approach;
    const action =
      focus === "technical" ? "Implemented" : this.getActionVerb(project, focus);
    const method = this.summarizeApproach(approach);

    switch (format) {
      case "tight":
        return `${action} ${project.title} via ${method}`;
      case "standard":
        return `${action} ${project.title} using ${method}, aligned to production constraints.`;
      case "narrative":
        return `${action} ${project.title} with ${method}, coordinating UX, economy, and LiveOps constraints as documented in the approach section.`;
      default:
        return `${action} ${project.title}`;
    }
  }

  private getActionVerb(
    project: ProjectItem,
    focus?: BulletFocusArea,
  ): string {
    if (focus === "leadership") return "Led";
    if (focus === "process") return "Drove";

    const title = project.title.toLowerCase();
    const blurb = (project.blurb || "").toLowerCase();

    if (title.includes("design") || blurb.includes("design")) return "Designed";
    if (title.includes("build") || blurb.includes("build")) return "Built";
    if (title.includes("implement") || blurb.includes("implement"))
      return "Implemented";
    if (title.includes("integrat") || blurb.includes("integrat"))
      return "Integrated";
    if (title.includes("optim") || blurb.includes("optim")) return "Optimized";

    return "Designed";
  }

  /** Pulls +12%, 7.5%, +22 bps style tokens for CV alignment checks. */
  extractMetricTokens(text: string): string[] {
    const metrics: string[] = [];
    const pct = text.matchAll(/[+-]?\d+(?:\.\d+)?%/g);
    for (const m of pct) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      const tail = text.slice(end, end + 40).toLowerCase();
      // Drop statistical-confidence readouts, not product metrics.
      if (tail.trimStart().startsWith("confidence")) continue;
      metrics.push(m[0]);
    }
    const bps = text.matchAll(/[+-]?\d+\s*bps/gi);
    for (const m of bps) metrics.push(m[0].replace(/\s+/g, " "));
    return [...new Set(metrics)];
  }

  private extractImpactFromBlurb(blurb?: string): string | null {
    if (!blurb) return null;
    const metrics = this.extractMetricTokens(blurb);
    return metrics.length > 0 ? metrics[0] : null;
  }

  private summarizeProblem(problem: string): string {
    const lower = problem.toLowerCase();
    if (lower.includes("retention")) return "retention gaps";
    if (lower.includes("engagement")) return "engagement gaps";
    if (lower.includes("monetization") || lower.includes("revenue"))
      return "monetization pressure";
    if (lower.includes("economy") || lower.includes("currency"))
      return "economy risk";
    if (lower.includes("performance")) return "performance constraints";
    if (lower.includes("balance")) return "balance issues";
    return "core player experience gaps";
  }

  private summarizeApproach(approach: string): string {
    const lowerApproach = approach.toLowerCase();
    if (lowerApproach.includes("data-driven")) return "data-driven iteration";
    if (lowerApproach.includes("iterative")) return "iterative design";
    if (lowerApproach.includes("a/b")) return "A/B experimentation";
    if (lowerApproach.includes("user research")) return "user research";
    if (lowerApproach.includes("prototype")) return "rapid prototyping";
    return "structured design and validation";
  }
}

export const cvBulletGenerator = new CVBulletGenerator();
