#!/usr/bin/env node
/**
 * Apply pending SQL migrations via direct Postgres (when Supabase CLI/Management API unavailable).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const migrationsDir = join(webRoot, "supabase", "migrations");

function loadDbConfig() {
  const setupPath = join(webRoot, ".supabase-setup.json");
  if (!existsSync(setupPath)) {
    throw new Error("Missing .supabase-setup.json — run setup-supabase.mjs first.");
  }
  const setup = JSON.parse(readFileSync(setupPath, "utf8"));
  if (!setup.projectRef || !setup.dbPass || String(setup.dbPass).includes("existing")) {
    throw new Error("Missing db password in .supabase-setup.json");
  }
  return {
    host: `db.${setup.projectRef}.supabase.co`,
    port: 5432,
    user: "postgres",
    password: setup.dbPass,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  };
}

async function main() {
  const client = new pg.Client(loadDbConfig());
  await client.connect();

  await client.query(`
    create table if not exists public.schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const applied = new Set(
    (await client.query("select filename from public.schema_migrations")).rows.map((r) => r.filename),
  );

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip ${file}`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`apply ${file}…`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public.schema_migrations (filename) values ($1)", [file]);
      await client.query("commit");
      console.log(`  ok`);
    } catch (err) {
      await client.query("rollback");
      throw new Error(`${file}: ${err.message}`);
    }
  }

  await client.end();
  console.log("\nAll migrations applied.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
