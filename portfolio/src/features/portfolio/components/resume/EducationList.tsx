import type { ResumeEducation } from "./types";

export function EducationList({ education }: { education: ResumeEducation[] }) {
  return (
    <ul className="space-y-4">
      {education.map((edu) => (
        <li key={edu.degree}>
          <h3 className="font-display text-lg leading-snug text-paper">{edu.degree}</h3>
          <p className="font-mono text-xs uppercase tracking-wide text-muted sm:text-sm">
            {edu.institution} · {edu.years}
          </p>
        </li>
      ))}
    </ul>
  );
}
