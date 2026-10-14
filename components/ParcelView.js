import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// Shared UI for one parcel's tracking page.
// Used by /[code]/[id] (live India Post data) and /demo/[id] (sample data).
// `load` is an async function that returns the normalized tracking object.

// ─── Helpers ──────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// India Post timestamps are shown as-is (no timezone conversion),
// because their sample data mixes "Z" suffixes with local times.
function fmtDay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
  if (!m) return '';
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
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

const STATUS_STYLE = {
  'Delivered':           { color: '#10B981', icon: '✅' },
  'Out for delivery':    { color: '#F59E0B', icon: '🛵' },
  'Held at post office': { color: '#F59E0B', icon: '🏤' },
  'Returning to sender': { color: '#EF4444', icon: '↩️' },
  'In transit':          { color: '#60A5FA', icon: '🚚' },
  'Booked':              { color: '#9CA3AF', icon: '📦' },
};

const STEPS = ['Booked', 'In transit', 'Out for delivery', 'Delivered'];

// ─── Progress bar ─────────────────────────────────────────────────
function Progress({ status }) {
  if (status === 'Returning to sender') return null;
  const at = status === 'Held at post office' ? 2 : Math.max(0, STEPS.indexOf(status));
  return (
    <div style={{ display:'flex', alignItems:'center', marginTop:18 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex: i < STEPS.length - 1 ? 1 : 'none', display:'flex', alignItems:'center' }}>
          <div title={s} style={{
            width:12, height:12, borderRadius:'50%', flexShrink:0,
            background: i <= at ? STATUS_STYLE[status]?.color || '#60A5FA' : '#1F2937',
            border: '2px solid ' + (i <= at ? 'transparent' : '#374151'),
          }} />
          {i < STEPS.length - 1 && (
            <div style={{ flex:1, height:2, margin:'0 4px', background: i < at ? STATUS_STYLE[status]?.color || '#60A5FA' : '#1F2937' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Bottom bar (same behaviour as the brand list page) ───────────
function BottomBar({ bar }) {
  if (!bar || !bar.text || bar.active === false) return null;
  const isBtn = bar.mode === 'button' && bar.link;
  const inner = (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center', gap:10,
      padding:'14px 20px', background:'linear-gradient(135deg, #064E3B, #065F46)',
      border:'1px solid #059669', borderRadius:16, color:'#10B981', fontSize:14, fontWeight:600,
    }}>
      <span style={{ fontSize:18 }}>💬</span><span>{bar.text}</span>
    </div>
  );
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'12px 16px 20px',
      background:'linear-gradient(to top, #030712 60%, transparent)', zIndex:50 }}>
      <div style={{ maxWidth:560, margin:'0 auto' }}>
        {isBtn ? <a href={bar.link} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>{inner}</a> : inner}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
// Customers see this instead of technical errors like "fetch failed".
const FRIENDLY_ERROR = 'Tracking is temporarily unavailable. Please try again in a few minutes.';

export default function ParcelView({ id, backHref, config, fetchTracking }) {
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState('');

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
  const st        = STATUS_STYLE[status] || STATUS_STYLE['In transit'];
  const b         = data?.booking || {};

  function flash(msg) { setCopied(msg); setTimeout(() => setCopied(''), 2000); }

  function copyId() {
    navigator.clipboard?.writeText(id).then(() => flash('Tracking number copied'));
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${brandName} — ${id}`, url }); } catch (_) {}
    } else {
      navigator.clipboard?.writeText(url).then(() => flash('Link copied'));
    }
  }

  if (config?.suspended) {
    return (
      <div style={{ minHeight:'100vh', background:'#030712', color:'#D1D5DB', display:'flex',
        alignItems:'center', justifyContent:'center', textAlign:'center', padding:24, fontFamily:'system-ui' }}>
        Order tracking for this business is temporarily unavailable.
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${id} — ${brandName}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content="#030712" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0B0F19;color:#F9FAFB;font-family:'DM Sans',sans-serif;min-height:100vh;padding-bottom:120px;-webkit-font-smoothing:antialiased;}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .skeleton{background:linear-gradient(90deg,#111827 25%,#1F2937 50%,#111827 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:20px;}
        button{font-family:'DM Sans',sans-serif;}
        a{color:inherit;}
      `}</style>

      {/* Header */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:'rgba(3,7,18,0.88)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid #0D1117' }}>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'14px 16px', display:'flex',
          justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif", letterSpacing:'-0.5px',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{brandName.toUpperCase()}</div>
            <a href={backHref} style={{ fontSize:12, color:'#9CA3AF', textDecoration:'none' }}>← All orders</a>
          </div>
          <button onClick={share} style={{ padding:'10px 16px', background:'#0D1117', border:'1px solid #1F2937',
            borderRadius:999, color:'#F9FAFB', fontSize:13, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
            ↗ Share
          </button>
        </div>
      </header>

      <main style={{ maxWidth:560, margin:'0 auto', padding:'16px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Loading */}
        {loading && !data && (
          <>
            <div className="skeleton" style={{ height:150 }} />
            <div className="skeleton" style={{ height:110, opacity:0.8 }} />
            <div className="skeleton" style={{ height:260, opacity:0.6 }} />
          </>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ padding:18, background:'#1C0A0A', border:'1px solid #7F1D1D60', borderRadius:16,
            color:'#FCA5A5', fontSize:14, lineHeight:1.6 }}>
            ⚠️ {error}
            <div style={{ marginTop:12 }}>
              <button onClick={load} style={{ padding:'8px 14px', background:'#1F2937', border:'1px solid #374151',
                borderRadius:10, color:'#F9FAFB', fontSize:13, cursor:'pointer' }}>Try again</button>
            </div>
          </div>
        )}

        {/* Not found */}
        {data && !data.found && (
          <div style={{ padding:24, background:'#0D1117', border:'1px solid #1F2937', borderRadius:20, textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:10 }}>📭</div>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>No updates yet</div>
            <div style={{ fontSize:14, color:'#9CA3AF', lineHeight:1.6 }}>
              India Post hasn't published updates for <b style={{ fontFamily:'monospace' }}>{id}</b> yet.
              Updates usually appear within a few hours of booking.
            </div>
          </div>
        )}

        {data?.found && (
          <>
            {/* Status hero */}
            <section style={{ padding:'20px 20px 22px', borderRadius:22, animation:'fadeIn 0.4s ease',
              background:`linear-gradient(135deg, ${st.color}22 0%, #0D1117 60%)`, border:`1px solid ${st.color}55` }}>
              <div style={{ fontSize:12, color:'#9CA3AF', letterSpacing:'0.08em', fontWeight:600 }}>STATUS</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6 }}>
                <span style={{ fontSize:28 }}>{st.icon}</span>
                <span style={{ fontSize:26, fontWeight:800, fontFamily:"'Syne',sans-serif", color:st.color }}>{status}</span>
              </div>
              {data.events[0] && (
                <div style={{ fontSize:14, color:'#D1D5DB', marginTop:8, lineHeight:1.5 }}>
                  {data.events[0].event} · {data.events[0].office}
                  <div style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>
                    {fmtDay(data.events[0].date)} {fmtTime(data.events[0].time)}
                  </div>
                </div>
              )}
              {status === 'Held at post office' && data.events[0]?.office && (
                <div style={{ marginTop:14, padding:'10px 12px', borderRadius:12, background:'#451A0340',
                  border:'1px solid #92400E80', color:'#FCD34D', fontSize:13, lineHeight:1.5 }}>
                  Your parcel is waiting at <b>{data.events[0].office}</b>. Please collect it soon,
                  or it may be returned to the sender.
                </div>
              )}
              <Progress status={status} />
            </section>

            {/* Parcel details */}
            <section style={{ padding:18, borderRadius:20, background:'#0D1117', border:'1px solid #1F2937' }}>
              <button onClick={copyId} style={{ display:'flex', alignItems:'center', gap:8, background:'none',
                border:'1px solid #374151', borderRadius:10, padding:'8px 12px', color:'#F9FAFB',
                fontFamily:'monospace', fontSize:15, fontWeight:700, cursor:'pointer', letterSpacing:'0.5px' }}>
                ⎘ {id}
              </button>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 16px', marginTop:16 }}>
                <Detail label="FROM" value={b.bookedAt} sub={b.originPincode} />
                <Detail label="TO" value={b.deliveryLocation} sub={b.destinationPincode} />
                <Detail label="BOOKED ON" value={fmtDay(b.bookedOn)} sub={fmtTime(timeFromIso(b.bookedOn))} />
                <Detail label="SERVICE" value={ARTICLE_TYPES[b.articleType] || b.articleType} />
                {b.deliveredOn && <Detail label="DELIVERED ON" value={fmtDay(b.deliveredOn)} />}
              </div>
            </section>

            {/* Timeline */}
            <section style={{ padding:'18px 18px 8px', borderRadius:20, background:'#0D1117', border:'1px solid #1F2937' }}>
              <div style={{ fontSize:12, color:'#9CA3AF', letterSpacing:'0.08em', fontWeight:600, marginBottom:14 }}>
                ALL UPDATES ({data.events.length})
              </div>
              {data.events.map((e, i) => (
                <div key={i} style={{ display:'flex', gap:14 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:14, flexShrink:0 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', marginTop:4,
                      background: i === 0 ? st.color : '#374151',
                      boxShadow: i === 0 ? `0 0 0 4px ${st.color}30` : 'none' }} />
                    {i < data.events.length - 1 && <div style={{ flex:1, width:2, background:'#1F2937', marginTop:4 }} />}
                  </div>
                  <div style={{ paddingBottom:18, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight: i === 0 ? 700 : 600, color: i === 0 ? '#F9FAFB' : '#D1D5DB' }}>
                      {e.event}{e.rts && <span style={{ color:'#EF4444', fontSize:12, marginLeft:6 }}>RETURN</span>}
                    </div>
                    <div style={{ fontSize:13, color:'#9CA3AF', marginTop:2 }}>{e.office}</div>
                    {e.remarks && <div style={{ fontSize:13, color:'#FCD34D', marginTop:2 }}>{e.remarks}</div>}
                    <div style={{ fontSize:12, color:'#6B7280', marginTop:3 }}>{fmtDay(e.date)} · {fmtTime(e.time)}</div>
                  </div>
                </div>
              ))}
            </section>

            {/* Footer: freshness + refresh */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, color:'#6B7280', padding:'0 4px' }}>
              <span>Source: India Post · checked {new Date(data.fetchedAt).toLocaleTimeString('en-IN', { hour:'numeric', minute:'2-digit', timeZone:'Asia/Kolkata' })}</span>
              <button onClick={load} disabled={loading} style={{ background:'none', border:'none', color:'#9CA3AF',
                fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ display:'inline-block', animation: loading ? 'spin 0.8s linear infinite' : 'none' }}>🔄</span>
                Refresh
              </button>
            </div>
          </>
        )}
      </main>

      {copied && (
        <div style={{ position:'fixed', top:76, left:'50%', transform:'translateX(-50%)', zIndex:200,
          padding:'8px 16px', background:'#064E3B', border:'1px solid #059669', borderRadius:999,
          color:'#10B981', fontSize:13, fontWeight:600 }}>✓ {copied}</div>
      )}

      {config?.bottomBar && <BottomBar bar={config.bottomBar} />}
    </>
  );
}

function Detail({ label, value, sub }) {
  return (
    <div style={{ minWidth:0 }}>
      <div style={{ fontSize:11, color:'#6B7280', letterSpacing:'0.08em', fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:600, color:'#F9FAFB', marginTop:3, overflowWrap:'anywhere' }}>{value || '—'}</div>
      {sub && <div style={{ fontSize:12, color:'#9CA3AF', marginTop:1 }}>{sub}</div>}
    </div>
  );
}
