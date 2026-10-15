import { useState, useEffect } from 'react';
import OrderListView from '../../components/OrderListView';
import { DEMO_CONFIG, demoList } from '../../lib/demoData';
import { C } from '../../lib/ftTheme';

// Demo brand order list with sample data, for showing FlashTrack to brands.
// Same UI customers see on a real brand page.

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDay = s => { const [, m, d] = s.split('-'); return `${Number(d)} ${MONTHS[Number(m) - 1]}`; };

export default function DemoList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // client-side so times are always current
    const list = demoList()
      .sort((a, b) => (a.shippedOn < b.shippedOn ? 1 : -1))
      .map(o => ({
        name: o.name, orderId: o.orderId, pincode: o.pincode, trackingId: o.id,
        status: o.status, trackingLink: `/demo/${o.id}`, shippedOn: fmtDay(o.shippedOn),
      }));
    setOrders(list);
    setLoading(false);
  }, []);

  const banner = (
    <div style={{ background: C.ink, color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'center', padding: '9px 16px' }}>
      Demo with sample data. This is exactly what your customers would see.
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
