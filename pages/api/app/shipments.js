// Brand's own shipments: list/search, add (upload, photo, typed), delete.
import { api, str, Problem } from '../../../lib/api';
import { q, one } from '../../../lib/db';
import { saveShipments, refreshPage, todayIST, addDays, SHOW_DAYS } from '../../../lib/brands';
import { cleanTracking, validTracking, titleCase } from '../../../lib/shipmentParse';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export async function listShipments(brandId, query) {
  const s = str(query.q, 60).toLowerCase();
  const page = Math.max(0, parseInt(query.page, 10) || 0);
  const per = 50;
  const where = s
    ? `and (lower(customer_name) like $2 or tracking_id ilike $2 or pincode like $2 or lower(order_ref) like $2)`
    : '';
  const params = s ? [brandId, `%${s}%`] : [brandId];
  // "current" = on the customer page (last SHOW_DAYS days); "past" = older
  const since = addDays(todayIST(), -SHOW_DAYS);
  const range = query.range === 'past' ? `and shipped_on < '${since}'::date` : query.range === 'all' ? '' : `and shipped_on >= '${since}'::date`;
  const rows = await q(
    `select id, tracking_id, customer_name, pincode, order_ref, shipped_on, source, created_at
       from shipments where brand_id = $1 ${range} ${where}
      order by shipped_on desc, id desc limit ${per + 1} offset ${page * per}`, params);
  return { rows: rows.slice(0, per), more: rows.length > per, page };
}

export async function addShipments(res, brand, body, by) {
  // Preview check: which of these are already saved for this brand?
  if (Array.isArray(body?.check)) {
    const ids = body.check.slice(0, 5000).map(cleanTracking).filter(Boolean);
    const found = ids.length ? await q('select tracking_id from shipments where brand_id = $1 and tracking_id = any($2)', [brand.id, ids]) : [];
    return { existing: found.map(r => r.tracking_id) };
  }
  const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 5000) : [];
  if (!rows.length) throw new Problem(400, 'No shipments to add.');
  const source = ['excel', 'photo', 'manual'].includes(body.source) ? body.source : 'manual';
  const out = await saveShipments(brand.id, rows, source, by);
  await refreshPage(res, brand.code);
  return out;
}

// Fix a typo in one shipment
export async function updateShipment(res, brand, id, b = {}) {
  const n = parseInt(id, 10);
  if (!n) throw new Problem(400, 'Missing shipment.');
  const trackingId = cleanTracking(b.trackingId);
  if (!validTracking(trackingId)) throw new Problem(400, 'That tracking number looks wrong.');
  const shippedOn = /^\d{4}-\d{2}-\d{2}$/.test(b.shippedOn || '') ? b.shippedOn : null;
  if (!shippedOn) throw new Problem(400, 'Choose the shipped date.');
  if (shippedOn > todayIST()) throw new Problem(400, 'The shipped date can’t be in the future.');
  const clash = await one('select 1 from shipments where brand_id = $1 and tracking_id = $2 and id <> $3', [brand.id, trackingId, n]);
  if (clash) throw new Problem(409, 'Another shipment already has that tracking number.');
  const row = await one(
    `update shipments set tracking_id = $3, customer_name = $4, pincode = $5, order_ref = $6, shipped_on = $7::date
      where id = $1 and brand_id = $2
      returning id, tracking_id, customer_name, pincode, order_ref, shipped_on, source, created_at`,
    [n, brand.id, trackingId, titleCase(b.name).slice(0, 120), String(b.pincode || '').replace(/\D/g, '').slice(0, 6),
      str(b.orderRef, 60), shippedOn]);
  if (!row) throw new Problem(404, 'Shipment not found.');
  await refreshPage(res, brand.code);
  return { row };
}

export async function deleteShipment(res, brand, id) {
  const n = parseInt(id, 10);
  if (!n) throw new Problem(400, 'Missing shipment.');
  const del = await one('delete from shipments where id = $1 and brand_id = $2 returning id', [n, brand.id]);
  if (!del) throw new Problem(404, 'Shipment not found.');
  await refreshPage(res, brand.code);
  return { ok: true };
}

export default api({
  GET: (req, res, { brand }) => listShipments(brand.id, req.query),
  POST: (req, res, { brand, user }) => addShipments(res, brand, req.body, { userId: user.id }),
  PATCH: (req, res, { brand }) => updateShipment(res, brand, req.query.id, req.body),
  DELETE: (req, res, { brand }) => deleteShipment(res, brand, req.query.id),
}, { auth: 'user' });
