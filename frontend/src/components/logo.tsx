"use client";

import { cn } from "@/lib/utils";

/**
 * CyberNexus Mark - The original minimalist shield logo
 * A clean shield outline with a simple security symbol inside.
 * Used for favicon, compact layouts, and brand mark.
 */
export function CyberNexusMark({
  className,
  size = 32,
}: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("text-accent", className)}
      width={size}
      height={size}
    >
      {/* Shield outline */}
      <path
        d="M16 3 L28 7.5 V14 C28 21.5 23.2 26.6 16 29 C8.8 26.6 4 21.5 4 14 V7.5 Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Security symbol inside shield: vertical line with V-shape at bottom */}
      <path
        d="M16 8.5 V14 M16 14 L11 19.5 M16 14 L21 19.5"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      {/* Top center dot */}
      <circle cx="16" cy="8.5" r="1.5" fill="currentColor" />
      {/* Center dot */}
      <circle cx="16" cy="14" r="2.3" fill="currentColor" />
      {/* Bottom left dot */}
      <circle cx="11" cy="19.5" r="1.5" fill="currentColor" />
      {/* Bottom right dot */}
      <circle cx="21" cy="19.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * CyberNexus Logo - Full logo with mark and wordmark
 * Primary brand identifier for headers, footers, and hero sections
 */
export function CyberNexusLogo({
  className,
  size = "md",
  variant = "default", // "default" | "light" | "mark-only"
}: { className?: string; size?: "sm" | "md" | "lg" | "xl"; variant?: "default" | "light" | "mark-only" }) {
  const sizeClasses = {
    sm: "h-5 w-5 text-sm",
    md: "h-7 w-7 text-base",
    lg: "h-8 w-8 text-lg",
    xl: "h-10 w-10 text-xl",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  if (variant === "mark-only") {
    return <CyberNexusMark className={cn(sizeClasses[size], className)} size={parseInt(sizeClasses[size])} />;
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <CyberNexusMark className={sizeClasses[size]} />
      <span className={cn("whitespace-nowrap font-mono font-bold uppercase tracking-[0.28em]", textSizes[size], variant === "light" ? "text-white" : "text-ink")}>
        Cyber<span className="text-accent">Nexus</span>
      </span>
    </span>
  );
}

/**
 * CyberNexus Wordmark - Text-only version for tight spaces
 */
export function CyberNexusWordmark({
  className,
  size = "md",
}: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <span className={cn("font-mono font-bold uppercase tracking-[0.28em]", sizeClasses[size], className)}>
      Cyber<span className="text-accent">Nexus</span>
    </span>
  );
}