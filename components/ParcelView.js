import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import BrandBar from './BrandBar';
import { C, DISPLAY, FONT_HREF, BASE_CSS, STATUS } from '../lib/ftTheme';

// Shared UI for one parcel's tracking page.
// Used by /[code]/[id] (live India Post data) and /demo/[id] (sample data).
// `fetchTracking` is an async function returning the normalized tracking object.

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// India Post timestamps are shown as-is (no timezone conversion),
// because their sample data mixes "Z" suffixes with local times.
function fmtDay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : '';
}
function fmtTime(hhmmss) {
  const m = /^(\d{2}):(\d{2})/.exec(String(hhmmss || ''));
  if (!m) return '';
  let h = Number(m[1]);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m[2]} ${ap}`;
}
function timeFromIso(s) {
  const m = /T(\d{2}:\d{2})/.exec(String(s || ''));
  return m ? m[1] + ':00' : '';
}

const ARTICLE_TYPES = {
  SP_INLAND_PARCEL: 'Speed Post Parcel',
  SP_INLAND_DOC:    'Speed Post Document',
  BUSINESS_PARCEL:  'Business Parcel',
  '24_SPEEDPOST_DOC': '24-hour Speed Post',
  '24_SPP_PARSPL':    '24-hour Speed Post Parcel',
  '48_SPEEDPOST_DOC': '48-hour Speed Post',
};

const STEPS = ['Booked', 'In transit', 'Out for delivery', 'Delivered'];

// Customers see this instead of technical errors like "fetch failed".
const FRIENDLY_ERROR = 'Tracking is temporarily unavailable. Please try again in a few minutes.';

const card = { background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18 };
const label = { fontSize: 12, fontWeight: 600, color: C.soft };

function Progress({ status, color }) {
  if (status === 'Returning to sender') return null;
  const at = status === 'Held at post office' ? 2 : Math.max(0, STEPS.indexOf(status));
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: i < STEPS.length - 1 ? 1 : 'none', display: 'flex', alignItems: 'center' }}>
            <span style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              background: i <= at ? color : C.paper,
              border: `2px solid ${i <= at ? color : '#CBD2DE'}`,
              boxShadow: i === at ? `0 0 0 5px ${color}22` : 'none',
            }} />
            {i < STEPS.length - 1 && (
              <span style={{ flex: 1, height: 3, margin: '0 4px', borderRadius: 2, background: i < at ? color : '#E3E7EF' }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginTop: 8 }}>
        {STEPS.map((s, i) => (
          <span key={s} style={{
            fontSize: 11.5, fontWeight: i === at ? 700 : 500, color: i <= at ? C.ink : C.soft,
            textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center',
          }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

export default function ParcelView({ id, backHref, config, fetchTracking }) {
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchTracking());
      setError('');
    } catch (e) {
      console.warn('Tracking error:', e?.message || e);
      setError(FRIENDLY_ERROR);
    } finally {
      setLoading(false);
    }
  }, [fetchTracking]);

  useEffect(() => { load(); }, [load]);

  const brandName = config?.brandName || 'Order Tracking';
  const status    = data?.found ? data.status : '';
  const st        = STATUS[status] || STATUS['In transit'];
  const b         = data?.booking || {};
  const latest    = data?.events?.[0];

  function flash(msg) { setToast(msg); setTimeout(() => setToast(''), 2000); }
  function copyId() { navigator.clipboard?.writeText(id).then(() => flash('Tracking number copied')); }
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${brandName}: ${id}`, url }); } catch (_) {}
    } else {
      navigator.clipboard?.writeText(url).then(() => flash('Link copied'));
    }
  }

  const head = (
    <Head>
      <title>{`${id} · ${brandName}`}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="noindex" />
      <meta name="theme-color" content="#FFFFFF" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_HREF} rel="stylesheet" />
    </Head>
  );

  if (config?.suspended) {
    return (
      <>
        {head}
        <style dangerouslySetInnerHTML={{ __html: BASE_CSS }} />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', color: C.muted }}>
          Order tracking for this business is temporarily unavailable.
        </div>
      </>
    );
  }

  return (
    <>
      {head}
      <style dangerouslySetInnerHTML={{ __html: BASE_CSS + 'body{padding-bottom:110px;}' }} />

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="ft-display ft-clamp2" style={{ fontSize: 19, lineHeight: 1.15 }}>{brandName}</div>
            <a href={backHref} style={{ fontSize: 13, fontWeight: 600, color: C.red }}>← All orders</a>
          </div>
          <button onClick={share} style={{ flexShrink: 0, padding: '9px 16px', borderRadius: 999, border: `2px solid ${C.ink}`, background: C.paper, color: C.ink, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Share
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {loading && !data && (
          <>
            <div className="ft-skel" style={{ height: 230 }} />
            <div className="ft-skel" style={{ height: 130 }} />
            <div className="ft-skel" style={{ height: 280 }} />
          </>
        )}

        {!loading && error && (
          <div style={{ ...card, padding: 22, textAlign: 'center' }}>
            <div style={{ fontSize: 34 }}>📡</div>
            <div className="ft-display" style={{ fontSize: 19, marginTop: 8 }}>Tracking unavailable</div>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 6, lineHeight: 1.55 }}>{error}</p>
            <button onClick={load} style={{ marginTop: 14, padding: '10px 20px', borderRadius: 999, border: 'none', background: C.ink, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Try again</button>
          </div>
        )}

        {data && !data.found && (
          <div style={{ ...card, padding: 26, textAlign: 'center' }}>
            <div style={{ fontSize: 38 }}>📭</div>
            <div className="ft-display" style={{ fontSize: 20, marginTop: 8 }}>No updates yet</div>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 6, lineHeight: 1.55 }}>
              India Post hasn't published updates for <b style={{ color: C.ink }}>{id}</b> yet.
              Updates usually appear within a few hours of booking.
            </p>
          </div>
        )}

        {data?.found && (
          <>
            {/* Status: styled like a Speed Post shipping label */}
            <section style={{ background: C.paper, border: `3px solid ${C.ink}`, borderRadius: 12, boxShadow: `8px 8px 0 ${C.yellow}`, overflow: 'hidden', marginRight: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: C.red, color: '#fff', padding: '9px 14px' }}>
                <span style={{ ...DISPLAY, fontSize: 13, letterSpacing: '0.02em' }}>SPEED POST</span>
                <button onClick={copyId} title="Copy tracking number" style={{ background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.45)', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>
                  {id} ⧉
                </button>
              </div>
              <div style={{ padding: '18px 18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 48, height: 48, borderRadius: 14, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{st.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={label}>Current status</div>
                    <div className="ft-display" style={{ fontSize: 26, lineHeight: 1.1, color: st.color }}>{status}</div>
                  </div>
                </div>
                {latest && (
                  <p style={{ marginTop: 12, fontSize: 15, color: C.ink, lineHeight: 1.5 }}>
                    {latest.event}, {latest.office}
                    <span style={{ display: 'block', fontSize: 13, color: C.muted, marginTop: 2 }}>{fmtDay(latest.date)} at {fmtTime(latest.time)}</span>
                  </p>
                )}
                {status === 'Held at post office' && latest?.office && (
                  <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: '#FFF4D1', border: '1px solid #F2C94C', color: '#7A4A00', fontSize: 14, lineHeight: 1.55 }}>
                    <b>Action needed:</b> your parcel is waiting at <b>{latest.office}</b>. Please collect it soon, or it may be returned to the sender.
                  </div>
                )}
                {status === 'Returning to sender' && (
                  <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: '#FDECEC', border: '1px solid #F5B5B8', color: '#8E1A20', fontSize: 14, lineHeight: 1.55 }}>
                    This parcel is on its way back to the sender. Please contact the store using the button below.
                  </div>
                )}
                <Progress status={status} color={st.color} />
              </div>
            </section>

            {/* Route + details */}
            <section style={{ ...card, padding: 18 }}>
              {[
                ['From', b.bookedAt, b.originPincode, C.ink],
                ['To', b.deliveryLocation, b.destinationPincode, C.red],
              ].map(([lbl, place, pin, dot], i) => (
                <div key={lbl} style={{ display: 'flex', gap: 12 }}>
                  <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12, flexShrink: 0 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: dot, marginTop: 4 }} />
                    {i === 0 && <span style={{ flex: 1, borderLeft: `2px dashed ${C.soft}`, margin: '4px 0' }} />}
                  </div>
                  <div style={{ minWidth: 0, paddingBottom: i === 0 ? 12 : 0, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flex: 1 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={label}>{lbl}</div>
                      <div style={{ fontSize: 15.5, fontWeight: 700, marginTop: 1 }}>{place || '—'}</div>
                    </div>
                    {pin && <span style={{ fontSize: 13, fontWeight: 600, color: C.muted, flexShrink: 0 }}>📍 {pin}</span>}
                  </div>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
                <div>
                  <div style={label}>Booked on</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{fmtDay(b.bookedOn) || '—'}</div>
                  {b.bookedOn && <div style={{ fontSize: 13, color: C.muted }}>{fmtTime(timeFromIso(b.bookedOn))}</div>}
                </div>
                <div>
                  <div style={label}>{b.deliveredOn ? 'Delivered on' : 'Service'}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
                    {b.deliveredOn ? fmtDay(b.deliveredOn) : (ARTICLE_TYPES[b.articleType] || b.articleType || 'Speed Post')}
                  </div>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section style={{ ...card, padding: '18px 18px 6px' }}>
              <div className="ft-display" style={{ fontSize: 18 }}>Journey</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2, marginBottom: 16 }}>{data.events.length} update{data.events.length === 1 ? '' : 's'} from India Post</div>
              {data.events.map((e, i) => {
                const first = i === 0;
                return (
                  <div key={i} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
                      <span style={{
                        width: first ? 16 : 10, height: first ? 16 : 10, marginTop: first ? 2 : 5, borderRadius: '50%',
                        background: first ? st.color : '#CBD2DE', boxShadow: first ? `0 0 0 5px ${st.color}22` : 'none',
                      }} />
                      {i < data.events.length - 1 && <span style={{ flex: 1, width: 2, background: C.line, marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingBottom: 18, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: first ? 700 : 600, color: first ? C.ink : '#2B3550' }}>
                        {e.event}
                        {e.rts && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: C.red, background: '#FDECEC', padding: '2px 8px', borderRadius: 999 }}>Return</span>}
                      </div>
                      <div style={{ fontSize: 14, color: C.muted, marginTop: 1 }}>{e.office}</div>
                      {e.remarks && <div style={{ fontSize: 13, color: '#9A5B00', marginTop: 2 }}>{e.remarks}</div>}
                      <div style={{ fontSize: 12.5, color: C.soft, marginTop: 3 }}>{fmtDay(e.date)}, {fmtTime(e.time)}</div>
                    </div>
                  </div>
                );
              })}
            </section>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: C.muted, padding: '0 4px' }}>
              <span>Updated {new Date(data.fetchedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</span>
              <button onClick={load} disabled={loading} style={{ background: 'none', border: 'none', color: C.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="ft-spin" style={{ display: 'inline-block', animation: loading ? 'ftSpin .8s linear infinite' : 'none' }}>↻</span>
                Refresh
              </button>
            </div>
          </>
        )}
      </main>

      {toast && (
        <div role="status" style={{ position: 'fixed', top: 78, left: '50%', transform: 'translateX(-50%)', zIndex: 200, padding: '9px 16px', borderRadius: 999, background: C.ink, color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 10px 24px -8px rgba(0,0,0,.5)' }}>
          ✓ {toast}
        </div>
      )}

      <BrandBar bar={config?.bottomBar} />
    </>
  );
}
