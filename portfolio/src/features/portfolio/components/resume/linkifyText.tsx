import type { ReactNode } from "react";

/**
 * Splits `text` around the first verbatim occurrence of each linked tool's
 * name (e.g. "Kinoa.io", "Data.ai") and renders that occurrence as a link —
 * the same tool URLs used in the Skills & Tools line, applied in-line
 * wherever a resume sentence happens to mention that tool by name. Never
 * alters the text itself, only wraps an exact substring in a link.
 */
export function linkifyText(
  text: string,
  linkedTools: { name: string; href: string }[],
): ReactNode {
  let remaining = text;
  const nodes: ReactNode[] = [];

  for (const tool of linkedTools) {
    const idx = remaining.indexOf(tool.name);
    if (idx === -1) continue;
    const before = remaining.slice(0, idx);
    const after = remaining.slice(idx + tool.name.length);
    if (before) nodes.push(before);
    nodes.push(
      <a
        key={tool.name}
        href={tool.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        {tool.name}
      </a>,
    );
    remaining = after;
  }

  nodes.push(remaining);
  return nodes;
}
