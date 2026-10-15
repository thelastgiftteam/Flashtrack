import { api } from '../../../lib/api';
import { staffAlerts } from '../../../lib/alerts';
import { q } from '../../../lib/db';

export default api({
  async GET(req, res, { staff }) {
    const alerts = await staffAlerts(staff);
    let fresh = 0; // signups nobody has called yet (last 30 days, not paid)
    try {
      [{ n: fresh }] = await q(`select count(*)::int as n from brands where lead_stage = 'new' and paid_until is null and created_at >= now() - interval '30 days'`);
    } catch { /* column not added yet */ }
    return { alerts, urgent: alerts.filter(a => a.tone === 'red').length, newSignups: fresh };
  },
}, { auth: 'staff' });
