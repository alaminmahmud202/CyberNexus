import { ArrowRight } from "lucide-react";

import {
  Badge,
  CardHeading,
  CardMenuButton,
  OverviewCard,
  StatusDot,
} from "./primitives";

/**
 * Alert Center (DESIGN_SPEC_DASHBOARD.md §7.3).
 *
 * Three recent alerts with severity pill, relative timestamp and an
 * unread/read dot on the right edge, plus the "View All Alerts" footer
 * action. Row 1 is unread (green), rows 2–3 are read (grey).
 */

type Severity = "high" | "medium";

type AlertRow = {
  title: string;
  severity: Severity;
  time: string;
  unread: boolean;
};

const severityLabel: Record<Severity, string> = {
  high: "High",
  medium: "Medium",
};

const alerts: AlertRow[] = [
  {
    title: "Privilege Escalation Detected",
    severity: "high",
    time: "1 hour ago",
    unread: true,
  },
  {
    title: "Privilege Escalation Detected",
    severity: "medium",
    time: "1 hour ago",
    unread: false,
  },
  {
    title: "Abnormal Login Pattern",
    severity: "medium",
    time: "3 hours ago",
    unread: false,
  },
];

export function AlertCenterCard() {
  return (
    <OverviewCard className="min-h-[360px]">
      <CardHeading
        title="Alert Center"
        action={<CardMenuButton label="Alert center options" />}
      />

      <ul aria-label="Recent alerts" className="mt-2">
        {alerts.map((alert) => (
          <li
            key={`${alert.title}-${alert.severity}-${alert.time}`}
            className="flex items-center justify-between gap-3 border-b border-console-line py-4 last:border-0"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-[14px] font-semibold text-fg">
                  {alert.title}
                </span>
                <Badge tone={alert.severity}>
                  {severityLabel[alert.severity]}
                </Badge>
              </div>
              <p className="mt-1 text-[12px] text-fg-faint">{alert.time}</p>
            </div>
            <StatusDot
              tone={alert.unread ? "ok" : "neutral"}
              active={alert.unread}
              className="shrink-0"
            />
          </li>
        ))}
      </ul>

      <footer className="mt-auto pt-2">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-console-pill text-[13px] font-medium text-fg transition-colors hover:bg-console-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/60"
        >
          View All Alerts
          <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
        </button>
      </footer>
    </OverviewCard>
  );
}
