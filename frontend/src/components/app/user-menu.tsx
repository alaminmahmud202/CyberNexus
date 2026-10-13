"use client";

import { ChevronDown, LogIn, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { clearStoredAuth, getStoredUser } from "@/lib/api";
import type { StoredUser } from "@/lib/types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function signOut() {
    clearStoredAuth();
    setUser(null);
    setOpen(false);
    router.push("/login");
  }

  // During SSR and before hydration, render a placeholder to avoid mismatch
  if (!mounted) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-lg px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-surface-sunken" />
        <ChevronDown className="h-4 w-4 text-ink-faint" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
      >
        <LogIn className="h-4 w-4" />
        Sign in
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="User menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-xs font-bold text-accent">
          {initials(user.name) || <UserRound className="h-4 w-4" />}
        </span>
        <ChevronDown className="h-4 w-4 text-ink-faint" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-edge bg-surface shadow-xl shadow-black/40">
          <div className="border-b border-edge px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate font-mono text-xs text-ink-faint">
              {user.email}
            </p>
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-muted transition-colors hover:bg-surface-raised hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
