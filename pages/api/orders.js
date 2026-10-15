// pages/api/orders.js
// Order list for a brand's customer page. Brands in the database are read
// from there; brands still on Google Sheets go through the HQ Apps Script.
// Vercel's CDN keeps each brand's list for 5 minutes, so the Google Sheet is
// read at most about once per 5 minutes per brand, however many customers open
// the page. Shipments are added once a day, so 5 minutes old is fine.

export default async function handler(req, res) {
  const code = String(req.query.code || '').toLowerCase();
  const HQ = process.env.HQ_ENDPOINT;

  if (code && process.env.DATABASE_URL) {
    try {
      const { publicBrand, publicOrders } = await import('../../lib/brands');
      const b = await publicBrand(code);
      if (b) {
        const data = b.suspended ? { orders: [], count: 0, suspended: true } : await publicOrders(b);
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
        return res.status(200).json(data);
      }
    } catch (e) {
      console.error('db orders failed', e);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(500).json({ error: 'database error', orders: [] });
    }
  }

  if (!code || !HQ) {
    return res.status(400).json({ error: 'missing code or HQ not configured', orders: [] });
  }

  try {
    const upstream = await fetch(
      `${HQ}?action=orders&code=${encodeURIComponent(code)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!upstream.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).json({ error: 'upstream error', orders: [] });
    }

    const data = await upstream.json();

    // 5 min fresh; for the next hour visitors still get the cached copy
    // instantly while one background request refreshes it.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: e.message, orders: [] });
  }
}
