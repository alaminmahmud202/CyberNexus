"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Folder,
  LayoutDashboard,
  LogOut,
  Monitor,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import { CyberNexusMark } from "@/components/logo";
import { apiFetch, clearStoredAuth, getStoredUser } from "@/lib/api";
import type { StoredUser } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CircleIconButton } from "./primitives";

/**
 * Console top navigation (DESIGN_SPEC_DASHBOARD.md §5).
 *
 * 64px bar: logo → tab group → search / notifications / user pill.
 * Client component (usePathname). Notification and user-pill behaviour is
 * ported 1:1 from `@/components/app/notification-button` and
 * `@/components/app/user-menu` (same API calls, same auth storage) but
 * re-skinned with the console palette.
 */

const TABS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Threats", href: "/dashboard#threats", icon: ShieldAlert },
  { label: "Assets", href: "/dashboard#assets", icon: Monitor },
  { label: "Reports", href: "/reports", icon: Folder },
] as const;

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

interface Notification {
  id: string;
  message: string;
  status: string;
  createdAt: string;
}

/**
 * Same data-fetching as `NotificationButton`: unread count polled every 10s,
 * recent list fetched on open, PATCH read-all. Trigger is a `CircleIconButton`
 * (36×36, Bell 16px) with a mint unread badge; dropdown uses console tokens.
 */
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await apiFetch<{ count: number }>(
        "/api/notifications/unread-count"
      );
      setUnread(data.count);
    } catch {}
  }, []);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Notification[]>("/api/notifications?limit=8");
      setItems(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (!open) return;
    fetchRecent();
  }, [open, fetchRecent]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, status: "read" })));
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <CircleIconButton
        label="Notifications"
        className="relative"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-mint-500 px-1 text-[10px] font-bold leading-none text-console">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </CircleIconButton>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] rounded-xl border border-console-line bg-console-raised shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-console-line px-4 py-3">
            <h3 className="text-sm font-semibold text-fg">Notifications</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-mint-500 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {loading && (
              <p className="py-6 text-center text-sm text-fg-muted">
                Loading...
              </p>
            )}
            {!loading && items.length === 0 && (
              <p className="py-6 text-center text-sm text-fg-muted">
                No notifications
              </p>
            )}
            {!loading &&
              items.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "border-b border-console-line px-4 py-3 last:border-0",
                    n.status === "unread" && "bg-console-soft"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      n.status === "unread" ? "text-fg" : "text-fg-muted"
                    )}
                  >
                    {n.message}
                  </p>
                  <p className="mt-1 text-[11px] text-fg-faint">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* User pill                                                                  */
/* -------------------------------------------------------------------------- */

/** Spec copy shown before hydration / when no stored user exists (§5). */
const FALLBACK_NAME = "Edward Martin";
const FALLBACK_EMAIL = "edwardmartinpark@mail.com";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Same state/sign-out flow as `UserMenu` (getStoredUser on mount, outside-click
 * + Escape to close, clearStoredAuth → /login), rendered as the §5 user pill:
 * 30px avatar, name 14/600, email 12 muted, ChevronDown 14 faint.
 */
function UserPill() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const name = user?.name ?? FALLBACK_NAME;
  const email = user?.email ?? FALLBACK_EMAIL;
  const avatarInitials = initials(name);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="User menu"
        aria-expanded={open}
        onClick={() => (user ? setOpen((value) => !value) : router.push("/login"))}
        className="flex items-center gap-2.5 rounded-full border border-console-line bg-console py-1 pl-1 pr-3 transition-colors hover:bg-console-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/60"
      >
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-console-pill font-mono text-[11px] font-bold text-fg">
          {avatarInitials || (
            <UserRound className="h-4 w-4 text-fg-muted" aria-hidden="true" />
          )}
        </span>
        <span className="flex flex-col items-start">
          <span className="text-[14px] font-semibold leading-tight text-fg">
            {name}
          </span>
          <span className="text-[12px] leading-tight text-fg-muted">
            {email}
          </span>
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 text-fg-faint"
          aria-hidden="true"
        />
      </button>

      {open && user && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-console-line bg-console-raised shadow-2xl shadow-black/40">
          <div className="border-b border-console-line px-4 py-3">
            <p className="truncate text-sm font-medium text-fg">{user.name}</p>
            <p className="truncate font-mono text-xs text-fg-faint">
              {user.email}
            </p>
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-console-soft hover:text-fg"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-fg-muted transition-colors hover:bg-console-soft hover:text-sev-high"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav                                                                        */
/* -------------------------------------------------------------------------- */

/** 64px console bar: logo · tabs · search / notifications / user pill (§5). */
export function ConsoleTopNav() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center gap-4 bg-console-raised px-8">
      <Link
        href="/"
        aria-label="CyberNexus home"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-console-line bg-console text-fg transition-colors hover:bg-console-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/60"
      >
        {/* `!` because CyberNexusMark defaults to text-accent; design wants fg. */}
        <CyberNexusMark size={18} className="!text-fg" />
      </Link>

      <nav
        aria-label="Console sections"
        className="flex items-center gap-1 rounded-full bg-console-soft p-1"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/60",
                isActive
                  ? "bg-console-hover text-fg"
                  : "text-fg-muted hover:bg-console hover:text-fg"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <CircleIconButton label="Search">
          <Search className="h-4 w-4" aria-hidden="true" />
        </CircleIconButton>
        <NotificationBell />
        <UserPill />
      </div>
    </header>
  );
}
