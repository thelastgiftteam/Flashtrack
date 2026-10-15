import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import BrandBar from './BrandBar';
import { C, FONT_HREF, BASE_CSS, UI_CSS } from '../lib/ftTheme';
import { LANGS, T, localDay, useLang } from '../lib/i18n';

// Shared UI for a brand's order list. Used by /[code] (live orders from the
// brand's sheet), /demo (sample data) and the homepage phone mockups
// (embedded, so the homepage always shows exactly what customers see).
// All words come from lib/i18n.js, in the language the customer picks.
//
// orders: [{ name, orderId, pincode, trackingId, trackingLink, shippedOn, isNew }]

const INDIA_POST = 'https://www.indiapost.gov.in/';
const AVATAR = ['#121212', '#DF1515', '#9A6F00', '#7A1010', '#3F3F46', '#C4050A'];

// Examples the search box types out, so people see what they can search by.
const EXAMPLES = [
  ['name', 'Anjali Menon'], ['pincode', '682030'], ['tracking', 'EL695415965IN'],
  ['order', 'ORD-1042'], ['name', 'Rahul Krishnan'], ['pincode', '560034'],
];

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

// Copy that also works inside WhatsApp's and Instagram's in-app browsers,
// where navigator.clipboard is often missing. Must run inside the tap.
export function copyText(text) {
  let ok = false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.readOnly = true;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;';
    document.body.appendChild(ta);
    const range = document.createRange();
    range.selectNodeContents(ta);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    ta.setSelectionRange(0, text.length);
    ok = document.execCommand('copy');
    sel.removeAllRanges();
    document.body.removeChild(ta);
  } catch { /* fall through to the clipboard API */ }
  try { navigator.clipboard?.writeText(text).catch(() => {}); ok = ok || !!navigator.clipboard; } catch { /* ignore */ }
  return ok;
}

function Bolt({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M13.5 2 4 13.5h6.2L8.8 22 20 9.8h-6.4L13.5 2Z" fill={C.yellow} />
    </svg>
  );
}

// Bold the word "Search" (the button name on India Post's site)
function withSearchBold(s) {
  const parts = s.split('Search');
  return parts.length === 2 ? <>{parts[0]}<b>Search</b>{parts[1]}</> : s;
}

// Opens when the tracking site is down (or the brand switched the sheet to
// India Post). The number is copied the moment the customer taps Track, and
// again when they tap Open India Post, so all that's left is paste + captcha.
function IndiaPostSheet({ tid, copiedAtOpen, onClose, t }) {
  const [copied, setCopied] = useState(copiedAtOpen);
  const [flashKey, setFlashKey] = useState(0);
  const copy = () => { const ok = copyText(tid); setCopied(ok); setFlashKey(k => k + 1); };

  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const step = n => (
    <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: C.ink, color: '#fff', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={t.ip.title} style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} className="ft-anim" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', animation: 'ftFade .2s ease both' }} />
      <div className="ft-anim" style={{ position: 'relative', width: '100%', maxWidth: 480, background: C.paper, borderRadius: '22px 22px 0 0', overflow: 'hidden', boxShadow: '0 -16px 40px -12px rgba(0,0,0,.4)', animation: 'ftUp .38s cubic-bezier(.2,.9,.25,1) both' }}>
        <div style={{ background: C.red, color: '#fff', padding: '18px 20px 16px', position: 'relative' }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.45)', margin: '-6px auto 12px' }} />
          <button onClick={onClose} aria-label={t.ip.close} style={{ position: 'absolute', right: 14, top: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.18)', color: '#fff', fontSize: 14, cursor: 'pointer' }}>✕</button>
          <div className="ft-display ft-tr" style={{ fontSize: 22, paddingRight: 40, lineHeight: 1.25 }}>{t.ip.title}</div>
          <div style={{ fontSize: 14, marginTop: 4, color: 'rgba(255,255,255,.92)' }}>{copied ? t.ip.copiedSub : t.ip.copySub}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 20px calc(22px + env(safe-area-inset-bottom))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step(1)}
            <button onClick={copy} className="ft-chip" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderRadius: 12, border: `2px dashed ${copied ? C.green : C.ink}`, background: copied ? '#E7F6EE' : C.mist, color: C.ink, cursor: 'pointer' }}>
              <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tid}</span>
              <span key={flashKey} className={copied ? 'ft-pop' : ''} aria-label={copied ? t.copied : undefined} style={{ flexShrink: 0, fontSize: copied ? 15 : 13, fontWeight: 700, color: copied ? '#fff' : C.red, background: copied ? C.green : 'transparent', borderRadius: 999, minWidth: copied ? 26 : 0, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{copied ? '✓' : t.copy}</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step(2)}
            <a href={INDIA_POST} target="_blank" rel="noopener noreferrer" onClick={() => { copyText(tid); setCopied(true); }} className="ft-go"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: C.ink, color: '#fff', fontSize: 15.5, fontWeight: 700, textAlign: 'center' }}>
              {t.ip.open} <span aria-hidden="true" style={{ color: C.yellow }}>↗</span>
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step(3)}
            <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.45 }}>{withSearchBold(t.ip.step3)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, isNew, index, fallback, onFallback, onTrack, t, embedded }) {
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(false);
  const tid = order.trackingId || '';
  const link = order.trackingLink || '';
  // Our own parcel pages need the India Post API (not live), so links to them
  // open the India Post panel too. Speedposttrack opens directly unless it's down.
  const spt = /speedposttrack\.io/i.test(link);
  const usePanel = !!tid && (!link || isInternal(link) || (fallback && spt));
  const sameTab = isInternal(link) && !embedded;

  function copy() {
    if (!tid) return;
    copyText(tid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  function pressed() { setFlash(true); setTimeout(() => setFlash(false), 460); onTrack && onTrack(); }

  const btnStyle = {
    flexShrink: 1, minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 999,
    border: 'none', background: C.red, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  };

  return (
    <article className="ft-card ft-anim" style={{
      position: 'relative', background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, padding: '16px 16px 14px',
      borderLeft: `4px solid ${C.red}`, animation: `ftIn .42s cubic-bezier(.2,.8,.2,1) ${Math.min(index, 8) * 50}ms both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor(order.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {initials(order.name)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ft-display" style={{ fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.name}</span>
            {isNew && <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.ink, background: C.yellow, borderRadius: 999, padding: '2px 8px' }}>{t.isNew}</span>}
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
            {order.orderId && <span>{order.orderId}</span>}
            {order.pincode && <span>📍 {order.pincode}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${C.line}` }}>
        <button onClick={copy} disabled={!tid} title={t.copy} className="ft-chip" style={{
          display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexShrink: tid ? 0 : 1,
          background: copied ? '#E7F6EE' : C.mist, border: `1px solid ${copied ? '#BFE5CF' : C.line}`, borderRadius: 10, padding: '7px 10px',
          color: copied ? C.green : C.ink, fontSize: 13, fontWeight: 700, letterSpacing: tid && !copied ? '0.03em' : 0,
          fontVariantNumeric: 'tabular-nums', cursor: tid ? 'pointer' : 'default',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{copied ? `✓ ${t.copied}` : (tid || t.noTrackingYet)}</span>
          {tid && !copied && <span aria-hidden="true" style={{ color: C.soft }}>⧉</span>}
        </button>
        {usePanel ? (
          <button onClick={() => { pressed(); onFallback(tid); }} className={`ft-track${flash ? ' is-flash' : ''}`} style={btnStyle}>
            <Bolt /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.trackParcel}</span>
          </button>
        ) : link && (
          <a href={link} onClick={pressed} {...(sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            className={`ft-track${flash ? ' is-flash' : ''}`} style={btnStyle}>
            <Bolt /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.trackParcel}</span>
          </a>
        )}
      </div>
    </article>
  );
}

function LangPicker({ lang, setLang, t, embedded }) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === lang) || LANGS[0];
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label={`${t.language}: ${current.native}`} aria-expanded={open} tabIndex={embedded ? -1 : undefined}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px 8px 12px', borderRadius: 999, border: `1.5px solid ${C.ink}`, background: C.paper, color: C.ink, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        <span aria-hidden="true">🌐</span> {current.label} <span aria-hidden="true" style={{ fontSize: 9, marginLeft: 1 }}>▼</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
          <div className="ft-anim" role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 201, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, minWidth: 190, overflow: 'hidden', boxShadow: '0 16px 40px -12px rgba(0,0,0,.3)', animation: 'ftFade .15s ease both' }}>
            <div style={{ padding: '10px 14px 6px', fontSize: 12, fontWeight: 700, color: C.muted }}>{t.language}</div>
            {LANGS.map(l => (
              <button key={l.code} role="menuitemradio" aria-checked={l.code === lang} lang={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '10px 14px', border: 'none',
                borderTop: `1px solid ${C.mist}`, background: l.code === lang ? C.cream : C.paper,
                color: C.ink, fontSize: 15, fontWeight: l.code === lang ? 700 : 500, cursor: 'pointer', textAlign: 'left',
              }}>
                <span>{l.native}</span>
                <span style={{ fontSize: 12, color: C.soft, fontWeight: 500 }}>{l.code === lang ? '✓' : l.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Search box. While empty and not in use, it types example searches
// (a name, a pincode, a tracking number, an order ID) so people see what works.
function SearchBox({ q, setQ, t, embedded }) {
  const [focused, setFocused] = useState(false);
  const [still, setStill] = useState(false);
  const [ex, setEx] = useState({ key: 'name', text: '' });

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setStill(true); return; }
    let i = 0, c = 0, dir = 1, timer, alive = true;
    const tick = () => {
      if (!alive) return;
      const [key, val] = EXAMPLES[i];
      if (dir === 1) {
        c += 1;
        setEx({ key, text: val.slice(0, c) });
        if (c >= val.length) { dir = -1; timer = setTimeout(tick, 1500); return; }
        timer = setTimeout(tick, 70 + Math.random() * 60);
      } else {
        c -= 1;
        setEx({ key, text: val.slice(0, c) });
        if (c <= 0) { dir = 1; i = (i + 1) % EXAMPLES.length; timer = setTimeout(tick, 380); return; }
        timer = setTimeout(tick, 28);
      }
    };
    timer = setTimeout(tick, 900);
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  const typing = !q && !focused && !still;

  return (
    <div style={{ position: 'relative' }}>
      <span aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
      <input value={q} onChange={e => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={typing ? '' : t.searchPlaceholder} aria-label={t.searchPlaceholder} tabIndex={embedded ? -1 : undefined}
        enterKeyHint="search" autoComplete="off" spellCheck={false}
        style={{ width: '100%', padding: '15px 44px 15px 46px', borderRadius: 14, border: `2px solid ${C.ink}`, background: C.paper, color: C.ink, fontSize: 16, fontWeight: 500, outline: 'none', boxShadow: `4px 4px 0 ${C.ink}`, textOverflow: 'ellipsis' }} />
      {typing && (
        <div aria-hidden="true" style={{ position: 'absolute', left: 46, right: 16, top: 0, bottom: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none', fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <span style={{ color: C.muted, fontWeight: 600 }}>{t.tw[ex.key]}:&nbsp;</span>
          <span style={{ color: '#55555E', fontWeight: 500, letterSpacing: ex.key === 'tracking' ? '0.03em' : 0 }}>{ex.text}</span>
          <span className="ft-caret" />
        </div>
      )}
      {q && (
        <button onClick={() => setQ('')} aria-label="✕" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', border: 'none', background: C.mist, color: C.ink, fontSize: 13, cursor: 'pointer' }}>✕</button>
      )}
    </div>
  );
}

function PoweredBy({ embedded }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 4px' }}>
      <a href="https://flashtrack.io/" target="_blank" rel="noopener" tabIndex={embedded ? -1 : undefined} lang="en"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 9px', borderRadius: 999, background: C.black, color: '#BDBDC4', fontSize: 12, fontWeight: 600 }}>
        <img src="/brand/flashtrack-mark.png" alt="" width="26" height="18" style={{ display: 'block' }} />
        Tracking by
        <img src="/brand/flashtrack-wordmark.png" alt="FlashTrack" width="82" height="13" style={{ display: 'block' }} />
      </a>
    </div>
  );
}

export default function OrderListView({
  brandName = 'Order Tracking', logo = '', orders = [], loading, error, refreshing, onRefresh, onTrack,
  bottomBar, showSearch = true, banner = null, syncTime,
  forceFallback = false, embedded = false, initialQuery = '',
}) {
  const [lang, setLang] = useLang({ embedded });
  const t = T[lang] || T.en;
  const [q, setQ] = useState(initialQuery);
  const [trackerDown, setTrackerDown] = useState(false);
  const [sheet, setSheet] = useState(null);
  const closeSheet = useCallback(() => setSheet(null), []);
  const openSheet = useCallback(tid => setSheet({ tid, copied: copyText(tid) }), []);

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
  let idx = 0;

  return (
    <div className="ft-ui" lang={embedded ? lang : undefined} style={embedded ? { background: C.mist, color: C.ink, minHeight: '100%', paddingBottom: 110, fontFamily: "'Instrument Sans',system-ui,sans-serif" } : undefined}>
      {!embedded && (
        <Head>
          <title>{`${brandName} · ${t.orderTracking}`}</title>
          <meta name="description" content={`Track your order from ${brandName}.`} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#FFFFFF" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={FONT_HREF} rel="stylesheet" />
        </Head>
      )}
      <style dangerouslySetInnerHTML={{ __html: embedded ? UI_CSS : BASE_CSS + 'body{padding-bottom:110px;}' }} />

      {banner}

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: `1px solid ${C.line}` }}>
        <div className="ft-stripe" />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            {logo && <img src={logo} alt="" width="40" height="40" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.line}` }} />}
            <div style={{ minWidth: 0 }}>
            <div className="ft-display ft-clamp2" style={{ fontSize: 21, lineHeight: 1.15 }}>{brandName}</div>
            <div style={{ fontSize: 13, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                <span className="ft-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.green, opacity: .5, animation: 'ftPing 1.6s cubic-bezier(0,0,.2,1) infinite' }} />
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.green }} />
              </span>
              {t.orderTracking}{syncTime ? `, ${syncTime}` : ''}
            </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <LangPicker lang={lang} setLang={setLang} t={t} embedded={embedded} />
            {onRefresh && (
              <button onClick={onRefresh} disabled={refreshing} aria-label={t.refresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, border: 'none', background: C.ink, color: '#fff', fontSize: 13, fontWeight: 600, cursor: refreshing ? 'default' : 'pointer' }}>
                <span className="ft-spin" style={{ display: 'inline-block', animation: refreshing ? 'ftSpin .8s linear infinite' : 'none' }}>↻</span>
                <span className="ft-sm-hide">{refreshing ? t.updating : t.refresh}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showSearch && (
        <div style={{ background: C.yellow, borderBottom: `1px solid ${C.yellowDeep}` }}>
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px' }}>
            <SearchBox q={q} setQ={setQ} t={t} embedded={embedded} />
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
            ⚠️ {t.refreshError}
          </div>
        )}

        {!loading && (
          <div style={{ fontSize: 14, fontWeight: 700, color: C.muted, margin: '2px 2px 12px' }}>
            {s ? t.results(shown.length) : `${t.allOrders} (${orders.length})`}
          </div>
        )}

        {!loading && shown.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 16px', background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16 }}>
            <div style={{ fontSize: 42 }}>{s ? '🔍' : '📦'}</div>
            <div className="ft-display ft-tr" style={{ fontSize: 19, marginTop: 10, lineHeight: 1.3 }}>{s ? t.noResultsFor(q) : t.noOrders}</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{s ? t.tryDifferent : t.checkBackSoon}</div>
          </div>
        )}

        {!loading && groups.map((g, gi) => (
          <section key={`${g.key}-${gi}`} style={{ marginBottom: 18 }}>
            {g.key && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 2px 10px' }}>
                <span className="ft-display ft-tr" style={{ fontSize: 15 }}>{localDay(g.key, lang)}</span>
                <span style={{ flex: 1, height: 1, background: C.line }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.soft }}>{g.items.length}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {g.items.map((o, i) => (
                <OrderCard key={o.orderId || o.trackingId || `${gi}-${i}`} order={o} index={idx++} t={t} embedded={embedded}
                  isNew={o.isNew && !s && gi === 0 && i === 0} fallback={fallback} onFallback={openSheet} onTrack={onTrack} />
              ))}
            </div>
          </section>
        ))}

        {!loading && <PoweredBy embedded={embedded} />}
      </main>

      <BrandBar bar={bottomBar} />
      {sheet && <IndiaPostSheet key={sheet.tid} tid={sheet.tid} copiedAtOpen={sheet.copied} onClose={closeSheet} t={t} />}
    </div>
  );
}
