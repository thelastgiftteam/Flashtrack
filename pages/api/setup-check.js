// Open /api/setup-check after changing Vercel settings to see what's missing.
// Shows only yes/no for each setting and a plain-English database message.
// Never shows any secret values.
import { Pool } from 'pg';

const HINTS = [
  [/password authentication failed/i, 'The database password in DATABASE_URL is wrong. Reset it in Supabase (letters and numbers only) and paste it into the address again.'],
  [/tenant or user not found/i, 'The user or project in DATABASE_URL is wrong. Copy the address again from Supabase → Connect → Direct → Transaction pooler.'],
  [/ENOTFOUND|getaddrinfo/i, 'The server name in DATABASE_URL is wrong. Copy the address again from Supabase → Connect.'],
  [/Invalid URL|invalid connection string|URIError|malformed/i, 'DATABASE_URL isn’t a valid address. Check there are no [ ] brackets, spaces, or symbols like / @ # in the password.'],
  [/relation .* does not exist/i, 'Connected, but the tables aren’t there. Run db/schema.sql in the Supabase SQL Editor.'],
  [/timeout|ETIMEDOUT|ECONNREFUSED/i, 'Couldn’t reach the database. Check the address ends in :6543/postgres and the Supabase project isn’t paused.'],
];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const has = k => !!(process.env[k] && String(process.env[k]).trim());
  const settings = {
    DATABASE_URL: has('DATABASE_URL'),
    SESSION_SECRET: has('SESSION_SECRET') && process.env.SESSION_SECRET.length >= 16,
    SECRETS_KEY: has('SECRETS_KEY') && process.env.SECRETS_KEY.length >= 16,
    ADMIN_EMAIL: has('ADMIN_EMAIL'),
    ADMIN_PASSWORD: has('ADMIN_PASSWORD'),
    GEMINI_API_KEY: has('GEMINI_API_KEY'),
  };
  let database = { ok: false, message: 'DATABASE_URL is not set.' };
  if (settings.DATABASE_URL) {
    const url = process.env.DATABASE_URL.trim();
    let pool;
    try {
      if (/\[|\]/.test(url)) throw new Error('malformed: brackets');
      const local = /localhost|127\.0\.0\.1/.test(url);
      pool = new Pool({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 8000 });
      const r = await pool.query('select count(*)::int as staff from staff');
      database = { ok: true, message: `Connected. Tables found. Team members: ${r.rows[0].staff}.` };
    } catch (e) {
      const raw = String(e.message || e).replace(/:\/\/[^@]*@/g, '://***@');
      const hint = (HINTS.find(([re]) => re.test(raw)) || [null, 'Database error. Send this message to Claude.'])[1];
      database = { ok: false, message: hint, detail: raw.slice(0, 200) };
    } finally {
      if (pool) pool.end().catch(() => {});
    }
  }
  const missing = Object.entries(settings).filter(([k, v]) => !v && k !== 'GEMINI_API_KEY').map(([k]) => k);
  res.status(200).json({
    ready: database.ok && missing.length === 0,
    missingSettings: missing,
    settings,
    database,
    note: 'Change a setting in Vercel → Redeploy → reload this page.',
  });
}
