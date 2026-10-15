import { api } from '../../../lib/api';
import { readSlips } from '../../../lib/ocr';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default api({
  async POST(req) {
    const results = await readSlips(req.body?.image, req.body?.mimeType);
    return { rows: results.map(r => ({ trackingId: r.trackingId, name: r.name, pincode: r.pincode, orderRef: '', shippedOn: '' })) };
  },
}, { auth: 'user' });
