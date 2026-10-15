// Everything the brand dashboard needs on load.
import { api } from '../../../lib/api';
import { one, q } from '../../../lib/db';
import { access, todayIST, usage, TRIAL_DAYS, GRACE_DAYS } from '../../../lib/brands';

export default api({
  async GET(req, res, { user, brand }) {
    const today = todayIST();
    const [stats] = await q(
      `select count(*)::int as total,
              count(*) filter (where shipped_on = $2::date)::int as today,
              count(*) filter (where shipped_on >= $2::date - 6)::int as week
         from shipments where brand_id = $1`, [brand.id, today]);
    const last = await one('select source, added, created_at from imports where brand_id = $1 order by created_at desc limit 1', [brand.id]);
    const manager = brand.manager_id ? await one('select name, email from staff where id = $1', [brand.manager_id]) : null;
    return {
      user: { name: user.name, email: user.email },
      brand: {
        code: brand.code, name: brand.name, logo: brand.logo, whatsapp: brand.whatsapp, barText: brand.bar_text,
        showSearch: brand.show_search, trackingMode: brand.tracking_mode, plan: brand.plan,
        contactName: brand.contact_name, contactPhone: brand.contact_phone,
      },
      access: access(brand),
      rules: { trialDays: TRIAL_DAYS, graceDays: GRACE_DAYS },
      stats, lastImport: last, manager, usage: await usage(brand.id),
    };
  },
}, { auth: 'user' });
