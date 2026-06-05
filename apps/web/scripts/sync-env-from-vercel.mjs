import { upsertEnvLocal } from "./supabase-utils.mjs";

const res = await fetch("https://www.humanberto.com/signup");
const html = await res.text();
const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);

let anonKey = null;
let supabaseUrl = null;

for (const src of scripts) {
  const js = await fetch("https://www.humanberto.com" + src).then((r) => r.text());
  if (!js.includes("supabase.co")) continue;

  const urlMatch = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/);
  if (urlMatch) supabaseUrl = urlMatch[0];

  for (const jwt of js.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) ?? []) {
    try {
      const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
      if (payload.role === "anon" && payload.ref === "cdkmmduedxmpwxwbvwrd") {
        anonKey = jwt;
        break;
      }
    } catch {
      /* skip */
    }
  }
  if (anonKey) break;
}

if (!anonKey || !supabaseUrl) {
  console.error("Could not find production Supabase anon key in deployed bundles.");
  process.exit(1);
}

upsertEnvLocal("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);
upsertEnvLocal("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
console.log("Synced NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from production.");
