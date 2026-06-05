/** User-facing copy for OAuth failures surfaced on /signup */
export function describeAuthError(
  error: string | null,
  reason: string | null,
): string | null {
  if (!error) return null;

  if (error === "auth_callback") {
    if (reason) {
      return `Sign-in could not be completed: ${decodeURIComponent(reason.replace(/\+/g, " "))}`;
    }
    return "Sign-in could not be completed. Please try again.";
  }

  if (error === "auth_config") {
    return "Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server.";
  }

  if (reason === "google_exchange" || /exchange external code/i.test(reason ?? "")) {
    return [
      "Google sign-in failed while Supabase exchanged the authorization code.",
      "The redirect URI is usually fine — this almost always means the Client Secret in Supabase",
      "does not match the Google OAuth client (902963027413-…ic4.apps.googleusercontent.com).",
      "Fix: Google Cloud → that OAuth client → create/copy Client Secret.",
      "Then Supabase → Authentication → Google → re-paste Client ID and Secret with no extra spaces.",
      "Redirect URI must be https://cdkmmduedxmpwxwbvwrd.supabase.co/auth/v1/callback.",
      "If the Google app is in Testing mode, add your email under Test users.",
    ].join(" ");
  }

  if (error === "oauth" || error === "server_error") {
    return reason
      ? `Sign-in failed: ${decodeURIComponent(reason.replace(/\+/g, " "))}`
      : "Sign-in failed. Check Supabase Auth logs (Dashboard → Logs → Auth).";
  }

  return "Sign-in failed. Try again or use email instead.";
}
