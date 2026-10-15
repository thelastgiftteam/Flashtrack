// Reminders for the team: renewals coming up, overdue payments, pages that
// turned off, trials ending, and Pro uploads not done today.
// Managers see their own brands; admins see every brand.
import { q } from './db';
import { access, todayIST, GRACE_DAYS } from './brands';

const days = n => `${n} day${n === 1 ? '' : 's'}`;

export async function staffAlerts(staff) {
  const today = todayIST();
  const mine = staff.role === 'admin' ? '' : 'where b.manager_id = $2';
  const brands = await q(
    `select b.id, b.code, b.name, b.plan, b.status, b.paid_until, b.created_at, s.name as manager_name,
            exists (select 1 from imports i where i.brand_id = b.id and i.created_at >= ($1::date)::timestamp - interval '5 hours 30 minutes') as uploaded_today
       from brands b left join staff s on s.id = b.manager_id ${mine}`,
    staff.role === 'admin' ? [today] : [today, staff.id]);

  const out = [];
  for (const b of brands) {
    const a = access(b);
    const base = { brandId: b.id, brandName: b.name, code: b.code, manager: b.manager_name };
    if (b.status === 'paused') continue; // paused on purpose: nothing to chase
    if (!a.live && a.daysLeft >= -60) {
      out.push({ ...base, rank: 1, tone: 'red', tab: 'billing', text: a.label === 'Trial ended' ? `Trial ended ${fmt(a.until)}. Page is off.` : `Not renewed. Page is off since ${fmt(a.until)}.` });
    } else if (a.label === 'Overdue') {
      const left = GRACE_DAYS + a.daysLeft;
      out.push({ ...base, rank: 2, tone: 'red', tab: 'billing', text: `Payment overdue. Page turns off ${left <= 0 ? 'tomorrow' : `in ${days(left + 1)}`}.` });
    } else if (a.label === 'Trial' && a.daysLeft <= 3) {
      out.push({ ...base, rank: 3, tone: 'amber', tab: 'billing', text: a.daysLeft === 0 ? 'Trial ends today.' : `Trial ends in ${days(a.daysLeft)}.` });
    } else if (a.label === 'Active' && a.daysLeft <= 7) {
      out.push({ ...base, rank: 4, tone: 'amber', tab: 'billing', text: a.daysLeft === 0 ? 'Renews today.' : `Renews in ${days(a.daysLeft)} (${fmt(a.until)}).`, days: a.daysLeft });
    }
    if (b.plan === 'pro' && a.live && !b.uploaded_today) {
      out.push({ ...base, rank: 5, tone: 'grey', tab: 'add', text: 'Today’s shipments not added yet.' });
    }
  }
  out.sort((x, y) => x.rank - y.rank || (x.days ?? 0) - (y.days ?? 0) || x.brandName.localeCompare(y.brandName));
  return out;
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmt(ymd) { return `${Number(ymd.slice(8, 10))} ${MON[Number(ymd.slice(5, 7)) - 1]}`; }
