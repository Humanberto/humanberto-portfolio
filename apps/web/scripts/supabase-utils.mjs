import { execSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const webRoot = join(__dirname, "..");
export const repoRoot = join(webRoot, "..", "..");

export function readEnvLocal(key) {
  const envPath = join(webRoot, ".env.local");
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, "utf8");
  const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match?.[1]?.trim() || null;
}

export function projectRefFromUrl(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

export function resolveProjectRef() {
  const fromEnv = projectRefFromUrl(readEnvLocal("NEXT_PUBLIC_SUPABASE_URL"));
  if (fromEnv) return fromEnv;

  const setupPath = join(webRoot, ".supabase-setup.json");
  if (existsSync(setupPath)) {
    const setup = JSON.parse(readFileSync(setupPath, "utf8"));
    if (setup.projectRef) return setup.projectRef;
  }

  return process.env.SUPABASE_PROJECT_REF ?? null;
}

export function upsertEnvLocal(key, value) {
  const envPath = join(webRoot, ".env.local");
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  if (content.length && !content.endsWith("\n")) content += "\n";
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, line);
  } else {
    content += line + "\n";
  }
  writeFileSync(envPath, content, "utf8");
  console.log(`Updated .env.local → ${key}`);
}

export function addVercelEnv(name, value) {
  for (const env of ["production", "preview"]) {
    const result = spawnSync(
      "npx",
      ["vercel", "env", "add", name, env, "--value", value, "--yes"],
      { cwd: repoRoot, encoding: "utf8", shell: true },
    );
    if (result.status !== 0) {
      console.warn(`vercel env add ${name} (${env}) failed — add manually if needed.`);
    } else {
      console.log(`Added Vercel env → ${name} (${env})`);
    }
  }
}

export function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: opts.cwd ?? repoRoot, ...opts });
}

export function createSupabaseApi(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return async function api(path, options = {}) {
    const res = await fetch(`https://api.supabase.com/v1${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers ?? {}) },
    });
    const text = await res.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (!res.ok) {
      throw new Error(`API ${path} failed (${res.status}): ${JSON.stringify(body)}`);
    }
    return body;
  };
}

export async function fetchAnonKey(api, ref) {
  const keys = await api(`/projects/${ref}/api-keys`);
  const anon =
    keys.find((k) => k.name === "anon" || k.name === "anon key")?.api_key ??
    keys.find((k) => k.type === "anon")?.api_key;

  if (anon) return anon;

  const legacy = await api(`/projects/${ref}/api-keys/legacy`);
  if (legacy?.anon) return legacy.anon;

  throw new Error("Could not fetch anon API key.");
}

export function authRedirectUrls(siteUrl) {
  const urls = new Set([
    `${siteUrl}/auth/callback`,
    "https://humanberto.com/auth/callback",
    "https://www.humanberto.com/auth/callback",
    "http://localhost:3000/auth/callback",
    "http://localhost:3001/auth/callback",
    "http://localhost:3005/auth/callback",
    "http://localhost:3006/auth/callback",
    "https://*.vercel.app/auth/callback",
  ]);

  const localSite = readEnvLocal("NEXT_PUBLIC_SITE_URL");
  if (localSite?.startsWith("http://localhost")) {
    urls.add(`${localSite.replace(/\/$/, "")}/auth/callback`);
  }

  return [...urls];
}
