interface BrandMarkProps {
  /** Sizing/color are controlled entirely by the caller via className. */
  className?: string;
}

/**
 * The "AD" brand mark — the same glyph as `public/icon.svg` (the site
 * favicon), reproduced inline so it can inherit `currentColor` and be sized
 * with Tailwind classes instead of an <img> + CSS filter hack.
 */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M8 2L3 22h2.5l1-4h3l1 4h2.5L8 2z" />
      <path d="M5.5 16h5" />
      <path d="M14 2h4c3 0 5 2 5 5v10c0 3-2 5-5 5h-4V2z" />
      <path d="M14 2v20" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
