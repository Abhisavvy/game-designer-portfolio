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
  Gamepad2,
  Phone
} from "lucide-react";
import Image from "next/image";
import { FaLinkedin } from "react-icons/fa";

export function ResumePageContent() {
  const { person } = defaultPortfolioContent;

  const handleDownloadPDF = () => {
    // Trigger browser print dialog which can save as PDF
    window.print();
  };

  return (
    <div className="min-h-screen bg-black pt-20 pb-12 print:bg-white print:pt-4 print:pb-4">
      <div className="max-w-4xl mx-auto px-6 print:px-4 print:max-w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Image */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-orange-500/30">
            <Image 
              src="/assets/general/profile/abhishek-headshot.webp" 
              alt="Abhishek Dutta"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">{person.name}</h1>
          <p className="text-xl text-orange-400 mb-4">Game Designer | Mobile Game Specialist</p>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Results-driven Game Designer with 3+ years designing player-first mobile game systems that drive community engagement and long-term retention. Expert in LiveOps events, economy systems, and data-driven feature design.
          </p>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-400">
            <a 
              href={`mailto:${person.email}`}
              className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{person.email}</span>
            </a>
            <a 
              href={`tel:${person.phone}`}
              className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{person.phone}</span>
            </a>
            <a 
              href={person.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
            >
              <FaLinkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Bengaluru, India</span>
            </div>
          </div>

          {/* Download Button */}
          <motion.button
            onClick={handleDownloadPDF}
            className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full text-black font-semibold hover:shadow-lg transition-all duration-300 print:hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </motion.button>
        </motion.div>

        {/* Resume Content */}
        <div className="grid md:grid-cols-3 gap-8 print:gap-4 print:grid-cols-3">
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
                  "Feature Design & Documentation",
                  "Mobile Game Systems", 
                  "LiveOps Management",
                  "Economy Design",
                  "PvP Mechanics Design",
                  "Critical Thinking & Analysis",
                  "A/B Testing & Analytics",
                  "Player Behavior Analysis"
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
                  "50k+ DAU (Word Roll)",
                  "71% Monetization Increase",
                  "300 bps D1 Retention",
                  "25+ Features Shipped",
                  "10x User Growth Contribution"
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

              {/* PlaySimple Games Experience */}
              <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Game Designer</h3>
                    <p className="text-orange-400 font-medium">PlaySimple Games</p>
                  </div>
                  <div className="text-gray-400 text-sm flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>August 2022 – Present (3+ years)</span>
                  </div>
                </div>
                <ul className="text-gray-300 space-y-2 leading-relaxed">
                  <li>• Created detailed feature specifications for 25+ major systems including seasonal events, battle pass mechanics, and competitive leaderboards</li>
                  <li>• Designed economy and progression systems for Word Roll (50k+ DAU) delivering 71% monetization improvements and 35% retention increases</li>
                  <li>• Conducted competitive analysis of 50+ mobile games using SensorTower and Data.ai, identifying market opportunities that influenced product roadmap</li>
                  <li>• Established data-driven feedback loops and A/B testing frameworks to validate design decisions and optimize feature performance</li>
                </ul>
              </div>

              {/* Key Achievements Section */}
              <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Key Achievements</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-orange-400 font-semibold">Social Engagement Leadership - Food Fiesta (2024)</h4>
                    <p className="text-gray-300 text-sm">Designed Food Fiesta event mechanics featuring balanced gacha systems and progressive rewards, generating 71% monetization increase and establishing template for future LiveOps events.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-orange-400 font-semibold">Community Building Innovation - Ticket Mania (2024)</h4>
                    <p className="text-gray-300 text-sm">Redesigned Ticket Mania leaderboard architecture with skill-based matchmaking and dynamic rewards, increasing player LTV by 10% and improving D1 retention rate by 300 basis points.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-orange-400 font-semibold">Player Experience Optimization - Word of the Day (2024)</h4>
                    <p className="text-gray-300 text-sm">Transformed Word of the Day from passive feature to interactive collection mechanic, achieving 140 basis points D1 retention improvement and 3% overall engagement increase.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-orange-400 font-semibold">AI Innovation & Team Productivity (2026)</h4>
                    <p className="text-gray-300 text-sm">Built AI-assisted Spec Maker and Meeting Manager tools that became standard workflow for 8-person development team, improving documentation efficiency by 25%.</p>
                  </div>
                </div>
              </div>

              {/* Education & Skills */}
              <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/30">
                <h3 className="text-xl font-bold text-white mb-4">Education & Technical Skills</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-orange-400 font-semibold">Education</h4>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>• PG Diploma in Game Design | ICAT Design & Media College | 2021-2022</p>
                      <p>• BA LLB | Department of Law, Calcutta University | 2015-2020</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-orange-400 font-semibold">Technical Proficiency</h4>
                    <p className="text-gray-300 text-sm">Unity, Excel, Google Sheets, Figma, SensorTower, Data.ai, Google Analytics, A/B Testing, JIRA, Confluence, Kinoa.io, Cursor AI</p>
                  </div>
                  
                  <div>
                    <h4 className="text-orange-400 font-semibold">LiveOps Expertise</h4>
                    <p className="text-gray-300 text-sm">Deployed 5+ events with Kinoa.io running personalized events for players based on their cohorts. Expert in real-time event optimization and data-driven monetization strategies.</p>
                  </div>
                </div>
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