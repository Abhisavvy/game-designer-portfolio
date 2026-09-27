/**
 * Deterministic word-wrap for SVG <text> labels.
 *
 * We render node labels in a monospace font, so every character occupies the
 * same width — that makes a character-count wrap reliable without needing a
 * canvas measurement pass (which wouldn't run during SSR anyway).
 */
export function wrapMonoLabel(
  text: string,
  maxCharsPerLine: number,
  maxLines = 3,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;

  // Collapse any overflow lines into the last allowed line, truncating with
  // an ellipsis so we never overflow the node box.
  const head = lines.slice(0, maxLines - 1);
  const rest = lines.slice(maxLines - 1).join(" ");
  const truncated =
    rest.length > maxCharsPerLine
      ? `${rest.slice(0, Math.max(0, maxCharsPerLine - 1)).trimEnd()}…`
      : rest;
  return [...head, truncated];
}
