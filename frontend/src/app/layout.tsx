import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CyberNexus - Web-Based Cybersecurity Assessment Platform",
    template: "%s | CyberNexus",
  },
  description: "A unified console for threat intelligence and security auditing. Scan URLs, files, domains, and hosts; analyze email headers; audit certificates and hardening — all from one professional dashboard.",
  keywords: ["cybersecurity", "threat intelligence", "vulnerability scanning", "security audit", "VirusTotal", "AbuseIPDB", "SSL checker", "password security"],
  authors: [{ name: "Al Amin Mahmud" }],
  creator: "Al Amin Mahmud",
  publisher: "CyberNexus",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cybernexus.vercel.app",
    title: "CyberNexus - Cybersecurity Assessment Platform",
    description: "A unified console for threat intelligence and security auditing.",
    siteName: "CyberNexus",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberNexus - Cybersecurity Assessment Platform",
    description: "A unified console for threat intelligence and security auditing.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-base font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}