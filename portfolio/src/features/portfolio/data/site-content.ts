/**
 * Default portfolio content for the Next.js site.
 * Live site + /edit use PortfolioEditorProvider (localStorage).
 */
import { mergeCaseStudyMedia, type CaseStudyMedia, } from "./case-study-media";
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
    /** Optional “My contributions” block . */
    contributions?: string;
    links: {
        label: string;
        href: string;
    }[];
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
function mergeCaseStudyRecords(defaults: Record<string, CaseStudy>, raw: Partial<Record<string, Partial<CaseStudy>>> | undefined): Record<string, CaseStudy> {
    const out: Record<string, CaseStudy> = { ...defaults };
    if (!raw)
        return out;
    for (const slug of Object.keys(out)) {
        const patch = raw[slug];
        if (!patch)
            continue;
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
        /** Link to other canonical portfolio (shown in footer). */
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
export function mergeWithDefaultPortfolio(raw: Partial<PortfolioContentState> | null | undefined): PortfolioContentState {
    const d = structuredClone(defaultPortfolioContent);
    if (!raw || typeof raw !== "object")
        return d;
    const heroMerged: PortfolioHero = {
        ...d.hero,
        ...raw.hero,
        statPills: raw.hero?.statPills && raw.hero.statPills.length > 0
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
        projects: Array.isArray(raw.projects) && raw.projects.length > 0
            ? raw.projects
            : d.projects,
        caseStudies: mergeCaseStudyRecords(d.caseStudies, raw.caseStudies),
    };
}
/** Default portfolio content (you can edit in /edit). */
export const defaultPortfolioContent: PortfolioContentState = {
    siteMeta: {
        siteName: "Abhishek Dutta - Systems Designer",
        title: "Abhishek — Systems & Feature Designer | LiveOps Expert",
        description: "Systems & Feature Designer specializing in LiveOps, retention mechanics, and economy design. 3+ years driving measurable impact through data-driven mobile game design.",
    },
    hero: {
        headline: "Building Systems That Keep Players Engaged",
        subline: "I design retention mechanics, LiveOps events, and economy systems for mobile games. At Word Roll, I've grown DAU from 4k to 40k+ through targeted feature design and data-driven optimization.",
        statPills: [
            "Data driven",
            "Mobile First Approach",
            "25+ Features shipped",
        ],
    },
    about: {
        title: "How I Approach Systems Design",
        body: ""
    },
    workSection: {
        eyebrow: "Featured Work",
        title: "Game Systems That Drive Results",
    },
    footerCta: {
        title: "Let’s build the next hit game",
        body: "Have a mobile game idea or want to collaborate? Reach out — I’m happy to chat about process, portfolio, or design.",
    },
    person: {
        name: "Abhishek Dutta",
        role: "Game Designer & AI Tools Developer",
        tagline: "Game designer who ships AI/tools work when relevant",
        email: "test@example.com",
        phone: "+1234567890",
        location: "Remote",
        links: {
            linkedin: "https://linkedin.com/in/test",
            resumePdf: ""
        }
    },
    projects: [
        {
            slug: "bon-voyage",
            title: "Bon Voyage",
            tag: "Long-term Retention \u00B7 Economy Design",
            blurb: "60-day seasonal event with gems secondary currency. Drove IAP revenue +12%, D1 retention +22 bps, session time +1.4%.",
            href: "/work/bon-voyage",
            externalUrl: ""
        },
        {
            slug: "food-fiesta",
            title: "Food Fiesta",
            tag: "Cross-mode Events · Engagement",
            blurb: "Cross-mode event connecting all game modes via bonus tile collection. Achieved engagement +7.5% in D7+ cohorts, rolling retention +50 bps.",
            href: "/work/food-fiesta",
            externalUrl: "",
        },
        {
            slug: "tiles",
            title: "Tiles",
            tag: "Cosmetic Systems · Gacha Design",
            blurb: "First cosmetic reward system with Machinations-tuned gacha mechanics. Generated payer spend +1,200 coins, significant IAP conversion lift.",
            href: "/work/tiles",
            externalUrl: "",
        },
        {
            slug: "ticket-mania",
            title: "Ticket Mania",
            tag: "Leaderboards · Monetization",
            blurb: "Ticket collection leaderboard driving swap usage and payer conversion. Delivered revenue +7%, D1 retention +170 bps, D7 LTV +10%.",
            href: "/work/ticket-mania",
            externalUrl: "",
        },
        {
            slug: "wotd",
            title: "Word of the Day",
            tag: "Feature Optimization · Engagement",
            blurb: "Two-step interactive WOTD mechanic with letter collection and gameplay integration. Achieved D30 LTV +9.4%, D1 retention +73 bps, engagement +0.63 moves/DAU.",
            href: "/work/wotd",
            externalUrl: "",
        },
        {
            slug: "ai-innovation",
            title: "AI & Innovation",
            tag: "Productivity Tools · Workflow Automation",
            blurb: "Feature Spec Dashboard + Spec Maker pipeline automating meeting note bifurcation to production-ready documentation. Eliminated manual reformatting across 8-person dev team.",
            href: "/work/ai-innovation",
            externalUrl: "",
        },
        {
            slug: "kinoa-integration",
            title: "Kinoa LiveOps Integration",
            tag: "Platform Integration · LiveOps",
            blurb: "Seamless SDK integration with optimized event configuration flows. Enhanced LiveOps capabilities for real-time player engagement and event management.",
            href: "/work/kinoa-integration",
            externalUrl: "",
        }
    ],
    caseStudies: {
        "bon-voyage": {
            title: "Bon Voyage",
            subtitle: "Long-term Retention · Economy Design · Word Roll",
            problem: "Two core gaps: (1) Long-term retention — a delta in D30/D1 ratio vs. competitors with long-horizon events. (2) Economy — coins were the only currency with many tap sources but few sinks, causing inflation over time.",
            approach: "1. Designed a 60-day event (Mon–Sat) with 60 levels, gated by keys earned from game completions.\n2. Introduced gems as a secondary event currency to delay coin grants on game over, de-risking the coin economy.\n3. Tuned progression so keys required per level matched expected play patterns across player deciles (P4–P8 target).",
            constraints: "Live mobile title with existing economy. Secondary currency had to feel natural, not punitive. 60-day horizon required careful pacing to avoid early burnout or late-stage drop-off. Solo series engagement had to be monitored for cannibalization.",
            outcome: "IAP rev/DAU +12% (100% confidence). D1RR +22 bps (99.8% confidence). Session time/user +1.4% (100% confidence). Net rev/DAU +1.8% (100% confidence). D50 LTV +3.6% (80% confidence). D30 new payer conversion +7 bps. Repeat payer purchases +3.2%, amount/purchase +8.6%. Non-payer wallet reduced 16% (intended economy de-risking). Event completion: 7% vs. 9% target — identified progression pacing as key tuning lever for future iterations.",
            contributions: "1. Designed the full 60-level progression curve, balancing key requirements against expected play frequency.\n2. Introduced gems as secondary currency — first non-coin currency in the game — to address inflation.\n3. Analyzed solo series cannibalization (4.1% engagement drop) and identified keys-earned differential as root cause.\n4. Validated FTUE CTR improvement (+190 bps) driven by gems FTUE flow.\n5. Monitored player decile engagement — found upsides across all deciles, not just P4–P8 target.",
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/bon-voyage/bonvoyage-hero-image-1776012924558.png"
                },
                processGallery: {
                    groupId: "bon-voyage-process",
                    heading: "Design process",
                    items: [
                        {
                            thumb: "/assets/bon-voyage/bon-voyage-h2p-1776012964512.png",
                            full: "/assets/bon-voyage/bon-voyage-h2p-1776012964512.png",
                            alt: "main screen",
                            label: "gallery - bon voyage h2p.png"
                        },
                        {
                            thumb: "/assets/bon-voyage/screenshot-2026-04-12-17-03-22-856-in-playsimple-wordbingo-1776013202745.jpg",
                            full: "/assets/bon-voyage/screenshot-2026-04-12-17-03-22-856-in-playsimple-wordbingo-1776013202745.jpg",
                            alt: "Intro screen",
                            label: "Gallery - Screenshot_2026-04-12-17-03-22-856_in.playsimple.wordbingo.jpg"
                        },
                        {
                            thumb: "/assets/bon-voyage/feedback-win-xpcollection-1776013416918.png",
                            full: "/assets/bon-voyage/feedback-win-xpcollection-1776013416918.png",
                            alt: "Feedback from outro",
                            label: "Gallery - Feedback_Win_XPCollection.png"
                        },
                        {
                            thumb: "/assets/bon-voyage/seasons-iap-distribution-1776013983172.png",
                            full: "/assets/bon-voyage/seasons-iap-distribution-1776013983172.png",
                            alt: "IAP distribution on player cohorts",
                            label: "Gallery - Seasons IAP distribution.png"
                        }
                    ]
                }
            }
        },
        "food-fiesta": {
            title: "Food Fiesta",
            subtitle: "Cross-mode Event · Word Roll",
            problem: "Players in later cohorts narrowed to a single preferred game mode, dropping into low-engagement buckets. Non-leaderboard days had a 1–2 move gap with no compelling content.",
            approach: "1. Built a Mon–Sat event tying all game modes together via DW/TW bonus tiles on the last letter of the gameboard.\n2. Gated event unlock at lifetime 150 moves or D7+ cohort to target the right player segment.\n3. Designed progression levels unlocked by bonus tile collection, expected to drive power-up usage.",
            constraints: "Pre-allocation bias of ~3% in experiment setup. Multi-mode balance — had to ensure no single mode was disproportionately rewarded. Live mobile title coordination with existing events.",
            outcome: "Engagement +7.5% (~2.4 moves) in D7+ cohort. Rolling retention +50 bps in D7+ (96% confidence). Power-up usage +26%, bingo rate +55 bps. High-engagement bucket (30+ moves) share +200 bps. IT ad impressions +7%, banner +8%. Controlled for ~3% pre-allocation bias — early cohort D1 retention signals attributed to experiment setup, not feature impact.",
            contributions: "1. Designed the cross-mode event structure with DW/TW bonus tile mechanic.\n2. Defined task structures and balanced rewards across progression levels.\n3. Analyzed engagement uplift across all game modes and identified Monday/Tuesday as peak event days.\n4. Monitored early-cohort retention signals and validated experiment bias attribution.",
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/food-fiesta/hero-image.png"
                },
                processGallery: {
                    groupId: "food-fiesta-process",
                    heading: "Design process",
                    items: [
                        {
                            thumb: "/assets/food-fiesta/foodfiesta-01-1776013765627.png",
                            full: "/assets/food-fiesta/foodfiesta-01-1776013765627.png",
                            alt: "Main screen",
                            label: "Main screen - FoodFiesta_01.png"
                        },
                        {
                            thumb: "/assets/food-fiesta/feedback-win-1776013836481.png",
                            full: "/assets/food-fiesta/feedback-win-1776013836481.png",
                            alt: "Feedback on outro",
                            label: "Gallery - Feedback_Win.png"
                        },
                        {
                            thumb: "/assets/food-fiesta/home-01-1776014074294.png",
                            full: "/assets/food-fiesta/home-01-1776014074294.png",
                            alt: "Event FTUE",
                            label: "Gallery - Home_01.png"
                        }
                    ]
                }
            }
        },
        tiles: {
            title: "Tiles",
            subtitle: "Cosmetic System · Economy Design · Word Roll",
            problem: "Rewards were entirely coin-based, limiting economy levers and player expression. No cosmetic systems existed to create meaningful sinks beyond coins or drive aspirational engagement.",
            approach: "1. Designed tile skins as the first cosmetic reward system in Word Roll — creating ownership and expression beyond functional upgrades.\n2. Built gacha-style acquisition system using Machinations for probability tuning and economy modeling.\n3. Integrated cosmetics as rewards for Food Fiesta event progression to drive cross-mode engagement.\n4. Designed rarity tiers and visual differentiation to create collection goals.",
            constraints: "First cosmetic system in the game — had to establish visual language and player expectations. Economy de-risking with cosmetics had to feel like genuine ownership, not coin replacement. Gacha mechanics required careful probability tuning for player satisfaction vs. monetization.",
            outcome: "Rev/DAU +22% (+8 cents) driven by IAP +100% (+6 cents) and ad rev +5% (+2 cents). Payer (earn–spend)/DAU decreased by ~1,200 coins, driving IAP upsides. Established cosmetic system foundation for future content expansions. Player feedback: high satisfaction with tile customization and collection mechanics.",
            contributions: "1. Introduced tile skins as first-ever cosmetic reward system in Word Roll.\n2. Designed gacha acquisition system with Machinations-tuned probability curves.\n3. Created rarity tiers and visual design language for cosmetic differentiation.\n4. Integrated cosmetics into Food Fiesta event as aspirational rewards.\n5. Established cosmetic system architecture for future expansions (character skins, board themes, etc.).",
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/tiles/default-tile-1776015166664.png"
                },
                processGallery: {
                    groupId: "tiles-process",
                    heading: "Design process",
                    items: [
                        {
                            thumb: "/assets/tiles/screenshot-2026-04-12-at-10-50-46-pm-1776014937820.png",
                            full: "/assets/tiles/screenshot-2026-04-12-at-10-50-46-pm-1776014937820.png",
                            alt: "Machinations diagram",
                            label: "Gallery - Screenshot 2026-04-12 at 10.50.46\u202FPM.png"
                        },
                        {
                            thumb: "/assets/tiles/feedback-win-1776014988056.png",
                            full: "/assets/tiles/feedback-win-1776014988056.png",
                            alt: "Tile Grant feedback",
                            label: "gallery - Feedback_Win.png"
                        },
                        {
                            thumb: "/assets/tiles/tiles-on-home-screen-1776015076972.png",
                            full: "/assets/tiles/tiles-on-home-screen-1776015076972.png",
                            alt: "Tile screen",
                            label: "Gallery - Tiles on Home Screen.png"
                        },
                        {
                            thumb: "/assets/tiles/default-tile-1776015216518.png",
                            full: "/assets/tiles/default-tile-1776015216518.png",
                            alt: "Tile screen",
                            label: "Gallery - Default tile.png"
                        }
                    ]
                }
            }
        },
        "ai-innovation": {
            title: "AI & Innovation",
            subtitle: "Productivity Tools · Feature Spec Pipeline",
            problem: "Unstructured meeting output created bottlenecks: manual bifurcation of decisions vs. specs vs. stakeholder updates. Context was lost when team members joined later in pre-production. Duplicate work — same content rewritten for email, specs, and presentations. Teams struggled to turn messy Granola meeting notes into organized, actionable content.",
            approach: "1. **Feature Spec Dashboard** — ingests meeting notes from Granola (or similar tools), bifurcates raw notes into structured sections (problem statements, vision, anti-vision, business goals, design goals, flows), and produces both mail-ready stakeholder updates and spec-ready content for downstream processing.\n2. **Spec Maker** — takes structured input from Dashboard output (or raw meeting data/freeform prompts) and generates complete spec documents in markdown format, with future PPTX generation planned for presentation-ready outputs.\n3. **Template-driven extraction** — uses standard section headers (Problem, Vision, Business Goals, Design Goals, Flows) so output aligns perfectly with Spec Maker's expected input format, eliminating manual reformatting.\n4. **End-to-end pipeline** — Meeting notes → Dashboard bifurcation → Mail + Spec-ready data → Spec Maker → Complete documentation, creating single source of truth from meetings.",
            constraints: "Team adoption across 8-person dev team. Meeting note quality varies by source (Granola vs manual). Spec template had to be flexible for different feature types while maintaining consistency. Integration with existing workflows and tools.",
            outcome: "**Eliminated manual bifurcation** — one extraction now feeds both stakeholder emails and spec pipeline instead of rewriting same content in multiple formats. **Context retention** — team members joining later stages of pre-production gain full context without requiring knowledge transfer sessions. **Workflow standardization** — adopted as team standard across 8-person dev team with consistent spec structure. **Efficiency gains** — reduced time from meeting completion to spec-ready data with minimal manual reformatting. **Duplicate work elimination** — same meeting content no longer rewritten for emails, specs, and presentations.",
            contributions: "1. **Identified pipeline gap** — recognized that unstructured meeting output was creating bottlenecks and designed the two-tool architecture (Dashboard → Spec Maker) to solve it.\n2. **Built Feature Spec Dashboard** — developed web app with Granola integration, automated data bifurcation logic, and dual output system (stakeholder emails + spec-ready structured data).\n3. **Designed template-driven extraction** — created system using standard spec section headers (Problem, Vision, Anti-vision, Business Goals, Design Goals, Flows) for consistent output formatting.\n4. **Built Spec Maker** — developed locally-hosted tool that consumes structured input and generates complete spec documents in markdown, with planned PPTX export for presentations.\n5. **Established format consistency** — ensured all team feature specs follow identical structure and section ordering for predictable workflow.\n6. **Drove team adoption** — integrated tools into standard pre-production workflow across 8-person development team, eliminating ad-hoc spec creation methods.",
            links: [
                { label: "Feature Spec Dashboard", href: "https://abhishekdutta1-project.vercel.app/" },
                { label: "Spec Maker (Local)", href: "#" },
            ],
            media: {
                hero: {
                    posterSrc: "/assets/ai-innovation/hero-image.svg"
                },
                processGallery: {
                    groupId: "ai-innovation-process",
                    heading: "Tool Architecture",
                    items: [
                        {
                            thumb: "/assets/ai-innovation/gallery-spec-dashboard.svg",
                            full: "/assets/ai-innovation/gallery-spec-dashboard.svg",
                            alt: "Feature Spec Dashboard — Granola meeting notes to structured bifurcated output",
                            label: "Spec Dashboard",
                        },
                        {
                            thumb: "/assets/ai-innovation/gallery-spec-maker.svg",
                            full: "/assets/ai-innovation/gallery-spec-maker.svg",
                            alt: "Spec Maker — structured input to complete markdown spec documents",
                            label: "Spec Maker",
                        },
                        {
                            thumb: "/assets/ai-innovation/gallery-pipeline.svg",
                            full: "/assets/ai-innovation/gallery-pipeline.svg",
                            alt: "End-to-end pipeline from meeting notes to complete documentation",
                            label: "Full Pipeline",
                        }
                    ]
                }
            }
        },
        "kinoa-integration": {
            title: "Kinoa LiveOps Integration",
            subtitle: "LiveOps Platform · SDK Integration",
            problem: "Need for comprehensive LiveOps platform integration to enhance player engagement and monetization capabilities through advanced event management and player analytics.",
            approach: "1. Created comprehensive design document for seamless Kinoa SDK integration.\n2. Set up LiveOps features through flows and in-app configurations.\n3. Tested various events and made real-time optimizations for player engagement.",
            constraints: "SDK integration complexity, existing codebase compatibility, event testing and optimization timelines.",
            outcome: "Successfully integrated Kinoa platform enabling advanced LiveOps capabilities and optimized monetization strategies through data-driven event management.",
            contributions: "1. Designed and documented complete integration strategy for development team.\n2. Configured LiveOps flows and in-app features according to game requirements.\n3. Conducted comprehensive event testing and iterative optimization.\n4. Established data-driven approach to event management and player engagement optimization.",
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/kinoa-integration/hero-image.svg"
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
                        }
                    ]
                }
            }
        },
        wotd: {
            title: "Word of the Day (WOTD)",
            subtitle: "Feature optimization · Word Roll",
            problem: "WOTD was non-interactive with weak CTRs.",
            approach: "1. Players collect WOTD letters while forming words.\n2. After collecting all letters they can play the WOTD directly.\n3. After use, the game reveals the word’s meaning.",
            constraints: "UX clarity, session fit, collaboration with UX and engineering.",
            outcome: "D30 LTV +9.4% (high confidence, or +6.04% removing outliers). D1RR +73 bps (high confidence). Engagement +0.63 moves/DAU (high confidence). Step 1 completion: 55% of DAU. Step 2 completion: 34% of DAU. Solo Series saw -0.27 moves/DAU (attributed to pre-post bias and variant experiment interference). No impact on DBH mode where feature was inactive.",
            contributions: "1. Concepted the mechanic.\n2. Built the daily WOTD list with meanings.\n3. Partnered with UX on flows.",
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/wotd/hero-image.png"
                },
                processGallery: {
                    groupId: "wotd-process",
                    heading: "Design process",
                    items: []
                }
            }
        },
        "ticket-mania": {
            title: "Ticket Mania",
            subtitle: "Leaderboard Redesign · Monetization · Word Roll",
            problem: "Players engaged with leaderboard events too passively. The existing leaderboard mechanic lacked a compelling collection loop, and booster monetization was underperforming.",
            approach: "1. Designed a ticket-collection mechanic on classic games — players fill rows on the gameboard to earn tickets.\n2. Tickets feed into a leaderboard where top players receive rewards.\n3. Increased swap usage by creating natural demand through ticket collection pressure.\n4. Redesigned leaderboard intro CTA to drive instant bot game starts.",
            constraints: "Fairness in leaderboard bucketing. Bot chase logic imported from control was suboptimal for new mechanic. FTUE landed on leaderboard screen (navigational dead end). Booster price-to-reward conflict with swap pricing.",
            outcome: "Rev/DAU +7% (~3 cents, 100% confidence) primarily from IAP. D7 LTV +10% (75% confidence). D30 LTdays +9% (+0.45 days, 91% confidence). D1RR for D2+ organic +170 bps (99% confidence). D1R for organic +300 bps (95% confidence). Rolling retention +50 bps (high confidence). Engagement (starts/play/end per DAU) +3% (100% confidence). Swap spend +100 coins/DAU, (earn–spend) shifted from +50 to −5 coins. D7 payer conversion +55 bps (93% confidence).",
            contributions: "1. Designed the ticket-collection mechanic and gameboard integration.\n2. Analyzed booster purchase decline — identified LB screen top-of-funnel drop and swap pricing conflict as root causes.\n3. Identified FTUE navigational dead-end issue and proposed optimization.\n4. Flagged bot chase logic as suboptimal for new mechanic — proposed future iteration.\n5. Drove decision to ramp variant to 100% based on strong IAP and retention signals.",
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/ticket-mania/screenshot-2026-04-12-at-11-26-35-pm-1776017402864.png"
                },
                processGallery: {
                    groupId: "ticket-mania-process",
                    heading: "Design process",
                    items: [
                        {
                            thumb: "/assets/ticket-mania/screenshot-2026-04-12-17-03-41-227-in-playsimple-wordbingo-1776017580465.jpg",
                            full: "/assets/ticket-mania/screenshot-2026-04-12-17-03-41-227-in-playsimple-wordbingo-1776017580465.jpg",
                            alt: "How to play",
                            label: "Gallery - Screenshot_2026-04-12-17-03-41-227_in.playsimple.wordbingo.jpg"
                        },
                        {
                            thumb: "/assets/ticket-mania/gameboard-fillrow-13btiles-makeword-1776017694185.png",
                            full: "/assets/ticket-mania/gameboard-fillrow-13btiles-makeword-1776017694185.png",
                            alt: "Tickets collected",
                            label: "Gallery - Gameboard_FillRow_13BTiles_MakeWord.png"
                        },
                        {
                            thumb: "/assets/ticket-mania/gameboard-fillrow-13btiles-makeword-1776017759922.png",
                            full: "/assets/ticket-mania/gameboard-fillrow-13btiles-makeword-1776017759922.png",
                            alt: "Ticket collected feedback",
                            label: "Gallery - Gameboard_FillRow_13BTiles_MakeWord.png"
                        }
                    ]
                }
            }
        }
    }
};
export function cloneDefaultPortfolioContent(): PortfolioContentState {
    return structuredClone(defaultPortfolioContent);
}
export const caseStudySlugs = Object.keys(defaultPortfolioContent.caseStudies);
export type { CaseStudyMedia } from "./case-study-media";
