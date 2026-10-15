import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Field, Button, call } from '../components/console/ui';
import { AuthLayout } from './login';

export default function Signup() {
  const router = useRouter();
  const [f, setF] = useState({ brandName: '', name: '', phone: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(0); // parcels from the homepage "try it" file
  const set = k => e => setF({ ...f, [k]: e.target.value });
  useEffect(() => {
    try {
      const t = JSON.parse(sessionStorage.getItem('ft_try') || 'null');
      if (t?.rows?.length) { setTried(t.rows.length); if (t.brandName) setF(x => ({ ...x, brandName: t.brandName })); }
    } catch { /* nothing saved */ }
  }, []);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await call('/api/auth/signup', { method: 'POST', body: f });
      router.replace(tried ? '/app/add?try=1' : '/app?welcome=1');
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }
  return (
    <AuthLayout title="Start your free trial" sub="14 days free. No card needed. Your tracking page is ready as soon as you sign up."
      foot={<>Already have an account? <Link href="/login" className="fc-link">Log in</Link></>}>
      <form className="fc-form" onSubmit={submit}>
        {tried > 0 && <div className="fc-alert is-ok">📄 Next, we’ll ask if you want the {tried} parcel{tried > 1 ? 's' : ''} from your file added to your page.</div>}
        <Field label="Brand name"><input className="fc-input" required maxLength={80} value={f.brandName} onChange={set('brandName')} placeholder="e.g. WT Frames" /></Field>
        <Field label="Your name"><input className="fc-input" autoComplete="name" value={f.name} onChange={set('name')} /></Field>
        <Field label="WhatsApp number" hint="Customers can message you on this from your page. You can change it later.">
          <input className="fc-input" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} placeholder="98765 43210" />
        </Field>
        <Field label="Email"><input className="fc-input" type="email" autoComplete="email" required value={f.email} onChange={set('email')} /></Field>
        <Field label="Password" hint="At least 8 characters."><input className="fc-input" type="password" autoComplete="new-password" required minLength={8} value={f.password} onChange={set('password')} /></Field>
        {err && <div className="fc-alert is-err">⚠ {err}</div>}
        <Button type="submit" busy={busy} className="fc-btn-block">Create my tracking page</Button>
      </form>
    </AuthLayout>
  );
}
