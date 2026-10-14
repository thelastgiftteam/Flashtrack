// Server-side CSM session: a signed, httpOnly cookie.
// Env vars: CSM_USERNAME, CSM_PASSWORD, CSM_SESSION_SECRET
import crypto from 'crypto';

const COOKIE  = 'csm_session';
const MAX_AGE = 12 * 60 * 60; // 12 hours

function sign(value) {
  return crypto.createHmac('sha256', process.env.CSM_SESSION_SECRET || '').update(value).digest('hex');
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function isConfigured() {
  return !!(process.env.CSM_USERNAME && process.env.CSM_PASSWORD && process.env.CSM_SESSION_SECRET);
}

export function checkLogin(username, password) {
  return isConfigured()
    && safeEqual(String(username || '').trim(), process.env.CSM_USERNAME)
    && safeEqual(String(password || ''), process.env.CSM_PASSWORD);
}

export function setSession(res) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  res.setHeader('Set-Cookie',
    `${COOKIE}=${exp}.${sign(exp)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

export function hasSession(req) {
  if (!isConfigured()) return false;
  const raw = String(req.headers.cookie || '')
    .split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}

// Use at the top of an API route. Returns false (and sends 401) if not logged in.
export function requireCsm(req, res) {
  if (hasSession(req)) return true;
  res.status(401).json({ error: 'not signed in' });
  return false;
}
