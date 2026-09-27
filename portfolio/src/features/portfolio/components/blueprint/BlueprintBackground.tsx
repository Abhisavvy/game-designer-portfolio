import { BP_COLORS } from "./tokens";

/**
 * Full-page blueprint paper: vertical gradient + a 24px minor / 120px major
 * grid + a soft vignette. Purely decorative — must sit inside a `relative
 * isolate` ancestor so the negative z-index can't escape and paint behind
 * that ancestor's own background.
 */
export function BlueprintBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `linear-gradient(to right, ${BP_COLORS.gridMajor} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${BP_COLORS.gridMajor} 1px, transparent 1px)`,
            `linear-gradient(to right, ${BP_COLORS.gridMinor} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${BP_COLORS.gridMinor} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${BP_COLORS.bgTop}, ${BP_COLORS.bgBottom})`,
          ].join(", "),
          backgroundSize:
            "120px 120px, 120px 120px, 24px 24px, 24px 24px, 100% 100%",
        }}
      />
      {/* Soft vignette: darker at the edges, lighter at top-center. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, transparent 45%, rgba(7,16,30,0.6) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 220px 40px rgba(3,8,16,0.65)",
        }}
      />
    </div>
  );
}
