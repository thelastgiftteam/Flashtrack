import { api, str, Problem } from '../../../../../lib/api';
import { logEvent } from '../../../../../lib/brands';
import { loadBrand } from './index';

export default api({
  async POST(req, res, { staff }) {
    const b = await loadBrand(req.query.id);
    const text = str(req.body?.text, 1000);
    if (!text) throw new Problem(400, 'Write a note first.');
    await logEvent(b.id, staff.id, 'note', text);
    return { ok: true };
  },
}, { auth: 'staff' });
