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
  if (metric.includes('%') || metric.includes('ARPDAU') || metric.includes('IAP')) {
    return DollarSign;
  }
  if (metric.includes('retention') || metric.includes('bps')) {
    return RefreshCcw;
  }
  if (metric.includes('engagement') || metric.includes('DAU')) {
    return Users;
  }
  if (metric.includes('LTV') || metric.includes('lift')) {
    return TrendingUp;
  }
  return Target;
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
            src={`/assets/${project.title.toLowerCase().replace(/\s+/g, '-')}/hero-image.jpg`}
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
          <div className="p-2 bg-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-full">
            <IconComponent className="w-5 h-5 text-orange-300" />
          </div>
        </motion.div>

        {/* Top badge/tag */}
        <motion.div
          className="absolute top-4 right-4 z-10"
          initial={{ x: 20, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <span className="px-3 py-1 bg-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-full text-orange-300 text-sm font-medium">
            {project.tag}
          </span>
        </motion.div>

        {/* Main content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <motion.h3
            className="text-2xl font-bold text-white mb-3 group-hover:text-orange-300 transition-colors"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            {project.title}
          </motion.h3>
          
          <motion.p
            className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors"
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
            {extractMetrics(project.blurb).map((metric, metricIndex) => {
              const MetricIcon = getMetricIcon(metric);
              return (
                <span
                  key={metricIndex}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 border border-green-500/30 rounded text-green-300 text-xs font-medium"
                >
                  <MetricIcon className="w-3 h-3" />
                  {metric}
                </span>
              );
            })}
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

// Helper function to extract metrics from blurb text
function extractMetrics(blurb: string): string[] {
  const metrics: string[] = [];
  
  // Look for percentage increases
  const percentMatches = blurb.match(/(\+?\d+%)/g);
  if (percentMatches) {
    metrics.push(...percentMatches);
  }
  
  // Look for basis points
  const bpsMatches = blurb.match(/(\+?\d+\s?bps)/g);
  if (bpsMatches) {
    metrics.push(...bpsMatches);
  }
  
  // Look for specific metrics like "engagement", "retention", "ARPDAU"
  const metricKeywords = ["engagement", "retention", "ARPDAU", "LTV", "IAP"];
  metricKeywords.forEach(keyword => {
    if (blurb.toLowerCase().includes(keyword.toLowerCase())) {
      // Try to extract the associated number
      const regex = new RegExp(`${keyword}[^\\d]*([\\+\\-]?\\d+[%]?)`, 'i');
      const match = blurb.match(regex);
      if (match && !metrics.includes(match[1])) {
        metrics.push(`${keyword} ${match[1]}`);
      }
    }
  });
  
  return metrics.slice(0, 3); // Limit to 3 metrics max
}