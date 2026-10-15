// Brand rules in one place: trial and payment status, codes, saving
// shipments, and what the public tracking page gets.
import { q, one, tx } from './db';
import { normalizeRows } from './shipmentParse';

export const TRIAL_DAYS = 14;  // free trial for self-serve signups
export const GRACE_DAYS = 3;   // page stays on this many days after the paid date
export const SHOW_DAYS  = 30;  // customer page shows parcels shipped in the last 30 days
export const KEEP_DAYS  = 180; // after this, shipments are deleted (less personal data kept)

export function todayIST() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export function addDays(ymd, n) {
  const d = new Date(ymd + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
}

// Is the customer page on, and what should the dashboards say?
export function access(brand) {
  const today = todayIST();
  const created = new Date(brand.created_at).toISOString().slice(0, 10);
  const until = brand.paid_until || addDays(created, TRIAL_DAYS);
  const daysLeft = daysBetween(today, until);
  const onTrial = !brand.paid_until;
  if (brand.status === 'paused') return { live: false, label: 'Paused', tone: 'red', until, daysLeft };
  if (daysLeft >= 0) return { live: true, label: onTrial ? 'Trial' : 'Active', tone: onTrial ? 'amber' : 'green', until, daysLeft };
  if (daysLeft >= -GRACE_DAYS) return { live: true, label: 'Overdue', tone: 'amber', until, daysLeft };
  return { live: false, label: onTrial ? 'Trial ended' : 'Expired', tone: 'red', until, daysLeft };
}

export async function newCode() {
  for (let i = 0; i < 50; i++) {
    const code = String(100000 + Math.floor(Math.random() * 900000));
    const taken = await one('select 1 from brands where code = $1', [code]);
    if (!taken) return code;
  }
  throw new Error('Could not create a unique code');
}

const RESERVED = new Set(['app', 'admin', 'api', 'login', 'signup', 'demo', 'ocr', 'brand', 'static', '_next', 'favicon', 'pricing', 'help', 'terms', 'privacy']);
export function validCode(c) {
  const v = String(c || '');
  return /^[a-z0-9-]{3,30}$/.test(v) && !RESERVED.has(v);
}

// Save shipments. Tracking numbers already saved for this brand are skipped.
export async function saveShipments(brandId, rows, source, by = {}) {
  const { ok, bad } = normalizeRows(rows, todayIST());
  let added = 0;
  await tx(async run => {
    for (let i = 0; i < ok.length; i += 500) {
      const part = ok.slice(i, i + 500);
      const ins = await run(
        `insert into shipments (brand_id, tracking_id, customer_name, pincode, order_ref, shipped_on, source)
         select $1, t, n, p, o, d::date, $7
         from unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::text[]) as x(t, n, p, o, d)
         on conflict (brand_id, tracking_id) do nothing
         returning id`,
        [brandId, part.map(r => r.trackingId), part.map(r => r.name), part.map(r => r.pincode),
          part.map(r => r.orderRef), part.map(r => r.shippedOn), source],
      );
      added += ins.length;
    }
    await run(
      'insert into imports (brand_id, source, added, skipped, by_staff, by_user) values ($1, $2, $3, $4, $5, $6)',
      [brandId, source, added, ok.length - added + bad.length, by.staffId || null, by.userId || null],
    );
    await run('delete from shipments where brand_id = $1 and shipped_on < $2::date', [brandId, addDays(todayIST(), -KEEP_DAYS)]);
  });
  return { added, already: ok.length - added, invalid: bad.length, badRows: bad.slice(0, 20) };
}

// speedposttrack.io link, same format the Google Sheet script made
export function sptLink(trackingId) {
  const id = String(trackingId).trim().toLowerCase();
  const carrier = id.toUpperCase().endsWith('IN') ? 'speedpost' : 'dtdc';
  return 'https://speedposttrack.io/tracking-result?d=' + Buffer.from(JSON.stringify({ t: id, c: carrier })).toString('base64');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDay = ymd => `${Number(ymd.slice(8, 10))} ${MONTHS[Number(ymd.slice(5, 7)) - 1]}`;

function waLink(num) {
  const d = String(num || '').replace(/\D/g, '');
  if (!d) return '';
  return 'https://wa.me/' + (d.length === 10 ? '91' + d : d);
}

// What the customer page needs, in the same shape the Google Sheet HQ used.
export async function publicBrand(code) {
  const b = await one('select * from brands where code = $1', [String(code || '').toLowerCase()]);
  if (!b) return null;
  const a = access(b);
  const link = waLink(b.whatsapp);
  return {
    found: true,
    source: 'db',
    code: b.code,
    brandName: b.name,
    logo: b.logo || '',
    showSearch: b.show_search,
    suspended: !a.live,
    bottomBar: {
      mode: link ? 'button' : 'notification',
      text: b.bar_text || (link ? `Questions? Chat with ${b.name} on WhatsApp` : ''),
      link,
      active: !!(b.bar_text || link),
    },
    _id: b.id,
    _trackingMode: b.tracking_mode,
  };
}

export async function publicOrders(brand) {
  const since = addDays(todayIST(), -SHOW_DAYS);
  const rows = await q(
    `select tracking_id, customer_name, pincode, order_ref, shipped_on, created_at
       from shipments where brand_id = $1 and shipped_on >= $2::date
      order by shipped_on desc, id desc limit 3000`,
    [brand._id, since],
  );
  const dayAgo = Date.now() - 86400000;
  let version = 0;
  const orders = rows.map(r => {
    const t = new Date(r.created_at).getTime();
    if (t > version) version = t;
    return {
      orderId: r.order_ref,
      name: r.customer_name || '—',
      pincode: r.pincode,
      trackingId: r.tracking_id,
      trackingLink: brand._trackingMode === 'indiapost' ? '' : sptLink(r.tracking_id),
      shippedOn: fmtDay(r.shipped_on),
      isNew: t > dayAgo,
    };
  });
  return { orders, count: orders.length, version };
}

export async function logEvent(brandId, staffId, kind, text = '') {
  await q('insert into brand_events (brand_id, staff_id, kind, text) values ($1, $2, $3, $4)', [brandId, staffId || null, kind, text]);
}

// Clear the cached customer page so changes show at once
export async function refreshPage(res, code) {
  try { await res.revalidate(`/${code}`); } catch { /* page not built yet: fine */ }
}
