import Head from 'next/head';
import { C, FONT_HREF, BASE_CSS } from '../lib/ftTheme';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Tracking page not found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href={FONT_HREF} rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: BASE_CSS + 'body{background:#fff;}' }} />
      <div className="ft-stripe" />
      <div style={{ minHeight: 'calc(100vh - 5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
        <div style={{ maxWidth: 340 }}>
          <img src="/brand/flashtrack-mark.png" alt="" width="96" height="65" style={{ display: 'block', margin: '0 auto 18px' }} />
          <h1 className="ft-display" style={{ fontSize: 26, marginBottom: 10 }}>Tracking page not found</h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6 }}>
            Check the link the store sent you. If it still doesn’t open, message the store for a new link.
          </p>
          <a href="/" style={{ display: 'inline-block', marginTop: 22, padding: '11px 20px', borderRadius: 999, background: C.ink, color: '#fff', fontSize: 14, fontWeight: 700 }}>Go to FlashTrack</a>
        </div>
      </div>
    </>
  );
}
