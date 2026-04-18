import { defaultPortfolioContent } from "../data/site-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 py-10 text-center text-sm text-zinc-500">
      <p>
        © {new Date().getFullYear()} {defaultPortfolioContent.person.name}. Built with Next.js.
      </p>
    </footer>
  );
}
