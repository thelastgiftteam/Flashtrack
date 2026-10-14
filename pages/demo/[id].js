import { useCallback } from 'react';
import ParcelView from '../../components/ParcelView';
import { DEMO_CONFIG, DEMO_IDS, demoParcel } from '../../lib/demoData';

// Demo parcel page with sample data. Same UI customers see on a real brand page.

export async function getStaticPaths() {
  return { paths: DEMO_IDS.map(id => ({ params: { id } })), fallback: false };
}

export async function getStaticProps({ params }) {
  return { props: { id: params.id } };
}

export default function DemoParcelPage({ id }) {
  const fetchTracking = useCallback(async () => demoParcel(id), [id]);
  return <ParcelView id={id} backHref="/demo" config={DEMO_CONFIG} fetchTracking={fetchTracking} />;
}
