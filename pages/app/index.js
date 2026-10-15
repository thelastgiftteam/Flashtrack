import Link from 'next/link';
import { useRouter } from 'next/router';
import AppFrame, { SITE } from '../../components/console/AppFrame';
import { Card, Stat, Button, AccessPill, copy, fmtWhen, fmtDate } from '../../components/console/ui';

export default function Home() {
  const router = useRouter();
  return (
    <AppFrame title="Home">
      {d => {
        const link = `${SITE}/${d.brand.code}`;
        const share = `Track your ${d.brand.name} order here: ${link}`;
        const steps = [
          ['Add your first shipments', d.stats.total > 0, '/app/add'],
          ['Set your WhatsApp button', !!d.brand.whatsapp, '/app/page'],
          ['Share your link with customers', d.stats.total > 0 && !!d.brand.whatsapp, null],
        ];
        const allDone = steps.every(s => s[1]);
        return (
          <div className="fc-stack">
            {router.query.welcome && (
              <div className="fc-alert is-ok"><b>Your tracking page is ready.</b> Add today’s shipments, then send the link to your customers.</div>
            )}
            <Card title="Your tracking link" action={<AccessPill access={d.access} />}>
              <div className="fc-linkbox"><span>{link.replace(/^https?:\/\//, '')}</span>
                <Button variant="ghost" size="sm" onClick={() => copy(link)}>Copy</Button>
              </div>
              <div className="fc-row" style={{ marginTop: 12 }}>
                <a className="fc-btn fc-btn-wa fc-btn-sm" href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
                <a className="fc-btn fc-btn-ghost fc-btn-sm" href={link} target="_blank" rel="noreferrer">Open page ↗</a>
              </div>
              <p className="fc-hint" style={{ marginTop: 10 }}>Put this one link in every order message. Customers find their parcel by name.</p>
            </Card>

            <SavedCard u={d.usage} />

            <div className="fc-grid fc-grid-stats">
              <Stat label="Added today" value={d.stats.today} />
              <Stat label="Last 7 days" value={d.stats.week} />
              <Stat label="Last upload" value={<span style={{ fontSize: 'min(20px, 4.4vw)' }}>{fmtWhen(d.lastImport?.created_at)}</span>} hint={d.lastImport ? `${d.lastImport.added} added` : 'Nothing added yet'} />
            </div>

            <div className="fc-grid fc-grid-2">
              <Card title="Today’s job">
                <p style={{ lineHeight: 1.55 }}>Add the parcels you sent today. Upload India Post’s Excel file, take a photo of the receipt, or type them in.</p>
                <Link href="/app/add" className="fc-btn fc-btn-primary" style={{ marginTop: 14 }}>＋ Add today’s shipments</Link>
              </Card>
              {!allDone ? (
                <Card title="Get set up">
                  <div className="fc-steps">
                    {steps.map(([t, done, href], i) => (
                      <div key={t} className={`fc-step ${done ? 'is-done' : ''}`}>
                        <span className="fc-step-n">{done ? '✓' : i + 1}</span>
                        <span className="fc-step-t" style={{ flex: 1 }}>{t}</span>
                        {!done && href && <Link href={href} className="fc-link fc-small">Do it</Link>}
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card title="Plan">
                  <p style={{ lineHeight: 1.55 }}>
                    {d.access.label === 'Trial' ? `Free trial until ${fmtDate(d.access.until)}.` : `Paid until ${fmtDate(d.access.until)}.`}
                  </p>
                  <Link href="/app/plan" className="fc-link" style={{ display: 'inline-block', marginTop: 10 }}>See plan</Link>
                </Card>
              )}
            </div>
          </div>
        );
      }}
    </AppFrame>
  );
}

// The number that shows what FlashTrack does for them
function SavedCard({ u }) {
  if (!u) return null;
  const n = u.week_views;
  return (
    <div className="fc-saved">
      {n > 0 ? (
        <>
          <div className="fc-saved-n">{n.toLocaleString('en-IN')}</div>
          <div>
            <div className="fc-saved-t">{n === 1 ? 'customer' : 'customers'} checked their parcel themselves this week</div>
            <div className="fc-saved-h">That’s up to {n.toLocaleString('en-IN')} “where is my order?” {n === 1 ? 'message' : 'messages'} you didn’t have to answer.
              {u.week_tracks > 0 && <> They tapped Track {u.week_tracks.toLocaleString('en-IN')} {u.week_tracks === 1 ? 'time' : 'times'}.</>}
              {u.all_views > n && <> {u.all_views.toLocaleString('en-IN')} since you started.</>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="fc-saved-n">0</div>
          <div>
            <div className="fc-saved-t">customers checked their parcel this week</div>
            <div className="fc-saved-h">Send your link with every order. Each customer who checks here is one less “where is my order?” message for you.</div>
          </div>
        </>
      )}
    </div>
  );
}
