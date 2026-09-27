import raw from "@/features/portfolio/data/resume.json";
import type { ResumeData } from "./types";

/**
 * The resume content, typed. `resume.json` is the single source of truth
 * shared with the PDF build (`portfolio/scripts/build-resume-pdf.mjs` +
 * `portfolio/scripts/resume-template.mjs`) — never hard-code resume facts
 * in a component; read them from here instead.
 */
export const resumeData: ResumeData = raw;

/** The first sentence of `text` (through its first period), for meta descriptions. */
export function getFirstSentence(text: string): string {
  const match = text.match(/^[^.]+\./);
  return match ? match[0] : text;
}

/** Tool entries that link out (currently Kinoa.io and Data.ai). */
export function getLinkedTools(data: ResumeData): { name: string; href: string }[] {
  return data.technicalProficiency.filter(
    (tool): tool is { name: string; href: string } => Boolean(tool.href),
  );
}
