import { C } from '../lib/ftTheme';

// Fixed bottom bar configured per brand in the sheet's admin tab
// (bottombar_mode / text / link / active). Same behaviour as before.
export default function BrandBar({ bar }) {
  if (!bar || !bar.text || bar.active === false) return null;
  const isBtn = bar.mode === 'button' && bar.link;
  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: '15px 20px', borderRadius: 999,
      background: isBtn ? C.wa : C.ink, color: '#fff',
      fontSize: 15, fontWeight: 600, textAlign: 'center',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,.45)',
    }}>
      {isBtn && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/>
        </svg>
      )}
      <span>{bar.text}</span>
    </div>
  );
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      padding: '14px 16px 18px',
      background: `linear-gradient(to top, ${C.mist} 55%, rgba(244,244,245,0))`,
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {isBtn ? <a href={bar.link} target="_blank" rel="noreferrer">{inner}</a> : inner}
      </div>
    </div>
  );
}
