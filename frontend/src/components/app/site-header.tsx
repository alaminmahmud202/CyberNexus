"use client";

import { FileText, History, LayoutDashboard, Menu, X, Bell, LogOut, User, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { CyberNexusLogo } from "@/components/logo";
import { NotificationButton } from "@/components/app/notification-button";
import { UserMenu } from "@/components/app/user-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Security overview & quick scans" },
  { href: "/history", label: "History", icon: History, description: "View past scan results" },
  { href: "/reports", label: "Reports", icon: FileText, description: "Detailed security reports" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-16 transition-all duration-300",
        scrolled
          ? "bg-base/95 backdrop-blur-xl border-b border-edge/50 shadow-card"
          : "bg-base/85 backdrop-blur supports-[backdrop-filter]:bg-base/70 border-b border-edge/50"
      )}
    >
      <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="CyberNexus home"
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-200",
              "hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            )}
          >
            <CyberNexusLogo size="lg" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={description}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-body-sm transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base",
                  active
                    ? "bg-surface-raised text-accent font-medium shadow-panel"
                    : "text-ink-muted hover:bg-surface hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{label}</span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-to-r from-accent to-blue-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className={cn(
              "rounded-xl p-2 text-ink-muted transition-colors",
              "hover:bg-surface hover:text-ink",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            )}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <NotificationButton />
          <UserMenu />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-16 left-0 right-0 bg-base/98 backdrop-blur-xl border-b border-edge/50 shadow-card animate-slide-down"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-6 py-4 space-y-2">
            {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <button
                  key={href}
                  type="button"
                  onClick={() => handleNavClick(href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-body-md transition-all duration-200",
                    active
                      ? "bg-surface-raised text-accent font-medium"
                      : "text-ink-muted hover:bg-surface hover:text-ink"
                  )}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", active ? "bg-accent/10" : "bg-surface-sunken")}>
                    <Icon className={cn("h-5 w-5", active ? "text-accent" : "text-ink-muted")} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{label}</p>
                    <p className="text-caption text-ink-faint">{description}</p>
                  </div>
                </button>
              );
            })}

            <div className="pt-4 border-t border-edge" />
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <LogOut className="h-5 w-5" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                <User className="h-5 w-5" />
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}