"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CounterProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  onComplete?: () => void;
}

export function Counter({
  end,
  start = 0,
  duration = 2000,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className,
  onComplete,
}: CounterProps) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5, rootMargin: "50px" }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now() + delay;
    const endValue = end;
    const startValue = start;
    const range = endValue - startValue;

    const animate = () => {
      const now = Date.now();
      if (now < startTime) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = startValue + range * easedProgress;
      setCount(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, end, start, duration, delay, onComplete]);

  const formattedNumber = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });

  const parts = formattedNumber.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const formatted = parts.join(".");

  return (
    <div ref={elementRef} className={cn("font-display font-bold tabular-nums", className)}>
      <span className="text-ink-muted">{prefix}</span>
      <span className="text-ink">{formatted}</span>
      <span className="text-ink-muted">{suffix}</span>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string; positive?: boolean };
  className?: string;
  variant?: "default" | "elevated" | "glass";
}

export function StatCard({ label, value, icon, trend, className, variant = "default" }: StatCardProps) {
  const variantClasses = {
    default: "border border-edge bg-surface shadow-panel",
    elevated: "bg-surface-raised shadow-card border border-edge/50",
    glass: "glass",
  };

  return (
    <div className={cn("rounded-2xl p-6 transition-all duration-300 hover:shadow-card-hover hover:border-accent/40", variantClasses[variant], className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-caption text-ink-muted uppercase tracking-wider">{label}</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-ink tabular-nums">{value}</span>
            {trend && (
              <span className={cn(
                "flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-full",
                trend.positive !== false ? "bg-safe/10 text-safe" : "bg-danger/10 text-danger"
              )}>
                {trend.positive !== false ? "↑" : "↓"} {trend.value}{trend.label}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({ value, className, decimals = 0, prefix = "", suffix = "" }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current === value) return;

    const start = prevValueRef.current;
    const end = value;
    const range = end - start;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + range * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    prevValueRef.current = value;
  }, [value]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn("font-display font-bold tabular-nums", className)}>
      {prefix}{formatted}{suffix}
    </span>
  );
}