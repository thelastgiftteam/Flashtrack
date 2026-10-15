// Turns an uploaded spreadsheet, a pasted list or a photo result into clean
// shipment rows: { trackingId, name, pincode, orderRef, shippedOn }.
// Runs in the browser (preview before saving) and on the server (checks).

const TRACK_RE = /\b([A-Z]{2}\d{9}[A-Z]{2})\b/i;

export function titleCase(s) {
  return String(s || '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean).map(w => (
    w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  )).join(' ');
}

export function cleanTracking(v) {
  return String(v || '').replace(/\s+/g, '').toUpperCase();
}

export function validTracking(t) {
  return /^[A-Z0-9]{8,24}$/.test(t);
}

// '2026/10/13T15:20:47', '13/10/2026', '13-10-2026', a JS Date, or an Excel serial
export function toDate(v) {
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  if (typeof v === 'number' && v > 30000 && v < 80000) {
    return new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10);
  }
  const s = String(v || '').trim();
  let m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
}

// Which column holds what. First match wins, so the India Post export's
// exact names come first and looser names after.
const COLS = {
  trackingId: ['article-number', 'article number', 'tracking id', 'tracking number', 'tracking no', 'tracking', 'awb', 'consignment', 'article no'],
  name:       ['receiver-name', 'receiver name', 'customer name', 'customer', 'name', 'consignee'],
  pincode:    ['destination-pin', 'destination pin', 'pincode', 'pin code', 'pin'],
  orderRef:   ['customer-bulk-reference', 'order id', 'order number', 'order no', 'order', 'reference'],
  shippedOn:  ['booking-date-time', 'booking date', 'shipped on', 'date'],
};

function findCols(header) {
  const h = header.map(c => String(c ?? '').trim().toLowerCase());
  const out = {};
  for (const [key, names] of Object.entries(COLS)) {
    for (const n of names) {
      const i = h.findIndex(c => c === n);
      if (i >= 0) { out[key] = i; break; }
    }
    if (out[key] === undefined) {
      for (const n of names) {
        const i = h.findIndex(c => c.includes(n) && !Object.values(out).includes(h.indexOf(c)));
        if (i >= 0) { out[key] = i; break; }
      }
    }
  }
  return out;
}

// grid: array of rows (arrays of cells), e.g. from an .xlsx or a CSV
export function parseGrid(grid) {
  if (!grid || !grid.length) return { error: 'The file is empty.' };
  let headerAt = -1, cols = null;
  for (let i = 0; i < Math.min(grid.length, 10); i++) {
    const c = findCols(grid[i] || []);
    if (c.trackingId !== undefined) { headerAt = i; cols = c; break; }
  }
  if (headerAt < 0) {
    return { error: 'Could not find a tracking number column. The first row should have headings like "Tracking number", "Name" and "Pincode", or upload India Post’s Excel file as it is.' };
  }
  const get = (row, k) => (cols[k] === undefined ? '' : row[cols[k]]);
  const rows = [];
  for (let r = headerAt + 1; r < grid.length; r++) {
    const row = grid[r] || [];
    const trackingId = cleanTracking(get(row, 'trackingId'));
    if (!trackingId) continue;
    rows.push({
      trackingId,
      name: titleCase(get(row, 'name')),
      pincode: String(get(row, 'pincode') ?? '').replace(/\D/g, '').slice(0, 6),
      orderRef: String(get(row, 'orderRef') ?? '').trim(),
      shippedOn: toDate(get(row, 'shippedOn')),
    });
  }
  if (!rows.length) return { error: 'Found the headings, but no tracking numbers under them.' };
  return { rows };
}

export function parseCsv(text) {
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',' || ch === '\t') { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    out.push(cells);
  }
  return out;
}

// Typed or pasted lines, in any order: "Anjali Menon 682030 EL123456789IN"
export function parseLines(text) {
  const rows = [];
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim()) continue;
    const t = line.match(TRACK_RE);
    if (!t) continue;
    let rest = line.replace(t[0], ' ');
    const pin = rest.match(/\b\d{6}\b/);
    if (pin) rest = rest.replace(pin[0], ' ');
    rows.push({
      trackingId: t[1].toUpperCase(),
      name: titleCase(rest.replace(/[,;|\t]+/g, ' ')),
      pincode: pin ? pin[0] : '',
      orderRef: '',
      shippedOn: '',
    });
  }
  return rows;
}

// Final check before saving; also used by the server.
export function normalizeRows(input, today) {
  const seen = new Set();
  const ok = [], bad = [];
  for (const r of input || []) {
    const trackingId = cleanTracking(r.trackingId);
    if (!validTracking(trackingId)) { bad.push({ ...r, reason: 'Tracking number looks wrong' }); continue; }
    if (seen.has(trackingId)) continue;
    seen.add(trackingId);
    const d = toDate(r.shippedOn) || today;
    ok.push({
      trackingId,
      name: titleCase(r.name).slice(0, 120),
      pincode: String(r.pincode || '').replace(/\D/g, '').slice(0, 6),
      orderRef: String(r.orderRef || '').trim().slice(0, 60),
      shippedOn: d > today ? today : d,
    });
  }
  return { ok, bad };
}
