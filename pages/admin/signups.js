import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminFrame from '../../components/console/AdminFrame';
import { Card, Button, Modal, Empty, Loading, AccessPill, Tabs, call, toast, fmtWhen } from '../../components/console/ui';
import { STAGES } from '../../lib/leads';

// New signups to call, set up and turn into paying brands.
const waNum = p => { const d = String(p || '').replace(/\D/g, ''); return d.length === 10 ? '91' + d : d; };

function NoteModal({ row, onClose, onSaved }) {
  const [text, setText] = useState('');
  const [stage, setStage] = useState(row.stage === 'new' ? 'called' : row.stage);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      if (text.trim()) await call(`/api/admin/brands/${row.id}/note`, { method: 'POST', body: { text } });
      if (stage !== row.stage && stage !== 'paid') await call(`/api/admin/brands/${row.id}`, { method: 'PATCH', body: { leadStage: stage } });
      toast('Saved'); onSaved();
    } catch (e) { toast(e.message, 'err'); setBusy(false); }
  }
  return (
    <Modal title={`Call notes · ${row.name}`} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button busy={busy} onClick={save} disabled={!text.trim() && stage === row.stage}>Save</Button></>}>
      <div className="fc-form">
        <label className="fc-field"><span className="fc-label">What happened?</span>
          <textarea className="fc-textarea" style={{ minHeight: 110 }} autoFocus value={text} onChange={e => setText(e.target.value)}
            placeholder="e.g. Ships ~300 parcels a month. Will upload tomorrow. Call back Friday." /></label>
        {row.stage !== 'paid' && (
          <label className="fc-field"><span className="fc-label">Move to</span>
            <select className="fc-select" value={stage} onChange={e => setStage(e.target.value)}>
              {STAGES.filter(s => s.value !== 'paid').map(s => <option key={s.value} value={s.value}>{s.label} · {s.hint}</option>)}
            </select></label>
        )}
        {row.stage !== 'paid' && <p className="fc-hint">They move to “Paid” by themselves once you tap +1 month on the brand.</p>}
      </div>
    </Modal>
  );
}

export default function Signups() {
  const [data, setData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [tab, setTab] = useState('new');
  const [who, setWho] = useState('all');
  const [noting, setNoting] = useState(null);
  const [n, setN] = useState(0);
  useEffect(() => { call('/api/admin/signups').then(setData).catch(e => toast(e.message, 'err')); }, [n]);
  useEffect(() => { call('/api/admin/staff').then(d => setStaff(d.staff.filter(s => s.active))).catch(() => {}); }, []);

  async function assign(row, managerId) {
    try { await call(`/api/admin/brands/${row.id}`, { method: 'PATCH', body: { managerId } }); toast('Manager set'); setN(x => x + 1); }
    catch (e) { toast(e.message, 'err'); }
  }

  return (
    <AdminFrame title="Signups" subtitle="Call new brands, help them set up, and turn them into paying customers.">
      {me => {
        if (!data) return <Loading />;
        const mineOnly = list => list.filter(r => who === 'all' || (who === 'mine' ? r.managerId === me.id : !r.managerId));
        const scoped = mineOnly(data.list);
        const count = v => scoped.filter(r => r.stage === v).length;
        const rows = scoped.filter(r => r.stage === tab);
        return (
          <div className="fc-stack">
            <div className="fc-row-between" style={{ gap: 10, flexWrap: 'wrap' }}>
              <Tabs value={tab} onChange={setTab} tabs={STAGES.map(s => ({ value: s.value, label: s.label, badge: count(s.value) || null }))} />
              <select className="fc-select" style={{ width: 'auto' }} value={who} onChange={e => setWho(e.target.value)} aria-label="Whose signups">
                <option value="all">Everyone’s</option>
                <option value="mine">Mine</option>
                <option value="none">No manager yet</option>
              </select>
            </div>
            <Card pad={false}>
              {rows.length === 0 ? (
                <Empty icon={tab === 'new' ? '✓' : '·'} title={tab === 'new' ? 'Everyone has been called' : `No one in “${STAGES.find(s => s.value === tab).label}”`}>
                  Signups from the last 120 days show here.
                </Empty>
              ) : (
                <div className="fc-table-wrap">
                  <table className="fc-table fc-cards fc-leads">
                    <thead><tr><th>Brand</th><th>Contact</th><th>Using it?</th><th>Trial</th><th>Manager</th><th>Last note</th><th /></tr></thead>
                    <tbody>
                      {rows.map(r => (
                        <tr key={r.id}>
                          <td className="fc-cards-title">
                            <Link href={`/admin/brands/${r.id}`} className="fc-strong" style={{ color: 'inherit' }}>{r.name}</Link>
                            <div className="fc-small fc-muted">Signed up {fmtWhen(r.createdAt).replace(/^Just/, 'just')}</div>
                          </td>
                          <td data-label="Contact">
                            {r.contactName && <div>{r.contactName}</div>}
                            {r.email && <div className="fc-small fc-muted" style={{ wordBreak: 'break-all' }}>{r.email}</div>}
                            {r.phone ? (
                              <div className="fc-row" style={{ gap: 6, marginTop: 6 }}>
                                <a className="fc-btn fc-btn-ghost fc-btn-sm" href={`tel:${r.phone}`}>📞 {r.phone}</a>
                                <a className="fc-btn fc-btn-wa fc-btn-sm" href={`https://wa.me/${waNum(r.phone)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                              </div>
                            ) : <div className="fc-small fc-muted">No phone given</div>}
                          </td>
                          <td data-label="Using it?">
                            {r.shipments > 0
                              ? <><div className="fc-strong" style={{ color: '#16884F' }}>✓ {r.shipments} parcels</div>{r.lastImport && <div className="fc-small fc-muted">last added {fmtWhen(r.lastImport).replace(/^Just/, 'just')}</div>}</>
                              : <div className="fc-strong" style={{ color: '#A16207' }}>No parcels yet</div>}
                            <div className="fc-small fc-muted">{r.views} customer{r.views === 1 ? '' : 's'} checked this week</div>
                          </td>
                          <td data-label="Trial"><AccessPill access={r.access} /></td>
                          <td data-label="Manager">
                            {me.role === 'admin' ? (
                              <select className="fc-select" style={{ width: 'auto', minWidth: 130, padding: '6px 10px' }} value={r.managerId || ''} onChange={e => assign(r, e.target.value)}>
                                <option value="">No manager</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
                              </select>
                            ) : (r.manager || <span className="fc-muted">No manager</span>)}
                          </td>
                          <td data-label="Last note" style={{ maxWidth: 260 }}>
                            {r.lastNote
                              ? <><div className="fc-small" style={{ lineHeight: 1.45 }}>{r.lastNote.text}</div><div className="fc-small fc-muted">{r.lastNote.by} · {fmtWhen(r.lastNote.at)}</div></>
                              : <span className="fc-small fc-muted">—</span>}
                          </td>
                          <td className="fc-cards-actions">
                            <Button size="sm" onClick={() => setNoting(r)}>{r.stage === 'new' ? 'Log call' : 'Add note'}</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            {noting && <NoteModal row={noting} onClose={() => setNoting(null)} onSaved={() => { setNoting(null); setN(x => x + 1); }} />}
          </div>
        );
      }}
    </AdminFrame>
  );
}
