import { api, str, Problem } from '../../../lib/api';
import { one, q } from '../../../lib/db';
import { checkPassword, hashPassword, passwordProblem } from '../../../lib/auth';

export default api({
  async PATCH(req, res, { user }) {
    const b = req.body || {};
    if (b.name !== undefined) await q('update brand_users set name = $2 where id = $1', [user.id, str(b.name, 80)]);
    if (b.newPassword) {
      const row = await one('select password_hash from brand_users where id = $1', [user.id]);
      if (!checkPassword(b.currentPassword, row.password_hash)) throw new Problem(400, 'Current password is wrong.');
      const err = passwordProblem(b.newPassword);
      if (err) throw new Problem(400, err);
      await q('update brand_users set password_hash = $2 where id = $1', [user.id, hashPassword(b.newPassword)]);
    }
    return { ok: true };
  },
}, { auth: 'user' });
