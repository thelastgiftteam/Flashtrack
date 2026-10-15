import { api, str, Problem } from '../../../lib/api';
import { one } from '../../../lib/db';
import { checkPassword, startUserSession, endUserSession } from '../../../lib/auth';

export default api({
  async POST(req, res) {
    const mail = str(req.body?.email).toLowerCase();
    const u = await one('select id, password_hash from brand_users where email = $1', [mail]);
    if (!u || !checkPassword(req.body?.password, u.password_hash)) {
      throw new Problem(401, 'Email or password is wrong.');
    }
    startUserSession(res, u.id);
    return { ok: true };
  },
  async DELETE(req, res) {
    endUserSession(res);
    return { ok: true };
  },
});
