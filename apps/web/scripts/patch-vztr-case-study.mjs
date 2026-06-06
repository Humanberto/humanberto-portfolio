#!/usr/bin/env node
/**
 * Merge the latest vztr-help case study from defaultProjects into bootstrap site_content.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const BOOTSTRAP_TENANT_ID = "00000000-0000-4000-8000-000000000001";

function loadDbConfig() {
  const setupPath = join(webRoot, ".supabase-setup.json");
  if (!existsSync(setupPath)) {
    throw new Error("Missing .supabase-setup.json");
  }
  const setup = JSON.parse(readFileSync(setupPath, "utf8"));
  return {
    host: `db.${setup.projectRef}.supabase.co`,
    port: 5432,
    user: "postgres",
    password: setup.dbPass,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  };
}

async function loadVztrFromSource() {
  const { projects } = await import("../src/content/projects.ts");
  const vztr = projects.find((p) => p.slug === "vztr-help");
  if (!vztr) throw new Error("vztr-help not found in projects.ts");
  return vztr;
}

async function main() {
  const vztr = await loadVztrFromSource();
  const client = new pg.Client(loadDbConfig());
  await client.connect();

  const row = await client.query(
    `select value from site_content where tenant_id = $1 and key = 'projects'`,
    [BOOTSTRAP_TENANT_ID],
  );

  let projects = row.rows[0]?.value;
  if (!Array.isArray(projects) || projects.length === 0) {
    const { projects: defaults } = await import("../src/content/projects.ts");
    projects = defaults;
  } else {
    const idx = projects.findIndex((p) => p?.slug === "vztr-help");
    if (idx >= 0) {
      projects = [...projects];
      projects[idx] = { ...projects[idx], ...vztr, slug: "vztr-help" };
    } else {
      projects = [vztr, ...projects];
    }
  }

  await client.query(
    `insert into site_content (tenant_id, key, value, updated_at)
     values ($1, 'projects', $2::jsonb, now())
     on conflict (tenant_id, key) do update set value = excluded.value, updated_at = now()`,
    [BOOTSTRAP_TENANT_ID, JSON.stringify(projects)],
  );

  await client.end();
  console.log("Updated vztr-help case study for bootstrap tenant.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
