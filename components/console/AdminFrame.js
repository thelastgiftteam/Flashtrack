import { useRouter } from 'next/router';
import { Shell, useData, Loading, call } from './ui';

const NAV = [
  { href: '/admin', label: 'Today', icon: '◷' },
  { href: '/admin/brands', label: 'Brands', icon: '▦' },
  { href: '/admin/payments', label: 'Payments', icon: '₹' },
  { href: '/admin/team', label: 'Team', icon: '◉' },
];

export default function AdminFrame({ title, subtitle, actions, children }) {
  const router = useRouter();
  const { data, error } = useData('/api/admin/auth', '/admin/login');
  async function logout() {
    await call('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
    router.replace('/admin/login');
  }
  const me = data?.staff;
  return (
    <Shell kind="admin" nav={NAV} title={title} subtitle={subtitle} actions={actions}
      who={me ? { name: me.name || me.email, sub: me.role === 'admin' ? 'Admin' : 'Account manager' } : null} onLogout={logout}>
      {error && <div className="fc-alert is-err">⚠ {error}</div>}
      {!me && !error && <Loading />}
      {me && (typeof children === 'function' ? children(me) : children)}
    </Shell>
  );
}
