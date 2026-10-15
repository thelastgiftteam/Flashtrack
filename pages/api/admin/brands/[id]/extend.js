// After a brand pays in Razorpay: add months to the paid-until date.
import { api, Problem, canManage } from '../../../../../lib/api';
import { one } from '../../../../../lib/db';
import { refreshPage, todayIST, logEvent } from '../../../../../lib/brands';
import { loadBrand } from './index';

export default api({
  async POST(req, res, { staff }) {
    const b = await loadBrand(req.query.id);
    if (!canManage(staff, b)) throw new Problem(403, 'Only an admin or this brand’s manager can extend the plan.');
    const months = parseInt(req.body?.months, 10);
    if (![1, 3, 6, 12].includes(months)) throw new Problem(400, 'Choose 1, 3, 6 or 12 months.');
    const row = await one(
      `update brands set paid_until = (greatest(coalesce(paid_until, $2::date), $2::date) + ($3 || ' months')::interval)::date,
              status = case when status = 'paused' then 'paused' else 'active' end
        where id = $1 returning paid_until, status`, [b.id, todayIST(), String(months)]);
    await logEvent(b.id, staff.id, 'renewal', `Extended by ${months} month${months > 1 ? 's' : ''} (paid in Razorpay). Paid until ${row.paid_until}`);
    await refreshPage(res, b.code);
    return { ok: true, paidUntil: row.paid_until, status: row.status };
  },
}, { auth: 'staff' });
