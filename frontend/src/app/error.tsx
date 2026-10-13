"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CyberNexusLogo } from "@/components/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-base">
      <div className="text-center max-w-md">
        <CyberNexusLogo size="xl" className="mx-auto mb-6" />
        <h2 className="font-display text-xl font-semibold text-ink">Something went wrong</h2>
        <p className="mt-2 text-body-md text-ink-muted">
          An unexpected error occurred while loading this page.
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
  );
}