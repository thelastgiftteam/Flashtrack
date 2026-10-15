// Reads India Post slips / bulk booking receipts from a photo with Google
// Gemini (free tier to start). Used by the brand dashboard, the admin
// console and the older /ocr page.
// Env: GEMINI_API_KEY (https://aistudio.google.com/app/apikey)

export async function readSlips(image, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { const e = new Error('Photo reading is not set up yet (GEMINI_API_KEY missing).'); e.status = 500; throw e; }
  if (!image) { const e = new Error('No photo received.'); e.status = 400; throw e; }

  const prompt = `You are an OCR extraction engine for Indian courier and postal documents.

This image may be:
- A single tracking slip / courier label
- A bulk booking receipt / manifest with a TABLE of multiple shipments (common from India Post counters)

For EACH shipment in the image, extract:
- name: recipient / consignee / receiver name only (not sender)
- pincode: destination 6-digit PIN code (labeled "Dest. Pin-code", "PIN", or inside the address)
- trackingId: the article/tracking/AWB/consignment number (for India Post it looks like CL524765347IN or EL123456789IN)

Rules:
- Always use RECEIVER details, never sender details.
- For bulk receipts with a table: extract ALL rows from the table as an array.
- Match name, pincode, and trackingId from the same row/shipment.
- For India Post bulk receipts: Article Number column = trackingId, Receiver Details column = name, Dest. Pin-code column = pincode.
- Clean up names that are split across lines (e.g. "JEFFRY BIJU SEBAST- IAN" should be "Jeffry Biju Sebastian").
- If a value is unclear, return empty string "".

Return ONLY a JSON array — even for a single shipment:
[
  { "name": "", "pincode": "", "trackingId": "" }
]`;

  const ENDPOINTS = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  ];

  let geminiRes, lastErr;
  for (const url of ENDPOINTS) {
    try {
      geminiRes = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: image } },
            ],
          }],
          generationConfig: { temperature: 0 },
        }),
      });
      if (geminiRes.ok) break;
      lastErr = await geminiRes.text();
    } catch (e) {
      lastErr = e.message;
    }
  }

  if (!geminiRes || !geminiRes.ok) {
    const e = new Error('Could not read the photo right now. Try again in a minute.'); e.status = 502; e.detail = String(lastErr).slice(0, 400); throw e;
  }

  const data = await geminiRes.json();
  const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) { const e = new Error('No text found in the photo.'); e.status = 422; throw e; }
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  let parsed;
  try { parsed = JSON.parse(cleaned); } catch { const e = new Error('Could not understand the photo. Try a clearer, straight photo.'); e.status = 422; throw e; }
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  return rows
    .filter(r => r.name || r.trackingId)
    .map(r => ({
      name:       String(r.name       || '').trim(),
      pincode:    String(r.pincode    || '').trim(),
      trackingId: String(r.trackingId || '').trim(),
    }));
}
