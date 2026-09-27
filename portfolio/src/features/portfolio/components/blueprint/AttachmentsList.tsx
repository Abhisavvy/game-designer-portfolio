"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BP_COLORS, fontMonoStyle } from "./tokens";
import { SpecSectionHeading } from "./SpecSection";

type Link = { label: string; href: string };

export function AttachmentsList({ links, threadColor }: { links: Link[]; threadColor: string }) {
  if (!links.length) return null;

  return (
    <motion.section
      id="attachments"
      className="bp-reveal scroll-mt-28"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div>
        <SpecSectionHeading id="attachments" title="Attachments" threadColor={threadColor} />
        <ul className="mt-4 divide-y border-y" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          {links.map((l) => {
            const external = /^https?:\/\//i.test(l.href);
            return (
              <li key={l.href + l.label} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <a
                  href={l.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between gap-4 py-4 transition-transform hover:translate-x-1"
                >
                  <span className="text-sm tracking-wide sm:text-base" style={{ ...fontMonoStyle, color: BP_COLORS.text }}>
                    {l.label}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: threadColor }}
                    aria-hidden
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.section>
  );
}
