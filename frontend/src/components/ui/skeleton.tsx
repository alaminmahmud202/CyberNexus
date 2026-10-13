"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ className, variant = "text", width, height, lines = 1, ...props }: SkeletonProps) {
  const baseStyles = "bg-surface-raised animate-pulse rounded";

  const variantStyles = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "rounded-2xl",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseStyles,
              variantStyles[variant],
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={{ width }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

export function CardSkeleton({ className, image = true, lines = 3 }: { className?: string; image?: boolean; lines?: number }) {
  return (
    <div className={cn("rounded-2xl border border-edge bg-surface shadow-panel overflow-hidden", className)}>
      {image && <Skeleton className="h-48 w-full" variant="rectangular" />}
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" variant="text" />
        <Skeleton lines={lines} variant="text" />
        <Skeleton className="h-10 w-24" variant="rectangular" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl border border-edge bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-edge">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4 text-left">
                  <Skeleton className="h-4 w-full" variant="text" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className="border-b border-edge/50 last:border-0">
                {Array.from({ length: columns }).map((_, col) => (
                  <td key={col} className="p-4">
                    <Skeleton className="h-4 w-full" variant="text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton image={false} lines={4} />
        <CardSkeleton image={false} lines={4} />
      </div>

      <CardSkeleton image={false} lines={5} className="max-w-3xl" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-edge bg-surface shadow-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-3 w-2/3" variant="text" />
          <Skeleton className="mt-2 h-8 w-1/2" variant="text" />
        </div>
        <Skeleton className="h-12 w-12" variant="circular" />
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-1/4" variant="text" />
          <Skeleton className="h-10 w-full" variant="rectangular" />
        </div>
      ))}
      <Skeleton className="h-11 w-full" variant="rectangular" />
    </div>
  );
}

export function ListSkeleton({ items = 5, avatar = true, lines = 2 }: { items?: number; avatar?: boolean; lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          {avatar && <Skeleton className="h-10 w-10 flex-shrink-0" variant="circular" />}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-1/3" variant="text" />
            <Skeleton lines={lines} variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}