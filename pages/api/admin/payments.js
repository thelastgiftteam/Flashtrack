import { api } from '../../../lib/api';
import { q } from '../../../lib/db';

export default api({
  async GET() {
    const payments = await q(
      `select p.id, p.amount, p.months, p.method, p.reference, p.paid_on, b.id as brand_id, b.name as brand_name, s.name as staff_name
         from payments p join brands b on b.id = p.brand_id left join staff s on s.id = p.recorded_by
        order by p.paid_on desc, p.id desc limit 300`);
    return { payments };
  },
}, { auth: 'staff' });
