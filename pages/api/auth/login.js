import { api, str, Problem } from '../../../lib/api';
import { one } from '../../../lib/db';
import { checkPassword, startUserSession, endUserSession, clientIp, isBlocked, noteAttempt, clearAttempts } from '../../../lib/auth';

export default api({
  async POST(req, res) {
    const mail = str(req.body?.email).toLowerCase();
    const k = `u:${mail}`, ipk = `ip:${clientIp(req)}`;
    if (await isBlocked([[k, 8], [ipk, 40]])) throw new Problem(429, 'Too many wrong tries. Wait 15 minutes and try again.');
    const u = await one('select id, password_hash from brand_users where email = $1', [mail]);
    if (!u || !checkPassword(req.body?.password, u.password_hash)) {
      await noteAttempt(k); await noteAttempt(ipk);
      throw new Problem(401, 'Email or password is wrong.');
    }
    await clearAttempts(k);
    startUserSession(res, u.id);
    return { ok: true };
  },
  async DELETE(req, res) {
    endUserSession(res);
    return { ok: true };
  },
});
