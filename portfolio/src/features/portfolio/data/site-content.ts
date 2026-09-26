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
    personalProjects: ProjectItem[];
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
        personalProjects: Array.isArray(raw.personalProjects) && raw.personalProjects.length > 0
            ? raw.personalProjects
            : d.personalProjects,
        caseStudies: mergeCaseStudyRecords(d.caseStudies, raw.caseStudies),
    };
}
/** Default portfolio content (you can edit in /edit). */
export const defaultPortfolioContent: PortfolioContentState = {
    siteMeta: {
        siteName: "Abhishek Dutta - Systems Designer",
        title: "Abhishek — Systems & Feature Designer | LiveOps Expert",
        description: "Systems & Feature Designer specializing in LiveOps, retention mechanics, and economy design. 4 years driving measurable impact through data-driven mobile game design.",
    },
    hero: {
        headline: "Building Systems That Keep Players Engaged",
        subline: "I design retention mechanics, LiveOps events, and economy systems for mobile games. At PlaySimple, I've helped scale Word Roll from 4k to 40k+ DAU through targeted feature design and data-driven iteration.",
        statPills: [
            "Data driven",
            "Mobile First Approach",
            "25+ Features shipped",
        ],
    },
    about: {
        title: "How I Approach Systems Design",
        body: "I start every project by understanding player motivations and pain points through data analysis and user research.\n\nWhen designing LiveOps events or economy systems, I focus on three principles: clarity (players immediately understand the value), progression (meaningful advancement that respects their time), and sustainability (systems that enhance rather than exploit engagement).\n\nThe best game systems feel invisible \u2014 they create natural opportunities for discovery, social connection, and mastery. This approach has delivered both engagement and monetization gains across my projects at PlaySimple Games.",
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
            blurb: "Built a 60-day seasonal event with secondary currency that increased retention 22 basis points and IAP revenue per user 12%.",
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
            blurb: "Turned daily word definitions into interactive collection gameplay, boosting D30 LTV 9.4% and D1 retention 140 basis points.",
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
            blurb: "Wrote the Kinoa.io SDK integration design doc, then configured and tuned 5 cohort-personalised LiveOps events in real time.",
            href: "/work/kinoa-integration",
            externalUrl: "",
        }
    ],
    personalProjects: [
        {
            slug: "habiteer",
            title: "Habiteer",
            tag: "Gamification Design",
            blurb: "Designed and built a full XP, coin, and streak economy for a habit tracker end-to-end — solo, from Postgres schema to a device-tested Android widget.",
            href: "/work/habiteer",
            externalUrl: "https://github.com/Abhisavvy/habiteer",
        },
        {
            slug: "xfactor",
            title: "XFactor",
            tag: "Systems Design",
            blurb: "Built a turn-based Twitter-diplomacy simulator with a story-memory engine that tracks escalation and steers events, favor swings, and endings across a full playthrough.",
            href: "/work/xfactor",
            externalUrl: "https://github.com/Abhisavvy/XFactor",
        },
        {
            slug: "woven",
            title: "Woven",
            tag: "Puzzle Systems Design",
            blurb: "Designed and built the deterministic rules engine for a checkpoint-ordered thread-weaving puzzle, with 65 automated tests covering move legality, gate state, and win/dead-end detection.",
            href: "/work/woven",
            externalUrl: "https://github.com/Abhisavvy/Woven",
        },
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
                            alt: "Bon Voyage event how-to-play screen in Word Roll",
                            label: "How to Play Screen"
                        },
                        {
                            thumb: "/assets/bon-voyage/screenshot-2026-04-12-17-03-22-856-in-playsimple-wordbingo-1776013202745.jpg",
                            full: "/assets/bon-voyage/screenshot-2026-04-12-17-03-22-856-in-playsimple-wordbingo-1776013202745.jpg",
                            alt: "Bon Voyage event intro screen in Word Roll",
                            label: "Event Intro Screen"
                        },
                        {
                            thumb: "/assets/bon-voyage/feedback-win-xpcollection-1776013416918.png",
                            full: "/assets/bon-voyage/feedback-win-xpcollection-1776013416918.png",
                            alt: "Bon Voyage reward collection feedback screen in Word Roll",
                            label: "Reward Collection Feedback"
                        },
                        {
                            thumb: "/assets/bon-voyage/seasons-iap-distribution-1776013983172.png",
                            full: "/assets/bon-voyage/seasons-iap-distribution-1776013983172.png",
                            alt: "IAP distribution across player cohorts for Bon Voyage event in Word Roll",
                            label: "IAP Distribution by Cohort"
                        }
                    ]
                }
            }
        },
        "food-fiesta": {
            title: "Food Fiesta",
            subtitle: "Cross-mode Event · Word Roll",
            problem: "Veteran players were getting stuck in single game modes. They'd master Classic or Daily Hunt, then ignore other modes entirely. This created engagement drops on non-leaderboard days and limited their overall experience with the game.",
            approach: "I created a Monday-Saturday event that connected all game modes through bonus tile collection. When players formed words ending with DW or TW bonus tiles, they'd earn event progress regardless of which mode they were playing.\n\nThis let players stay in their preferred modes while getting gentle nudges to try others. The event was gated at 150 lifetime moves and D7+ cohorts to ensure players understood the basics first.\n\nProgression unlocked through tile collection rather than time, so engaged players could advance faster while casual players weren't left behind. Event progression rewards also included Tiles cosmetic skins.",
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
                            alt: "Food Fiesta event main screen in Word Roll",
                            label: "Event Main Screen"
                        },
                        {
                            thumb: "/assets/food-fiesta/feedback-win-1776013836481.png",
                            full: "/assets/food-fiesta/feedback-win-1776013836481.png",
                            alt: "Food Fiesta event completion feedback screen in Word Roll",
                            label: "Event Completion Feedback"
                        },
                        {
                            thumb: "/assets/food-fiesta/home-01-1776014074294.png",
                            full: "/assets/food-fiesta/home-01-1776014074294.png",
                            alt: "Food Fiesta event first-time user experience screen in Word Roll",
                            label: "Event FTUE Screen"
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
            contributions: "I created Word Roll's first cosmetic system and established the design patterns for future player expression features. The modular framework I built supports infinite tile designs while maintaining visual consistency.\n\nI used Machinations probability modeling to balance player satisfaction with monetization, avoiding predatory gacha patterns. The rarity system I designed clearly communicates value through visual hierarchy.\n\nI integrated cosmetics into existing progression rather than creating a separate economy. This became the template for all future cosmetic features.",
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
                            alt: "Machinations diagram modeling the tile gacha acquisition economy",
                            label: "Machinations Economy Model"
                        },
                        {
                            thumb: "/assets/tiles/feedback-win-1776014988056.png",
                            full: "/assets/tiles/feedback-win-1776014988056.png",
                            alt: "Tile grant reward feedback screen in Word Roll",
                            label: "Tile Grant Feedback"
                        },
                        {
                            thumb: "/assets/tiles/tiles-on-home-screen-1776015076972.png",
                            full: "/assets/tiles/tiles-on-home-screen-1776015076972.png",
                            alt: "Tile cosmetics displayed on the home screen in Word Roll",
                            label: "Tiles on Home Screen"
                        },
                        {
                            thumb: "/assets/tiles/default-tile-1776015216518.png",
                            full: "/assets/tiles/default-tile-1776015216518.png",
                            alt: "Default tile design before cosmetic customization in Word Roll",
                            label: "Default Tile Design"
                        }
                    ]
                }
            }
        },
        "ai-innovation": {
            title: "AI & Innovation",
            subtitle: "Productivity Tools · Feature Spec Pipeline",
            problem: "Meeting discussions generated valuable insights, but turning those into actionable specs required extensive manual processing. This friction slowed feature development and diluted design intent between ideation and implementation.",
            approach: "I built two connected tools to solve the meeting-to-spec problem. The Meeting Manager takes messy meeting notes from Granola and automatically sorts them into structured sections: problem statements, vision, business goals, design goals, and user flows.\n\nThe second tool, Spec Maker, takes that structured data and generates complete feature specs in markdown format. The beauty is that both tools use the same section headers, so there's no manual reformatting needed.\n\nThe end result: meeting notes go in, polished specs come out, with stakeholder emails generated as a bonus. One input, multiple outputs, zero manual work.",
            constraints: "Team adoption across 8-person dev team. Meeting note quality varies by source (Granola vs manual). Spec template had to be flexible for different feature types while maintaining consistency. Integration with existing workflows and tools.",
            outcome: "The tools eliminated manual reformatting entirely — one meeting extraction now feeds both stakeholder emails and the spec pipeline. Team members joining projects mid-stream get full context without knowledge transfer sessions.\n\nThe 8-person dev team adopted this as the standard workflow, with all specs following consistent structure and documentation efficiency improving 25%. We stopped rewriting the same content for emails, specs, and presentations — one input, multiple outputs.",
            contributions: "I identified the core problem: messy meeting notes were creating bottlenecks in our spec pipeline. So I designed a two-tool solution that automates the entire process.\n\nI built the Meeting Manager as a web app with Granola integration, handling the data sorting and dual output generation. The template system I created uses standard section headers that align perfectly with our spec format.\n\nI also built Spec Maker as a local tool that generates complete markdown specs, with PPTX export planned for presentations. I drove adoption across the entire 8-person dev team, making this our standard workflow.",
            links: [
                { label: "Meeting Manager", href: "https://abhishekdutta1-project.vercel.app/" }
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
                            alt: "Process flow diagram for the meeting-to-spec tool pipeline",
                            label: "Tool Process Flow"
                        },
                        {
                            thumb: "/assets/ai-innovation/screenshot-2026-04-13-at-12-03-53-am-1776019549213.png",
                            full: "/assets/ai-innovation/screenshot-2026-04-13-at-12-03-53-am-1776019549213.png",
                            alt: "Meeting Manager interface",
                            label: "Meeting Manager Interface"
                        },
                        {
                            thumb: "/assets/ai-innovation/screenshot-2026-04-13-at-12-04-03-am-1776019685851.png",
                            full: "/assets/ai-innovation/screenshot-2026-04-13-at-12-04-03-am-1776019685851.png",
                            alt: "Spec Maker tool chat interface for generating feature specs",
                            label: "Spec Maker Chat Interface"
                        },
                        {
                            thumb: "/assets/ai-innovation/screenshot-2026-04-13-at-12-04-34-am-1776019714641.png",
                            full: "/assets/ai-innovation/screenshot-2026-04-13-at-12-04-34-am-1776019714641.png",
                            alt: "Spec Maker dashboard view showing generated feature specs",
                            label: "Spec Maker Dashboard"
                        }
                    ]
                }
            }
        },
        woven: {
            title: "Woven",
            subtitle: "Puzzle Systems Design · Personal Project",
            problem: "A thread-weaving puzzle needs a rules engine that can enforce complex spatial constraints — ordered checkpoints, crossing paths, and conditional gates — without any single rule silently overriding another. The design question: how do you let threads cross, share cells, and gate each other's progress while keeping every move either strictly legal or strictly rejected, with no ambiguous states?",
            approach: "I designed Woven around a grid of colored threads that must be dragged from a start cell through an ordered sequence of checkpoints, filling every cell on the board before the level counts as solved. Getting there needed a few interlocking systems: weave cells let two threads cross the same cell on independent horizontal/vertical lanes without colliding; overlap nodes let exactly two threads share a single cell as a deliberate junction; and one-way cells and walls constrain which direction a thread can enter from.\n\nGates layer conditional logic on top of that: a gate opens and closes based on AND/OR combinations of other threads' checkpoint progress, and that open/closed state is derived live from progress rather than stored as a flag, so a future undo/replay can reconstruct it exactly. I specified the legality predicate as a single ordered checklist — adjacency, walls, gate state, one-way entry, cell/lane occupancy, checkpoint order — so every move is either fully legal or rejected with a specific reason, never partially applied.\n\nWin and dead-end detection both build on the same primitives: solved requires every lane-unit on the board filled (weave cells need both lanes) and every thread at its final checkpoint; dead-end is a cheap local check for any legal extension on any thread, deliberately not a full solvability search, so a level can look locally fine yet still be unsolvable — the player undoes or restarts rather than being warned in advance.",
            constraints: "Solo project, built engine-first: the Core layer (grid, threads, rules engine) is deliberately Unity-independent so it can be unit-tested without the editor and kept free of engine-specific dependencies. Scope for this pass was the deterministic rules layer only — board/thread data model and the legality, gate-state, and win/dead-end logic — with UI, level authoring, and content out of scope for now.",
            outcome: "Built the deterministic Core: grid/cell/thread data model, board elements (walls, one-way cells, weave lanes, overlap nodes), lane-unit coverage accounting, and a rules engine covering move legality, derived gate state, and win/dead-end detection. Backed the engine with 65 automated Edit Mode tests (all passing).",
            contributions: "The project is built on the open-source Claude Code Game Studios template; I wrote the game Core on top of it, with Claude as an AI pair (the commit is co-authored by Claude). I designed and implemented the full Core layer: the board/thread data model, the lane-unit coverage system used to verify a level is completely filled, the gate derivation logic (open/close triggers with AND/OR combination), and the rules engine's legality checks and terminal-state (win/dead-end) evaluation. I wrote the 65-test Edit Mode suite covering board elements, thread progress, gate state, and move legality.",
            links: [
                { label: "GitHub repository", href: "https://github.com/Abhisavvy/Woven" }
            ],
            media: {
                hero: {
                    posterSrc: "/assets/woven/hero-image.png"
                },
                processGallery: {
                    groupId: "woven-process",
                    heading: "Design process",
                    items: []
                }
            }
        },
        xfactor: {
            title: "XFactor",
            subtitle: "Systems Design · Narrative Systems · Personal Project",
            problem: "XFactor is a turn-based Twitter-diplomacy simulator built around one design question: how do you make a short, turn-based game feel like it's reacting to the players — where tone choices in round one shape what's possible by round five — without turning it into a branching-dialogue tree that would be impossible to author and balance solo?",
            approach: "The core loop is a 5-round, pass-and-play simulator: two factions (USA and USSR) each pick a tweet response — Diplomatic, Covert, Aggressive, or Unhinged in tone — to a Cold-War-flavored headline, then see the fallout as a shifting \"Global Favor\" meter and simulated engagement metrics (likes, retweets, replies). Cooperative pairings nudge favor gently; one side going aggressive against a cooperative opponent swings it hard; mutual aggression risks a public \"Ratioed\" penalty for whoever loses the exchange.\n\nThe key system underneath is a StoryMemory object that tracks escalation (0-100), world state (stable → tense → crisis → chaos), and content-based triggers pulled from the actual text of each choice (mentions of \"nuclear,\" \"hack,\" \"moon,\" \"alien,\" and so on). Escalation feeds back into event selection: a shared event-pool system (GENERIC_POOLS and per-scenario SCENARIO_POOLS, tagged realistic / heightened / absurd) picks the next headline based on how heated the last exchange was, with deduplication so players don't see repeat events in a single run.\n\nThirteen scenario premises (a laser-carved Moon crisis, a cloned-president conspiracy, a Roswell tech race, an AI overlord, a time-machine malfunction, and others) share this same engine, so new content is additive — new event pools and endings plug into the existing escalation/favor math rather than requiring new logic per scenario. A live Twitter-style feed panel (TweetFeed) generates contextual reaction tweets alongside the main round flow, and all sound (click, pop, tick, whoosh, per-tone stingers) is synthesized at runtime via the Web Audio API rather than sourced from audio files.",
            constraints: "Solo project, built and iterated in two authoring passes. All game content — headlines, tone options, ending text, feed tweets — is static and hand-authored. Built as a web app (React + TypeScript + Vite) for local pass-and-play use.",
            outcome: "The result is a local pass-and-play web game where escalation compounds: the same tone choice produces different favor swings and unlocks different event pools depending on how chaotic the run has already become, and a \"point of no return\" state locks in apocalyptic endings once escalation and story triggers (e.g. repeated nuclear references) cross a threshold. The second development pass added a Twitter-style feed, an X-style restyle and event deduplication, and fixed a bug that stopped play after round 1.",
            contributions: "I'm the sole author across both commits in the repository's history. The game started as a Google AI Studio prototype; in the first commit I added the narrative/consequence engine — story memory, escalation-driven event selection, content-trigger analysis, adaptive difficulty scaling, and the branching-ending system — using Cursor as an AI-assisted coding tool. In the second pass I layered on the Twitter-style feed component, contextual feed-tweet generation, and UI/audio fixes.",
            links: [
                { label: "GitHub repository", href: "https://github.com/Abhisavvy/XFactor" }
            ],
            media: {
                hero: {
                    posterSrc: "/assets/xfactor/hero-image.png"
                },
                processGallery: {
                    groupId: "xfactor-process",
                    heading: "Design process",
                    items: [
                        {
                            thumb: "/assets/xfactor/scenario-select.png",
                            full: "/assets/xfactor/scenario-select.png",
                            alt: "XFactor login screen with the Cold War Simulator title and Classified Intel card",
                            label: "Login Screen"
                        },
                        {
                            thumb: "/assets/xfactor/turn-choice.png",
                            full: "/assets/xfactor/turn-choice.png",
                            alt: "XFactor turn screen showing a player choosing a tweet tone response",
                            label: "Choosing a Tweet Tone"
                        },
                        {
                            thumb: "/assets/xfactor/final-outcome.png",
                            full: "/assets/xfactor/final-outcome.png",
                            alt: "XFactor ending screen showing the final outcome of a playthrough",
                            label: "Ending Screen"
                        }
                    ]
                }
            }
        },
        habiteer: {
            title: "Habiteer",
            subtitle: "Gamification Design · Systems Engineering · Personal Project",
            problem: "Habit trackers are easy to abandon because the payoff for showing up is invisible — a checked box, nothing more. The design question: could a habit/task tracker apply real game-economy thinking (XP, streak multipliers, a spendable currency, a mascot that reacts to progress) so that consistency itself feels like the winning move, without letting the economy become exploitable or the app become another dead tracker after a week of novelty.",
            approach: "The core loop is a closed economy: complete a habit or task, earn XP and coins, XP levels you up and moves you on a weekly league board, coins buy a reward you actually want. Habits and tasks are deliberately unequal — only habits carry streaks and a combo multiplier (tiers at 3, 7, 14, and 30 consecutive satisfied periods), and the multiplier only ever touches XP, never coins, so a reward's coin cost stays a stable, predictable target instead of drifting as players get better. Levels are earned status (cosmetics, capability unlocks, freeze tokens) rather than more currency, which keeps the coin economy from inflating.\n\nRecurrence and streaks run on one shared model — period (day/week/month) + quota — rather than special-cased rules per schedule type, so a streak means the same thing everywhere in the app. A mascot companion (\"Ember\") gives the economy a face: its expression shifts with streak state (neutral, celebrating at 7+ streaks and on level-up, sleepy when idle), reused across the level-up overlay, empty states, and the Android home-screen widgets, so the emotional feedback loop isn't just numbers going up.\n\nTo keep the economy honest, every mutating action (complete, undo, redeem, contribute) runs as an atomic Postgres RPC function, with the client-side TypeScript lib used only for display projections (\"completing this now pays +40 XP / +20 coins\"). The server recomputes and wins on every write, so the game logic can't be tampered with from the client. Tuning constants (difficulty payouts, combo tiers, the level curve) live in one shared module mirrored into generated SQL, so the client's projection and the server's authoritative result can't drift apart.",
            constraints: "Solo project, built entirely on free-tier infrastructure — Supabase's free Postgres/Auth/Realtime tier, Android sideloading instead of a paid Play Store listing, no server cron (the weekly league rollover runs as a lazy, idempotent-per-week RPC triggered on screen mount instead). An Android home-screen widget was a hard requirement, which ruled out a web app and forced a React Native/Expo client with a custom native module — Expo Go can't run it, so testing required a local Android dev-client build. iOS was explicitly deferred: a real iOS widget needs App Groups, which need Apple's paid developer program.",
            outcome: "PLAN.md marks v1 and the numbered v2 roadmap done, and the first batch of v3 features has shipped: auth and cross-device sync, the gamification core (XP/coins/combo/streaks) built test-first in Vitest, trackables, the completion economy, personal rewards, a weekly leaderboard, the Android widget (light + dark, device-verified), shared rewards and groups, week/month recurrence, a gamified stats page, five-tier leagues, a level-gated cosmetics catalog, a \"reduce\" mode for breaking habits, reminders, sound/haptic feedback, and a group shared-streak mechanic.\n\nA device-testing pass caught real bugs — add/edit forms opening below the fold on longer lists, hard shadows not rendering on Android, a dev-build reliability issue mistaken for an app bug — each diagnosed and fixed. A later UX pass added one-tap starter habit presets after identifying that a new account's first screen asked for six decisions before the first completion.",
            contributions: "I'm the sole author of all 56 commits, built with Claude Code as an AI pair, spanning July–August 2026. I designed and built the full stack: the gamification design itself (XP/coin split, combo tiers, level curve, league structure), the Postgres schema and RLS security model, the RPC-based anti-tamper architecture, the React Native/Expo client, the Android home-screen widget suite, and the test-first Vitest suite covering the gamification core.",
            links: [
                { label: "GitHub repository", href: "https://github.com/Abhisavvy/habiteer" }
            ],
            media: {
                hero: {
                    posterSrc: "/assets/habiteer/hero-image.png"
                },
                processGallery: {
                    groupId: "habiteer-process",
                    heading: "Design process",
                    items: []
                }
            }
        },
        "kinoa-integration": {
            title: "Kinoa LiveOps Integration",
            subtitle: "LiveOps Platform · SDK Integration",
            problem: "Needed a LiveOps platform integration to run events personalised to player cohorts.",
            approach: "1. Wrote the Kinoa.io SDK integration design doc for the development team.\n2. Set up LiveOps flows and in-app configurations for each event.\n3. Ran event testing and real-time tuning across cohorts.",
            constraints: "SDK integration complexity, existing codebase compatibility, event testing and optimization timelines.",
            outcome: "Deployed 5 cohort-personalised LiveOps events via Kinoa.io.",
            contributions: "1. Wrote the Kinoa.io SDK integration design doc for the development team.\n2. Configured LiveOps flows and in-app settings for each event.\n3. Ran event testing and real-time tuning across 5 cohort-personalised LiveOps events.",
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
            outcome: "The collection-based approach transformed educational content into engaging gameplay, driving D30 LTV +9.4% as players found the learning experience rewarding rather than disruptive. D1 retention improved by 140 basis points because the letter collection created clear daily goals.\n\nOverall engagement increased 3% as players actively sought letters during gameplay. The two-step design showed strong adoption: 55% of daily players collected letters (step 1) and 34% completed words (step 2), indicating healthy funnel conversion.\n\nThe feature's targeted design worked as intended — it enhanced active modes without impacting players in DBH mode where it was inactive, proving the integration achieved the original goal.",
            contributions: "I turned WOTD from a passive popup into an integrated gameplay mechanic. The two-phase design I created builds emotional investment before delivering educational content — players earn the right to learn.\n\nI developed the daily word selection criteria, balancing difficulty and relevance to keep players engaged long-term. I also worked closely with the UX team to ensure the educational moments felt native to the game rather than like interruptions.",
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
                            alt: "Word of the Day letter collection step in Word Roll gameplay",
                            label: "Letter Collection Step"
                        },
                        {
                            thumb: "/assets/wotd/screenshot-2026-04-12-20-48-09-471-in-playsimple-wordbingo-1776018461814.jpg",
                            full: "/assets/wotd/screenshot-2026-04-12-20-48-09-471-in-playsimple-wordbingo-1776018461814.jpg",
                            alt: "Word of the Day word completion step in Word Roll gameplay",
                            label: "Word Completion Step"
                        },
                        {
                            thumb: "/assets/wotd/screenshot-2026-04-12-20-50-48-397-in-playsimple-wordbingo-1776018493285.jpg",
                            full: "/assets/wotd/screenshot-2026-04-12-20-50-48-397-in-playsimple-wordbingo-1776018493285.jpg",
                            alt: "Word of the Day definition reveal step in Word Roll gameplay",
                            label: "Definition Reveal Step"
                        },
                        {
                            thumb: "/assets/wotd/image-1776018546584.png",
                            full: "/assets/wotd/image-1776018546584.png",
                            alt: "D1 retention rate comparison chart between control and WOTD variant",
                            label: "D1 Retention: Control vs Variant"
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
            outcome: "The ticket collection mechanic turned passive leaderboard watching into active competitive gameplay, driving revenue per user +7% (~3 cents) primarily through increased IAP purchases. D7 LTV improved +10% as players found the direct control over rankings more engaging than traditional position-based systems.\n\nRetention improved significantly — D1 retention for organic users increased 170 basis points for D2+ players and 300 basis points overall because ticket collection gave players clear competitive goals. Rolling retention improved 50 basis points as the mechanic created sustained engagement loops.\n\nThe design successfully increased swap usage by 100 coins per user as players balanced word optimization with ticket collection. However, the economy shift from +50 to -5 coins per user required careful monitoring to ensure balanced progression. New payer conversion increased 55 basis points as competitive mechanics drove monetization.",
            contributions: "I created the first active competition mechanic in Word Roll that enhanced rather than replaced existing gameplay. The ticket collection system I designed integrates cleanly with word formation without disrupting established player patterns.\n\nWhen I noticed the mechanic was hurting booster purchases, I identified the root cause: pricing conflicts between swaps and other boosters. I also diagnosed onboarding friction points that were causing drop-off at critical moments.\n\nI flagged issues with inherited bot logic and proposed improvements while maintaining the launch timeline. Throughout the process, I translated complex performance metrics into clear design recommendations for the product team.",
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
                            alt: "Ticket Mania how-to-play screen in Word Roll",
                            label: "How to Play Screen"
                        },
                        {
                            thumb: "/assets/ticket-mania/gameboard-fillrow-13btiles-makeword-1776017694185.png",
                            full: "/assets/ticket-mania/gameboard-fillrow-13btiles-makeword-1776017694185.png",
                            alt: "Ticket reward earned from completing a row on the gameboard",
                            label: "Row Completion Reward"
                        },
                        {
                            thumb: "/assets/ticket-mania/gameboard-fillrow-13btiles-makeword-1776017759922.png",
                            full: "/assets/ticket-mania/gameboard-fillrow-13btiles-makeword-1776017759922.png",
                            alt: "Ticket collected feedback animation on the gameboard",
                            label: "Ticket Collected Feedback"
                        },
                        {
                            thumb: "/assets/ticket-mania/ticket-mania-1776018351803.png",
                            full: "/assets/ticket-mania/ticket-mania-1776018351803.png",
                            alt: "Ticket Mania leaderboard screen in Word Roll",
                            label: "Ticket Mania Leaderboard"
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
