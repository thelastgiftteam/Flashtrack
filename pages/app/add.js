import { useState, useEffect } from 'react';
import AppFrame, { SITE } from '../../components/console/AppFrame';
import ImportPanel from '../../components/console/ImportPanel';

export default function Add() {
  // Parcels from the homepage "try it with your file", carried over after signup
  const [tried, setTried] = useState(null);
  useEffect(() => {
    try {
      const t = JSON.parse(sessionStorage.getItem('ft_try') || 'null');
      sessionStorage.removeItem('ft_try');
      if (t?.rows?.length) setTried(t.rows);
    } catch { /* nothing saved */ }
  }, []);
  return (
    <AppFrame title="Add shipments" subtitle="Add the parcels you sent. Each one shows up on your page straight away.">
      {(d, reload) => <ImportPanel addUrl="/api/app/shipments" ocrUrl="/api/app/ocr" pageUrl={`${SITE}/${d.brand.code}`} onDone={reload} initialRows={tried} />}
    </AppFrame>
  );
}
