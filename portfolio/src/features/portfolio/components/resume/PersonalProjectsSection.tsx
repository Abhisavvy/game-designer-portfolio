import Link from "next/link";
import { ResumeSectionHeading } from "./ResumeSectionHeading";
import { ThreadTimeline, TimelineEntry } from "./ThreadTimeline";
import { linkifyText } from "./linkifyText";
import type { ResumePersonalProject } from "./types";

/**
 * "Personal Projects": rendered the same way as Key Achievements/Experience
 * (the shared thread-timeline layout), but each entry links two places —
 * internally to its own /work/<slug> case study, and out to the live repo
 * or playtest. Renders nothing when there are no personal projects, so the
 * page degrades gracefully if this section is ever removed from the data.
 */
export function PersonalProjectsSection({
  projects,
  linkedTools,
}: {
  projects: ResumePersonalProject[] | undefined;
  linkedTools: { name: string; href: string }[];
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <section aria-labelledby="personal-projects-heading">
      <ResumeSectionHeading id="personal-projects-heading" eyebrow="Personal Projects" />
      <ThreadTimeline>
        {projects.map((project, index) => (
          <TimelineEntry key={project.title} index={index}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-display text-lg leading-snug text-paper sm:text-xl">
                <Link href={project.caseStudy} className="transition-colors hover:text-accent">
                  {project.title}
                </Link>{" "}
                <span className="text-muted">{project.year}</span>
              </h3>
            </div>
            <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-muted sm:text-base">
              {linkifyText(project.text, linkedTools)}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs uppercase tracking-wide sm:text-sm">
              <Link
                href={project.caseStudy}
                className="text-accent underline decoration-dotted underline-offset-4 hover:text-paper"
              >
                Case study
              </Link>
              <a
                href={project.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline decoration-dotted underline-offset-4 hover:text-paper"
              >
                {project.link.label}
              </a>
            </div>
          </TimelineEntry>
        ))}
      </ThreadTimeline>
    </section>
  );
}
