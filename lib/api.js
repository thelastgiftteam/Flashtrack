// Small wrapper for API routes: picks the handler by method, checks the
// login, and turns thrown errors into clean JSON messages.
import { getUser, getStaff } from './auth';
import { one } from './db';

export class Problem extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function api(handlers, { auth = null } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const fn = handlers[req.method];
    if (!fn) return res.status(405).json({ error: 'Method not allowed' });
    try {
      const ctx = {};
      if (auth === 'user') {
        ctx.user = await getUser(req);
        if (!ctx.user) throw new Problem(401, 'Please log in again.');
        ctx.brand = await one('select * from brands where id = $1', [ctx.user.brand_id]);
        if (!ctx.brand) throw new Problem(401, 'This account is no longer active.');
      }
      if (auth === 'staff' || auth === 'admin') {
        ctx.staff = await getStaff(req);
        if (!ctx.staff) throw new Problem(401, 'Please log in again.');
        if (auth === 'admin' && ctx.staff.role !== 'admin') throw new Problem(403, 'Only admins can do this.');
      }
      const out = await fn(req, res, ctx);
      if (!res.headersSent) res.status(200).json(out ?? { ok: true });
    } catch (e) {
      const status = e.status || 500;
      if (status >= 500) console.error(e);
      if (!res.headersSent) res.status(status).json({ error: status >= 500 ? 'Something went wrong. Please try again.' : e.message });
    }
  };
}

export function str(v, max = 200) {
  return String(v ?? '').trim().slice(0, max);
}

export function email(v) {
  const e = str(v, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new Problem(400, 'Enter a valid email address.');
  return e;
}

// Staff can open every brand; only admins and the brand's own manager can
// see saved India Post logins or extend the paid-until date.
export function canManage(staff, brand) {
  return staff.role === 'admin' || brand.manager_id === staff.id;
}
