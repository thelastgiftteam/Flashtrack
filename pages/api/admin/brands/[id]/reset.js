// Brand forgot its password: make a new one and show it once.
import { api, Problem } from '../../../../../lib/api';
import { one } from '../../../../../lib/db';
import { hashPassword } from '../../../../../lib/auth';
import { logEvent } from '../../../../../lib/brands';
import { loadBrand } from './index';
import crypto from 'crypto';

export default api({
  async POST(req, res, { staff }) {
    const b = await loadBrand(req.query.id);
    const u = await one('select id, email from brand_users where id = $1 and brand_id = $2', [req.body?.userId, b.id]);
    if (!u) throw new Problem(404, 'Login not found.');
    const password = crypto.randomBytes(5).toString('hex');
    await one('update brand_users set password_hash = $2 where id = $1 returning id', [u.id, hashPassword(password)]);
    await logEvent(b.id, staff.id, 'password-reset', `New password made for ${u.email}`);
    return { email: u.email, password };
  },
}, { auth: 'staff' });
