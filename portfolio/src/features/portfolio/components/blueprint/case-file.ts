import {
  defaultPortfolioContent,
  SKILL_THREADS,
  type ProjectItem,
  type SkillThreadId,
} from "@/features/portfolio/data/site-content";
import { DEFAULT_THREAD_COLOR } from "./tokens";

export type CaseFileArray = "projects" | "personalProjects";

export type CaseFileMeta = {
  project: ProjectItem;
  arrayName: CaseFileArray;
  /** 0-based position within its array. */
  index: number;
  total: number;
  /** 1-based, zero-padded, e.g. "01". */
  caseFileNumber: string;
  threadColor: string;
  isPersonalProject: boolean;
  backHref: string;
  backLabel: string;
  nextProject: ProjectItem;
};

/** Finds the project card (in `projects` or `personalProjects`) for a case
 * study slug, plus its 1-based index within that array, thread color, and
 * the next project to link to from the bottom nav (wrapping around). */
export function getCaseFileMeta(slug: string): CaseFileMeta | null {
  const { projects, personalProjects } = defaultPortfolioContent;

  const workIndex = projects.findIndex((p) => p.slug === slug);
  if (workIndex >= 0) {
    return buildMeta(projects, workIndex, "projects");
  }

  const personalIndex = personalProjects.findIndex((p) => p.slug === slug);
  if (personalIndex >= 0) {
    return buildMeta(personalProjects, personalIndex, "personalProjects");
  }

  return null;
}

function buildMeta(
  list: ProjectItem[],
  index: number,
  arrayName: CaseFileArray,
): CaseFileMeta {
  const project = list[index];
  const isPersonalProject = arrayName === "personalProjects";
  return {
    project,
    arrayName,
    index,
    total: list.length,
    caseFileNumber: String(index + 1).padStart(2, "0"),
    threadColor: threadColorForProject(project),
    isPersonalProject,
    backHref: isPersonalProject ? "/#projects" : "/#work",
    backLabel: isPersonalProject ? "Back to projects" : "Back to work",
    nextProject: list[(index + 1) % list.length],
  };
}

export function threadColorForProject(project: ProjectItem): string {
  const firstSkill = project.skills?.[0];
  if (!firstSkill) return DEFAULT_THREAD_COLOR;
  return skillColor(firstSkill);
}

export function skillColor(id: SkillThreadId): string {
  return SKILL_THREADS.find((s) => s.id === id)?.color ?? DEFAULT_THREAD_COLOR;
}

export function skillLabel(id: SkillThreadId): string {
  return SKILL_THREADS.find((s) => s.id === id)?.label ?? id;
}
