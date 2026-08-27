import {
  FileUp,
  Globe,
  KeyRound,
  ListChecks,
  Mail,
  Network,
  Radar,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface ServiceField {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "number" | "file" | "textarea";
}

export interface ServiceDef {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  submitLabel: string;
  fields: ServiceField[];
}

export const SERVICES: ServiceDef[] = [
  {
    id: "url",
    title: "URL Scanner",
    description: "VirusTotal reputation lookup for any URL.",
    icon: Globe,
    path: "/api/scan/url",
    submitLabel: "Scan URL",
    fields: [{ name: "url", label: "URL", placeholder: "https://example.com" }],
  },
  {
    id: "file",
    title: "File Scanner",
    description: "Hash a sample and check it against VirusTotal.",
    icon: FileUp,
    path: "/api/scan/file",
    submitLabel: "Scan File",
    fields: [{ name: "file", label: "Sample file (max 32 MB)", type: "file" }],
  },
  {
    id: "password",
    title: "Password Checker",
    description: "Strength scoring with common-pattern detection.",
    icon: KeyRound,
    path: "/api/scan/password",
    submitLabel: "Analyze Password",
    fields: [
      { name: "password", label: "Password to test", type: "password", placeholder: "Enter a test password" },
    ],
  },
  {
    id: "ip",
    title: "IP Intelligence",
    description: "AbuseIPDB confidence score for an address.",
    icon: Radar,
    path: "/api/scan/ip",
    submitLabel: "Lookup IP",
    fields: [{ name: "ip", label: "IP address", placeholder: "203.0.113.9" }],
  },
  {
    id: "domain",
    title: "Domain Intelligence",
    description: "VirusTotal domain report with community votes.",
    icon: Network,
    path: "/api/scan/domain",
    submitLabel: "Lookup Domain",
    fields: [{ name: "domain", label: "Domain", placeholder: "example.com" }],
  },
  {
    id: "ssl",
    title: "SSL Checker",
    description: "Certificate chain, issuer, and expiry audit.",
    icon: ShieldCheck,
    path: "/api/scan/ssl",
    submitLabel: "Inspect Host",
    fields: [
      { name: "host", label: "Hostname", placeholder: "example.com" },
      { name: "port", label: "Port", type: "number", placeholder: "443" },
    ],
  },
  {
    id: "headers",
    title: "Security Headers",
    description: "HSTS, CSP, and hardening header audit.",
    icon: ListChecks,
    path: "/api/scan/headers",
    submitLabel: "Audit Headers",
    fields: [{ name: "url", label: "URL to audit", placeholder: "https://example.com" }],
  },
  {
    id: "email-header",
    title: "Email Header Analyzer",
    description: "SPF/DKIM/DMARC verdicts and spoof detection.",
    icon: Mail,
    path: "/api/scan/email-header",
    submitLabel: "Analyze Headers",
    fields: [
      { name: "raw_headers", label: "Paste raw email headers", type: "textarea" },
    ],
  },
];

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  password: "Password",
  ssl: "SSL / TLS",
  security_headers: "Security Headers",
  email_header: "Email Headers",
  threat_intel_url: "Threat Intel - URL",
  threat_intel_file: "Threat Intel - File",
  threat_intel_domain: "Threat Intel - Domain",
  threat_intel_ip: "Threat Intel - IP",
};

export function serviceTypeLabel(serviceType: string): string {
  return (
    SERVICE_TYPE_LABELS[serviceType] ??
    serviceType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
