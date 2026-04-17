"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { usePrefersReducedMotion } from "../media/useMediaPreferences";
import { defaultPortfolioContent } from "../../data/site-content";

export function ContactSection() {
  const { person, footerCta } = defaultPortfolioContent;
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="contact"
      className="relative bg-gradient-to-br from-black via-orange-950/15 to-black py-20"
      style={{ scrollMarginTop: '3.5rem' }}
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
              whileHover={!reducedMotion ? { scale: 1.02, y: -2 } : {}}
              whileTap={!reducedMotion ? { scale: 0.98 } : {}}
            >
              <Mail className="w-5 h-5" />
              <span>Get in Touch</span>
            </motion.a>

            <div className="flex justify-center items-center space-x-6 text-gray-400 flex-wrap gap-4">
              <a
                href={person.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                <FaLinkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              <span>•</span>
              <a
                href={`tel:${person.phone}`}
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Phone</span>
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
  );
}