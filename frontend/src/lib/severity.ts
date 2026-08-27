import type { BadgeVariant } from "@/components/ui/badge";

export function severityBadge(status?: string | null): BadgeVariant {
  const value = (status ?? "").toLowerCase();
  if (["safe", "strong", "completed", "pass", "clean"].includes(value)) return "safe";
  if (["warning", "medium", "submitted", "not_found", "suspicious"].includes(value)) return "warning";
  if (["danger", "weak", "failed", "fail", "malicious", "critical"].includes(value)) return "danger";
  return "neutral";
}

export function riskStatus(result: Record<string, unknown>): string {
  const r = result as Record<string, any>;
  if (r.verdict) return String(r.verdict);
  if (r.derived_status) return String(r.derived_status);
  if (r.status) return String(r.status);
  return "unknown";
}

export function severityTextClass(status?: string | null): string {
  switch (severityBadge(status)) {
    case "safe":
      return "text-safe";
    case "warning":
      return "text-warning";
    case "danger":
      return "text-danger";
    default:
      return "text-ink-muted";
  }
}
