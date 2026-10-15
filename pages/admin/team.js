import { useState, useEffect } from 'react';
import AdminFrame from '../../components/console/AdminFrame';
import { Card, Button, Field, Modal, Pill, Loading, call, toast, copy } from '../../components/console/ui';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://flashtrack.io';

export default function Team() {
  const [list, setList] = useState(null);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', email: '', role: 'manager' });
  const [made, setMade] = useState(null);
  const [pw, setPw] = useState('');
  const [n, setN] = useState(0);
  useEffect(() => { call('/api/admin/staff').then(d => setList(d.staff)).catch(() => {}); }, [n]);

  async function add(e) {
    e.preventDefault();
    try { setMade(await call('/api/admin/staff', { method: 'POST', body: f })); setAdding(false); setF({ name: '', email: '', role: 'manager' }); setN(x => x + 1); }
    catch (e2) { toast(e2.message, 'err'); }
  }
  async function patch(id, body, msg) {
    try { await call('/api/admin/staff', { method: 'PATCH', body: { id, ...body } }); toast(msg); setN(x => x + 1); } catch (e) { toast(e.message, 'err'); }
  }

  return (
    <AdminFrame title="Team" subtitle="Admins see everything. Account managers look after the brands assigned to them.">
      {me => (
        <div className="fc-stack">
          <Card title="People" action={me.role === 'admin' ? <Button size="sm" onClick={() => setAdding(true)}>＋ Add person</Button> : null} pad={false}>
            {!list ? <Loading /> : (
              <div className="fc-table-wrap"><table className="fc-table">
                <thead><tr><th>Name</th><th>Role</th><th>Brands</th><th>Status</th><th /></tr></thead>
                <tbody>{list.map(s => (
                  <tr key={s.id}>
                    <td><div className="fc-strong">{s.name || '—'}{s.id === me.id ? ' (you)' : ''}</div><div className="fc-small fc-muted">{s.email}</div></td>
                    <td>{me.role === 'admin' && s.id !== me.id
                      ? <select className="fc-select" style={{ width: 'auto', padding: '5px 8px' }} value={s.role} onChange={e => patch(s.id, { role: e.target.value }, 'Role changed')}><option value="manager">Account manager</option><option value="admin">Admin</option></select>
                      : (s.role === 'admin' ? 'Admin' : 'Account manager')}</td>
                    <td>{s.brands}</td>
                    <td>{s.active ? <Pill tone="green">Active</Pill> : <Pill tone="grey">No access</Pill>}</td>
                    <td style={{ textAlign: 'right' }}>{me.role === 'admin' && s.id !== me.id && (
                      <Button variant={s.active ? 'danger' : 'ghost'} size="sm" onClick={() => patch(s.id, { active: !s.active }, s.active ? 'Access removed' : 'Access given back')}>{s.active ? 'Remove access' : 'Give access'}</Button>
                    )}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </Card>
          <Card title="Your password">
            <form className="fc-row" onSubmit={e => { e.preventDefault(); patch(me.id, { newPassword: pw }, 'Password changed'); setPw(''); }}>
              <input className="fc-input" style={{ maxWidth: 280 }} type="password" autoComplete="new-password" minLength={8} placeholder="New password (8+ characters)" value={pw} onChange={e => setPw(e.target.value)} />
              <Button type="submit" variant="ghost" disabled={pw.length < 8}>Change</Button>
            </form>
          </Card>
          {adding && (
            <Modal title="Add a team member" onClose={() => setAdding(false)} footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button form="addstaff" type="submit">Add</Button></>}>
              <form id="addstaff" className="fc-form" onSubmit={add}>
                <Field label="Name"><input className="fc-input" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
                <Field label="Email"><input className="fc-input" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
                <Field label="Role"><select className="fc-select" value={f.role} onChange={e => setF({ ...f, role: e.target.value })}><option value="manager">Account manager</option><option value="admin">Admin</option></select></Field>
              </form>
            </Modal>
          )}
          {made && (
            <Modal title="Team member added" onClose={() => setMade(null)} footer={<Button onClick={() => copy(`FlashTrack team login: ${SITE}/admin/login\nEmail: ${made.email}\nPassword: ${made.password}`)}>Copy login message</Button>}>
              <p>Send this to them. The password is shown only once.</p>
              <p style={{ marginTop: 10 }}>Email: <b>{made.email}</b><br />Password: <span className="fc-mono">{made.password}</span></p>
            </Modal>
          )}
        </div>
      )}
    </AdminFrame>
  );
}
