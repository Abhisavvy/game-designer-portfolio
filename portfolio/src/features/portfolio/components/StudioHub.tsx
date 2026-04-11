"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const cards = [
  {
    href: "/cv-builder",
    title: "CV builder",
    description:
      "Fill in experience, skills, and education. Preview in the browser, save automatically, and export Reactive Resume JSON for PDF or DOCX in Reactive Resume.",
    cta: "Open CV builder",
  },
  {
    href: "/edit",
    title: "Portfolio editor",
    description:
      "Edit site name, hero, about, projects, and case studies. Download or import JSON to back up or move your copy between machines.",
    cta: "Open portfolio editor",
  },
] as const;

export function StudioHub() {
  return (
    <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(245,158,11,0.1),transparent_55%)]" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm font-medium uppercase tracking-widest text-amber-500/90">
          Studio
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Create your CV and portfolio
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          Both tools run in the browser. Your work is stored in this browser’s{" "}
          <span className="text-zinc-300">local storage</span> until you export
          or clear site data—use JSON export to keep a backup.
        </p>
      </motion.div>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2">
        {cards.map((card, i) => (
          <motion.li
            key={card.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
          >
            <Link
              href={card.href}
              className="group flex h-full flex-col rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6 shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-amber-500/35 hover:bg-zinc-900/60"
            >
              <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-200/95">
                {card.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
                {card.description}
              </p>
              <span className="mt-6 text-sm font-medium text-amber-400/90 group-hover:text-amber-300">
                {card.cta} →
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-12 rounded-xl border border-zinc-800/80 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-500"
      >
        Run locally from the{" "}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400">
          portfolio
        </code>{" "}
        folder:{" "}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400">
          npm install
        </code>{" "}
        then{" "}
        <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400">
          npm run dev
        </code>
        , then open{" "}
        <Link href="/" className="text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline">
          the home page
        </Link>
        .
      </motion.p>
    </div>
  );
}
