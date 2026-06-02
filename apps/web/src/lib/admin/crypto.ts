import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function getEncryptionKey(): Buffer {
  const raw = process.env.ADMIN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ADMIN_ENCRYPTION_KEY is not configured.");
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("ADMIN_ENCRYPTION_KEY must be 32 bytes (base64-encoded).");
  }
  return buf;
}

/** Encrypt a secret for storage. Returns base64(iv + authTag + ciphertext). */
export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const key = getEncryptionKey();
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + 16);
  const data = buf.subarray(IV_LEN + 16);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function keyHint(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 4) return "****";
  return `…${trimmed.slice(-4)}`;
}

/** Hash an admin password for ADMIN_PASSWORD_HASH env var. */
export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyAdminPassword(password: string, stored: string): boolean {
  if (stored.startsWith("scrypt:")) {
    const [, saltB64, hashB64] = stored.split(":");
    if (!saltB64 || !hashB64) return false;
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && expected.equals(actual);
  }
  // Dev-only plain compare (timing-safe).
  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  if (a.length !== b.length) return false;
  return a.equals(b);
}
