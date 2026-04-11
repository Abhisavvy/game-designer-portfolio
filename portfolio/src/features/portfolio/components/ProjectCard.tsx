import Link from "next/link";
import { motion } from "framer-motion";

type ProjectCardProps = {
  title: string;
  tag: string;
  blurb: string;
  href: string;
  externalUrl?: string;
  index: number;
};

export function ProjectCard({
  title,
  tag,
  blurb,
  href,
  externalUrl,
  index,
}: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition hover:border-amber-500/30 hover:bg-zinc-900/60"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-amber-500/90">
        {tag}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-zinc-100">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{blurb}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={href}
          className="text-sm font-medium text-amber-400/90 transition group-hover:text-amber-300"
        >
          Explore →
        </Link>
        {externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            External link
          </a>
        ) : null}
      </div>
    </motion.article>
  );
}
