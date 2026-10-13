"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CyberNexusLogo } from "@/components/logo";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error | null }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10">
          <svg className="h-8 w-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-ink">Something went wrong</h2>
        <p className="mt-2 text-body-md text-ink-muted">
          An unexpected error occurred. Please try again or navigate back to the dashboard.
        </p>
        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-4 text-left p-3 rounded-lg border border-edge bg-surface-sunken">
            <summary className="font-mono text-xs text-ink-muted cursor-pointer">Error details (development)</summary>
            <pre className="mt-2 font-mono text-[11px] text-ink-muted overflow-auto">{error.message}</pre>
            <pre className="mt-2 font-mono text-[11px] text-ink-faint overflow-auto">{error.stack}</pre>
          </details>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>Go Home</Button>
        </div>
      </div>
    </div>
  );
}