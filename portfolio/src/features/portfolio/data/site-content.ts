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
    image: string;
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
        body: "My design philosophy centers on creating systems that genuinely serve players while driving business results. I start every project by deeply understanding player motivations and pain points through data analysis and user research.\n\nWhen designing features like LiveOps events or economy systems, I focus on three core principles: clarity (players immediately understand the value), progression (meaningful advancement that respects their time), and sustainability (systems that enhance rather than exploit engagement).\n\nI believe the best game systems feel invisible to players \u2014 they create natural opportunities for discovery, social connection, and mastery without feeling manipulative. This player-first approach has consistently delivered both engagement improvements and monetization growth across my projects at PlaySimple Games.",
        image: "/assets/general/img-20250802-224439-1776525391803.jpg"
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
        email: "abhishek.dt.97@gmail.com",
        phone: "+91 7980700802",
        location: "Bengaluru, India",
        links: {
            linkedin: "https://www.linkedin.com/in/abhishek-dt97",
            resumePdf: "/ABHISHEK DUTTA RESUME.pdf"
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
            outcome: "The gems-based progression drove significant long-term engagement improvements. IAP revenue per user increased +12% as players found gems more valuable than coins, leading to higher conversion rates. The 60-day structure improved D1 retention by 22 basis points because players had clear progression goals beyond daily tasks.\n\nSession time grew +1.4% as players stayed longer to earn keys for progression. New payer conversion improved +7 basis points while existing payers increased both purchase frequency (+3.2%) and amount per purchase (+8.6%) due to gems' perceived value.\n\nThe event reduced non-payer coin accumulation by 16%, successfully addressing economy inflation while maintaining player satisfaction. Event completion reached 7% vs. 9% target, revealing that progression pacing needed adjustment for future iterations.",
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
            outcome: "The cross-mode bonus tile mechanic successfully increased engagement by 7.5% (~2.4 moves) among established players without disrupting their preferred play styles. Rolling retention improved by 50 basis points because players had new goals that kept them coming back across different game modes.\n\nPower-up usage increased 26% as players became more strategic about forming high-value words to collect bonus tiles. The share of highly engaged players (30+ moves) grew by 200 basis points, showing the event attracted deeper engagement rather than just breadth.\n\nAd impressions increased 7-8% as higher engagement naturally led to more ad opportunities. The event successfully bridged different game modes while accounting for experimental bias in early cohorts.",
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
            approach: "I built two connected tools to solve the meeting-to-spec problem. The Feature Spec Dashboard takes messy meeting notes from Granola and automatically sorts them into structured sections: problem statements, vision, business goals, design goals, and user flows.\n\nThe second tool, Spec Maker, takes that structured data and generates complete feature specs in markdown format. The beauty is that both tools use the same section headers, so there's no manual reformatting needed.\n\nThe end result: meeting notes go in, polished specs come out, with stakeholder emails generated as a bonus. One input, multiple outputs, zero manual work.",
            constraints: "Team adoption across 8-person dev team. Meeting note quality varies by source (Granola vs manual). Spec template had to be flexible for different feature types while maintaining consistency. Integration with existing workflows and tools.",
            outcome: "The tools eliminated manual reformatting entirely — one meeting extraction now feeds both stakeholder emails and the spec pipeline. Team members joining projects mid-stream get full context without knowledge transfer sessions.\n\nThe 8-person dev team adopted this as the standard workflow, with all specs following consistent structure. Most importantly, we stopped rewriting the same content for emails, specs, and presentations. One input, multiple outputs.",
            contributions: "I identified the core problem: messy meeting notes were creating bottlenecks in our spec pipeline. So I designed a two-tool solution that automates the entire process.\n\nI built the Feature Spec Dashboard as a web app with Granola integration, handling the data sorting and dual output generation. The template system I created uses standard section headers that align perfectly with our spec format.\n\nI also built Spec Maker as a local tool that generates complete markdown specs, with PPTX export planned for presentations. Most importantly, I drove adoption across the entire 8-person dev team, making this our standard workflow.",
            links: [
                { label: "Feature Spec Dashboard", href: "https://abhishekdutta1-project.vercel.app/" }
            ],
            media: {
                hero: {
                    posterSrc: "/assets/ai-innovation/generated-ai-banner.png"
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
                        },
                        {
                            thumb: "/assets/ai-innovation/screenshot-2026-04-13-at-12-04-03-am-1776019685851.png",
                            full: "/assets/ai-innovation/screenshot-2026-04-13-at-12-04-03-am-1776019685851.png",
                            alt: "Spec Maker and chat",
                            label: "Gallery - Screenshot 2026-04-13 at 12.04.03\u202FAM.png"
                        },
                        {
                            thumb: "/assets/ai-innovation/screenshot-2026-04-13-at-12-04-34-am-1776019714641.png",
                            full: "/assets/ai-innovation/screenshot-2026-04-13-at-12-04-34-am-1776019714641.png",
                            alt: "Spec Maker dashboard",
                            label: "Gallery - Screenshot 2026-04-13 at 12.04.34\u202FAM.png"
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
                    posterSrc: "/assets/kinoa-integration/screenshot-2026-04-13-at-12-23-57-am-1776020099651.png"
                },
                processGallery: {
                    groupId: "kinoa-integration-process",
                    heading: "Integration process",
                    items: []
                }
            }
        },
        wotd: {
            title: "Word of the Day (WOTD)",
            subtitle: "Feature optimization · Word Roll",
            problem: "Daily educational content felt disconnected from core gameplay — players encountered word definitions as passive interruptions rather than meaningful discoveries. The design challenge: integrate learning moments that enhance rather than disrupt the game experience, creating genuine curiosity without breaking player flow.",
            approach: "I redesigned WOTD as a two-step collection game. First, players collect letters for the daily word while playing normally — the letters appear naturally during gameplay, so it feels serendipitous rather than forced.\n\nOnce they collect all letters, players can use that word in their game. Only after they've actively engaged with the word do they see its definition. This creates investment before the educational payoff.\n\nThe key insight: learning feels better when it comes after achievement, not before.",
            constraints: "UX clarity, session fit, collaboration with UX and engineering.",
            outcome: "The collection-based approach transformed educational content into engaging gameplay, driving D30 LTV +9.4% as players found the learning experience rewarding rather than disruptive. D1 retention improved by 73 basis points because the letter collection created clear daily goals.\n\nEngagement increased +0.63 moves per user as players actively sought letters during gameplay. The two-step design showed strong adoption: 55% of daily players collected letters (step 1) and 34% completed words (step 2), indicating healthy funnel conversion.\n\nThe feature's targeted design worked as intended — it enhanced active modes without impacting players in DBH mode where it was inactive, proving the seamless integration achieved the original goal.",
            contributions: "I transformed WOTD from a passive popup into an integrated gameplay mechanic. The two-phase design I created builds emotional investment before delivering educational content — players earn the right to learn.\n\nI developed the daily word selection criteria, balancing difficulty and relevance to keep players engaged long-term. I also worked closely with the UX team to ensure the educational moments felt native to the game rather than like interruptions.",
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
            approach: "I redesigned leaderboards around ticket collection. Instead of passive ranking, players now earn tickets by completing rows on the gameboard. This gives them direct control over their competitive progress.\n\nThe mechanic creates interesting micro-decisions — players balance making the best word versus collecting tickets, adding tactical depth to familiar gameplay. Ticket collection also creates natural demand for swaps without feeling forced.\n\nI also redesigned the entry flow to eliminate barriers between wanting to compete and actually playing, reducing drop-off when players are most motivated.",
            constraints: "Fairness in leaderboard bucketing. Bot chase logic imported from control was suboptimal for new mechanic. FTUE landed on leaderboard screen (navigational dead end). Booster price-to-reward conflict with swap pricing.",
            outcome: "The ticket collection mechanic transformed passive leaderboard watching into active competitive gameplay, driving revenue per user +7% (~3 cents) primarily through increased IAP purchases. D7 LTV improved +10% as players found the direct control over rankings more engaging than traditional position-based systems.\n\nRetention improved significantly — D1 retention for organic users increased 170 basis points for D2+ players and 300 basis points overall because ticket collection gave players clear competitive goals. Rolling retention improved 50 basis points as the mechanic created sustained engagement loops.\n\nThe design successfully increased swap usage by 100 coins per user as players balanced word optimization with ticket collection. However, the economy shift from +50 to -5 coins per user required careful monitoring to ensure balanced progression. New payer conversion increased 55 basis points as competitive mechanics drove monetization.",
            contributions: "I created the first active competition mechanic in Word Roll that enhanced rather than replaced existing gameplay. The ticket collection system I designed integrates seamlessly with word formation without disrupting established player patterns.\n\nWhen I noticed the mechanic was hurting booster purchases, I identified the root cause: pricing conflicts between swaps and other boosters. I also diagnosed onboarding friction points that were causing drop-off at critical moments.\n\nI flagged issues with inherited bot logic and proposed improvements while maintaining the launch timeline. Throughout the process, I translated complex performance metrics into clear design recommendations for the product team.",
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
