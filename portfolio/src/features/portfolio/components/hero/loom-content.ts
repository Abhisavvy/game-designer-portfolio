/**
 * Data + small pure helpers for HeroLoom (the animated hero centrepiece).
 *
 * Reads the shared portfolio content (read-only) and reshapes it into the
 * three "hand" cards and six thread colours the visual needs. Deliberately
 * self-contained: no imports from components/cards/* so HeroLoom has no
 * coupling to sibling work-in-progress files.
 */
import {
  defaultPortfolioContent,
  SKILL_THREADS,
  type ProjectItem,
  type ProjectStat,
  type SkillThreadId,
} from "@/features/portfolio/data/site-content";

/**
 * The three case studies shown in the card hand, left to right. Centre card
 * is "woven" — the thread/weaving puzzle project, which fits the hero's
 * weaving-lines motif. Habiteer and Woven are `personalProjects`; Bon Voyage
 * is a `projects` entry — `findProject` below searches both.
 */
export const LOOM_CARD_SLUGS = ["habiteer", "woven", "bon-voyage"] as const;
export type LoomCardSlug = (typeof LOOM_CARD_SLUGS)[number];

/** Six skill-thread ids in the canonical SKILL_THREADS order — one Loom thread each. */
export const THREAD_ORDER: SkillThreadId[] = SKILL_THREADS.map((t) => t.id);

/** Hex colour lookup by skill-thread id. */
export const THREAD_COLOR: Record<SkillThreadId, string> = SKILL_THREADS.reduce(
  (acc, thread) => {
    acc[thread.id] = thread.color;
    return acc;
  },
  {} as Record<SkillThreadId, string>,
);

export type LoomCardData = {
  slug: LoomCardSlug;
  title: string;
  /** Zero-padded index within whichever list (`projects`/`personalProjects`)
   *  the card was found in. Not shown on the hero cards themselves (see
   *  LoomCard — the "No. 0X" tag was dropped once Habiteer/Bon Voyage could
   *  both legitimately be "No. 01" in their own separate series, which read
   *  as duplicates side by side); kept only for parity with other card
   *  surfaces that might want it later. */
  displayIndex: string;
  stat?: ProjectStat;
  skill: SkillThreadId;
  color: string;
  /** The case-study hero poster (from `caseStudies[slug].media.hero`) —
   *  used as the hero-card artwork FALLBACK only. Never edited by this
   *  module: the case-study page keeps its own banner regardless of what
   *  the hero card shows (see `cardImageSrc`). */
  posterSrc: string;
  /** Optional hero-card-ONLY artwork override (see CARD_IMAGE_SRC below).
   *  When set, LoomCard renders THIS instead of `posterSrc` — the case
   *  study's own hero banner is untouched either way. Exists because the
   *  best image for a small collectible-card crop (a single in-app screen,
   *  legible at a glance) isn't always the best case-study banner (often a
   *  wider multi-screen collage). */
  cardImageSrc?: string;
  /** `object-position` for whichever image is actually shown
   *  (`cardImageSrc` if set, else `posterSrc`) in the hero card's (taller,
   *  ~70%-of-card-height) artwork crop. Falls back to `"center"` in
   *  LoomCard when omitted — set per-card only when the key content isn't
   *  already centred in the source image (see CARD_OBJECT_POSITION below). */
  objectPosition?: string;
  href: string;
};

/**
 * Per-card hero-ONLY artwork override — a single in-app screen instead of
 * the case study's own (multi-screen collage) hero banner, which reads
 * better at this small, cropped size. The case-study hero posters in
 * site-content are untouched; this only changes what the HERO CARD shows.
 *  - `habiteer`: the "Today" screen (780x1688, portrait) — a single
 *    legible screen instead of the 3-phone hero-app.png spread.
 *  - `woven`: a mid-solve puzzle screen (860x1864, portrait) — shows the
 *    actual grid + threads instead of the 3-phone title-card spread.
 *  - `bon-voyage` isn't listed: unchanged, still the case-study poster.
 */
const CARD_IMAGE_SRC: Partial<Record<LoomCardSlug, string>> = {
  habiteer: "/assets/habiteer/habiteer-today.png",
  woven: "/assets/woven/woven-playtest-midsolve.png",
};

/**
 * Per-card `object-position` for whichever image `CARD_IMAGE_SRC`/`posterSrc`
 * resolves to. Chosen by inspecting each image's actual content against the
 * card's art aspect ratio (roughly square on phone/desktop, wider on tablet):
 *  - `habiteer`: the Today screen is portrait and much taller than the art
 *    box, so cover crops to the box's width and shows only ~45% of the
 *    image's height — "center top" keeps the HABITEER header, coins/LVL
 *    bar, date, and the first habit cards in frame; the screen's lower
 *    (mostly repeat) cards and nav bar are what gets cropped.
 *  - `woven`: same portrait/width-constrained situation — "center top"
 *    keeps the WOVEN header + tier/level text and the full 5x5 grid with
 *    its thread in frame; the screen's empty lower half is what's cropped.
 *  - `bon-voyage`: the hero banner's "BON VOYAGE" wordmark plaque is
 *    centred horizontally but sits slightly above the image's vertical
 *    centre (a countdown pill + progress bar sit below it) — nudge up a
 *    touch so those never crowd out the logo.
 */
const CARD_OBJECT_POSITION: Partial<Record<LoomCardSlug, string>> = {
  habiteer: "center top",
  woven: "center top",
  "bon-voyage": "50% 42%",
};

/** Zero-padded 2-digit index, e.g. `1` -> "01". Mirrors the site's card convention. */
function formatIndex(n: number): string {
  return String(n).padStart(2, "0");
}

/** `#RRGGBB` -> `rgba(r, g, b, alpha)`. No alpha-channel parsing needed for this palette. */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const int = parseInt(clean, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Searches `projects` first, then `personalProjects` — the hero hand mixes cards from both. */
function findProject(slug: LoomCardSlug): { project: ProjectItem; index: number } {
  let index = defaultPortfolioContent.projects.findIndex((p) => p.slug === slug);
  if (index >= 0) {
    return { project: defaultPortfolioContent.projects[index], index };
  }
  index = defaultPortfolioContent.personalProjects.findIndex((p) => p.slug === slug);
  const project = defaultPortfolioContent.personalProjects[index];
  if (!project || index < 0) {
    throw new Error(
      `HeroLoom: project "${slug}" not found in defaultPortfolioContent.projects or .personalProjects`,
    );
  }
  return { project, index };
}

/** Builds the three card-hand data objects. Pure/deterministic — safe for render-time use. */
export function getLoomCards(): LoomCardData[] {
  return LOOM_CARD_SLUGS.map((slug) => {
    const { project, index } = findProject(slug);
    const skill = project.skills?.[0] ?? "systems";
    const study = defaultPortfolioContent.caseStudies[slug];
    const posterSrc = study?.media?.hero?.posterSrc ?? "";
    return {
      slug,
      title: project.title,
      displayIndex: formatIndex(index + 1),
      stat: project.stats?.[0],
      skill,
      color: THREAD_COLOR[skill],
      posterSrc,
      cardImageSrc: CARD_IMAGE_SRC[slug],
      objectPosition: CARD_OBJECT_POSITION[slug],
      href: project.href,
    };
  });
}
