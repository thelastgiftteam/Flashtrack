import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import OrderListView from '../components/OrderListView';
import { C, FONT_HREF, BASE_CSS } from '../lib/ftTheme';

const BG_REFRESH_MS = 30 * 60 * 1000; // shipments change once a day; no need to poll often

// ─── Static generation ────────────────────────────────────────────
export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const code = String(params.code || '').toLowerCase();
  if (!process.env.DATABASE_URL) return { notFound: true, revalidate: 60 };
  try {
    const { publicBrand, publicOrders } = await import('../lib/brands');
    const b = await publicBrand(code);
    if (!b) return { notFound: true, revalidate: 60 };
    const { _id, _trackingMode, ...config } = b;
    const data = config.suspended ? { orders: [], version: 0 } : await publicOrders(b);
    // Uploads and setting changes refresh this page at once; this is a backstop.
    return { props: { code, config, initial: data }, revalidate: 3600 };
  } catch (e) {
    console.error('brand lookup failed', e);
    return { notFound: true, revalidate: 30 };
  }
}

// ─── Paused brand: what customers see when the plan isn't renewed ──
function PausedPage({ brandName, link }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fff' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px' }}>⏸</div>
        <h1 className="ft-display" style={{ fontSize: 24, lineHeight: 1.2 }}>{brandName}’s tracking page is paused</h1>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, marginTop: 10 }}>
          The store’s plan needs to be renewed. Your order is not affected. Ask the store for your tracking number in the meantime.
        </p>
        {link && (
          <a href={link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 20, padding: '13px 22px', borderRadius: 999, background: C.wa, color: '#fff', fontWeight: 700, fontSize: 15 }}>
            Message {brandName}
          </a>
        )}
        <p style={{ color: C.soft, fontSize: 13, marginTop: 26, lineHeight: 1.5 }}>
          Are you the owner of {brandName}? <a href="/login" style={{ color: C.red, fontWeight: 700 }}>Log in to renew</a>
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function TrackingPage({ code, config, initial }) {
  const [orders,    setOrders]    = useState(initial?.orders || []);
  const [version,   setVersion]   = useState(initial?.version || 0);
  const [loading,   setLoading]   = useState(!initial);
  const [refreshing,setRefreshing]= useState(false);
  const [error,     setError]     = useState(null);
  const [syncTime,  setSyncTime]  = useState('');

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res  = await fetch(`/api/orders?code=${code}`); // no cache-buster: lets Vercel serve the cached copy
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Never swap a fresh list for an older cached one
      if (!data.version || data.version >= version) {
        setOrders(data.orders || []);
        if (data.version) setVersion(data.version);
      }
      setSyncTime(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }));
      setError(null);
    } catch (e) {
      setError(true); // OrderListView shows the message in the customer's language
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [code, version]);

  useEffect(() => {
    if (config?.suspended) return;
    if (!initial) fetchOrders();
    const iv = setInterval(() => fetchOrders(false), BG_REFRESH_MS);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (config?.suspended) {
    return (
      <>
        <Head>
          <title>{`${config.brandName || 'Store'} · Tracking paused`}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex" />
          <link href={FONT_HREF} rel="stylesheet" />
        </Head>
        <style dangerouslySetInnerHTML={{ __html: BASE_CSS + 'body{background:#fff;}' }} />
        <PausedPage brandName={config.brandName || 'This store'} link={config.bottomBar?.link} />
      </>
    );
  }

  return (
    <OrderListView
      brandName={config?.brandName || 'Order Tracking'}
      logo={config?.logo}
      orders={orders}
      loading={loading}
      error={error}
      refreshing={refreshing}
      syncTime={syncTime}
      bottomBar={config?.bottomBar}
      showSearch={config?.showSearch !== false}
    />
  );
}
