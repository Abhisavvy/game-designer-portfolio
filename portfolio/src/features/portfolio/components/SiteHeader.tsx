"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { defaultPortfolioContent } from "../data/site-content";
import { BrandMark } from "./ui/BrandMark";

const SECTION_LINKS = [
  { href: "/#work", label: "Work", id: "work" },
  { href: "/#projects", label: "Projects", id: "projects" },
  { href: "/#skills", label: "Skills", id: "skills" },
  { href: "/#about", label: "About", id: "about" },
];

const MOBILE_LINKS = [
  ...SECTION_LINKS,
  { href: "/resume", label: "Resume", id: "resume" },
  { href: "/#contact", label: "Contact", id: "contact" },
];

const SCROLLSPY_IDS = ["work", "projects", "skills", "about", "contact"];

export function SiteHeader() {
  const { person } = defaultPortfolioContent;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showDesktopNav, setShowDesktopNav] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Header becomes slightly more opaque once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-progress thread along the header's bottom edge — a Framer Motion
  // value (subscribed straight to the scroll event, rAF-batched internally)
  // rather than React state, so scrolling drives zero React commits: this
  // motion value is written directly to the DOM style on each frame,
  // bypassing render/commit entirely. Whole-document progress (no `target`)
  // matches the previous `scrollY / (scrollHeight - innerHeight)` maths.
  // Intentionally not gated behind reduced motion since it just reflects
  // scroll position rather than auto-playing.
  const { scrollYProgress } = useScroll();
  const progressGlow = useTransform(scrollYProgress, (v) =>
    v > 0 ? "0 0 8px 1px rgba(249,115,22,0.65)" : "none"
  );

  // Below `sm`, skip the backdrop blur (can jank on low-power phones) and
  // fall back to a more opaque solid background instead.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsSmallScreen(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Mirrors the Tailwind `nav:` screen (see tailwind.config) in JS, purely so
  // the mobile sheet can auto-close if a resize brings the full desktop nav
  // back — the nav/hamburger's own show/hide is CSS-only (see `nav:` classes
  // below) and never depends on this state, so it still works with no JS.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (min-height: 480px)");
    const onChange = () => setShowDesktopNav(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Scrollspy: highlight whichever section is currently in view. Tracks the
  // full set of intersecting sections so the indicator clears (rather than
  // sticking to the last section seen) once none of them are in the band.
  //
  // Re-runs on `pathname` (not just at mount): the section elements only
  // exist on "/", so grabbing them once at layout mount meant they were
  // never (re)found after a client navigation landed back on "/" (e.g.
  // /work/tiles -> /, or / -> /resume -> Back) — the indicator would just go
  // dark for the rest of that session. Guarding on `pathname === "/"` also
  // clears any stale highlight the instant you navigate away.
  useEffect(() => {
    if (pathname !== "/") {
      setActiveId("");
      return;
    }

    const elements = SCROLLSPY_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const intersecting = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersecting.add(entry.target.id);
          } else {
            intersecting.delete(entry.target.id);
          }
        });
        const current = SCROLLSPY_IDS.find((id) => intersecting.has(id));
        setActiveId(current ?? "");
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // Mobile sheet: focus trap over every focusable element inside it (close
  // button + links), Esc to close, body scroll lock, and — while open — the
  // rest of the page is made `inert` so Tab and assistive tech can't reach
  // it. Everything this effect does to the outside world is undone in its
  // cleanup, which React runs exactly when `mobileOpen` flips back to false
  // (Esc, the in-sheet close button, or a link's onClick all just flip that
  // state) — so "restore focus to the menu button" and "un-inert the page"
  // stay correct no matter which path closed the sheet.
  useEffect(() => {
    if (!mobileOpen) return;
    const sheet = sheetRef.current;
    const menuButton = menuButtonRef.current;
    if (!sheet) return;

    const inertedSiblings: HTMLElement[] = [];
    Array.from(document.body.children).forEach((node) => {
      if (!(node instanceof HTMLElement) || node === sheet || node.hasAttribute("inert")) return;
      node.setAttribute("inert", "");
      inertedSiblings.push(node);
    });

    const getFocusables = () =>
      Array.from(sheet.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));

    getFocusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      inertedSiblings.forEach((node) => node.removeAttribute("inert"));
      menuButton?.focus();
    };
  }, [mobileOpen]);

  // Close the sheet automatically once the full nav takes over instead.
  useEffect(() => {
    if (showDesktopNav) setMobileOpen(false);
  }, [showDesktopNav]);

  return (
    <>
      <header
        id="navigation"
        tabIndex={-1}
        className="fixed top-0 z-50 w-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent sm:backdrop-blur-md"
        style={{
          backgroundColor:
            scrolled || isSmallScreen ? "rgba(11,10,9,0.92)" : "rgba(11,10,9,0.72)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div
          className="mx-auto flex h-[88px] max-w-6xl items-center justify-between gap-4"
          style={{
            paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
            paddingRight: "max(1.5rem, env(safe-area-inset-right))",
          }}
        >
          <Link
            href="/"
            aria-label={`${person.name}, home`}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-3 rounded-md"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent text-white"
            >
              <BrandMark className="h-5 w-5" />
            </span>
            <span className="hidden truncate font-display text-lg text-paper sm:block">
              {person.name}
            </span>
          </Link>

          {/* CSS-only visibility (no JS needed): visible at >=768px wide AND
              >=480px tall, matching the `nav:` screen in tailwind.config. */}
          <nav className="hidden items-center gap-1 nav:flex" aria-label="Main navigation">
            {SECTION_LINKS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex min-h-[44px] items-center rounded-md px-3 font-sans text-sm transition-colors ${
                    isActive ? "text-paper" : "text-muted hover:text-paper"
                  }`}
                >
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId="desktop-nav-indicator"
                      aria-hidden="true"
                      className="absolute bottom-2 left-3 right-3 h-px bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                </Link>
              );
            })}
            <Link
              href="/resume"
              className="ml-2 flex min-h-[44px] items-center rounded-full border border-paper/25 px-4 font-sans text-sm text-paper transition-colors hover:border-paper/50 hover:bg-paper/5"
            >
              Resume
            </Link>
            <Link
              href="/#contact"
              className="flex min-h-[44px] items-center rounded-full bg-accent px-4 font-sans text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
            >
              Contact
            </Link>
          </nav>

          {/* Opens the mobile sheet, which carries its own close (X) button
              inside the dialog — this one only ever opens, so it stays a
              plain Menu glyph. Made invisible (and, via the page-inert effect
              above, non-interactive) while the sheet is open, purely so it
              doesn't visually double up with the sheet's close button that
              sits in this same spot. CSS-only hidden/visible at `nav:` width,
              same as the desktop nav. */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-sheet"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-paper nav:hidden ${
              mobileOpen ? "invisible" : ""
            }`}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Scroll-progress thread: fills left-to-right with page scroll. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-paper/10">
          <motion.div
            className="h-full origin-left bg-accent"
            style={{ scaleX: scrollYProgress, boxShadow: progressGlow }}
          />
        </div>
      </header>

      {mobileOpen ? (
        <div
          id="mobile-nav-sheet"
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          // Above the header (z-50): the header is ~92% opaque and was
          // painting over this sheet (and its close button) at z-40, leaving
          // the X essentially invisible (~1.2:1 contrast). The header's own
          // menu button is also hidden (`invisible`) while this is open, so
          // nothing is lost by fully covering it.
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink"
          style={{ paddingTop: "calc(88px + env(safe-area-inset-top))" }}
        >
          {/* The dialog's own close control — positioned to land exactly where
              the header's (now-invisible) menu button sits, but a real DOM
              descendant of this dialog, so it's part of the focus trap and
              reachable by assistive tech as the dialog's close action. */}
          <div
            className="fixed inset-x-0 top-0 mx-auto flex h-[88px] max-w-6xl items-center justify-end"
            style={{
              paddingRight: "max(1.5rem, env(safe-area-inset-right))",
              paddingTop: "env(safe-area-inset-top)",
            }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full text-paper"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Natural top-down flow (not flex-centered) so the sheet scrolls
              cleanly instead of clipping its top when content is taller than
              the viewport, e.g. a landscape phone. */}
          <nav
            className="flex flex-col gap-1 py-8"
            style={{
              paddingLeft: "max(2rem, env(safe-area-inset-left))",
              paddingRight: "max(2rem, env(safe-area-inset-right))",
              paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
            }}
            aria-label="Mobile navigation"
          >
            {MOBILE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center font-display text-4xl text-paper transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
