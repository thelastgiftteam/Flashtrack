import { useState } from 'react';
import Link from 'next/link';
import ShipmentsTable from '../../components/console/ShipmentsTable';
import AppFrame from '../../components/console/AppFrame';
import { Tabs } from '../../components/console/ui';

export default function Shipments() {
  const [tab, setTab] = useState('current');
  return (
    <AppFrame title="Shipments" subtitle="Your page shows parcels shipped in the last 30 days."
      actions={<Link href="/app/add" className="fc-btn fc-btn-primary fc-btn-sm">＋ Add</Link>}>
      {() => (
        <>
          <Tabs value={tab} onChange={setTab} tabs={[
            { value: 'current', label: 'Last 30 days' },
            { value: 'past', label: 'Past shipments' },
          ]} />
          {tab === 'current'
            ? <ShipmentsTable key="c" url="/api/app/shipments" deleteParam="id" />
            : <ShipmentsTable key="p" url="/api/app/shipments?range=past" deleteParam="id" past />}
        </>
      )}
    </AppFrame>
  );
}
