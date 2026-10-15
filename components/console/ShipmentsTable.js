import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Empty, Loading, call, toast, fmtDate } from './ui';

// Search, page through and delete shipments. Used by brands and the team.
export default function ShipmentsTable({ url, deleteParam = 'id', refreshKey }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try { setData(await call(`${url}${url.includes('?') ? '&' : '?'}q=${encodeURIComponent(q)}&page=${page}`)); setErr(''); }
    catch (e) { setErr(e.message); }
  }, [url, q, page]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q, refreshKey]);

  async function del(row) {
    if (!window.confirm(`Remove ${row.tracking_id} (${row.customer_name || 'no name'}) from the page?`)) return;
    try {
      await call(`${url}${url.includes('?') ? '&' : '?'}${deleteParam}=${row.id}`, { method: 'DELETE' });
      toast('Removed'); load();
    } catch (e) { toast(e.message, 'err'); }
  }

  return (
    <Card pad={false}>
      <div style={{ padding: 14, borderBottom: '1px solid #F1F1F3' }}>
        <input className="fc-input" placeholder="Search name, pincode, tracking number or order" value={q} onChange={e => { setQ(e.target.value); setPage(0); }} />
      </div>
      {err && <div className="fc-alert is-err" style={{ margin: 14 }}>⚠ {err}</div>}
      {!data && !err && <Loading />}
      {data && data.rows.length === 0 && <Empty icon={q ? '🔍' : '📦'} title={q ? 'Nothing matches that search' : 'No shipments yet'}>{q ? 'Try a different name or number.' : 'Shipments you add show up here.'}</Empty>}
      {data && data.rows.length > 0 && (
        <div className="fc-table-wrap">
          <table className="fc-table">
            <thead><tr><th>Shipped</th><th>Customer</th><th>Pincode</th><th>Tracking number</th><th>Order</th><th>Added by</th><th /></tr></thead>
            <tbody>
              {data.rows.map(r => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.shipped_on)}</td>
                  <td className="fc-strong">{r.customer_name || '—'}</td>
                  <td>{r.pincode || '—'}</td>
                  <td className="fc-mono">{r.tracking_id}</td>
                  <td className="fc-muted">{r.order_ref || '—'}</td>
                  <td className="fc-muted fc-small">{{ excel: 'Excel', photo: 'Photo', manual: 'Typed' }[r.source] || r.source}</td>
                  <td><Button variant="danger" size="sm" onClick={() => del(r)}>Remove</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && (data.page > 0 || data.more) && (
        <div className="fc-row-between" style={{ padding: 14, borderTop: '1px solid #F1F1F3' }}>
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Newer</Button>
          <span className="fc-small fc-muted">Page {page + 1}</span>
          <Button variant="ghost" size="sm" disabled={!data.more} onClick={() => setPage(p => p + 1)}>Older →</Button>
        </div>
      )}
    </Card>
  );
}
