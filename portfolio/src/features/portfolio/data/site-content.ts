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
            blurb: "Built a 60-day seasonal event with secondary currency that increased retention 22 basis points and revenue 12%.",
            href: "/work/bon-voyage",
            externalUrl: ""
        },
        {
            slug: "food-fiesta",
            title: "Food Fiesta",
            tag: "Cross-mode Events · Engagement",
            blurb: "Connected all game modes through bonus tile collection, boosting engagement 7.5% in veteran players without disrupting preferred play styles.",
            href: "/work/food-fiesta",
            externalUrl: "",
        },
        {
            slug: "tiles",
            title: "Tiles",
            tag: "Cosmetic Systems · Gacha Design",
            blurb: "Created the first cosmetic system using gacha mechanics, driving revenue +22% while giving players meaningful customization choices.",
            href: "/work/tiles",
            externalUrl: "",
        },
        {
            slug: "ticket-mania",
            title: "Ticket Mania",
            tag: "Leaderboards · Monetization",
            blurb: "Redesigned leaderboards with ticket collection mechanics, increasing revenue 7% and retention 170 basis points through active competition.",
            href: "/work/ticket-mania",
            externalUrl: "",
        },
        {
            slug: "wotd",
            title: "Word of the Day",
            tag: "Feature Optimization · Engagement",
            blurb: "Turned daily word definitions into interactive collection gameplay, boosting LTV 9.4% and engagement 0.63 moves per user.",
            href: "/work/wotd",
            externalUrl: "",
        },
        {
            slug: "ai-innovation",
            title: "AI & Innovation",
            tag: "Productivity Tools · Workflow Automation",
            blurb: "Built AI tools that turn messy meeting notes into structured feature specs, eliminating manual reformatting for 8-person dev team.",
            href: "/work/ai-innovation",
            externalUrl: "",
        },
        {
            slug: "kinoa-integration",
            title: "Kinoa LiveOps Integration",
            tag: "Platform Integration · LiveOps",
            blurb: "Integrated Kinoa LiveOps platform to enable real-time events and player engagement optimization through data-driven event management.",
            href: "/work/kinoa-integration",
            externalUrl: "",
        }
    ],
    caseStudies: {
        "bon-voyage": {
            title: "Bon Voyage",
            subtitle: "Long-term Retention · Economy Design · Word Roll",
            problem: "Word Roll had strong daily engagement but weak long-term retention. Players would complete daily goals then leave, and the coin-only economy was inflating without enough meaningful sinks. We needed extended progression that felt rewarding, not grindy.",
            approach: "I designed a 60-day seasonal event with 60 levels, each unlocked by keys earned from completing games. This created natural pacing — players couldn't rush through by spending money, only by playing consistently.\n\nThe key innovation was introducing gems as a secondary currency. Players still earned coins for immediate purchases, but gems provided delayed rewards that felt more valuable. This solved the inflation problem while giving players a new reason to engage long-term.\n\nI tuned the progression curve using player data, ensuring casual players (P4-P6) could complete 40-50 levels while dedicated players (P7-P8) could reach the full 60.",
            constraints: "This was a live game with millions of players who had established spending patterns. Any new currency couldn't feel punitive or confusing. The 60-day timeline was also risky — too slow and players lose interest, too fast and casual players can't keep up. I had to ensure the event enhanced existing modes rather than replacing them.",
            outcome: "IAP rev/DAU +12% (100% confidence). D1RR +22 bps (99.8% confidence). Session time/user +1.4% (100% confidence). Net rev/DAU +1.8% (100% confidence). D50 LTV +3.6% (80% confidence). D30 new payer conversion +7 bps. Repeat payer purchases +3.2%, amount/purchase +8.6%. Non-payer wallet reduced 16% (intended economy de-risking). Event completion: 7% vs. 9% target — identified progression pacing as key tuning lever for future iterations.",
            contributions: "This was Word Roll's first secondary currency, which became the template for future economic features. I designed the entire 60-level progression curve, balancing key requirements against actual player behavior data rather than theoretical models.\n\nI created the gems concept as 'effort tokens' that reward time investment over money spending. When I noticed the event was cannibalizing solo series engagement, I identified the root cause (key earning differential) and proposed fixes.\n\nThe gem onboarding flow I designed improved new player conversion by 190 basis points. Most surprisingly, the progression appealed across all player segments, not just our P4-P8 target.",
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
            problem: "Veteran players were getting stuck in single game modes. They'd master Classic or Daily Hunt, then ignore other modes entirely. This created engagement drops on non-leaderboard days and limited their overall experience with the game.",
            approach: "I created a Monday-Saturday event that connected all game modes through bonus tile collection. When players formed words ending with DW or TW bonus tiles, they'd earn event progress regardless of which mode they were playing.\n\nThis let players stay in their preferred modes while getting gentle nudges to try others. The event was gated at 150 lifetime moves and D7+ cohorts to ensure players understood the basics first.\n\nProgression unlocked through tile collection rather than time, so engaged players could advance faster while casual players weren't left behind.",
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
            problem: "Word Roll had no cosmetics or player expression. Everything was purely functional — players couldn't show personality or achievement. We needed customization that felt meaningful without disrupting the clean, focused gameplay experience.",
            approach: "I designed tile skins as the first cosmetic system — players could customize the letter tiles they see during gameplay. This enhanced the core experience without changing any mechanics.\n\nI used Machinations to model the gacha acquisition system, balancing excitement with fair odds. Common tiles were easy to get for immediate satisfaction, while rare tiles provided long-term collection goals.\n\nRather than creating a separate cosmetics store, I integrated tiles as rewards within Food Fiesta event progression. This made cosmetics feel earned rather than purchased.",
            constraints: "First cosmetic system in the game — had to establish visual language and player expectations. Economy de-risking with cosmetics had to feel like genuine ownership, not coin replacement. Gacha mechanics required careful probability tuning for player satisfaction vs. monetization.",
            outcome: "Rev/DAU +22% (+8 cents) driven by IAP +100% (+6 cents) and ad rev +5% (+2 cents). Payer (earn–spend)/DAU decreased by ~1,200 coins, driving IAP upsides. Established cosmetic system foundation for future content expansions. Player feedback: high satisfaction with tile customization and collection mechanics.",
            contributions: "I created Word Roll's first cosmetic system and established the design patterns for future player expression features. The modular framework I built supports infinite tile designs while maintaining visual consistency.\n\nI used Machinations probability modeling to balance player satisfaction with monetization, avoiding predatory gacha patterns. The rarity system I designed clearly communicates value through visual hierarchy.\n\nMost importantly, I integrated cosmetics into existing progression rather than creating a separate economy. This became the template for all future cosmetic features.",
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
            problem: "Development teams faced a 'design documentation crisis' — creative discussions generated valuable insights, but translating those insights into actionable specifications required extensive manual processing. Information architecture broke down between ideation and implementation, creating friction that slowed feature development and diluted design intent. The challenge: preserve creative flow while ensuring design decisions translate clearly into development reality.",
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
                            thumb: "/assets/ai-innovation/screenshot-2026-04-13-at-12-03-27-am-1776019525635.png",
                            full: "/assets/ai-innovation/screenshot-2026-04-13-at-12-03-27-am-1776019525635.png",
                            alt: "Process flow",
                            label: "Gallery - Screenshot 2026-04-13 at 12.03.27\u202FAM.png"
                        },
                        {
                            thumb: "/assets/ai-innovation/screenshot-2026-04-13-at-12-03-53-am-1776019549213.png",
                            full: "/assets/ai-innovation/screenshot-2026-04-13-at-12-03-53-am-1776019549213.png",
                            alt: "Meeting Manager",
                            label: "Gallery - Screenshot 2026-04-13 at 12.03.53\u202FAM.png"
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
            problem: "Daily educational content felt disconnected from core gameplay — players encountered word definitions as passive interruptions rather than meaningful discoveries. The design challenge: integrate learning moments that enhance rather than disrupt the game experience, creating genuine curiosity without breaking player flow.",
            approach: "**Design Philosophy**: Learning should feel like discovery, not instruction.\n\n1. **Progressive Revelation**: Letter collection creates anticipation and investment before the educational payoff, transforming passive consumption into active achievement.\n2. **Contextual Integration**: WOTD letters appear naturally during regular gameplay, making education feel serendipitous rather than forced.\n3. **Meaningful Interaction**: Players must actively use the collected word, creating a moment of mastery and ownership before receiving the definition.\n4. **Delayed Gratification**: Definition reveal comes after engagement, ensuring players are emotionally invested in the learning moment.",
            constraints: "UX clarity, session fit, collaboration with UX and engineering.",
            outcome: "D30 LTV +9.4% (high confidence, or +6.04% removing outliers). D1RR +73 bps (high confidence). Engagement +0.63 moves/DAU (high confidence). Step 1 completion: 55% of DAU. Step 2 completion: 34% of DAU. Solo Series saw -0.27 moves/DAU (attributed to pre-post bias and variant experiment interference). No impact on DBH mode where feature was inactive.",
            contributions: "**Design Innovation**: Transformed educational content from interruption into integration.\n\n1. **Mechanic Design**: Conceived two-phase interaction model that builds investment before delivering educational content, ensuring emotional readiness for learning.\n2. **Content Curation**: Developed daily word selection criteria balancing difficulty, relevance, and discovery potential to maintain long-term engagement.\n3. **Cross-Disciplinary Collaboration**: Worked with UX team to ensure educational moments felt native to the game's interaction language rather than foreign insertions.",
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/wotd/screenshot-2026-04-13-at-12-00-17-am-1776018645254.png"
                },
                processGallery: {
                    groupId: "wotd-process",
                    heading: "Design process",
                    items: [
                        {
                            thumb: "/assets/wotd/screenshot-2026-04-12-17-07-47-253-in-playsimple-wordbingo-1776018434844.jpg",
                            full: "/assets/wotd/screenshot-2026-04-12-17-07-47-253-in-playsimple-wordbingo-1776018434844.jpg",
                            alt: "WOTD Step 1",
                            label: "WOTD - Screenshot_2026-04-12-17-07-47-253_in.playsimple.wordbingo.jpg"
                        },
                        {
                            thumb: "/assets/wotd/screenshot-2026-04-12-20-48-09-471-in-playsimple-wordbingo-1776018461814.jpg",
                            full: "/assets/wotd/screenshot-2026-04-12-20-48-09-471-in-playsimple-wordbingo-1776018461814.jpg",
                            alt: "Step 2",
                            label: "Gallery - Screenshot_2026-04-12-20-48-09-471_in.playsimple.wordbingo.jpg"
                        },
                        {
                            thumb: "/assets/wotd/screenshot-2026-04-12-20-50-48-397-in-playsimple-wordbingo-1776018493285.jpg",
                            full: "/assets/wotd/screenshot-2026-04-12-20-50-48-397-in-playsimple-wordbingo-1776018493285.jpg",
                            alt: "Step 3",
                            label: "Gallery - Screenshot_2026-04-12-20-50-48-397_in.playsimple.wordbingo.jpg"
                        },
                        {
                            thumb: "/assets/wotd/image-1776018546584.png",
                            full: "/assets/wotd/image-1776018546584.png",
                            alt: "D1RR control vs Variant",
                            label: "Gallery - image.png"
                        }
                    ]
                }
            }
        },
        "ticket-mania": {
            title: "Ticket Mania",
            subtitle: "Leaderboard Redesign · Monetization · Word Roll",
            problem: "Leaderboards created spectator experiences rather than active engagement — players watched their ranking change based on others' performance rather than feeling direct agency over their competitive position. The design challenge: transform passive competition into active gameplay while maintaining the social dynamics that make leaderboards compelling.",
            approach: "**Design Philosophy**: Make competition feel like active achievement rather than passive comparison.\n\n1. **Agency Through Collection**: Ticket mechanics transform abstract leaderboard points into tangible, earned resources that players directly control through gameplay choices.\n2. **Strategic Depth**: Row-completion goals create micro-decisions within each game — players balance word optimization with ticket collection, adding tactical layers to familiar gameplay.\n3. **Natural Resource Pressure**: Ticket collection creates organic demand for strategic tools (swaps) without feeling forced or artificial.\n4. **Immediate Engagement**: Redesigned entry flow eliminates barriers between competitive intent and active play, reducing drop-off at the moment of highest motivation.",
            constraints: "Fairness in leaderboard bucketing. Bot chase logic imported from control was suboptimal for new mechanic. FTUE landed on leaderboard screen (navigational dead end). Booster price-to-reward conflict with swap pricing.",
            outcome: "Rev/DAU +7% (~3 cents, 100% confidence) primarily from IAP. D7 LTV +10% (75% confidence). D30 LTdays +9% (+0.45 days, 91% confidence). D1RR for D2+ organic +170 bps (99% confidence). D1R for organic +300 bps (95% confidence). Rolling retention +50 bps (high confidence). Engagement (starts/play/end per DAU) +3% (100% confidence). Swap spend +100 coins/DAU, (earn–spend) shifted from +50 to −5 coins. D7 payer conversion +55 bps (93% confidence).",
            contributions: "**Design Innovation**: Pioneered active competition mechanics that enhanced rather than replaced existing gameplay systems.\n\n1. **Mechanical Integration**: Seamlessly wove collection goals into core word-formation gameplay without disrupting established player patterns or muscle memory.\n2. **Systems Analysis**: Identified and resolved unintended economic conflicts between new mechanics and existing monetization, demonstrating holistic design thinking.\n3. **User Experience Flow**: Diagnosed and solved onboarding friction points that were creating barriers to engagement at critical conversion moments.\n4. **Iterative Design**: Recognized limitations in inherited systems (bot logic) and proposed targeted improvements while maintaining launch timeline.\n5. **Data-Driven Decision Making**: Translated complex performance metrics into clear design recommendations that guided product strategy.",
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
                        },
                        {
                            thumb: "/assets/ticket-mania/ticket-mania-1776018351803.png",
                            full: "/assets/ticket-mania/ticket-mania-1776018351803.png",
                            alt: "Leaderboard screen",
                            label: "Gallery - ticket mania.png"
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
