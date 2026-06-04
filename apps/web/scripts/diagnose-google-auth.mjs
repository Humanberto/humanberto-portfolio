#!/usr/bin/env node
/**
 * Diagnose Supabase ↔ Google OAuth wiring for Humanberto.
 * Usage: node apps/web/scripts/diagnose-google-auth.mjs
 */

import { resolveProjectRef } from "./supabase-utils.mjs";

const ref = resolveProjectRef() ?? "cdkmmduedxmpwxwbvwrd";
const supabaseOrigin = `https://${ref}.supabase.co`;
const callbackUri = `${supabaseOrigin}/auth/v1/callback`;
const appCallback = "https://www.humanberto.com/auth/callback";

async function main() {
  console.log(`\n=== Google OAuth diagnostics (${ref}) ===\n`);

  const authorizeUrl = new URL(`${supabaseOrigin}/auth/v1/authorize`);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", appCallback);

  const res = await fetch(authorizeUrl, { redirect: "manual" });
  const location = res.headers.get("location");

  if (!location?.includes("accounts.google.com")) {
    console.log("FAIL: Supabase did not redirect to Google.");
    console.log("Status:", res.status, "Location:", location ?? "(none)");
    process.exit(1);
  }

  const googleUrl = new URL(location);
  const clientId = googleUrl.searchParams.get("client_id");
  const redirectUri = googleUrl.searchParams.get("redirect_uri");

  console.log("Supabase Google provider: enabled");
  console.log("Client ID:", clientId ?? "(missing)");
  console.log("Redirect URI sent to Google:", redirectUri ?? "(missing)");

  if (redirectUri !== callbackUri) {
    console.log("\nWARN: Unexpected redirect URI (expected Supabase callback).");
  } else {
    console.log("\nOK: Redirect URI matches Supabase callback.");
  }

  const probe = await fetch(location, { redirect: "manual" });
  const probeLoc = probe.headers.get("location") ?? "";
  if (/redirect_uri_mismatch/i.test(probeLoc)) {
    console.log("\nFAIL: Google rejected redirect URI (redirect_uri_mismatch).");
    console.log("Add this exact URI in Google Cloud → OAuth client → Authorized redirect URIs:");
    console.log(`  ${callbackUri}`);
  } else if (probe.status === 302 || probe.status === 303) {
    console.log("\nOK: Google accepts the redirect URI (sign-in page reachable).");
    console.log(
      "If sign-in still fails with 'Unable to exchange external code', the Client Secret",
      "in Supabase does not match this OAuth client in Google Cloud.",
    );
    console.log("\nFix:");
    console.log("1. Google Cloud → Credentials → OAuth client for this Client ID");
    console.log(`   ${clientId}`);
    console.log("2. Confirm redirect URI above is listed.");
    console.log("3. Create a new Client Secret (or copy the current one carefully).");
    console.log("4. Supabase Dashboard → Authentication → Google");
    console.log("   https://supabase.com/dashboard/project/" + ref + "/auth/providers");
    console.log("5. Re-paste Client ID + Secret (no spaces), Save.");
    console.log("6. Supabase → URL Configuration → Site URL = https://www.humanberto.com");
  } else {
    console.log("\nGoogle probe status:", probe.status);
  }

  const settingsRes = await fetch(`${supabaseOrigin}/auth/v1/settings`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
    },
  });
  if (settingsRes.ok) {
    const settings = await settingsRes.json();
    console.log("\nSupabase auth providers:", settings.external?.google ? "google on" : "google off");
  }

  console.log("");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
