import AppFrame, { SUPPORT_WA } from '../../components/console/AppFrame';
import { Card, AccessPill, fmtDate } from '../../components/console/ui';

const PLANS = [
  ['basic', 'Basic', '₹750 / month', ['Your branded tracking page', 'Unlimited shipments', 'Add by Excel, photo or typing', '9 languages', 'WhatsApp button']],
  ['pro', 'Pro', 'Ask us', ['Everything in Basic', 'We add your shipments every day for you', 'A dedicated account manager']],
];

export default function Plan() {
  return (
    <AppFrame title="Plan">
      {d => {
        const a = d.access;
        const msg = `Hi FlashTrack, I want to renew my plan. Brand: ${d.brand.name} (code ${d.brand.code})`;
        return (
          <div className="fc-stack" style={{ maxWidth: 820 }}>
            <Card title="Your plan" action={<AccessPill access={a} />}>
              <dl className="fc-kv">
                <dt>Plan</dt><dd>{d.brand.plan === 'pro' ? 'Pro' : 'Basic'}{a.label === 'Trial' ? ' (free trial)' : ''}</dd>
                <dt>{a.label === 'Trial' || a.label === 'Trial ended' ? 'Trial ends' : 'Paid until'}</dt><dd>{fmtDate(a.until)}</dd>
                <dt>Your page</dt><dd>{a.live ? 'On' : 'Off. Customers see a “paused” message.'}</dd>
                {d.manager && <><dt>Account manager</dt><dd>{d.manager.name || d.manager.email}</dd></>}
              </dl>
              <p className="fc-hint" style={{ marginTop: 12 }}>If a payment is late, your page stays on for {d.rules.graceDays} more days, then turns off until you renew.</p>
            </Card>

            <Card title="Renew or upgrade">
              <p style={{ lineHeight: 1.55 }}>Pay by UPI or bank transfer. Message us on WhatsApp and we’ll send the details. Your page is turned back on as soon as the payment arrives.</p>
              <a className="fc-btn fc-btn-wa" style={{ marginTop: 14 }} href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">Message us to pay</a>
            </Card>

            <div className="fc-grid fc-grid-2">
              {PLANS.map(([k, name, price, items]) => (
                <Card key={k} title={name} action={d.brand.plan === k ? <span className="fc-pill is-dark">Your plan</span> : null}>
                  <div className="fc-stat-value" style={{ fontSize: 24 }}>{price}</div>
                  <ul style={{ listStyle: 'none', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {items.map(i => <li key={i} style={{ fontSize: 14.5 }}><span style={{ color: '#16884F', fontWeight: 700 }}>✓</span> {i}</li>)}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        );
      }}
    </AppFrame>
  );
}
