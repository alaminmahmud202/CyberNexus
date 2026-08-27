"""PDF report generator for CyberNexus scan reports."""
import json
from datetime import datetime
from typing import Any, Dict, List

from fpdf import FPDF


RECOMMENDATIONS: Dict[str, List[str]] = {
    "password": [
        "Use at least 12-16 characters with a mix of uppercase, lowercase, numbers, and symbols.",
        "Avoid using personal information (names, birthdays, addresses) in passwords.",
        "Use a unique password for every account — never reuse passwords.",
        "Enable multi-factor authentication (MFA) wherever possible.",
        "Use a password manager to generate and store strong passwords securely.",
    ],
    "ssl": [
        "Ensure the certificate is issued by a trusted Certificate Authority (CA).",
        "Renew the certificate before it expires to avoid service disruptions.",
        "Use TLS 1.2 or higher; disable older protocols (SSLv3, TLS 1.0, TLS 1.1).",
        "Configure the server to prefer strong cipher suites.",
        "Enable HSTS (HTTP Strict Transport Security) to enforce HTTPS connections.",
        "Use tools like SSL Labs or testssl.sh for periodic deep audits.",
    ],
    "security_headers": [
        "Implement Content-Security-Policy (CSP) to prevent XSS and injection attacks.",
        "Set X-Frame-Options to DENY or SAMEORIGIN to prevent clickjacking.",
        "Enable X-Content-Type-Options: nosniff to prevent MIME-type sniffing.",
        "Add Strict-Transport-Security (HSTS) header with a long max-age.",
        "Set Referrer-Policy to control how much referrer information is shared.",
        "Configure Permissions-Policy to restrict browser features (camera, mic, geolocation).",
    ],
    "email_header": [
        "Ensure SPF is properly configured with a valid DNS TXT record.",
        "Set up DKIM signing to verify email authenticity.",
        "Configure DMARC with at least a p=quarantine or p=reject policy.",
        "Align SPF and DKIM with the From: domain for DMARC pass.",
        "Monitor DMARC aggregate reports regularly to detect spoofing attempts.",
        "Implement BIMI to display your brand logo in supported email clients.",
    ],
    "threat_intel_url": [
        "Do not visit or share flagged URLs with others.",
        "Block the URL at the network level (firewall, DNS filter, proxy).",
        "Report the malicious URL to your security team and relevant authorities.",
        "Check if any internal systems or users have accessed the URL (SIEM/logs).",
        "Quarantine any endpoints that may have interacted with the URL.",
        "Update threat intelligence feeds and blocklists with the new IOCs.",
    ],
    "threat_intel_file": [
        "Do not execute or open the file on any system.",
        "Isolate the file and submit it to an isolated sandbox for deeper analysis.",
        "Block the file hash across all endpoints using EDR/AV solutions.",
        "Check if the file was downloaded or executed on any internal systems.",
        "Report the finding to your incident response team.",
        "Update your blocklist with the file hash and related IOCs.",
    ],
    "threat_intel_domain": [
        "Block the domain at the DNS level and firewall.",
        "Check internal logs for any connections to the domain.",
        "Revoke any credentials that may have been exposed to this domain.",
        "Report the domain to relevant abuse contacts and threat intel platforms.",
        "Monitor for lookalike domains that may be used for phishing.",
        "Update your threat intelligence feeds with the new IOC.",
    ],
    "threat_intel_ip": [
        "Block the IP address at the firewall and network perimeter.",
        "Investigate any connections from internal systems to this IP.",
        "Check for lateral movement or data exfiltration if the IP was contacted.",
        "Report the IP to your ISP, hosting provider, or CERT team.",
        "Add the IP to your threat intelligence watchlist for ongoing monitoring.",
        "Review and harden firewall rules and access control lists.",
    ],
}

STATUS_LABELS = {
    "safe": "SAFE",
    "strong": "STRONG",
    "warning": "WARNING",
    "danger": "DANGER",
    "weak": "WEAK",
    "critical": "CRITICAL",
    "completed": "COMPLETED",
    "failed": "FAILED",
    "clean": "CLEAN",
    "suspicious": "SUSPICIOUS",
    "malicious": "MALICIOUS",
}


class CyberNexusPDF(FPDF):
    """Custom PDF class with CyberNexus branding."""

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "CyberNexus Security Report", align="L")
        self.cell(0, 8, datetime.now().strftime("%Y-%m-%d %H:%M UTC"), align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title: str):
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(30, 30, 30)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(0, 150, 136)
        self.line(10, self.get_y(), 60, self.get_y())
        self.ln(3)

    def key_value(self, key: str, value: str):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(80, 80, 80)
        self.cell(50, 7, f"{key}:", align="L")
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 7, str(value), new_x="LMARGIN", new_y="NEXT")

    def body_text(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def status_badge(self, label: str, status: str):
        display = STATUS_LABELS.get(status.lower(), status.upper())
        if status.lower() in ("safe", "strong", "clean", "completed"):
            self.set_fill_color(220, 252, 231)
            self.set_text_color(22, 101, 52)
        elif status.lower() in ("warning", "suspicious", "medium"):
            self.set_fill_color(254, 243, 199)
            self.set_text_color(146, 64, 14)
        elif status.lower() in ("danger", "weak", "malicious", "critical", "failed"):
            self.set_fill_color(254, 226, 226)
            self.set_text_color(153, 27, 27)
        else:
            self.set_fill_color(229, 231, 235)
            self.set_text_color(55, 65, 81)
        self.set_font("Helvetica", "B", 10)
        self.cell(50, 7, f"{label}:", align="L")
        self.cell(0, 7, f"  {display}  ", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_fill_color(255, 255, 255)
        self.set_text_color(30, 30, 30)
        self.ln(1)

    def json_block(self, data: Dict[str, Any]):
        self.set_font("Courier", "", 8)
        self.set_text_color(50, 50, 50)
        self.set_fill_color(245, 245, 245)
        json_str = json.dumps(data, indent=2, default=str)
        for line in json_str.split("\n"):
            if self.get_y() > 270:
                self.add_page()
            self.cell(0, 4.5, f"  {line}", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(3)


def _risk_status(result: Dict[str, Any]) -> str:
    """Extract the real risk/verdict status from scan result."""
    if result.get("verdict"):
        return str(result["verdict"])
    if result.get("derived_status"):
        return str(result["derived_status"])
    if result.get("status"):
        return str(result["status"])
    return "unknown"


def generate_report_pdf(report: Dict[str, Any]) -> bytes:
    """Generate a PDF from a report document."""
    pdf = CyberNexusPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    content = report.get("content", {})
    summary = content.get("summary", {})
    scan_info = content.get("scan", {})
    result = content.get("result", {})

    pdf.section_title("Report Information")
    pdf.key_value("Report ID", report.get("id", "N/A"))
    pdf.key_value("Title", report.get("title", "N/A"))
    pdf.key_value("Service", report.get("serviceType", "N/A").replace("_", " ").title())
    pdf.key_value("Generated", str(report.get("createdAt", "N/A")))
    pdf.ln(5)

    pdf.section_title("Summary")
    pdf.key_value("Target", summary.get("target", "N/A"))
    pdf.status_badge("Risk Status", _risk_status(result))
    pdf.status_badge("Outcome", summary.get("outcome", "n/a"))
    pdf.ln(3)

    pdf.section_title("Scan Details")
    pdf.key_value("Scan ID", scan_info.get("id", "N/A"))
    pdf.key_value("Service Type", scan_info.get("service_type", "N/A"))
    pdf.key_value("Input", scan_info.get("input", "N/A"))
    pdf.status_badge("Scan Status", scan_info.get("status", "n/a"))
    pdf.key_value("Scanned At", scan_info.get("created_at", "N/A"))
    pdf.ln(5)

    if result:
        pdf.section_title("Result Data")
        pdf.json_block(result)

    service_type = report.get("serviceType", "")
    recs = RECOMMENDATIONS.get(service_type, [])
    if recs:
        pdf.ln(3)
        pdf.section_title("Recommendations")
        pdf.body_text("Based on the scan results, the following actions are recommended:")
        pdf.ln(1)
        for i, rec in enumerate(recs, 1):
            if pdf.get_y() > 265:
                pdf.add_page()
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(0, 5.5, f"  {i}. {rec}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)

    return bytes(pdf.output())
