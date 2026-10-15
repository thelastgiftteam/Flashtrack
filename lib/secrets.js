// Encrypts India Post logins that Pro brands share with us.
// AES-256-GCM. Env: SECRETS_KEY (any long random string). Without the key
// the saved logins can't be read, so keep it safe and never change it.
import crypto from 'crypto';

function key() {
  const k = process.env.SECRETS_KEY;
  if (!k || k.length < 16) throw new Error('SECRETS_KEY is not set (needs 16+ characters)');
  return crypto.createHash('sha256').update(k).digest();
}

export function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return `v1.${iv.toString('base64url')}.${c.getAuthTag().toString('base64url')}.${body.toString('base64url')}`;
}

export function decrypt(blob) {
  if (!blob) return '';
  const [v, iv, tag, body] = String(blob).split('.');
  if (v !== 'v1') return '';
  const d = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
  d.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(body, 'base64url')), d.final()]).toString('utf8');
}
