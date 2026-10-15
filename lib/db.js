// Postgres connection (Supabase in production, any Postgres locally).
// Env: DATABASE_URL — use Supabase's "Transaction pooler" connection string
// (port 6543) on Vercel, so many short serverless calls share connections.
import { Pool, types } from 'pg';

// Return DATE columns as 'YYYY-MM-DD' strings, not JS dates (no timezone shifts)
types.setTypeParser(1082, v => v);

let pool = globalThis.__ftPool;

export function hasDb() {
  return !!process.env.DATABASE_URL;
}

function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    const local = /localhost|127\.0\.0\.1/.test(url);
    pool = new Pool({
      connectionString: url,
      max: 3,
      idleTimeoutMillis: 10000,
      ssl: local ? false : { rejectUnauthorized: false },
    });
    globalThis.__ftPool = pool;
  }
  return pool;
}

export async function q(text, params = []) {
  const r = await getPool().query(text, params);
  return r.rows;
}

export async function one(text, params = []) {
  const rows = await q(text, params);
  return rows[0] || null;
}

export async function tx(fn) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    const out = await fn((text, params = []) => client.query(text, params).then(r => r.rows));
    await client.query('commit');
    return out;
  } catch (e) {
    await client.query('rollback').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
