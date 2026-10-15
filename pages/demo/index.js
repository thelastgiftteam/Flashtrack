import { useState, useEffect } from 'react';
import OrderListView from '../../components/OrderListView';
import { DEMO_CONFIG, demoCards } from '../../lib/demoData';
import { C } from '../../lib/ftTheme';

// Demo brand order list with sample data, for showing FlashTrack to brands.
// Same UI customers see on a real brand page.

export default function DemoList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // client-side so dates are always current
    setOrders(demoCards());
    setLoading(false);
  }, []);

  const banner = (
    <div style={{ background: C.ink, color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'center', padding: '9px 16px' }}>
      Demo with sample data. Tap Track parcel to see what customers get.
    </div>
  );

  return (
    <OrderListView
      brandName={DEMO_CONFIG.brandName}
      orders={orders}
      loading={loading}
      bottomBar={DEMO_CONFIG.bottomBar}
      banner={banner}
    />
  );
}
