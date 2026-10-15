// All brands (with filters), and creating a brand for a business by hand.
import { api, str, email, Problem } from '../../../../lib/api';
import { q, one, tx } from '../../../../lib/db';
import { access, newCode, validCode } from '../../../../lib/brands';
import { hashPassword } from '../../../../lib/auth';
import crypto from 'crypto';

export default api({
  async GET(req, res, { staff }) {
    const s = str(req.query.q, 60).toLowerCase();
    const params = [];
    let where = 'true';
    if (s) { params.push(`%${s}%`); where += ` and (lower(b.name) like $${params.length} or b.code like $${params.length} or lower(b.contact_phone) like $${params.length} or exists (select 1 from brand_users u where u.brand_id = b.id and u.email like $${params.length}))`; }
    if (req.query.plan === 'pro' || req.query.plan === 'basic') { params.push(req.query.plan); where += ` and b.plan = $${params.length}`; }
    if (req.query.manager === 'me') { params.push(staff.id); where += ` and b.manager_id = $${params.length}`; }
    else if (req.query.manager === 'none') where += ' and b.manager_id is null';
    else if (/^[0-9a-f-]{36}$/.test(req.query.manager || '')) { params.push(req.query.manager); where += ` and b.manager_id = $${params.length}`; }
    const rows = await q(
      `select b.id, b.code, b.name, b.plan, b.status, b.paid_until, b.created_at, b.contact_name, b.contact_phone,
              b.manager_id, s.name as manager_name,
              (select max(created_at) from imports i where i.brand_id = b.id) as last_import,
              (select count(*)::int from shipments x where x.brand_id = b.id) as shipments
         from brands b left join staff s on s.id = b.manager_id
        where ${where} order by b.created_at desc limit 1000`, params);
    let list = rows.map(b => ({ ...b, access: access(b) }));
    const st = req.query.status;
    if (st === 'live') list = list.filter(b => b.access.live);
    if (st === 'off') list = list.filter(b => !b.access.live);
    if (['Trial', 'Active', 'Overdue', 'Paused'].includes(st)) list = list.filter(b => b.access.label === st);
    return { brands: list };
  },

  async POST(req, res, { staff }) {
    const b = req.body || {};
    const name = str(b.name, 80);
    if (!name) throw new Problem(400, 'Enter the brand name.');
    const mail = email(b.email);
    if (await one('select 1 from brand_users where email = $1', [mail])) throw new Problem(409, 'That email already has a FlashTrack login.');
    let code = str(b.code, 30).toLowerCase();
    if (code) {
      if (!validCode(code)) throw new Problem(400, 'Link code: 3 to 30 letters, numbers or dashes.');
      if (await one('select 1 from brands where code = $1', [code])) throw new Problem(409, 'That link code is taken.');
    } else code = await newCode();
    const tempPassword = crypto.randomBytes(5).toString('hex');
    const phone = str(b.phone, 20).replace(/[^\d+]/g, '');
    const managerId = /^[0-9a-f-]{36}$/.test(b.managerId || '') ? b.managerId : (staff.role === 'manager' ? staff.id : null);
    const brand = await tx(async run => {
      const [br] = await run(
        `insert into brands (code, name, contact_name, contact_phone, whatsapp, plan, manager_id)
         values ($1, $2, $3, $4, $4, $5, $6) returning id, code`,
        [code, name, str(b.contactName, 80), phone, b.plan === 'pro' ? 'pro' : 'basic', managerId]);
      await run('insert into brand_users (brand_id, email, name, password_hash) values ($1, $2, $3, $4)',
        [br.id, mail, str(b.contactName, 80), hashPassword(tempPassword)]);
      await run("insert into brand_events (brand_id, staff_id, kind, text) values ($1, $2, 'created', 'Brand added by the team')", [br.id, staff.id]);
      return br;
    });
    return { ok: true, id: brand.id, code: brand.code, login: { email: mail, password: tempPassword } };
  },
}, { auth: 'staff' });
