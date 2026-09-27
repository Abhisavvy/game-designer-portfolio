import { ResumeSectionHeading } from "./ResumeSectionHeading";
import { ThreadTimeline, TimelineEntry } from "./ThreadTimeline";
import { linkifyText } from "./linkifyText";
import { CountUp } from "../ui/CountUp";
import type { ResumeAchievement } from "./types";

/** Desktop: value stacked large-over-label, right-aligned next to the title. */
function StatDesktop({ stat }: { stat: NonNullable<ResumeAchievement["stat"]> }) {
  return (
    <div className="hidden shrink-0 flex-col items-end text-right sm:flex">
      <span className="whitespace-nowrap font-mono text-xl font-medium text-accent sm:text-2xl">
        <CountUp value={stat.value} />
      </span>
      <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wide text-muted sm:text-xs">
        {stat.label}
      </span>
    </div>
  );
}

/** Mobile: a single "value · label" line directly under the title, never competing with it for width. */
function StatMobile({ stat }: { stat: NonNullable<ResumeAchievement["stat"]> }) {
  return (
    <p className="mt-1 font-mono text-xs text-muted sm:hidden">
      <span className="font-medium text-accent">
        <CountUp value={stat.value} />
      </span>{" "}
      <span aria-hidden="true">·</span> <span className="uppercase tracking-wide">{stat.label}</span>
    </p>
  );
}

export function AchievementsSection({
  achievements,
  linkedTools,
}: {
  achievements: ResumeAchievement[];
  linkedTools: { name: string; href: string }[];
}) {
  return (
    <section aria-labelledby="achievements-heading">
      <ResumeSectionHeading id="achievements-heading" eyebrow="Key Achievements" />
      <ThreadTimeline>
        {achievements.map((achievement, index) => (
          <TimelineEntry key={achievement.title} index={index}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-display text-lg leading-snug text-paper sm:text-xl">
                {achievement.title}
                {achievement.year ? <span className="text-muted"> {achievement.year}</span> : null}
              </h3>
              {achievement.stat ? <StatDesktop stat={achievement.stat} /> : null}
            </div>
            {achievement.stat ? <StatMobile stat={achievement.stat} /> : null}
            <ul className="mt-2 max-w-[65ch] space-y-1.5">
              {achievement.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-2.5 text-sm leading-relaxed text-muted sm:text-base"
                >
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
