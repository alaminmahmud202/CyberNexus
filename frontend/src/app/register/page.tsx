"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CyberNexusMark } from "@/components/logo";
import { apiFetch, storeAuth } from "@/lib/api";
import type { TokenPair, UserPublic } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch<UserPublic>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const tokens = await apiFetch<TokenPair>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      localStorage.setItem("cybernexus_token", tokens.access_token);
      const user = await apiFetch<UserPublic>("/api/auth/me");
      storeAuth(tokens.access_token, tokens.refresh_token, {
        id: user.id,
        name: user.name,
        email: user.email,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden flex-1 flex-col justify-between bg-surface-sunken p-12 lg:flex">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <CyberNexusMark className="h-10 w-10" />
            <span className="font-mono text-xl font-bold tracking-tight">
              Cyber<span className="text-accent">Nexus</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Start securing your infrastructure today
          </h2>
          <p className="mt-4 text-ink-muted leading-relaxed">
            Create your free account and get instant access to all eight security
            scanning modules. No credit card required.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Free Account</p>
                <p className="text-sm text-ink-muted">Full access to all security modules</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Instant Scanning</p>
                <p className="text-sm text-ink-muted">Run your first scan in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Secure & Private</p>
                <p className="text-sm text-ink-muted">Your data is encrypted and protected</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-ink-faint">
          © {new Date().getFullYear()} CyberNexus - BGC Trust University SDP-2
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <CyberNexusMark className="h-8 w-8" />
              <span className="font-mono text-lg font-bold">
                Cyber<span className="text-accent">Nexus</span>
              </span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-ink-muted">
            Join CyberNexus and start protecting your digital assets.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full name
              </label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Analyst"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11"
                minLength={1}
                maxLength={80}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11"
                minLength={8}
                maxLength={128}
                required
              />
              <p className="mt-1.5 text-xs text-ink-faint">
                Must be at least 8 characters long
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 p-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-ink-muted">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-edge" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-base px-4 text-ink-muted">Already have an account?</span>
            </div>
          </div>

          <Link
            href="/login"
            className="flex h-11 items-center justify-center rounded-lg border border-edge font-semibold transition hover:border-accent/60 hover:text-accent"
          >
            Sign in to your account
          </Link>

          <p className="mt-8 text-center text-xs text-ink-faint">
            A Software Development Project at BGC Trust University
          </p>
        </div>
      </div>
    </main>
  );
}
