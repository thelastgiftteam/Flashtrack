import { api, str, Problem } from '../../../lib/api';
import { one } from '../../../lib/db';
import { checkPassword, startStaffSession, endStaffSession, getStaff, bootstrapAdmin, clientIp, isBlocked, noteAttempt, clearAttempts } from '../../../lib/auth';

export default api({
  async GET(req) {
    const staff = await getStaff(req);
    if (!staff) throw new Problem(401, 'Not logged in.');
    return { staff };
  },
  async POST(req, res) {
    const mail = str(req.body?.email).toLowerCase();
    const pw = String(req.body?.password || '');
    const k = `s:${mail}`, ipk = `ip:${clientIp(req)}`;
    if (await isBlocked([[k, 5], [ipk, 40]])) throw new Problem(429, 'Too many wrong tries. Wait 15 minutes and try again.');
    let s = await one('select id, password_hash from staff where email = $1 and active', [mail]);
    if (s && !checkPassword(pw, s.password_hash)) s = null;
    if (!s) s = await bootstrapAdmin(mail, pw);
    if (!s) { await noteAttempt(k); await noteAttempt(ipk); throw new Problem(401, 'Email or password is wrong.'); }
    await clearAttempts(k);
    startStaffSession(res, s.id);
    return { ok: true };
  },
  async DELETE(req, res) {
    endStaffSession(res);
    return { ok: true };
  },
});
