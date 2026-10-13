import Link from "next/link";
import { Mail, Shield } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";

import { CyberNexusLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  const year = new Date().getFullYear();

  const footerLinks = {
    tools: [
      { href: "/dashboard", label: "URL Scanner", fragment: "url" },
      { href: "/dashboard", label: "File Scanner", fragment: "file" },
      { href: "/dashboard", label: "Password Checker", fragment: "password" },
      { href: "/dashboard", label: "IP Intelligence", fragment: "ip" },
      { href: "/dashboard", label: "Domain Intelligence", fragment: "domain" },
      { href: "/dashboard", label: "SSL/TLS Checker", fragment: "ssl" },
      { href: "/dashboard", label: "Security Headers", fragment: "headers" },
      { href: "/dashboard", label: "Email Analyzer", fragment: "email-header" },
    ],
    navigation: [
      { href: "/", label: "Features", fragment: "features" },
      { href: "/", label: "How It Works", fragment: "how-it-works" },
      { href: "/login", label: "Sign In" },
      { href: "/register", label: "Get Started" },
    ],
  };

  const socialLinks = [
    { href: "https://github.com/alaminmahmud202", label: "GitHub", icon: GithubIcon },
    { href: "https://www.linkedin.com/in/alaminmahmud202/", label: "LinkedIn", icon: LinkedinIcon },
  ];

  return (
    <footer className="border-t border-edge bg-surface-sunken/30">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5" aria-label="CyberNexus home">
              <CyberNexusLogo size="xl" />
            </Link>
            <p className="mt-6 text-body-md text-ink-muted leading-relaxed max-w-xs">
              A unified console for threat intelligence and security auditing. Built for security professionals, developers, and researchers.
            </p>
            <div className="mt-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">Official Email</p>
              <a
                href="mailto:alaminmahmud684@gmail.com"
                className="mt-1 block font-medium text-body-md text-ink hover:text-accent transition-colors"
              >
                alaminmahmud684@gmail.com
              </a>
            </div>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-edge bg-surface-raised text-ink-muted transition-all duration-200 hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Security Tools */}
          <nav aria-label="Security Tools">
            <h3 className="font-display font-semibold text-ink">Security Tools</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.tools.map((link) => (
                <li key={link.href + (link.fragment || "")}>
                  <Link
                    href={link.href + (link.fragment ? `#${link.fragment}` : "")}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm text-ink-muted transition-colors hover:text-accent hover:bg-surface"
                  >
                    <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Navigation */}
          <nav aria-label="Navigation">
            <h3 className="font-display font-semibold text-ink">Navigation</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href + (link.fragment ? `#${link.fragment}` : "")}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm text-ink-muted transition-colors hover:text-accent hover:bg-surface"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Project Info */}
          <div className="lg:col-span-1">
            <h3 className="font-display font-semibold text-ink">Project</h3>
            <div className="mt-4 space-y-3 text-body-sm text-ink-muted">
              <p>BGC Trust University Bangladesh</p>
              <p>Software Development Project (SDP-2)</p>
              <p>Department of Computer Science and Engineering</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-edge" />

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="text-body-sm text-ink-muted text-center sm:text-left">
            © {year} CyberNexus. All rights reserved.
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-caption text-ink-faint">
            <span className="px-2 py-1 rounded bg-surface-raised border border-edge font-mono">Next.js</span>
            <span className="px-2 py-1 rounded bg-surface-raised border border-edge font-mono">TypeScript</span>
            <span className="px-2 py-1 rounded bg-surface-raised border border-edge font-mono">Tailwind CSS</span>
            <span className="px-2 py-1 rounded bg-surface-raised border border-edge font-mono">FastAPI</span>
            <span className="px-2 py-1 rounded bg-surface-raised border border-edge font-mono">MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}