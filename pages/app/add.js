import AppFrame, { SITE } from '../../components/console/AppFrame';
import ImportPanel from '../../components/console/ImportPanel';

export default function Add() {
  return (
    <AppFrame title="Add shipments" subtitle="Add the parcels you sent. Each one shows up on your page straight away.">
      {(d, reload) => <ImportPanel addUrl="/api/app/shipments" ocrUrl="/api/app/ocr" pageUrl={`${SITE}/${d.brand.code}`} onDone={reload} />}
    </AppFrame>
  );
}
