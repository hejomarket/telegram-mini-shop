import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export function createOrderAccessToken() { return randomBytes(32).toString('base64url'); }
export function hashOrderAccessToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
export function verifyOrderAccessToken(token: string, hash?: string | null) {
  if (!hash || !token) return false;
  const a = Buffer.from(hashOrderAccessToken(token));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}
