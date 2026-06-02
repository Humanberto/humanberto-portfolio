import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs \"your-password\"");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const encoded = `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;

console.log("\nAdd to .env.local / Vercel:\n");
console.log(`ADMIN_PASSWORD_HASH=${encoded}`);
console.log("\nAlso generate a session secret (32+ chars) and encryption key:");
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
console.log(`ADMIN_ENCRYPTION_KEY=${randomBytes(32).toString("base64")}`);
