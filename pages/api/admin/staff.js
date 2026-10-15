// Your team: add admins and account managers, turn access off.
import { api, str, email, Problem } from '../../../lib/api';
import { q, one } from '../../../lib/db';
import { hashPassword, passwordProblem } from '../../../lib/auth';
import crypto from 'crypto';

export default api({
  async GET() {
    const staff = await q(
      `select s.id, s.email, s.name, s.role, s.active, s.created_at,
              (select count(*)::int from brands b where b.manager_id = s.id) as brands
         from staff s order by s.active desc, s.name`);
    return { staff };
  },
  async POST(req, res, { staff: me }) {
    if (me.role !== 'admin') throw new Problem(403, 'Only admins can add team members.');
    const mail = email(req.body?.email);
    if (await one('select 1 from staff where email = $1', [mail])) throw new Problem(409, 'That email is already on the team.');
    const password = crypto.randomBytes(5).toString('hex');
    await q('insert into staff (email, name, role, password_hash) values ($1,$2,$3,$4)',
      [mail, str(req.body?.name, 80), req.body?.role === 'admin' ? 'admin' : 'manager', hashPassword(password)]);
    return { email: mail, password };
  },
  async PATCH(req, res, { staff: me }) {
    const id = req.body?.id;
    const target = await one('select * from staff where id = $1', [id]);
    if (!target) throw new Problem(404, 'Team member not found.');
    const self = target.id === me.id;
    if (!self && me.role !== 'admin') throw new Problem(403, 'Only admins can change other team members.');
    if (req.body.newPassword) {
      const err = passwordProblem(req.body.newPassword);
      if (err) throw new Problem(400, err);
      await q('update staff set password_hash = $2 where id = $1', [id, hashPassword(req.body.newPassword)]);
    }
    if (req.body.name !== undefined) await q('update staff set name = $2 where id = $1', [id, str(req.body.name, 80)]);
    if (me.role === 'admin' && !self) {
      if (req.body.role !== undefined) await q('update staff set role = $2 where id = $1', [id, req.body.role === 'admin' ? 'admin' : 'manager']);
      if (req.body.active !== undefined) await q('update staff set active = $2 where id = $1', [id, !!req.body.active]);
    }
    return { ok: true };
  },
}, { auth: 'staff' });
