import AppFrame, { SITE } from '../../components/console/AppFrame';
import PageSettings from '../../components/console/PageSettings';

export default function Page() {
  return (
    <AppFrame title="Your page" subtitle="How your tracking page looks to customers.">
      {(d, reload) => (
        <div style={{ maxWidth: 680 }}>
          <a href={`${SITE}/${d.brand.code}`} target="_blank" rel="noreferrer" className="fc-btn fc-btn-ghost fc-btn-sm" style={{ marginBottom: 14 }}>Open your page ↗</a>
          <PageSettings brand={d.brand} saveUrl="/api/app/brand" onSaved={reload} />
        </div>
      )}
    </AppFrame>
  );
}
