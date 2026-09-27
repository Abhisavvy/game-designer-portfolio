"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { usePrefersReducedMotion } from "./media/useMediaPreferences";
import { SectionHeading } from "./ui/SectionHeading";
import { CountUp } from "./ui/CountUp";
import {
  Target,
  RefreshCcw,
  DollarSign,
  BarChart3,
  Brain,
  Users,
  Gamepad2
} from "lucide-react";

interface Skill {
  name: string;
  description: string;
  impact: string;
  icon: React.ComponentType<{ className?: string }>;
}

const skills: Skill[] = [
  {
    name: "LiveOps & Event Design",
    description: "Week-long events and 60-day seasons, configured in Kinoa with no app release.",
    impact: "5 cohort-personalised events (Kinoa)",
    icon: Target
  },
  {
    name: "Retention Mechanics",
    description: "Daily loops that give people a reason to open the app tomorrow.",
    impact: "+300 bps D1 retention (Ticket Mania)",
    icon: RefreshCcw
  },
  {
    name: "Economy Design",
    description: "Coins, gems, keys and tile paints: where each comes from and what it's worth.",
    impact: "+12% IAP revenue per user (Bon Voyage)",
    icon: DollarSign
  },
  {
    name: "A/B Testing",
    description: "Testing design changes with product against a control group.",
    impact: "+140 bps D1 retention (WOTD test)",
    icon: BarChart3
  },
  {
    name: "Player Motivation",
    description: "Designing for what casual (P4–P6) and dedicated (P7–P8) players each want.",
    impact: "+7.5% engagement (Food Fiesta)",
    icon: Brain
  }
];

export function StickySkillsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Disable parallax transforms when reduced motion is preferred
  const backgroundY = useTransform(scrollYProgress, [0, 1], reducedMotion ? ["0%", "0%"] : ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], reducedMotion ? ["0%", "0%"] : ["0%", "20%"]);

  return (
    <section id="skills" ref={containerRef} className="relative bg-zinc-950 py-16 overflow-hidden">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-900/15 via-zinc-950 to-orange-800/20"
        style={{ y: backgroundY }}
      />

      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(249, 115, 22, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 115, 22, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px"
        }} />
      </div>

      <div className="relative z-10">
        {/* Section header. `y` has exactly one owner per element: the OUTER
            motion.div owns the continuous scroll-linked parallax (`textY`,
            a motion value written straight to style — Framer never touches
            it), and the INNER one owns the one-shot entrance animation
            (`initial`/`whileInView`'s own `y`, via Framer's normal animate
            system). Both used to live on the SAME element, which meant two
            different mechanisms were driving the same transform property at
            once — visually it could jitter, since the entrance spring and
            the scroll-driven value were fighting over one `y`. Nesting them
            composes the two motions additively (still slides up on entrance
            *and* drifts with scroll) without either fighting the other. */}
        <motion.div className="pt-12 pb-8" style={{ y: textY }}>
          <motion.div
            className="bp-reveal"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <div className="mx-auto max-w-6xl px-6">
              <SectionHeading index="03" eyebrow="Core Capabilities" title="Systems Expertise" />
            </div>
          </motion.div>
        </motion.div>

        {/* Compact skills showcase — all 5 cards share one fixed size */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {skills.map((skill, index) => (
              <div
                key={skill.name}
                className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)] lg:w-[calc(20%-0.8rem)]"
              >
                <CompactSkillCard skill={skill} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Impact metrics strip — all 4 stat boxes share one fixed size */}
        <motion.div
          className="bp-reveal bg-gradient-to-r from-orange-600/10 to-orange-500/15 border-y border-orange-500/20 py-8 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <MetricDisplay number="40k+" from={4} delay={0} label="Word Roll DAU, from 4k" icon={Users} />
              <MetricDisplay number="+22%" from={0} delay={120} label="Rev/DAU · Tiles" icon={DollarSign} />
              <MetricDisplay number="+300 bps" from={0} delay={240} label="D1 retention · Ticket Mania" icon={RefreshCcw} />
              <MetricDisplay number="25+" from={0} delay={360} label="Features shipped" icon={Gamepad2} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface CompactSkillCardProps {
  skill: Skill;
  index: number;
}

function CompactSkillCard({ skill, index }: CompactSkillCardProps) {
  return (
    <motion.div
      className="bp-reveal group relative h-full"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
      }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -2 }}
    >
      {/* Fixed height (not min-height) so every card matches exactly,
          regardless of whether the title wraps to one or two lines. */}
      <div
        data-testid="skill-card"
        className="flex h-[180px] flex-col rounded-lg border border-zinc-700/50 bg-zinc-800/60 p-4 transition-all duration-300 group-hover:border-accent/50 group-hover:bg-zinc-800/80"
      >
        {/* Icon and Title — reserves room for a 2-line title so the
            description always starts at the same y across all cards. */}
        <div className="mb-2 flex items-start gap-2">
          <skill.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-paper">
            {skill.name}
          </h3>
        </div>

        {/* Description — readable contrast on the dark card background */}
        <p className="line-clamp-4 flex-1 text-xs leading-snug text-muted">
          {skill.description}
        </p>

        {/* Hover effect overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-orange-600/5 to-orange-500/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.div>
  );
}

interface MetricDisplayProps {
  number: string;
  /** Starting number the count-up animates from (default 0). */
  from?: number;
  /** Stagger delay (ms) applied after this box enters view. */
  delay?: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MetricDisplay({ number, from = 0, delay = 0, label, icon: Icon }: MetricDisplayProps) {
  return (
    <motion.div
      data-testid="stat-box"
      className="bp-reveal flex h-[152px] flex-col items-center justify-center rounded-lg border border-orange-500/20 bg-black/20 px-3 py-4 text-center"
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", damping: 20 }}
      viewport={{ once: true }}
    >
      <div className="flex justify-center mb-3">
        <div className="p-2 bg-orange-600/20 rounded-full">
          <Icon className="w-6 h-6 text-orange-400" />
        </div>
      </div>
      <div className="text-3xl md:text-4xl font-bold mb-2">
        <CountUp
          value={number}
          from={from}
          delay={delay}
          className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent"
        />
      </div>
      <div className="line-clamp-2 text-gray-400 text-sm uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}
