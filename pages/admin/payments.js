import Link from 'next/link';
import AdminFrame from '../../components/console/AdminFrame';
import { Card, Stat, Empty, Loading, useData, fmtDate, rupees } from '../../components/console/ui';

export default function Payments() {
  const { data } = useData('/api/admin/payments', '/admin/login');
  return (
    <AdminFrame title="Payments" subtitle="Record payments on each brand’s Billing tab.">
      {() => {
        if (!data) return <Loading />;
        const month = new Date().toISOString().slice(0, 7);
        const thisMonth = data.payments.filter(p => String(p.paid_on).startsWith(month)).reduce((s, p) => s + p.amount, 0);
        return (
          <div className="fc-stack">
            <div className="fc-grid fc-grid-3">
              <Stat label="This month" value={rupees(thisMonth)} tone="green" />
              <Stat label="Payments shown" value={data.payments.length} hint="Latest 300" />
            </div>
            <Card pad={false}>
              {!data.payments.length ? <Empty icon="₹" title="No payments yet" /> : (
                <div className="fc-table-wrap"><table className="fc-table">
                  <thead><tr><th>Date</th><th>Brand</th><th>Amount</th><th>Months</th><th>Paid by</th><th>Reference</th><th>Saved by</th></tr></thead>
                  <tbody>{data.payments.map(p => (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.paid_on)}</td>
                      <td><Link className="fc-strong" href={`/admin/brands/${p.brand_id}?tab=billing`}>{p.brand_name}</Link></td>
                      <td className="fc-strong">{rupees(p.amount)}</td><td>{p.months}</td><td>{p.method}</td>
                      <td className="fc-muted">{p.reference || '—'}</td><td className="fc-muted">{p.staff_name || '—'}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              )}
            </Card>
          </div>
        );
      }}
    </AdminFrame>
  );
}
