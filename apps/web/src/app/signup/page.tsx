"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { createAuthClient } from "@/lib/auth/client";
import { authCallbackUrl } from "@/lib/auth/redirect";

function SignupForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/onboarding";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(authError ? "Sign-in failed. Try again." : "");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function oauth(provider: "google" | "github") {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const supabase = createAuthClient();
      const redirectTo = authCallbackUrl(next);
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (err) setError(err.message);
    } catch {
      setError("Auth is not configured. Add Supabase env vars.");
    } finally {
      setLoading(false);
    }
  }

  async function emailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const supabase = createAuthClient();
    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: authCallbackUrl(next),
        },
      });
      if (err) setError(err.message);
      else if (data.session) window.location.href = next;
      else setNotice("Check your email to confirm your account, then sign in.");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else window.location.href = next;
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <Link href="/studio" className="text-xs text-white/50 hover:text-white">
          ← Humanberto Studio
        </Link>
        <h1 className="mt-4 font-display text-2xl">
          {mode === "signup" ? "Create your portfolio" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Sign up with SSO or email. You&apos;ll get your own back office in minutes.
        </p>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void oauth("google")}
            className="w-full rounded-full border border-white/20 py-3 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            Continue with Google
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void oauth("github")}
            className="w-full rounded-full border border-white/20 py-3 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            Continue with GitHub
          </button>
        </div>

        <p className="my-6 text-center text-xs text-white/40">or use email</p>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-2 text-xs ${mode === "signup" ? "bg-white/10" : "text-white/50"}`}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full py-2 text-xs ${mode === "signin" ? "bg-white/10" : "text-white/50"}`}
          >
            Sign in
          </button>
        </div>

        <form onSubmit={emailAuth} className="space-y-3">
          {mode === "signup" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm"
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          {notice && <p className="text-sm text-emerald-300">{notice}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-3 text-sm font-medium text-black disabled:opacity-50"
          >
            {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Platform operator?{" "}
          <Link href="/myoffice/login" className="underline hover:text-white">
            Legacy admin login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="p-10 text-white/60">Loading…</p>}>
      <SignupForm />
    </Suspense>
  );
}
