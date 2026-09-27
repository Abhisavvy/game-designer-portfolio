import Link from "next/link";
import { defaultPortfolioContent } from "../data/site-content";
import { BrandMark } from "./ui/BrandMark";

const FOOTER_NAV = [
  { href: "/#work", label: "Work" },
  { href: "/#projects", label: "Projects" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function SiteFooter() {
  const { person } = defaultPortfolioContent;
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-paper/10 bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent text-white"
              >
                <BrandMark className="h-5 w-5" />
              </span>
              <p className="font-display text-2xl text-paper">{person.name}</p>
            </div>
            <p className="mt-3 font-sans text-sm text-muted">{person.role}</p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Navigate
            </p>
            <ul className="space-y-3">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center font-sans text-sm text-muted transition-colors hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Connect
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${person.email}`}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center font-sans text-sm text-muted transition-colors hover:text-paper"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href={person.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center font-sans text-sm text-muted transition-colors hover:text-paper"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={person.links.resumePdf}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center font-sans text-sm text-muted transition-colors hover:text-paper"
                >
                  Resume (PDF)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-paper/10 pt-6">
          <p className="font-mono text-xs text-muted">
            © {year} {person.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
