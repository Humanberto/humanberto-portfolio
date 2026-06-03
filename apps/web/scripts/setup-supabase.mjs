#!/usr/bin/env node
/**
 * Create a Supabase project for humanberto, apply migrations, wire .env.local + Vercel.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."   # https://supabase.com/dashboard/account/tokens
 *   node apps/web/scripts/setup-supabase.mjs
 *
 * Optional:
 *   $env:SUPABASE_ORG_ID = "..."             # skip org auto-pick
 *   $env:SUPABASE_PROJECT_NAME = "humanberto-portfolio"
 *   $env:SUPABASE_REGION = "us-west-1"
 *
 * After setup, run configure-auth.mjs for Supabase Auth (anon key, redirects, OAuth).
 */

import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  addVercelEnv,
  authRedirectUrls,
  createSupabaseApi,
  fetchAnonKey,
  run,
  upsertEnvLocal,
  webRoot,
} from "./supabase-utils.mjs";

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_NAME = process.env.SUPABASE_PROJECT_NAME ?? "humanberto-portfolio";
const REGION = process.env.SUPABASE_REGION ?? "us-west-1";

if (!TOKEN) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN.

1. Open https://supabase.com/dashboard/account/tokens
2. Generate a token (name it "humanberto-setup")
3. Run:

   $env:SUPABASE_ACCESS_TOKEN = "sbp_your_token_here"
   node apps/web/scripts/setup-supabase.mjs
`);
  process.exit(1);
}

const api = createSupabaseApi(TOKEN);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function configureAuth(ref, url) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://humanberto.com").replace(/\/$/, "");
  const anonKey = await fetchAnonKey(api, ref);

  await api(`/projects/${ref}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify({
      site_url: siteUrl,
      additional_redirect_urls: authRedirectUrls(siteUrl),
      disable_signup: false,
      external_email_enabled: true,
      mailer_autoconfirm: true,
    }),
  });

  upsertEnvLocal("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
  upsertEnvLocal("NEXT_PUBLIC_SITE_URL", siteUrl);
  addVercelEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
  addVercelEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
}

async function main() {
  console.log("\n=== Humanberto Supabase setup ===\n");

  // Orgs
  const orgs = await api("/organizations");
  if (!orgs?.length) throw new Error("No Supabase organizations found on this account.");
  const orgId = process.env.SUPABASE_ORG_ID ?? orgs[0].id;
  const orgName = orgs.find((o) => o.id === orgId)?.name ?? orgId;
  console.log(`Using organization: ${orgName}`);

  // Existing project?
  const existing = await api("/projects");
  let project = existing.find(
    (p) => p.name === PROJECT_NAME || p.name?.toLowerCase().includes("humanberto"),
  );

  const dbPass = randomBytes(18).toString("base64url");

  if (project) {
    console.log(`Found existing project: ${project.name} (${project.id})`);
  } else {
    console.log(`Creating project "${PROJECT_NAME}" in ${REGION}…`);
    project = await api("/projects", {
      method: "POST",
      body: JSON.stringify({
        organization_id: orgId,
        name: PROJECT_NAME,
        region: REGION,
        db_pass: dbPass,
      }),
    });
    console.log(`Created project ref: ${project.id}`);
  }

  const ref = project.id;

  // Wait until healthy
  console.log("Waiting for project to become active…");
  for (let i = 0; i < 60; i++) {
    const status = await api(`/projects/${ref}`);
    const state = status.status ?? status.project?.status;
    console.log(`  status: ${state ?? "unknown"}`);
    if (state === "ACTIVE_HEALTHY" || state === "ACTIVE") break;
    if (state === "INACTIVE" || state === "REMOVED") {
      throw new Error(`Project entered bad state: ${state}`);
    }
    await sleep(5000);
  }

  const url = `https://${ref}.supabase.co`;

  // API keys
  const serviceKey =
    (await api(`/projects/${ref}/api-keys`)).find((k) => k.name === "service_role")?.api_key;

  if (!serviceKey) {
    throw new Error("Could not fetch service_role API key.");
  }

  console.log(`\nProject URL: ${url}`);

  // Link + push migrations
  console.log("\nApplying database migrations…");
  try {
    run(
      `npx supabase link --project-ref ${ref} --password "${dbPass}" --yes`,
      { cwd: webRoot },
    );
  } catch {
    console.log("Link with new password failed — if project already existed, run db push manually.");
    run(`npx supabase link --project-ref ${ref} --yes`, { cwd: webRoot });
  }
  run("npx supabase db push --yes", { cwd: webRoot });

  upsertEnvLocal("NEXT_PUBLIC_SUPABASE_URL", url);
  upsertEnvLocal("SUPABASE_SERVICE_ROLE_KEY", serviceKey);

  console.log("\nConfiguring Supabase Auth…");
  await configureAuth(ref, url);

  // Vercel
  console.log("\nAdding Vercel environment variables…");
  addVercelEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  addVercelEnv("SUPABASE_SERVICE_ROLE_KEY", serviceKey);

  const secretsPath = join(webRoot, ".supabase-setup.json");
  writeFileSync(
    secretsPath,
    JSON.stringify(
      {
        projectRef: ref,
        url,
        region: REGION,
        dbPass: project === existing ? "(existing — password not rotated)" : dbPass,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  console.log(`
=== Done ===

Supabase project: ${PROJECT_NAME}
URL:              ${url}
Migrations:       applied via supabase db push
Local env:        apps/web/.env.local updated
Vercel env:       NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
                  NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL

Next steps:
1. Run: node apps/web/scripts/configure-auth.mjs (OAuth credentials if needed)
2. Redeploy on Vercel (Deployments → Redeploy)
3. Test https://humanberto.com/signup
4. Optional: delete apps/web/.supabase-setup.json after verifying

Service role key is in .env.local only — never commit it.
`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
