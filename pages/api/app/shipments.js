// Brand's own shipments: list/search, add (upload, photo, typed), delete.
import { api, str, Problem } from '../../../lib/api';
import { q, one } from '../../../lib/db';
import { saveShipments, refreshPage } from '../../../lib/brands';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export async function listShipments(brandId, query) {
  const s = str(query.q, 60).toLowerCase();
  const page = Math.max(0, parseInt(query.page, 10) || 0);
  const per = 50;
  const where = s
    ? `and (lower(customer_name) like $2 or tracking_id ilike $2 or pincode like $2 or lower(order_ref) like $2)`
    : '';
  const params = s ? [brandId, `%${s}%`] : [brandId];
  const rows = await q(
    `select id, tracking_id, customer_name, pincode, order_ref, shipped_on, source, created_at
       from shipments where brand_id = $1 ${where}
      order by shipped_on desc, id desc limit ${per + 1} offset ${page * per}`, params);
  return { rows: rows.slice(0, per), more: rows.length > per, page };
}

export async function addShipments(res, brand, body, by) {
  const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 5000) : [];
  if (!rows.length) throw new Problem(400, 'No shipments to add.');
  const source = ['excel', 'photo', 'manual'].includes(body.source) ? body.source : 'manual';
  const out = await saveShipments(brand.id, rows, source, by);
  await refreshPage(res, brand.code);
  return out;
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
  DELETE: (req, res, { brand }) => deleteShipment(res, brand, req.query.id),
}, { auth: 'user' });
