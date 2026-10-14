import { useCallback } from 'react';
import ParcelView from '../../components/ParcelView';

// Detailed, shareable tracking page for one parcel.
// URL: /<brand code>/<tracking number>   e.g. /728192/EB123456789IN
// Brand config comes from HQ (same as [code].js). Tracking comes from /api/track.

const ID_RE = /^[A-Z]{2}\d{9}[A-Z]{2}$/;

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const code = String(params.code);
  const id   = String(params.id).trim().toUpperCase();
  if (!ID_RE.test(id)) return { notFound: true, revalidate: 60 };

  const HQ = process.env.HQ_ENDPOINT;
  if (!HQ) return { props: { code, id, config: null }, revalidate: 60 };
  try {
    const res  = await fetch(`${HQ}?action=resolve&code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (!data.found) return { notFound: true, revalidate: 60 };
    return { props: { code, id, config: data }, revalidate: 300 };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}

export default function ParcelPage({ code, id, config }) {
  const fetchTracking = useCallback(async () => {
    const r = await fetch(`/api/track?code=${encodeURIComponent(code)}&id=${encodeURIComponent(id)}`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
    return d;
  }, [code, id]);

  return <ParcelView id={id} backHref={`/${code}`} config={config} fetchTracking={fetchTracking} />;
}
