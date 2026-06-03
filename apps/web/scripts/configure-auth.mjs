#!/usr/bin/env node
/**
 * Configure Supabase Auth for Humanberto Studio.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."   # account that owns the project
 *   node apps/web/scripts/configure-auth.mjs
 *
 * If Management API is unavailable, pass the anon key from Dashboard → Settings → API:
 *   node apps/web/scripts/configure-auth.mjs --anon-key "eyJ..."
 *
 * Optional OAuth (Google Cloud + GitHub Developer Settings):
 *   $env:GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET
 *   $env:GITHUB_OAUTH_CLIENT_ID / GITHUB_OAUTH_CLIENT_SECRET
 */

import { spawnSync } from "node:child_process";
import {
  addVercelEnv,
  authRedirectUrls,
  createSupabaseApi,
  fetchAnonKey,
  readEnvLocal,
  resolveProjectRef,
  upsertEnvLocal,
  webRoot,
} from "./supabase-utils.mjs";

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? readEnvLocal("NEXT_PUBLIC_SITE_URL") ?? "https://humanberto.com").replace(/\/$/, "");

function argValue(flag) {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`));
  return hit ? hit.slice(flag.length + 1) : null;
}

function printManualAuthSteps(ref) {
  console.log(`
Manual Supabase Auth setup (Dashboard → Authentication → URL Configuration):
  Site URL:              ${SITE_URL}
  Redirect URLs (add each):
${authRedirectUrls(SITE_URL)
  .map((u) => `    - ${u}`)
  .join("\n")}

Dashboard → Authentication → Providers:
  - Enable Email (confirm email OFF for instant signup, or keep ON + email links)
  - Enable Google / GitHub after creating OAuth apps
  - OAuth redirect URI for both providers:
      https://${ref}.supabase.co/auth/v1/callback

Dashboard → Settings → API:
  - Copy the anon / public key → NEXT_PUBLIC_SUPABASE_ANON_KEY

Then run:
  node apps/web/scripts/configure-auth.mjs --anon-key "YOUR_ANON_KEY"
`);
}

async function applyMigrations() {
  console.log("\nApplying database migrations…");
  const result = spawnSync("node", ["scripts/apply-migrations-pg.mjs"], {
    cwd: webRoot,
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    console.warn("Migration script failed — check .supabase-setup.json db password.");
  }
}

async function main() {
  const ref = resolveProjectRef();
  if (!ref) {
    throw new Error("Could not resolve Supabase project ref. Set NEXT_PUBLIC_SUPABASE_URL in .env.local.");
  }

  console.log(`\n=== Humanberto Auth setup (${ref}) ===\n`);

  const url = readEnvLocal("NEXT_PUBLIC_SUPABASE_URL") ?? `https://${ref}.supabase.co`;
  let anonKey =
    argValue("--anon-key") ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    readEnvLocal("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  let authConfigured = false;

  if (TOKEN) {
    try {
      const api = createSupabaseApi(TOKEN);
      if (!anonKey) {
        anonKey = await fetchAnonKey(api, ref);
        console.log("Fetched anon key from Supabase Management API.");
      }

      const authPatch = {
        site_url: SITE_URL,
        additional_redirect_urls: authRedirectUrls(SITE_URL),
        disable_signup: false,
        external_email_enabled: true,
        mailer_autoconfirm: true,
        external_google_enabled: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID),
        external_github_enabled: Boolean(process.env.GITHUB_OAUTH_CLIENT_ID),
      };

      if (process.env.GOOGLE_OAUTH_CLIENT_ID) {
        authPatch.external_google_client_id = process.env.GOOGLE_OAUTH_CLIENT_ID;
        authPatch.external_google_secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "";
      }
      if (process.env.GITHUB_OAUTH_CLIENT_ID) {
        authPatch.external_github_client_id = process.env.GITHUB_OAUTH_CLIENT_ID;
        authPatch.external_github_secret = process.env.GITHUB_OAUTH_CLIENT_SECRET ?? "";
      }

      console.log("Updating Supabase Auth config via Management API…");
      await api(`/projects/${ref}/config/auth`, {
        method: "PATCH",
        body: JSON.stringify(authPatch),
      });
      authConfigured = true;
      console.log("Auth config updated.");
    } catch (err) {
      console.warn(`Management API failed: ${err.message}`);
      printManualAuthSteps(ref);
    }
  } else {
    console.warn("No SUPABASE_ACCESS_TOKEN — skipping Management API.");
    printManualAuthSteps(ref);
  }

  if (!anonKey) {
    throw new Error(
      "Missing anon key. Pass --anon-key or set NEXT_PUBLIC_SUPABASE_ANON_KEY, then re-run.",
    );
  }

  upsertEnvLocal("NEXT_PUBLIC_SUPABASE_URL", url);
  upsertEnvLocal("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
  if (!readEnvLocal("NEXT_PUBLIC_SITE_URL")) {
    upsertEnvLocal("NEXT_PUBLIC_SITE_URL", SITE_URL);
  }

  console.log("\nSyncing Vercel environment variables…");
  addVercelEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
  addVercelEnv("NEXT_PUBLIC_SITE_URL", SITE_URL);

  await applyMigrations();

  console.log(`
=== Done ===

Local env:  NEXT_PUBLIC_SUPABASE_ANON_KEY → apps/web/.env.local
Vercel env: NEXT_PUBLIC_SUPABASE_ANON_KEY (production + preview)
Auth URLs:  ${authConfigured ? "configured via API" : "configure manually in Supabase Dashboard (see above)"}

Next:
1. Redeploy on Vercel
2. Test https://humanberto.com/signup
`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
