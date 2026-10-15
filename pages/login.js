import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AUTH_CSS, FONTS, Field, Button, call } from '../components/console/ui';

export function AuthLayout({ title, sub, children, foot }) {
  return (
    <div className="fc-auth">
      <Head>
        <title>{`${title} · FlashTrack`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href={FONTS} rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: AUTH_CSS }} />
      <div className="fc-auth-box">
        <Link href="/" className="fc-auth-logo">
          <img src="/brand/flashtrack-mark.png" alt="" width="44" height="30" />
          <img src="/brand/flashtrack-wordmark-dark.png" alt="FlashTrack" width="130" height="20" />
        </Link>
        <div className="fc-auth-card">
          <h1>{title}</h1>
          {sub && <p className="fc-auth-sub">{sub}</p>}
          {children}
        </div>
        {foot && <div className="fc-auth-foot">{foot}</div>}
      </div>
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await call('/api/auth/login', { method: 'POST', body: f });
      const next = String(router.query.next || '');
      router.replace(next.startsWith('/app') ? next : '/app');
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }
  return (
    <AuthLayout title="Log in" sub="Manage your tracking page and add today’s shipments."
      foot={<>New to FlashTrack? <Link href="/signup" className="fc-link">Start your free trial</Link></>}>
      <form className="fc-form" onSubmit={submit}>
        <Field label="Email"><input className="fc-input" type="email" autoComplete="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password" hint="Forgot it? Message us on WhatsApp and we’ll reset it.">
          <input className="fc-input" type="password" autoComplete="current-password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
        </Field>
        {err && <div className="fc-alert is-err">⚠ {err}</div>}
        <Button type="submit" busy={busy} className="fc-btn-block">Log in</Button>
      </form>
    </AuthLayout>
  );
}
