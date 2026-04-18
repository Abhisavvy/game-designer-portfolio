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
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left side - Image placeholder */}
          <div className="order-2 md:order-1">
            <OptimizedImage
              src={about.image}
              alt={`${about.title} - Workspace Image`}
              width={600}
              height={450}
              className="aspect-[4/3] w-full h-full object-cover object-center rounded-2xl border border-zinc-700/50 overflow-hidden"
              placeholder={
                <div className="aspect-[4/3] bg-zinc-800/50 rounded-2xl border border-zinc-700/50 flex items-center justify-center">
                  <div className="text-center">
                    <User className="w-20 h-20 text-orange-400/40 mx-auto mb-4" />
                    <div className="text-orange-300/60 font-medium">Your Photo Here</div>
                    <div className="text-gray-500 text-sm mt-2">Professional headshot or<br />game design workspace</div>
                  </div>
                </div>
              }
            />
          </div>

          {/* Right side - Content */}
          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-bold text-white mb-8">
              <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                {about.title}
              </span>
            </h2>
            <div className="text-lg text-gray-400 leading-relaxed space-y-6 whitespace-pre-wrap">
              {about.body}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}