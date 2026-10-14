import type { ComponentType, CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import {
  DiscordIcon,
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/ui/brand-icons";

import { CyberNexusLogo } from "@/components/logo";

type ToolLink = { href: string; label: string; fragment: string };
type FooterLink = { href: string; label: string; fragment?: string; external?: boolean };
type SocialLink = { label: string; href: string; icon: ComponentType<{ className?: string }>; disabled?: boolean };

const securityTools: ToolLink[] = [
  { href: "/dashboard", label: "URL Scanner", fragment: "url" },
  { href: "/dashboard", label: "File Scanner", fragment: "file" },
  { href: "/dashboard", label: "Password Checker", fragment: "password" },
  { href: "/dashboard", label: "IP Intelligence", fragment: "ip" },
  { href: "/dashboard", label: "Domain Intelligence", fragment: "domain" },
  { href: "/dashboard", label: "SSL/TLS Checker", fragment: "ssl" },
  { href: "/dashboard", label: "Security Headers", fragment: "headers" },
  { href: "/dashboard", label: "Email Analyzer", fragment: "email-header" },
];

const supportLinks: FooterLink[] = [
  { href: "/", label: "How It Works", fragment: "how-it-works" },
  { href: "https://github.com/alaminmahmud202/CyberNexus/issues", label: "Help Center", external: true },
  { href: "mailto:alaminmahmud684@gmail.com", label: "Contact Us" },
  {
    href: "https://github.com/alaminmahmud202/CyberNexus/issues/new",
    label: "Report a Security Issue",
    external: true,
  },
];

// Only real, reachable destinations are listed here (no fabricated pages).
const companyLinks: FooterLink[] = [
  { href: "/", label: "About CyberNexus", fragment: "about" },
  // The mission statement lives inside the About section.
  { href: "/", label: "Our Mission", fragment: "about" },
  { href: "https://github.com/alaminmahmud202/CyberNexus#author", label: "Developer", external: true },
  { href: "https://github.com/alaminmahmud202/CyberNexus#overview", label: "Project Overview", external: true },
];

const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "https://facebook.com/am.mahmud.752", icon: FacebookIcon },
  { label: "Instagram", href: "https://www.instagram.com/_mahmudhxlic/", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/alaminmahmud202/", icon: LinkedinIcon },
  { label: "GitHub", href: "https://github.com/alaminmahmud202", icon: GithubIcon },
  // Discord has no valid destination yet, so it renders as a disabled glyph.
  { label: "Discord", href: "", icon: DiscordIcon, disabled: true },
  { label: "Email", href: "mailto:alaminmahmud684@gmail.com", icon: Mail },
];

// Faint cyan technical grid, masked so it fades out toward the bottom.
const gridBackdropStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(34, 211, 238, 0.05) 1px, transparent 1px)," +
    "linear-gradient(to bottom, rgba(34, 211, 238, 0.045) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
  maskImage: "radial-gradient(ellipse 90% 65% at 50% 0%, #000 15%, transparent 72%)",
  WebkitMaskImage: "radial-gradient(ellipse 90% 65% at 50% 0%, #000 15%, transparent 72%)",
};

const linkRowClass =
  "group flex items-center gap-3 rounded-lg py-[7px] text-body-sm text-ink-muted transition-colors duration-200 hover:text-ink";

function LinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="mt-4 space-y-0.5">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href + (link.fragment ? `#${link.fragment}` : "")}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className={linkRowClass}
          >
            <span
              aria-hidden="true"
              className="h-px w-3 shrink-0 bg-edge-strong transition-all duration-200 group-hover:w-4 group-hover:bg-accent"
            />
            <span>{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GroupHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-[2px] bg-accent shadow-glow" />
        <h3
          id={id}
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ink"
        >
          {children}
        </h3>
      </div>
      <div
        aria-hidden="true"
        className="mt-3 h-px w-full bg-gradient-to-r from-accent/25 via-edge to-transparent"
      />
    </div>
  );
}

export function SiteFooter() {
  const socialButtonClass =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-edge bg-surface/40 text-ink-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/10 hover:text-accent hover:shadow-glow";

  const socialDisabledClass =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-edge/50 bg-surface/20 text-ink-faint opacity-70";

  return (
    <footer className="relative overflow-hidden border-t border-edge bg-gradient-to-b from-surface-sunken to-base">
      {/* Faint technical grid backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={gridBackdropStyle} />
      {/* Restrained accent glow behind the brand block */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/4 h-56 w-96 -translate-x-1/2 rounded-full bg-accent/[0.05] blur-3xl"
      />
      {/* Thin accent divider separating the footer from the page above */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-16">
        {/* Asymmetric grid: brand carries the most weight, link groups stay compact */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.15fr)_minmax(0,0.72fr)_minmax(0,0.72fr)] lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 lg:pr-8">
            <Link href="/" className="inline-flex items-center" aria-label="CyberNexus home">
              <CyberNexusLogo size="xl" />
            </Link>
            <div aria-hidden="true" className="mt-5 h-px w-16 bg-gradient-to-r from-accent/60 to-transparent" />
            <p className="mt-5 max-w-md text-body-md leading-relaxed text-ink-muted">
              A unified console for threat intelligence and security auditing. Built for security
              professionals, developers, and researchers.
            </p>

            <ul className="mt-7 flex flex-wrap items-center gap-2.5" aria-label="Social links">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  {social.disabled ? (
                    <span
                      aria-label={`${social.label} — coming soon`}
                      role="img"
                      className={socialDisabledClass}
                    >
                      <social.icon className="h-[18px] w-[18px]" />
                    </span>
                  ) : (
                    <a
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      aria-label={social.label}
                      className={socialButtonClass}
                    >
                      <social.icon className="h-[18px] w-[18px]" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Security Center */}
          <nav aria-labelledby="footer-security-center" className="sm:col-span-2 lg:col-span-1">
            <GroupHeading id="footer-security-center">Security Center</GroupHeading>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-1">
              {securityTools.map((tool) => (
                <li key={tool.href + tool.fragment}>
                  <Link href={`${tool.href}#${tool.fragment}`} className={linkRowClass}>
                    <span
                      aria-hidden="true"
                      className="h-px w-3 shrink-0 bg-edge-strong transition-all duration-200 group-hover:w-4 group-hover:bg-accent"
                    />
                    <span className="truncate">{tool.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-labelledby="footer-support">
            <GroupHeading id="footer-support">Support</GroupHeading>
            <LinkList links={supportLinks} />
          </nav>

          {/* Company */}
          <nav aria-labelledby="footer-company">
            <GroupHeading id="footer-company">Company</GroupHeading>
            <LinkList links={companyLinks} />
          </nav>
        </div>
      </div>
    </footer>
  );
}
