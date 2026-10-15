import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Building blocks shared by the brand dashboard (/app) and the admin
// console (/admin): layout, buttons, cards, tables, forms, toasts.

export const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,400..900;1,62..125,400..900&family=Instrument+Sans:wght@400;500;600;700&display=swap';

export async function call(path, { method = 'GET', body } = {}) {
  const r = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await r.json(); } catch { /* empty */ }
  if (!r.ok) {
    const e = new Error(data.error || 'Something went wrong. Please try again.');
    e.status = r.status;
    throw e;
  }
  return data;
}

// Load data for a page; sends the person to the login page if logged out.
export function useData(path, loginPath) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!path) return;
    try { setData(await call(path)); setError(''); }
    catch (e) {
      if (e.status === 401 && loginPath) router.replace(`${loginPath}?next=${encodeURIComponent(router.asPath)}`);
      else setError(e.message);
    }
  }, [path, loginPath, router]);
  useEffect(() => { load(); }, [load]);
  return { data, error, reload: load, setData };
}

let toastSet = null;
export function toast(msg, tone = 'ok') { toastSet && toastSet({ msg, tone, id: Date.now() }); }
function Toasts() {
  const [t, setT] = useState(null);
  useEffect(() => { toastSet = setT; return () => { toastSet = null; }; }, []);
  useEffect(() => { if (!t) return; const x = setTimeout(() => setT(null), 3200); return () => clearTimeout(x); }, [t]);
  if (!t) return null;
  return <div key={t.id} className={`fc-toast ${t.tone === 'err' ? 'is-err' : ''}`} role="status">{t.tone === 'err' ? '⚠ ' : '✓ '}{t.msg}</div>;
}

export function Shell({ kind, nav, title, subtitle, actions, children, who, onLogout, banner }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const here = router.asPath.split('?')[0];
  const isActive = href => (href === `/${kind}` ? here === href : here === href || here.startsWith(href + '/'));
  return (
    <div className="fc">
      <Head>
        <title>{`${title} · FlashTrack`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href={FONTS} rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <aside className={`fc-side ${open ? 'is-open' : ''}`}>
        <Link href={`/${kind}`} className="fc-brand" onClick={() => setOpen(false)}>
          <img src="/brand/flashtrack-mark.png" alt="" width="34" height="23" />
          <img src="/brand/flashtrack-wordmark-dark.png" alt="FlashTrack" width="100" height="15" />
        </Link>
        {kind === 'admin' && <div className="fc-side-tag">Team console</div>}
        <nav className="fc-nav">
          {nav.map(n => (
            <Link key={n.href} href={n.href} className={`fc-nav-item ${isActive(n.href) ? 'is-active' : ''}`} onClick={() => setOpen(false)}>
              <span className="fc-nav-ico" aria-hidden="true">{n.icon}</span>{n.label}
              {n.badge ? <span className="fc-nav-badge">{n.badge}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="fc-side-foot">
          {who && <div className="fc-who"><div className="fc-who-name">{who.name || who.email}</div><div className="fc-who-sub">{who.sub || who.email}</div></div>}
          {onLogout && <button className="fc-btn fc-btn-ghost fc-btn-sm" onClick={onLogout}>Log out</button>}
        </div>
      </aside>
      {open && <div className="fc-scrim" onClick={() => setOpen(false)} />}
      <div className="fc-main">
        <header className="fc-top">
          <button className="fc-menu" aria-label="Menu" onClick={() => setOpen(true)}>☰</button>
          <div className="fc-top-title">
            <h1>{title}</h1>
            {subtitle && <div className="fc-top-sub">{subtitle}</div>}
          </div>
          <div className="fc-top-actions">{actions}</div>
        </header>
        {banner}
        <main className="fc-content">{children}</main>
      </div>
      <Toasts />
    </div>
  );
}

export function Card({ title, action, children, pad = true, className = '' }) {
  return (
    <section className={`fc-card ${className}`}>
      {(title || action) && <div className="fc-card-head"><h2>{title}</h2>{action}</div>}
      <div className={pad ? 'fc-card-body' : ''}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, tone }) {
  return (
    <div className={`fc-stat ${tone ? 'is-' + tone : ''}`}>
      <div className="fc-stat-label">{label}</div>
      <div className="fc-stat-value">{value}</div>
      {hint && <div className="fc-stat-hint">{hint}</div>}
    </div>
  );
}

export function Pill({ tone = 'grey', children }) {
  return <span className={`fc-pill is-${tone}`}>{children}</span>;
}

export function AccessPill({ access }) {
  if (!access) return null;
  return <Pill tone={access.tone}>{access.label}</Pill>;
}

export function Button({ variant = 'primary', size, busy, children, className = '', ...p }) {
  return (
    <button className={`fc-btn fc-btn-${variant} ${size === 'sm' ? 'fc-btn-sm' : ''} ${className}`} disabled={busy || p.disabled} {...p}>
      {busy ? <span className="fc-spin" aria-hidden="true" /> : null}{children}
    </button>
  );
}

export function Field({ label, hint, children, error }) {
  return (
    <label className="fc-field">
      <span className="fc-label">{label}</span>
      {children}
      {hint && !error && <span className="fc-hint">{hint}</span>}
      {error && <span className="fc-err">{error}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="fc-toggle">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <span className="fc-toggle-ui" aria-hidden="true" />
      <span><span className="fc-toggle-label">{label}</span>{hint && <span className="fc-hint">{hint}</span>}</span>
    </label>
  );
}

export function Empty({ icon = '📦', title, children, action }) {
  return (
    <div className="fc-empty">
      <div className="fc-empty-ico">{icon}</div>
      <div className="fc-empty-title">{title}</div>
      {children && <div className="fc-empty-text">{children}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fc-modal-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fc-scrim" onClick={onClose} />
      <div className="fc-modal">
        <div className="fc-modal-head"><h2>{title}</h2><button className="fc-x" aria-label="Close" onClick={onClose}>✕</button></div>
        <div className="fc-modal-body">{children}</div>
        {footer && <div className="fc-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="fc-tabs" role="tablist">
      {tabs.map(t => (
        <button key={t.value} role="tab" aria-selected={value === t.value} className={`fc-tab ${value === t.value ? 'is-active' : ''}`} onClick={() => onChange(t.value)}>
          {t.label}{t.badge ? <span className="fc-tab-badge">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Loading() {
  return <div className="fc-loading"><span className="fc-spin" /> Loading…</div>;
}

export function ErrorBox({ children }) {
  return children ? <div className="fc-alert is-err">⚠ {children}</div> : null;
}

export function copy(text) {
  try { navigator.clipboard.writeText(text); toast('Copied'); } catch { toast('Could not copy. Select and copy it yourself.', 'err'); }
}

export function fmtDate(d) {
  if (!d) return '—';
  const x = typeof d === 'string' && d.length === 10 ? new Date(d + 'T00:00:00') : new Date(d);
  return x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function fmtWhen(d) {
  if (!d) return 'Never';
  const x = new Date(d), mins = Math.round((Date.now() - x) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return fmtDate(d);
}
export const rupees = n => '₹' + Number(n || 0).toLocaleString('en-IN');

// Shrink an image file in the browser (photos are big; this keeps uploads fast)
export function shrinkImage(file, max = 1600, type = 'image/jpeg', quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const g = c.getContext('2d');
      if (type === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL(type, quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not open that image.')); };
    img.src = url;
  });
}

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#F6F6F7;color:#121212;font-family:'Instrument Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;font-size:15px;}
a{color:inherit;text-decoration:none;}
button,input,select,textarea{font:inherit;color:inherit;}
.fc{display:flex;min-height:100vh;}
.fc h1,.fc h2,.fc h3{font-family:'Archivo',system-ui,sans-serif;font-stretch:105%;letter-spacing:-0.01em;}

/* Sidebar */
.fc-side{position:fixed;inset:0 auto 0 0;width:236px;background:#fff;border-right:1px solid #E7E7EA;display:flex;flex-direction:column;padding:18px 12px;z-index:60;}
.fc-brand{display:flex;align-items:center;gap:7px;padding:4px 8px 6px;}
.fc-side-tag{margin:2px 8px 0;font-size:11.5px;font-weight:700;color:#C4050A;}
.fc-nav{display:flex;flex-direction:column;gap:2px;margin-top:22px;}
.fc-nav-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;font-weight:600;font-size:14.5px;color:#3F3F46;transition:background-color .12s,color .12s;}
.fc-nav-item:hover{background:#F4F4F5;color:#121212;}
.fc-nav-item.is-active{background:#121212;color:#fff;}
.fc-nav-ico{width:20px;text-align:center;font-size:15px;}
.fc-nav-badge{margin-left:auto;background:#DF1515;color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:1px 7px;}
.fc-side-foot{margin-top:auto;border-top:1px solid #EFEFF1;padding:14px 8px 0;display:flex;flex-direction:column;gap:10px;}
.fc-who-name{font-weight:700;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fc-who-sub{font-size:12.5px;color:#71717A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fc-main{flex:1;min-width:0;margin-left:236px;}
.fc-top{position:sticky;top:0;z-index:40;background:rgba(246,246,247,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;gap:12px;padding:20px 32px 14px;}
.fc-top h1{font-size:24px;font-weight:800;line-height:1.15;}
.fc-top-sub{font-size:14px;color:#71717A;margin-top:2px;}
.fc-top-title{min-width:0;flex:1;}
.fc-top-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;}
.fc-menu{display:none;border:1px solid #E4E4E7;background:#fff;border-radius:10px;width:40px;height:40px;font-size:18px;cursor:pointer;flex-shrink:0;}
.fc-content{padding:6px 32px 48px;max-width:1180px;}
.fc-scrim{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:55;}
@media (max-width:900px){
  .fc-side{transform:translateX(-100%);transition:transform .2s ease;box-shadow:0 0 40px rgba(0,0,0,.2);}
  .fc-side.is-open{transform:none;}
  .fc-main{margin-left:0;}
  .fc-menu{display:block;}
  .fc-top{padding:14px 16px 10px;}
  .fc-top h1{font-size:20px;}
  .fc-content{padding:4px 16px 40px;}
}

/* Cards, stats, grids */
.fc-grid{display:grid;gap:16px;}
.fc-grid-2{grid-template-columns:repeat(2,minmax(0,1fr));}
.fc-grid-3{grid-template-columns:repeat(3,minmax(0,1fr));}
.fc-grid-4{grid-template-columns:repeat(4,minmax(0,1fr));}
@media (max-width:1000px){.fc-grid-4{grid-template-columns:repeat(2,minmax(0,1fr));}.fc-grid-3{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media (max-width:640px){.fc-grid-2,.fc-grid-3{grid-template-columns:1fr;}}
.fc-stack{display:flex;flex-direction:column;gap:16px;}
.fc-grid-stats{grid-template-columns:repeat(3,minmax(0,1fr));}
@media (max-width:640px){.fc-grid-stats{gap:8px;}.fc-grid-stats .fc-stat{padding:12px;}.fc-grid-stats .fc-stat-value{font-size:22px;}.fc-grid-stats .fc-stat-label{font-size:12px;}.fc-grid-stats .fc-stat-hint{display:none;}}
.fc-card{background:#fff;border:1px solid #E7E7EA;border-radius:14px;min-width:0;}
.fc-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px 0;}
.fc-card-head h2{font-size:16px;font-weight:700;}
.fc-card-body{padding:16px 18px 18px;}
.fc-stat{background:#fff;border:1px solid #E7E7EA;border-radius:14px;padding:16px 18px;min-width:0;}
.fc-stat-label{font-size:13px;font-weight:600;color:#71717A;}
.fc-stat-value{font-family:'Archivo',system-ui,sans-serif;font-weight:800;font-size:28px;margin-top:4px;line-height:1.1;}
.fc-stat-hint{font-size:12.5px;color:#8E8E98;margin-top:4px;}
.fc-stat.is-red .fc-stat-value{color:#C4050A;}
.fc-stat.is-amber .fc-stat-value{color:#A16207;}
.fc-stat.is-green .fc-stat-value{color:#16884F;}

/* Pills */
.fc-pill{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;border-radius:999px;padding:3px 9px;white-space:nowrap;}
.fc-pill.is-green{background:#E7F6EE;color:#13693E;}
.fc-pill.is-amber{background:#FFF3C4;color:#7A5600;}
.fc-pill.is-red{background:#FDECEC;color:#A11212;}
.fc-pill.is-grey{background:#EFEFF1;color:#52525B;}
.fc-pill.is-dark{background:#121212;color:#fff;}
.fc-pill.is-yellow{background:#FEC200;color:#121212;}

/* Buttons */
.fc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;padding:10px 16px;font-weight:700;font-size:14.5px;border:1px solid transparent;cursor:pointer;white-space:nowrap;transition:background-color .12s,border-color .12s,transform .08s;}
.fc-btn:active{transform:scale(.98);}
.fc-btn:disabled{opacity:.55;cursor:default;transform:none;}
.fc-btn-primary{background:#DF1515;color:#fff;}
.fc-btn-primary:hover:not(:disabled){background:#C4050A;}
.fc-btn-dark{background:#121212;color:#fff;}
.fc-btn-dark:hover:not(:disabled){background:#2A2A2E;}
.fc-btn-ghost{background:#fff;border-color:#E4E4E7;color:#121212;}
.fc-btn-ghost:hover:not(:disabled){border-color:#A1A1AA;}
.fc-btn-danger{background:#fff;border-color:#F5B5B8;color:#A11212;}
.fc-btn-danger:hover:not(:disabled){background:#FDECEC;}
.fc-btn-wa{background:#1FA855;color:#fff;}
.fc-btn-sm{padding:6px 11px;font-size:13px;border-radius:8px;}
.fc-btn-block{width:100%;}
.fc-link{color:#C4050A;font-weight:700;cursor:pointer;background:none;border:none;padding:0;}
.fc-link:hover{text-decoration:underline;}

/* Forms */
.fc-field{display:flex;flex-direction:column;gap:6px;min-width:0;}
.fc-label{font-size:13.5px;font-weight:700;color:#27272A;}
.fc-hint{font-size:12.5px;color:#71717A;display:block;margin-top:2px;line-height:1.45;}
.fc-err{font-size:12.5px;color:#A11212;font-weight:600;}
.fc-input,.fc-select,.fc-textarea{width:100%;border:1px solid #D4D4D8;border-radius:10px;padding:10px 12px;background:#fff;font-size:15px;outline:none;transition:border-color .12s,box-shadow .12s;}
.fc-input:focus,.fc-select:focus,.fc-textarea:focus{border-color:#121212;box-shadow:0 0 0 3px rgba(254,194,0,.45);}
.fc-textarea{min-height:120px;resize:vertical;line-height:1.5;}
.fc-form{display:flex;flex-direction:column;gap:16px;}
.fc-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
.fc-row-between{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;}
.fc-toggle{display:flex;gap:12px;align-items:flex-start;cursor:pointer;}
.fc-toggle input{position:absolute;opacity:0;width:1px;height:1px;}
.fc-toggle-ui{flex-shrink:0;width:42px;height:24px;border-radius:999px;background:#D4D4D8;position:relative;transition:background-color .15s;margin-top:1px;}
.fc-toggle-ui::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s;}
.fc-toggle input:checked + .fc-toggle-ui{background:#16884F;}
.fc-toggle input:checked + .fc-toggle-ui::after{transform:translateX(18px);}
.fc-toggle input:focus-visible + .fc-toggle-ui{box-shadow:0 0 0 3px rgba(254,194,0,.6);}
.fc-toggle-label{font-weight:700;font-size:14.5px;display:block;}
.fc-choice{display:flex;gap:12px;align-items:flex-start;border:1.5px solid #E4E4E7;border-radius:12px;padding:14px;cursor:pointer;transition:border-color .12s,background-color .12s;}
.fc-choice.is-on{border-color:#121212;background:#FAFAFA;}
.fc-choice input{margin-top:3px;accent-color:#DF1515;}
a:focus-visible,button:focus-visible{outline:3px solid #FEC200;outline-offset:2px;}

/* Tables */
.fc-table-wrap{overflow-x:auto;}
.fc-table{width:100%;border-collapse:collapse;font-size:14px;}
.fc-table th{text-align:left;font-size:12.5px;font-weight:700;color:#71717A;padding:10px 14px;border-bottom:1px solid #E7E7EA;white-space:nowrap;background:#FAFAFA;}
.fc-table td{padding:11px 14px;border-bottom:1px solid #F1F1F3;vertical-align:middle;}
.fc-table tr:last-child td{border-bottom:none;}
.fc-table tr.is-click{cursor:pointer;}
.fc-table tr.is-click:hover td{background:#FAFAFA;}
.fc-mono{font-variant-numeric:tabular-nums;letter-spacing:.02em;font-weight:600;}
.fc-muted{color:#71717A;}
.fc-small{font-size:13px;}
.fc-strong{font-weight:700;}

/* Tabs */
.fc-tabs{display:flex;gap:4px;border-bottom:1px solid #E4E4E7;margin-bottom:18px;overflow-x:auto;scrollbar-width:none;}
.fc-tabs::-webkit-scrollbar{display:none;}
.fc-tab{border:none;background:none;padding:10px 14px;font-weight:700;font-size:14.5px;color:#71717A;border-bottom:2.5px solid transparent;cursor:pointer;white-space:nowrap;margin-bottom:-1px;}
.fc-tab:hover{color:#121212;}
.fc-tab.is-active{color:#121212;border-bottom-color:#DF1515;}
.fc-tab-badge{margin-left:6px;background:#EFEFF1;border-radius:999px;padding:1px 7px;font-size:11.5px;}

/* Alerts, empty, loading, toast, modal */
.fc-alert{border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.5;border:1px solid;}
.fc-alert.is-err{background:#FDECEC;border-color:#F5B5B8;color:#7F1010;}
.fc-alert.is-warn{background:#FFF8DB;border-color:#F3D97A;color:#5C4200;}
.fc-alert.is-ok{background:#E7F6EE;border-color:#B7E2C8;color:#0F5132;}
.fc-alert.is-info{background:#F4F4F5;border-color:#E4E4E7;color:#27272A;}
.fc-banner{margin:0 32px 12px;}
@media (max-width:900px){.fc-banner{margin:0 16px 10px;}}
.fc-empty{text-align:center;padding:40px 16px;}
.fc-empty-ico{font-size:34px;}
.fc-empty-title{font-weight:700;font-size:16px;margin-top:8px;}
.fc-empty-text{color:#71717A;font-size:14px;margin-top:4px;line-height:1.5;}
.fc-loading{display:flex;align-items:center;gap:10px;color:#71717A;padding:40px 4px;}
.fc-spin{width:16px;height:16px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:fcSpin .7s linear infinite;display:inline-block;}
@keyframes fcSpin{to{transform:rotate(360deg);}}
.fc-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#121212;color:#fff;padding:11px 18px;border-radius:999px;font-weight:600;font-size:14px;z-index:200;box-shadow:0 10px 30px -8px rgba(0,0,0,.4);animation:fcUp .2s ease;max-width:calc(100vw - 32px);}
.fc-toast.is-err{background:#A11212;}
@keyframes fcUp{from{opacity:0;transform:translate(-50%,10px);}to{opacity:1;transform:translate(-50%,0);}}
.fc-modal-wrap{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;}
.fc-modal-wrap .fc-scrim{z-index:0;}
.fc-modal{position:relative;background:#fff;border-radius:16px;width:100%;max-width:520px;max-height:calc(100vh - 32px);overflow:auto;box-shadow:0 30px 70px -20px rgba(0,0,0,.45);animation:fcUp2 .18s ease;}
@keyframes fcUp2{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.fc-modal-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 0;}
.fc-modal-head h2{font-size:18px;}
.fc-modal-body{padding:16px 20px;}
.fc-modal-foot{padding:0 20px 18px;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;}
.fc-x{border:none;background:#F4F4F5;width:32px;height:32px;border-radius:50%;cursor:pointer;}
.fc-kv{display:grid;grid-template-columns:140px 1fr;gap:10px 14px;font-size:14px;}
.fc-kv dt{color:#71717A;font-weight:600;}
.fc-kv dd{min-width:0;overflow-wrap:anywhere;}
@media (max-width:640px){.fc-kv{grid-template-columns:1fr;gap:2px;}.fc-kv dd{margin-bottom:8px;}}
.fc-linkbox{display:flex;align-items:center;gap:8px;border:1.5px dashed #121212;border-radius:12px;padding:10px 10px 10px 14px;background:#FFFCF0;min-width:0;}
.fc-linkbox span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-size:15.5px;}
.fc-steps{display:flex;flex-direction:column;gap:10px;}
.fc-step{display:flex;gap:12px;align-items:center;padding:12px;border:1px solid #EFEFF1;border-radius:12px;}
.fc-step-n{width:28px;height:28px;border-radius:50%;background:#F4F4F5;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.fc-step.is-done .fc-step-n{background:#16884F;color:#fff;}
.fc-step.is-done .fc-step-t{color:#71717A;text-decoration:line-through;}
.fc-step-t{font-weight:700;font-size:14.5px;}
.fc-drop{border:2px dashed #D4D4D8;border-radius:14px;padding:30px 16px;text-align:center;cursor:pointer;transition:border-color .12s,background-color .12s;background:#FCFCFC;display:block;}
.fc-drop:hover,.fc-drop.is-over{border-color:#121212;background:#FFFCF0;}
.fc-drop input{display:none;}
.fc-drop-ico{font-size:30px;}
.fc-drop-t{font-weight:700;margin-top:6px;}
.fc-drop-h{font-size:13px;color:#71717A;margin-top:4px;}
.fc-auth{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;background:#F6F6F7;}
.fc-auth-box{width:100%;max-width:420px;}
.fc-auth-logo{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:22px;}
.fc-auth-card{background:#fff;border:1px solid #E7E7EA;border-radius:16px;padding:26px 24px;}
.fc-auth-card h1{font-size:23px;font-weight:800;}
.fc-auth-sub{color:#71717A;font-size:14.5px;margin-top:4px;margin-bottom:20px;line-height:1.5;}
.fc-auth-foot{text-align:center;font-size:14px;color:#71717A;margin-top:16px;}
@media (prefers-reduced-motion:reduce){.fc *{animation:none!important;transition:none!important;}}
`;

export const AUTH_CSS = CSS;
