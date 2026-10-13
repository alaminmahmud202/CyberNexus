import { Calendar, ChevronDown, MoreHorizontal, Share2 } from "lucide-react";

import { SquareControl } from "./primitives";

/**
 * Page header (DESIGN_SPEC_DASHBOARD.md §6): H1 + subtitle on the left,
 * date-range / Export / overflow controls on the right. No local state —
 * server-compatible. The page supplies horizontal padding.
 */
export function WelcomeHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[36px] font-bold leading-[1.1] tracking-[-0.02em] text-fg">
          Welcome back, Edward
        </h1>
        <p className="mt-1 text-[14px] text-fg-muted">
          Latest security activity overview
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <SquareControl label="Select date range">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Jan 15 – Jan 19, 2026</span>
          <ChevronDown
            className="h-3.5 w-3.5 text-fg-faint"
            aria-hidden="true"
          />
        </SquareControl>

        <SquareControl label="Export report">
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Export</span>
        </SquareControl>

        <SquareControl label="More options" className="w-9 px-0">
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </SquareControl>
      </div>
    </div>
  );
}
