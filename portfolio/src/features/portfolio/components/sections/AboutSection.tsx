"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { User } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { SectionHeading } from "../ui/SectionHeading";
import { useRevealOnView } from "../ui/useRevealOnView";
import { usePrefersReducedMotion } from "../media/useMediaPreferences";
import { defaultPortfolioContent } from "../../data/site-content";

/** Wraps `phrase` (if found in `text`) in <em> so SectionHeading renders it in the accent italic. */
function withEmphasis(text: string, phrase: string): ReactNode {
  const idx = text.indexOf(phrase);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <em>{phrase}</em>
      {text.slice(idx + phrase.length)}
    </>
  );
}

function delayStyle(ms: number): CSSProperties {
  return { "--reveal-delay": ms } as CSSProperties;
}

/** Thin corner registration marks — like a print pinned up for reference. */
function CornerMarks() {
  const base = "pointer-events-none absolute h-6 w-6 border-paper/35";
  return (
    <>
      <span aria-hidden="true" className={`${base} left-3 top-3 border-l border-t`} />
      <span aria-hidden="true" className={`${base} right-3 top-3 border-r border-t`} />
      <span aria-hidden="true" className={`${base} bottom-3 left-3 border-b border-l`} />
      <span aria-hidden="true" className={`${base} bottom-3 right-3 border-b border-r`} />
    </>
  );
}

export function AboutSection() {
  const { about } = defaultPortfolioContent;
  const frameRef = useRef<HTMLDivElement>(null);
  const paragraphsRef = useRevealOnView<HTMLDivElement>();
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ["0px", "0px"] : ["-16px", "16px"]
  );

  const paragraphs = about.body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  return (
    <section
      id="about"
      className="relative overflow-x-hidden bg-black py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bp-reveal grid lg:grid-cols-12 gap-8 lg:gap-16 items-center"
        >
          {/* Image Side - Enhanced Layout */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div ref={frameRef} className="relative group">
              {/* Background blur effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

              {/* Main image container — gentle scroll parallax, off with reduced motion */}
              <motion.div
                style={{ y: parallaxY }}
                className="relative bg-gradient-to-br from-zinc-800/50 to-zinc-900/80 rounded-3xl p-1.5 backdrop-blur-sm border border-zinc-700/50"
              >
                <OptimizedImage
                  src={about.image}
                  alt="Abhishek Dutta"
                  width={600}
                  height={800}
                  className="w-full h-auto aspect-[3/4] sm:aspect-[2/3] lg:aspect-[3/4] object-cover object-top rounded-2xl
                           shadow-2xl shadow-black/50 transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  placeholder={
                    <div
                      aria-hidden="true"
                      className="aspect-[3/4] sm:aspect-[2/3] lg:aspect-[3/4] bg-zinc-800/50 rounded-2xl border border-zinc-700/50 flex items-center justify-center"
                    >
                      <User className="w-16 h-16 text-orange-400/40" />
                    </div>
                  }
                />
                <CornerMarks />
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full blur-xl opacity-60"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-orange-500/10 rounded-full blur-2xl opacity-40"></div>
            </div>
          </div>

          {/* Content Side - Enhanced Typography */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="max-w-2xl lg:max-w-none">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bp-reveal mb-6 lg:mb-8"
              >
                <SectionHeading
                  index="04"
                  eyebrow="Design Philosophy"
                  title={withEmphasis(about.title, "Systems Design")}
                />
              </motion.div>

              <div
                ref={paragraphsRef}
                className="text-base sm:text-lg lg:text-xl text-muted leading-relaxed space-y-6"
              >
                {paragraphs.map((paragraph, i) => (
                  <p key={i} className="reveal-item" style={delayStyle(i * 140)}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
