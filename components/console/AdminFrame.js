import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Shell, useData, Loading, call } from './ui';

// Bell with this person's reminders: renewals, overdue, pages off, trials
// ending, Pro uploads still to do. Each one links straight to the brand.
function Bell({ alerts, me }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    window.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('keydown', esc); };
  }, [open]);
  const n = alerts ? alerts.length : 0;
  const urgent = alerts ? alerts.filter(a => a.tone === 'red').length : 0;
  return (
    <div className="fc-bell-wrap" ref={ref}>
      <button className="fc-bell" aria-label={`Reminders: ${n}`} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span aria-hidden="true">🔔</span>
        {n > 0 && <span className={`fc-bell-n ${urgent ? '' : 'is-calm'}`}>{n > 99 ? '99+' : n}</span>}
      </button>
      {open && (
        <div className="fc-bell-panel" role="dialog" aria-label="Reminders">
          <div className="fc-bell-head">
            <b>Reminders</b>
            <span className="fc-small fc-muted">{me.role === 'admin' ? 'All brands' : 'Your brands'}</span>
          </div>
          {!alerts && <div className="fc-loading" style={{ padding: 20 }}><span className="fc-spin" /> Loading…</div>}
          {alerts && !alerts.length && <div className="fc-empty" style={{ padding: '28px 16px' }}><div className="fc-empty-ico">✓</div><div className="fc-empty-title">Nothing to chase today</div></div>}
          {alerts && alerts.length > 0 && (
            <div className="fc-bell-list">
              {alerts.map((a, i) => (
                <Link key={i} href={`/admin/brands/${a.brandId}?tab=${a.tab}`} className="fc-bell-item" onClick={() => setOpen(false)}>
                  <span className={`fc-dot is-${a.tone}`} />
                  <span style={{ minWidth: 0 }}>
                    <span className="fc-strong" style={{ display: 'block' }}>{a.brandName}</span>
                    <span className="fc-small" style={{ color: '#3F3F46' }}>{a.text}</span>
                    {me.role === 'admin' && <span className="fc-small fc-muted" style={{ display: 'block' }}>{a.manager || 'No manager'}</span>}
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="fc-bell-foot">
            <span className="fc-small fc-muted">Collect payments in Razorpay, then tap “+1 month” on the brand.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFrame({ title, subtitle, actions, children }) {
  const router = useRouter();
  const { data, error } = useData('/api/admin/auth', '/admin/login');
  const [alerts, setAlerts] = useState(null);
  const me = data?.staff;
  useEffect(() => {
    if (!me) return;
    let alive = true;
    const load = () => call('/api/admin/alerts').then(d => alive && setAlerts(d.alerts)).catch(() => {});
    load();
    const t = setInterval(load, 10 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, [me, router.asPath]);

  async function logout() {
    await call('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
    router.replace('/admin/login');
  }
  const urgent = alerts ? alerts.filter(a => a.tone === 'red').length : 0;
  const nav = [
    { href: '/admin', label: 'Today', icon: '◷', badge: urgent || null },
    { href: '/admin/brands', label: 'Brands', icon: '▦' },
    { href: '/admin/team', label: 'Team', icon: '◉' },
  ];
  return (
    <Shell kind="admin" nav={nav} title={title} subtitle={subtitle}
      actions={<>{actions}{me && <Bell alerts={alerts} me={me} />}</>}
      who={me ? { name: me.name || me.email, sub: me.role === 'admin' ? 'Admin' : 'Account manager' } : null} onLogout={logout}>
      {error && <div className="fc-alert is-err">⚠ {error}</div>}
      {!me && !error && <Loading />}
      {me && (typeof children === 'function' ? children(me) : children)}
    </Shell>
  );
}
