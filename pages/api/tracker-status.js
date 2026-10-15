// Is speedposttrack.io answering? The order list asks this once on load.
// If it's down, "Track parcel" opens the India Post copy-paste sheet instead.
// Cached at the CDN for 5 minutes, so speedposttrack gets at most one check
// per 5 minutes no matter how many customers open the page.
// Set TRACKER_DOWN=1 in Vercel to force the fallback by hand.

export default async function handler(req, res) {
  let up = false;
  if (process.env.TRACKER_DOWN !== '1') {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const r = await fetch('https://speedposttrack.io/', { signal: ctrl.signal, redirect: 'follow' });
      up = r.status < 500;
    } catch {
      up = false;
    } finally {
      clearTimeout(timer);
    }
  }
  res.setHeader('Cache-Control', `public, s-maxage=${up ? 300 : 120}, stale-while-revalidate=60`);
  res.status(200).json({ up });
}
