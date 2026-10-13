"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AtSign, ChevronDown, Cloud, Monitor } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Badge,
  CardHeading,
  CardMenuButton,
  OverviewCard,
  RiskBar,
} from "./primitives";

/**
 * Security Threats table (DESIGN_SPEC_DASHBOARD.md §7.4).
 *
 * Five-column grid (Entity · Category · Risk Level · Status · row menu)
 * shared verbatim between the header row and each bordered data row so the
 * columns stay optically aligned.
 */

type RiskTone = "high" | "medium" | "low";
type StatusTone = "high" | "medium" | "low" | "ok" | "neutral";

type ThreatRow = {
  icon: LucideIcon;
  name: string;
  sub: string;
  category: string;
  value: number;
  tone: RiskTone;
  statusLabel: string;
  statusTone: StatusTone;
};

/** Shared column template for the header row and every data row. */
const GRID_COLS =
  "grid grid-cols-[minmax(0,1.9fr)_minmax(0,1.2fr)_minmax(0,1.15fr)_minmax(0,0.95fr)_28px] gap-4";

const threats: ThreatRow[] = [
  {
    icon: AtSign,
    name: "tanya.hill@example.com",
    sub: "User · Azure AD",
    category: "Authentication",
    value: 56,
    tone: "medium",
    statusLabel: "Monitoring",
    statusTone: "medium",
  },
  {
    icon: Cloud,
    name: "dev-28110633.okta.com",
    sub: "Service Account",
    category: "Privilege",
    value: 92,
    tone: "low",
    statusLabel: "Investigating",
    statusTone: "ok",
  },
  {
    icon: Monitor,
    name: "m.scott@trexony.com",
    sub: "Endpoint · Corporate Device",
    category: "Execution",
    value: 25,
    tone: "high",
    statusLabel: "Mitigated",
    statusTone: "high",
  },
];

const VIEW_ALL = "all";

/** "All System" plus one option per category present in the table. */
const viewOptions = [
  VIEW_ALL,
  ...Array.from(new Set(threats.map((threat) => threat.category))),
];

const viewLabel = (value: string) =>
  value === VIEW_ALL ? "View: All System" : `View: ${value}`;

export function SecurityThreatsCard() {
  const [view, setView] = useState<string>(VIEW_ALL);

  const rows =
    view === VIEW_ALL
      ? threats
      : threats.filter((threat) => threat.category === view);

  return (
    <OverviewCard className="min-h-[340px]">
      <CardHeading
        title="Security Threats"
        action={
          <span className="relative inline-flex items-center">
            <select
              aria-label="Threats view filter"
              value={view}
              onChange={(event) => setView(event.target.value)}
              className="h-8 appearance-none rounded-lg border border-console-line bg-console-pill pl-3 pr-8 text-[12px] text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/60"
            >
              {viewOptions.map((option) => (
                <option key={option} value={option}>
                  {viewLabel(option)}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 h-[13px] w-[13px] text-fg-muted"
            />
          </span>
        }
      />

      <div className="mt-4">
        <div
          aria-hidden="true"
          className={cn(
            GRID_COLS,
            "px-1 pb-3 text-[12px] text-fg-muted"
          )}
        >
          <span>Entity</span>
          <span>Category</span>
          <span>Risk Level</span>
          <span>Status</span>
          <span />
        </div>

        <ul className="space-y-2">
          {rows.map((threat) => {
            const Icon = threat.icon;
            return (
              <li
                key={threat.name}
                className={cn(
                  GRID_COLS,
                  "items-center rounded-xl border border-console-line bg-console px-4 py-3"
                )}
              >
                {/* Entity */}
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-console-pill">
                    <Icon
                      aria-hidden="true"
                      className="h-[15px] w-[15px] text-fg"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-fg">
                      {threat.name}
                    </span>
                    <span className="block truncate text-[12px] text-fg-faint">
                      {threat.sub}
                    </span>
                  </span>
                </div>

                {/* Category */}
                <span className="truncate text-[13px] text-fg-muted">
                  {threat.category}
                </span>

                {/* Risk level */}
                <span className="flex items-center">
                  <RiskBar value={threat.value} tone={threat.tone} />
                  <span className="ml-2 text-[12px] text-fg-muted tabular-nums">
                    {threat.value}%
                  </span>
                </span>

                {/* Status */}
                <span>
                  <Badge tone={threat.statusTone}>{threat.statusLabel}</Badge>
                </span>

                {/* Row menu */}
                <span className="flex justify-end">
                  <CardMenuButton label="Row options" />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </OverviewCard>
  );
}
