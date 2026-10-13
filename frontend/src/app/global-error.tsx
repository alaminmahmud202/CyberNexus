"use client";

import { Button } from "@/components/ui/button";
import { CyberNexusLogo } from "@/components/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Global application error:", error);
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - CyberNexus</title>
      </head>
      <body className="min-h-screen bg-base font-sans text-ink antialiased">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center max-w-md">
            <CyberNexusLogo size="xl" className="mx-auto mb-6" />
            <h2 className="font-display text-xl font-semibold text-ink">Something went wrong</h2>
            <p className="mt-2 text-body-md text-ink-muted">
              A critical error occurred. The application cannot recover automatically.
            </p>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left p-3 rounded-lg border border-edge bg-surface-sunken">
                <summary className="font-mono text-xs text-ink-muted cursor-pointer">Error details (development)</summary>
                <pre className="mt-2 font-mono text-[11px] text-ink-muted overflow-auto">{error.message}</pre>
                {error.digest && <p className="mt-1 font-mono text-[11px] text-ink-faint">Digest: {error.digest}</p>}
              </details>
            )}
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={reset}>Try Again</Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>Go Home</Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}