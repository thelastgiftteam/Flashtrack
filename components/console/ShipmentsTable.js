import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Empty, Loading, call, toast, fmtDate } from './ui';

// Search, page through and delete shipments. Used by brands and the team.
export default function ShipmentsTable({ url, deleteParam = 'id', refreshKey, past = false }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState(null); // { id, trackingId, name, pincode, orderRef, shippedOn }
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setData(await call(`${url}${url.includes('?') ? '&' : '?'}q=${encodeURIComponent(q)}&page=${page}`)); setErr(''); }
    catch (e) { setErr(e.message); }
  }, [url, q, page]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q, refreshKey]);

  const qs = p => `${url}${url.includes('?') ? '&' : '?'}${deleteParam}=${p}`;
  function startEdit(r) {
    setEditing({ id: r.id, trackingId: r.tracking_id, name: r.customer_name, pincode: r.pincode, orderRef: r.order_ref, shippedOn: String(r.shipped_on).slice(0, 10) });
  }
  async function saveEdit() {
    setSaving(true);
    try {
      const { row } = await call(qs(editing.id), { method: 'PATCH', body: editing });
      setData(d => ({ ...d, rows: d.rows.map(x => (x.id === row.id ? row : x)) }));
      setEditing(null); toast('Saved. The page is updated.');
    } catch (e) { toast(e.message, 'err'); } finally { setSaving(false); }
  }
  const ed = k => e => setEditing(x => ({ ...x, [k]: e.target.value }));
  const inp = { padding: '6px 8px', fontSize: 14 };

  async function del(row) {
    if (!window.confirm(`Remove ${row.tracking_id} (${row.customer_name || 'no name'}) from the page?`)) return;
    try {
      await call(qs(row.id), { method: 'DELETE' });
      toast('Removed'); load();
    } catch (e) { toast(e.message, 'err'); }
  }

  return (
    <Card pad={false}>
      {past && <div className="fc-alert is-info" style={{ margin: '14px 14px 0' }}>Shipped more than 30 days ago. Customers don’t see these any more. They’re deleted after 180 days.</div>}
      <div style={{ padding: 14, borderBottom: '1px solid #F1F1F3' }}>
        <input className="fc-input" placeholder="Search name, pincode, tracking number or order" value={q} onChange={e => { setQ(e.target.value); setPage(0); }} />
      </div>
      {err && <div className="fc-alert is-err" style={{ margin: 14 }}>⚠ {err}</div>}
      {!data && !err && <Loading />}
      {data && data.rows.length === 0 && <Empty icon={q ? '🔍' : past ? '🗂' : '📦'} title={q ? 'Nothing matches that search' : past ? 'No past shipments yet' : 'No shipments in the last 30 days'}>{q ? 'Try a different name or number.' : past ? 'Shipments move here 30 days after they’re shipped. Customers no longer see them.' : 'Shipments you add show up here.'}</Empty>}
      {data && data.rows.length > 0 && (
        <div className="fc-table-wrap">
          <table className="fc-table fc-cards">
            <thead><tr><th>Shipped</th><th>Customer</th><th>Pincode</th><th>Tracking number</th><th>Order</th><th>Added by</th><th /></tr></thead>
            <tbody>
              {data.rows.map(r => editing && editing.id === r.id ? (
                <tr key={r.id} style={{ background: '#FFFCF0' }}>
                  <td data-label="Shipped"><input className="fc-input" type="date" style={{ ...inp, width: 150 }} value={editing.shippedOn} onChange={ed('shippedOn')} /></td>
                  <td data-label="Customer"><input className="fc-input" style={{ ...inp, minWidth: 150 }} value={editing.name} onChange={ed('name')} autoFocus /></td>
                  <td data-label="Pincode"><input className="fc-input" style={{ ...inp, width: 90 }} inputMode="numeric" value={editing.pincode} onChange={ed('pincode')} /></td>
                  <td data-label="Tracking no."><input className="fc-input fc-mono" style={{ ...inp, minWidth: 150 }} value={editing.trackingId} onChange={e => setEditing(x => ({ ...x, trackingId: e.target.value.toUpperCase() }))} /></td>
                  <td data-label="Order"><input className="fc-input" style={{ ...inp, minWidth: 100 }} value={editing.orderRef} onChange={ed('orderRef')} /></td>
                  <td className="fc-cards-hide" />
                  <td className="fc-cards-actions" style={{ whiteSpace: 'nowrap' }}>
                    <Button size="sm" busy={saving} onClick={saveEdit}>Save</Button>{' '}
                    <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td data-label="Shipped" style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.shipped_on)}</td>
                  <td data-label="Customer" className="fc-strong fc-cards-title">{r.customer_name || '—'}</td>
                  <td data-label="Pincode">{r.pincode || '—'}</td>
                  <td data-label="Tracking no." className="fc-mono">{r.tracking_id}</td>
                  <td data-label="Order" className="fc-muted">{r.order_ref || '—'}</td>
                  <td data-label="Added by" className="fc-muted fc-small">{{ excel: 'Excel', photo: 'Photo', manual: 'Typed' }[r.source] || r.source}</td>
                  <td className="fc-cards-actions" style={{ whiteSpace: 'nowrap' }}>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(r)} disabled={!!editing}>Edit</Button>{' '}
                    <Button variant="danger" size="sm" onClick={() => del(r)} disabled={!!editing}>Remove</Button>
                  </td>
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
