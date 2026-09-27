import { ResumeSectionHeading } from "./ResumeSectionHeading";
import { ThreadTimeline, TimelineEntry } from "./ThreadTimeline";
import { linkifyText } from "./linkifyText";
import type { ResumeExperience } from "./types";

export function ExperienceSection({
  experience,
  linkedTools,
}: {
  experience: ResumeExperience[];
  linkedTools: { name: string; href: string }[];
}) {
  return (
    <section aria-labelledby="experience-heading">
      <ResumeSectionHeading id="experience-heading" eyebrow="Experience" />
      <ThreadTimeline>
        {experience.map((job, index) => (
          <TimelineEntry key={`${job.role}-${job.company}`} index={index}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <h3 className="font-display text-lg leading-snug text-paper sm:text-xl">
                  {job.role}
                </h3>
                <p className="font-mono text-xs uppercase tracking-wide text-accent sm:text-sm">
                  {job.company}
                </p>
              </div>
              <p className="whitespace-nowrap font-mono text-xs text-muted sm:text-sm">
                {job.dates} ({job.duration})
              </p>
            </div>
            <ul className="mt-3 space-y-2">
              {job.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-muted sm:text-base">
                  <span aria-hidden="true" className="mt-[2px] shrink-0 text-accent">
                    —
                  </span>
                  <span>{linkifyText(bullet, linkedTools)}</span>
                </li>
              ))}
            </ul>
          </TimelineEntry>
        ))}
      </ThreadTimeline>
    </section>
  );
}
