import { cn } from "@/lib/utils";

import { CardHeading, CardMenuButton, OverviewCard } from "./primitives";

/**
 * Threat Tactics Activity heatmap (DESIGN_SPEC_DASHBOARD.md §7.1).
 *
 * 5 tactics × 5 days. Cell intensity follows the §2 heat scale:
 * 0 none #141414 · 1 low #0F3D2E · 2 medium #1A7A55 · 3 high #2ED88F.
 * Level-3 cells carry a faint mint bloom. Data is a fixed matrix — no RNG.
 */

/** Heat intensity for one cell, per the §2 four-step scale. */
type HeatLevel = 0 | 1 | 2 | 3;

/** Cell background per heat level. */
const LEVEL_BG: Record<HeatLevel, string> = {
  0: "bg-console-soft",
  1: "bg-mint-900",
  2: "bg-mint-700",
  3: "bg-mint-500",
};

/** Spoken intensity word per heat level (for accessible labels). */
const LEVEL_WORD: Record<HeatLevel, string> = {
  0: "no",
  1: "low",
  2: "medium",
  3: "high",
};

/** Faint bloom reserved for the brightest (level 3) cells — §2, used sparingly. */
const HEAT_BLOOM = "shadow-[0_0_12px_-2px_rgba(46,216,143,0.45)]";

/** Deterministic activity matrix (§7.1) — Discovery carries the most bright cells. */
const TACTIC_ROWS: ReadonlyArray<{
  tactic: string;
  cells: ReadonlyArray<HeatLevel>;
}> = [
  { tactic: "Initial Access", cells: [1, 1, 2, 1, 0] },
  { tactic: "Execution", cells: [1, 2, 1, 2, 1] },
  { tactic: "Discovery", cells: [3, 2, 3, 1, 3] },
  { tactic: "Defense Evasion", cells: [1, 3, 1, 2, 1] },
  { tactic: "Lateral Movement", cells: [0, 1, 2, 1, 1] },
];

/** Column dates, left → right (§7.1 bottom axis). */
const DATES = ["15 Jan", "16 Jan", "17 Jan", "18 Jan", "19 Jan"] as const;

export function ThreatTacticsCard() {
  return (
    <OverviewCard className="min-h-[360px]">
      <CardHeading
        title="Threat Tactics Activity"
        action={<CardMenuButton label="Threat tactics options" />}
      />

      <div className="mt-6 flex flex-1 flex-col gap-3">
        <div className="flex gap-2">
          {/* Row labels — vertically centred against their 28px grid rows. */}
          <div className="flex w-[110px] shrink-0 flex-col gap-1">
            {TACTIC_ROWS.map((row) => (
              <div key={row.tactic} className="flex h-[28px] items-center">
                <span className="whitespace-nowrap text-[13px] text-fg-muted">
                  {row.tactic}
                </span>
              </div>
            ))}
          </div>

          {/* Heat grid — 5 columns × 5 rows, 28px cells, 4px gaps. */}
          <div
            className="grid flex-1 grid-cols-5 gap-1"
            role="group"
            aria-label="Tactic activity by day"
          >
            {TACTIC_ROWS.flatMap((row) =>
              row.cells.map((level, columnIndex) => (
                <div
                  key={`${row.tactic}-${DATES[columnIndex]}`}
                  role="img"
                  aria-label={`${row.tactic}, ${DATES[columnIndex]}: ${LEVEL_WORD[level]} activity`}
                  className={cn(
                    "h-[28px] rounded-lg hover:opacity-90",
                    LEVEL_BG[level],
                    level === 3 && HEAT_BLOOM
                  )}
                />
              ))
            )}
          </div>
        </div>

        {/* Bottom axis — offset by the 110px label column, aligned to the grid columns. */}
        <div className="flex">
          <div className="w-[110px] shrink-0" aria-hidden="true" />
          <div className="grid flex-1 grid-cols-5 gap-1">
            {DATES.map((date) => (
              <div
                key={date}
                className="text-center text-[12px] text-fg-faint"
              >
                {date}
              </div>
            ))}
          </div>
        </div>
      </div>
    </OverviewCard>
  );
}
