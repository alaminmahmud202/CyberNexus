"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CyberNexusLogo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-base">
      <div className="text-center max-w-md">
        <CyberNexusLogo size="xl" className="mx-auto mb-6" />
        <h2 className="font-display text-3xl font-bold text-ink">404</h2>
        <p className="mt-2 text-body-lg text-ink-muted">Page not found</p>
        <p className="mt-2 text-body-md text-ink-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={() => window.history.back()}>Go Back</Button>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}