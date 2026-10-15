import { useState } from 'react';
import AppFrame from '../../components/console/AppFrame';
import { Card, Field, Button, call, toast } from '../../components/console/ui';

function PasswordForm() {
  const [f, setF] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await call('/api/app/account', { method: 'PATCH', body: f }); toast('Password changed'); setF({ currentPassword: '', newPassword: '' }); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }
  return (
    <form className="fc-form" onSubmit={submit}>
      <Field label="Current password"><input className="fc-input" type="password" autoComplete="current-password" required value={f.currentPassword} onChange={e => setF({ ...f, currentPassword: e.target.value })} /></Field>
      <Field label="New password" hint="At least 8 characters."><input className="fc-input" type="password" autoComplete="new-password" required minLength={8} value={f.newPassword} onChange={e => setF({ ...f, newPassword: e.target.value })} /></Field>
      {err && <div className="fc-alert is-err">⚠ {err}</div>}
      <div><Button type="submit" busy={busy}>Change password</Button></div>
    </form>
  );
}

export default function Account() {
  return (
    <AppFrame title="Account">
      {d => (
        <div className="fc-stack" style={{ maxWidth: 560 }}>
          <Card title="Login">
            <dl className="fc-kv"><dt>Email</dt><dd>{d.user.email}</dd><dt>Name</dt><dd>{d.user.name || '—'}</dd><dt>Brand code</dt><dd>{d.brand.code}</dd></dl>
          </Card>
          <Card title="Change password"><PasswordForm /></Card>
        </div>
      )}
    </AppFrame>
  );
}
