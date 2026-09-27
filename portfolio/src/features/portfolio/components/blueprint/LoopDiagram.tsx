"use client";

import { useId, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { BP_COLORS, fontMonoStyle } from "./tokens";
import { wrapMonoLabel } from "./wrap-text";
import { FigureCaption } from "./PinnedFrame";

export type LoopData = {
  title: string;
  steps: string[];
  cycles: boolean;
};

type LoopDiagramProps = {
  loop: LoopData;
  threadColor: string;
  figureLabel?: string;
};

type Point = { x: number; y: number };
type PositionedNode = Point & { angle: number; label: string[]; step: string };

const NODE_W = 176;
const NODE_H = 78;
const MAX_CHARS_PER_LINE = 21;
const LINE_HEIGHT = 13;

const VB_W = 760;
const VB_H = 460;
const CX = VB_W / 2;
const CY = VB_H / 2 + 10;
const RX = 254;
const RY = 155;
const BOW = 70;

/**
 * Tailwind breakpoints, ascending. These class strings must stay fully
 * literal (not built from a template like `${bp}:block`) so Tailwind's
 * source scanner can find and generate them.
 */
const BREAKPOINT_MIN_PX = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
type Breakpoint = keyof typeof BREAKPOINT_MIN_PX;

const SVG_VISIBLE_AT: Record<Breakpoint, string> = {
  sm: "hidden sm:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
};
const STEPPER_HIDDEN_AT: Record<Breakpoint, string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};

/**
 * The SVG scales uniformly with its container (`w-full h-auto` against a
 * fixed viewBox), so a wider design needs a wider container before its mono
 * labels clear a legible size. Pick the narrowest breakpoint at which this
 * diagram's labels render at >=13px, and show the vertical stepper below
 * that instead of letting the diagram shrink into illegible text.
 */
function pickDiagramBreakpoint(viewBoxWidth: number): Breakpoint {
  const MIN_LABEL_PX = 13;
  const DESIGN_FONT_PX = 11;
  const ASSUMED_PAGE_CHROME_PX = 80; // page's own horizontal padding at >=sm
  const minContainerPx = (viewBoxWidth * MIN_LABEL_PX) / DESIGN_FONT_PX;
  const minViewportPx = minContainerPx + ASSUMED_PAGE_CHROME_PX;
  const order: Breakpoint[] = ["sm", "md", "lg", "xl"];
  return order.find((bp) => BREAKPOINT_MIN_PX[bp] >= minViewportPx) ?? "xl";
}

function rectEdgePoint(cx: number, cy: number, hw: number, hh: number, dx: number, dy: number): Point {
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const tX = dx !== 0 ? hw / Math.abs(dx) : Infinity;
  const tY = dy !== 0 ? hh / Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);
  return { x: cx + dx * t, y: cy + dy * t };
}

function ellipseNodes(steps: string[]): PositionedNode[] {
  const n = steps.length;
  return steps.map((step, i) => {
    const angle = -90 + i * (360 / n);
    const rad = (angle * Math.PI) / 180;
    return {
      x: CX + RX * Math.cos(rad),
      y: CY + RY * Math.sin(rad),
      angle,
      label: wrapMonoLabel(step, MAX_CHARS_PER_LINE),
      step,
    };
  });
}

function rowNodes(steps: string[]): { nodes: PositionedNode[]; width: number; height: number } {
  const gap = 56;
  const padding = 44;
  const y = 132;
  const nodes = steps.map((step, i) => ({
    x: padding + NODE_W / 2 + i * (NODE_W + gap),
    y,
    angle: 0,
    label: wrapMonoLabel(step, MAX_CHARS_PER_LINE),
    step,
  }));
  const width = padding * 2 + steps.length * NODE_W + (steps.length - 1) * gap;
  const height = y + NODE_H / 2 + 60;
  return { nodes, width, height };
}

function curvedPath(a: PositionedNode, b: PositionedNode, midAngleDeg: number): string {
  const start = rectEdgePoint(a.x, a.y, NODE_W / 2, NODE_H / 2, b.x - a.x, b.y - a.y);
  const end = rectEdgePoint(b.x, b.y, NODE_W / 2, NODE_H / 2, a.x - b.x, a.y - b.y);
  const rad = (midAngleDeg * Math.PI) / 180;
  const cx = CX + (RX + BOW) * Math.cos(rad);
  const cy = CY + (RY + BOW) * Math.sin(rad);
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function straightPath(a: PositionedNode, b: PositionedNode): string {
  const start = rectEdgePoint(a.x, a.y, NODE_W / 2, NODE_H / 2, b.x - a.x, b.y - a.y);
  const end = rectEdgePoint(b.x, b.y, NODE_W / 2, NODE_H / 2, a.x - b.x, a.y - b.y);
  const midY = (start.y + end.y) / 2 - 12;
  const midX = (start.x + end.x) / 2;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function buildSummary(loop: LoopData): string {
  const kind = loop.cycles ? "a repeating loop of" : "a";
  const tail = loop.cycles ? " After the last step, it repeats from the first." : "";
  return `${loop.title}: ${kind} ${loop.steps.length} steps — ${loop.steps.join("; ")}.${tail}`;
}

function NodeLabel({ node, uid }: { node: PositionedNode; uid: string }) {
  const startY = node.y - ((node.label.length - 1) * LINE_HEIGHT) / 2;
  return (
    <text
      x={node.x}
      y={startY}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={11}
      style={fontMonoStyle}
      fill={BP_COLORS.text}
    >
      {node.label.map((line, i) => (
        <tspan key={`${uid}-line-${i}`} x={node.x} dy={i === 0 ? 0 : LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function StepNode({ node, index, threadColor, uid }: { node: PositionedNode; index: number; threadColor: string; uid: string }) {
  const left = node.x - NODE_W / 2;
  const top = node.y - NODE_H / 2;
  return (
    <g>
      <rect
        x={left}
        y={top}
        width={NODE_W}
        height={NODE_H}
        rx={10}
        fill="rgba(13,27,48,0.62)"
        stroke={BP_COLORS.drawLine}
        strokeWidth={1.25}
      />
      <NodeLabel node={node} uid={uid} />
      <circle cx={left + 4} cy={top + 4} r={11} fill={threadColor} stroke={BP_COLORS.bgBottom} strokeWidth={1.5} />
      <text
        x={left + 4}
        y={top + 4.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={700}
        style={fontMonoStyle}
        fill={BP_COLORS.bgBottom}
      >
        {index + 1}
      </text>
    </g>
  );
}

function ArrowPath({
  d,
  uid,
  index,
  threadColor,
  markerId,
  animate,
}: {
  d: string;
  uid: string;
  index: number;
  threadColor: string;
  markerId: string;
  animate: boolean;
}) {
  const pathId = `${uid}-arrow-${index}`;
  return (
    <g>
      <path
        id={pathId}
        d={d}
        fill="none"
        stroke={BP_COLORS.drawLine}
        strokeWidth={1.5}
        opacity={0.6}
        markerEnd={`url(#${markerId})`}
      />
      {animate ? (
        <motion.path
          d={d}
          fill="none"
          stroke={threadColor}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.9 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, delay: 0.15 * index, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 3px ${threadColor})` }}
        />
      ) : null}
      {animate ? (
        <circle r={3.5} fill={threadColor} style={{ filter: `drop-shadow(0 0 4px ${threadColor})` }}>
          {/* Bounded run (WCAG 2.2.2 Pause/Stop/Hide): the dot travels a
              fixed number of cycles then stops, rather than animating
              forever. It re-mounts (and so re-runs) each time the diagram
              re-enters the viewport — see `useInView` below, which is not
              `once`. */}
          <animateMotion
            dur="1.7s"
            begin={`${0.4 + index * 0.35}s`}
            repeatCount="3"
            rotate="auto"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ) : null}
    </g>
  );
}

function MobileStepper({ loop, threadColor }: { loop: LoopData; threadColor: string }) {
  return (
    <ol className="relative flex flex-col gap-6 pl-1">
      {/* Single continuous track behind the badges — simpler and more robust
          than measuring each step's variable text-wrapped height. Badges are
          opaque and painted after this in DOM order, so they naturally cover
          the segment of line that runs through them. */}
      <span
        aria-hidden
        className="absolute left-[13px] top-3.5 bottom-3.5 w-0 border-l border-dashed"
        style={{ borderColor: BP_COLORS.drawLine }}
      />
      {loop.steps.map((step, i) => (
        <li key={i} className="relative pl-11">
          <span
            className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
            style={{ background: threadColor, color: BP_COLORS.bgBottom, ...fontMonoStyle }}
          >
            {i + 1}
          </span>
          <div
            className="rounded border px-3 py-2 text-[13px] leading-snug"
            style={{ borderColor: "rgba(147,197,253,0.3)", color: BP_COLORS.textDim, ...fontMonoStyle }}
          >
            {step}
          </div>
        </li>
      ))}
      {loop.cycles ? (
        <li className="relative pl-11">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-[11px] uppercase tracking-wide"
            style={{ borderColor: threadColor, color: threadColor, ...fontMonoStyle }}
          >
            <span aria-hidden>&#8634;</span> Repeats from step 1
          </span>
        </li>
      ) : null}
    </ol>
  );
}

export function LoopDiagram({ loop, threadColor, figureLabel = "FIG. 2" }: LoopDiagramProps) {
  const uid = `loop-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  // Not `once`: re-triggers the bounded arrow-draw + travelling-dot
  // animation each time the diagram scrolls back into view (see the
  // capped `repeatCount` above), rather than only ever once.
  const inView = useInView(svgRef, { margin: "-15% 0px -15% 0px" });
  const reduceMotion = useReducedMotion();
  const shouldAnimate = Boolean(inView) && reduceMotion !== true;

  const n = loop.steps.length;

  const { pathD, nodes, viewBox, vbWidth } = useMemo(() => {
    if (loop.cycles) {
      const ns = ellipseNodes(loop.steps);
      const paths = ns.map((node, i) => {
        const next = ns[(i + 1) % n];
        const midAngle = node.angle + 360 / n / 2;
        return curvedPath(node, next, midAngle);
      });
      return { pathD: paths, nodes: ns, viewBox: `0 0 ${VB_W} ${VB_H}`, vbWidth: VB_W };
    }
    const { nodes: ns, width, height } = rowNodes(loop.steps);
    const paths = ns.slice(0, -1).map((node, i) => straightPath(node, ns[i + 1]));
    return { pathD: paths, nodes: ns, viewBox: `0 0 ${width} ${height}`, vbWidth: width };
  }, [loop.cycles, loop.steps, n]);

  const diagramBreakpoint = pickDiagramBreakpoint(vbWidth);
  const markerId = `${uid}-arrowhead`;
  const summary = buildSummary(loop);

  return (
    <div>
      <div role="img" aria-label={summary}>
        {/* SVG diagram once the container is wide enough for legible labels;
            the vertical stepper otherwise (see pickDiagramBreakpoint). */}
        <div aria-hidden className={SVG_VISIBLE_AT[diagramBreakpoint]}>
          <svg ref={svgRef} viewBox={viewBox} className="h-auto w-full overflow-visible">
            <defs>
              <marker
                id={markerId}
                markerWidth={8}
                markerHeight={8}
                refX={6.5}
                refY={4}
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill={BP_COLORS.drawLine} opacity={0.7} />
              </marker>
            </defs>

            {loop.cycles ? (
              <ellipse
                cx={CX}
                cy={CY}
                rx={RX}
                ry={RY}
                fill="none"
                stroke={BP_COLORS.gridMajor}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            ) : null}

            {pathD.map((d, i) => (
              <ArrowPath
                key={`arrow-${i}`}
                d={d}
                uid={uid}
                index={i}
                threadColor={threadColor}
                markerId={markerId}
                animate={shouldAnimate}
              />
            ))}

            {nodes.map((node, i) => (
              <StepNode key={`node-${i}`} node={node} index={i} threadColor={threadColor} uid={uid} />
            ))}
          </svg>
        </div>

        {/* Vertical stepper below the diagram's legibility breakpoint. */}
        <div aria-hidden className={STEPPER_HIDDEN_AT[diagramBreakpoint]}>
          <MobileStepper loop={loop} threadColor={threadColor} />
        </div>
      </div>

      <ol className="sr-only">
        {loop.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <FigureCaption label={figureLabel} caption={loop.title} className="mt-4" />
    </div>
  );
}
