/** User-facing copy for OAuth failures surfaced on /signup */
export function describeAuthError(
  error: string | null,
  reason: string | null,
): string | null {
  if (!error) return null;

  if (error === "auth_callback") {
    return "Sign-in could not be completed. Please try again.";
  }

  if (reason === "google_exchange" || /exchange external code/i.test(reason ?? "")) {
    return [
      "Google sign-in failed while Supabase exchanged the authorization code.",
      "Fix: Google Cloud Console → your OAuth client → Authorized redirect URIs must include",
      "https://cdkmmduedxmpwxwbvwrd.supabase.co/auth/v1/callback",
      "(not localhost). Then Supabase Dashboard → Authentication → Google: re-paste Client ID and Secret with no extra spaces.",
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
