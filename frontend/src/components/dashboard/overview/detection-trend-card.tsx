"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { CardHeading, CardMenuButton, OverviewCard } from "./primitives";

/**
 * Detection Volume Trend area chart (DESIGN_SPEC_DASHBOARD.md §7.2).
 *
 * Hand-built SVG — no chart library. The area/line path lives in a
 * `0 0 1000 300` viewBox with `preserveAspectRatio="none"` so it stretches to
 * the card, while axis labels, the dashed baselines, the marker and the
 * tooltip stay in HTML. That keeps text crisp and the marker perfectly round
 * (an SVG circle would smear into an ellipse under a non-uniform scale).
 *
 * Because the viewBox Y span is 0-100 in value space, any value maps to a
 * `top` percentage of `100 - value`, so HTML overlays align with the path
 * exactly. Data is a fixed array — no RNG.
 */

/** Plot viewBox width/height. Only the X span is used for positioning math. */
const VIEW_W = 1000;

/** Deterministic detection counts, 32 points across W1-W4 (§7.2). */
const VALUES: ReadonlyArray<number> = [
  // W1 — steady, mildly noisy
  42, 38, 45, 40, 47, 43, 39, 46,
  // W2 — dips hard to 25, then recovers
  44, 36, 28, 25, 33, 41, 38, 44,
  // W3 — climbs through the active reading (52)
  48, 50, 47, 52, 58, 55, 61, 59,
  // W4 — continues up, ends high
  63, 60, 66, 64, 69, 67, 72, 70,
];

/** Y-axis ticks, top → bottom (§7.2). */
const Y_TICKS = ["100", "80", "60", "40", "20", "0"] as const;

/** X-axis week labels (§7.2). */
const WEEKS = ["W1", "W2", "W3", "W4"] as const;

/** The active reading: index 20 sits in W3 and reads 52 (§7.2 tooltip). */
const DEFAULT_INDEX = 20;

/** Horizontal dashed baseline value (§7.2). */
const BASELINE = 55;

/** Point → plot-percentage helpers. */
const xPct = (index: number) => (index / (VALUES.length - 1)) * 100;
const yPct = (value: number) => 100 - value;

/** SVG path for the line, in viewBox units. */
const linePath = VALUES.map((value, index) => {
  const x = (index / (VALUES.length - 1)) * VIEW_W;
  const y = yPct(value) * 3; // viewBox height 300 == 100 value units × 3
  return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
}).join(" ");

/** Closed area path: the line, then down the right edge and back along the base. */
const areaPath = `${linePath} L${VIEW_W},300 L0,300 Z`;

export function DetectionTrendCard() {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);

  const activeValue = VALUES[activeIndex];
  const activeLeft = xPct(activeIndex);
  const activeTop = yPct(activeValue);
  /* Clamp the tooltip inside the plot so it never clips the card edges. */
  const tooltipLeft = Math.min(88, Math.max(12, activeLeft));

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const next = Math.round(ratio * (VALUES.length - 1));
    setActiveIndex(Math.min(VALUES.length - 1, Math.max(0, next)));
  }

  return (
    <OverviewCard className="min-h-[360px]">
      <CardHeading
        title="Detection Volume Trend"
        action={<CardMenuButton label="Detection volume options" />}
      />

      <div className="mt-6 flex flex-1 flex-col">
        <div className="flex flex-1 gap-3">
          {/* Y axis — kept in HTML so the numerals stay crisp. */}
          <div className="flex w-8 shrink-0 flex-col justify-between py-0.5 text-right text-[12px] text-fg-muted">
            {Y_TICKS.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>

          {/* Plot area */}
          <div
            className="relative flex-1 cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setActiveIndex(DEFAULT_INDEX)}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`0 0 ${VIEW_W} 300`}
              preserveAspectRatio="none"
              role="img"
              aria-label="Detection volume trend, weeks 1 to 4"
            >
              <title>Detection volume trend, weeks 1 to 4</title>
              <defs>
                <linearGradient id="detectionAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(52,211,153,0.22)" />
                  <stop offset="100%" stopColor="rgba(52,211,153,0)" />
                </linearGradient>
              </defs>

              <path d={areaPath} fill="url(#detectionAreaFill)" />
              <path
                d={linePath}
                fill="none"
                stroke="#34D399"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.35))" }}
              />
            </svg>

            {/* Horizontal dashed baseline at ~55 — HTML for a crisp dash. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#2A2A2A]"
              style={{ top: `${yPct(BASELINE)}%` }}
            />

            {/* Vertical dashed indicator at the active point. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 border-l border-dashed border-[#2A2A2A]"
              style={{ left: `${activeLeft}%` }}
            />

            {/* Active marker — round because it is HTML, not a scaled SVG circle. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-mint-400 bg-white shadow-[0_0_8px_-1px_rgba(52,211,153,0.7)]"
              style={{ left: `${activeLeft}%`, top: `${activeTop}%` }}
            />

            {/* Tooltip (§7.2) */}
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[10px] border border-console-line bg-console-soft px-3 py-2.5 shadow-xl"
              style={{ left: `${tooltipLeft}%`, top: `${activeTop}%`, marginTop: "-12px" }}
            >
              <p className="whitespace-nowrap text-[13px] font-medium text-fg">
                New Detections: {activeValue}
              </p>
              <p className="mt-1 flex items-center gap-1 whitespace-nowrap">
                <TrendingUp className="h-3 w-3 text-mint-500" aria-hidden="true" />
                <span className="text-[12px] font-medium text-mint-500">+12%</span>
                <span className="text-[12px] text-fg-faint">vs previous week</span>
              </p>
            </div>
          </div>
        </div>

        {/* X axis — W3 is the active week (§7.2). */}
        <div className="mt-3 flex justify-between pl-11 text-[12px]">
          {WEEKS.map((week) => (
            <span
              key={week}
              className={cn(
                week === "W3" ? "font-medium text-fg" : "text-fg-faint"
              )}
            >
              {week}
            </span>
          ))}
        </div>
      </div>
    </OverviewCard>
  );
}
