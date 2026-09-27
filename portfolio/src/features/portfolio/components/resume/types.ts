/**
 * Typed shape for `src/features/portfolio/data/resume.json` — the single
 * source of truth shared by the /resume web page and the generated PDF
 * (see `portfolio/scripts/resume-template.mjs` and
 * `portfolio/scripts/build-resume-pdf.mjs`).
 *
 * Every string in the JSON file is copied verbatim from the resume; nothing
 * here should ever be invented or edited independently of that source data.
 */

/** A label paired with the URL it links to (e.g. LinkedIn, portfolio site). */
export interface ResumeLink {
  label: string;
  href: string;
}

export interface ResumeBasics {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: ResumeLink;
  portfolioUrl: ResumeLink;
  location: string;
}

/** One "What I Focus On" bullet: a bold label followed by supporting text. */
export interface ResumeFocusItem {
  label: string;
  text: string;
}

/**
 * One tool-name entry. `href` is only set for tools that link out (Kinoa.io,
 * Data.ai). Not rendered as its own section any more (see `skills` for the
 * visible "Skills & Tools" section) — this list exists purely so achievement/
 * focus/experience/project prose can auto-link an exact tool-name mention
 * (see `getLinkedTools` in resumeData.ts and `linkifyText`/`linkifyTools`).
 */
export interface ResumeToolItem {
  name: string;
  href?: string;
}

/**
 * One Key Achievements entry. `title` and `year` are rendered together as
 * "{title} {year}". `year` is optional: some case studies (Bon Voyage,
 * Tiles, Kinoa) have no approved year, so it's omitted rather than invented.
 * `bullets` covers the problem it solved, what I did, and the results —
 * typically 2-4 short lines. `stat` is the one headline number called out
 * next to the title (website only; the PDF doesn't render it) — an explicit
 * value+label pair rather than something extracted from `bullets`, so it
 * always reads as a labelled figure, never a bare, ambiguous percentage.
 */
export interface ResumeAchievement {
  title: string;
  year?: string;
  bullets: string[];
  stat?: {
    /** The figure itself, e.g. "+12%" or "7 days → 1 hour". Rendered via CountUp when it starts with a number. */
    value: string;
    /** What the figure measures, e.g. "IAP revenue per user". Rendered directly beneath (desktop) or after (mobile) the value. */
    label: string;
  };
}

/** One Professional Experience entry. `dates` and `duration` render as "{dates} ({duration})". */
export interface ResumeExperience {
  role: string;
  company: string;
  dates: string;
  duration: string;
  bullets: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  years: string;
}

/** One "Additional Strengths" bullet: a bold label followed by supporting text. */
export interface ResumeAdditionalStrength {
  label: string;
  text: string;
}

/**
 * One Personal Projects entry (Habiteer, XFactor, Woven, ...). `link` is the
 * external URL (GitHub repo or a live playtest); `caseStudy` is the internal
 * /work/<slug> path the website links to. The PDF only renders `link`; the
 * website renders both.
 */
export interface ResumePersonalProject {
  title: string;
  year: string;
  text: string;
  link: ResumeLink;
  caseStudy: string;
}

export interface ResumeData {
  basics: ResumeBasics;
  summary: string;
  focus: ResumeFocusItem[];
  technicalProficiency: ResumeToolItem[];
  /** "Skills & Tools": grouped lines (label + comma-separated items), e.g. Design/Data/Tools/AI and build. */
  skills: ResumeFocusItem[];
  achievements: ResumeAchievement[];
  experience: ResumeExperience[];
  personalProjects?: ResumePersonalProject[];
  education: ResumeEducation[];
  /** Optional: dropped entirely when there's no room on the printed page. */
  additionalStrengths?: ResumeAdditionalStrength[];
}
