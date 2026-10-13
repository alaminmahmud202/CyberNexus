"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { CardHeading, CardMenuButton, OverviewCard } from "./primitives";

/**
 * Response Status Distribution (DESIGN_SPEC_DASHBOARD.md §7.5).
 *
 * Seven stacked bars (Mon–Sun). Every bar except Thu renders dimmed to
 * greys so the active day reads immediately; hovering a column promotes it
 * to the active (saturated) state. The tooltip follows the hovered column
 * and defaults to Thu, matching the reference design.
 */

type SegmentKey = "open" | "inProgress" | "resolved" | "escalated";

type DayDatum = {
  label: string;
  full: string;
  open: number;
  inProgress: number;
  resolved: number;
  escalated: number;
};

/** Per-day counts — Open / In Progress / Resolved / Escalated (§7.5). */
const DAYS: readonly DayDatum[] = [
  { label: "Mon", full: "Monday", open: 6, inProgress: 2, resolved: 1, escalated: 0 },
  { label: "Tue", full: "Tuesday", open: 4, inProgress: 1, resolved: 2, escalated: 0 },
  { label: "Wed", full: "Wednesday", open: 5, inProgress: 2, resolved: 1, escalated: 0 },
  { label: "Thu", full: "Thursday", open: 7, inProgress: 3, resolved: 5, escalated: 2 },
  { label: "Fri", full: "Friday", open: 3, inProgress: 1, resolved: 1, escalated: 0 },
  { label: "Sat", full: "Saturday", open: 5, inProgress: 2, resolved: 0, escalated: 0 },
  { label: "Sun", full: "Sunday", open: 4, inProgress: 1, resolved: 1, escalated: 0 },
];

/** Thu is the active day in the default (non-hovered) state. */
const ACTIVE_DAY_INDEX = 3;

/**
 * Stacked segments, bottom → top (§7.5). `active` fills are the mint scale
 * from §2; `dim` fills are the recessive greys used for inactive bars.
 */
const SEGMENTS: readonly {
  key: SegmentKey;
  label: string;
  active: string;
  dim: string;
}[] = [
  { key: "open", label: "Open", active: "bg-mint-900", dim: "bg-console-soft" },
  { key: "inProgress", label: "In Progress", active: "bg-mint-700", dim: "bg-console-pill" },
  { key: "resolved", label: "Resolved", active: "bg-mint-500", dim: "bg-console-line" },
  { key: "escalated", label: "Escalated", active: "bg-mint-300", dim: "bg-console-hover" },
];

/** Tooltip rows and legend read top → bottom (Escalated first). */
const TOP_DOWN_SEGMENTS = [...SEGMENTS].reverse();

const TOTALS = DAYS.map((day) => day.open + day.inProgress + day.resolved + day.escalated);
const MAX_TOTAL = Math.max(...TOTALS); // Thu = 17

export function ResponseStatusCard() {
  const [hoveredIndex, setHoveredIndex] = useState<number>(ACTIVE_DAY_INDEX);
  const hovered = DAYS[hoveredIndex];

  return (
    <OverviewCard>
      <CardHeading
        title="Response Status Distribution"
        action={<CardMenuButton label="Response status options" />}
      />

      <div
        className="mt-6 flex min-h-0 flex-1 flex-col"
        onMouseLeave={() => setHoveredIndex(ACTIVE_DAY_INDEX)}
      >
        {/* Plot — 7 flexible columns, each holding a 44px stacked bar */}
        <div className="relative flex min-h-[184px] flex-1 items-stretch gap-3">
          {DAYS.map((day, index) => {
            const total = TOTALS[index];
            const isActive = hoveredIndex === index;
            /* Only non-zero segments render, so the 6px outer radii always
               land on the visible bottom / top of the stack. */
            const visible = SEGMENTS.filter((segment) => day[segment.key] > 0);

            return (
              <div
                key={day.label}
                role="img"
                aria-label={`${day.full}: ${day.open} open, ${day.inProgress} in progress, ${day.resolved} resolved, ${day.escalated} escalated`}
                onMouseEnter={() => setHoveredIndex(index)}
                className="flex h-full flex-1 cursor-default flex-col justify-end"
              >
                <div className="flex flex-1 items-end justify-center">
                  <div
                    className="flex w-11 flex-col-reverse"
                    style={{ height: `${(total / MAX_TOTAL) * 100}%` }}
                  >
                    {visible.map((segment, sIndex) => (
                      <div
                        key={segment.key}
                        style={{ flexGrow: day[segment.key], flexBasis: 0 }}
                        className={cn(
                          "transition-colors duration-200",
                          isActive ? segment.active : segment.dim,
                          sIndex === 0 && "rounded-b-md",
                          sIndex === visible.length - 1 && "rounded-t-md"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <span
                  className={cn(
                    "mt-3 text-center text-[12px] leading-none",
                    isActive ? "text-fg" : "text-fg-faint"
                  )}
                >
                  {day.label}
                </span>
              </div>
            );
          })}

          {/* Tooltip — follows the hovered (default: Thu) column, clamped at
              the plot edges so it never overflows the card (§7.5). */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 z-10 rounded-[10px] border border-console-line bg-console-soft px-3 py-2 shadow-xl",
              hoveredIndex < 2
                ? "left-0"
                : hoveredIndex > 4
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2"
            )}
          >
            {TOP_DOWN_SEGMENTS.map((segment) => (
              <div key={segment.key} className="flex items-center gap-2 py-[3px]">
                <span
                  aria-hidden="true"
                  className={cn("h-2 w-2 shrink-0 rounded-full", segment.active)}
                />
                <span className="text-[12px] text-fg-muted">{segment.label}</span>
                <span className="ml-4 text-[12px] tabular-nums text-fg">
                  {hovered[segment.key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend (§7.5) */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-fg-muted">
          {TOP_DOWN_SEGMENTS.map((segment) => (
            <span key={segment.key} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn("h-2 w-2 rounded-[3px]", segment.active)}
              />
              {segment.label}
            </span>
          ))}
        </div>
      </div>
    </OverviewCard>
  );
}
