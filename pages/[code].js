import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import OrderListView from '../components/OrderListView';
import { C, FONT_HREF, BASE_CSS } from '../lib/ftTheme';

const BG_REFRESH_MS = 5 * 60 * 1000;

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

// ─── Localization ─────────────────────────────────────────────────
const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ml', label: 'മല', name: 'Malayalam' },
  { code: 'ta', label: 'த',  name: 'Tamil' },
  { code: 'hi', label: 'हि', name: 'Hindi' },
  { code: 'kn', label: 'ಕ',  name: 'Kannada' },
  { code: 'te', label: 'తె', name: 'Telugu' },
];

const T = {
  en: {
    orderTracking:   'Order tracking',
    tapToRefresh:    'Refresh',
    updating:        'Updating…',
    searchPlaceholder: 'Search by name, pincode or order ID...',
    liveOrders:      'Live orders',
    results:         n => `${n} result${n !== 1 ? 's' : ''}`,
    noOrders:        'No active orders right now',
    checkBackSoon:   'Check back soon',
    noResultsFor:    q => `No results for "${q}"`,
    tryDifferent:    'Try a different name or order ID',
  },
  ml: {
    orderTracking:   'ഓർഡർ ട്രാക്കിംഗ്',
    tapToRefresh:    'പുതുക്കാൻ ടാപ്പ് ചെയ്യുക',
    updating:        'അപ്ഡേറ്റ് ചെയ്യുന്നു…',
    searchPlaceholder: 'പേര് അല്ലെങ്കിൽ ഓർഡർ ID തിരയുക...',
    liveOrders:      'തത്സമയ ഓർഡറുകൾ',
    results:         n => `${n} ഫലം`,
    noOrders:        'ഇപ്പോൾ സജീവ ഓർഡറുകൾ ഇല്ല',
    checkBackSoon:   'പിന്നീട് വീണ്ടും നോക്കൂ',
    noResultsFor:    q => `"${q}" ന് ഫലമൊന്നുമില്ല`,
    tryDifferent:    'മറ്റൊരു പേര് അല്ലെങ്കിൽ ID ഉപയോഗിക്കുക',
  },
  ta: {
    orderTracking:   'ஆர்டர் கண்காணிப்பு',
    tapToRefresh:    'புதுப்பிக்க தட்டவும்',
    updating:        'புதுப்பிக்கிறது…',
    searchPlaceholder: 'பெயர் அல்லது ஆர்டர் ID தேடுக...',
    liveOrders:      'நேரடி ஆர்டர்கள்',
    results:         n => `${n} முடிவு`,
    noOrders:        'இப்போது செயலில் உள்ள ஆர்டர்கள் இல்லை',
    checkBackSoon:   'சற்று நேரம் கழித்து பாருங்கள்',
    noResultsFor:    q => `"${q}" க்கு முடிவு இல்லை`,
    tryDifferent:    'வேறு பெயர் அல்லது ID முயற்சிக்கவும்',
  },
  hi: {
    orderTracking:   'ऑर्डर ट्रैकिंग',
    tapToRefresh:    'रिफ्रेश करने के लिए टैप करें',
    updating:        'अपडेट हो रहा है…',
    searchPlaceholder: 'नाम या ऑर्डर ID खोजें...',
    liveOrders:      'लाइव ऑर्डर',
    results:         n => `${n} परिणाम`,
    noOrders:        'अभी कोई सक्रिय ऑर्डर नहीं',
    checkBackSoon:   'थोड़ी देर बाद देखें',
    noResultsFor:    q => `"${q}" के लिए कोई परिणाम नहीं`,
    tryDifferent:    'कोई अलग नाम या ID आज़माएं',
  },
  kn: {
    orderTracking:   'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್',
    tapToRefresh:    'ರಿಫ್ರೆಶ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    updating:        'ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ…',
    searchPlaceholder: 'ಹೆಸರು ಅಥವಾ ಆರ್ಡರ್ ID ಹುಡುಕಿ...',
    liveOrders:      'ನೇರ ಆರ್ಡರ್‌ಗಳು',
    results:         n => `${n} ಫಲಿತಾಂಶ`,
    noOrders:        'ಇದೀಗ ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ',
    checkBackSoon:   'ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ನೋಡಿ',
    noResultsFor:    q => `"${q}" ಗೆ ಫಲಿತಾಂಶಗಳಿಲ್ಲ`,
    tryDifferent:    'ಬೇರೆ ಹೆಸರು ಅಥವಾ ID ಪ್ರಯತ್ನಿಸಿ',
  },
  te: {
    orderTracking:   'ఆర్డర్ ట్రాకింగ్',
    tapToRefresh:    'రిఫ్రెష్ చేయడానికి నొక్కండి',
    updating:        'అప్‌డేట్ అవుతోంది…',
    searchPlaceholder: 'పేరు లేదా ఆర్డర్ ID వెతకండి...',
    liveOrders:      'లైవ్ ఆర్డర్లు',
    results:         n => `${n} ఫలితాలు`,
    noOrders:        'ప్రస్తుతం చురుకైన ఆర్డర్లు లేవు',
    checkBackSoon:   'కొంత సేపటికి మళ్ళీ చూడండి',
    noResultsFor:    q => `"${q}" కి ఫలితాలు లేవు`,
    tryDifferent:    'వేరే పేరు లేదా ID ప్రయత్నించండి',
  },
};

// ─── Suspended brand ──────────────────────────────────────────────
function SuspendedPage({ brandName }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>⏸️</div>
        <div className="ft-display" style={{ fontSize: 22, marginBottom: 14 }}>{brandName}</div>
        <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, padding: '24px 22px' }}>
          <div style={{ display: 'inline-block', background: '#FFF4D1', color: '#7A4A00', borderRadius: 999, padding: '4px 14px', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Service paused</div>
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
  const [lang,      setLang]      = useState('en');

  // Persist language choice
  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('eot_lang');
    if (saved && T[saved]) setLang(saved);
  }, []);
  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('eot_lang', lang);
  }, [lang]);

  const t = T[lang] || T.en;

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res  = await fetch(`/api/orders?code=${code}&t=${Date.now()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrders(data.orders || []);
      setSyncTime(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }));
      setError(null);
    } catch (e) {
      setError('Could not refresh. Check your connection.');
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
      t={t}
      langs={LANGS}
      lang={lang}
      setLang={setLang}
    />
  );
}
