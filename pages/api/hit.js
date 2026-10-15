// Counts customer visits and Track taps on a brand's page.
// The page sends one of these per phone per day (and per Track tap), so it
// stays cheap: one small row per brand per day.
import { q } from '../../lib/db';
import { todayIST } from '../../lib/brands';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  const code = String(b?.code || '').toLowerCase().slice(0, 40);
  const col = b?.kind === 'track' ? 'tracks' : 'views';
  if (!code || !process.env.DATABASE_URL) return res.status(204).end();
  try {
    await q(
      `insert into page_stats (brand_id, day, ${col})
       select id, $2::date, 1 from brands where code = $1
       on conflict (brand_id, day) do update set ${col} = page_stats.${col} + 1`,
      [code, todayIST()]);
  } catch (e) {
    // Counting must never break the customer page (e.g. table not created yet)
    console.error('hit failed', e.message);
  }
  return res.status(204).end();
}
