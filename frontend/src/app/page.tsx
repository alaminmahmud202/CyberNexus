import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, ShieldCheck, TrendingUp } from "lucide-react";

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

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex flex-1 flex-col pt-16">
        {/* Hero Section */}
        <section id="hero" className="relative overflow-hidden px-6 pt-14 pb-12 lg:pt-20 lg:pb-16">
          {/* Background treatment: deep navy-to-black with subtle grid */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(34,211,238,0.08),transparent_65%)]" />
          <div aria-hidden="true" className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-base" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              {/* Left Content */}
              <div className="animate-in text-center lg:text-left">
                <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                  Cyber<span className="text-gradient">Nexus</span>
                </h1>

                <p className="mt-5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-[2.1rem] lg:leading-snug">
                  Know Your Risks. Secure Your Future.
                </p>

                <p className="mt-4 text-body-sm font-medium tracking-wide text-accent sm:text-[0.95rem]">
                  Check before you trust.
                </p>

                <p className="mx-auto mt-3 max-w-xl text-body-md leading-relaxed text-ink-muted sm:text-body-lg lg:mx-0 lg:max-w-2xl">
                  Attackers are counting on you not to check. Prove them wrong. Scan
                  suspicious links, files, domains and IPs with eight powerful tools, get
                  a clear verdict instantly, and stay one step ahead of every threat, free
                  and in under a minute.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
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
        <section className="relative px-6 pb-12 lg:pb-16">
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
        <section id="features" className="px-6 py-16 lg:py-20">
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

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
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
        <section id="how-it-works" className="border-t border-edge bg-surface-sunken/30 px-6 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center animate-in">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                How It Works
              </p>
              <h2 className="mt-3 font-display text-display-md lg:text-display-lg font-bold">
                Three Steps to Security Intelligence
              </h2>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-3 lg:mt-12">
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
        <section id="about" className="px-6 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center animate-in">
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                About CyberNexus
              </p>
              <h2 className="mt-3 font-display text-display-md lg:text-display-lg font-bold">
                Built for Safer Everyday Life
              </h2>
            </div>

            <div className="mt-8 mx-auto max-w-3xl text-center animate-in" style={{ animationDelay: "100ms" }}>
              <p className="text-body-lg text-ink-muted leading-relaxed">
                CyberNexus is a self security web based platform built with one main purpose:
                to protect people from the real world threats they face online every day. From
                phishing links and malicious files to suspicious domains and unsafe IP addresses,
                it brings professional security checks, threat intelligence and scan history
                into one simple workspace. Every result becomes a clear verdict, so anyone can
                understand a risk and act before it turns into a loss. Safety should never be
                a privilege reserved for experts, and CyberNexus is here to be a trusted
                companion in everyone&apos;s daily life.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-edge bg-surface-sunken/30 px-6 py-16 lg:py-20">
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
      </main>
      <SiteFooter />
    </div>
  );
}