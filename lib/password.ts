import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    return false;
  }

  const [salt, hashHex] = parts;
  const hashBuffer = Buffer.from(hashHex, "hex");
  const testBuffer = scryptSync(password, salt, 64);

  if (hashBuffer.length !== testBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, testBuffer);
}
