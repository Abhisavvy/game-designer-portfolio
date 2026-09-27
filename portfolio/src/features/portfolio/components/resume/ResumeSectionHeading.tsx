/**
 * The mono "eyebrow" heading used for every resume section (SUMMARY, WHAT I
 * FOCUS ON, KEY ACHIEVEMENTS, ...). Unlike the homepage's SectionHeading
 * (a large display-serif title with an eyebrow above it), a resume section
 * needs to be information-dense, so the eyebrow label IS the h2 here.
 */
export function ResumeSectionHeading({
  eyebrow,
  id,
}: {
  eyebrow: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted sm:text-sm"
    >
      <span aria-hidden="true" className="h-px w-8 shrink-0 bg-accent" />
      {eyebrow}
    </h2>
  );
}
