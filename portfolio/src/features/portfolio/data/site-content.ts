/**
 * Default portfolio content for the Next.js site.
 * Live site + /edit use PortfolioEditorProvider (localStorage).
 */
import { mergeCaseStudyMedia, type CaseStudyMedia, } from "./case-study-media";
export type SkillThreadId = "economy" | "retention" | "liveops" | "monetization" | "systems" | "ai";
export const SKILL_THREADS: { id: SkillThreadId; label: string; color: string }[] = [
    { id: "economy", label: "Economy Design", color: "#F97316" },
    { id: "retention", label: "Retention & Engagement", color: "#2DD4BF" },
    { id: "liveops", label: "LiveOps & Events", color: "#A78BFA" },
    { id: "monetization", label: "Monetization", color: "#FB7185" },
    { id: "systems", label: "Systems & Puzzles", color: "#FACC15" },
    { id: "ai", label: "AI & Tools", color: "#38BDF8" },
];
export type ProjectStat = { value: string; label: string };
export type ProjectItem = {
    slug: string;
    title: string;
    tag: string;
    blurb: string;
    href: string;
    externalUrl: string;
    /** Optional skill-thread tags shown on the project card. */
    skills?: SkillThreadId[];
    /** Optional headline stats; first entry is shown on the card front. */
    stats?: ProjectStat[];
};
export type CaseStudy = {
    title: string;
    subtitle: string;
    problem: string;
    approach: string;
    constraints: string;
    outcome: string;
    /** Optional "What I'd change" block. So far: bon-voyage only. */
    change?: string;
    /** @deprecated Content now merges into `approach` ("What I did"). Kept optional so admin tooling still typechecks. */
    contributions?: string;
    links: {
        label: string;
        href: string;
    }[];
    /** Hero video, process gallery, optional demo clips — see `docs/portfolio-visual-media.md`. */
    media?: CaseStudyMedia;
    /** Optional core-loop diagram data. */
    loop?: { title: string; steps: string[]; cycles: boolean };
    /** Optional verbatim design-insight sentences pulled from this case study's own text. */
    notes?: string[];
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
        siteName: "Abhishek Dutta",
        title: "Abhishek Dutta · Game Designer, Systems & LiveOps",
        description: "Game designer at PlaySimple working on Word Roll's economy, live events and daily loops. Case studies, personal projects and CV.",
    },
    hero: {
        headline: "Building systems that keep players engaged.",
        subline: "I design the economies, events and daily loops behind Word Roll, a word game with millions of downloads. In four years at PlaySimple we grew from 4k to 40k+ daily players. When I'm not tuning coin economies, I'm building games of my own.",
        statPills: [
            "4k → 40k+ DAU · Word Roll",
            "25+ features shipped",
            "4 years at PlaySimple",
        ],
    },
    about: {
        title: "How I Approach Systems Design",
        body: "I'm a game designer at PlaySimple, where I've spent the last four years on Word Roll. I work on the systems underneath the game: the economy, the live events, and the daily loops that decide whether someone opens the app again tomorrow.\n\nI start every project by understanding player motivations and pain points through data analysis and user research.\n\nWhen designing LiveOps events or economy systems, I focus on three principles: clarity (players immediately understand the value), progression (meaningful advancement that respects their time), and sustainability (systems that enhance rather than exploit engagement).\n\nThe best game systems feel invisible \u2014 they create natural opportunities for discovery, social connection, and mastery. This approach has delivered both engagement and monetization gains across my projects at PlaySimple Games.",
        image: "/assets/general/img-20250802-224439-1776525391803.jpg"
    },
    workSection: {
        eyebrow: "Selected Work",
        title: "What I've shipped at PlaySimple",
    },
    footerCta: {
        title: "Let's talk",
        body: "Hiring, building something, or just want to talk game design? My inbox is open.",
    },
    person: {
        name: "Abhishek Dutta",
        role: "Game Designer · Systems & LiveOps",
        tagline: "Small rule changes. Big changes in how people play.",
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
            blurb: "Took coins out of game wins and put them into a 60-day season, with gems as the ticket into game modes.",
            href: "/work/bon-voyage",
            externalUrl: "",
            skills: ["retention", "economy", "monetization"],
            stats: [
                { value: "+12%", label: "IAP revenue per user" },
                { value: "+90 bps", label: "New payer conversion" },
                { value: "+22 bps", label: "D1 retention" },
                { value: "\u221216%", label: "Non-payer coin balance" },
            ],
        },
        {
            slug: "food-fiesta",
            title: "Food Fiesta",
            tag: "Cross-mode Events · Engagement",
            blurb: "A Monday-to-Saturday event that gave veteran players a gentle reason to try modes beyond their favourite.",
            href: "/work/food-fiesta",
            externalUrl: "",
            skills: ["liveops", "retention"],
            stats: [
                { value: "+7.5%", label: "Engagement (veteran players)" },
                { value: "+50 bps", label: "Rolling retention" },
                { value: "+26%", label: "Power-up usage" },
                { value: "+7–8%", label: "Ad impressions" },
            ],
        },
        {
            slug: "tiles",
            title: "Tiles",
            tag: "Cosmetic Systems · Gacha Design",
            blurb: "Word Roll's first cosmetic system: tile skins from a paint gacha, earned through events.",
            href: "/work/tiles",
            externalUrl: "",
            skills: ["economy", "monetization"],
            stats: [
                { value: "+22%", label: "Rev/DAU" },
                { value: "+100%", label: "IAP revenue" },
                { value: "+5%", label: "Ad revenue" },
            ],
        },
        {
            slug: "ticket-mania",
            title: "Ticket Mania",
            tag: "Leaderboards · Monetization",
            blurb: "Rebuilt the leaderboard so you climb by playing well, not just by playing a lot.",
            href: "/work/ticket-mania",
            externalUrl: "",
            skills: ["monetization", "retention"],
            stats: [
                { value: "+300 bps", label: "D1 retention" },
                { value: "+10%", label: "D7 LTV" },
                { value: "+7%", label: "Revenue per user" },
                { value: "+55 bps", label: "New payer conversion" },
            ],
        },
        {
            slug: "wotd",
            title: "Word of the Day",
            tag: "Feature Optimization · Engagement",
            blurb: "Turned a popup you could only close into a daily word you collect and play.",
            href: "/work/wotd",
            externalUrl: "",
            skills: ["retention"],
            stats: [
                { value: "+9.4%", label: "D30 LTV" },
                { value: "+140 bps", label: "D1 retention" },
                { value: "+3%", label: "Engagement" },
                { value: "55%", label: "Daily players collecting letters" },
            ],
        },
        {
            slug: "ai-innovation",
            title: "AI & Innovation",
            tag: "Productivity Tools · Workflow Automation",
            blurb: "Two tools that turn raw meeting notes into finished specs and stakeholder emails.",
            href: "/work/ai-innovation",
            externalUrl: "",
            skills: ["ai"],
            stats: [
                { value: "+25%", label: "Documentation efficiency" },
                { value: "8", label: "Person team adopted it" },
            ],
        },
        {
            slug: "kinoa-integration",
            title: "Kinoa LiveOps Integration",
            tag: "Platform Integration · LiveOps",
            blurb: "Cut event setup from about seven days of development to about an hour, with no app release.",
            href: "/work/kinoa-integration",
            externalUrl: "",
            skills: ["liveops"],
            stats: [
                { value: "7 days → 1 hour", label: "Event setup, no app release" },
                { value: "5", label: "Cohort-personalised LiveOps events" },
            ],
        }
    ],
    personalProjects: [
        {
            slug: "habiteer",
            title: "Habiteer",
            tag: "Gamification Design",
            blurb: "A habit tracker built like a game economy, for my partner and my friends.",
            href: "/work/habiteer",
            externalUrl: "https://github.com/Abhisavvy/habiteer",
            skills: ["economy", "retention"],
            stats: [
                { value: "×3", label: "Max streak XP multiplier" },
                { value: "500", label: "Coins for the first reward" },
                { value: "1 tap", label: "Widget habit logging" },
            ],
        },
        {
            slug: "xfactor",
            title: "XFactor",
            tag: "Systems Design",
            blurb: "A bizarre game-jam take on Reigns: Cold War diplomacy fought through tweets.",
            href: "/work/xfactor",
            externalUrl: "https://github.com/Abhisavvy/XFactor",
            skills: ["systems"],
            stats: [
                { value: "13", label: "Scenario premises" },
                { value: "5", label: "Rounds per match" },
                { value: "4", label: "Tweet tones" },
            ],
        },
        {
            slug: "woven",
            title: "Woven",
            tag: "Puzzle Systems Design",
            blurb: "My take on LinkedIn's Zip with multiple threads and colour merging: a tested rules engine (65 tests) plus a separate 117-level browser slice.",
            href: "/work/woven",
            externalUrl: "https://abhisavvy.github.io/woven-playtest/",
            skills: ["systems"],
            stats: [
                { value: "117", label: "Playtest levels" },
                { value: "11", label: "Level tiers" },
                { value: "65", label: "Rules-engine tests" },
            ],
        },
    ],
    caseStudies: {
        "bon-voyage": {
            title: "Bon Voyage",
            subtitle: "Long-term Retention · Economy Design · Word Roll",
            problem: "Coins came too easily in Word Roll. Every game win paid out coins, so players had more than they could use and the economy kept inflating. Nothing pulled people back over the long run either: they'd finish their daily goals and leave. And we had no real control over how much people played the side game modes compared with the main game.",
            approach: "I built Bon Voyage around two currencies.\n\nFirst, I took coins out of game wins and moved them into the season. You earn coins by unlocking Bon Voyage levels one at a time, with keys you get from playing the main game. So coin supply now grows with progress, not with every win.\n\nSecond, I introduced gems as the entry ticket for the game modes. To get gems you progress in Bon Voyage, and to progress you play the main game. That gave us a lever on how much the modes get played, and it always leads players back to the main game first.\n\nThe season runs for 60 days across 60 levels. I built the level curve from real player behaviour: casual players (P4–P6) should reach 40–50 levels, and our most dedicated players (P7–P8) should finish all 60.",
            constraints: "Word Roll has millions of downloads, and players were used to earning coins on every win. Now coins came from the season and modes cost gems. That could easily feel like we were taking things away. Sixty days is also a long time to hold attention: too slow and people drift off, too fast and casual players fall behind.",
            outcome: "- IAP revenue per user went up 12%.\n- New payer conversion rose 90 bps. With coins scarcer, more players chose to buy.\n- Existing payers bought more often (+3.2%) and spent more per purchase (+8.6%).\n- D1 retention rose 22 bps and session time 1.4%.\n- Non-payers sat on 16% fewer coins.",
            change: "Only 7% of players finished the season against the 9% we'd aimed for, so the pacing was too slow at the casual end. The event also pulled play away from Solo Series, because keys were easier to earn in some modes. I'd balance key earning across modes before launch next time.",
            loop: { title: "Season loop", steps: ["Play the main game", "Earn keys", "Unlock Bon Voyage levels", "Get coins and gems", "Spend gems to enter game modes"], cycles: true },
            notes: ["You earn coins by unlocking Bon Voyage levels one at a time, with keys you get from playing the main game."],
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
            problem: "Our veteran players had each settled into one mode. Someone would master Classic or Daily Bingo Hunt and never touch anything else. That made engagement dip on days without a leaderboard, and it meant they only ever saw a slice of the game.",
            approach: "Food Fiesta ran Monday to Saturday and connected every mode through one mechanic: bonus tiles. Finish a word on a DW or TW tile and you earn event progress, whichever mode you're in. Players could stay where they were comfortable, and the event gave them a gentle reason to try the rest.\n\nI gated it to players with 150+ lifetime moves in the D7+ cohorts, so everyone already knew the basics. Progress came from collecting tiles rather than from time passing, so engaged players moved faster and casual players weren't locked out. The reward track also carried Word Roll's first cosmetics, the Tiles skins.",
            constraints: "Rewards had to be balanced across modes so no single mode became the obvious farm. It had to run alongside our other live events. And the experiment itself had about 3% pre-allocation bias, which made the early numbers harder to trust.",
            outcome: "- Engagement among established players went up 7.5%, about 2.4 more moves each.\n- Rolling retention rose 50 bps.\n- Power-up use jumped 26%, as players got more deliberate about landing words on bonus tiles.\n- The share of players making 30+ moves grew by 200 bps.\n- Ad impressions went up 7–8%.\n\nMonday and Tuesday turned out to be the peak event days.",
            loop: { title: "Cross-mode event loop", steps: ["Play any mode", "Form words on DW/TW bonus tiles", "Earn event progress", "Rewards, including Tiles skins"], cycles: true },
            notes: ["Players could stay where they were comfortable, and the event gave them a gentle reason to try the rest."],
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
            problem: "Word Roll gave players no way to express themselves and no sense of ownership. Everything on screen did a job, and nothing was personal. We wanted customisation that players actually cared about, without cluttering a clean, focused game.",
            approach: "I designed tile skins, Word Roll's first cosmetic system. You change the look of the letter tiles you play with, and nothing about the rules changes.\n\nPlayers earn tile paints as rewards from Food Fiesta and Bon Voyage. Each paint is a gacha draw that reveals a tile for your collection. I modelled the odds in Machinations so it felt exciting without feeling unfair: common tiles arrive quickly, and rare ones give you something to chase. Because paints come from event rewards, the collection feels earned rather than bought.",
            constraints: "It was the game's first cosmetic system, so there was no visual language or player expectation to build on. Tiles had to feel like real ownership, not a stand-in for coins. And the gacha odds needed careful tuning between player satisfaction and revenue.",
            outcome: "- Revenue per DAU went up 22% (+8 cents).\n- IAP revenue doubled (+100%, +6 cents), and ad revenue rose 5% (+2 cents).\n- The gap between what payers earned and spent in coins moved about 1,200 coins per DAU toward spending, which drove the IAP gain.\n\nEvery cosmetic feature after this was built on the same system.",
            loop: { title: "Collection loop", steps: ["Play Food Fiesta or Bon Voyage", "Earn tile paints", "Paint gacha reveals a tile", "Tile joins your collection", "Equip it in play"], cycles: true },
            notes: ["Because paints come from event rewards, the collection feels earned rather than bought."],
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
            problem: "It started as my own headache. The thinking happened in the meeting, and everything after that was reformatting: pulling out the problem, the goals and the user flows, then writing the same points again for stakeholder emails. It was slow, and some of what we'd decided got lost on the way to the spec. I soon found out plenty of people around me had the same problem.",
            approach: "I built two tools that hand off to each other. Meeting Manager takes raw meeting notes from Granola and sorts them into the sections our specs use: problem, vision, business goals, design goals and user flows. Spec Maker takes those sections and writes the full feature spec in markdown.\n\nBoth tools use the same section headers, so nothing needs reformatting in between, and the same extraction also drafts the stakeholder email. Meeting Manager runs as a web app and Spec Maker runs locally. I built both with Cursor. PPTX export for presentations is next.",
            constraints: "Meeting notes vary a lot depending on whether they come from Granola or someone typing by hand. The spec template had to flex across very different features and still stay consistent. And none of it mattered unless the whole team actually used it.",
            outcome: "- The 8-person dev team adopted it as our standard spec workflow.\n- Documentation efficiency went up 25%.\n- One meeting now feeds the spec and the stakeholder email, so we stopped rewriting the same content for emails, specs and presentations.\n- People joining a project halfway through get the full context from the spec, without a handover session.",
            loop: { title: "Meeting-to-spec pipeline", steps: ["Meeting notes (Granola)", "Meeting Manager sorts sections", "Spec Maker generates the spec", "Specs + stakeholder emails"], cycles: false },
            notes: ["The thinking happened in the meeting, and everything after that was reformatting: pulling out the problem, the goals and the user flows, then writing the same points again for stakeholder emails."],
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
            problem: "I love puzzles where the rules fit in one sentence and the levels do the talking. Woven is my take on LinkedIn's Zip, with a twist. Zip gives you one line to draw through numbered checkpoints until the grid is full. Woven gives you several lines at once and uses colour merging as a mechanic.",
            approach: "Each level has two or more threads with numbered checkpoints. You drag each thread from its start through its checkpoints in order, and the level is solved when every cell is filled and no threads cross.\n\nI built the rules engine first, in C# for Unity, and kept it free of engine code so it can be tested on its own. Every move goes through one ordered checklist (adjacency, walls, gates, one-way entry, occupancy, checkpoint order), so a move is either fully legal or rejected with a reason. Gates open and close based on the other threads' progress, and that state is always recalculated, never stored, so a future undo or replay can rebuild it exactly. 65 automated tests cover it. I set the project up on the open-source Claude Code Game Studios template and wrote the engine with Claude as my pair.\n\nSeparately, I put a playable browser slice online: 117 levels across 11 tiers, where each early tier adds one idea. Gates block the edges between cells, and Crossings add weave cells where two threads are allowed to cross. There's undo, hints that cost coins, and a 1–3 star rating.",
            constraints: "Puzzle rules have to be airtight. If a move is half-applied or a gate falls out of sync, the level breaks. Knowing when a player is stuck was a trade-off too: a full solvability check is expensive, so the engine only checks whether any thread still has a legal move.",
            outcome: "The browser slice is live for playtesting. After every solve it asks \"How did that feel?\" (Easy, Just right or Hard), so difficulty feedback comes straight from players.",
            loop: { title: "Puzzle loop", steps: ["Drag a thread from its start", "Hit checkpoints in order", "Fill every cell", "Solve for coins and stars", "Spend coins on hints"], cycles: true },
            notes: ["I love puzzles where the rules fit in one sentence and the levels do the talking."],
            links: [
                { label: "Play the playtest", href: "https://abhisavvy.github.io/woven-playtest/" },
                { label: "GitHub repository", href: "https://github.com/Abhisavvy/Woven" }
            ],
            media: {
                hero: {
                    posterSrc: "/assets/woven/hero-playtest.png"
                },
                processGallery: {
                    groupId: "woven-process",
                    heading: "Design process",
                    items: [
                        {
                            thumb: "/assets/woven/woven-playtest-menu.png",
                            full: "/assets/woven/woven-playtest-menu.png",
                            alt: "Woven playtest title screen menu",
                            label: "Title Screen"
                        },
                        {
                            thumb: "/assets/woven/woven-playtest-start.png",
                            full: "/assets/woven/woven-playtest-start.png",
                            alt: "Woven playtest level start screen",
                            label: "Level Start"
                        },
                        {
                            thumb: "/assets/woven/woven-playtest-midsolve.png",
                            full: "/assets/woven/woven-playtest-midsolve.png",
                            alt: "Woven playtest mid-solve screen showing a weave crossing",
                            label: "Weave Crossing Mid-Solve"
                        },
                        {
                            thumb: "/assets/woven/woven-playtest-solved.png",
                            full: "/assets/woven/woven-playtest-solved.png",
                            alt: "Woven playtest solved screen with the difficulty feedback prompt",
                            label: "Solved + Difficulty Prompt"
                        }
                    ]
                }
            }
        },
        xfactor: {
            title: "XFactor",
            subtitle: "Systems Design · Narrative Systems · Personal Project",
            problem: "XFactor started at a game jam. I'd been wanting to build a reactive story system inspired by Reigns, where your choices keep piling up into consequences. I wanted mine to be bizarre, and I wanted it to show how social media pushes real-world politics around. So I put the Cold War on Twitter.",
            approach: "XFactor is a two-player, pass-and-play game. One of you is the USA, the other the USSR. Each round a headline drops, and you both pick a tweet in a tone: diplomatic, covert, aggressive or unhinged. The Global Favor meter swings depending on how your tones clash, and if you both go aggressive, whoever loses the exchange gets ratioed.\n\nUnder the hood, a story memory tracks how heated things are getting and picks up on what you actually tweeted about, like nukes, hacking, the moon or aliens. The hotter it gets, the more absurd the next headline. Thirteen scenarios run on the same engine, from a Moon laser crisis to a cloned president, with several endings, including mutually assured destruction.\n\nThe first version was a Google AI Studio prototype. I added the story engine with Cursor, then a feed of reaction tweets and a restyle.",
            constraints: "Everything is hand-written: headlines, tweet options, endings, reaction tweets. So the system had to get a lot of variety out of a fixed pool, and every new scenario had to plug into the same escalation maths instead of needing its own logic.",
            outcome: "It's a playable web game with 13 scenarios and five rounds a match. The second pass added the reaction feed and removed repeat events, and fixed a bug that stopped play after round 1.",
            loop: { title: "Round loop", steps: ["A headline drops", "Both players pick a tweet tone", "Global Favor and engagement shift", "Escalation picks the next event"], cycles: true },
            notes: ["I wanted mine to be bizarre, and I wanted it to show how social media pushes real-world politics around."],
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
            problem: "Habit trackers die fast. You tick a box, nothing happens, and a week later you've stopped opening the app. I built Habiteer for my partner and my friends, to see what happens when a tracker is built like a game economy instead: every habit pays out, streaks multiply your XP, and the coins buy a reward you actually want. In my plan that reward was a 500-coin dinner, about three weeks of showing up.",
            approach: "Habiteer is an Android app I designed and built on my own, with React Native (Expo) and Supabase. The loop: do a habit or task, earn XP and coins, XP levels you up and moves you through weekly leagues, and coins buy your rewards. Groups can pool coins toward shared rewards and keep a group streak going.\n\nA few rules keep the economy honest:\n- Only habits carry streaks, and the streak multiplier (×1.2 at 3 days, up to ×3 at 30) only boosts XP, never coins, so a reward's price stays a fixed target.\n- Tasks pay coins but no XP.\n- Levels give status, cosmetics and unlocks, never coins, so nothing inflates.\n\nAll the game logic runs on the server, so nobody can fake their XP from the app. There's a home-screen widget too, because the whole idea falls apart if logging a habit takes more than one tap. I built it with Claude Code as my pair programmer.",
            constraints: "I wanted it to cost nothing to run: Supabase's free tier, installed directly on Android instead of through the Play Store, and no server cron, so the weekly league reset happens when you open the leaderboard. The widget needs a custom native module, so I had to test on a real phone with a dev build. iOS is on hold because widgets there need a paid Apple developer account.",
            outcome: "v1 and the full v2 roadmap shipped, plus the first v3 features: reminders, sounds and haptics, group streaks and weekly quests. Testing on my phone caught real bugs, like forms opening below the fold on long lists and shadows not rendering on Android. And setting up a brand-new account showed me a new user had to make six decisions before completing anything, so I added one-tap starter habits.",
            loop: { title: "Core loop", steps: ["Do a habit or task", "Earn XP + coins", "XP levels you up and climbs the league", "Coins buy a reward you want"], cycles: true },
            notes: ["You tick a box, nothing happens, and a week later you've stopped opening the app."],
            links: [
                { label: "GitHub repository", href: "https://github.com/Abhisavvy/habiteer" }
            ],
            media: {
                hero: {
                    posterSrc: "/assets/habiteer/hero-app.png"
                },
                processGallery: {
                    groupId: "habiteer-process",
                    heading: "App screens (sample data)",
                    items: [
                        {
                            thumb: "/assets/habiteer/habiteer-today.png",
                            full: "/assets/habiteer/habiteer-today.png",
                            alt: "Habiteer Today screen with habit streaks and combo multipliers, sample data",
                            label: "Today"
                        },
                        {
                            thumb: "/assets/habiteer/habiteer-complete.png",
                            full: "/assets/habiteer/habiteer-complete.png",
                            alt: "Habiteer habit completion moment showing a +12 XP popup and an undo toast, sample data",
                            label: "Completing a Habit"
                        },
                        {
                            thumb: "/assets/habiteer/habiteer-levelup.png",
                            full: "/assets/habiteer/habiteer-levelup.png",
                            alt: "Habiteer Level 5 level-up overlay with the Ember mascot and confetti, sample data",
                            label: "Level Up with Ember"
                        },
                        {
                            thumb: "/assets/habiteer/habiteer-league.png",
                            full: "/assets/habiteer/habiteer-league.png",
                            alt: "Habiteer Gold League leaderboard with promotion and relegation zones, sample data",
                            label: "Weekly League"
                        },
                        {
                            thumb: "/assets/habiteer/habiteer-rewards.png",
                            full: "/assets/habiteer/habiteer-rewards.png",
                            alt: "Habiteer Rewards screen with a redeemable 500-coin Dinner Out reward, sample data",
                            label: "Rewards"
                        },
                        {
                            thumb: "/assets/habiteer/habiteer-stats.png",
                            full: "/assets/habiteer/habiteer-stats.png",
                            alt: "Habiteer Stats screen with a record streak, an 8-week coin chart, and per-habit completion rates, sample data",
                            label: "Stats"
                        },
                        {
                            thumb: "/assets/habiteer/widgets/home-screen.webp",
                            full: "/assets/habiteer/widgets/home-screen.webp",
                            alt: "Habiteer home-screen widgets arranged together on an Android home screen, sample data",
                            label: "Home-Screen Widgets"
                        },
                        {
                            thumb: "/assets/habiteer/widgets/widget-daily-strip.webp",
                            full: "/assets/habiteer/widgets/widget-daily-strip.webp",
                            alt: "Habiteer Daily Strip home-screen widget showing level progress and today's habit checklist, sample data",
                            label: "Daily Strip Widget (4×4)"
                        },
                        {
                            thumb: "/assets/habiteer/widgets/widget-habit.webp",
                            full: "/assets/habiteer/widgets/widget-habit.webp",
                            alt: "Habiteer Today home-screen widget showing a compact habit checklist, sample data",
                            label: "Today Widget (3×2)"
                        },
                        {
                            thumb: "/assets/habiteer/widgets/widget-quest.webp",
                            full: "/assets/habiteer/widgets/widget-quest.webp",
                            alt: "Habiteer Quest home-screen widget showing weekly quest progress, sample data",
                            label: "Quest Widget (4×2)"
                        },
                        {
                            thumb: "/assets/habiteer/widgets/widget-companion.webp",
                            full: "/assets/habiteer/widgets/widget-companion.webp",
                            alt: "Habiteer Companion home-screen widget showing the Ember mascot and current streak, sample data",
                            label: "Companion Widget (2×2)"
                        },
                        {
                            thumb: "/assets/habiteer/widgets/widget-streak.webp",
                            full: "/assets/habiteer/widgets/widget-streak.webp",
                            alt: "Habiteer Streak home-screen widget showing the current day streak, sample data",
                            label: "Streak Widget (2×2)"
                        },
                        {
                            thumb: "/assets/habiteer/widgets/widget-combo.webp",
                            full: "/assets/habiteer/widgets/widget-combo.webp",
                            alt: "Habiteer Combo home-screen widget showing the current streak combo multiplier, sample data",
                            label: "Combo Widget (2×2)"
                        }
                    ]
                }
            }
        },
        "kinoa-integration": {
            title: "Kinoa LiveOps Integration",
            subtitle: "LiveOps Platform · SDK Integration",
            problem: "Every new event used to take about seven days of development, and it had to go out in an app release. That made LiveOps slow, and there was no easy way to aim an event at a particular group of players.",
            approach: "I wrote the design doc for integrating the Kinoa.io SDK, so engineering knew exactly what to build. Once it was in, I set up the LiveOps flows and in-app configurations for our events, then tested and tuned them live.\n\nKinoa let us target players by spend, engagement and usage habits. An event stopped being a development task and became a modular setup.",
            constraints: "The SDK had to fit into a codebase that was already live, and testing and tuning events ran on tight timelines.",
            outcome: "- Setting up an event went from about 7 days of development to about an hour, with no app release needed.\n- We could target specific cohorts by spend, engagement and usage habits.\n- We shipped 5 cohort-personalised events this way.\n- The modular setup made us very fast to execute, with very few trade-offs.",
            loop: { title: "LiveOps loop", steps: ["Pick a cohort (spend, engagement, habits)", "Configure the event in Kinoa", "Live in game within an hour", "Test and tune"], cycles: true },
            notes: ["An event stopped being a development task and became a modular setup."],
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/kinoa-integration/kinoa-poster.webp"
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
            problem: "Word of the Day used to be a popup with nothing to do on it. You saw a word and its definition, and your only option was to close it. We wanted the daily word to be something players went looking for and could actually play with.",
            approach: "I turned it into a two-step collection game. First, you collect the day's letters just by playing normally; they turn up on the board as you go. Once you have them all, you can play the word in your game, and only then do you see what it means.\n\nThe idea was simple: a definition lands better after you've earned the word. I also set the rules for picking each day's word, balancing difficulty and relevance, and worked closely with our UX team so it felt native to the game.",
            constraints: "It had to make sense without a tutorial, fit inside a normal session, and stay out of the way in modes where it didn't belong.",
            outcome: "- D30 LTV went up 9.4%.\n- D1 retention rose 140 bps against the control group.\n- Overall engagement went up 3%.\n- 55% of daily players collected letters, and 34% went on to complete the word.\n\nIt was switched off in Daily Bingo Hunt (DBH), and players there saw no impact.",
            loop: { title: "Daily discovery loop", steps: ["Play normally", "Collect the day's letters", "Complete and use the word", "Definition revealed"], cycles: true },
            notes: ["The idea was simple: a definition lands better after you've earned the word."],
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/wotd/wotd-poster.webp"
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
            problem: "The old leaderboard gave you points for finishing games. There was no skill in it: whoever played the most games climbed. That made it a weak driver of competition. We wanted a leaderboard you win by playing well, not just by playing a lot.",
            approach: "I tied the leaderboard to tickets. Every row you complete on the gameboard pays a ticket, and completing rows takes skill.\n\nThat added a small tension to every turn: play your best word, or go for the row that pays a ticket? It also gave swaps a real purpose without us having to push them.\n\nI redesigned the entry flow too, so there was less standing between \"I want to compete\" and actually playing.",
            constraints: "Bucketing had to feel fair to everyone. The bot-chase logic we'd inherited from the old leaderboard didn't suit the new mechanic. The first-time flow dropped players onto the leaderboard screen, which was a dead end. And booster prices clashed with swap prices, which quietly hurt booster sales. I traced that back to pricing and flagged it, along with the bot logic, without holding up the launch.",
            outcome: "- Revenue per user went up 7% (about 3 cents), mostly from IAP.\n- D7 LTV rose 10%.\n- D1 retention rose 300 bps overall, and 170 bps for organic D2+ players.\n- Rolling retention rose 50 bps, and new payer conversion rose 55 bps.\n- Swap usage went up by 100 coins per user. The flip side: the average coin balance swung from +50 to −5 per user, so we kept a close eye on the economy.",
            loop: { title: "Competition loop", steps: ["Complete rows on the gameboard", "Earn a ticket per row", "Climb the leaderboard", "Play the next game"], cycles: true },
            notes: ["That added a small tension to every turn: play your best word, or go for the row that pays a ticket?"],
            links: [],
            media: {
                hero: {
                    posterSrc: "/assets/ticket-mania/ticket-mania-poster.webp"
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
