import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminFrame from '../../../components/console/AdminFrame';
import { Card, Button, Field, Modal, Empty, Loading, AccessPill, Pill, call, copy, fmtDate, fmtWhen } from '../../../components/console/ui';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://flashtrack.io';

function AddBrand({ staff, onClose, onAdded }) {
  const [f, setF] = useState({ name: '', contactName: '', phone: '', email: '', plan: 'basic', managerId: '', code: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { setDone(await call('/api/admin/brands', { method: 'POST', body: f })); onAdded(); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }
  if (done) {
    const msg = `Your FlashTrack tracking page is ready: ${SITE}/${done.code}\n\nLog in to manage it: ${SITE}/login\nEmail: ${done.login.email}\nPassword: ${done.login.password}\n\nPlease change the password after logging in.`;
    return (
      <Modal title="Brand added" onClose={onClose} footer={<><Button variant="ghost" onClick={() => copy(msg)}>Copy message</Button><a className="fc-btn fc-btn-primary" href={`/admin/brands/${done.id}`}>Open brand</a></>}>
        <p style={{ lineHeight: 1.55 }}>Send these login details to the brand. The password is shown only once.</p>
        <pre style={{ marginTop: 12, background: '#F4F4F5', borderRadius: 12, padding: 14, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14 }}>{msg}</pre>
      </Modal>
    );
  }
  return (
    <Modal title="Add a brand" onClose={onClose} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button form="addbrand" type="submit" busy={busy}>Add brand</Button></>}>
      <form id="addbrand" className="fc-form" onSubmit={submit}>
        <Field label="Brand name"><input className="fc-input" required value={f.name} onChange={set('name')} /></Field>
        <div className="fc-grid fc-grid-2">
          <Field label="Contact person"><input className="fc-input" value={f.contactName} onChange={set('contactName')} /></Field>
          <Field label="WhatsApp number"><input className="fc-input" inputMode="tel" value={f.phone} onChange={set('phone')} /></Field>
        </div>
        <Field label="Login email" hint="The brand logs in with this. We make a password for you to send them."><input className="fc-input" type="email" required value={f.email} onChange={set('email')} /></Field>
        <div className="fc-grid fc-grid-2">
          <Field label="Plan"><select className="fc-select" value={f.plan} onChange={set('plan')}><option value="basic">Basic</option><option value="pro">Pro (we upload daily)</option></select></Field>
          <Field label="Account manager">
            <select className="fc-select" value={f.managerId} onChange={set('managerId')}>
              <option value="">{staff ? 'None' : '…'}</option>
              {(staff || []).filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Link code (optional)" hint="Leave empty for a random 6-digit code. Use this to keep an existing link, e.g. 247235."><input className="fc-input" value={f.code} onChange={set('code')} placeholder="e.g. 247235 or wtframes" /></Field>
        {err && <div className="fc-alert is-err">⚠ {err}</div>}
      </form>
    </Modal>
  );
}

export default function Brands() {
  const router = useRouter();
  const [filters, setFilters] = useState({ q: '', status: '', plan: '', manager: '' });
  const [data, setData] = useState(null);
  const [staff, setStaff] = useState(null);
  const [adding, setAdding] = useState(false);
  const [n, setN] = useState(0);

  useEffect(() => { if (router.query.add) setAdding(true); }, [router.query.add]);
  useEffect(() => { if (router.query.q) setFilters(f => ({ ...f, q: String(router.query.q) })); }, [router.query.q]);
  useEffect(() => { call('/api/admin/staff').then(d => setStaff(d.staff)).catch(() => {}); }, []);
  useEffect(() => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    const t = setTimeout(() => call(`/api/admin/brands?${qs}`).then(setData).catch(() => {}), filters.q ? 250 : 0);
    return () => clearTimeout(t);
  }, [filters, n]);
  const set = k => e => setFilters({ ...filters, [k]: e.target.value });

  return (
    <AdminFrame title="Brands" actions={<Button size="sm" onClick={() => setAdding(true)}>＋ Add brand</Button>}>
      {() => (
        <>
        {adding && <AddBrand staff={staff} onClose={() => { setAdding(false); if (router.query.add) router.replace('/admin/brands'); }} onAdded={() => setN(x => x + 1)} />}
        <Card pad={false}>
          <div className="fc-row" style={{ padding: 14, borderBottom: '1px solid #F1F1F3' }}>
            <input className="fc-input" style={{ flex: '1 1 220px' }} placeholder="Search name, code, phone or email" value={filters.q} onChange={set('q')} />
            <select className="fc-select" style={{ width: 'auto' }} value={filters.status} onChange={set('status')}>
              <option value="">All statuses</option><option value="live">Page on</option><option value="off">Page off</option>
              <option value="Trial">Trial</option><option value="Active">Active</option><option value="Overdue">Overdue</option><option value="Paused">Paused</option>
            </select>
            <select className="fc-select" style={{ width: 'auto' }} value={filters.plan} onChange={set('plan')}>
              <option value="">All plans</option><option value="basic">Basic</option><option value="pro">Pro</option>
            </select>
            <select className="fc-select" style={{ width: 'auto' }} value={filters.manager} onChange={set('manager')}>
              <option value="">All managers</option><option value="me">Mine</option><option value="none">No manager</option>
              {(staff || []).map(s => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
            </select>
          </div>
          {!data && <Loading />}
          {data && !data.brands.length && <Empty icon="▦" title="No brands match" action={<Button size="sm" onClick={() => setAdding(true)}>＋ Add brand</Button>} />}
          {data && data.brands.length > 0 && (
            <div className="fc-table-wrap">
              <table className="fc-table">
                <thead><tr><th>Brand</th><th>Status</th><th>Plan</th><th>Paid until</th><th>Manager</th><th>Last upload</th><th>Shipments</th></tr></thead>
                <tbody>
                  {data.brands.map(b => (
                    <tr key={b.id} className="is-click" onClick={() => router.push(`/admin/brands/${b.id}`)}>
                      <td><div className="fc-strong">{b.name}</div><div className="fc-small fc-muted">/{b.code}{b.contact_phone ? ` · ${b.contact_phone}` : ''}</div></td>
                      <td><AccessPill access={b.access} /></td>
                      <td>{b.plan === 'pro' ? <Pill tone="yellow">Pro</Pill> : <Pill>Basic</Pill>}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(b.access.until)}</td>
                      <td>{b.manager_name || <span className="fc-muted">—</span>}</td>
                      <td className="fc-small" style={{ whiteSpace: 'nowrap' }}>{fmtWhen(b.last_import)}</td>
                      <td>{b.shipments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        </>
      )}
    </AdminFrame>
  );
}
