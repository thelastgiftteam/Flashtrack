import AppFrame, { SUPPORT_WA } from '../../components/console/AppFrame';
import { Card, AccessPill, fmtDate } from '../../components/console/ui';

// Razorpay Payment Page link (set NEXT_PUBLIC_PAY_LINK in Vercel). Without it, brands are sent to WhatsApp.
const PAY_LINK = process.env.NEXT_PUBLIC_PAY_LINK || '';

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
              <p style={{ lineHeight: 1.55 }}>
                {PAY_LINK ? 'Pay online with UPI, card or net banking. ' : 'Message us on WhatsApp and we’ll send you a payment link. '}
                Your page is turned back on as soon as we see the payment.
              </p>
              <div className="fc-row" style={{ marginTop: 14 }}>
                {PAY_LINK && <a className="fc-btn fc-btn-primary" href={PAY_LINK} target="_blank" rel="noreferrer">Pay now</a>}
                <a className={`fc-btn ${PAY_LINK ? 'fc-btn-ghost' : 'fc-btn-wa'}`} href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">{PAY_LINK ? 'Questions? WhatsApp us' : 'Message us to pay'}</a>
              </div>
              {PAY_LINK && <p className="fc-hint" style={{ marginTop: 10 }}>Write your brand code <b>{d.brand.code}</b> in the payment note so we can match it.</p>}
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
