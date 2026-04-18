"use client";

import { motion } from "framer-motion";
import { useAnimationTrigger } from "@/hooks/useIntersectionObserver";
import Link from "next/link";
import type { ProjectItem } from "@/features/portfolio/data/site-content";
import { getProjectListingImageSources } from "@/features/portfolio/utils/project-media";
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
  /** When set (e.g. case study hero poster), used as primary card image with hero-image.* fallbacks. */
  listingPosterSrc?: string | null;
}

// Get project-specific icon based on project slug/title
function getProjectIcon(slug: string) {
  switch (slug) {
    case "seasons": return Calendar;
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

export function ProjectCardAnimated({
  project,
  index,
  listingPosterSrc,
}: ProjectCardAnimatedProps) {
  const { ref, shouldAnimate, prefersReducedMotion } = useAnimationTrigger({
    threshold: 0.2,
    triggerOnce: true,
  });
  const IconComponent = getProjectIcon(project.slug);

  // Helper function to conditionally disable animations
  const getAnimateProps = (animateProps: any) => {
    if (prefersReducedMotion) return { opacity: 1, y: 0, scale: 1, x: 0, rotate: 0 };
    return animateProps;
  };

  const getTransitionProps = (transitionProps: any) => {
    if (prefersReducedMotion) return { duration: 0 };
    return transitionProps;
  };
  const { src, fallbackSrc, secondaryFallback } = getProjectListingImageSources(
    project.slug,
    listingPosterSrc,
  );

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
        className="group relative cursor-pointer w-full"
        variants={cardVariants}
        initial="hidden"
        animate={getAnimateProps(shouldAnimate ? "visible" : "hidden")}
        whileHover={!prefersReducedMotion ? { y: -8 } : {}}
        transition={getTransitionProps({ type: "spring", damping: 25, stiffness: 200 })}
      >
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10] min-h-[280px] bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden border border-zinc-700/50 transition-all duration-500 group-hover:border-orange-500/50 group-hover:shadow-2xl group-hover:shadow-orange-500/15">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-orange-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Project Screenshot or Placeholder */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={getAnimateProps(shouldAnimate ? { opacity: 1 } : { opacity: 0 })}
          transition={getTransitionProps({ delay: index * 0.1 + 0.1 })}
        >
          <OptimizedImage
            src={src}
            fallbackSrc={fallbackSrc}
            secondaryFallback={secondaryFallback}
            alt={`${project.title} - Game Screenshot`}
            width={400}
            height={320}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover object-center"
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
          animate={getAnimateProps(shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 })}
          transition={getTransitionProps({ delay: index * 0.1 + 0.2, type: "spring", damping: 15 })}
        >
          <div className="p-2 bg-orange-600/40 backdrop-blur-sm border border-orange-500/50 rounded-full drop-shadow-md">
            <IconComponent className="w-5 h-5 text-orange-200" />
          </div>
        </motion.div>

        {/* Top badge/tag */}
        <motion.div
          className="absolute top-4 right-4 z-10 max-w-[60%]"
          initial={{ x: 20, opacity: 0 }}
          animate={getAnimateProps(shouldAnimate ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 })}
          transition={getTransitionProps({ delay: index * 0.1 + 0.3 })}
        >
          <span className="px-3 py-1 bg-orange-600/40 backdrop-blur-sm border border-orange-500/50 rounded-full text-orange-200 text-sm font-medium drop-shadow-md truncate block">
            {project.tag}
          </span>
        </motion.div>

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Main content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <motion.h3
            className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors drop-shadow-lg"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={getAnimateProps(shouldAnimate ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 })}
            transition={getTransitionProps({ delay: index * 0.1 + 0.4 })}
          >
            {project.title}
          </motion.h3>
          
          <motion.p
            className="text-gray-100 leading-relaxed group-hover:text-white transition-colors drop-shadow-md mb-3"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={getAnimateProps(shouldAnimate ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 })}
            transition={getTransitionProps({ delay: index * 0.1 + 0.5 })}
          >
            {project.blurb}
          </motion.p>

          {/* Impact metrics - extracted from blurb */}
          <motion.div
            className="flex flex-wrap gap-2 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={getAnimateProps(shouldAnimate ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 })}
            transition={getTransitionProps({ delay: index * 0.1 + 0.6 })}
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

        {/* Call-to-Action Arrow - Always visible on mobile, hover-enhanced on desktop */}
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
          <motion.div
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
                       bg-gradient-to-r from-orange-600 to-orange-500 rounded-full 
                       text-black shadow-lg
                       opacity-100 md:opacity-0 md:group-hover:opacity-100 
                       transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="View case study"
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </motion.div>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

// Helper function to extract metrics from blurb text with descriptive context
function extractMetrics(blurb: string): string[] {
  const metrics: string[] = [];

  // Enhanced patterns that capture full context and meaningful metrics
  const contextualPatterns = [
    // Revenue patterns
    { regex: /IAP\s+rev\/DAU\s*\+(\d+%)/i, template: (match: string) => `+${match} IAP Revenue` },
    { regex: /Net\s+rev\/DAU\s*\+(\d+\.?\d*%)/i, template: (match: string) => `+${match} Net Revenue` },
    { regex: /ARPDAU[\s\+]*(\+?\d+%)/i, template: (match: string) => `${match} ARPDAU` },

    // LTV patterns
    { regex: /D(\d+)\s+LTV\s*\+(\d+\.?\d*%)/i, template: (match: string, day: string) => `+${match} D${day} LTV` },
    { regex: /(\+?\d+\.?\d*%\s?LTV\s?lift)/i, template: (match: string) => match },

    // Retention patterns
    { regex: /D1RR\s*\+(\d+)\s*bps/i, template: (match: string) => `+${match}bps D1 Retention` },
    { regex: /D(\d+)\s+.*?retention[\s\+]*\+?(\d+)\s*bps/i, template: (match: string, day: string) => `+${match}bps D${day} Retention` },
    
    // Session and engagement
    { regex: /Session\s+time\/user\s*\+(\d+\.?\d*%)/i, template: (match: string) => `+${match} Session Time` },
    { regex: /engagement[\s\+]*\+?(\d+%)/i, template: (match: string) => `+${match} Engagement` },

    // Conversion patterns
    { regex: /new\s+payer\s+conversion\s*\+(\d+)\s*bps/i, template: (match: string) => `+${match}bps New Payers` },
    { regex: /payer\s+purchases\s*\+(\d+\.?\d*%)/i, template: (match: string) => `+${match} Payer Purchases` },

    // Efficiency/productivity patterns
    { regex: /eliminating\s+manual\s+reformatting/i, template: () => "Zero Manual Work" },
    { regex: /(\d+)-person\s+dev\s+team/i, template: (match: string) => `${match} Team Adoption` },
    { regex: /(\d+%)\s+.*?efficiency/i, template: (match: string) => `${match} Efficiency` },
    { regex: /(\d+%)\s+faster/i, template: (match: string) => `${match} Faster` },
  ];

  // Apply contextual patterns
  contextualPatterns.forEach(({ regex, template }) => {
    const matches = blurb.match(regex);
    if (matches) {
      const result = template(matches[1], matches[2]);
      if (result && !metrics.some(m => m.toLowerCase().includes(result.toLowerCase().substring(0, 10)))) {
        metrics.push(result);
      }
    }
  });

  // If we found good contextual metrics, return them
  if (metrics.length > 0) {
    return metrics.slice(0, 3);
  }

  // Otherwise, return empty array to use fallback badges
  return [];
}

// Fallback badges for projects without extractable metrics
function getFallbackBadges(project: ProjectItem): string[] {
  const fallbacks: { [key: string]: string[] } = {
    "ai-innovation": ["Zero Manual Work", "8-Person Team", "AI Automation"],
    "kinoa-integration": ["LiveOps Platform", "Real-time Events", "Data-driven Optimization"],
    "tiles": ["Economy Redesign", "Cosmetic Rewards", "Player Ownership"],
    "bon-voyage": ["+12% IAP Revenue", "+22bps D1 Retention", "Secondary Currency"],
    "seasons": ["Seasonal Events", "Long-term Retention", "Progression Design"],
    "food-fiesta": ["Event Design", "Player Engagement", "Feature Innovation"],
    "wotd": ["Daily Engagement", "Word Game Design", "Player Retention"],
    "ticket-mania": ["Reward Systems", "Player Motivation", "Game Economy"],
  };
  
  return fallbacks[project.slug] || ["Game Design", "Player Experience", "System Innovation"];
}