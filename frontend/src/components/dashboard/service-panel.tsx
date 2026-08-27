"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { ScanResultView } from "@/components/dashboard/scan-result";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import type { ServiceDef } from "@/lib/services";
import type { ScanRecord } from "@/lib/types";

export function ServicePanel({
  service,
  onClose,
}: {
  service: ServiceDef;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<ScanRecord | null>(null);

  const Icon = service.icon;

  function setValue(name: string, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setRecord(null);

    try {
      let response: ScanRecord;

      if (service.id === "file") {
        const fileInput = document.getElementById(
          `${service.id}-file-input`
        ) as HTMLInputElement | null;
        const file = fileInput?.files?.[0];
        if (!file) throw new Error("Choose a file to scan");
        const formData = new FormData();
        formData.append("file", file);
        response = await apiFetch<ScanRecord>(service.path, {
          method: "POST",
          body: formData,
        });
      } else {
        const payload: Record<string, string | number> = {};
        for (const field of service.fields) {
          const raw = (values[field.name] ?? "").trim();
          if (!raw && field.name !== "port") continue;
          payload[field.name] = field.type === "number" ? Number(raw || "443") : raw;
        }
        response = await apiFetch<ScanRecord>(service.path, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setRecord(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-ink">{service.title}</h2>
                <p className="text-sm text-ink-muted">{service.description}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close panel"
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {service.fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={`${service.id}-${field.name}`}
                  className="mb-1 block text-sm text-ink-muted"
                >
                  {field.label}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    id={`${service.id}-${field.name}`}
                    rows={7}
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ""}
                    onChange={(event) => setValue(field.name, event.target.value)}
                    className="w-full rounded-lg border border-edge bg-surface-sunken px-3 py-2 font-mono text-xs text-ink transition-colors placeholder:text-ink-faint focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                ) : field.type === "file" ? (
                  <input
                    id={`${service.id}-file-input`}
                    type="file"
                    className="block w-full cursor-pointer rounded-lg border border-edge bg-surface-sunken px-3 py-2 text-sm text-ink-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-raised file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-edge"
                  />
                ) : (
                  <Input
                    id={`${service.id}-${field.name}`}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    mono
                    value={values[field.name] ?? ""}
                    onChange={(event) => setValue(field.name, event.target.value)}
                  />
                )}
              </div>
            ))}

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Scanning..." : service.submitLabel}
            </Button>
          </form>
        </CardContent>
      </Card>

      {record && <ScanResultView record={record} />}
    </div>
  );
}
