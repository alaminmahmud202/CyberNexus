"use client";

import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "glass" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const variantClasses = {
  default: "border border-edge bg-surface shadow-panel",
  elevated: "bg-surface-raised shadow-card border border-edge/50",
  outlined: "border-2 border-edge bg-transparent",
  glass: "glass",
  gradient: "relative bg-gradient-to-br from-surface-raised/50 to-surface/50 border border-edge/50 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-accent/10 before:via-transparent before:to-blue-500/10 before:rounded-xl before:opacity-0 before:transition-opacity hover:before:opacity-100",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl",
        variantClasses[variant],
        paddingClasses[padding],
        hover && "card-interactive",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
  )
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-display font-semibold tracking-tight text-ink", className)}
      {...props}
    />
  )
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-body-sm text-ink-muted", className)} {...props} />
  )
);

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-3 pt-4 border-t border-edge/50", className)} {...props} />
  )
);

CardFooter.displayName = "CardFooter";

export const CardIcon = ({ className, children, variant = "accent" }: { className?: string; children: React.ReactNode; variant?: "accent" | "safe" | "warning" | "danger" }) => {
  const variantBg = {
    accent: "bg-accent/10 border-accent/30 text-accent",
    safe: "bg-safe/10 border-safe/30 text-safe",
    warning: "bg-warning/10 border-warning/30 text-warning",
    danger: "bg-danger/10 border-danger/30 text-danger",
  };

  return (
    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", variantBg[variant], className)}>
      {children}
    </div>
  );
};

export const CardStat = ({ value, label, trend, trendLabel }: { value: string; label: string; trend?: "up" | "down" | "neutral"; trendLabel?: string }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-baseline gap-2">
      <span className="font-display text-3xl font-bold text-ink">{value}</span>
      {trend && trendLabel && (
        <span className={cn("font-mono text-xs font-semibold", trend === "up" && "text-safe", trend === "down" && "text-danger", trend === "neutral" && "text-ink-muted")}>
          {trend === "up" && "↑"}{trend === "down" && "↓"}{trend === "neutral" && "→"} {trendLabel}
        </span>
      )}
    </div>
    <p className="text-caption text-ink-muted uppercase tracking-wider">{label}</p>
  </div>
);