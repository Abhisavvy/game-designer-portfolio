"use client";

import { HeroAnimated } from "./HeroAnimated";
import { ProjectCardAnimated } from "./ProjectCardAnimated";
import { StickySkillsSection } from "./StickySkillsSection";
import { defaultPortfolioContent } from "../data/site-content";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ExternalLink, MapPin, User } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { OptimizedImage } from "./OptimizedImage";

export function HomePageContent() {
  const { person, projects, hero, about, workSection, footerCta, siteMeta } =
    defaultPortfolioContent;

  return (
    <>
      {/* Animated Hero Section */}
      <HeroAnimated
        headline={hero.headline}
        subline={hero.subline}
        statPills={hero.statPills}
      />

      {/* Sticky Skills Section */}
      <StickySkillsSection />

      {/* Work Section with Animated Cards */}
      <section
        id="work"
        className="relative bg-gradient-to-b from-zinc-950 to-black py-20"
      >
        <div id="featured-work" className="absolute top-0"></div>
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400/80 mb-4">
              {workSection.eyebrow}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                {workSection.title}
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Case studies showcasing systems design, LiveOps execution, and measurable business impact
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {projects.map((project, index) => (
              <ProjectCardAnimated
                key={project.slug}
                project={project}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative bg-black py-20"
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
                src="/assets/general/workspace/game-design-workspace.jpg"
                alt="Abhishek's Game Design Workspace"
                width={600}
                height={450}
                className="aspect-[4/3] rounded-2xl border border-zinc-700/50 overflow-hidden"
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

      {/* Contact Section */}
      <section
        id="contact"
        className="relative bg-gradient-to-br from-black via-orange-950/15 to-black py-20"
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                {footerCta.title}
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto whitespace-pre-wrap">
              {footerCta.body}
            </p>

            <div className="space-y-4">
              <motion.a
                href={`mailto:${person.email}`}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full text-black font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-5 h-5" />
                <span>Get in Touch</span>
              </motion.a>

              <div className="flex justify-center items-center space-x-6 text-gray-400">
                <a
                  href={person.links.linkedin}
                  className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
                >
                  <FaLinkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
                <span>•</span>
                <a
                  href={person.links.github}
                  className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
                >
                  <FaGithub className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{person.location}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
