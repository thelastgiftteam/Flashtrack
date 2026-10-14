// pages/api/track.js
// Asks the fixed-IP proxy for one parcel's India Post updates.
// Vercel CDN caches each code+id for 10 min, so repeat views and
// shared links don't hit India Post again.
//
// Env vars (Vercel → Settings → Environment Variables):
//   TRACK_PROXY_URL     e.g. https://proxy.flashtrack.io
//   TRACK_PROXY_SECRET  same value as PROXY_SECRET on the VPS

const ID_RE = /^[A-Z]{2}\d{9}[A-Z]{2}$/;

export default async function handler(req, res) {
  const code = String(req.query.code || '');
  const id   = String(req.query.id || '').trim().toUpperCase();
  const PROXY  = process.env.TRACK_PROXY_URL;
  const SECRET = process.env.TRACK_PROXY_SECRET;

  if (!PROXY || !SECRET) return res.status(500).json({ error: 'tracking not configured' });
  if (!code || !ID_RE.test(id)) return res.status(400).json({ error: 'invalid tracking number' });

  try {
    const upstream = await fetch(
      `${PROXY.replace(/\/$/, '')}/track?code=${encodeURIComponent(code)}&id=${encodeURIComponent(id)}`,
      { headers: { 'x-proxy-secret': SECRET }, signal: AbortSignal.timeout(15000) }
    );
    const data = await upstream.json().catch(() => ({ error: 'bad response from tracking server' }));

    if (!upstream.ok) {
      // Don't cache failures for long, so a fix shows up quickly.
      res.setHeader('Cache-Control', 's-maxage=30');
      return res.status(upstream.status === 404 ? 404 : 502).json({ error: data.error || 'tracking unavailable' });
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(504).json({ error: 'tracking server timed out' });
  }
}
