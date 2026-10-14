import Link from "next/link";
import { Mail, Shield } from "lucide-react";
import {
  DiscordIcon,
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/ui/brand-icons";

import { CyberNexusLogo } from "@/components/logo";

export function SiteFooter() {
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
    { label: "Facebook", href: "https://facebook.com/am.mahmud.752", icon: FacebookIcon },
    { label: "Instagram", href: "https://www.instagram.com/_mahmudhxlic/", icon: InstagramIcon },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alaminmahmud202/", icon: LinkedinIcon },
    { label: "GitHub", href: "https://github.com/alaminmahmud202", icon: GithubIcon },
    { label: "Email", href: "mailto:alaminmahmud684@gmail.com", icon: Mail },
  ];

  const iconButtonClass =
    "flex h-10 w-10 items-center justify-center rounded-xl border border-edge bg-surface-raised text-ink-muted transition-all duration-200 hover:border-accent/50 hover:bg-accent/10 hover:text-accent";

  return (
    <footer className="border-t border-edge bg-surface-sunken/30">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        {/* Main Grid */}
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-12">
          {/* Brand Section */}
          <div className="lg:pr-8">
            <Link href="/" className="flex items-center gap-2.5" aria-label="CyberNexus home">
              <CyberNexusLogo size="xl" />
            </Link>
            <p className="mt-6 text-body-md text-ink-muted leading-relaxed max-w-xs">
              A unified console for threat intelligence and security auditing. Built for security professionals, developers, and researchers.
            </p>

            {/* Social Links — icon-only */}
            <div className="mt-6 flex flex-wrap items-center gap-3" role="list" aria-label="Social links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={social.label}
                  title={social.label}
                  role="listitem"
                  className={iconButtonClass}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
              {/* Discord — no valid destination available yet, rendered non-clickable */}
              <span
                aria-label="Discord"
                title="Discord — link coming soon"
                role="listitem"
                className={`${iconButtonClass} cursor-not-allowed opacity-60 hover:border-edge hover:bg-surface-raised hover:text-ink-muted`}
              >
                <DiscordIcon className="h-5 w-5" />
              </span>
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
        </div>
      </div>
    </footer>
  );
}
