/**
 * Default portfolio copy shaped like https://abhishek-in-a-nutshell.webflow.io/
 * Live site + /edit use PortfolioEditorProvider (localStorage).
 */

import {
  mergeCaseStudyMedia,
  type CaseStudyMedia,
} from "./case-study-media";

export type ProjectItem = {
  slug: string;
  title: string;
  tag: string;
  blurb: string;
  href: string;
  externalUrl: string;
};

export type CaseStudy = {
  title: string;
  subtitle: string;
  problem: string;
  approach: string;
  constraints: string;
  outcome: string;
  /** Optional “My contributions” block (Webflow-style). */
  contributions?: string;
  links: { label: string; href: string }[];
  /** Hero video, process gallery, optional demo clips — see `docs/portfolio-visual-media.md`. */
  media?: CaseStudyMedia;
};

export type PortfolioHero = {
  headline: string;
  subline: string;
  statPills: string[];
};

export type PortfolioAbout = {
  title: string;
  body: string;
};

export type PortfolioWorkSection = {
  eyebrow: string;
  title: string;
};

export type PortfolioFooterCta = {
  title: string;
  body: string;
};

function mergeCaseStudyRecords(
  defaults: Record<string, CaseStudy>,
  raw: Partial<Record<string, Partial<CaseStudy>>> | undefined,
): Record<string, CaseStudy> {
  const out: Record<string, CaseStudy> = { ...defaults };
  if (!raw) return out;
  for (const slug of Object.keys(out)) {
    const patch = raw[slug];
    if (!patch) continue;
    const base = out[slug];
    out[slug] = {
      ...base,
      ...patch,
      links: Array.isArray(patch.links) ? patch.links : base.links,
      media: mergeCaseStudyMedia(base.media, patch.media),
    };
  }
  return out;
}

export type PortfolioContentState = {
  siteMeta: {
    siteName: string;
    title: string;
    description: string;
    /** Link to your Webflow or other canonical portfolio (shown in footer). */
    referencePortfolioUrl?: string;
  };
  hero: PortfolioHero;
  about: PortfolioAbout;
  workSection: PortfolioWorkSection;
  footerCta: PortfolioFooterCta;
  person: {
    name: string;
    role: string;
    tagline: string;
    email: string;
    phone: string;
    location: string;
    links: {
      linkedin: string;
      resumePdf: string;
    };
  };
  projects: ProjectItem[];
  caseStudies: Record<string, CaseStudy>;
};

export function mergeWithDefaultPortfolio(
  raw: Partial<PortfolioContentState> | null | undefined,
): PortfolioContentState {
  const d = structuredClone(defaultPortfolioContent);
  if (!raw || typeof raw !== "object") return d;

  const heroMerged: PortfolioHero = {
    ...d.hero,
    ...raw.hero,
    statPills:
      raw.hero?.statPills && raw.hero.statPills.length > 0
        ? raw.hero.statPills
        : d.hero.statPills,
  };

  return {
    ...d,
    ...raw,
    siteMeta: { ...d.siteMeta, ...raw.siteMeta },
    hero: heroMerged,
    about: { ...d.about, ...raw.about },
    workSection: { ...d.workSection, ...raw.workSection },
    footerCta: { ...d.footerCta, ...raw.footerCta },
    person: {
      ...d.person,
      ...raw.person,
      links: { ...d.person.links, ...raw.person?.links },
    },
    projects:
      Array.isArray(raw.projects) && raw.projects.length > 0
        ? raw.projects
        : d.projects,
    caseStudies: mergeCaseStudyRecords(d.caseStudies, raw.caseStudies),
  };
}

/** Defaults aligned with Abhishek’s Webflow portfolio (you can edit in /edit). */
export const defaultPortfolioContent: PortfolioContentState = {
  siteMeta: {
    siteName: "Abhishek Dutta - Systems Designer",
    title: "Abhishek — Systems & Feature Designer | LiveOps Expert",
    description:
      "Systems & Feature Designer specializing in LiveOps, retention mechanics, and economy design. 3+ years driving measurable impact through data-driven mobile game design.",
    referencePortfolioUrl: "https://abhishek-in-a-nutshell.webflow.io/",
  },
  hero: {
    headline: "Building Systems That Keep Players Engaged",
    subline:
      "I design retention mechanics, LiveOps events, and economy systems for mobile games. At Word Roll, I've grown DAU from 4k to 40k+ through targeted feature design and data-driven optimization.",
    statPills: [
      "Data driven",
      "Mobile First Approach",
      "25+ Features shipped",
    ],
  },
  about: {
    title: "How I Approach Systems Design",
    body:
      "I'm a mobile game designer with 3+ years of experience building engaging word games and PvP experiences. On Word Roll, I focus on FTUEs, event infrastructure, player economies, retention and engagement mechanics, and the balance that keeps casual games fun.\n\nI care about how games create “just one more round” moments — player psychology as much as mechanics.",
  },
  workSection: {
    eyebrow: "Featured Work",
    title: "Systems I've Built at Word Roll",
  },
  footerCta: {
    title: "Let’s build the next hit game",
    body:
      "Have a mobile game idea or want to collaborate? Reach out — I’m happy to chat about process, portfolio, or design.",
  },
  person: {
    name: "Abhishek Dutta",
    role: "Systems & Feature Designer | LiveOps Expert",
    tagline:
      "Driving engagement through data-driven systems design · LiveOps · Economy · Retention mechanics that convert",
    email: "abhishek.dt.97@gmail.com",
    phone: "+91-7980700802",
    location: "Available worldwide · remote-friendly",
    links: {
      linkedin: "https://linkedin.com/in/abhishek-dt97",
      resumePdf: "",
    },
  },
  projects: [
    {
      slug: "food-fiesta",
      title: "Food Fiesta",
      tag: "Feature design · Live event",
      blurb:
        "Cross-mode event tying the core loop together — lifted engagement 3% and ARPDAU 22%.",
      href: "/work/food-fiesta",
      externalUrl: "",
    },
    {
      slug: "ai-innovation",
      title: "AI & Innovation",
      tag: "Productivity Tools · AI Integration",
      blurb:
        "Built AI-assisted Spec Maker and Meeting Manager tools — 25% documentation efficiency, 40% faster sprint planning.",
      href: "/work/ai-innovation",
      externalUrl: "",
    },
    {
      slug: "kinoa-integration",
      title: "Kinoa SDK Integration",
      tag: "LiveOps Platform",
      blurb:
        "Seamless SDK integration with optimized event flows for enhanced player engagement.",
      href: "/work/kinoa-integration",
      externalUrl: "",
    },
    {
      slug: "wotd",
      title: "Word of the Day (WOTD)",
      tag: "Feature optimization",
      blurb:
        "Made WOTD interactive and learning-oriented — D1 rolling retention +140 bps, engagement +3%.",
      href: "/work/wotd",
      externalUrl: "",
    },
    {
      slug: "ticket-mania",
      title: "Ticket Mania",
      tag: "Feature optimization · Leaderboard",
      blurb:
        "Active leaderboard loop with tickets and feedback — engagement +3%, D1 retention +300 bps, ~10% LTV lift.",
      href: "/work/ticket-mania",
      externalUrl: "",
    },
    {
      slug: "tiles",
      title: "Tiles",
      tag: "Rewards · Economy",
      blurb:
        "Cosmetic reward system beyond coins — economy de-risking and stronger ownership.",
      href: "/work/tiles",
      externalUrl: "",
    },
  ],
  caseStudies: {
    "food-fiesta": {
      title: "Food Fiesta",
      subtitle: "Feature design · Word Roll",
      problem:
        "Players were moving from high-engagement buckets to low-engagement buckets within cohorts. The decline correlated with behavioral narrowing — players sticking to preferred modes only.",
      approach:
        "1. Build an event that ties all game modes back to the core word-making loop.\n2. Double down on core mechanics so players optimize how they form words.\n3. Target highly engaged players (~31% of DAU) who had exhausted daily play.",
      constraints:
        "Live mobile title, multi-mode audience, economy and event scheduling with product and live-ops.",
      outcome:
        "Overall engagement +3%. ARPDAU +22%.",
      contributions:
        "1. Designed event infrastructure for Food Fiesta so future events could plug in smoothly.\n2. Introduced new cosmetic rewards to reduce inflation and strengthen sinks.\n3. Defined task structures and balanced rewards across levels for progression and retention.",
      links: [],
      media: {
        hero: {
          posterSrc: "/assets/food-fiesta/poster.svg",
        },
        processGallery: {
          groupId: "food-fiesta-process",
          heading: "Design process",
          items: [
            {
              thumb: "/assets/food-fiesta/gallery-wireframe.svg",
              full: "/assets/food-fiesta/gallery-wireframe.svg",
              alt: "Wireframe and flow notes for cross-mode event tasks",
              label: "Wireframes",
            },
            {
              thumb: "/assets/food-fiesta/gallery-ui.svg",
              full: "/assets/food-fiesta/gallery-ui.svg",
              alt: "UI mockups for Food Fiesta progression and rewards",
              label: "UI",
            },
            {
              thumb: "/assets/food-fiesta/gallery-analytics.svg",
              full: "/assets/food-fiesta/gallery-analytics.svg",
              alt: "Engagement and economy readouts used to validate the event",
              label: "Results",
            },
          ],
        },
      },
    },
    "bon-voyage": {
      title: "Bon Voyage",
      subtitle: "Feature design · Word Roll",
      problem:
        "Limited long-term progression and uneven economy design were holding retention versus competitors.",
      approach:
        "1. Long-running event as the primary reward source.\n2. Pace rewards to control progression and economy.\n3. Focus later-cohort players with shorter sessions.",
      constraints:
        "Economy de-risking, long-horizon balancing, coordination with product and analytics.",
      outcome:
        "Later-cohort LTV +4%, driven in part by IAP +12%.",
      contributions:
        "1. Designed Bon Voyage event infrastructure for repeatable live ops.\n2. Defined level progression and reward curves to improve progression while de-risking the economy.",
      links: [],
      media: {
        processGallery: {
          groupId: "bon-voyage-process",
          heading: "Design process",
          items: [
            {
              thumb: "/assets/bon-voyage/gallery-progression.svg",
              full: "/assets/bon-voyage/gallery-progression.svg",
              alt: "Long-horizon progression sketch for Bon Voyage",
              label: "Progression",
            },
            {
              thumb: "/assets/bon-voyage/gallery-economy.svg",
              full: "/assets/bon-voyage/gallery-economy.svg",
              alt: "Economy pacing notes tied to reward sources",
              label: "Economy",
            },
          ],
        },
        showcases: [
          {
            id: "bon-voyage-demo",
            posterSrc: "/assets/bon-voyage/showcase-poster.svg",
            playLabel: "Watch demo",
            ariaLabel: "Play Bon Voyage demonstration video",
          },
        ],
      },
    },
    "ai-innovation": {
      title: "AI & Innovation",
      subtitle: "Productivity Tools · Development Team",
      problem:
        "Manual documentation and meeting processes were creating bottlenecks for our 8-person development team, with feature specification writing taking excessive time and sprint planning sessions becoming inefficient.",
      approach:
        "1. Built AI-assisted Spec Maker and Meeting Manager tools using Cursor AI.\n2. Integrated tools into existing development workflows without disrupting established processes.\n3. Established these tools as standard workflow across entire development team.",
      constraints:
        "Team adoption challenges, workflow integration complexity, maintaining documentation accuracy standards.",
      outcome:
        "25% improvement in documentation efficiency, 40% faster sprint planning, established productivity culture that became team standard.",
      contributions:
        "1. Conceptualized and developed both AI productivity tools from initial problem identification to full team deployment.\n2. Integrated Cursor AI effectively into existing development workflows.\n3. Drove team adoption by demonstrating clear efficiency gains and providing comprehensive training.\n4. Established productivity culture that influenced broader organizational approach to workflow optimization.",
      links: [],
      media: {
        hero: {
          posterSrc: "/assets/ai-innovation/poster.svg",
        },
        processGallery: {
          groupId: "ai-innovation-process",
          heading: "Development process",
          items: [
            {
              thumb: "/assets/ai-innovation/gallery-spec-maker.svg",
              full: "/assets/ai-innovation/gallery-spec-maker.svg",
              alt: "AI-assisted Spec Maker tool interface",
              label: "Spec Maker Tool",
            },
            {
              thumb: "/assets/ai-innovation/gallery-meeting-manager.svg",
              full: "/assets/ai-innovation/gallery-meeting-manager.svg",
              alt: "Meeting Manager workflow optimization",
              label: "Meeting Manager",
            },
          ],
        },
      },
    },
    "kinoa-integration": {
      title: "Kinoa LiveOps Integration",
      subtitle: "LiveOps Platform · SDK Integration",
      problem:
        "Need for comprehensive LiveOps platform integration to enhance player engagement and monetization capabilities through advanced event management and player analytics.",
      approach:
        "1. Created comprehensive design document for seamless Kinoa SDK integration.\n2. Set up LiveOps features through flows and in-app configurations.\n3. Tested various events and made real-time optimizations for player engagement.",
      constraints:
        "SDK integration complexity, existing codebase compatibility, event testing and optimization timelines.",
      outcome:
        "Successfully integrated Kinoa platform enabling advanced LiveOps capabilities and optimized monetization strategies through data-driven event management.",
      contributions:
        "1. Designed and documented complete integration strategy for development team.\n2. Configured LiveOps flows and in-app features according to game requirements.\n3. Conducted comprehensive event testing and iterative optimization.\n4. Established data-driven approach to event management and player engagement optimization.",
      links: [],
      media: {
        hero: {
          posterSrc: "/assets/kinoa-integration/poster.svg",
        },
        processGallery: {
          groupId: "kinoa-integration-process",
          heading: "Integration process",
          items: [
            {
              thumb: "/assets/kinoa-integration/gallery-design-doc.svg",
              full: "/assets/kinoa-integration/gallery-design-doc.svg",
              alt: "Kinoa SDK integration design document",
              label: "Design Document",
            },
            {
              thumb: "/assets/kinoa-integration/gallery-liveops-flows.svg",
              full: "/assets/kinoa-integration/gallery-liveops-flows.svg",
              alt: "LiveOps event flows and configurations",
              label: "LiveOps Flows",
            },
          ],
        },
      },
    },
    wotd: {
      title: "Word of the Day (WOTD)",
      subtitle: "Feature optimization · Word Roll",
      problem:
        "WOTD was non-interactive with weak CTRs.",
      approach:
        "1. Players collect WOTD letters while forming words.\n2. After collecting all letters they can play the WOTD directly.\n3. After use, the game reveals the word’s meaning.",
      constraints:
        "UX clarity, session fit, collaboration with UX and engineering.",
      outcome:
        "D1 rolling retention +140 bps; engagement +3%.",
      contributions:
        "1. Concepted the mechanic.\n2. Built the daily WOTD list with meanings.\n3. Partnered with UX on flows.",
      links: [],
    },
    "ticket-mania": {
      title: "Ticket Mania",
      subtitle: "Feature optimization · Word Roll",
      problem:
        "Players engaged with leaderboard events too passively.",
      approach:
        "1. Complete rows and collect tickets while forming words.\n2. Clear feedback each time a ticket is earned.",
      constraints:
        "Fairness, leaderboard bucketing, UX for feedback density.",
      outcome:
        "Engagement +3%, D1 retention +300 bps, ~10% LTV impact.",
      contributions:
        "1. Concepted the mechanic.\n2. Worked with PMs on assign and bucketing logic.\n3. Partnered with UX on flows.",
      links: [],
    },
    tiles: {
      title: "Tiles",
      subtitle: "Rewards · Economy · Word Roll",
      problem:
        "Rewards were almost entirely coin-based, limiting economy levers.",
      approach:
        "1. Introduce tiles as a cosmetic reward.\n2. De-risk a coin-only economy and support IAP context.\n3. Build a sense of ownership beyond currency.",
      constraints:
        "Gacha fairness, event exclusivity, tooling (e.g. Machinations) for tuning.",
      outcome:
        "Created room to de-risk IAP and diversify rewards.",
      contributions:
        "1. Built a tile gacha with Machinations.\n2. Implemented event-specific tile drops for exclusivity.",
      links: [],
      media: {
        processGallery: {
          groupId: "tiles-process",
          heading: "Systems & tooling",
          items: [
            {
              thumb: "/assets/word-roll/gallery-machinations.svg",
              full: "/assets/word-roll/gallery-machinations.svg",
              alt: "Machinations-style economy diagram placeholder for tile gacha tuning",
              label: "Model",
            },
            {
              thumb: "/assets/word-roll/gallery-rewards.svg",
              full: "/assets/word-roll/gallery-rewards.svg",
              alt: "Reward structure notes for tiles versus coin sinks",
              label: "Rewards",
            },
          ],
        },
      },
    },
  },
};

export function cloneDefaultPortfolioContent(): PortfolioContentState {
  return structuredClone(defaultPortfolioContent);
}

export const caseStudySlugs = Object.keys(defaultPortfolioContent.caseStudies);

export type { CaseStudyMedia } from "./case-study-media";
