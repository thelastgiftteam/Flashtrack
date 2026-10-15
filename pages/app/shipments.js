import ShipmentsTable from '../../components/console/ShipmentsTable';
import AppFrame from '../../components/console/AppFrame';
import Link from 'next/link';

export default function Shipments() {
  return (
    <AppFrame title="Shipments" subtitle="Parcels shipped in the last 30 days show on your page. Older ones are removed after 60 days."
      actions={<Link href="/app/add" className="fc-btn fc-btn-primary fc-btn-sm">＋ Add</Link>}>
      {() => <ShipmentsTable url="/api/app/shipments" deleteParam="id" />}
    </AppFrame>
  );
}
