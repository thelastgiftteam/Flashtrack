// The admin home: counts, today's work, renewals, new signups.
import { api } from '../../../lib/api';
import { q } from '../../../lib/db';
import { access, todayIST } from '../../../lib/brands';

export default api({
  async GET(req, res, { staff }) {
    const today = todayIST();
    const brands = await q(
      `select b.id, b.code, b.name, b.plan, b.status, b.paid_until, b.created_at, b.manager_id,
              s.name as manager_name,
              (select max(created_at) from imports i where i.brand_id = b.id) as last_import,
              exists (select 1 from imports i where i.brand_id = b.id and i.created_at >= ($1::date)::timestamp - interval '5 hours 30 minutes') as uploaded_today
         from brands b left join staff s on s.id = b.manager_id
        order by b.name`, [today]);
    const counts = { total: brands.length, live: 0, trial: 0, active: 0, overdue: 0, off: 0, pro: 0 };
    const renewals = [], problems = [], todo = [], fresh = [];
    const weekAgo = Date.now() - 7 * 86400000;
    for (const b of brands) {
      const a = access(b);
      b.access = a;
      if (a.live) counts.live++;
      if (a.label === 'Trial') counts.trial++;
      if (a.label === 'Active') counts.active++;
      if (a.label === 'Overdue') counts.overdue++;
      if (!a.live) counts.off++;
      if (b.plan === 'pro') counts.pro++;
      if (a.live && a.daysLeft >= 0 && a.daysLeft <= 7) renewals.push(b);
      if (a.label === 'Overdue' || (!a.live && a.label !== 'Paused')) problems.push(b);
      if (b.plan === 'pro' && a.live) todo.push(b);
      if (new Date(b.created_at).getTime() > weekAgo) fresh.push(b);
    }
    const [money] = await q(
      `select coalesce(sum(amount) filter (where paid_on >= date_trunc('month', $1::date)), 0)::int as month,
              coalesce(sum(amount) filter (where paid_on = $1::date), 0)::int as today
         from payments`, [today]);
    const [ship] = await q(
      `select count(*)::int as today from shipments where created_at >= ($1::date)::timestamp - interval '5 hours 30 minutes'`, [today]);
    const pick = b => ({ id: b.id, code: b.code, name: b.name, plan: b.plan, access: b.access, manager: b.manager_name, managerId: b.manager_id, lastImport: b.last_import, uploadedToday: b.uploaded_today });
    renewals.sort((a, b) => a.access.daysLeft - b.access.daysLeft);
    return {
      me: staff, counts, money, shipmentsToday: ship.today,
      todo: todo.map(pick), renewals: renewals.map(pick), problems: problems.map(pick), fresh: fresh.map(pick),
    };
  },
}, { auth: 'staff' });
