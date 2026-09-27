import { linkifyText } from "./linkifyText";
import type { ResumeAdditionalStrength, ResumeFocusItem, ResumeToolItem } from "./types";

/** Renders "What I Focus On" and "Additional Strengths": a bold label, then supporting text. */
export function LabeledList({
  items,
  linkedTools = [],
}: {
  items: (ResumeFocusItem | ResumeAdditionalStrength)[];
  linkedTools?: ResumeToolItem[];
}) {
  const tools = linkedTools.filter(
    (tool): tool is { name: string; href: string } => Boolean(tool.href),
  );

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="text-sm leading-relaxed text-muted sm:text-base">
          <strong className="font-semibold text-paper">{item.label}:</strong>{" "}
          {linkifyText(item.text, tools)}
        </li>
      ))}
    </ul>
  );
}
