"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronDown } from "lucide-react";

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <div
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {trigger}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "fixed z-50 mt-1.5 min-w-[180px] rounded-xl border border-edge bg-surface-raised shadow-card overflow-hidden animate-scale-in",
              align === "right" ? "right-0" : "left-0"
            )}
            role="menu"
          >
            {items.map((item, index) => {
              if (item.divider) {
                return <div key={`divider-${index}`} className="my-1 border-t border-edge" role="separator" />;
              }
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  disabled={item.disabled}
                  role="menuitem"
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-body-sm transition-colors",
                    "hover:bg-surface hover:text-ink",
                    "focus:outline-none focus:bg-surface focus:text-ink",
                    item.variant === "danger" && "text-danger hover:bg-danger/10",
                    item.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {item.icon && <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface DropdownMenuProps {
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
  open: boolean;
  onClose: () => void;
}

export function DropdownMenu({ items, align = "right", className, open, onClose }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        className={cn(
          "fixed z-50 mt-1.5 min-w-[200px] rounded-xl border border-edge bg-surface-raised shadow-card overflow-hidden animate-scale-in",
          align === "right" ? "right-0" : "left-0",
          className
        )}
        role="menu"
      >
        {items.map((item, index) => {
          if (item.divider) {
            return <div key={`divider-${index}`} className="my-1 border-t border-edge" role="separator" />;
          }
          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                item.onClick();
                onClose();
              }}
              disabled={item.disabled}
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left text-body-sm transition-colors",
                "hover:bg-surface hover:text-ink",
                "focus:outline-none focus:bg-surface focus:text-ink",
                item.variant === "danger" && "text-danger hover:bg-danger/10",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.icon && <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          );
        })}
      </div>
    </>
  );
}