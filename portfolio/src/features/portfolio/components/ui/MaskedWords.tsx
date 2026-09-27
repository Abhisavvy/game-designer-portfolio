import { cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";

interface Counters {
  key: number;
  word: number;
}

function delayStyle(ms: number): CSSProperties {
  return { "--reveal-delay": ms } as CSSProperties;
}

function renderToken(token: string, delayStep: number, baseDelay: number, counters: Counters): ReactNode {
  if (/^\s+$/.test(token)) {
    return <span key={counters.key++}>{token}</span>;
  }
  const delay = baseDelay + counters.word++ * delayStep;
  return (
    <span className="inline-block overflow-hidden align-baseline" key={counters.key++}>
      <span className="reveal-mask-word inline-block" style={delayStyle(delay)}>
        {token}
      </span>
    </span>
  );
}

function walk(node: ReactNode, delayStep: number, baseDelay: number, counters: Counters): ReactNode {
  if (typeof node === "string") {
    return node
      .split(/(\s+)/)
      .filter((part) => part.length > 0)
      .map((part) => renderToken(part, delayStep, baseDelay, counters));
  }
  if (typeof node === "number") {
    return renderToken(String(node), delayStep, baseDelay, counters);
  }
  if (Array.isArray(node)) {
    return node.map((child) => walk(child, delayStep, baseDelay, counters));
  }
  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    const children = walk(element.props.children, delayStep, baseDelay, counters);
    return cloneElement(element, { key: counters.key++ }, children);
  }
  return node;
}

/**
 * Splits `children` (plain text, or text mixed with inline elements like
 * `<em>`) into individual words, each wrapped in an `overflow-hidden`
 * line mask around a `.reveal-mask-word` span.
 *
 * Pairs with `useRevealOnView`: the mask/translate styles only apply once
 * an ancestor carries `.reveal-armed` (added client-side, only when
 * motion is allowed), so with no JS — or with reduced motion — every word
 * simply renders at its natural, fully visible position.
 */
export function MaskedWords({
  children,
  delayStep = 55,
  baseDelay = 0,
}: {
  children: ReactNode;
  delayStep?: number;
  baseDelay?: number;
}) {
  const counters: Counters = { key: 0, word: 0 };
  return <>{walk(children, delayStep, baseDelay, counters)}</>;
}
