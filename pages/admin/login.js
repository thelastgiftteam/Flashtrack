import { useState } from 'react';
import { useRouter } from 'next/router';
import { Field, Button, call } from '../../components/console/ui';
import { AuthLayout } from '../login';

export default function AdminLogin() {
  const router = useRouter();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await call('/api/admin/auth', { method: 'POST', body: f });
      const next = String(router.query.next || '');
      router.replace(next.startsWith('/admin') ? next : '/admin');
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }
  return (
    <AuthLayout title="Team login" sub="For the FlashTrack team only.">
      <form className="fc-form" onSubmit={submit}>
        <Field label="Email"><input className="fc-input" type="email" autoComplete="username" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input className="fc-input" type="password" autoComplete="current-password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></Field>
        {err && <div className="fc-alert is-err">⚠ {err}</div>}
        <Button type="submit" variant="dark" busy={busy} className="fc-btn-block">Log in</Button>
      </form>
    </AuthLayout>
  );
}
