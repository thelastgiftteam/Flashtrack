// Logins for brand owners (/app) and your team (/admin).
// Passwords: scrypt. Sessions: signed, httpOnly cookies, checked against the
// database on every request so a removed user is logged out at once.
// Env: SESSION_SECRET (any long random string)
import crypto from 'crypto';
import { one, q } from './db';

const USER_COOKIE  = 'ft_u';
const STAFF_COOKIE = 'ft_s';
const USER_DAYS  = 30;
const STAFF_HOURS = 12;

// ── passwords ─────────────────────────────────────────────────────
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function checkPassword(pw, stored) {
  const [kind, salt, hash] = String(stored || '').split('$');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const test = crypto.scryptSync(String(pw), salt, 64);
  const want = Buffer.from(hash, 'hex');
  return want.length === test.length && crypto.timingSafeEqual(want, test);
}

export function passwordProblem(pw) {
  if (String(pw || '').length < 8) return 'Use at least 8 characters for the password.';
  return null;
}

// ── cookies ───────────────────────────────────────────────────────
function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET is not set (needs 16+ characters)');
  return s;
}
function sign(v) { return crypto.createHmac('sha256', secret()).update(v).digest('base64url'); }

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  const m = raw.split(/;\s*/).find(c => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}

function makeToken(id, maxAge) {
  const v = `${id}.${Math.floor(Date.now() / 1000) + maxAge}`;
  return `${v}.${sign(v)}`;
}

function readToken(tok) {
  const parts = String(tok || '').split('.');
  if (parts.length !== 3) return null;
  const v = `${parts[0]}.${parts[1]}`;
  const sig = Buffer.from(parts[2]);
  const want = Buffer.from(sign(v));
  if (sig.length !== want.length || !crypto.timingSafeEqual(sig, want)) return null;
  if (Number(parts[1]) < Date.now() / 1000) return null;
  return parts[0];
}

function cookieHeader(name, value, maxAge) {
  const secure = process.env.NODE_ENV === 'production' && !process.env.INSECURE_COOKIES ? ' Secure;' : '';
  return `${name}=${value}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${maxAge}`;
}

function addCookie(res, c) {
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', prev ? [].concat(prev, c) : c);
}

// ── brand users ───────────────────────────────────────────────────
export function startUserSession(res, userId) {
  const age = USER_DAYS * 86400;
  addCookie(res, cookieHeader(USER_COOKIE, makeToken(userId, age), age));
}
export function endUserSession(res) { addCookie(res, cookieHeader(USER_COOKIE, '', 0)); }

export async function getUser(req) {
  const id = readToken(readCookie(req, USER_COOKIE));
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return null;
  return one('select id, brand_id, email, name from brand_users where id = $1', [id]);
}

// ── staff ─────────────────────────────────────────────────────────
export function startStaffSession(res, staffId) {
  const age = STAFF_HOURS * 3600;
  addCookie(res, cookieHeader(STAFF_COOKIE, makeToken(staffId, age), age));
}
export function endStaffSession(res) { addCookie(res, cookieHeader(STAFF_COOKIE, '', 0)); }

export async function getStaff(req) {
  const id = readToken(readCookie(req, STAFF_COOKIE));
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return null;
  return one('select id, email, name, role from staff where id = $1 and active', [id]);
}

// First admin: if the staff table is empty, logging in with ADMIN_EMAIL and
// ADMIN_PASSWORD (Vercel env) creates that admin. After that the env pair
// does nothing; manage the team from /admin/team.
export async function bootstrapAdmin(email, password) {
  const e = process.env.ADMIN_EMAIL, p = process.env.ADMIN_PASSWORD;
  if (!e || !p) return null;
  if (String(email).trim().toLowerCase() !== e.trim().toLowerCase() || password !== p) return null;
  const count = await one('select count(*)::int as n from staff');
  if (count.n > 0) return null;
  const rows = await q(
    "insert into staff (email, name, role, password_hash) values ($1, 'Admin', 'admin', $2) returning id, email, name, role",
    [e.trim().toLowerCase(), hashPassword(p)],
  );
  return rows[0];
}
