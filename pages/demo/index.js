import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DEMO_CONFIG, demoList } from '../../lib/demoData';

// Demo brand order list with sample data, for showing FlashTrack to brands.

const STATUS_COLOR = {
  'Delivered':           '#10B981',
  'Out for delivery':    '#F59E0B',
  'Held at post office': '#F59E0B',
  'In transit':          '#60A5FA',
  'Returning to sender': '#EF4444',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDay = s => { const [y, m, d] = s.split('-'); return `${Number(d)} ${MONTHS[Number(m) - 1]}`; };
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export default function DemoList() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState('');
  useEffect(() => { setOrders(demoList()); }, []); // client-side so times are always current

  const shown = orders.filter(o => {
    const s = q.toLowerCase().trim();
    return !s || o.name.toLowerCase().includes(s) || o.orderId.toLowerCase().includes(s)
      || o.pincode.includes(s) || o.id.toLowerCase().includes(s);
  });
  const bar = DEMO_CONFIG.bottomBar;

  return (
    <>
      <Head>
        <title>FlashTrack Demo — Order Tracking</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="See what your customers see: a branded order tracking page powered by FlashTrack." />
        <meta name="theme-color" content="#030712" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0B0F19;color:#F9FAFB;font-family:'DM Sans',sans-serif;min-height:100vh;padding-bottom:120px;-webkit-font-smoothing:antialiased;}
        input{border:none;outline:none;font-family:inherit;}
        input::placeholder{color:#9CA3AF;}
        a{text-decoration:none;color:inherit;}
      `}</style>

      {/* Demo banner */}
      <div style={{ background:'linear-gradient(90deg,#7F1D1D,#92400E)', color:'#FDE68A', fontSize:13,
        textAlign:'center', padding:'8px 16px', fontWeight:600 }}>
        Demo with sample data · This is exactly what your customers would see
      </div>

      <header style={{ position:'sticky', top:0, zIndex:100, background:'rgba(3,7,18,0.88)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid #0D1117' }}>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'14px 16px' }}>
          <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif", letterSpacing:'-0.5px' }}>
            {DEMO_CONFIG.brandName.toUpperCase()}
          </div>
          <div style={{ fontSize:12, letterSpacing:'0.08em', marginTop:1 }}>ORDER TRACKING</div>
        </div>
      </header>

      <main style={{ maxWidth:560, margin:'0 auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:12 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, pincode or order ID..."
          style={{ width:'100%', padding:'14px 16px', background:'#FFFFFF', borderRadius:16, color:'#111827',
            fontSize:14, fontWeight:500, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }} />

        <div style={{ fontSize:11, letterSpacing:'0.08em', fontWeight:600, marginTop:4 }}>
          {q ? `${shown.length} RESULT${shown.length !== 1 ? 'S' : ''}` : 'LIVE ORDERS'}
        </div>

        {shown.map(o => {
          const c = STATUS_COLOR[o.status] || '#60A5FA';
          return (
            <a key={o.id} href={`/demo/${o.id}`} style={{ display:'block', padding:'16px 18px', borderRadius:20,
              background:'linear-gradient(135deg,#0D1117 0%,#111827 100%)', border:'1px solid #1F2937',
              borderTop:`2px solid ${c}80` }}>
              <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'#2563EB', display:'flex',
                  alignItems:'center', justifyContent:'center', fontWeight:700, fontFamily:"'Syne',sans-serif", flexShrink:0 }}>
                  {initials(o.name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:16, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{o.name}</div>
                  <div style={{ fontSize:11, color:'#9CA3AF', marginTop:3 }}>
                    <span style={{ fontFamily:'monospace', color:'#6B7280' }}>{o.orderId}</span> · 📍 {o.pincode} · {fmtDay(o.shippedOn)}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12,
                paddingTop:12, borderTop:'1px solid #1A2030' }}>
                <span style={{ fontSize:12, fontWeight:700, color:c }}>● {o.status}</span>
                <span style={{ padding:'5px 14px', borderRadius:999, background:'#064E3B', border:'1px solid #059669',
                  color:'#10B981', fontSize:11, fontWeight:600 }}>📦 Track</span>
              </div>
            </a>
          );
        })}
      </main>

      <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'12px 16px 20px',
        background:'linear-gradient(to top, #030712 60%, transparent)', zIndex:50 }}>
        <a href={bar.link} target="_blank" rel="noreferrer" style={{ display:'block', maxWidth:560, margin:'0 auto',
          padding:'14px 20px', background:'linear-gradient(135deg,#064E3B,#065F46)', border:'1px solid #059669',
          borderRadius:16, color:'#10B981', fontSize:14, fontWeight:600, textAlign:'center' }}>
          💬 {bar.text}
        </a>
      </div>
    </>
  );
}
