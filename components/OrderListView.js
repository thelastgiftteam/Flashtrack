import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import BrandBar from './BrandBar';
import { C, FONT_HREF, BASE_CSS } from '../lib/ftTheme';

// Shared UI for a brand's order list. Used by /[code] (live orders from the
// brand's sheet) and /demo (sample data). Data loading stays in the pages.
//
// orders: [{ name, orderId, pincode, trackingId, status, trackingLink, shippedOn, isNew }]
// t:      translation strings (see T in pages/[code].js)

const EN = {
  orderTracking: 'Order tracking', tapToRefresh: 'Refresh', updating: 'Updating…',
  searchPlaceholder: 'Search by name, pincode or order ID...', liveOrders: 'Live orders',
  results: n => `${n} result${n !== 1 ? 's' : ''}`, noOrders: 'No active orders right now',
  checkBackSoon: 'Check back soon', noResultsFor: q => `No results for "${q}"`,
  tryDifferent: 'Try a different name or order ID',
};

const AVATAR = ['#D7262E', '#1D4ED8', '#16884F', '#B45309', '#7C3AED', '#0E7490'];
function avatarColor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % AVATAR.length;
  return AVATAR[h];
}
function initials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
}
function isInternal(link = '') {
  return link.startsWith('/') || /flashtrack\.io\//i.test(link);
}
const INDIA_POST = 'https://www.indiapost.gov.in/';

function copyText(text) {
  try { return navigator.clipboard.writeText(text); } catch { return Promise.reject(); }
}

// Shown when speedposttrack.io is down: copy the number, open India Post.
function IndiaPostSheet({ tid, onClose }) {
  const [copied, setCopied] = useState(false);
  function copy() { copyText(tid).then(() => setCopied(true), () => {}); }
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const step = n => (
    <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: C.ink, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Track on India Post" style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,33,61,.45)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, background: C.paper, borderRadius: '22px 22px 0 0', padding: '10px 20px calc(22px + env(safe-area-inset-bottom))', boxShadow: '0 -12px 40px -12px rgba(20,33,61,.35)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: C.line, margin: '0 auto 14px' }} />
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 14, top: 12, width: 32, height: 32, borderRadius: '50%', border: 'none', background: C.mist, color: C.ink, fontSize: 14, cursor: 'pointer' }}>✕</button>

        <div className="ft-display" style={{ fontSize: 20, paddingRight: 40 }}>Track on India Post</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Live tracking is busy right now. It takes 3 steps on the India Post site.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step(1)}
            <button onClick={copy} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderRadius: 12, border: `2px dashed ${copied ? C.green : C.ink}`, background: copied ? '#E7F6EE' : C.mist, color: C.ink, cursor: 'pointer' }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tid}</span>
              <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: copied ? C.green : C.red }}>{copied ? '✓ Copied' : 'Copy'}</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step(2)}
            <a href={INDIA_POST} target="_blank" rel="noopener noreferrer" onClick={copy}
              style={{ flex: 1, textAlign: 'center', padding: '13px 14px', borderRadius: 12, background: C.red, color: '#fff', fontSize: 15, fontWeight: 700 }}>
              Open India Post ↗
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step(3)}
            <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.4 }}>Paste the number, type the captcha, tap <b>Search</b>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, isNew, fallback, onFallback }) {
  const [copied, setCopied] = useState(false);
  const tid = order.trackingId || '';
  const link = order.trackingLink;

  function copy() {
    if (!tid) return;
    navigator.clipboard?.writeText(tid).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  return (
    <article style={{ position: 'relative', background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, padding: '16px 16px 14px', borderLeft: `5px solid ${C.red}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor(order.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {initials(order.name)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ft-display" style={{ fontSize: 16.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.name}</span>
            {isNew && <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#7A5600', background: '#FFF4D1', borderRadius: 999, padding: '2px 8px' }}>New</span>}
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
            {order.orderId && <span>{order.orderId}</span>}
            {order.pincode && <span>📍 {order.pincode}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${C.line}` }}>
        <button onClick={copy} disabled={!tid} title="Copy tracking number" style={{
          display: 'flex', alignItems: 'center', gap: 6, minWidth: 0,
          background: C.mist, border: `1px solid ${C.line}`, borderRadius: 10, padding: '7px 10px',
          color: copied ? C.green : C.ink, fontSize: 13, fontWeight: 700, letterSpacing: '0.03em',
          fontVariantNumeric: 'tabular-nums', cursor: tid ? 'pointer' : 'default',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{copied ? 'Copied' : (tid || 'Awaiting tracking no.')}</span>
          {tid && !copied && <span aria-hidden="true" style={{ color: C.soft }}>⧉</span>}
        </button>
        {tid && (fallback || !link) && /speedposttrack\.io|^$/i.test(link || '') ? (
          <button onClick={() => onFallback(tid)}
            style={{ flexShrink: 0, padding: '9px 18px', borderRadius: 999, border: 'none', background: C.red, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Track parcel
          </button>
        ) : link && (
          <a href={link} {...(isInternal(link) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            style={{ flexShrink: 0, padding: '9px 18px', borderRadius: 999, background: C.red, color: '#fff', fontSize: 14, fontWeight: 700 }}>
            Track parcel
          </a>
        )}
      </div>
    </article>
  );
}

function LangPicker({ langs, lang, setLang }) {
  const [open, setOpen] = useState(false);
  const current = langs.find(l => l.code === lang) || langs[0];
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="Language" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, border: `1px solid ${C.line}`, background: C.paper, color: C.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        🌐 {current.label}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 201, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, minWidth: 160, overflow: 'hidden', boxShadow: '0 16px 40px -12px rgba(20,33,61,.3)' }}>
            {langs.map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', border: 'none',
                borderBottom: `1px solid ${C.mist}`, background: l.code === lang ? '#FFF4D1' : C.paper,
                color: C.ink, fontSize: 14, fontWeight: l.code === lang ? 700 : 500, cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ width: 24, fontWeight: 700 }}>{l.label}</span>{l.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrderListView({
  brandName = 'Order Tracking', orders = [], loading, error, refreshing, onRefresh,
  bottomBar, t = EN, langs, lang, setLang, showSearch = true, banner = null, syncTime,
  forceFallback = false,
}) {
  const [q, setQ] = useState('');
  const [trackerDown, setTrackerDown] = useState(false);
  const [sheetTid, setSheetTid] = useState(null);
  const closeSheet = useCallback(() => setSheetTid(null), []);

  // Only ask about speedposttrack if some order actually links there
  const usesSpt = orders.some(o => /speedposttrack\.io/i.test(o.trackingLink || ''));
  useEffect(() => {
    if (!usesSpt || forceFallback) return;
    let gone = false;
    fetch('/api/tracker-status').then(r => r.json()).then(d => { if (!gone) setTrackerDown(d.up === false); }).catch(() => {});
    return () => { gone = true; };
  }, [usesSpt, forceFallback]);
  const fallback = forceFallback || trackerDown;

  const s = q.toLowerCase().trim();
  const shown = orders.filter(o => !s
    || o.name?.toLowerCase().includes(s) || o.orderId?.toLowerCase().includes(s)
    || String(o.pincode || '').toLowerCase().includes(s) || o.trackingId?.toLowerCase().includes(s));

  // Group by shipped date, keeping order
  const groups = [];
  shown.forEach(o => {
    const key = o.shippedOn || '';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(o); else groups.push({ key, items: [o] });
  });

  return (
    <>
      <Head>
        <title>{`${brandName} · Order status`}</title>
        <meta name="description" content={`Track your order from ${brandName}.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_HREF} rel="stylesheet" />
      </Head>
      <style>{BASE_CSS + 'body{padding-bottom:110px;}'}</style>

      {banner}

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div className="ft-display ft-clamp2" style={{ fontSize: 20, lineHeight: 1.15 }}>{brandName}</div>
            <div style={{ fontSize: 13, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ position: 'relative', width: 8, height: 8 }}>
                <span className="ft-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.green, opacity: .5, animation: 'ftPing 1.6s cubic-bezier(0,0,.2,1) infinite' }} />
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.green }} />
              </span>
              {t.orderTracking}{syncTime ? `, ${syncTime}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {langs && setLang && <LangPicker langs={langs} lang={lang} setLang={setLang} />}
            {onRefresh && (
              <button onClick={onRefresh} disabled={refreshing} aria-label={t.tapToRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: 'none', background: C.ink, color: '#fff', fontSize: 13, fontWeight: 600, cursor: refreshing ? 'default' : 'pointer' }}>
                <span className="ft-spin" style={{ display: 'inline-block', animation: refreshing ? 'ftSpin .8s linear infinite' : 'none' }}>↻</span>
                <span className="ft-sm-hide">{refreshing ? t.updating : t.tapToRefresh}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showSearch && (
        <div style={{ background: C.yellow, borderBottom: `1px solid #EBB51F` }}>
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px' }}>
            <div style={{ position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder}
                style={{ width: '100%', padding: '15px 44px 15px 46px', borderRadius: 14, border: `2px solid ${C.ink}`, background: C.paper, color: C.ink, fontSize: 15, fontWeight: 500, outline: 'none', boxShadow: `4px 4px 0 ${C.ink}` }} />
              {q && (
                <button onClick={() => setQ('')} aria-label="Clear search" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', border: 'none', background: C.mist, color: C.ink, fontSize: 13, cursor: 'pointer' }}>✕</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '16px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="ft-skel" style={{ height: 128, opacity: 1 - i * 0.18 }} />)}
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '12px 14px', marginBottom: 12, borderRadius: 12, background: '#FDECEC', border: '1px solid #F5B5B8', color: '#8E1A20', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && (
          <div style={{ fontSize: 14, fontWeight: 700, color: C.muted, margin: '2px 2px 12px' }}>
            {s ? t.results(shown.length) : `${t.liveOrders} (${orders.length})`}
          </div>
        )}

        {!loading && shown.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 12px', background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18 }}>
            <div style={{ fontSize: 42 }}>{s ? '🔍' : '📦'}</div>
            <div className="ft-display" style={{ fontSize: 19, marginTop: 10 }}>{s ? t.noResultsFor(q) : t.noOrders}</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{s ? t.tryDifferent : t.checkBackSoon}</div>
          </div>
        )}

        {!loading && groups.map((g, gi) => (
          <section key={`${g.key}-${gi}`} style={{ marginBottom: 18 }}>
            {g.key && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 2px 10px' }}>
                <span className="ft-display" style={{ fontSize: 15 }}>{g.key}</span>
                <span style={{ flex: 1, height: 1, background: C.line }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.soft }}>{g.items.length}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {g.items.map((o, i) => (
                <OrderCard key={o.orderId || o.trackingId || `${gi}-${i}`} order={o} isNew={o.isNew && !s && gi === 0 && i === 0} fallback={fallback} onFallback={setSheetTid} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <BrandBar bar={bottomBar} />
      {sheetTid && <IndiaPostSheet tid={sheetTid} onClose={closeSheet} />}
    </>
  );
}
