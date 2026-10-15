import { useState, useEffect } from 'react';
import AppFrame, { SITE } from '../../components/console/AppFrame';
import ImportPanel from '../../components/console/ImportPanel';
import { Card, Button, call } from '../../components/console/ui';

export default function Add() {
  // Parcels and logo from the homepage "try it with your file", carried over after signup
  const [tried, setTried] = useState(null);   // rows waiting for a yes/no
  const [useRows, setUseRows] = useState(null); // rows the brand said yes to
  useEffect(() => {
    try {
      const t = JSON.parse(sessionStorage.getItem('ft_try') || 'null');
      sessionStorage.removeItem('ft_try');
      if (t?.logo) call('/api/app/brand', { method: 'PATCH', body: { logo: t.logo } }).catch(() => {});
      if (t?.rows?.length) setTried(t.rows);
    } catch { /* nothing saved */ }
  }, []);
  return (
    <AppFrame title="Add shipments" subtitle="Add the parcels you sent. Each one shows up on your page straight away.">
      {(d, reload) => (
        <div className="fc-stack">
          {tried && (
            <Card title={`Add the ${tried.length} parcel${tried.length > 1 ? 's' : ''} from the file you tried?`}>
              <p style={{ lineHeight: 1.55 }}>These are from the file you dropped on our homepage. If it was a test file or old parcels, skip it and start fresh.</p>
              <div className="fc-row" style={{ marginTop: 14, gap: 10, flexWrap: 'wrap' }}>
                <Button onClick={() => { setUseRows(tried); setTried(null); }}>Yes, check and add them</Button>
                <Button variant="ghost" onClick={() => setTried(null)}>No, start fresh</Button>
              </div>
            </Card>
          )}
          {!tried && <ImportPanel addUrl="/api/app/shipments" ocrUrl="/api/app/ocr" pageUrl={`${SITE}/${d.brand.code}`} onDone={reload} initialRows={useRows} />}
        </div>
      )}
    </AppFrame>
  );
}
