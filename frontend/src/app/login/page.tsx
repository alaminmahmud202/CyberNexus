"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Lock, Mail, User, Eye, EyeOff, Loader2, AlertTriangle, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CyberNexusLogo } from "@/components/logo";
import { apiFetch, storeAuth, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TokenPair, UserPublic } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"auth" | "network" | "server" | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    return null;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    return null;
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrorType(null);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr || passwordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      return;
    }

    setSubmitting(true);

    try {
      const tokens = await apiFetch<TokenPair>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const user = await apiFetch<UserPublic>("/api/auth/me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      storeAuth(tokens.access_token, tokens.refresh_token, {
        id: user.id,
        name: user.name,
        email: user.email,
      });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isNetworkError) {
          setErrorType("network");
          setError("Unable to connect to the server. Please check your internet connection and ensure the backend service is running.");
        } else if (err.status === 401) {
          setErrorType("auth");
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (err.status >= 500) {
          setErrorType("server");
          setError("Server error. Please try again in a few moments.");
        } else {
          setErrorType("server");
          setError(err.message);
        }
      } else {
        setErrorType("server");
        setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const getErrorIcon = () => {
    switch (errorType) {
      case "network":
        return <WifiOff className="h-5 w-5 flex-shrink-0 text-danger" />;
      case "auth":
        return <AlertTriangle className="h-5 w-5 flex-shrink-0 text-danger" />;
      default:
        return <AlertTriangle className="h-5 w-5 flex-shrink-0 text-danger" />;
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case "network":
        return "Connection Error";
      case "auth":
        return "Authentication Failed";
      default:
        return "Error";
    }
  };

  return (
    <main className="relative flex min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-base" />
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-blue-500/5" />

      {/* Left Side - Branding */}
      <div className="hidden relative flex-1 flex-col justify-between bg-surface-sunken/30 p-12 lg:flex">
        <div>
          <Link href="/" className="flex items-center gap-3" aria-label="CyberNexus home">
            <CyberNexusLogo size="xl" variant="light" />
          </Link>
        </div>

        <div className="max-w-md">
          <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight">
            Welcome back to your security workspace
          </h2>
          <p className="mt-4 text-body-lg text-ink-muted leading-relaxed">
            Sign in to access your scan history, security reports, and all eight security modules.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-body-md">Full Access</p>
                <p className="text-body-sm text-ink-muted">All security modules included</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                <Lock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-body-md">Secure Login</p>
                <p className="text-body-sm text-ink-muted">JWT authentication with refresh tokens</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-body-md">Scan History</p>
                <p className="text-body-sm text-ink-muted">Track all your past assessments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="relative w-full max-w-md animate-in">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 justify-center" aria-label="CyberNexus home">
              <CyberNexusLogo size="xl" variant="light" />
            </Link>
          </div>

          <div className="text-center">
            <h1 className="font-display text-3xl font-bold">Sign in to your account</h1>
            <p className="mt-2 text-body-md text-ink-muted">
              Continue where you left off
            </p>
          </div>

          <Card variant="elevated" className="mt-8">
            <CardHeader className="pb-2">
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Enter your credentials to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl border border-danger/30 bg-danger/10 p-4" role="alert">
                    <div className="flex items-start gap-3">
                      {getErrorIcon()}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-body-sm text-danger">{getErrorTitle()}</p>
                        <p className="mt-1 text-body-sm text-ink-muted">{error}</p>
                        {errorType === "network" && (
                          <p className="mt-2 text-caption text-ink-muted">
                            Make sure the backend server is running on port 8000.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError(null);
                    }}
                    error={emailError || undefined}
                    icon={<Mail className="h-4.5 w-4.5" />}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordError(null);
                    }}
                    error={passwordError || undefined}
                    icon={<Lock className="h-4.5 w-4.5" />}
                    required
                    disabled={submitting}
                    helperText={
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-body-sm font-medium text-accent hover:underline"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-edge bg-surface-raised text-accent focus:ring-accent/20"
                    />
                    <span className="text-body-sm text-ink-muted">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-body-sm font-medium text-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-body-sm text-ink-muted">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-accent hover:underline">
                  Create one
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}