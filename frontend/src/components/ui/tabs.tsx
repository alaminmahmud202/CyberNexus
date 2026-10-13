"use client";

import { useState, forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  children?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline" | "segmented";
  fullWidth?: boolean;
}

export function Tabs({ items, defaultTab, onChange, className, variant = "default", fullWidth = false }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || "");

  const handleTabClick = (tabId: string) => {
    const item = items.find((i) => i.id === tabId);
    if (item?.disabled) return;
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const variantStyles = {
    default: {
      container: "flex gap-1",
      tab: (active: boolean) => cn(
        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        active
          ? "bg-surface-raised text-ink shadow-panel"
          : "text-ink-muted hover:bg-surface hover:text-ink",
        fullWidth && "flex-1 justify-center"
      ),
    },
    pills: {
      container: "flex gap-1 bg-surface-sunken p-1 rounded-xl",
      tab: (active: boolean) => cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 text-body-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        active
          ? "bg-surface text-ink shadow-panel"
          : "text-ink-muted hover:text-ink",
        fullWidth && "flex-1 justify-center"
      ),
    },
    underline: {
      container: "flex gap-6 border-b border-edge",
      tab: (active: boolean) => cn(
        "flex items-center gap-2 pb-3 text-body-sm font-medium transition-all duration-200 relative",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base",
        active
          ? "text-ink"
          : "text-ink-muted hover:text-ink",
        active && "after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-accent after:to-blue-500"
      ),
    },
    segmented: {
      container: "flex gap-1 bg-surface-sunken p-1 rounded-xl",
      tab: (active: boolean) => cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 text-body-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        active
          ? "bg-surface text-ink shadow-panel"
          : "text-ink-muted hover:text-ink",
        fullWidth && "flex-1 justify-center"
      ),
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn("w-full", className)}>
      <div className={styles.container} role="tablist" aria-label="Tabs">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`${item.id}-panel`}
            id={`${item.id}-tab`}
            disabled={item.disabled}
            onClick={() => handleTabClick(item.id)}
            className={cn(styles.tab(activeTab === item.id), item.disabled && "opacity-50 cursor-not-allowed")}
          >
            {item.icon && <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>}
            {item.label}
            {item.badge !== undefined && (
              <span className={cn(
                "flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-sunken text-[10px] font-mono font-semibold",
                activeTab === item.id ? "bg-accent/20 text-accent" : "text-ink-muted"
              )}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {items.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`${item.id}-panel`}
            aria-labelledby={`${item.id}-tab`}
            hidden={activeTab !== item.id}
            className="animate-fade-in"
          >
            {item.children}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
  return (
    <div id={id} className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}

export function TabList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex gap-1", className)} role="tablist">{children}</div>;
}

interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  id: string;
  active?: boolean;
  onActivate?: () => void;
}

export const TabTrigger = forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ id, active, onActivate, className, children, ...props }, ref) => (
    <button
      ref={ref}
      role="tab"
      aria-selected={active}
      aria-controls={`${id}-panel`}
      id={`${id}-tab`}
      onClick={onActivate}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        active
          ? "bg-surface-raised text-ink shadow-panel"
          : "text-ink-muted hover:bg-surface hover:text-ink",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

TabTrigger.displayName = "TabTrigger";