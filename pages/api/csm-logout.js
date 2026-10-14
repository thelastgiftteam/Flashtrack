import { clearSession } from '../../lib/csmAuth';

export default function handler(req, res) {
  clearSession(res);
  return res.status(200).json({ ok: true });
}
