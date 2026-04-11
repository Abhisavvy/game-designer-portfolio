"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import type { ProjectItem } from "@/features/portfolio/data/site-content";
import { OptimizedImage } from "./OptimizedImage";
import { 
  Utensils, 
  Plane, 
  BookOpen, 
  Trophy, 
  Palette,
  Calendar,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCcw,
  ArrowRight,
  Bot,
  Workflow
} from "lucide-react";

interface ProjectCardAnimatedProps {
  project: ProjectItem;
  index: number;
}

// Get project-specific icon based on project slug/title
function getProjectIcon(slug: string) {
  switch (slug) {
    case "food-fiesta": return Utensils;
    case "bon-voyage": return Plane;
    case "wotd": return BookOpen;
    case "ticket-mania": return Trophy;
    case "tiles": return Palette;
    case "ai-innovation": return Bot;
    case "kinoa-integration": return Workflow;
    default: return Target;
  }
}

// Get metric-specific icon
function getMetricIcon(metric: string) {
  const lowerMetric = metric.toLowerCase();
  
  // Revenue/monetization metrics
  if (lowerMetric.includes('arpdau') || lowerMetric.includes('ltv') || lowerMetric.includes('lift')) {
    return DollarSign;
  }
  
  // Retention/comeback metrics
  if (lowerMetric.includes('retention') || lowerMetric.includes('bps')) {
    return RefreshCcw;
  }
  
  // Social/engagement metrics
  if (lowerMetric.includes('engagement') || lowerMetric.includes('dau') || lowerMetric.includes('social') || lowerMetric.includes('collaboration')) {
    return Users;
  }
  
  // Performance/productivity metrics
  if (lowerMetric.includes('efficiency') || lowerMetric.includes('faster') || lowerMetric.includes('planning') || lowerMetric.includes('productivity')) {
    return TrendingUp;
  }
  
  // Economy/design systems
  if (lowerMetric.includes('economy') || lowerMetric.includes('cosmetic') || lowerMetric.includes('ownership') || lowerMetric.includes('rewards')) {
    return DollarSign;
  }
  
  // Integration/technical
  if (lowerMetric.includes('sdk') || lowerMetric.includes('integration') || lowerMetric.includes('flow') || lowerMetric.includes('management')) {
    return Target;
  }
  
  // Core systems/features
  if (lowerMetric.includes('systems') || lowerMetric.includes('feature') || lowerMetric.includes('core') || lowerMetric.includes('mechanics')) {
    return Target;
  }
  
  // Default for improvement metrics
  return TrendingUp;
}

export function ProjectCardAnimated({ project, index }: ProjectCardAnimatedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const IconComponent = getProjectIcon(project.slug);

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay: index * 0.1,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <Link href={project.href} className="block">
      <motion.div
        ref={ref}
        className="group relative cursor-pointer"
        variants={cardVariants}
        initial="visible"
        animate="visible"
        whileHover={{ y: -8 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="relative h-80 bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden border border-zinc-700/50 transition-all duration-500 group-hover:border-orange-500/50 group-hover:shadow-2xl group-hover:shadow-orange-500/15">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-orange-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Project Screenshot or Placeholder */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.1 + 0.1 }}
        >
          <OptimizedImage
            src={`/assets/${project.title.toLowerCase().replace(/\s+/g, '-')}/hero-image.webp`}
            fallbackSrc={`/assets/${project.title.toLowerCase().replace(/\s+/g, '-')}/hero-image.png`}
            secondaryFallback={`/assets/${project.title.toLowerCase().replace(/\s+/g, '-')}/hero-image.jpg`}
            alt={`${project.title} - Game Screenshot`}
            width={400}
            height={320}
            className="w-full h-full object-cover"
            placeholder={
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800/50 to-zinc-900/70">
                <div className="text-center p-6">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-zinc-700/50 border-2 border-dashed border-orange-400/30 rounded-lg flex items-center justify-center mx-auto">
                      <IconComponent className="w-10 h-10 text-orange-400/60" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                  </div>
                  <div className="text-orange-300/80 text-sm font-medium mb-1">{project.title}</div>
                  <div className="text-gray-400/60 text-xs">Screenshot placeholder</div>
                </div>
              </div>
            }
          />
        </motion.div>
        
        {/* Project icon */}
        <motion.div
          className="absolute top-4 left-4 z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring", damping: 15 }}
        >
          <div className="p-2 bg-orange-600/40 backdrop-blur-sm border border-orange-500/50 rounded-full drop-shadow-md">
            <IconComponent className="w-5 h-5 text-orange-200" />
          </div>
        </motion.div>

        {/* Top badge/tag */}
        <motion.div
          className="absolute top-4 right-4 z-10"
          initial={{ x: 20, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <span className="px-3 py-1 bg-orange-600/40 backdrop-blur-sm border border-orange-500/50 rounded-full text-orange-200 text-sm font-medium drop-shadow-md">
            {project.tag}
          </span>
        </motion.div>

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Main content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <motion.h3
            className="text-2xl font-bold text-white mb-3 group-hover:text-orange-300 transition-colors drop-shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            {project.title}
          </motion.h3>
          
          <motion.p
            className="text-gray-100 leading-relaxed group-hover:text-white transition-colors drop-shadow-md"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            {project.blurb}
          </motion.p>

          {/* Impact metrics - extracted from blurb */}
          <motion.div
            className="flex flex-wrap gap-2 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ delay: index * 0.1 + 0.6 }}
          >
            {(() => {
              const extractedMetrics = extractMetrics(project.blurb);
              const displayMetrics = extractedMetrics.length > 0 ? extractedMetrics : getFallbackBadges(project);
              
              return displayMetrics.map((metric, metricIndex) => {
                const MetricIcon = getMetricIcon(metric);
                const isExtracted = extractedMetrics.includes(metric);
                
                return (
                  <span
                    key={metricIndex}
                    className={`inline-flex items-center gap-1 px-2 py-1 backdrop-blur-sm border rounded text-xs font-medium drop-shadow-md ${
                      isExtracted 
                        ? 'bg-green-600/40 border-green-500/50 text-green-200'
                        : 'bg-blue-600/40 border-blue-500/50 text-blue-200'
                    }`}
                  >
                    <MetricIcon className="w-3 h-3" />
                    {metric}
                  </span>
                );
              });
            })()}
          </motion.div>
        </div>

        {/* Hover overlay with "View Case Study" */}
        <motion.div
          className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          variants={overlayVariants}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full text-black font-semibold">
              <span>View Case Study</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
    </Link>
  );
}

// Helper function to extract metrics from blurb text with descriptive context
function extractMetrics(blurb: string): string[] {
  const metrics: string[] = [];
  
  // Enhanced patterns that capture context with numbers
  const contextualPatterns = [
    // ARPDAU patterns
    { regex: /ARPDAU[\s\+]*(\+?\d+%)/i, template: (match: string) => `${match} ARPDAU` },
    
    // LTV patterns  
    { regex: /(\~?\+?\d+%\s?LTV\s?lift)/i, template: (match: string) => match },
    
    // Engagement patterns
    { regex: /(engagement[\s\+]*\+?\d+%)/i, template: (match: string) => match },
    { regex: /lifted\s+engagement\s+(\d+%)/i, template: (match: string) => `${match} engagement` },
    
    // Retention patterns
    { regex: /(D1.*?retention[\s\+]*\+?\d+\s?bps)/i, template: (match: string) => match },
    { regex: /(D1\s+.*?retention[\s\+]*\+?\d+\s?bps)/i, template: (match: string) => match },
    { regex: /retention\s+(\+?\d+\s?bps)/i, template: (match: string) => `${match} retention` },
    
    // Efficiency/productivity patterns
    { regex: /(\d+%\s+.*?efficiency)/i, template: (match: string) => match },
    { regex: /(\d+%\s+faster.*?planning)/i, template: (match: string) => match },
    
    // Generic percentage with context (look for nearby words)
    { regex: /(\d+%)[^a-zA-Z]*([a-zA-Z]+)/, template: (match: string, context?: string) => {
      if (context && !['and', 'the', 'of', 'in', 'to'].includes(context.toLowerCase())) {
        return `${match} ${context}`;
      }
      return match;
    }},
  ];
  
  // Apply contextual patterns
  contextualPatterns.forEach(({ regex, template }) => {
    const matches = blurb.match(regex);
    if (matches && matches[1]) {
      // Handle single matches (simplified to avoid global regex complexity)
      const result = template(matches[1], matches[2]);
      if (!metrics.some(m => m.includes(matches[1].replace(/[^\w\d%]/g, '')))) {
        metrics.push(result);
      }
    }
  });
  
  // If no contextual metrics found, look for standalone numbers and try to add context
  if (metrics.length === 0) {
    // Standalone percentage with manual context assignment
    const percentMatches = blurb.match(/([\+\-]?\d+%)/g);
    if (percentMatches) {
      percentMatches.forEach(percent => {
        let contextualMetric = percent;
        
        // Add context based on surrounding text
        if (blurb.toLowerCase().includes('arpdau') && blurb.indexOf('arpdau') < blurb.indexOf(percent) + 20) {
          contextualMetric = `${percent} ARPDAU`;
        } else if (blurb.toLowerCase().includes('engagement') && Math.abs(blurb.indexOf('engagement') - blurb.indexOf(percent)) < 20) {
          contextualMetric = `${percent} engagement`;
        } else if (blurb.toLowerCase().includes('efficiency')) {
          contextualMetric = `${percent} efficiency`;
        } else if (blurb.toLowerCase().includes('faster')) {
          contextualMetric = `${percent} faster`;
        } else {
          contextualMetric = `${percent} improvement`;
        }
        
        metrics.push(contextualMetric);
      });
    }
    
    // Basis points with context
    const bpsMatches = blurb.match(/([\+\-]?\d+\s?bps)/gi);
    if (bpsMatches) {
      bpsMatches.forEach(bps => {
        if (blurb.toLowerCase().includes('retention')) {
          metrics.push(`${bps} retention`);
        } else {
          metrics.push(`${bps} lift`);
        }
      });
    }
  }
  
  // Clean up and limit
  const uniqueMetrics = [...new Set(metrics)].map(metric => 
    metric.replace(/\s+/g, ' ').trim()
  );
  
  return uniqueMetrics.slice(0, 3);
}

// Fallback badges for projects without extractable metrics
function getFallbackBadges(project: ProjectItem): string[] {
  const fallbacks: { [key: string]: string[] } = {
    "ai-innovation": ["25% doc efficiency", "40% faster planning", "AI productivity tools"],
    "kinoa-integration": ["SDK integration", "Player flow optimization", "Event management"],
    "tiles": ["Economy redesign", "Cosmetic rewards", "Player ownership"],
    "bon-voyage": ["Social mechanics", "PvP features", "Player collaboration"],
  };
  
  return fallbacks[project.slug] || ["Core systems", "Player engagement", "Feature design"];
}