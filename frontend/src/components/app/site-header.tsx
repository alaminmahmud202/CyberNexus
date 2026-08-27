"use client";

import { FileText, History, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CyberNexusLogo } from "@/components/logo";
import { NotificationButton } from "@/components/app/notification-button";
import { UserMenu } from "@/components/app/user-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-edge bg-base/85 backdrop-blur supports-[backdrop-filter]:bg-base/70">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="CyberNexus home"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <CyberNexusLogo />
          </Link>
        </div>

        <nav aria-label="Primary" className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={label}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                  active
                    ? "bg-surface-raised font-medium text-accent"
                    : "text-ink-muted hover:bg-surface hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-1">
          <NotificationButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
