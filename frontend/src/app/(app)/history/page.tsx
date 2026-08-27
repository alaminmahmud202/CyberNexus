"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { riskStatus, severityBadge } from "@/lib/severity";
import { serviceTypeLabel } from "@/lib/services";
import type { ScanRecord } from "@/lib/types";

const TYPE_FILTERS = [
  { value: "", label: "All types" },
  { value: "password", label: "Password" },
  { value: "ssl", label: "SSL / TLS" },
  { value: "security_headers", label: "Security Headers" },
  { value: "email_header", label: "Email Headers" },
  { value: "threat_intel_url", label: "Threat Intel - URL" },
  { value: "threat_intel_file", label: "Threat Intel - File" },
  { value: "threat_intel_domain", label: "Threat Intel - Domain" },
  { value: "threat_intel_ip", label: "Threat Intel - IP" },
];

export default function HistoryPage() {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("");

  const load = useCallback(async (serviceType: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = serviceType ? `?limit=50&service_type=${encodeURIComponent(serviceType)}` : "?limit=50";
      setRecords(await apiFetch<ScanRecord[]>(`/api/history/scans${query}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(typeFilter);
  }, [load, typeFilter]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Scan History</h1>
          <p className="mt-1 text-sm text-ink-muted">Your past scans, newest first.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Filter by service type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-9 rounded-lg border border-edge bg-surface-sunken px-3 text-sm text-ink focus:border-accent/70 focus:outline-none"
          >
            {TYPE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={() => void load(typeFilter)}>
            Refresh
          </Button>
        </div>
      </div>

      {loading && <p className="mt-10 text-sm text-ink-muted">Loading scans...</p>}

      {!loading && error && (
        <div className="mt-10 space-y-2">
          <p className="text-sm text-danger">{error}</p>
          {error.includes("401") && (
            <Link href="/login" className="text-sm text-accent hover:underline">
              Sign in to view your history
            </Link>
          )}
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-edge p-12 text-center">
          <p className="text-ink-muted">No scans recorded yet.</p>
          <Link href="/dashboard" className="mt-2 inline-block text-sm text-accent hover:underline">
            Run your first scan from the dashboard
          </Link>
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-edge bg-surface shadow-panel">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-edge text-[11px] uppercase tracking-widest text-ink-faint">
                <th className="px-4 py-3 font-medium">Scan ID</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Input</th>
                <th className="px-4 py-3 font-medium">Risk Status</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-edge/60 transition-colors last:border-0 hover:bg-surface-raised"
                >
                  <td className="px-4 py-3 font-mono text-xs text-ink-faint" title={record.id}>
                    {record.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-ink-muted">
                    {serviceTypeLabel(record.serviceType)}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-ink" title={record.input}>
                    {record.input}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={severityBadge(riskStatus(record.result))}>{riskStatus(record.result)}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-muted">
                    {record.durationMs != null
                      ? record.durationMs < 1000
                        ? `${record.durationMs}ms`
                        : `${(record.durationMs / 1000).toFixed(1)}s`
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-faint" title={new Date(record.createdAt).toLocaleString()}>
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
