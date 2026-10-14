import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, ShieldCheck, TrendingUp, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";

import { PublicNavbar } from "@/components/app/public-navbar";
import { ShieldIllustration } from "@/components/app/shield-illustration";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardIcon } from "@/components/ui/card";
import { SERVICES } from "@/lib/services";

const HIGHLIGHTS = [
  {
    title: "Assess exposure",
    description:
      "Scan your URLs, files, domains and IPs to uncover potential threats and vulnerabilities before they become incidents.",
    icon: Search,
  },
  {
    title: "Investigate indicators",
    description:
      "Leverage VirusTotal and AbuseIPDB integrations to get deeper insights into suspicious activity and known threat intelligence.",
    icon: ShieldCheck,
  },
  {
    title: "Improve security posture",
    description:
      "Use actionable results and detailed reports to fix issues, reduce risk and build a stronger, more resilient security infrastructure.",
    icon: TrendingUp,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Account",
    description: "Register for free access to all security tools and scan history.",
    icon: CheckCircle2,
  },
  {
    step: "02",
    title: "Select Tool",
    description: "Choose from 8 security modules and provide the target input.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Analyze Results",
    description: "Review detailed findings, threat intelligence, and recommendations.",
    icon: CheckCircle2,
  },
];

const AUTHORITY_CONTACT = {
  email: "alaminmahmud684@gmail.com",
  linkedin: "https://www.linkedin.com/in/alaminmahmud202/",
  github: "https://github.com/alaminmahmud202",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex flex-1 flex-col pt-16">
        {/* Hero Section */}
        <section id="hero" className="relative overflow-hidden px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          {/* Background treatment: deep navy-to-black with subtle grid */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(34,211,238,0.08),transparent_65%)]" />
          <div aria-hidden="true" className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-base" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
              {/* Left Content */}
              <div className="animate-in text-center lg:text-left">
                <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                  Cyber<span className="text-gradient">Nexus</span>
                </h1>

                <p className="mt-5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-[2.1rem] lg:leading-snug">
                  Know Your Risks. Secure Your Future.
                </p>

                <p className="mx-auto mt-5 max-w-xl text-body-md leading-relaxed text-ink-muted sm:text-body-lg lg:mx-0">
                  Check before you trust. Scan URLs, files, domains and IPs with eight
                  practical cybersecurity tools.
                </p>

                {/* CTAs */}
                <div className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  <Link href="/register">
                    <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                      Explore Platform
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                      View Modules
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Visual - Cybersecurity Shield */}
              <div className="animate-in-slow" style={{ animationDelay: "150ms" }}>
                <ShieldIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* Highlight Cards */}
        <section className="relative px-6 pb-20 lg:pb-28">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
            {HIGHLIGHTS.map(({ title, description, icon: Icon }, index) => (
              <Card
                key={title}
                variant="elevated"
                hover
                padding="lg"
                className="animate-in"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <CardContent className="pt-0">
                  <CardIcon variant="accent">
                    <Icon className="h-6 w-6" />
                  </CardIcon>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
                    {title}
                  </h3>
                  <p className="mt-3 text-body-sm leading-relaxed text-ink-muted sm:text-body-md">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section - Security Modules */}
        <section id="features" className="px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="text-center animate-in">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Security Modules
              </p>
              <h2 className="mt-3 font-display text-display-md lg:text-display-lg font-bold">
                Essential Security Tools in One Platform
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-body-lg text-ink-muted">
                Eight specialized security modules for comprehensive threat intelligence and assessment.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map(({ icon: Icon, title, description, id }, index) => (
                <Card
                  key={title}
                  variant="elevated"
                  hover
                  className="animate-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <CardContent className="pt-6">
                    <CardIcon variant="accent">
                      <Icon className="h-6 w-6" />
                    </CardIcon>
                    <h3 className="mt-4 font-display heading-sm font-semibold">{title}</h3>
                    <p className="mt-2 text-body-sm text-ink-muted leading-relaxed">{description}</p>
                    <Link
                      href={`/dashboard#${id}`}
                      className="mt-6 inline-flex items-center gap-2 text-body-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base rounded"
                    >
                      <span>Launch</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="mt-8 text-center text-body-sm text-ink-muted">
              All tools are visible publicly. Scans require authentication to execute.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-t border-edge bg-surface-sunken/30 px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="text-center animate-in">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                How It Works
              </p>
              <h2 className="mt-3 font-display text-display-md lg:text-display-lg font-bold">
                Three Steps to Security Intelligence
              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map(({ step, title, description, icon: Icon }, index) => (
                <div key={step} className="relative animate-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 font-display text-xl font-bold text-accent">
                      {step}
                    </span>
                    <div>
                      <CardIcon variant="accent" className="h-10 w-10">
                        <Icon className="h-5 w-5" />
                      </CardIcon>
                    </div>
                  </div>
                  <h3 className="font-display heading-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-body-md text-ink-muted leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="text-center animate-in">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                About CyberNexus
              </p>
              <h2 className="mt-3 font-display text-display-md lg:text-display-lg font-bold">
                Built for Security Professionals
              </h2>
            </div>

            <div className="mt-12 mx-auto max-w-3xl text-center animate-in" style={{ animationDelay: "100ms" }}>
              <p className="text-body-lg text-ink-muted leading-relaxed">
                CyberNexus is a web-based cybersecurity assessment and utility platform developed as part of the
                Software Development Project (SDP-2) at BGC Trust University Bangladesh. It brings together essential
                security checks, threat intelligence, and scan management in a unified web application.
              </p>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-3 animate-in" style={{ animationDelay: "200ms" }}>
              <span className="px-4 py-2 rounded-xl border border-edge bg-surface-raised font-mono text-sm font-medium text-ink">Next.js 14</span>
              <span className="px-4 py-2 rounded-xl border border-edge bg-surface-raised font-mono text-sm font-medium text-ink">TypeScript</span>
              <span className="px-4 py-2 rounded-xl border border-edge bg-surface-raised font-mono text-sm font-medium text-ink">Tailwind CSS</span>
              <span className="px-4 py-2 rounded-xl border border-edge bg-surface-raised font-mono text-sm font-medium text-ink">FastAPI</span>
              <span className="px-4 py-2 rounded-xl border border-edge bg-surface-raised font-mono text-sm font-medium text-ink">MongoDB</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-edge bg-surface-sunken/30 px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center animate-in">
            <h2 className="font-display text-display-md lg:text-display-lg font-bold">
              Ready to Secure Your Infrastructure?
            </h2>
            <p className="mt-4 text-body-lg text-ink-muted leading-relaxed">
              Join security professionals, developers, and researchers using CyberNexus for threat intelligence.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                  Start Free Scan
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Authority Section */}
        <section id="authority" className="border-t border-edge bg-surface-sunken/30 px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center animate-in">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Project Authority
              </p>
              <h2 className="mt-3 font-display text-display-md lg:text-display-lg font-bold">
                CyberNexus
              </h2>
              <p className="mt-2 font-mono text-sm text-accent">SDP-2 Project</p>
            </div>

            <div className="mt-12 mx-auto max-w-2xl animate-in" style={{ animationDelay: "100ms" }}>
              <p className="text-center text-body-md text-ink-muted leading-relaxed mb-8">
                Official contact and project information for CyberNexus.
              </p>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl border border-edge bg-surface-raised">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">Official Email</p>
                    <a
                      href={`mailto:${AUTHORITY_CONTACT.email}`}
                      className="mt-1 block font-medium text-body-md text-ink hover:text-accent transition-colors"
                    >
                      {AUTHORITY_CONTACT.email}
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl border border-edge bg-surface-raised">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10">
                    <LinkedinIcon className="h-5 w-5 text-[#0A66C2]" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">LinkedIn</p>
                    <a
                      href={AUTHORITY_CONTACT.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-medium text-body-md text-ink hover:text-[#0A66C2] transition-colors"
                    >
                      linkedin.com/in/alaminmahmud202
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl border border-edge bg-surface-raised">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#6e40c9]/30 bg-[#6e40c9]/10">
                    <GithubIcon className="h-5 w-5 text-[#6e40c9]" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">GitHub</p>
                    <a
                      href={AUTHORITY_CONTACT.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-medium text-body-md text-ink hover:text-[#6e40c9] transition-colors"
                    >
                      github.com/alaminmahmud202
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