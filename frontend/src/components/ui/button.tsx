"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "accent";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-accent to-blue-500 text-slate-950 font-semibold shadow-glow hover:shadow-glow-lg hover:from-accent-strong hover:to-blue-400",
  secondary: "border border-edge bg-surface-raised font-medium text-ink hover:border-accent/60 hover:bg-surface hover:text-accent",
  ghost: "bg-transparent font-medium text-ink-muted hover:bg-surface-raised hover:text-ink",
  danger: "bg-gradient-to-r from-danger to-red-600 font-semibold text-slate-950 shadow-[0_0_24px_-6px_rgba(248,113,113,0.45)] hover:from-red-500 hover:to-red-700",
  outline: "border-2 border-edge bg-transparent font-medium text-ink hover:border-accent/60 hover:bg-accent/10 hover:text-accent",
  accent: "bg-accent/10 border border-accent/30 font-medium text-accent hover:bg-accent/20 hover:border-accent/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 rounded-md px-2.5 text-xs gap-1",
  sm: "h-9 rounded-lg px-3 text-sm gap-1.5",
  md: "h-11 rounded-xl px-4 text-sm gap-2",
  lg: "h-12 rounded-xl px-6 text-base gap-2",
  xl: "h-14 rounded-2xl px-8 text-lg gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", loading = false, icon, iconPosition = "left", fullWidth = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex select-none items-center justify-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base",
          "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          "btn-glow",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            <span className="sr-only">Loading...</span>
          </>
        ) : icon && iconPosition === "left" ? (
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
        ) : null}
        <span className={cn("relative z-10", loading && "opacity-0")}>{children}</span>
        {!loading && icon && iconPosition === "right" && (
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export function IconButton({ className, variant = "ghost", size = "md", ...props }: ButtonProps & { children: React.ReactNode }) {
  const sizeMap: Record<ButtonSize, string> = {
    xs: "h-7 w-7",
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-12 w-12",
    xl: "h-14 w-14",
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(sizeMap[size], "p-0", className)}
      {...props}
    />
  );
}