// Signups list for calling and onboarding: brands from the last 120 days,
// with who to call, whether they've used the page, and the last note.
import { api } from '../../../lib/api';
import { q } from '../../../lib/db';
import { access, addDays, todayIST } from '../../../lib/brands';
import { stageOf } from '../../../lib/leads';

export default api({
  async GET() {
    const today = todayIST();
    const rows = await q(
      `select b.id, b.code, b.name, b.plan, b.status, b.paid_until, b.created_at, b.lead_stage,
              b.contact_name, b.contact_phone, b.manager_id, s.name as manager_name,
              (select email from brand_users u where u.brand_id = b.id order by created_at limit 1) as email,
              (select count(*)::int from shipments x where x.brand_id = b.id) as shipments,
              (select max(created_at) from imports i where i.brand_id = b.id) as last_import,
              (select e.text || '|' || e.created_at || '|' || coalesce(t.name, t.email, '')
                 from brand_events e left join staff t on t.id = e.staff_id
                where e.brand_id = b.id and e.kind = 'note' order by e.created_at desc limit 1) as last_note
         from brands b left join staff s on s.id = b.manager_id
        where b.created_at >= $1::date
        order by b.created_at desc`, [addDays(today, -120)]);
    let views = new Map();
    try {
      const v = await q(`select brand_id, sum(views)::int as n from page_stats where day >= $1::date group by brand_id`, [addDays(today, -6)]);
      views = new Map(v.map(r => [r.brand_id, r.n]));
    } catch { /* page_stats not created yet */ }
    const list = rows.map(b => {
      const [text, at, by] = b.last_note ? b.last_note.split('|') : [];
      return {
        id: b.id, code: b.code, name: b.name, plan: b.plan, createdAt: b.created_at,
        stage: stageOf(b), access: access(b),
        contactName: b.contact_name, phone: b.contact_phone, email: b.email || '',
        managerId: b.manager_id, manager: b.manager_name,
        shipments: b.shipments, lastImport: b.last_import, views: views.get(b.id) || 0,
        lastNote: text ? { text, at, by } : null,
      };
    });
    return { list };
  },
}, { auth: 'staff' });
