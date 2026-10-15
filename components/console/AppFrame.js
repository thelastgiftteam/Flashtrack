import { useRouter } from 'next/router';
import { Shell, useData, Loading, call } from './ui';

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://flashtrack.io';
export const SUPPORT_WA = '917902411421';

const NAV = [
  { href: '/app', label: 'Home', icon: '⌂' },
  { href: '/app/add', label: 'Add shipments', icon: '＋' },
  { href: '/app/shipments', label: 'Shipments', icon: '☰' },
  { href: '/app/page', label: 'Your page', icon: '◧' },
  { href: '/app/plan', label: 'Plan', icon: '₹' },
  { href: '/app/account', label: 'Account', icon: '◉' },
];

// Brand dashboard frame: loads the brand once, shows plan warnings on every page.
export default function AppFrame({ title, subtitle, actions, children }) {
  const router = useRouter();
  const { data, error, reload } = useData('/api/app/me', '/login');
  async function logout() {
    await call('/api/auth/login', { method: 'DELETE' }).catch(() => {});
    router.replace('/login');
  }
  const a = data?.access;
  let banner = null;
  if (a && !a.live) {
    banner = <div className="fc-banner fc-alert is-err"><b>Your tracking page is off.</b> Customers see a “paused” message. <a className="fc-link" href="/app/plan">Renew your plan</a> to turn it back on.</div>;
  } else if (a && a.label === 'Overdue') {
    banner = <div className="fc-banner fc-alert is-warn"><b>Payment due.</b> Your page turns off in {a.daysLeft + 3 <= 0 ? 'less than a day' : `${a.daysLeft + 3} day${a.daysLeft + 3 > 1 ? 's' : ''}`}. <a className="fc-link" href="/app/plan">Renew now</a></div>;
  } else if (a && a.label === 'Trial' && a.daysLeft <= 3) {
    banner = <div className="fc-banner fc-alert is-warn"><b>Your free trial ends {a.daysLeft === 0 ? 'today' : `in ${a.daysLeft} day${a.daysLeft > 1 ? 's' : ''}`}.</b> <a className="fc-link" href="/app/plan">Choose a plan</a> to keep your page on.</div>;
  }
  return (
    <Shell kind="app" nav={NAV} title={title} subtitle={subtitle} actions={actions} banner={banner}
      who={data ? { name: data.brand.name, sub: data.user.email } : null} onLogout={logout}>
      {error && <div className="fc-alert is-err">⚠ {error}</div>}
      {!data && !error && <Loading />}
      {data && (typeof children === 'function' ? children(data, reload) : children)}
    </Shell>
  );
}
