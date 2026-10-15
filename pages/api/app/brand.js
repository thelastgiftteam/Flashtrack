// Brand edits its own customer page settings.
import { api, str, Problem } from '../../../lib/api';
import { one } from '../../../lib/db';
import { refreshPage } from '../../../lib/brands';

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

export function pageFields(b) {
  const out = {};
  if (b.name !== undefined) { out.name = str(b.name, 80); if (!out.name) throw new Problem(400, 'Brand name can’t be empty.'); }
  if (b.whatsapp !== undefined) out.whatsapp = str(b.whatsapp, 20).replace(/[^\d+]/g, '');
  if (b.barText !== undefined) out.bar_text = str(b.barText, 80);
  if (b.showSearch !== undefined) out.show_search = !!b.showSearch;
  if (b.trackingMode !== undefined) out.tracking_mode = b.trackingMode === 'indiapost' ? 'indiapost' : 'speedposttrack';
  if (b.contactName !== undefined) out.contact_name = str(b.contactName, 80);
  if (b.contactPhone !== undefined) out.contact_phone = str(b.contactPhone, 20);
  if (b.logo !== undefined) {
    const l = String(b.logo || '');
    if (l && !/^data:image\/(png|jpeg|webp);base64,/.test(l)) throw new Problem(400, 'Logo must be a PNG, JPG or WebP image.');
    if (l.length > 300000) throw new Problem(400, 'Logo is too big. Use an image under 200 KB.');
    out.logo = l;
  }
  return out;
}

export async function updateBrand(id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return one('select * from brands where id = $1', [id]);
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  return one(`update brands set ${sets} where id = $1 returning *`, [id, ...keys.map(k => fields[k])]);
}

export default api({
  async PATCH(req, res, { brand }) {
    const updated = await updateBrand(brand.id, pageFields(req.body || {}));
    await refreshPage(res, updated.code);
    return { ok: true };
  },
}, { auth: 'user' });
