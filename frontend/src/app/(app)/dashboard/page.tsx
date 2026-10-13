"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { SERVICES, type ServiceDef } from "@/lib/services";
import { ServicePanel } from "@/components/dashboard/service-panel";

import { AlertCenterCard } from "@/components/dashboard/overview/alert-center-card";
import { ConsoleTopNav } from "@/components/dashboard/overview/top-nav";
import { DetectionTrendCard } from "@/components/dashboard/overview/detection-trend-card";
import { ResponseStatusCard } from "@/components/dashboard/overview/response-status-card";
import { SecurityThreatsCard } from "@/components/dashboard/overview/security-threats-card";
import { ThreatTacticsCard } from "@/components/dashboard/overview/threat-tactics-card";
import { WelcomeHeader } from "@/components/dashboard/overview/welcome-header";

/**
 * Security Overview console (DESIGN_SPEC_DASHBOARD.md §4, §8a).
 *
 * Top of page: the app frame with the console nav, page header and the five
 * overview widgets in the 12-col grid. The pre-existing security-module
 * scanner is preserved verbatim in a clearly separated section below the
 * widgets, inside the frame, so no functionality is lost.
 *
 * The global SiteHeader/SiteFooter/ChatBot chrome is suppressed on this
 * route by (app)/layout.tsx — ConsoleTopNav is the only nav here.
 */
export default function DashboardPage() {
  const [selected, setSelected] = useState<ServiceDef | null>(null);

  function select(service: ServiceDef) {
    setSelected((current) => (current?.id === service.id ? null : service));
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* App frame (§4) */}
      <div className="mx-auto my-8 max-w-[1440px] overflow-hidden rounded-[24px] border border-black/5 bg-console shadow-[0_40px_120px_-40px_rgba(0,0,0,0.5)]">
        <ConsoleTopNav />

        <div className="px-8 pb-8 pt-8">
          <WelcomeHeader />

          {/* Widget grid — row 1: 3 × 4 cols, row 2: 7 + 5 (§4) */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 lg:min-h-[360px] [&>section]:h-full">
              <ThreatTacticsCard />
            </div>
            <div className="lg:col-span-4 lg:min-h-[360px] [&>section]:h-full">
              <DetectionTrendCard />
            </div>
            <div className="lg:col-span-4 lg:min-h-[360px] [&>section]:h-full">
              <AlertCenterCard />
            </div>
            <div className="lg:col-span-7 lg:min-h-[340px] [&>section]:h-full">
              <SecurityThreatsCard />
            </div>
            <div className="lg:col-span-5 lg:min-h-[340px] [&>section]:h-full">
              <ResponseStatusCard />
            </div>
          </div>

          {/* Pre-existing security-module scanner — preserved below the widgets */}
          <section aria-label="Security scanner" className="mt-10 border-t border-console-line pt-8">
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-fg">
              Security Scanner
            </h2>
            <p className="mt-1 text-[13px] text-fg-muted">
              Select a module to run a security scan. Results are color-coded and
              saved to your history automatically.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                const active = selected?.id === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => select(service)}
                    aria-pressed={active}
                    className={cn(
                      "group rounded-xl border bg-surface p-5 text-left shadow-panel transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                      active
                        ? "border-accent/60 shadow-glow"
                        : "border-edge hover:border-accent/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                        active
                          ? "border-accent/40 bg-accent/15 text-accent"
                          : "border-edge bg-surface-raised text-ink-muted group-hover:text-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="mt-3 font-semibold text-ink">{service.title}</h2>
                    <p className="mt-1 text-sm text-ink-muted">{service.description}</p>
                  </button>
                );
              })}
            </div>

            {selected && (
              <section aria-label={`${selected.title} form`} className="mt-8 scroll-mt-24">
                <ServicePanel service={selected} onClose={() => setSelected(null)} />
              </section>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
