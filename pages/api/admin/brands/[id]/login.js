// India Post login a Pro brand shares with us. Stored encrypted; every view is logged.
import { api, str, Problem, canManage } from '../../../../../lib/api';
import { q } from '../../../../../lib/db';
import { encrypt, decrypt } from '../../../../../lib/secrets';
import { logEvent } from '../../../../../lib/brands';
import { loadBrand } from './index';

export default api({
  async GET(req, res, { staff }) {
    const b = await loadBrand(req.query.id);
    if (!canManage(staff, b)) throw new Problem(403, 'Only an admin or this brand’s manager can see this login.');
    await logEvent(b.id, staff.id, 'login-viewed', 'Viewed the India Post login');
    return { username: decrypt(b.po_username), password: decrypt(b.po_password) };
  },
  async PUT(req, res, { staff }) {
    const b = await loadBrand(req.query.id);
    if (!canManage(staff, b)) throw new Problem(403, 'Only an admin or this brand’s manager can change this login.');
    const u = str(req.body?.username, 100), p = String(req.body?.password || '').slice(0, 100);
    await q('update brands set po_username = $2, po_password = $3 where id = $1', [b.id, encrypt(u), encrypt(p)]);
    await logEvent(b.id, staff.id, 'login-saved', u ? 'Saved the India Post login' : 'Removed the India Post login');
    return { ok: true };
  },
}, { auth: 'staff' });
