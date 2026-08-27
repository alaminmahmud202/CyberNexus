import {
  FileText,
  FileUp,
  Globe,
  KeyRound,
  ListChecks,
  Mail,
  Network,
  Radar,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

import { CyberNexusMark } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Eight security modules",
    detail: "URL, file, password, IP, domain, SSL, headers, and email forensics in one console.",
  },
  {
    icon: Radar,
    title: "Color-coded verdicts",
    detail: "Every result is scored safe, warning, or danger so risk is readable at a glance.",
  },
  {
    icon: FileText,
    title: "Auditable history",
    detail: "Scans are persisted per user with exportable JSON reports for compliance.",
  },
  {
    icon: Zap,
    title: "Real-time notifications",
    detail: "Track task progress with instant notifications for every scan and report generation.",
  },
  {
    icon: Lock,
    title: "Secure authentication",
    detail: "JWT-based auth with encrypted tokens and secure session management.",
  },
  {
    icon: Eye,
    title: "AI-powered analysis",
    detail: "Get intelligent explanations of scan results powered by Claude AI.",
  },
];

const SERVICES = [
  {
    icon: Globe,
    title: "URL Scanner",
    description: "Scan any URL against VirusTotal's database of 70+ antivirus engines and security services. Detect phishing, malware, and malicious content before it reaches your users.",
    features: ["Real-time reputation check", "Community voting data", "Redirect chain analysis"],
  },
  {
    icon: FileUp,
    title: "File Scanner",
    description: "Upload files up to 32MB and get instant malware analysis. SHA-256 hash comparison against known threats with detailed threat intelligence reports.",
    features: ["SHA-256 hash lookup", "Multi-engine detection", "Threat classification"],
  },
  {
    icon: KeyRound,
    title: "Password Checker",
    description: "Evaluate password strength with advanced pattern detection. Check against breached password databases and get actionable security recommendations.",
    features: ["Common pattern detection", "Breach database check", "Strength scoring"],
  },
  {
    icon: Radar,
    title: "IP Intelligence",
    description: "Investigate IP addresses with AbuseIPDB's comprehensive threat database. Get confidence scores, abuse reports, and geographic information.",
    features: ["Abuse confidence score", "Historical reports", "ISP information"],
  },
  {
    icon: Network,
    title: "Domain Intelligence",
    description: "Deep domain analysis with VirusTotal's community-driven intelligence. uncover domain relationships, DNS records, and reputation data.",
    features: ["Community votes", "DNS records", "Domain relationships"],
  },
  {
    icon: ShieldCheck,
    title: "SSL Checker",
    description: "Audit SSL/TLS certificates for compliance and security. Verify certificate chains, check expiry dates, and identify configuration weaknesses.",
    features: ["Certificate chain validation", "Expiry monitoring", "Protocol analysis"],
  },
  {
    icon: ListChecks,
    title: "Security Headers",
    description: "Audit HTTP security headers for HSTS, CSP, X-Frame-Options, and more. Get a comprehensive hardening report with actionable fixes.",
    features: ["HSTS verification", "CSP analysis", "Hardening score"],
  },
  {
    icon: Mail,
    title: "Email Header Analyzer",
    description: "Parse and analyze email headers to detect spoofing, phishing attempts, and delivery issues. Verify SPF, DKIM, and DMARC authentication.",
    features: ["SPF/DKIM/DMARC checks", "Spoof detection", "Delivery tracing"],
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div aria-hidden="true" className="bg-grid bg-grid-fade absolute inset-0" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center">
            <div className="flex items-center gap-3">
              <CyberNexusMark className="h-16 w-16" />
              <div className="text-left">
                <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                  Cybersecurity Platform
                </p>
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                  Cyber<span className="text-accent">Nexus</span>
                </h1>
              </div>
            </div>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted">
              A unified console for threat intelligence and security auditing.
              Scan URLs, files, domains, and hosts; analyze email headers; audit
              certificates and hardening — all from one professional dashboard.
              Built for security analysts, developers, and IT professionals.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-accent px-8 py-3.5 font-semibold text-slate-950 shadow-glow transition hover:bg-accent-strong"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-edge px-8 py-3.5 font-semibold transition hover:border-accent/60 hover:text-accent"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6 text-sm text-ink-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>8 Security Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span>Real-time Scanning</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                <span>Encrypted & Secure</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-edge bg-surface-sunken px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Why CyberNexus
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Everything you need for security auditing
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-ink-muted">
                A comprehensive suite of security tools designed to protect your digital assets
                and ensure compliance with industry standards.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, detail }) => (
                <div
                  key={title}
                  className="rounded-xl border border-edge bg-surface p-6 shadow-panel transition-all hover:border-accent/40 hover:shadow-glow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Security Modules
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Powerful scanning capabilities
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-ink-muted">
                Each module is powered by industry-leading threat intelligence providers
                and designed for accuracy and speed.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map(({ icon: Icon, title, description, features }) => (
                <div
                  key={title}
                  className="group rounded-xl border border-edge bg-surface p-6 shadow-panel transition-all hover:border-accent/50 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-edge bg-surface-raised transition-colors group-hover:border-accent/40 group-hover:bg-accent/10">
                    <Icon className="h-7 w-7 text-ink-muted transition-colors group-hover:text-accent" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-ink-faint">
                        <BarChart3 className="h-3 w-3 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-edge bg-surface-sunken px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">
              Ready to secure your infrastructure?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-muted">
              Join CyberNexus today and get access to all eight security modules.
              Start scanning in seconds with our intuitive dashboard.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-accent px-8 py-3.5 font-semibold text-slate-950 shadow-glow transition hover:bg-accent-strong"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-edge px-8 py-3.5 font-semibold transition hover:border-accent/60 hover:text-accent"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Meet the Author Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Meet the Author
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Built by Al Amin Mahmud
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-ink-muted">
                CyberNexus is a Software Development Project (SDP-2) at BGC Trust University,
                combining cybersecurity expertise with modern full-stack development.
              </p>
            </div>

            <div className="mt-12 rounded-2xl border border-edge bg-surface p-8 shadow-panel">
              <div className="flex flex-col items-center gap-8 sm:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/10">
                    <span className="text-4xl font-bold text-accent">AM</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-bold">Al Amin Mahmud</h3>
                  <p className="mt-1 font-mono text-sm text-accent">
                    Software Developer & Security Enthusiast
                  </p>
                  <p className="mt-4 text-ink-muted leading-relaxed">
                    Passionate about building secure and efficient software solutions.
                    CyberNexus represents the intersection of cybersecurity knowledge
                    and modern web development practices, created as part of the
                    Software Development Project at BGC Trust University.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                    <a
                      href="https://www.linkedin.com/in/alaminmahmud202/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-edge bg-surface-raised px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </a>
                    <a
                      href="https://github.com/alaminmahmud202"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-edge bg-surface-raised px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#6e40c9]/50 hover:bg-[#6e40c9]/10 hover:text-[#6e40c9]"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                      GitHub
                    </a>
                    <a
                      href="https://discord.com/users/1256299016627556352"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-edge bg-surface-raised px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 hover:text-[#5865F2]"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                      Discord
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
