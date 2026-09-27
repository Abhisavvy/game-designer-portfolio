"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "./media/useMediaPreferences";
import { defaultPortfolioContent } from "../data/site-content";
import { NoScriptReveal } from "./blueprint/NoScriptReveal";
import { resumeData, getLinkedTools } from "./resume/resumeData";
import { ProfileCard } from "./resume/ProfileCard";
import { ResumeSectionHeading } from "./resume/ResumeSectionHeading";
import { LabeledList } from "./resume/LabeledList";
import { AchievementsSection } from "./resume/AchievementsSection";
import { ExperienceSection } from "./resume/ExperienceSection";
import { PersonalProjectsSection } from "./resume/PersonalProjectsSection";
import { EducationList } from "./resume/EducationList";
import { CaseStudiesRow } from "./resume/CaseStudiesRow";

/**
 * The /resume page. Every fact rendered here comes from
 * `src/features/portfolio/data/resume.json` — the same single source of
 * truth used to generate the PDF (see `portfolio/scripts/build-resume-pdf.mjs`
 * and `portfolio/scripts/resume-template.mjs`). Never hard-code resume
 * content in this component; add it to the JSON file instead.
 */
export function ResumePageContent() {
  const reducedMotion = usePrefersReducedMotion();
  const linkedTools = getLinkedTools(resumeData);
  const caseStudyProjects = defaultPortfolioContent.projects.slice(0, 3);

  const reveal = (delay = 0) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="min-h-screen bg-ink pb-24 pt-10 sm:pt-14">
      <NoScriptReveal />
      <div className="mx-auto max-w-6xl pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 lg:px-10">
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:items-start lg:gap-16">
          <aside className="mb-12 lg:sticky lg:top-28 lg:mb-0 lg:self-start">
            <motion.div className="bp-reveal" {...reveal()}>
              <ProfileCard basics={resumeData.basics} />
            </motion.div>
          </aside>

          <div className="space-y-14 sm:space-y-16">
            <motion.section
              className="bp-reveal"
              {...reveal(0.05)}
              aria-labelledby="summary-heading"
            >
              <ResumeSectionHeading id="summary-heading" eyebrow="Summary" />
              <p className="max-w-[70ch] text-base leading-relaxed text-paper/90 sm:text-lg">
                {resumeData.summary}
              </p>
            </motion.section>

            <motion.section
              className="bp-reveal"
              {...reveal(0.1)}
              aria-labelledby="focus-heading"
            >
              <ResumeSectionHeading id="focus-heading" eyebrow="What I Focus On" />
              <LabeledList items={resumeData.focus} linkedTools={resumeData.technicalProficiency} />
            </motion.section>

            <motion.div className="bp-reveal" {...reveal(0.15)}>
              <AchievementsSection
                achievements={resumeData.achievements}
                linkedTools={linkedTools}
              />
            </motion.div>

            <motion.div className="bp-reveal" {...reveal(0.2)}>
              <ExperienceSection experience={resumeData.experience} linkedTools={linkedTools} />
            </motion.div>

            <motion.div className="bp-reveal" {...reveal(0.25)}>
              <PersonalProjectsSection
                projects={resumeData.personalProjects}
                linkedTools={linkedTools}
              />
            </motion.div>

            <motion.section
              className="bp-reveal"
              {...reveal(0.3)}
              aria-labelledby="skills-heading"
            >
              <ResumeSectionHeading id="skills-heading" eyebrow="Skills & Tools" />
              <LabeledList items={resumeData.skills} linkedTools={resumeData.technicalProficiency} />
            </motion.section>

            {resumeData.additionalStrengths && resumeData.additionalStrengths.length > 0 ? (
              <motion.section
                className="bp-reveal"
                {...reveal(0.35)}
                aria-labelledby="strengths-heading"
              >
                <ResumeSectionHeading id="strengths-heading" eyebrow="Additional Strengths" />
                <LabeledList items={resumeData.additionalStrengths} />
              </motion.section>
            ) : null}

            <motion.section
              className="bp-reveal"
              {...reveal(0.4)}
              aria-labelledby="education-heading"
            >
              <ResumeSectionHeading id="education-heading" eyebrow="Education" />
              <EducationList education={resumeData.education} />
            </motion.section>
          </div>
        </div>

        <motion.section
          className="bp-reveal mt-20 border-t border-paper/10 pt-14"
          {...reveal(0.1)}
          aria-labelledby="case-studies-heading"
        >
          <ResumeSectionHeading id="case-studies-heading" eyebrow="Case Studies" />
          <CaseStudiesRow projects={caseStudyProjects} />
        </motion.section>
      </div>
    </div>
  );
}
