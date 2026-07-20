import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = 'soia_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = { sub: 'admin'; iat: number; exp: number; nonce: string };

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET);
}

function secret() { return process.env.ADMIN_SESSION_SECRET ?? ''; }
function sign(value: string) { return createHmac('sha256', secret()).update(value).digest('base64url'); }

export async function verifyPassword(password: string) {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? '';
  const [scheme, cost, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !cost || !salt || !hash) return false;
  const derived = (await scrypt(password, Buffer.from(salt, 'base64url'), Number(cost))) as Buffer;
  const expected = Buffer.from(hash, 'base64url');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export async function createPasswordHash(password: string) {
  const salt = randomBytes(16);
  const cost = 64;
  const derived = (await scrypt(password, salt, cost)) as Buffer;
  return `scrypt$${cost}$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function authenticateAdmin(email: string, password: string) {
  if (!isAdminConfigured()) return { ok: false, reason: 'config' as const };
  const emailOk = email.trim().toLowerCase() === process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const passOk = await verifyPassword(password);
  return { ok: emailOk && passOk, reason: 'credentials' as const };
}

export async function createAdminSession() {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub: 'admin', iat: now, exp: now + SESSION_TTL_SECONDS, nonce: randomBytes(16).toString('base64url') };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const token = `${encoded}.${sign(encoded)}`;
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_TTL_SECONDS });
}

export async function readAdminSession() {
  if (!isAdminConfigured()) return null;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature || sign(encoded) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (payload.sub !== 'admin' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export async function requireAdminSession() {
  const session = await readAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}

export async function requireAdminApi() {
  return Boolean(await readAdminSession());
}

export async function deleteAdminSession() {
  (await cookies()).set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}
