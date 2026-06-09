"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function MyOfficeLoginWidget({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/myoffice";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/myoffice/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Login failed.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">{badge}</p>
      <h1 className="mt-2 font-display text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-white/60">{subtitle}</p>
      <label className="mt-6 block text-sm text-white/70">
        Password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
        />
      </label>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || !password}
        className="mt-6 w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-black disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
