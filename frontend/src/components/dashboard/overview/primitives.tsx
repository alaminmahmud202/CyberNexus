"use client";

import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shared primitives for the Security Overview console.
 *
 * Every metric card uses the same shell so typography, padding and hairlines
 * stay pixel-consistent across the grid:
 *   card radius 16px · padding 24px · border #1E1E1E · title 18/600.
 *
 * Colour source of truth: DESIGN_SPEC_DASHBOARD.md §3.
 */

type Tone = "high" | "medium" | "low" | "ok" | "neutral";

/** Badge text colour per tone. */
const toneText: Record<Tone, string> = {
  high: "text-sev-high",
  medium: "text-sev-medium",
  low: "text-sev-low",
  ok: "text-mint-500",
  neutral: "text-fg-muted",
};

/**
 * Badge background per tone — matches the design's explicit badge fills:
 * high = dark red #2E1517, medium = dark yellow #2B2311, ok = green tint,
 * neutral = muted #1A1A1A.
 */
const toneBg: Record<Tone, string> = {
  high: "bg-[#2E1517]",
  medium: "bg-[#2B2311]",
  low: "bg-[#123B2A]",
  ok: "bg-[#123B2A]",
  neutral: "bg-console-pill",
};

/** Card shell: #111111 surface, 16px radius, 1px #1E1E1E border, 24px padding. */
export function OverviewCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-console-line bg-console-raised p-6 text-fg",
        /* §12 subtle hover lift + border brightens to #2A2A2A */
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-console-hover",
        className
      )}
      {...props}
    />
  );
}

/** Card title row: 18px/600 title on the left, trailing node on the right. */
export function CardHeading({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="text-[18px] font-semibold leading-7 tracking-[-0.01em] text-fg">
        {title}
      </h2>
      {action}
    </header>
  );
}

/** The "•••" card menu affordance used on every overview card (§12 consistent). */
export function CardMenuButton({
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "-mr-1 flex h-6 w-6 items-center justify-center rounded-md text-fg-faint transition-colors hover:bg-console-soft hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/60",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

/** Circular icon button (search / bell in the console nav, §4). */
export function CircleIconButton({
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-console-line bg-console text-fg-muted transition-colors hover:bg-console-soft hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/60",
        className
      )}
      {...props}
    />
  );
}

/** Dark pill control (date range / Export / overflow), §5. */
export function SquareControl({
  label,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-9 items-center justify-center gap-2 rounded-lg border border-console-line bg-console-pill px-3.5 text-[13px] font-medium text-fg transition-colors hover:bg-console-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Severity / status pill: 6px radius, 12px, explicit tinted background (§3). */
export function Badge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-[3px] text-[12px] font-medium leading-none",
        toneBg[tone],
        toneText[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Small status dot on the right edge of an alert row (§8). */
export function StatusDot({
  tone,
  active = false,
  className,
}: {
  tone: Tone;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-2 w-2 rounded-full",
        active ? toneText[tone] : "bg-console-hover",
        className
      )}
    />
  );
}

const riskBarTone: Record<"high" | "medium" | "low", string> = {
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

/**
 * Segmented risk meter (§9): 12 small vertical ticks, filled ticks coloured,
 * empty ticks dark grey #2A2A2A (console-hover). `value` is 0-100.
 */
export function RiskBar({
  value,
  tone,
  className,
}: {
  value: number;
  tone: "high" | "medium" | "low";
  className?: string;
}) {
  const filled = Math.max(0, Math.min(12, Math.round((value / 100) * 12)));
  return (
    <span
      role="img"
      aria-label={`Risk ${value} percent`}
      className={cn("inline-flex items-center gap-[3px]", className)}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-[11px] w-[3px] rounded-[1.5px]",
            index < filled ? riskBarTone[tone] : "bg-console-hover"
          )}
        />
      ))}
    </span>
  );
}
