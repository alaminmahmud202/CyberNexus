"use client";

import { Menu, X, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { CyberNexusLogo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      scrollToSection(href.slice(1));
    } else {
      window.location.href = href;
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-16 transition-all duration-300",
        scrolled
          ? "bg-base/95 backdrop-blur-xl border-b border-edge/50 shadow-panel-lg"
          : "bg-base/80 backdrop-blur supports-[backdrop-filter]:bg-base/60 border-b border-edge/50"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          aria-label="CyberNexus home"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-200",
            "hover:bg-surface-raised/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          )}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <CyberNexusLogo size="lg" />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="rounded-xl px-4 py-2 text-body-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
            className="rounded-xl px-4 py-2 text-body-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            How It Works
          </button>
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
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-16 left-0 right-0 bg-base/98 backdrop-blur-xl border-b border-edge/50 shadow-panel-lg animate-slide-down"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-6 py-4 space-y-2">
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-body-md text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <Shield className="h-5 w-5" />
              <span>Features</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-body-md text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span>How It Works</span>
            </button>

            <div className="pt-4 border-t border-edge" />
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium text-accent bg-accent/10 border border-accent/30 transition-colors hover:bg-accent/20 hover:border-accent/50"
              >
                <span>Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}