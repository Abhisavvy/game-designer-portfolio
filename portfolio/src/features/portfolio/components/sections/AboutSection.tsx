"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { defaultPortfolioContent } from "../../data/site-content";

export function AboutSection() {
  const { about } = defaultPortfolioContent;

  return (
    <section
      id="about"
      className="relative bg-black py-20"
      style={{ scrollMarginTop: '3.5rem' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center"
        >
          {/* Image Side - Enhanced Layout */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="relative group">
              {/* Background blur effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              
              {/* Main image container */}
              <div className="relative bg-gradient-to-br from-zinc-800/50 to-zinc-900/80 rounded-3xl p-1.5 backdrop-blur-sm border border-zinc-700/50">
                <OptimizedImage
                  src={about.image}
                  alt={`${about.title} - Workspace Image`}
                  width={800}
                  height={600}
                  className="w-full h-auto aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] object-cover rounded-2xl 
                           shadow-2xl shadow-black/50 transition-transform duration-500 group-hover:scale-[1.02]"
                  priority={true}
                  progressive={true}
                  enableFormatOptimization={true}
                  placeholder={
                    <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] bg-zinc-800/50 rounded-2xl border border-zinc-700/50 flex items-center justify-center">
                      <div className="text-center">
                        <User className="w-16 h-16 text-orange-400/40 mx-auto mb-3" />
                        <div className="text-orange-300/60 font-medium text-sm">Your Photo Here</div>
                        <div className="text-gray-500 text-xs mt-2">Professional headshot or<br />game design workspace</div>
                      </div>
                    </div>
                  }
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full blur-xl opacity-60"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-orange-500/10 rounded-full blur-2xl opacity-40"></div>
            </div>
          </div>

          {/* Content Side - Enhanced Typography */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="max-w-2xl lg:max-w-none">
              <motion.h2 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 lg:mb-8 leading-tight"
              >
                <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
                  {about.title}
                </span>
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed space-y-6 whitespace-pre-wrap"
              >
                {about.body}
              </motion.div>

              {/* Optional: Add a subtle accent */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 h-1 w-24 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full origin-left"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}