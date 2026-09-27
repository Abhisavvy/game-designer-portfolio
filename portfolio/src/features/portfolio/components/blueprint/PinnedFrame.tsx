import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import { BP_COLORS, fontMonoStyle } from "./tokens";

/** Four small corner registration/crop marks, like a pinned technical drawing. */
export function CornerMarks({ color = BP_COLORS.drawLine }: { color?: string }) {
  const base = "absolute h-3.5 w-3.5 sm:h-4 sm:w-4";
  const style = { borderColor: color };
  return (
    <>
      <span aria-hidden className={clsx(base, "left-1.5 top-1.5 border-l-2 border-t-2")} style={style} />
      <span aria-hidden className={clsx(base, "right-1.5 top-1.5 border-r-2 border-t-2")} style={style} />
      <span aria-hidden className={clsx(base, "bottom-1.5 left-1.5 border-b-2 border-l-2")} style={style} />
      <span aria-hidden className={clsx(base, "bottom-1.5 right-1.5 border-b-2 border-r-2")} style={style} />
    </>
  );
}

export function FigureCaption({
  label,
  caption,
  className,
}: {
  label: string;
  caption: string;
  className?: string;
}) {
  return (
    <p
      className={clsx(
        "text-center text-[11px] uppercase tracking-[0.14em]",
        className,
      )}
      style={{ ...fontMonoStyle, color: BP_COLORS.muted }}
    >
      <span style={{ color: BP_COLORS.figLabel }}>{label}</span>
      {" — "}
      {caption}
    </p>
  );
}

type PinnedFrameProps = {
  figureLabel: string;
  caption: string;
  children: ReactNode;
  aspectClassName?: string;
  /** Darker plate background — use for object-contain media (e.g. portrait screenshots). */
  plate?: boolean;
  className?: string;
  frameClassName?: string;
  /** Extra inline style merged onto the frame div — a general escape hatch,
   *  currently unused by any call site. */
  frameStyle?: CSSProperties;
};

/**
 * Wraps media so it reads like a pinned drawing: thin light-blue border,
 * corner registration marks, and a mono caption below ("FIG. 1 — Title").
 */
export function PinnedFrame({
  figureLabel,
  caption,
  children,
  aspectClassName = "aspect-video",
  plate = false,
  className,
  frameClassName,
  frameStyle,
}: PinnedFrameProps) {
  return (
    <figure className={clsx("relative", className)}>
      <div
        className={clsx(
          "relative overflow-hidden rounded-[3px] border",
          aspectClassName,
          plate ? "bg-[#050b15]" : "bg-[#0c1c30]",
          frameClassName,
        )}
        style={{ borderColor: BP_COLORS.drawLine, ...frameStyle }}
      >
        {children}
        <CornerMarks />
      </div>
      <FigureCaption label={figureLabel} caption={caption} className="mt-3" />
    </figure>
  );
}
