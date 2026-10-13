import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, FileUp, KeyRound, Radar, Network, ShieldCheck, ListChecks, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";

import { PublicNavbar } from "@/components/app/public-navbar";
import { CyberNexusMark, CyberNexusLogo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICES } from "@/lib/services";

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
        <section id="hero" className="relative overflow-hidden px-6 py-24 lg:py-36">
          {/* Subtle background grid pattern */}
          <div aria-hidden="true" className="absolute inset-0 bg-grid bg-grid-fade opacity-30" />
          {/* Subtle gradient glow */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-blue-500/5" />
          {/* Central network visualization */}
          <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] max-w-full max-h-full rounded-full bg-accent/5 blur-[200px] opacity-50" />
          
          <div className="relative mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content - Brand Dominant */}
              <div className="text-center lg:text-left animate-in">
                {/* Logo Mark - prominent but not overwhelming */}
                <div className="inline-flex items-center justify-center lg:justify-start mb-6 animate-in" style={{ animationDelay: "100ms" }}>
                  <CyberNexusMark size={48} className="text-accent drop-shadow-[0_0_24px_rgba(34,211,238,0.4)]" />
                </div>
                
                {/* Main Title - "CyberNexus" dominant */}
                <h1 className="font-display text-display-xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.05] animate-in" style={{ animationDelay: "150ms" }}>
                  Cyber<span className="text-gradient">Nexus</span>
                </h1>
                
                {/* Tagline */}
                <p className="mt-4 text-body-lg lg:text-body-lg text-ink-muted animate-in font-medium tracking-wide" style={{ animationDelay: "200ms" }}>
                  Secure Your Digital World.
                </p>
                
                {/* Description based on actual functionality */}
                <p className="mt-6 max-w-xl lg:max-w-2xl text-body-md lg:text-body-lg leading-relaxed text-ink-muted animate-in" style={{ animationDelay: "250ms" }}>
                  A unified cybersecurity assessment platform with 8 security modules for URL scanning, file analysis, 
                  password strength, IP intelligence, domain reputation, SSL/TLS auditing, security headers, 
                  and email header analysis — powered by VirusTotal and AbuseIPDB.
                </p>
                
                {/* CTAs */}
                <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 animate-in" style={{ animationDelay: "300ms" }}>
                  <Link href="/register">
                    <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right" className="gap-3">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right" className="gap-3">
                      Explore Modules
                    </Button>
                  </Link>
                </div>
                
                {/* Trust indicators */}
                <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-ink-muted animate-in" style={{ animationDelay: "350ms" }}>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-safe" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-safe" />
                    8 security modules
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-safe" />
                    Instant scans
                  </span>
                </div>
              </div>

              {/* Right Visual - Digital Network / Shield */}
              <div className="relative animate-in-slow" style={{ animationDelay: "200ms" }}>
                <div className="relative aspect-square max-w-md lg:max-w-lg mx-auto">
                  {/* Outer glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl" />
                  
                  {/* Main card with network visualization */}
                  <div className="relative rounded-3xl border border-edge/50 bg-surface-raised/50 p-6 lg:p-8 overflow-hidden">
                    {/* Network background */}
                    <div className="absolute inset-0 bg-grid opacity-20 bg-grid-fade" />
                    
                    <div className="relative space-y-4 font-mono text-sm">
                      {SERVICES.map(({ icon: Icon, title }, index) => (
                        <div key={title} className="flex items-center gap-3 text-ink-muted group" style={{ animationDelay: `${index * 60}ms` }}>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface-sunken text-accent transition-all group-hover:border-accent/50 group-hover:bg-accent/10">
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <span className="font-medium text-ink group-hover:text-accent transition-colors">{title}</span>
                          <span className="ml-auto flex items-center gap-1.5 text-safe">
                            <span className="h-2 w-2 rounded-full bg-safe animate-pulse" />
                            <span className="font-medium">Active</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Subtle shield outline decoration */}
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-full h-full opacity-20" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M150 15 L275 47.5 V135 C275 225 215 278 150 300 C85 278 25 225 25 135 V47.5 Z" stroke="#22D3EE" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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