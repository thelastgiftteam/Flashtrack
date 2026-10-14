// POST { username, password } → sets the CSM session cookie.
import { checkLogin, isConfigured, setSession } from '../../lib/csmAuth';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isConfigured()) return res.status(500).json({ error: 'Login not configured on the server' });

  const { username, password } = req.body || {};
  if (!checkLogin(username, password)) return res.status(401).json({ error: 'Wrong username or password' });

  setSession(res);
  return res.status(200).json({ ok: true });
}
