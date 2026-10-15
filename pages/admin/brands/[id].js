import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminFrame from '../../../components/console/AdminFrame';
import ImportPanel from '../../../components/console/ImportPanel';
import ShipmentsTable from '../../../components/console/ShipmentsTable';
import PageSettings from '../../../components/console/PageSettings';
import { Card, Stat, Button, Field, Modal, Tabs, Loading, Empty, AccessPill, Pill, call, toast, copy, fmtDate, fmtWhen, rupees } from '../../../components/console/ui';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://flashtrack.io';
const SOURCE = { excel: 'Excel', photo: 'Photo', manual: 'Typed' };

function Overview({ d, staff, reload }) {
  const b = d.brand;
  const [notes, setNotes] = useState(b.notes || '');
  const [reset, setReset] = useState(null);
  const link = `${SITE}/${b.code}`;
  async function saveNotes() {
    try { await call(`/api/admin/brands/${b.id}`, { method: 'PATCH', body: { notes } }); toast('Notes saved'); } catch (e) { toast(e.message, 'err'); }
  }
  async function resetPw(u) {
    if (!window.confirm(`Make a new password for ${u.email}? Their old password stops working.`)) return;
    try { setReset(await call(`/api/admin/brands/${b.id}/reset`, { method: 'POST', body: { userId: u.id } })); reload(); } catch (e) { toast(e.message, 'err'); }
  }
  async function setManager(id) {
    try { await call(`/api/admin/brands/${b.id}`, { method: 'PATCH', body: { managerId: id } }); toast('Manager changed'); reload(); } catch (e) { toast(e.message, 'err'); }
  }
  async function setPlan(plan) {
    try { await call(`/api/admin/brands/${b.id}`, { method: 'PATCH', body: { plan } }); toast('Plan changed'); reload(); } catch (e) { toast(e.message, 'err'); }
  }
  return (
    <div className="fc-stack">
      <div className="fc-grid fc-grid-4">
        <Stat label="Page" value={<AccessPill access={d.access} />} hint={d.access.live ? 'Customers can see it' : 'Customers see “paused”'} />
        <Stat label={d.access.label === 'Trial' ? 'Trial ends' : 'Paid until'} value={<span style={{ fontSize: 20 }}>{fmtDate(d.access.until)}</span>} hint={d.access.daysLeft >= 0 ? `${d.access.daysLeft} days left` : `${-d.access.daysLeft} days ago`} tone={d.access.daysLeft < 0 ? 'red' : undefined} />
        <Stat label="Shipments on file" value={d.stats.total} hint={`${d.stats.today} shipped today`} />
        <Stat label="Last upload" value={<span style={{ fontSize: 20 }}>{fmtWhen(d.imports[0]?.created_at)}</span>} hint={d.imports[0] ? `${d.imports[0].added} added` : ''} />
      </div>
      <div className="fc-grid fc-grid-2">
        <Card title="Details">
          <dl className="fc-kv">
            <dt>Tracking link</dt><dd><a className="fc-link" href={link} target="_blank" rel="noreferrer">{link.replace(/^https?:\/\//, '')}</a> <button className="fc-link fc-small" onClick={() => copy(link)}>Copy</button></dd>
            <dt>Contact</dt><dd>{b.contact_name || '—'}{b.contact_phone ? ` · ${b.contact_phone}` : ''}</dd>
            <dt>Plan</dt><dd>
              <select className="fc-select" style={{ width: 'auto', padding: '5px 8px' }} value={b.plan} onChange={e => setPlan(e.target.value)}>
                <option value="basic">Basic</option><option value="pro">Pro (we upload daily)</option>
              </select></dd>
            <dt>Account manager</dt><dd>
              {staff.role === 'admin' ? (
                <select className="fc-select" style={{ width: 'auto', padding: '5px 8px' }} value={b.manager_id || ''} onChange={e => setManager(e.target.value)}>
                  <option value="">None</option>
                  {(d.team || []).filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
                </select>
              ) : (d.manager?.name || '—')}</dd>
            <dt>Joined</dt><dd>{fmtDate(b.created_at)}</dd>
          </dl>
        </Card>
        <Card title="Logins">
          {d.users.map(u => (
            <div key={u.id} className="fc-row-between" style={{ padding: '6px 0' }}>
              <div><div className="fc-strong">{u.email}</div><div className="fc-small fc-muted">{u.name || 'No name'} · since {fmtDate(u.created_at)}</div></div>
              <Button variant="ghost" size="sm" onClick={() => resetPw(u)}>New password</Button>
            </div>
          ))}
          {reset && (
            <div className="fc-alert is-ok" style={{ marginTop: 10 }}>
              New password for <b>{reset.email}</b>: <span className="fc-mono">{reset.password}</span>{' '}
              <button className="fc-link" onClick={() => copy(`FlashTrack login\nEmail: ${reset.email}\nPassword: ${reset.password}\n${SITE}/login`)}>Copy message</button>
              <div className="fc-small" style={{ marginTop: 4 }}>Shown only once. Send it to the brand.</div>
            </div>
          )}
        </Card>
      </div>
      <Card title="Notes" action={<Button variant="ghost" size="sm" onClick={saveNotes}>Save</Button>}>
        <textarea className="fc-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything the team should know about this brand." />
      </Card>
    </div>
  );
}

function Billing({ d, reload }) {
  const b = d.brand;
  const [f, setF] = useState({ amount: '750', months: '1', method: 'upi', reference: '', paidOn: '' });
  const [busy, setBusy] = useState(false);
  const [until, setUntil] = useState(b.paid_until || '');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function record(e) {
    e.preventDefault(); setBusy(true);
    try {
      const out = await call(`/api/admin/brands/${b.id}/payments`, { method: 'POST', body: f });
      toast(`Payment saved. Paid until ${fmtDate(out.paidUntil)}`);
      setF({ ...f, reference: '' }); reload();
    } catch (e2) { toast(e2.message, 'err'); } finally { setBusy(false); }
  }
  async function pause(on) {
    const msg = on ? 'Pause this page now? Customers will see a “paused, renew your plan” message.' : 'Turn this page back on?';
    if (!window.confirm(msg)) return;
    try { await call(`/api/admin/brands/${b.id}`, { method: 'PATCH', body: { status: on ? 'paused' : (b.paid_until ? 'active' : 'trial') } }); toast(on ? 'Page paused' : 'Page turned on'); reload(); }
    catch (e) { toast(e.message, 'err'); }
  }
  async function saveUntil() {
    try { await call(`/api/admin/brands/${b.id}`, { method: 'PATCH', body: { paidUntil: until } }); toast('Date saved'); reload(); }
    catch (e) { toast(e.message, 'err'); }
  }
  if (!d.canManage) return <div className="fc-alert is-info">Only an admin or this brand’s account manager can see billing.</div>;
  return (
    <div className="fc-stack">
      <div className="fc-grid fc-grid-2">
        <Card title="Record a payment">
          <form className="fc-form" onSubmit={record}>
            <div className="fc-grid fc-grid-2">
              <Field label="Amount (₹)"><input className="fc-input" inputMode="numeric" required value={f.amount} onChange={set('amount')} /></Field>
              <Field label="Months"><select className="fc-select" value={f.months} onChange={set('months')}>{[1, 2, 3, 6, 12].map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
              <Field label="Paid by"><select className="fc-select" value={f.method} onChange={set('method')}><option value="upi">UPI</option><option value="bank">Bank transfer</option><option value="cash">Cash</option><option value="razorpay">Razorpay</option></select></Field>
              <Field label="Date"><input className="fc-input" type="date" value={f.paidOn} onChange={set('paidOn')} /></Field>
            </div>
            <Field label="Reference (optional)" hint="UPI ID, transaction number, anything to find it later."><input className="fc-input" value={f.reference} onChange={set('reference')} /></Field>
            <div><Button type="submit" busy={busy}>Save payment</Button></div>
            <p className="fc-hint">Adds the months to the paid-until date and turns the page on.</p>
          </form>
        </Card>
        <div className="fc-stack">
          <Card title="Page on or off">
            <p style={{ lineHeight: 1.55 }}>{b.status === 'paused'
              ? 'This page is paused by hand. Customers see “paused, renew your plan”.'
              : `Turns off by itself ${3} days after the paid-until date. Pause it now if you need to.`}</p>
            <div style={{ marginTop: 12 }}>{b.status === 'paused'
              ? <Button variant="dark" onClick={() => pause(false)}>Turn page on</Button>
              : <Button variant="danger" onClick={() => pause(true)}>Pause page now</Button>}</div>
          </Card>
          <Card title="Change paid-until date">
            <div className="fc-row"><input className="fc-input" style={{ width: 'auto' }} type="date" value={until} onChange={e => setUntil(e.target.value)} /><Button variant="ghost" onClick={saveUntil}>Save</Button></div>
            <p className="fc-hint" style={{ marginTop: 8 }}>For fixes and free extensions. Recording a payment does this for you.</p>
          </Card>
        </div>
      </div>
      <Card title="Payments" pad={false}>
        {!d.payments.length ? <Empty icon="₹" title="No payments yet" /> : (
          <div className="fc-table-wrap"><table className="fc-table">
            <thead><tr><th>Date</th><th>Amount</th><th>Months</th><th>Paid by</th><th>Reference</th><th>Saved by</th></tr></thead>
            <tbody>{d.payments.map(p => (
              <tr key={p.id}><td>{fmtDate(p.paid_on)}</td><td className="fc-strong">{rupees(p.amount)}</td><td>{p.months}</td><td>{p.method}</td><td className="fc-muted">{p.reference || '—'}</td><td className="fc-muted">{p.staff_name || '—'}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>
    </div>
  );
}

function PostOfficeLogin({ d, reload }) {
  const b = d.brand;
  const [shown, setShown] = useState(null);
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ username: '', password: '' });
  async function reveal() {
    try { setShown(await call(`/api/admin/brands/${b.id}/login`)); } catch (e) { toast(e.message, 'err'); }
  }
  async function save(e) {
    e.preventDefault();
    try { await call(`/api/admin/brands/${b.id}/login`, { method: 'PUT', body: f }); toast('Saved'); setEdit(false); setShown(null); reload(); }
    catch (e2) { toast(e2.message, 'err'); }
  }
  if (!d.canManage) return <div className="fc-alert is-info">Only an admin or this brand’s account manager can see this.</div>;
  return (
    <div style={{ maxWidth: 620 }} className="fc-stack">
      <div className="fc-alert is-info">For Pro brands: we log in to their India Post account, download the day’s file, and add it under “Add shipments”. Saved encrypted. Every time someone views it, it’s written to the activity log.</div>
      <Card title="India Post login">
        {!b.hasPostOfficeLogin && !edit && <Empty icon="🔒" title="No login saved" action={<Button size="sm" onClick={() => setEdit(true)}>Add login</Button>} />}
        {b.hasPostOfficeLogin && !edit && (
          shown ? (
            <dl className="fc-kv">
              <dt>Customer ID / username</dt><dd className="fc-mono">{shown.username} <button className="fc-link fc-small" onClick={() => copy(shown.username)}>Copy</button></dd>
              <dt>Password</dt><dd className="fc-mono">{shown.password} <button className="fc-link fc-small" onClick={() => copy(shown.password)}>Copy</button></dd>
            </dl>
          ) : <div className="fc-row"><Button variant="dark" onClick={reveal}>Show login</Button><Button variant="ghost" onClick={() => setEdit(true)}>Change</Button></div>
        )}
        {edit && (
          <form className="fc-form" onSubmit={save}>
            <Field label="Customer ID / username"><input className="fc-input" autoComplete="off" value={f.username} onChange={e => setF({ ...f, username: e.target.value })} /></Field>
            <Field label="Password"><input className="fc-input" type="password" autoComplete="new-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></Field>
            <div className="fc-row"><Button type="submit">Save</Button><Button variant="ghost" type="button" onClick={() => setEdit(false)}>Cancel</Button></div>
          </form>
        )}
        <div style={{ marginTop: 14 }}><a className="fc-link" href="https://www.indiapost.gov.in/" target="_blank" rel="noreferrer">Open India Post ↗</a></div>
      </Card>
    </div>
  );
}

function Activity({ d, reload }) {
  const [text, setText] = useState('');
  async function add(e) {
    e.preventDefault();
    try { await call(`/api/admin/brands/${d.brand.id}/note`, { method: 'POST', body: { text } }); setText(''); reload(); } catch (e2) { toast(e2.message, 'err'); }
  }
  return (
    <div className="fc-grid fc-grid-2">
      <Card title="Timeline">
        <form className="fc-row" onSubmit={add} style={{ marginBottom: 14 }}>
          <input className="fc-input" style={{ flex: 1 }} placeholder="Add a note, e.g. “Called, will pay Friday”" value={text} onChange={e => setText(e.target.value)} />
          <Button type="submit" size="sm" disabled={!text.trim()}>Add</Button>
        </form>
        {!d.events.length ? <Empty icon="🕑" title="Nothing yet" /> : d.events.map((e, i) => (
          <div key={i} style={{ padding: '9px 0', borderTop: i ? '1px solid #F1F1F3' : 'none' }}>
            <div style={{ fontSize: 14.5 }}>{e.text}</div>
            <div className="fc-small fc-muted">{fmtWhen(e.created_at)}{e.staff_name ? ` · ${e.staff_name}` : ''}</div>
          </div>
        ))}
      </Card>
      <Card title="Uploads" pad={false}>
        {!d.imports.length ? <Empty icon="📄" title="No uploads yet" /> : (
          <div className="fc-table-wrap"><table className="fc-table">
            <thead><tr><th>When</th><th>How</th><th>Added</th><th>By</th></tr></thead>
            <tbody>{d.imports.map((x, i) => (
              <tr key={i}><td className="fc-small" style={{ whiteSpace: 'nowrap' }}>{fmtWhen(x.created_at)}</td><td>{SOURCE[x.source] || x.source}</td><td className="fc-strong">{x.added}{x.skipped ? <span className="fc-muted fc-small"> (+{x.skipped} skipped)</span> : ''}</td><td className="fc-small fc-muted">{x.staff_name ? `Team: ${x.staff_name}` : x.user_email || '—'}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>
    </div>
  );
}

function Danger({ d }) {
  const router = useRouter();
  const [code, setCode] = useState(d.brand.code);
  const [confirm, setConfirm] = useState('');
  const [open, setOpen] = useState(false);
  async function saveCode() {
    try { await call(`/api/admin/brands/${d.brand.id}`, { method: 'PATCH', body: { code } }); toast('Link changed'); router.reload(); } catch (e) { toast(e.message, 'err'); }
  }
  async function del() {
    try { await call(`/api/admin/brands/${d.brand.id}`, { method: 'DELETE', body: { confirm } }); router.replace('/admin/brands'); } catch (e) { toast(e.message, 'err'); }
  }
  return (
    <div className="fc-stack" style={{ maxWidth: 620 }}>
      <Card title="Change the link">
        <p className="fc-hint" style={{ marginBottom: 10 }}>The old link stops working. Only do this before the brand has shared it.</p>
        <div className="fc-row"><span className="fc-muted">{SITE.replace(/^https?:\/\//, '')}/</span><input className="fc-input" style={{ width: 180 }} value={code} onChange={e => setCode(e.target.value.toLowerCase())} /><Button variant="ghost" onClick={saveCode} disabled={code === d.brand.code}>Save</Button></div>
      </Card>
      <Card title="Delete brand">
        <p style={{ lineHeight: 1.55 }}>Deletes the brand, its logins, shipments and payment records. This can’t be undone.</p>
        <div style={{ marginTop: 12 }}><Button variant="danger" onClick={() => setOpen(true)}>Delete brand</Button></div>
      </Card>
      {open && (
        <Modal title="Delete this brand?" onClose={() => setOpen(false)} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" disabled={confirm !== d.brand.name} onClick={del}>Delete for good</Button></>}>
          <Field label={`Type ${d.brand.name} to confirm`}><input className="fc-input" value={confirm} onChange={e => setConfirm(e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  );
}

export default function BrandPage() {
  const router = useRouter();
  const { id } = router.query;
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('overview');
  const [n, setN] = useState(0);

  useEffect(() => { if (router.query.tab) setTab(String(router.query.tab)); }, [router.query.tab]);
  useEffect(() => {
    if (!id) return;
    Promise.all([call(`/api/admin/brands/${id}`), call('/api/admin/staff').catch(() => ({ staff: [] }))])
      .then(([x, s]) => { setD({ ...x, team: s.staff }); setErr(''); })
      .catch(e => { if (e.status === 401) router.replace('/admin/login'); else setErr(e.message); });
  }, [id, n, router]);
  const reload = () => setN(x => x + 1);

  return (
    <AdminFrame title={d ? d.brand.name : 'Brand'} subtitle={d ? <>/{d.brand.code} · <AccessPill access={d.access} /> {d.brand.plan === 'pro' && <Pill tone="yellow">Pro</Pill>}</> : null}
      actions={d ? <><a className="fc-btn fc-btn-ghost fc-btn-sm" href={`${SITE}/${d.brand.code}`} target="_blank" rel="noreferrer">Open page ↗</a><Button size="sm" onClick={() => setTab('add')}>＋ Add shipments</Button></> : null}>
      {staff => (
        <>
          <div style={{ marginBottom: 6 }}><Link href="/admin/brands" className="fc-link fc-small">← All brands</Link></div>
          {err && <div className="fc-alert is-err">⚠ {err}</div>}
          {!d && !err && <Loading />}
          {d && (
            <>
              <Tabs value={tab} onChange={setTab} tabs={[
                { value: 'overview', label: 'Overview' },
                { value: 'add', label: 'Add shipments' },
                { value: 'shipments', label: 'Shipments', badge: d.stats.total },
                { value: 'page', label: 'Page' },
                { value: 'billing', label: 'Billing' },
                ...(d.brand.plan === 'pro' ? [{ value: 'po', label: 'India Post login' }] : []),
                { value: 'activity', label: 'Activity' },
                ...(staff.role === 'admin' ? [{ value: 'danger', label: 'Settings' }] : []),
              ]} />
              {tab === 'overview' && <Overview d={d} staff={staff} reload={reload} />}
              {tab === 'add' && <ImportPanel addUrl={`/api/admin/brands/${d.brand.id}/shipments`} ocrUrl="/api/admin/ocr" pageUrl={`${SITE}/${d.brand.code}`} onDone={reload} />}
              {tab === 'shipments' && <ShipmentsTable url={`/api/admin/brands/${d.brand.id}/shipments`} deleteParam="sid" refreshKey={n} />}
              {tab === 'page' && <div style={{ maxWidth: 680 }}><PageSettings brand={d.brand} saveUrl={`/api/admin/brands/${d.brand.id}`} onSaved={reload} /></div>}
              {tab === 'billing' && <Billing d={d} reload={reload} />}
              {tab === 'po' && <PostOfficeLogin d={d} reload={reload} />}
              {tab === 'activity' && <Activity d={d} reload={reload} />}
              {tab === 'danger' && <Danger d={d} />}
            </>
          )}
        </>
      )}
    </AdminFrame>
  );
}
