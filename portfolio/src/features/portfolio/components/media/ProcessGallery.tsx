"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import type { CaseStudyGalleryItem } from "../../data/case-study-media";
import { CornerMarks, FigureCaption } from "../blueprint/PinnedFrame";
import { SpecSectionHeading } from "../blueprint/SpecSection";
import { BP_COLORS, cssVars, fontMonoStyle } from "../blueprint/tokens";

type Props = {
  groupId: string;
  heading: string;
  items: CaseStudyGalleryItem[];
  threadColor: string;
};

/** "3a", "3b", "3c" ... sub-figure labels for the plates in this gallery. */
function plateLabel(index: number): string {
  const letter = String.fromCharCode(97 + (index % 26));
  return `FIG. 3${letter}`;
}

/** Focusable elements within `container`, in DOM/tab order. Used to trap
 *  Tab/Shift+Tab inside the open lightbox. */
function getFocusable(container: HTMLElement): HTMLElement[] {
  const selector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

export function ProcessGallery({ groupId, heading, items, threadColor }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  /** The thumbnail button that opened the lightbox — focus returns here on close. */
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openAt = useCallback((i: number, trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null;
    setIndex(i);
    setOpen(true);
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  // Swipe support for touch devices (tap/buttons already work via onClick).
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }, []);
  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const startX = touchStartX.current;
      touchStartX.current = null;
      if (startX === null) return;
      const endX = e.changedTouches[0]?.clientX ?? startX;
      const delta = endX - startX;
      const SWIPE_THRESHOLD = 40;
      if (delta > SWIPE_THRESHOLD) goPrev();
      else if (delta < -SWIPE_THRESHOLD) goNext();
    },
    [goPrev, goNext],
  );

  // Body scroll lock + initial focus + return focus to the thumbnail that
  // opened the lightbox once it closes (whether via Esc, backdrop click,
  // or the close button).
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      // Deferred to a microtask so it runs after this same commit's other
      // cleanup — specifically the effect below, which removes `inert`
      // from the trigger's ancestors — has already run. `inert` (and
      // `.focus()` on a still-inert element) fails silently, and cleanup
      // order between separate effects isn't something to depend on here.
      queueMicrotask(() => trigger?.focus());
    };
  }, [open]);

  // Make the rest of the page inert while the lightbox is open, so it
  // can't be reached by Tab, screen-reader virtual cursor, or find-in-page
  // while the dialog is modal. The lightbox itself is portalled to
  // `document.body`, so "the rest of the page" is every other direct
  // child of body — `inert` cascades to their full subtrees.
  useEffect(() => {
    if (!open) return;
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== dialogEl,
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));
    return () => {
      siblings.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open]);

  // Esc to close, arrow keys to navigate, and a Tab/Shift+Tab focus trap
  // that keeps keyboard focus cycling within the dialog instead of
  // escaping into the (inert, but belt-and-suspenders) page behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
        return;
      }
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusable = getFocusable(root);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        const activeIsInside = active instanceof Node && root.contains(active);
        if (e.shiftKey) {
          if (!activeIsInside || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!activeIsInside || active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, goPrev, goNext]);

  const current = items[index];
  if (!current) return null;

  const lightbox =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={dialogRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050b15]/95 opacity-100 backdrop-blur-sm transition-opacity"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              type="button"
              className="absolute inset-0"
              aria-label="Close gallery"
              onClick={close}
            />
            <div className="relative z-[101] flex max-h-[90vh] max-w-[min(92vw,1100px)] flex-col items-center px-4">
              <button
                ref={closeRef}
                type="button"
                className="absolute -top-14 right-0 flex h-11 w-11 items-center justify-center rounded-full border text-2xl leading-none text-white transition-colors hover:text-[var(--lb-thread)] sm:-top-12"
                style={cssVars({ "--lb-thread": threadColor, borderColor: BP_COLORS.drawLine })}
                aria-label="Close"
                onClick={close}
              >
                ×
              </button>
              <div
                className="relative touch-pan-y overflow-hidden rounded-[3px] border"
                style={{ borderColor: BP_COLORS.drawLine }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote/public paths */}
                <img
                  src={current.full}
                  alt={current.alt}
                  className="max-h-[72vh] max-w-full object-contain"
                  draggable={false}
                />
                <CornerMarks />
              </div>
              <p
                id={titleId}
                className="mt-3 max-w-xl text-center text-[11px] uppercase tracking-[0.14em]"
                style={{ ...fontMonoStyle, color: BP_COLORS.muted }}
              >
                <span style={{ color: BP_COLORS.figLabel }}>{plateLabel(index)}</span>
                {" — "}
                {current.label}
              </p>
              {items.length > 1 ? (
                <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-1 sm:px-2">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full border text-2xl text-white transition-colors"
                    style={{ borderColor: BP_COLORS.drawLine }}
                    aria-label="Previous image"
                    onClick={goPrev}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full border text-2xl text-white transition-colors"
                    style={{ borderColor: BP_COLORS.drawLine }}
                    aria-label="Next image"
                    onClick={goNext}
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
    <section className="my-10 scroll-mt-28" aria-label={heading}>
      <SpecSectionHeading id={groupId} title={heading} threadColor={threadColor} />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
        {items.map((item, i) => (
          <motion.button
            key={`${groupId}-${item.thumb}-${i}`}
            type="button"
            data-lightbox={groupId}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: (i % 6) * 0.06, ease: "easeOut" }}
            className="bp-reveal group self-start text-left outline-none"
            onClick={(e) => openAt(i, e.currentTarget)}
          >
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[3px] border bg-[#050b15] transition-colors group-hover:border-[var(--plate-thread)] group-focus-visible:border-[var(--plate-thread)]"
              style={cssVars({ borderColor: BP_COLORS.drawLine, "--plate-thread": threadColor })}
            >
              <Image
                src={item.thumb}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-[#050b15]/0 opacity-0 transition group-hover:bg-[#050b15]/60 group-hover:opacity-100 group-focus-visible:bg-[#050b15]/60 group-focus-visible:opacity-100">
                <span
                  className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                  style={{ borderColor: threadColor }}
                >
                  View
                </span>
              </span>
              <CornerMarks />
            </div>
            <FigureCaption label={plateLabel(i)} caption={item.label} className="mt-2.5 min-h-[2.4em]" />
          </motion.button>
        ))}
      </div>
      {lightbox}
    </section>
  );
}
