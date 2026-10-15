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
  const { code } = params;
  const HQ = process.env.HQ_ENDPOINT;
  if (!HQ) return { props: { code, config: null }, revalidate: 60 };
  try {
    const res  = await fetch(`${HQ}?action=resolve&code=${code}`);
    const data = await res.json();
    if (!data.found) return { notFound: true, revalidate: 60 };
    return { props: { code, config: data }, revalidate: 300 };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}

// ─── Suspended brand ──────────────────────────────────────────────
function SuspendedPage({ brandName }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>⏸️</div>
        <div className="ft-display" style={{ fontSize: 22, marginBottom: 14 }}>{brandName}</div>
        <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, padding: '24px 22px' }}>
          <div style={{ display: 'inline-block', background: C.cream, color: '#7A4A00', borderRadius: 999, padding: '4px 14px', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Service paused</div>
          <p style={{ color: C.ink, fontSize: 15, lineHeight: 1.65, marginBottom: 10 }}>
            Order tracking for this business is temporarily unavailable.
          </p>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
            If you placed an order, please contact the business directly for updates.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function TrackingPage({ code, config }) {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [error,     setError]     = useState(null);
  const [syncTime,  setSyncTime]  = useState('');

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res  = await fetch(`/api/orders?code=${code}`); // no cache-buster: lets Vercel serve the cached copy
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrders(data.orders || []);
      setSyncTime(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }));
      setError(null);
    } catch (e) {
      setError(true); // OrderListView shows the message in the customer's language
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [code]);

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(() => fetchOrders(false), BG_REFRESH_MS);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  if (config?.suspended) {
    return (
      <>
        <Head>
          <title>Service Paused</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex" />
          <link href={FONT_HREF} rel="stylesheet" />
        </Head>
        <style>{BASE_CSS}</style>
        <SuspendedPage brandName={config.brandName || 'This Store'} />
      </>
    );
  }

  return (
    <OrderListView
      brandName={config?.brandName || 'Order Tracking'}
      orders={orders}
      loading={loading}
      error={error}
      refreshing={refreshing}
      onRefresh={() => fetchOrders(true)}
      syncTime={syncTime}
      bottomBar={config?.bottomBar}
      showSearch={config?.showSearch !== false}
    />
  );
}
