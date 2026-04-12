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
      slug: "bon-voyage",
      title: "Bon Voyage",
      tag: "Long-term Retention · Economy",
      blurb:
        "60-day seasonal event with secondary currency — IAP rev/DAU +12%, D1RR +22 bps, session time +1.4%.",
      href: "/work/bon-voyage",
      externalUrl: "",
    },
    {
      slug: "food-fiesta",
      title: "Food Fiesta",
      tag: "Cross-mode Event",
      blurb:
        "Cross-mode event tying all game modes via bonus tiles — engagement +7.5% in D7+, rolling retention +50 bps.",
      href: "/work/food-fiesta",
      externalUrl: "",
    },
    {
      slug: "tiles",
      title: "Tiles",
      tag: "Cosmetic System · Economy",
      blurb:
        "First cosmetic reward system with Machinations-tuned gacha — payer spend +1200 coins, IAP conversion lift.",
      href: "/work/tiles",
      externalUrl: "",
    },
    {
      slug: "ticket-mania",
      title: "Ticket Mania",
      tag: "Leaderboard · Monetization",
      blurb:
        "Ticket-based leaderboard driving swap usage and payer conversion — rev/DAU +7%, D1RR +170 bps, D7 LTV +10%.",
      href: "/work/ticket-mania",
      externalUrl: "",
    },
    {
      slug: "wotd",
      title: "Word of the Day (WOTD)",
      tag: "Feature Optimization",
      blurb:
        "Two-step interactive WOTD mechanic — D30 LTV +9.4%, D1RR +73 bps, engagement +0.63 moves/DAU.",
      href: "/work/wotd",
      externalUrl: "",
    },
    {
      slug: "ai-innovation",
      title: "AI & Innovation",
      tag: "Productivity Tools · AI",
      blurb:
        "Meeting Note Taker and Feature Spec Dashboard — structured meeting output to spec-ready content, eliminating manual bifurcation.",
      href: "/work/ai-innovation",
      externalUrl: "",
    },
    {
      slug: "kinoa-integration",
      title: "Kinoa LiveOps Integration",
      tag: "LiveOps Platform",
      blurb:
        "Seamless SDK integration with optimized event flows for enhanced player engagement.",
      href: "/work/kinoa-integration",
      externalUrl: "",
    },
  ],
  caseStudies: {
    "bon-voyage": {
      title: "Bon Voyage",
      subtitle: "Long-term Retention · Economy Design · Word Roll",
      problem:
        "Two core gaps: (1) Long-term retention — a delta in D30/D1 ratio vs. competitors with long-horizon events. (2) Economy — coins were the only currency with many tap sources but few sinks, causing inflation over time.",
      approach:
        "1. Designed a 60-day event (Mon–Sat) with 60 levels, gated by keys earned from game completions.\n2. Introduced gems as a secondary event currency to delay coin grants on game over, de-risking the coin economy.\n3. Tuned progression so keys required per level matched expected play patterns across player deciles (P4–P8 target).",
      constraints:
        "Live mobile title with existing economy. Secondary currency had to feel natural, not punitive. 60-day horizon required careful pacing to avoid early burnout or late-stage drop-off. Solo series engagement had to be monitored for cannibalization.",
      outcome:
        "IAP rev/DAU +12% (100% confidence). D1RR +22 bps (99.8% confidence). Session time/user +1.4% (100% confidence). Net rev/DAU +1.8% (100% confidence). D50 LTV +3.6% (80% confidence). D30 new payer conversion +7 bps. Repeat payer purchases +3.2%, amount/purchase +8.6%. Non-payer wallet reduced 16% (intended economy de-risking). Event completion: 7% vs. 9% target — identified progression pacing as key tuning lever for future iterations.",
      contributions:
        "1. Designed the full 60-level progression curve, balancing key requirements against expected play frequency.\n2. Introduced gems as secondary currency — first non-coin currency in the game — to address inflation.\n3. Analyzed solo series cannibalization (4.1% engagement drop) and identified keys-earned differential as root cause.\n4. Validated FTUE CTR improvement (+190 bps) driven by gems FTUE flow.\n5. Monitored player decile engagement — found upsides across all deciles, not just P4–P8 target.",
      links: [],
      media: {
        hero: {
          posterSrc: "/assets/bon-voyage/poster.svg",
        },
        processGallery: {
          groupId: "bon-voyage-process",
          heading: "Design process",
          items: [
            {
              thumb: "/assets/bon-voyage/gallery-progression.svg",
              full: "/assets/bon-voyage/gallery-progression.svg",
              alt: "60-level progression curve and key requirements",
              label: "Progression",
            },
            {
              thumb: "/assets/bon-voyage/gallery-economy.svg",
              full: "/assets/bon-voyage/gallery-economy.svg",
              alt: "Gems economy design and coin de-risking model",
              label: "Economy",
            },
            {
              thumb: "/assets/bon-voyage/gallery-results.svg",
              full: "/assets/bon-voyage/gallery-results.svg",
              alt: "A/B test results dashboard showing IAP and retention lifts",
              label: "Results",
            },
          ],
        },
      },
    },
    "food-fiesta": {
      title: "Food Fiesta",
      subtitle: "Cross-mode Event · Word Roll",
      problem:
        "Players in later cohorts narrowed to a single preferred game mode, dropping into low-engagement buckets. Non-leaderboard days had a 1–2 move gap with no compelling content.",
      approach:
        "1. Built a Mon–Sat event tying all game modes together via DW/TW bonus tiles on the last letter of the gameboard.\n2. Gated event unlock at lifetime 150 moves or D7+ cohort to target the right player segment.\n3. Designed progression levels unlocked by bonus tile collection, expected to drive power-up usage.",
      constraints:
        "Pre-allocation bias of ~3% in experiment setup. Multi-mode balance — had to ensure no single mode was disproportionately rewarded. Live mobile title coordination with existing events.",
      outcome:
        "Engagement +7.5% (~2.4 moves) in D7+ cohort. Rolling retention +50 bps in D7+ (96% confidence). Power-up usage +26%, bingo rate +55 bps. High-engagement bucket (30+ moves) share +200 bps. IT ad impressions +7%, banner +8%. Controlled for ~3% pre-allocation bias — early cohort D1 retention signals attributed to experiment setup, not feature impact.",
      contributions:
        "1. Designed the cross-mode event structure with DW/TW bonus tile mechanic.\n2. Defined task structures and balanced rewards across progression levels.\n3. Analyzed engagement uplift across all game modes and identified Monday/Tuesday as peak event days.\n4. Monitored early-cohort retention signals and validated experiment bias attribution.",
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
              alt: "UI mockups for Food Fiesta progression",
              label: "UI",
            },
            {
              thumb: "/assets/food-fiesta/gallery-analytics.svg",
              full: "/assets/food-fiesta/gallery-analytics.svg",
              alt: "Cross-mode engagement analysis",
              label: "Results",
            },
          ],
        },
      },
    },
    tiles: {
      title: "Tiles",
      subtitle: "Cosmetic System · Economy Design · Word Roll",
      problem:
        "Rewards were entirely coin-based, limiting economy levers and player expression. No cosmetic systems existed to create meaningful sinks beyond coins or drive aspirational engagement.",
      approach:
        "1. Designed tile skins as the first cosmetic reward system in Word Roll — creating ownership and expression beyond functional upgrades.\n2. Built gacha-style acquisition system using Machinations for probability tuning and economy modeling.\n3. Integrated cosmetics as rewards for Food Fiesta event progression to drive cross-mode engagement.\n4. Designed rarity tiers and visual differentiation to create collection goals.",
      constraints:
        "First cosmetic system in the game — had to establish visual language and player expectations. Economy de-risking with cosmetics had to feel like genuine ownership, not coin replacement. Gacha mechanics required careful probability tuning for player satisfaction vs. monetization.",
      outcome:
        "Rev/DAU +22% (+8 cents) driven by IAP +100% (+6 cents) and ad rev +5% (+2 cents). Payer (earn–spend)/DAU decreased by ~1,200 coins, driving IAP upsides. Established cosmetic system foundation for future content expansions. Player feedback: high satisfaction with tile customization and collection mechanics.",
      contributions:
        "1. Introduced tile skins as first-ever cosmetic reward system in Word Roll.\n2. Designed gacha acquisition system with Machinations-tuned probability curves.\n3. Created rarity tiers and visual design language for cosmetic differentiation.\n4. Integrated cosmetics into Food Fiesta event as aspirational rewards.\n5. Established cosmetic system architecture for future expansions (character skins, board themes, etc.).",
      links: [],
      media: {
        hero: {
          posterSrc: "/assets/tiles/poster.svg",
        },
        processGallery: {
          groupId: "tiles-process",
          heading: "Design process",
          items: [
            {
              thumb: "/assets/tiles/gallery-cosmetic-system.svg",
              full: "/assets/tiles/gallery-cosmetic-system.svg",
              alt: "Cosmetic system architecture and rarity tiers",
              label: "System Design",
            },
            {
              thumb: "/assets/tiles/gallery-gacha-economy.svg",
              full: "/assets/tiles/gallery-gacha-economy.svg",
              alt: "Machinations model for gacha probability tuning",
              label: "Economy Model",
            },
            {
              thumb: "/assets/tiles/gallery-visual-design.svg",
              full: "/assets/tiles/gallery-visual-design.svg",
              alt: "Tile skin visual design and rarity differentiation",
              label: "Visual Design",
            },
          ],
        },
      },
    },
    "ai-innovation": {
      title: "AI & Innovation",
      subtitle: "Productivity Tools · Feature Spec Pipeline",
      problem:
        "Unstructured meeting output created bottlenecks: manual bifurcation of decisions vs. specs vs. stakeholder updates. Context was lost when team members joined later in pre-production. Duplicate work — same content rewritten for email, specs, and presentations.",
      approach:
        "1. Built Feature Spec Dashboard — ingests Granola meeting notes, bifurcates into structured sections (problem statements, vision, goals, flows), and produces mail-ready and spec-ready output.\n2. Built Spec Maker — takes structured input from the Dashboard (or raw notes) and generates complete spec documents in markdown.\n3. Template-driven extraction ensures output aligns with standard section headers so Spec Maker doesn't have to infer structure.",
      constraints:
        "Team adoption across 8-person dev team. Meeting note quality varies by source. Spec template had to be flexible enough for different feature types while maintaining consistent structure.",
      outcome:
        "Single source of truth from meetings — one extraction feeds both email and spec pipeline. Consistent structure across all specs. Reduced time from meeting completion to spec-ready data with minimal manual reformatting. Adopted as team standard workflow.",
      contributions:
        "1. Identified the meeting-to-spec pipeline gap and designed the two-tool architecture (Dashboard → Spec Maker).\n2. Built Feature Spec Dashboard with Granola integration, data bifurcation, and mail/spec output.\n3. Designed template-driven extraction aligned to standard spec sections.\n4. Built Spec Maker for structured-input-to-full-spec generation.\n5. Drove team adoption and established as standard workflow across development team.",
      links: [
        { label: "Feature Spec Dashboard", url: "https://abhishekdutta1-project.vercel.app/" },
      ],
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
              alt: "Feature Spec Dashboard — meeting notes to structured output",
              label: "Spec Dashboard",
            },
            {
              thumb: "/assets/ai-innovation/gallery-meeting-manager.svg",
              full: "/assets/ai-innovation/gallery-meeting-manager.svg",
              alt: "Spec Maker — structured input to full spec document",
              label: "Spec Maker",
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
      subtitle: "Leaderboard Redesign · Monetization · Word Roll",
      problem:
        "Players engaged with leaderboard events too passively. The existing leaderboard mechanic lacked a compelling collection loop, and booster monetization was underperforming.",
      approach:
        "1. Designed a ticket-collection mechanic on classic games — players fill rows on the gameboard to earn tickets.\n2. Tickets feed into a leaderboard where top players receive rewards.\n3. Increased swap usage by creating natural demand through ticket collection pressure.\n4. Redesigned leaderboard intro CTA to drive instant bot game starts.",
      constraints:
        "Fairness in leaderboard bucketing. Bot chase logic imported from control was suboptimal for new mechanic. FTUE landed on leaderboard screen (navigational dead end). Booster price-to-reward conflict with swap pricing.",
      outcome:
        "Rev/DAU +7% (~3 cents, 100% confidence) primarily from IAP. D7 LTV +10% (75% confidence). D30 LTdays +9% (+0.45 days, 91% confidence). D1RR for D2+ organic +170 bps (99% confidence). D1R for organic +300 bps (95% confidence). Rolling retention +50 bps (high confidence). Engagement (starts/play/end per DAU) +3% (100% confidence). Swap spend +100 coins/DAU, (earn–spend) shifted from +50 to −5 coins. D7 payer conversion +55 bps (93% confidence).",
      contributions:
        "1. Designed the ticket-collection mechanic and gameboard integration.\n2. Analyzed booster purchase decline — identified LB screen top-of-funnel drop and swap pricing conflict as root causes.\n3. Identified FTUE navigational dead-end issue and proposed optimization.\n4. Flagged bot chase logic as suboptimal for new mechanic — proposed future iteration.\n5. Drove decision to ramp variant to 100% based on strong IAP and retention signals.",
      links: [],
    },
    tiles: {
      title: "Tiles (Cosmetic Rewards)",
      subtitle: "Economy Design · Cosmetic System · Word Roll",
      problem:
        "Rewards were entirely coin-based, limiting economy levers. No cosmetic layer existed to create ownership or drive non-currency engagement.",
      approach:
        "1. Introduced tile skins as the first cosmetic reward in Word Roll.\n2. Designed tile drops tied to Food Fiesta event progression.\n3. Used Machinations to model gacha fairness and event-specific exclusivity.\n4. Created sinks beyond coins to de-risk the coin economy and support IAP context.",
      constraints:
        "Gacha fairness perception. Event exclusivity had to feel rewarding, not punitive. Machinations tooling for economy tuning. Cosmetics had to complement, not replace, existing coin rewards.",
      outcome:
        "Part of the Food Fiesta results: payer (earn–spend) decreased by ~1,200 coins driving IAP upsides. Created genuine ownership layer beyond currency. Enabled future cosmetic expansion.",
      contributions:
        "1. Designed the tile cosmetic system and gacha mechanics using Machinations.\n2. Implemented event-specific tile drops for exclusivity and progression incentives.\n3. Balanced cosmetic rewards against existing coin economy to avoid cannibalization.",
      links: [],
      media: {
        processGallery: {
          groupId: "tiles-process",
          heading: "Systems & tooling",
          items: [
            {
              thumb: "/assets/word-roll/gallery-machinations.svg",
              full: "/assets/word-roll/gallery-machinations.svg",
              alt: "Machinations economy diagram for tile gacha tuning",
              label: "Model",
            },
            {
              thumb: "/assets/word-roll/gallery-rewards.svg",
              full: "/assets/word-roll/gallery-rewards.svg",
              alt: "Reward structure for tiles versus coin sinks",
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
