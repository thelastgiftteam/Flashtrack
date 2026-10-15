// ─────────────────────────────────────────────────────────────────────────────
// Gemini-powered tracking slip extractor
// Handles both single slips AND bulk booking receipts (multiple rows in one image)
//
// Set GEMINI_API_KEY in Vercel → Project Settings → Environment Variables
// Get your key at: https://aistudio.google.com/app/apikey  (free to start)
// ─────────────────────────────────────────────────────────────────────────────
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

import { requireCsm } from '../../lib/csmAuth';
import { readSlips } from '../../lib/ocr';

export default async function handler(req, res) {
  if (!requireCsm(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const results = await readSlips(req.body?.image, req.body?.mimeType);
    return res.status(200).json({ success: true, results });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message, detail: e.detail });
  }
}
