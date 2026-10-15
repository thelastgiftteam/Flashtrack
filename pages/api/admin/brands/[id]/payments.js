// Record a payment: extends the paid-until date and turns the page on.
import { api, str, Problem, canManage } from '../../../../../lib/api';
import { tx } from '../../../../../lib/db';
import { refreshPage, todayIST } from '../../../../../lib/brands';
import { loadBrand } from './index';

export default api({
  async POST(req, res, { staff }) {
    const b = await loadBrand(req.query.id);
    if (!canManage(staff, b)) throw new Problem(403, 'Only an admin or this brand’s manager can record payments.');
    const amount = parseInt(req.body?.amount, 10);
    const months = parseInt(req.body?.months, 10);
    if (!(amount > 0)) throw new Problem(400, 'Enter the amount received.');
    if (!(months >= 1 && months <= 36)) throw new Problem(400, 'Months must be between 1 and 36.');
    const paidOn = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.paidOn || '') ? req.body.paidOn : todayIST();
    const method = str(req.body?.method, 20) || 'upi';
    const reference = str(req.body?.reference, 80);
    const today = todayIST();
    const out = await tx(async run => {
      await run('insert into payments (brand_id, amount, months, method, reference, paid_on, recorded_by) values ($1,$2,$3,$4,$5,$6,$7)',
        [b.id, amount, months, method, reference, paidOn, staff.id]);
      // Extend from the later of today and the current paid-until date
      const [row] = await run(
        `update brands set paid_until = (greatest(coalesce(paid_until, $2::date), $2::date) + ($3 || ' months')::interval)::date,
                status = case when status = 'paused' then 'paused' else 'active' end
          where id = $1 returning paid_until, status`, [b.id, today, String(months)]);
      await run("insert into brand_events (brand_id, staff_id, kind, text) values ($1,$2,'payment',$3)",
        [b.id, staff.id, `₹${amount} for ${months} month${months > 1 ? 's' : ''} (${method}${reference ? ', ' + reference : ''}). Paid until ${row.paid_until}`]);
      return row;
    });
    await refreshPage(res, b.code);
    return { ok: true, paidUntil: out.paid_until, status: out.status };
  },
}, { auth: 'staff' });
