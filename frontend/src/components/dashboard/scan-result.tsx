"use client";

import { ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { severityBadge } from "@/lib/severity";
import type { ExplanationResponse, ScanRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type Result = Record<string, unknown>;

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  return <Badge variant={severityBadge(status)}>{String(status)}</Badge>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-xs uppercase tracking-wider text-ink-faint">{label}</span>
      <span className="min-w-0 break-all text-right text-sm text-ink">{children}</span>
    </div>
  );
}

function MonoValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className="text-ink-faint">-</span>;
  return <span className="font-mono text-xs">{String(value)}</span>;
}

function StatTile({ label, count }: { label: string; count: number }) {
  const tone = label.includes("malicious")
    ? "text-danger"
    : label.includes("suspicious")
      ? "text-warning"
      : "text-safe";
  return (
    <div className="rounded-lg border border-edge bg-surface-sunken px-3 py-2 text-center">
      <p className={cn("font-mono text-lg font-bold", tone)}>{count}</p>
      <p className="mt-0.5 text-[11px] capitalize text-ink-faint">{label}</p>
    </div>
  );
}

function StatsGrid({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {Object.entries(stats).map(([label, count]) => (
        <StatTile key={label} label={label} count={Number(count)} />
      ))}
    </div>
  );
}

function Permalink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
    >
      View full report on VirusTotal
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function InfoPanel({ tone, title, detail }: { tone: "warning" | "accent"; title: string; detail: string }) {
  const border = tone === "warning" ? "border-warning/40" : "border-accent/40";
  const text = tone === "warning" ? "text-warning" : "text-accent";
  return (
    <div className={cn("rounded-lg border bg-surface-sunken p-4", border)}>
      <p className={cn("font-mono text-xs font-semibold uppercase tracking-widest", text)}>{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{detail}</p>
    </div>
  );
}

function PasswordResultView({ result }: { result: Result }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-3xl font-bold text-ink">
          {String(result.score)}
          <span className="text-base text-ink-faint">/{String(result.max_score)}</span>
        </span>
        <StatusBadge status={result.verdict as string} />
        <span className="font-mono text-xs text-ink-faint">length {String(result.length)}</span>
      </div>

      {(result.issues as string[])?.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">Issues</p>
          <ul className="space-y-1">
            {(result.issues as string[]).map((issue) => (
              <li key={issue} className="text-sm text-warning">{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {(result.suggestions as string[])?.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">Suggestions</p>
          <ul className="list-inside list-disc space-y-1">
            {(result.suggestions as string[]).map((tip) => (
              <li key={tip} className="text-sm text-ink-muted">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SslResultView({ result }: { result: Result }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={result.status as string} />
        <Badge variant={result.valid ? "safe" : "danger"}>
          {result.valid ? "Chain trusted" : "Untrusted"}
        </Badge>
        {Boolean(result.expired) && <Badge variant="danger">Expired</Badge>}
      </div>
      <div className="divide-y divide-edge/60">
        <Row label="Subject"><MonoValue value={result.subject} /></Row>
        <Row label="Issuer"><MonoValue value={result.issuer} /></Row>
        <Row label="Expires"><MonoValue value={result.expires_at ? new Date(String(result.expires_at)).toLocaleString() : null} /></Row>
        <Row label="Days remaining">
          <span className={cn("font-mono text-sm font-bold", Number(result.days_remaining) <= 30 ? "text-warning" : "text-safe")}>
            {String(result.days_remaining ?? "-")}
          </span>
        </Row>
        <Row label="TLS version"><MonoValue value={result.tls_version} /></Row>
        <Row label="Cipher">
          <MonoValue value={result.cipher ? `${(result.cipher as Result).name} (${(result.cipher as Result).bits}-bit)` : null} />
        </Row>
      </div>
      {!result.valid && Boolean(result.verification_error) && (
        <p className="text-sm text-danger">{String(result.verification_error)}</p>
      )}
    </div>
  );
}

function HeadersResultView({ result }: { result: Result }) {
  const checks = (result.checks ?? []) as Array<Result>;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={result.status as string} />
        <span className="font-mono text-sm font-bold text-ink">Score {String(result.score)}/100</span>
        <span className="text-xs text-ink-faint">
          {String(result.present_count)} present / {String(result.missing_count)} missing
        </span>
      </div>
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={String(check.header)} className="rounded-lg border border-edge bg-surface-sunken px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-ink">{String(check.header)}</span>
              <StatusBadge status={(check.present ? check.status : "danger") as string} />
            </div>
            <p className="mt-1 text-xs text-ink-muted">{String(check.detail)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailResultView({ result }: { result: Result }) {
  const authFields = [
    { label: "SPF", block: result.spf as Result },
    { label: "DKIM", block: result.dkim as Result },
    { label: "DMARC", block: result.dmarc as Result },
  ];
  const indicators = (result.indicators ?? []) as string[];
  const alignment = result.alignment as Result;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={result.status as string} />
        <span className="font-mono text-xs text-ink-faint">{String(result.hop_count)} hops</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {authFields.map(({ label, block }) => (
          <div key={label} className="rounded-lg border border-edge bg-surface-sunken px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-ink-faint">{label}</span>
              <StatusBadge status={(block?.verdict ? block.status : "unknown") as string} />
            </div>
            <p className="mt-1 font-mono text-xs text-ink">{String(block?.verdict ?? "not found")}</p>
          </div>
        ))}
      </div>
      <div className="divide-y divide-edge/60">
        <Row label="From"><MonoValue value={result.from_address} /></Row>
        <Row label="Return-Path"><MonoValue value={result.return_path} /></Row>
        <Row label="Alignment">
          {alignment?.aligned
            ? <Badge variant="safe">Aligned</Badge>
            : <Badge variant="danger">Mismatch</Badge>}
        </Row>
      </div>
      {indicators.length > 0 && (
        <ul className="space-y-1">
          {indicators.map((indicator) => (
            <li key={indicator} className="text-sm text-danger">{indicator}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IntelResultView({ result }: { result: Result }) {
  const status = String(result.status);
  const permalink = (result.permalink as string) ?? "";

  if (status === "error") {
    const error = result.error as Result;
    return (
      <InfoPanel tone="warning" title={String(error?.code ?? "provider error")} detail={String(error?.message ?? "")} />
    );
  }

  if (status === "submitted" || status === "not_found") {
    return (
      <InfoPanel
        tone="accent"
        title={status}
        detail={`${String(result.detail ?? "")}${result.analysis_id ? ` (analysis id: ${String(result.analysis_id)})` : ""}`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={(result.derived_status ?? status) as string} />
        {Boolean(result.threat_label) && <Badge variant="danger">{String(result.threat_label)}</Badge>}
      </div>

      {result.abuse_confidence_score !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-ink-faint">
            <span>Abuse confidence</span>
            <span className="font-mono font-bold text-ink">{String(result.abuse_confidence_score)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-edge">
            <div
              className={cn(
                "h-full rounded-full",
                Number(result.abuse_confidence_score) >= 75
                  ? "bg-danger"
                  : Number(result.abuse_confidence_score) >= 25
                    ? "bg-warning"
                    : "bg-safe"
              )}
              style={{ width: `${Math.min(100, Number(result.abuse_confidence_score))}%` }}
            />
          </div>
        </div>
      )}

      {Boolean(result.stats) && (
        <StatsGrid stats={result.stats as Record<string, number>} />
      )}

      <div className="divide-y divide-edge/60">
        {result.isp !== undefined && <Row label="ISP"><MonoValue value={result.isp} /></Row>}
        {result.country_code !== undefined && <Row label="Country"><MonoValue value={result.country_code} /></Row>}
        {result.total_reports !== undefined && <Row label="Total reports"><MonoValue value={result.total_reports} /></Row>}
        {result.reputation !== undefined && <Row label="Reputation"><MonoValue value={result.reputation} /></Row>}
        {result.file_name !== undefined && <Row label="File"><MonoValue value={result.file_name} /></Row>}
        {result.community_votes !== undefined && (
          <Row label="Community votes">
            <MonoValue
              value={`harmless ${(result.community_votes as Result).harmless} / malicious ${(result.community_votes as Result).malicious}`}
            />
          </Row>
        )}
      </div>

      {permalink && <Permalink url={permalink} />}
    </div>
  );
}

type ExplainState = "idle" | "loading" | "ready" | "error";

function ExplainSection({ scanId }: { scanId: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ExplainState>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setState("loading");
    try {
      const response = await apiFetch<ExplanationResponse>(
        `/api/scan/explain/${scanId}`,
        { method: "POST" }
      );
      if (response.status !== "ok") {
        setError(response.error?.message ?? "AI explanation unavailable.");
        setState("error");
      } else {
        setText(response.explanation);
        setState("ready");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI explanation failed.");
      setState("error");
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && state === "idle") void load();
  }

  return (
    <div className="mt-5 border-t border-edge pt-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <Sparkles className="h-4 w-4 text-accent" />
        Explain this result
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-3 rounded-lg border border-edge bg-surface-sunken p-4">
          {state === "loading" && (
            <p className="animate-pulse text-sm text-ink-muted">
              Analyzing result...
            </p>
          )}
          {state === "error" && <p className="text-sm text-danger">{error}</p>}
          {state === "ready" && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
              {text}
            </p>
          )}
          {(state === "ready" || state === "error") && (
            <button
              type="button"
              onClick={() => {
                setState("idle");
                void load();
              }}
              className="mt-3 font-mono text-[11px] uppercase tracking-widest text-ink-faint transition-colors hover:text-accent"
            >
              Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ScanResultView({ record }: { record: ScanRecord }) {
  const result = record.result;

  if (record.status === "failed") {
    const error = (result?.error ?? {}) as Result;
    return (
      <div className="rounded-lg border border-danger/50 bg-danger/10 p-4">
        <div className="flex items-center gap-2">
          <Badge variant="danger">{String(error.code ?? "scan failed")}</Badge>
        </div>
        <p className="mt-2 text-sm text-ink-muted">{String(error.message ?? record.input)}</p>
      </div>
    );
  }

  let body: React.ReactNode;
  switch (record.serviceType) {
    case "password":
      body = <PasswordResultView result={result} />;
      break;
    case "ssl":
      body = <SslResultView result={result} />;
      break;
    case "security_headers":
      body = <HeadersResultView result={result} />;
      break;
    case "email_header":
      body = <EmailResultView result={result} />;
      break;
    default:
      body = <IntelResultView result={result} />;
  }

  return (
    <Card>
      <CardHeader className="border-b border-edge pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Result</CardTitle>
          <span className="font-mono text-[11px] text-ink-faint">scan {record.id.slice(0, 8)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {body}
        <ExplainSection scanId={record.id} />
      </CardContent>
    </Card>
  );
}
