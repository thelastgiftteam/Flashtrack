// One brand: everything on its page in the admin console, and edits.
import { api, str, Problem, canManage } from '../../../../../lib/api';
import { q, one } from '../../../../../lib/db';
import { access, validCode, refreshPage, logEvent, todayIST } from '../../../../../lib/brands';
import { pageFields, updateBrand } from '../../../app/brand';

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

export async function loadBrand(id) {
  if (!/^[0-9a-f-]{36}$/.test(String(id))) throw new Problem(404, 'Brand not found.');
  const b = await one('select * from brands where id = $1', [id]);
  if (!b) throw new Problem(404, 'Brand not found.');
  return b;
}

export default api({
  async GET(req, res, { staff }) {
    const b = await loadBrand(req.query.id);
    const today = todayIST();
    const [users, imports, events, [stats]] = await Promise.all([
      q('select id, email, name, created_at from brand_users where brand_id = $1 order by created_at', [b.id]),
      q(`select i.source, i.added, i.skipped, i.created_at, s.name as staff_name, u.email as user_email
           from imports i left join staff s on s.id = i.by_staff left join brand_users u on u.id = i.by_user
          where i.brand_id = $1 order by i.created_at desc limit 15`, [b.id]),
      q(`select e.kind, e.text, e.created_at, s.name as staff_name from brand_events e left join staff s on s.id = e.staff_id
          where e.brand_id = $1 order by e.created_at desc limit 40`, [b.id]),
      q(`select count(*)::int as total, count(*) filter (where shipped_on = $2::date)::int as today
           from shipments where brand_id = $1`, [b.id, today]),
    ]);
    const manager = b.manager_id ? await one('select id, name from staff where id = $1', [b.manager_id]) : null;
    const { po_password, po_username, ...rest } = b;
    return {
      brand: { ...rest, hasPostOfficeLogin: !!(po_username || po_password) },
      access: access(b), manager, users, imports, events, stats,
      canManage: canManage(staff, b),
    };
  },

  async PATCH(req, res, { staff }) {
    const b = await loadBrand(req.query.id);
    const body = req.body || {};
    const fields = pageFields(body);
    const log = [];
    if (body.status !== undefined) {
      if (!canManage(staff, b)) throw new Problem(403, 'Only an admin or this brand’s manager can pause or resume it.');
      fields.status = ['trial', 'active', 'paused'].includes(body.status) ? body.status : b.status;
      if (fields.status !== b.status) log.push(['status', fields.status === 'paused' ? 'Page paused' : 'Page turned back on']);
    }
    if (body.plan !== undefined) {
      fields.plan = body.plan === 'pro' ? 'pro' : 'basic';
      if (fields.plan !== b.plan) log.push(['plan', `Plan changed to ${fields.plan === 'pro' ? 'Pro' : 'Basic'}`]);
    }
    if (body.managerId !== undefined) {
      if (staff.role !== 'admin') throw new Problem(403, 'Only admins can change the account manager.');
      fields.manager_id = /^[0-9a-f-]{36}$/.test(body.managerId || '') ? body.managerId : null;
      log.push(['manager', 'Account manager changed']);
    }
    if (body.paidUntil !== undefined) {
      if (!canManage(staff, b)) throw new Problem(403, 'Only an admin or this brand’s manager can change the paid date.');
      fields.paid_until = /^\d{4}-\d{2}-\d{2}$/.test(body.paidUntil || '') ? body.paidUntil : null;
      log.push(['billing', `Paid-until date set to ${fields.paid_until || 'none (trial)'}`]);
    }
    if (body.notes !== undefined) fields.notes = str(body.notes, 4000);
    if (body.code !== undefined) {
      if (staff.role !== 'admin') throw new Problem(403, 'Only admins can change the link.');
      const c = str(body.code, 30).toLowerCase();
      if (!validCode(c)) throw new Problem(400, 'Link code: 3 to 30 letters, numbers or dashes.');
      if (c !== b.code && await one('select 1 from brands where code = $1', [c])) throw new Problem(409, 'That link code is taken.');
      fields.code = c;
      if (c !== b.code) log.push(['link', `Link changed from /${b.code} to /${c}`]);
    }
    const updated = await updateBrand(b.id, fields);
    for (const [kind, text] of log) await logEvent(b.id, staff.id, kind, text);
    await refreshPage(res, updated.code);
    if (updated.code !== b.code) await refreshPage(res, b.code);
    return { ok: true };
  },

  async DELETE(req, res, { staff }) {
    if (staff.role !== 'admin') throw new Problem(403, 'Only admins can delete a brand.');
    const b = await loadBrand(req.query.id);
    if (str(req.body?.confirm) !== b.name) throw new Problem(400, 'Type the brand name exactly to confirm.');
    await q('delete from brands where id = $1', [b.id]);
    await refreshPage(res, b.code);
    return { ok: true };
  },
}, { auth: 'staff' });
