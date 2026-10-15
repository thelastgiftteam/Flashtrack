// Your team adding or removing shipments for a brand (Pro daily uploads).
import { api } from '../../../../../lib/api';
import { listShipments, addShipments, deleteShipment, updateShipment } from '../../../app/shipments';
import { loadBrand } from './index';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default api({
  async GET(req) { const b = await loadBrand(req.query.id); return listShipments(b.id, req.query); },
  async POST(req, res, { staff }) { const b = await loadBrand(req.query.id); return addShipments(res, b, req.body, { staffId: staff.id }); },
  async PATCH(req, res) { const b = await loadBrand(req.query.id); return updateShipment(res, b, req.query.sid, req.body); },
  async DELETE(req, res) { const b = await loadBrand(req.query.id); return deleteShipment(res, b, req.query.sid, req.body?.ids); },
}, { auth: 'staff' });
