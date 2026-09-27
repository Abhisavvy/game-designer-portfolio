"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { ContactForm } from "@/components/ContactForm";
import { SectionHeading } from "../ui/SectionHeading";
import { defaultPortfolioContent } from "../../data/site-content";

/**
 * Renders a value with a sensible wrap point. Plain text wraps naturally
 * at its spaces; an email (one unbroken token) gets an explicit `<wbr>`
 * right before the `@` so a forced line break lands between the local
 * part and the domain instead of splitting the domain mid-word.
 */
function renderValue(value: string): ReactNode {
  const at = value.indexOf("@");
  if (at === -1 || value.includes(" ")) return value;
  return (
    <>
      {value.slice(0, at)}
      <wbr />
      {value.slice(at)}
    </>
  );
}

/**
 * One contact info box. Every box shares the same fixed height (rather
 * than sizing to content) so Email/Phone/Location/LinkedIn read as a
 * uniform grid regardless of value length — long values wrap within the
 * box instead of growing it.
 */
function ContactInfoBox({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const className =
    "group flex h-[116px] items-center gap-2.5 overflow-hidden rounded-lg border border-paper/10 bg-paper/[0.04] p-4 transition-colors duration-300 hover:border-accent/40 hover:bg-paper/[0.07]";

  const inner = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-paper">{label}</div>
        {/* Plain block text (not -webkit-line-clamp): normal flow respects
            the <wbr> break hint correctly. The fixed-height, overflow-hidden
            box above clips anything past ~2 lines as a safety net. */}
        <div className="mt-0.5 text-[13px] leading-snug text-muted">{renderValue(value)}</div>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={className}
        data-testid="contact-box"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={className} data-testid="contact-box">
      {inner}
    </div>
  );
}

export function ContactSection() {
  const { person, footerCta } = defaultPortfolioContent;

  return (
    <section
      id="contact"
      className="relative overflow-x-hidden bg-gradient-to-br from-black via-orange-950/15 to-black py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bp-reveal mb-12"
        >
          <SectionHeading
            index="05"
            eyebrow="Get In Touch"
            title={footerCta.title}
            subtitle={footerCta.body}
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bp-reveal"
          >
            <h3 className="text-2xl font-semibold text-paper mb-6">Send a Message</h3>
            <ContactForm recipientEmail={person.email} />
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bp-reveal"
          >
            <h3 className="text-2xl font-semibold text-paper mb-6">Get in Touch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ContactInfoBox
                icon={<Mail className="h-5 w-5 text-accent" />}
                label="Email"
                value={person.email}
                href={`mailto:${person.email}`}
              />
              <ContactInfoBox
                icon={<Phone className="h-5 w-5 text-accent" />}
                label="Phone"
                value={person.phone}
                href={`tel:${person.phone}`}
              />
              <ContactInfoBox
                icon={<MapPin className="h-5 w-5 text-accent" />}
                label="Location"
                value={person.location}
              />
              <ContactInfoBox
                icon={<FaLinkedin className="h-5 w-5 text-accent" />}
                label="LinkedIn"
                value="Professional profile"
                href={person.links.linkedin}
                external
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
