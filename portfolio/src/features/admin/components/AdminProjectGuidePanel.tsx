'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'media',
    title: 'Unified media',
    body: [
      'Hero uploads are saved as /assets/{slug}/hero-image.{ext} and update the same poster path used on work pages and home cards.',
      'Next.js Image handles responsive optimization at request time — export a sharp PNG or WebP at least ~1200px wide for best results.',
    ],
  },
  {
    id: 'workflow',
    title: 'Publishing flow',
    body: [
      'Create the project and case study in one step (this wizard), then upload the hero so both surfaces match.',
      'Saving updates site-content.ts on disk; dev server picks up changes via hot reload without restarting manually.',
    ],
  },
  {
    id: 'validation',
    title: 'Slug and paths',
    body: [
      'Slugs must be lowercase with hyphens only — they define /work/{slug} and the asset folder name.',
      'If a hero fails to load, cards fall back to hero-image.webp → .png → .jpg under the same folder.',
    ],
  },
] as const;

export function AdminProjectGuidePanel({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState<string | null>('media');

  return (
    <aside
      className={`rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 text-slate-800">
        <BookOpen className="h-4 w-4 text-orange-600" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide">
          In-app guide
        </h2>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-slate-600">
        This panel mirrors how the portfolio is wired so you don’t need to cross-check markdown docs while editing.
      </p>
      <ul className="space-y-1">
        {SECTIONS.map((s) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} className="rounded-lg border border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                {s.title}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>
              {isOpen ? (
                <ul className="space-y-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-600">
                  {s.body.map((line, i) => (
                    <li key={`${s.id}-${i}`} className="leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
