"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CaseStudyGalleryItem } from "../../data/case-study-media";

type Props = {
  groupId: string;
  heading: string;
  items: CaseStudyGalleryItem[];
};

export function ProcessGallery({ groupId, heading, items }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => (i - 1 + items.length) % items.length);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((i) => (i + 1) % items.length);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, items.length]);

  const current = items[index];
  if (!current) return null;

  const lightbox =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center opacity-100 transition-opacity"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/90"
              aria-label="Close gallery"
              onClick={close}
            />
            <div className="relative z-[101] flex max-h-[90vh] max-w-[min(92vw,1100px)] flex-col items-center px-4">
              <button
                ref={closeRef}
                type="button"
                className="absolute -top-10 right-0 rounded px-2 py-1 text-2xl leading-none text-white hover:bg-white/10"
                aria-label="Close"
                onClick={close}
              >
                ×
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote/public paths */}
              <img
                src={current.full}
                alt={current.alt}
                className="max-h-[78vh] max-w-full rounded object-contain"
              />
              <p id={titleId} className="mt-3 max-w-xl text-center text-sm text-zinc-300">
                {current.alt}
              </p>
              {items.length > 1 ? (
                <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-2">
                  <button
                    type="button"
                    className="rounded bg-white/15 px-3 py-4 text-2xl text-white hover:bg-white/25"
                    aria-label="Previous image"
                    onClick={() =>
                      setIndex((i) => (i - 1 + items.length) % items.length)
                    }
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="rounded bg-white/15 px-3 py-4 text-2xl text-white hover:bg-white/25"
                    aria-label="Next image"
                    onClick={() => setIndex((i) => (i + 1) % items.length)}
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section className="my-10" aria-label={heading}>
      <h2 className="text-lg font-semibold text-zinc-200">{heading}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={`${groupId}-${item.thumb}-${i}`}
            type="button"
            data-lightbox={groupId}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 text-left outline-none ring-amber-500/80 focus-visible:ring-2"
            onClick={() => openAt(i)}
          >
            <Image
              src={item.thumb}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="text-xs font-semibold uppercase tracking-wide text-white">
                View
              </span>
              <span className="mt-1 text-sm font-medium text-zinc-200">
                {item.label}
              </span>
            </span>
          </button>
        ))}
      </div>
      {lightbox}
    </section>
  );
}
