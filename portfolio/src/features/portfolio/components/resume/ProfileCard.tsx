"use client";

import Image from "next/image";
import { Download, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { FaLinkedin, FaGlobe } from "react-icons/fa";
import type { ComponentType } from "react";
import type { ResumeBasics } from "./types";

/** The public PDF file has a literal space in its name — encode it for the href. */
const PDF_HREF = "/ABHISHEK%20DUTTA%20RESUME.pdf";
const PDF_DOWNLOAD_NAME = "ABHISHEK DUTTA RESUME.pdf";

function ContactRow({
  icon: Icon,
  href,
  label,
  external,
}: {
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex min-h-[44px] items-center gap-3 rounded-lg px-1 text-sm text-muted transition-colors hover:text-accent"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
}

export function ProfileCard({ basics }: { basics: ResumeBasics }) {
  return (
    <div
      className="flex flex-col items-center gap-6 rounded-2xl border border-paper/10 bg-ink-2/60 p-6 text-center
                 md:flex-row md:items-start md:gap-8 md:text-left
                 lg:flex-col lg:items-center lg:gap-6 lg:text-center lg:p-7"
    >
      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-accent/30 sm:h-36 sm:w-36 md:h-28 md:w-28 lg:h-36 lg:w-36">
        <Image
          src="/assets/general/profile/abhishek-headshot.webp"
          alt={`Portrait of ${basics.name}`}
          fill
          sizes="(min-width: 1024px) 144px, (min-width: 768px) 112px, (min-width: 640px) 144px, 128px"
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="flex w-full flex-1 flex-col items-center gap-5 md:items-start lg:items-center">
        <div className="flex flex-col items-center gap-1.5 md:items-start lg:items-center">
          <h1 className="font-display text-3xl font-normal leading-tight text-paper sm:text-4xl">
            {basics.name}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent sm:text-xs">
            {basics.title}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {basics.location}
          </p>
        </div>

        <div className="flex w-full flex-col gap-0.5">
          <ContactRow icon={Mail} href={`mailto:${basics.email}`} label={basics.email} />
          <ContactRow
            icon={Phone}
            href={`tel:${basics.phone.replace(/\s+/g, "")}`}
            label={basics.phone}
          />
          <ContactRow
            icon={FaLinkedin}
            href={basics.linkedin.href}
            label={basics.linkedin.label}
            external
          />
          <ContactRow
            icon={FaGlobe}
            href={basics.portfolioUrl.href}
            label={basics.portfolioUrl.label}
            external
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:flex-row lg:flex-col">
          <a
            href={PDF_HREF}
            download={PDF_DOWNLOAD_NAME}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 font-mono text-xs uppercase tracking-wider text-ink transition hover:brightness-110"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </a>
          <a
            href={PDF_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-paper/25 px-5 font-mono text-xs uppercase tracking-wider text-paper transition hover:border-accent hover:text-accent"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open PDF
          </a>
        </div>
      </div>
    </div>
  );
}
