"use client";

import type { HTMLAttributes } from "react";
import { CheckCircle, AlertTriangle, AlertCircle, Loader2, HelpCircle, X, XCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "neutral"
  | "accent"
  | "safe"
  | "warning"
  | "danger"
  | "info"
  | "primary"
  | "secondary"
  | "outline"
  | "subtle";

export type BadgeSize = "xs" | "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-edge bg-surface-raised text-ink-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  safe: "border-safe/25 bg-safe/10 text-safe",
  warning: "border-warning/25 bg-warning/10 text-warning",
  danger: "border-danger/25 bg-danger/10 text-danger",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  primary: "border-transparent bg-gradient-to-r from-accent to-blue-500 text-slate-950",
  secondary: "border-transparent bg-surface-raised text-ink",
  outline: "border-edge bg-transparent text-ink-muted hover:bg-surface-raised",
  subtle: "border-transparent bg-transparent text-ink-muted hover:bg-surface-raised",
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-[10px] gap-1",
  sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
  md: "px-3 py-1 text-xs gap-1.5",
  lg: "px-3.5 py-1.5 text-sm gap-2",
};

const dotColors: Record<BadgeVariant, string> = {
  neutral: "bg-ink-muted",
  accent: "bg-accent",
  safe: "bg-safe",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-blue-400",
  primary: "bg-slate-950",
  secondary: "bg-ink",
  outline: "bg-ink-muted",
  subtle: "bg-ink-muted",
};

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  icon,
  removable = false,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-full border transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        removable && "cursor-pointer pr-1",
        className
      )}
      {...props}
    >
      {dot && <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full animate-pulse", dotColors[variant])} />}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn("ml-1 flex h-full items-center rounded-r-full px-1.5 transition-colors hover:bg-black/20", size === "xs" && "p-0")}
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export function StatusBadge({ status, className, ...props }: { status: "safe" | "warning" | "danger" | "pending" | "unknown" } & BadgeProps) {
  const statusConfig = {
    safe: { variant: "safe" as BadgeVariant, label: "Safe", icon: <CheckCircle className="h-3 w-3" /> },
    warning: { variant: "warning" as BadgeVariant, label: "Warning", icon: <AlertTriangle className="h-3 w-3" /> },
    danger: { variant: "danger" as BadgeVariant, label: "Danger", icon: <AlertCircle className="h-3 w-3" /> },
    pending: { variant: "info" as BadgeVariant, label: "Pending", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    unknown: { variant: "neutral" as BadgeVariant, label: "Unknown", icon: <HelpCircle className="h-3 w-3" /> },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot={status !== "unknown"} icon={config.icon} className={className} {...props}>
      {config.label}
    </Badge>
  );
}

export function SeverityBadge({ severity, className, ...props }: { severity: "critical" | "high" | "medium" | "low" | "info" } & BadgeProps) {
  const severityConfig = {
    critical: { variant: "danger" as BadgeVariant, label: "Critical", icon: <XCircle className="h-3 w-3" /> },
    high: { variant: "danger" as BadgeVariant, label: "High", icon: <AlertCircle className="h-3 w-3" /> },
    medium: { variant: "warning" as BadgeVariant, label: "Medium", icon: <AlertTriangle className="h-3 w-3" /> },
    low: { variant: "info" as BadgeVariant, label: "Low", icon: <Circle className="h-3 w-3" /> },
    info: { variant: "accent" as BadgeVariant, label: "Info", icon: <HelpCircle className="h-3 w-3" /> },
  };

  const config = severityConfig[severity];

  return (
    <Badge variant={config.variant} dot icon={config.icon} className={className} {...props}>
      {config.label}
    </Badge>
  );
}