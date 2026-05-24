import crypto from "crypto";

/**
 * Hashes a password and returns a combined salt.hash string.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}.${hash}`;
}

/**
 * Verifies if a password matches a combined salt.hash string.
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  const parts = combinedHash.split(".");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return newHash === hash;
}
