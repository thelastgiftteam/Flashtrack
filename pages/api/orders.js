// Order list for a brand's customer page, from the database.
// Vercel's CDN keeps each brand's list for 5 minutes, so the database is read
// about once per 5 minutes per brand, however many customers open the page.
// Uploads refresh the page itself immediately.
import { publicBrand, publicOrders } from '../../lib/brands';

export default async function handler(req, res) {
  const code = String(req.query.code || '').toLowerCase();
  if (!code || !process.env.DATABASE_URL) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).json({ error: 'missing code', orders: [] });
  }
  try {
    const b = await publicBrand(code);
    if (!b) {
      res.setHeader('Cache-Control', 'public, s-maxage=60');
      return res.status(404).json({ error: 'not found', orders: [] });
    }
    const data = b.suspended ? { orders: [], count: 0, suspended: true } : await publicOrders(b);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (e) {
    console.error('orders failed', e);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: 'database error', orders: [] });
  }
}
