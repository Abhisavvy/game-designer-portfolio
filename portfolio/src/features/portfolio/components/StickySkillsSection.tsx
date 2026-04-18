"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { usePrefersReducedMotion } from "./media/useMediaPreferences";
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
    description: "Time-limited events and seasonal content systems",
    impact: "22% ARPDAU increase",
    icon: Target
  },
  {
    name: "Retention Mechanics",
    description: "Daily loops and progression systems design",
    impact: "300 bps D1 retention lift",
    icon: RefreshCcw
  },
  {
    name: "Economy Design",
    description: "Currency balance and monetization funnels",
    impact: "12% IAP conversion",
    icon: DollarSign
  },
  {
    name: "A/B Testing Framework",
    description: "Data-driven optimization and experimentation",
    impact: "40k+ DAU validation",
    icon: BarChart3
  },
  {
    name: "Player Psychology",
    description: "Behavioral patterns and motivation systems",
    impact: "3% engagement boost",
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
    <section id="skills" ref={containerRef} className="relative bg-zinc-950 py-16 overflow-hidden" style={{ scrollMarginTop: '3.5rem' }}>
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
        {/* Section header */}
        <motion.div
          className="text-center pt-12 pb-8 px-6"
          style={{ y: textY }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              Systems Expertise
            </span>
            {/* Highlight line */}
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-400 mx-auto mt-2 rounded-full" />
          </motion.h2>
        </motion.div>

        {/* Compact skills showcase */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
            {skills.map((skill, index) => (
              <CompactSkillCard key={skill.name} skill={skill} index={index} />
            ))}
          </div>
        </div>

        {/* Impact metrics strip */}
        <motion.div
          className="bg-gradient-to-r from-orange-600/10 to-orange-500/15 border-y border-orange-500/20 py-8 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <MetricDisplay number="40k+" label="DAU Growth" icon={Users} />
              <MetricDisplay number="22%" label="ARPDAU Increase" icon={DollarSign} />
              <MetricDisplay number="300" label="bps Retention" icon={RefreshCcw} />
              <MetricDisplay number="15+" label="Features Shipped" icon={Gamepad2} />
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
      className="group relative"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
      }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -2 }}
    >
      <div className="h-auto min-h-[140px] p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-lg transition-all duration-300 group-hover:border-orange-500/50 group-hover:bg-zinc-800/80 flex flex-col">
        {/* Icon and Title Row */}
        <div className="flex items-center space-x-2 mb-2">
          <skill.icon className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors flex-shrink-0" />
          <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors leading-tight">
            {skill.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 leading-snug mb-3 group-hover:text-gray-300 transition-colors flex-1">
          {skill.description}
        </p>
        
        {/* Impact badge */}
        <div className="inline-flex items-center justify-start space-x-1 px-2 py-1 bg-green-600/20 border border-green-500/30 rounded text-left self-start">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-300 text-xs font-medium">{skill.impact}</span>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-orange-500/8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}

interface MetricDisplayProps {
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MetricDisplay({ number, label, icon: Icon }: MetricDisplayProps) {
  return (
    <motion.div
      className="text-center"
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
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-400 text-sm uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}