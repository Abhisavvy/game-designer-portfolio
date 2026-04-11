"use client";

import { motion } from "framer-motion";
import { defaultPortfolioContent } from "../data/site-content";
import { 
  Mail, 
  MapPin, 
  Download,
  Calendar,
  Building,
  Award,
  Code,
  Gamepad2
} from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export function ResumePageContent() {
  const { person } = defaultPortfolioContent;

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Image Placeholder */}
          <div className="w-32 h-32 mx-auto mb-6 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-orange-500/30">
            <div className="text-orange-400 text-sm font-medium">Photo</div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">{person.name}</h1>
          <p className="text-xl text-orange-400 mb-4">{person.role}</p>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">{person.tagline}</p>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{person.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{person.location}</span>
            </div>
            <a href={person.links.linkedin} className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
              <FaLinkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
            <a href={person.links.github} className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
              <FaGithub className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Download Button */}
          <motion.button
            className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full text-black font-semibold hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </motion.button>
        </motion.div>

        {/* Resume Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-8">
            {/* Skills */}
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Core Skills</span>
              </h2>
              <div className="space-y-3">
                {[
                  "Systems Design",
                  "LiveOps Management", 
                  "Retention Mechanics",
                  "Economy Design",
                  "A/B Testing",
                  "Player Psychology",
                  "Mobile Game Design",
                  "Data Analysis"
                ].map((skill, index) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Achievements */}
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Key Metrics</span>
              </h2>
              <div className="space-y-3">
                {[
                  "40k+ DAU Growth",
                  "22% ARPDAU Increase",
                  "300 bps D1 Retention",
                  "25+ Features Shipped",
                  "3+ Years Experience"
                ].map((metric, index) => (
                  <div key={metric} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                    <div className="text-orange-300 font-semibold text-sm">{metric}</div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Experience */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-orange-400 mb-6 flex items-center space-x-2">
                <Building className="w-6 h-6" />
                <span>Experience</span>
              </h2>

              {/* Word Roll Experience */}
              <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Systems Designer</h3>
                    <p className="text-orange-400 font-medium">Word Roll</p>
                  </div>
                  <div className="text-gray-400 text-sm flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>2021 - Present</span>
                  </div>
                </div>
                <ul className="text-gray-300 space-y-2 leading-relaxed">
                  <li>• Designed retention mechanics and LiveOps events that grew DAU from 4k to 40k+</li>
                  <li>• Built economy systems and progression mechanics that increased ARPDAU by 22%</li>
                  <li>• Implemented A/B testing frameworks for feature optimization and player segmentation</li>
                  <li>• Created event infrastructure for seasonal content and live service operations</li>
                </ul>
              </div>

              {/* AI Innovation Work */}
              <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">AI & Innovation Lead</h3>
                    <p className="text-orange-400 font-medium">Development Team</p>
                  </div>
                  <div className="text-gray-400 text-sm flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Recent</span>
                  </div>
                </div>
                <ul className="text-gray-300 space-y-2 leading-relaxed">
                  <li>• Built AI-assisted Spec Maker and Meeting Manager tools using Cursor AI</li>
                  <li>• Achieved 25% improvement in documentation efficiency and 40% faster sprint planning</li>
                  <li>• Established productivity culture that became team standard across 8-person development team</li>
                  <li>• Integrated AI workflows without disrupting established development processes</li>
                </ul>
              </div>

              {/* Kinoa Integration */}
              <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">LiveOps Integration Specialist</h3>
                    <p className="text-orange-400 font-medium">Kinoa.io Platform</p>
                  </div>
                  <div className="text-gray-400 text-sm flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Integration Project</span>
                  </div>
                </div>
                <ul className="text-gray-300 space-y-2 leading-relaxed">
                  <li>• Created comprehensive design document for seamless Kinoa SDK integration</li>
                  <li>• Set up LiveOps features through flows and in-app configurations</li>
                  <li>• Tested various events and made real-time optimizations for player engagement</li>
                  <li>• Optimized monetization strategies through data-driven event management</li>
                </ul>
              </div>
            </motion.section>

            {/* Featured Projects */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-orange-400 mb-6 flex items-center space-x-2">
                <Gamepad2 className="w-6 h-6" />
                <span>Featured Projects</span>
              </h2>

              <div className="grid gap-4">
                {defaultPortfolioContent.projects.slice(0, 3).map((project, index) => (
                  <div key={project.slug} className="bg-zinc-800/20 rounded-lg p-4 border border-zinc-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">{project.title}</h3>
                      <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                        {project.tag}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{project.blurb}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}