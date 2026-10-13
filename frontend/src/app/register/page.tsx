"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Lock, Mail, User, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CyberNexusLogo } from "@/components/logo";
import { apiFetch, storeAuth, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TokenPair, UserPublic } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"auth" | "network" | "server" | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string }>({ score: 0, label: "" });

  const validateName = (value: string) => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (value.trim().length > 80) return "Name must be less than 80 characters";
    return null;
  };

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    return null;
  };

  const calculatePasswordStrength = (value: string) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^a-zA-Z0-9]/.test(value)) score += 1;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return { score: Math.min(score, 4), label: labels[Math.min(score, 4)] };
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (value.length > 128) return "Password must be less than 128 characters";
    return null;
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrorType(null);

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (nameErr || emailErr || passwordErr) {
      setNameError(nameErr);
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch<UserPublic>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

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
        } else if (err.status === 409) {
          setErrorType("auth");
          setError("An account with this email already exists. Please sign in instead.");
        } else if (err.status === 401) {
          setErrorType("auth");
          setError("Invalid credentials. Please try again.");
        } else if (err.status >= 500) {
          setErrorType("server");
          setError("Server error. Please try again in a few moments.");
        } else {
          setErrorType("server");
          setError(err.message);
        }
      } else {
        setErrorType("server");
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const strengthColors = ["bg-danger", "bg-danger", "bg-warning", "bg-amber-500", "bg-safe"];
  const strengthWidths = ["w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"];

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
        return "Registration Failed";
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
            Start securing your infrastructure today
          </h2>
          <p className="mt-4 text-body-lg text-ink-muted leading-relaxed">
            Create your free account and get instant access to all eight security
            scanning modules. No credit card required.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-body-md">Free Account</p>
                <p className="text-body-sm text-ink-muted">Full access to all security modules</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                <Lock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-body-md">Instant Scanning</p>
                <p className="text-body-sm text-ink-muted">Run your first scan in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-body-md">Secure & Private</p>
                <p className="text-body-sm text-ink-muted">Your data is encrypted and protected</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-caption text-ink-faint">
          © {new Date().getFullYear()} CyberNexus - BGC Trust University SDP-2
        </p>
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
            <h1 className="font-display text-3xl font-bold">Create your account</h1>
            <p className="mt-2 text-body-md text-ink-muted">
              Join CyberNexus and start protecting your digital assets.
            </p>
          </div>

          <Card variant="elevated" className="mt-8">
            <CardHeader className="pb-2">
              <CardTitle>Create your free account</CardTitle>
              <CardDescription>Start scanning in seconds</CardDescription>
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
                    label="Full name"
                    type="text"
                    autoComplete="name"
                    placeholder="Analyst"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setNameError(null);
                    }}
                    error={nameError || undefined}
                    icon={<User className="h-4.5 w-4.5" />}
                    minLength={1}
                    maxLength={80}
                    required
                    disabled={submitting}
                  />
                </div>

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
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(event) => {
                      const value = event.target.value;
                      setPassword(value);
                      setPasswordError(null);
                      setPasswordStrength(calculatePasswordStrength(value));
                    }}
                    error={passwordError || undefined}
                    icon={<Lock className="h-4.5 w-4.5" />}
                    minLength={8}
                    maxLength={128}
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
                        <span className="text-caption text-ink-faint">Min. 8 characters</span>
                      </div>
                    }
                  />
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-caption font-medium text-ink-muted">Strength</span>
                        <Badge variant="subtle" size="xs" className={cn(passwordStrength.score >= 3 ? "text-safe" : "text-warning")}>
                          {passwordStrength.label}
                        </Badge>
                      </div>
                      <div className="h-1.5 bg-surface-sunken rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-300 ease-out rounded-full",
                            strengthColors[passwordStrength.score],
                            strengthWidths[passwordStrength.score]
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between text-caption text-ink-faint">
                        <span>8+ chars</span>
                        <span>Upper + Lower</span>
                        <span>Numbers</span>
                        <span>Symbols</span>
                        <span>12+ chars</span>
                      </div>
                    </div>
                  )}
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
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <p className="mt-4 text-center text-body-sm text-ink-muted">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="font-medium text-accent hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-accent hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-edge" />
                </div>
                <div className="relative flex justify-center text-body-sm">
                  <span className="bg-surface-raised px-4 text-ink-muted">Already have an account?</span>
                </div>
              </div>

              <Link
                href="/login"
                className="flex h-11 items-center justify-center rounded-xl border border-edge font-semibold text-body-sm transition-all hover:border-accent/60 hover:text-accent hover:bg-surface"
              >
                Sign in to your account
              </Link>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-caption text-ink-faint">
            A Software Development Project at BGC Trust University
          </p>
        </div>
      </div>
    </main>
  );
}