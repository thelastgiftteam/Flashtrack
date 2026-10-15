// Self-serve signup: creates the brand (on a free trial) and its first login.
import { api, str, email, Problem } from '../../../lib/api';
import { tx, one } from '../../../lib/db';
import { hashPassword, passwordProblem, startUserSession } from '../../../lib/auth';
import { newCode } from '../../../lib/brands';

export default api({
  async POST(req, res) {
    const b = req.body || {};
    const brandName = str(b.brandName, 80);
    const name = str(b.name, 80);
    const mail = email(b.email);
    const phone = str(b.phone, 20).replace(/[^\d+]/g, '');
    if (!brandName) throw new Problem(400, 'Enter your brand name.');
    const pwErr = passwordProblem(b.password);
    if (pwErr) throw new Problem(400, pwErr);
    if (await one('select 1 from brand_users where email = $1', [mail])) {
      throw new Problem(409, 'This email already has an account. Log in instead.');
    }
    const code = await newCode();
    const user = await tx(async run => {
      const [brand] = await run(
        `insert into brands (code, name, contact_name, contact_phone, whatsapp) values ($1, $2, $3, $4, $4) returning id`,
        [code, brandName, name, phone],
      );
      await run("insert into brand_events (brand_id, kind, text) values ($1, 'signup', 'Signed up on the website')", [brand.id]);
      const [u] = await run(
        'insert into brand_users (brand_id, email, name, password_hash) values ($1, $2, $3, $4) returning id',
        [brand.id, mail, name, hashPassword(b.password)],
      );
      return u;
    });
    startUserSession(res, user.id);
    return { ok: true, code };
  },
});
