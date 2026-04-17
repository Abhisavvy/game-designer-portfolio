"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { usePrefersReducedMotion } from "../media/useMediaPreferences";
import { ContactForm } from "@/components/ContactForm";
import { defaultPortfolioContent } from "../../data/site-content";

export function ContactSection() {
  const { person, footerCta } = defaultPortfolioContent;
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="contact"
      className="relative bg-gradient-to-br from-background via-orange-950/15 to-background py-20"
      style={{ scrollMarginTop: '3.5rem' }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              {footerCta.title}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto whitespace-pre-wrap">
            {footerCta.body}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold text-foreground mb-6">Send a Message</h3>
            <ContactForm />
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <a
                  href={`mailto:${person.email}`}
                  className="flex items-center space-x-3 p-4 bg-card/50 border border-border rounded-lg 
                           hover:border-orange-500/50 hover:bg-card/80 transition-all duration-300 group"
                >
                  <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                    <Mail className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Email</div>
                    <div className="text-sm text-muted-foreground">{person.email}</div>
                  </div>
                </a>

                <a
                  href={`tel:${person.phone}`}
                  className="flex items-center space-x-3 p-4 bg-card/50 border border-border rounded-lg 
                           hover:border-orange-500/50 hover:bg-card/80 transition-all duration-300 group"
                >
                  <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                    <Phone className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Phone</div>
                    <div className="text-sm text-muted-foreground">{person.phone}</div>
                  </div>
                </a>

                <div className="flex items-center space-x-3 p-4 bg-card/50 border border-border rounded-lg">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Location</div>
                    <div className="text-sm text-muted-foreground">{person.location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Connect</h4>
              <a
                href={person.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-4 bg-card/50 border border-border rounded-lg 
                         hover:border-blue-500/50 hover:bg-card/80 transition-all duration-300 group"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <FaLinkedin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-foreground">LinkedIn</div>
                  <div className="text-sm text-muted-foreground">Professional profile</div>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}