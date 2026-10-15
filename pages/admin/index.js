import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminFrame from '../../components/console/AdminFrame';
import { Card, Stat, Empty, AccessPill, Pill, useData, Loading, fmtWhen, fmtDate } from '../../components/console/ui';

function BrandRows({ rows, show, empty }) {
  if (!rows.length) return <Empty icon="✓" title={empty} />;
  return (
    <div className="fc-table-wrap">
      <table className="fc-table">
        <tbody>
          {rows.map(b => (
            <tr key={b.id} className="is-click" onClick={() => { window.location.href = `/admin/brands/${b.id}`; }}>
              <td><div className="fc-strong">{b.name}</div><div className="fc-small fc-muted">/{b.code}{b.manager ? ` · ${b.manager}` : ''}</div></td>
              <td style={{ textAlign: 'right' }}>{show(b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Today() {
  const [mine, setMine] = useState(true);
  const { data } = useData('/api/admin/overview', '/admin/login');
  const [day, setDay] = useState('');
  useEffect(() => { setDay(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })); }, []);
  return (
    <AdminFrame title="Today" subtitle={day}
      actions={<Link href="/admin/brands?add=1" className="fc-btn fc-btn-primary fc-btn-sm">＋ Add brand</Link>}>
      {me => {
        if (!data) return <Loading />;
        const filt = list => (mine && me.role === 'manager' ? list.filter(b => b.managerId === me.id) : list);
        const todo = filt(data.todo);
        const left = todo.filter(b => !b.uploadedToday);
        return (
          <div className="fc-stack">
            <div className="fc-grid fc-grid-4">
              <Stat label="Pages live" value={data.counts.live} hint={`${data.counts.total} brands in total`} />
              <Stat label="On free trial" value={data.counts.trial} />
              <Stat label="Payment due" value={data.counts.overdue + data.counts.off} tone={data.counts.overdue + data.counts.off ? 'red' : undefined} hint={`${data.counts.off} page${data.counts.off === 1 ? '' : 's'} off`} />
              <Stat label="Renewals in 7 days" value={data.renewals.length} hint={`${data.shipmentsToday} shipments added today`} />
            </div>

            {me.role === 'manager' && (
              <div className="fc-row"><label className="fc-toggle" style={{ alignItems: 'center' }}>
                <input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)} /><span className="fc-toggle-ui" />
                <span className="fc-toggle-label">Only my brands</span></label></div>
            )}

            <div className="fc-grid fc-grid-2">
              <Card title={`Pro uploads today${todo.length ? ` · ${todo.length - left.length}/${todo.length} done` : ''}`} pad={false}>
                <BrandRows rows={[...left, ...todo.filter(b => b.uploadedToday)]} empty="No Pro brands yet"
                  show={b => b.uploadedToday ? <Pill tone="green">Done</Pill> : <Pill tone="amber">To do · last {fmtWhen(b.lastImport)}</Pill>} />
              </Card>
              <Card title="Payment due or page off" pad={false}>
                <BrandRows rows={filt(data.problems)} empty="Everyone has paid"
                  show={b => <><AccessPill access={b.access} /><div className="fc-small fc-muted" style={{ marginTop: 3 }}>since {fmtDate(b.access.until)}</div></>} />
              </Card>
              <Card title="Renewals in the next 7 days" action={<a className="fc-link fc-small" href="https://dashboard.razorpay.com/" target="_blank" rel="noreferrer">Razorpay ↗</a>} pad={false}>
                <BrandRows rows={filt(data.renewals)} empty="No renewals this week"
                  show={b => <><AccessPill access={b.access} /><div className="fc-small fc-muted" style={{ marginTop: 3 }}>{b.access.daysLeft === 0 ? 'today' : `in ${b.access.daysLeft} day${b.access.daysLeft > 1 ? 's' : ''}`}</div></>} />
              </Card>
              <Card title="New this week" action={<Link className="fc-link fc-small" href="/admin/signups">All signups →</Link>} pad={false}>
                <BrandRows rows={data.fresh} empty="No new brands this week"
                  show={b => <><AccessPill access={b.access} /><div className="fc-small fc-muted" style={{ marginTop: 3 }}>{b.manager ? b.manager : 'No manager yet'}</div></>} />
              </Card>
            </div>
          </div>
        );
      }}
    </AdminFrame>
  );
}
