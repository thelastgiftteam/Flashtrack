import { api } from '../../../lib/api';
import { staffAlerts } from '../../../lib/alerts';

export default api({
  async GET(req, res, { staff }) {
    const alerts = await staffAlerts(staff);
    return { alerts, urgent: alerts.filter(a => a.tone === 'red').length };
  },
}, { auth: 'staff' });
