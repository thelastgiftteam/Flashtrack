import { useState, useRef } from 'react';
import { Card, Button, Tabs, call, toast, shrinkImage } from './ui';
import { parseGrid, parseCsv, parseLines, normalizeRows } from '../../lib/shipmentParse';

// Add shipments three ways. Everything is shown for checking before saving.
// addUrl: POST { rows, source }   ocrUrl: POST { image, mimeType }
export default function ImportPanel({ addUrl, ocrUrl, pageUrl, onDone }) {
  const [mode, setMode] = useState('excel');
  const [rows, setRows] = useState(null);
  const [source, setSource] = useState('excel');
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [text, setText] = useState('');
  const [over, setOver] = useState(false);
  const [progress, setProgress] = useState('');
  const [existing, setExisting] = useState(new Set());
  const fileRef = useRef(null);
  const today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

  function reset() { setRows(null); setProblem(''); setResult(null); setText(''); setProgress(''); setExisting(new Set()); }

  // Mark rows already on the page before anything is saved
  async function show(list, src) {
    setSource(src); setRows(list); setExisting(new Set());
    try {
      const out = await call(addUrl, { method: 'POST', body: { check: list.map(r => r.trackingId) } });
      setExisting(new Set(out.existing || []));
    } catch { /* preview still works without it */ }
  }

  async function readSheet(file) {
    reset();
    if (!file) return;
    const name = file.name.toLowerCase();
    try {
      let grid;
      if (name.endsWith('.csv') || name.endsWith('.txt')) {
        grid = parseCsv(await file.text());
      } else if (name.endsWith('.xlsx')) {
        const { default: readXlsxFile } = await import('read-excel-file');
        grid = await readXlsxFile(file);
      } else if (name.endsWith('.xls')) {
        setProblem('This is an old Excel file (.xls). Open it in Excel or Google Sheets and save it as .xlsx or .csv, then upload again.');
        return;
      } else {
        setProblem('Upload an Excel file (.xlsx) or a CSV file.');
        return;
      }
      const out = parseGrid(grid);
      if (out.error) { setProblem(out.error); return; }
      show(out.rows, 'excel');
    } catch (e) {
      setProblem('Could not read that file. If it opens in Excel, save it as .xlsx and try again.');
    }
  }

  async function readPhotos(files) {
    reset();
    const list = Array.from(files || []).slice(0, 10);
    if (!list.length) return;
    setBusy(true);
    const all = [];
    try {
      for (let i = 0; i < list.length; i++) {
        setProgress(list.length > 1 ? `Reading photo ${i + 1} of ${list.length}…` : 'Reading the photo…');
        const dataUrl = await shrinkImage(list[i]);
        const out = await call(ocrUrl, { method: 'POST', body: { image: dataUrl.split(',')[1], mimeType: 'image/jpeg' } });
        all.push(...out.rows);
      }
      if (!all.length) setProblem('No tracking numbers found. Take the photo straight on, in good light, with the whole receipt in the frame.');
      else show(all, 'photo');
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false); setProgress('');
    }
  }

  function readText() {
    setProblem(''); setResult(null);
    const out = parseLines(text);
    if (!out.length) { setProblem('No tracking numbers found. Put one parcel per line, like: Anjali Menon 682030 EL123456789IN'); return; }
    show(out, 'manual');
  }

  function edit(i, key, val) {
    setRows(r => r.map((x, j) => (j === i ? { ...x, [key]: val } : x)));
  }
  function remove(i) { setRows(r => r.filter((_, j) => j !== i)); }

  async function save() {
    setBusy(true); setProblem('');
    try {
      const out = await call(addUrl, { method: 'POST', body: { rows, source } });
      setResult(out);
      setRows(null); setText('');
      toast(out.added ? `${out.added} shipment${out.added > 1 ? 's' : ''} added` : 'Nothing new to add');
      onDone && onDone(out);
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  }

  const checked = rows ? normalizeRows(rows, today) : null;
  const badSet = new Set((checked?.bad || []).map(b => b.trackingId));
  const newCount = checked ? checked.ok.filter(r => !existing.has(r.trackingId)).length : 0;
  const dupInFile = rows ? rows.length - (checked.ok.length + checked.bad.length) : 0;

  return (
    <div className="fc-stack">
      <Card>
        <Tabs value={mode} onChange={m => { setMode(m); reset(); }} tabs={[
          { value: 'excel', label: '📄 Excel file' },
          { value: 'photo', label: '📷 Photo of receipt' },
          { value: 'type', label: '⌨️ Type or paste' },
        ]} />

        {mode === 'excel' && !rows && (
          <label className={`fc-drop ${over ? 'is-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
            onDrop={e => { e.preventDefault(); setOver(false); readSheet(e.dataTransfer.files[0]); }}>
            <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls,.txt" onChange={e => { readSheet(e.target.files[0]); e.target.value = ''; }} />
            <div className="fc-drop-ico">📄</div>
            <div className="fc-drop-t">Drop the day’s Excel file here, or tap to choose</div>
            <div className="fc-drop-h">India Post’s download works as it is. Your own sheet works too if it has columns for name, pincode and tracking number.</div>
          </label>
        )}

        {mode === 'photo' && !rows && (
          <label className="fc-drop">
            <input type="file" accept="image/*" multiple onChange={e => { readPhotos(e.target.files); e.target.value = ''; }} disabled={busy} />
            <div className="fc-drop-ico">{busy ? '⏳' : '📷'}</div>
            <div className="fc-drop-t">{busy ? progress : 'Take or choose photos of the booking receipts'}</div>
            <div className="fc-drop-h">Up to 10 photos at once. Hold the phone straight above the receipt, in good light.</div>
          </label>
        )}

        {mode === 'type' && !rows && (
          <div className="fc-form">
            <textarea className="fc-textarea" value={text} onChange={e => setText(e.target.value)}
              placeholder={'One parcel per line:\nAnjali Menon 682030 EL123456789IN\nRahul Krishnan 560034 EL987654321IN'} />
            <div><Button onClick={readText} disabled={!text.trim()}>Check these</Button></div>
          </div>
        )}

        {problem && <div className="fc-alert is-err" style={{ marginTop: 14 }}>⚠ {problem}</div>}

        {result && !rows && (
          <div className="fc-alert is-ok" style={{ marginTop: 14 }}>
            <b>{result.added} added.</b>
            {result.already ? ` ${result.already} were already on the page.` : ''}
            {result.invalid ? ` ${result.invalid} had a tracking number that looks wrong and were left out.` : ''}
            {pageUrl && <> <a href={pageUrl} target="_blank" rel="noreferrer" className="fc-link">See the page ↗</a></>}
          </div>
        )}
      </Card>

      {rows && (
        <Card title={`Check before adding: ${newCount} new shipment${newCount !== 1 ? 's' : ''}`}
          action={<div className="fc-row"><Button variant="ghost" size="sm" onClick={reset}>Start over</Button></div>} pad={false}>
          {(existing.size > 0 || dupInFile > 0) && (
            <div className="fc-alert is-info" style={{ margin: '14px 18px 0' }}>
              {existing.size > 0 && <>{existing.size} already on the page (marked grey) will be skipped. </>}
              {dupInFile > 0 && <>{dupInFile} repeated in this file will be added once.</>}
            </div>
          )}
          {checked.bad.length > 0 && (
            <div className="fc-alert is-warn" style={{ margin: '14px 18px 0' }}>
              {checked.bad.length} row{checked.bad.length > 1 ? 's have' : ' has'} a tracking number that looks wrong (marked red). Fix or remove {checked.bad.length > 1 ? 'them' : 'it'}, or they’ll be skipped.
            </div>
          )}
          <div className="fc-table-wrap" style={{ marginTop: 10, maxHeight: 460, overflowY: 'auto' }}>
            <table className="fc-table">
              <thead><tr><th>Tracking number</th><th>Customer name</th><th>Pincode</th><th>Order</th><th>Shipped</th><th /></tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const bad = badSet.has(r.trackingId);
                  const dup = existing.has(String(r.trackingId).replace(/\s+/g, '').toUpperCase());
                  return (
                    <tr key={i} style={dup ? { opacity: 0.45 } : undefined} title={dup ? 'Already on the page' : undefined}>
                      <td><input className="fc-input fc-mono" style={{ padding: '6px 8px', minWidth: 150, borderColor: bad ? '#DF1515' : undefined }} value={r.trackingId} onChange={e => edit(i, 'trackingId', e.target.value.toUpperCase())} /></td>
                      <td><input className="fc-input" style={{ padding: '6px 8px', minWidth: 150 }} value={r.name} onChange={e => edit(i, 'name', e.target.value)} /></td>
                      <td><input className="fc-input" style={{ padding: '6px 8px', width: 90 }} inputMode="numeric" value={r.pincode} onChange={e => edit(i, 'pincode', e.target.value)} /></td>
                      <td className="fc-small fc-muted">{dup ? <span className="fc-pill is-grey">Already on page</span> : (r.orderRef || '—')}</td>
                      <td className="fc-small fc-muted" style={{ whiteSpace: 'nowrap' }}>{r.shippedOn || 'Today'}</td>
                      <td><button className="fc-x" aria-label="Remove" onClick={() => remove(i)}>✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="fc-row-between" style={{ padding: 16, borderTop: '1px solid #F1F1F3' }}>
            <span className="fc-small fc-muted">Parcels already on the page are skipped automatically.</span>
            <Button onClick={save} busy={busy} disabled={!newCount}>{newCount ? `Add ${newCount} to the page` : 'Nothing new to add'}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
