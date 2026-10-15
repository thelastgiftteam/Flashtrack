import { useState } from 'react';
import { Card, Button, Field, Toggle, call, toast, shrinkImage } from './ui';

// The customer page's look and buttons. Used by brands and by your team.
export default function PageSettings({ brand, saveUrl, onSaved }) {
  const [f, setF] = useState({
    name: brand.name || '', whatsapp: brand.whatsapp || '', barText: brand.barText ?? brand.bar_text ?? '',
    showSearch: brand.showSearch ?? brand.show_search ?? true, trackingMode: brand.trackingMode || brand.tracking_mode || 'speedposttrack',
    logo: brand.logo || '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  async function pickLogo(file) {
    if (!file) return;
    try { set('logo', await shrinkImage(file, 256, 'image/png')); }
    catch (e) { toast(e.message, 'err'); }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await call(saveUrl, { method: 'PATCH', body: f });
      toast('Saved. The page is updated.');
      onSaved && onSaved();
    } catch (e2) { setErr(e2.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="fc-stack">
      <Card title="Brand">
        <div className="fc-form">
          <Field label="Brand name" hint="Shown at the top of your tracking page.">
            <input className="fc-input" value={f.name} onChange={e => set('name', e.target.value)} maxLength={80} required />
          </Field>
          <Field label="Logo" hint="Square works best. It’s shrunk automatically.">
            <div className="fc-row">
              {f.logo
                ? <img src={f.logo} alt="" width="56" height="56" style={{ borderRadius: 12, border: '1px solid #E4E4E7', objectFit: 'cover' }} />
                : <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1A1AA' }}>Logo</div>}
              <label className="fc-btn fc-btn-ghost fc-btn-sm" style={{ cursor: 'pointer' }}>
                {f.logo ? 'Change' : 'Upload'}
                <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => { pickLogo(e.target.files[0]); e.target.value = ''; }} />
              </label>
              {f.logo && <button type="button" className="fc-link" onClick={() => set('logo', '')}>Remove</button>}
            </div>
          </Field>
        </div>
      </Card>

      <Card title="WhatsApp button">
        <div className="fc-form">
          <Field label="WhatsApp number" hint="Customers tap the green button at the bottom of the page to message you. Leave empty to hide it.">
            <input className="fc-input" value={f.whatsapp} onChange={e => set('whatsapp', e.target.value)} inputMode="tel" placeholder="98765 43210" />
          </Field>
          <Field label="Button text" hint={`Leave empty for “Questions? Chat with ${f.name || 'us'} on WhatsApp”.`}>
            <input className="fc-input" value={f.barText} onChange={e => set('barText', e.target.value)} maxLength={80} />
          </Field>
        </div>
      </Card>

      <Card title="Tracking">
        <div className="fc-form">
          <Toggle checked={f.showSearch} onChange={v => set('showSearch', v)} label="Show the search box" hint="Customers search by name, pincode or tracking number." />
          <div className="fc-stack" style={{ gap: 10 }}>
            <span className="fc-label">When a customer taps “Track parcel”</span>
            {[
              ['speedposttrack', 'Open the live tracking page', 'Shows every India Post update. Recommended.'],
              ['indiapost', 'Open India Post’s website', 'The tracking number is copied, then India Post opens. Use this if the live tracking page isn’t working.'],
            ].map(([v, t, h]) => (
              <label key={v} className={`fc-choice ${f.trackingMode === v ? 'is-on' : ''}`}>
                <input type="radio" name="tm" checked={f.trackingMode === v} onChange={() => set('trackingMode', v)} />
                <span><span className="fc-toggle-label">{t}</span><span className="fc-hint">{h}</span></span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {err && <div className="fc-alert is-err">⚠ {err}</div>}
      <div><Button type="submit" busy={busy}>Save changes</Button></div>
    </form>
  );
}
