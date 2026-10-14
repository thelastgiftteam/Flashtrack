// ════════════════════════════════════════════════════════════════
// FlashTrack India Post proxy
// Runs on a small VPS with a FIXED IP. That IP is whitelisted in each
// brand's India Post portal. Vercel calls this server; this server is
// the only thing that talks to India Post.
//
// No dependencies. Needs Node 18+ (built-in fetch).
//
// Env vars:
//   PORT            default 8080
//   PROXY_SECRET    shared secret; Vercel sends it in the x-proxy-secret header
//   IP_BASE         India Post base URL
//                   sandbox:    https://test.cept.gov.in/beextcustomer
//                   production: (ask India Post)
//   IP_LOGIN_PATH   default /v1/access/login
//   IP_TRACK_PATH   default /v1/tracking/bulk
//   BRANDS_FILE     default ./brands.json
//
// brands.json maps FlashTrack code → that brand's India Post login:
//   { "728192": { "username": "...", "password": "..." } }
// ════════════════════════════════════════════════════════════════

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT          = Number(process.env.PORT || 8080);
const PROXY_SECRET  = process.env.PROXY_SECRET || '';
const IP_BASE       = (process.env.IP_BASE || '').replace(/\/$/, '');
const IP_LOGIN_PATH = process.env.IP_LOGIN_PATH || '/v1/access/login';
const IP_TRACK_PATH = process.env.IP_TRACK_PATH || '/v1/tracking/bulk';
const BRANDS_FILE   = process.env.BRANDS_FILE || path.join(__dirname, 'brands.json');
const TIMEOUT_MS    = 10000;

if (!PROXY_SECRET || !IP_BASE) {
  console.error('PROXY_SECRET and IP_BASE must be set');
  process.exit(1);
}

// Re-read on every request so adding a brand needs no restart.
function loadBrands() {
  try { return JSON.parse(fs.readFileSync(BRANDS_FILE, 'utf8')); }
  catch (e) { console.error('Cannot read brands file:', e.message); return {}; }
}

const ID_RE   = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
const CODE_RE = /^[A-Za-z0-9_-]{1,40}$/;

// ── Token cache: one per brand. India Post tokens last ~15 min. ──
const tokens = {}; // code → { token, expiresAt }

async function getToken(code, brand) {
  const cached = tokens[code];
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const r = await fetch(IP_BASE + IP_LOGIN_PATH, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username: brand.username, password: brand.password }),
    signal:  AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await r.json().catch(() => ({}));
  const token = body?.data?.access_token;
  if (!r.ok || !token) {
    throw httpError(502, 'India Post login failed (' + r.status + ')');
  }
  // Refresh 60s early. Fall back to 14 min if expires_in is missing.
  const ttlSec = Number(body.data.expires_in) > 120 ? Number(body.data.expires_in) : 900;
  tokens[code] = { token, expiresAt: Date.now() + (ttlSec - 60) * 1000 };
  return token;
}

async function trackOne(code, brand, id) {
  const token = await getToken(code, brand);
  const r = await fetch(IP_BASE + IP_TRACK_PATH, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body:    JSON.stringify({ bulk: [id] }),
    signal:  AbortSignal.timeout(TIMEOUT_MS),
  });
  if (r.status === 401) {
    // Token rejected early. Drop it so the next request logs in fresh.
    delete tokens[code];
    throw httpError(502, 'India Post rejected the session; try again');
  }
  const body = await r.json().catch(() => null);
  if (!r.ok || !body) throw httpError(502, 'India Post tracking error (' + r.status + ')');
  return normalize(id, body);
}

// ── Turn India Post's response into what the page needs ──
function normalize(id, body) {
  // India Post documents two formats: the bulk one (booking_details /
  // tracking_details, from the onboarding doc) and the single-parcel one
  // (trackingNumber / currentStatus / history, from the portal docs).
  // Accept either, so whichever the live API sends still works.
  const list = Array.isArray(body.data) ? body.data : (body.data ? [body.data] : []);
  const items = list.map(d => (d && !d.booking_details && (d.history || d.trackingNumber)) ? fromSingleFormat(d) : d);
  const item = items.find(d => d?.booking_details?.article_number === id) || items[0];
  if (!item) return { found: false, id };

  const b = item.booking_details || {};
  const events = (item.tracking_details || [])
    .map(e => ({
      date:    String(e.date || ''),
      time:    String(e.time || ''),
      office:  String(e.office || ''),
      event:   String(e.event || ''),
      remarks: String(e.remarks || ''),
      rts:     e.rts === true,
    }))
    .sort((a, c) => (a.date < c.date ? 1 : a.date > c.date ? -1 : 0)); // newest first

  const delStatus = String(item?.del_status?.del_status || '').toLowerCase();
  const latest    = (events[0]?.event || '').toLowerCase();
  const delivered = delStatus === 'delivered' || !!b.delivery_confirmed_on || latest === 'item delivered';

  let status = 'In transit';
  if (!events.length)                            status = 'Booked';
  else if (delivered)                            status = 'Delivered';
  else if (events.some(e => e.rts))              status = 'Returning to sender';
  else if (latest.includes('hold'))              status = 'Held at post office';
  else if (latest.includes('out for delivery'))  status = 'Out for delivery';
  else if (latest.includes('booked'))            status = 'Booked';

  return {
    found: true,
    id,
    status,
    delivered,
    booking: {
      bookedAt:           String(b.booked_at || ''),
      bookedOn:           String(b.booked_on || ''),
      originPincode:      String(b.origin_pincode || ''),
      destinationPincode: String(b.destination_pincode || ''),
      articleType:        String(b.article_type || ''),
      deliveryLocation:   String(b.delivery_location || ''),
      deliveredOn:        b.delivery_confirmed_on ? String(b.delivery_confirmed_on) : '',
    },
    events,
    fetchedAt: new Date().toISOString(),
  };
}

// Convert the single-parcel format into the bulk format normalize() reads.
function fromSingleFormat(s) {
  const history = Array.isArray(s.history) ? s.history : [];
  return {
    booking_details: {
      article_number:    String(s.trackingNumber || ''),
      booked_at:         String(s.origin || ''),
      delivery_location: String(s.destination || ''),
    },
    tracking_details: history.map(h => {
      const ts = String(h.timestamp || '');
      const st = String(h.status || '');
      return { date: ts, time: ts.slice(11, 19), office: String(h.location || ''), event: st, remarks: '', rts: /return/i.test(st) };
    }),
    del_status: { del_status: String(s.currentStatus || '').toLowerCase() === 'delivered' ? 'delivered' : '' },
  };
}

function httpError(status, message) {
  const e = new Error(message); e.status = status; return e;
}

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

// Constant-time-ish compare so the secret can't be guessed by timing.
function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && require('crypto').timingSafeEqual(x, y);
}

// ── Webhook receiver: India Post pushes article events here ──
// POST /webhook/booking and /webhook/other. Each event is appended as one JSON
// line to events/YYYY-MM-DD.jsonl (IST date). Nothing is processed yet; the
// file is the record we build alerts from later.
const EVENTS_DIR    = process.env.EVENTS_DIR || path.join(__dirname, 'events');
const WEBHOOK_KINDS = { '/webhook/booking': 'booking', '/webhook/other': 'other' };
const MAX_BODY      = 1024 * 1024; // 1 MB

function istDate() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function handleWebhook(req, res, kind) {
  // The portal's "Test" button may check the URL with GET/HEAD first.
  if (req.method === 'GET' || req.method === 'HEAD') return send(res, 200, { success: true });
  if (req.method !== 'POST') return send(res, 405, { error: 'method not allowed' });

  let size = 0;
  const chunks = [];
  req.on('data', c => {
    size += c.length;
    if (size > MAX_BODY) { send(res, 413, { error: 'too large' }); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => {
    if (res.writableEnded) return;
    const raw = Buffer.concat(chunks).toString('utf8');
    let body;
    try { body = JSON.parse(raw); } catch { body = raw; }
    const line = JSON.stringify({
      received_at: new Date().toISOString(),
      kind,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      body,
    });
    try {
      fs.mkdirSync(EVENTS_DIR, { recursive: true });
      fs.appendFileSync(path.join(EVENTS_DIR, istDate() + '.jsonl'), line + '\n');
    } catch (e) {
      console.error(new Date().toISOString(), 'webhook write failed:', e.message);
      return send(res, 500, { success: false });
    }
    const n = Array.isArray(body) ? body.length : 1;
    console.log(new Date().toISOString(), 'webhook', kind, n, 'event(s)');
    return send(res, 200, { success: true });
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/health') return send(res, 200, { ok: true });
  if (WEBHOOK_KINDS[url.pathname]) return handleWebhook(req, res, WEBHOOK_KINDS[url.pathname]);
  if (req.method !== 'GET' || url.pathname !== '/track') return send(res, 404, { error: 'not found' });
  if (!safeEqual(req.headers['x-proxy-secret'] || '', PROXY_SECRET)) return send(res, 401, { error: 'unauthorized' });

  const code = String(url.searchParams.get('code') || '');
  const id   = String(url.searchParams.get('id') || '').trim().toUpperCase();
  if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad code' });
  if (!ID_RE.test(id))     return send(res, 400, { error: 'bad tracking id' });

  const brand = loadBrands()[code];
  if (!brand?.username || !brand?.password) return send(res, 404, { error: 'brand not set up for India Post' });

  try {
    const result = await trackOne(code, brand, id);
    console.log(new Date().toISOString(), code, id, result.found ? result.status : 'not found');
    return send(res, 200, result);
  } catch (e) {
    console.error(new Date().toISOString(), code, id, e.message);
    return send(res, e.status || 500, { error: e.message });
  }
}).listen(PORT, () => console.log('FlashTrack India Post proxy on :' + PORT));
