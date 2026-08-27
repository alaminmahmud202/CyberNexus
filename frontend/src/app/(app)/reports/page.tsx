"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiDownload, apiFetch } from "@/lib/api";
import { riskStatus, severityBadge } from "@/lib/severity";
import { serviceTypeLabel } from "@/lib/services";
import type { ReportRecord, TaskRecord } from "@/lib/types";

const RECOMMENDATIONS: Record<string, string[]> = {
  password: [
    "Use at least 12-16 characters with a mix of uppercase, lowercase, numbers, and symbols.",
    "Avoid using personal information in passwords.",
    "Use a unique password for every account.",
    "Enable multi-factor authentication (MFA) wherever possible.",
    "Use a password manager to generate and store strong passwords.",
  ],
  ssl: [
    "Ensure the certificate is issued by a trusted CA.",
    "Renew the certificate before it expires.",
    "Use TLS 1.2 or higher; disable older protocols.",
    "Configure the server to prefer strong cipher suites.",
    "Enable HSTS to enforce HTTPS connections.",
  ],
  security_headers: [
    "Implement Content-Security-Policy (CSP) to prevent XSS.",
    "Set X-Frame-Options to DENY or SAMEORIGIN.",
    "Enable X-Content-Type-Options: nosniff.",
    "Add Strict-Transport-Security (HSTS) header.",
    "Configure Permissions-Policy to restrict browser features.",
  ],
  email_header: [
    "Ensure SPF is properly configured with a valid DNS TXT record.",
    "Set up DKIM signing to verify email authenticity.",
    "Configure DMARC with at least a p=quarantine or p=reject policy.",
    "Align SPF and DKIM with the From: domain.",
    "Monitor DMARC aggregate reports regularly.",
  ],
  threat_intel_url: [
    "Do not visit or share flagged URLs.",
    "Block the URL at the network level.",
    "Report the malicious URL to your security team.",
    "Check if any internal systems accessed the URL.",
    "Update threat intelligence feeds with the new IOCs.",
  ],
  threat_intel_file: [
    "Do not execute or open the file.",
    "Isolate the file and submit to a sandbox for analysis.",
    "Block the file hash across all endpoints.",
    "Check if the file was downloaded on any internal systems.",
    "Report the finding to your incident response team.",
  ],
  threat_intel_domain: [
    "Block the domain at the DNS level and firewall.",
    "Check internal logs for connections to the domain.",
    "Revoke any exposed credentials.",
    "Report the domain to relevant abuse contacts.",
    "Monitor for lookalike domains used for phishing.",
  ],
  threat_intel_ip: [
    "Block the IP address at the firewall.",
    "Investigate internal connections to this IP.",
    "Check for lateral movement or data exfiltration.",
    "Report the IP to your ISP or CERT team.",
    "Add the IP to your threat intelligence watchlist.",
  ],
};

export default function ReportsPage() {
  const [scanId, setScanId] = useState("");
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [task, setTask] = useState<TaskRecord | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportRecord[]>([]);

  const loadReports = useCallback(async () => {
    try {
      const data = await apiFetch<ReportRecord[]>("/api/reports?limit=10");
      setReports(data);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const pollTask = useCallback(
    async (taskId: string) => {
      const maxAttempts = 30;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
          const t = await apiFetch<TaskRecord>(`/api/tasks/${taskId}`);
          setTask(t);

          if (t.status === "finished" && t.result) {
            setReport(t.result as unknown as ReportRecord);
            setGenerating(false);
            void loadReports();
            return;
          }
          if (t.status === "failed") {
            setError(t.error || "Report generation failed");
            setGenerating(false);
            return;
          }
        } catch {
          // continue polling
        }
      }
      setError("Timeout waiting for report generation");
      setGenerating(false);
    },
    [loadReports]
  );

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = scanId.trim();
    if (!trimmed) {
      setError("Enter a scan ID first.");
      return;
    }

    setGenerating(true);
    setError(null);
    setReport(null);
    setTask(null);
    try {
      const response = await apiFetch<{ taskId: string; status: string }>(
        "/api/reports",
        {
          method: "POST",
          body: JSON.stringify({ scanId: trimmed }),
        }
      );
      void pollTask(response.taskId);
    } catch (err) {
      setGenerating(false);
      setError(err instanceof Error ? err.message : "Failed to start report generation");
    }
  }

  async function handleDownload() {
    if (!report) return;
    setDownloading(true);
    setError(null);
    try {
      await apiDownload(
        `/api/reports/${report.id}/download`,
        `cybernexus-report-${report.id}.pdf`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  function getTaskStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return <Badge variant="neutral">Queued</Badge>;
      case "scanning":
      case "processing":
        return <Badge variant="warning">In Progress</Badge>;
      case "finished":
        return <Badge variant="safe">Complete</Badge>;
      case "failed":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Build a structured report from any of your scans. Scan IDs are listed
        on the History page.
      </p>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <form onSubmit={handleGenerate} className="flex flex-col gap-3 sm:flex-row">
            <Input
              aria-label="Scan ID"
              placeholder="Paste a scan ID (e.g. 66f1c9...)"
              mono
              value={scanId}
              onChange={(event) => setScanId(event.target.value)}
            />
            <Button type="submit" disabled={generating} className="shrink-0">
              {generating ? "Generating..." : "Generate report"}
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </CardContent>
      </Card>

      {task && (
        <Card className="mt-6">
          <CardHeader className="border-b border-edge pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Task Progress</CardTitle>
              {getTaskStatusBadge(task.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Task ID</span>
                <span className="font-mono text-xs text-ink">{task.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Type</span>
                <span className="text-ink">{task.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Created</span>
                <span className="text-ink">{new Date(task.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Updated</span>
                <span className="text-ink">{new Date(task.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {report && (
        <Card className="mt-6">
          <CardHeader className="border-b border-edge pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle>{report.title}</CardTitle>
                <p className="mt-1 font-mono text-xs text-ink-faint">
                  report {report.id} - {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleDownload} disabled={downloading}>
                <Download className="h-4 w-4" />
                {downloading ? "Preparing..." : "Download PDF"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{serviceTypeLabel(report.serviceType)}</Badge>
              <Badge variant={severityBadge(riskStatus(report.content.result))}>
                risk: {riskStatus(report.content.result)}
              </Badge>
              <Badge variant={severityBadge(report.content.scan.status)}>
                scan: {report.content.scan.status}
              </Badge>
              <Badge variant={severityBadge(report.content.summary.outcome)}>
                outcome: {report.content.summary.outcome}
              </Badge>
            </div>

            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-ink-faint">Target</p>
              <p className="break-all font-mono text-sm text-ink">{report.content.summary.target}</p>
            </div>

            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-ink-faint">Result payload</p>
              <pre className="max-h-96 overflow-auto rounded-lg border border-edge bg-surface-sunken p-4 font-mono text-xs leading-relaxed text-ink-muted">
                {JSON.stringify(report.content.result, null, 2)}
              </pre>
            </div>

            {RECOMMENDATIONS[report.serviceType] && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-ink-faint">What to do</p>
                <ol className="space-y-1.5 rounded-lg border border-edge bg-surface-sunken p-4">
                  {RECOMMENDATIONS[report.serviceType].map((rec, i) => (
                    <li key={i} className="text-sm text-ink-muted">
                      <span className="mr-2 font-medium text-ink">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {reports.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="border-b border-edge pb-4">
            <CardTitle className="text-base">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-edge">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{r.title}</p>
                    <p className="font-mono text-[11px] text-ink-faint">
                      {serviceTypeLabel(r.serviceType)} - {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={severityBadge(riskStatus(r.content.result))}>
                    {riskStatus(r.content.result)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
