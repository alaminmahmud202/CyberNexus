"use client";

import { cn } from "@/lib/utils";
import { SERVICES, type ServiceDef } from "@/lib/services";
import { ServicePanel } from "@/components/dashboard/service-panel";
import { useState } from "react";

export default function DashboardPage() {
  const [selected, setSelected] = useState<ServiceDef | null>(null);

  function select(service: ServiceDef) {
    setSelected((current) => (current?.id === service.id ? null : service));
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Select a module to run a security scan. Results are color-coded and
        saved to your history automatically.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
