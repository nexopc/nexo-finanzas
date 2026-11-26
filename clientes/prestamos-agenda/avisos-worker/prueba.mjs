// Prueba local del servidor de avisos: node prueba.mjs
import worker, { encryptPayload, vapidAuth, runDue } from './worker.js';
const S = crypto.subtle, enc = new TextEncoder(), dec = new TextDecoder();
const b64u = b => Buffer.from(b).toString('base64url'), ub = s => new Uint8Array(Buffer.from(s, 'base64url'));
const hk = async (salt, ikm, info, n) => new Uint8Array(await S.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, await S.importKey('raw', ikm, 'HKDF', false, ['deriveBits']), n * 8));
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length } return o };
// "iPhone" falso
const ua = await S.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const uaPub = new Uint8Array(await S.exportKey('raw', ua.publicKey)); const auth = crypto.getRandomValues(new Uint8Array(16));
const sub = { endpoint: 'https://web.push.apple.com/QWERTY', keys: { p256dh: b64u(uaPub), auth: b64u(auth) } };
// llaves VAPID
const v = await S.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const env = { VAPID_PUBLIC: b64u(new Uint8Array(await S.exportKey('raw', v.publicKey))), VAPID_PRIVATE_JWK: JSON.stringify(await S.exportKey('jwk', v.privateKey)), VAPID_SUBJECT: 'mailto:prueba@example.com' };
// 1) descifrar como lo haría el iPhone
async function decrypt(body) {
  const salt = body.slice(0, 16), idlen = body[20], asPub = body.slice(21, 21 + idlen), ct = body.slice(21 + idlen);
  const asKey = await S.importKey('raw', asPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await S.deriveBits({ name: 'ECDH', public: asKey }, ua.privateKey, 256));
  const ikm = await hk(auth, shared, cat(enc.encode('WebPush: info\0'), uaPub, asPub), 32);
  const cek = await hk(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16), nonce = await hk(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const pt = new Uint8Array(await S.decrypt({ name: 'AES-GCM', iv: nonce }, await S.importKey('raw', cek, 'AES-GCM', false, ['decrypt']), ct));
  if (pt[pt.length - 1] !== 2) throw new Error('relleno inválido'); return dec.decode(pt.slice(0, -1));
}
const msg = JSON.stringify({ title: 'Tu día de hoy', body: '5 cobros · 2 citas' });
console.log('1. cifrado/descifrado:', (await decrypt(await encryptPayload(sub, msg))) === msg ? 'OK' : 'FALLÓ');
// 2) firma VAPID válida
const a = await vapidAuth(sub.endpoint, env); const jwt = a.match(/t=([^,]+)/)[1].split('.');
const ok = await S.verify({ name: 'ECDSA', hash: 'SHA-256' }, v.publicKey, ub(jwt[2]), enc.encode(jwt[0] + '.' + jwt[1]));
const pl = JSON.parse(Buffer.from(jwt[1], 'base64url')); console.log('2. firma VAPID:', ok && pl.aud === 'https://web.push.apple.com' ? 'OK' : 'FALLÓ');
// 3) flujo completo con KV y Apple falsos
const kv = new Map(); env.AVISOS = { get: async k => kv.get(k) ?? null, put: async (k, val) => { kv.set(k, val) } };
const sent = []; globalThis.fetch = async (u, o) => { sent.push({ u, o }); return new Response(null, { status: 201 }) };
const call = (path, body) => worker.fetch(new Request('https://x.workers.dev' + path, { method: 'POST', body: JSON.stringify(body) }), env);
const now = Date.now();
let r = await call('/api/sync', { id: 'abc', secret: 's1', sub, items: [{ at: now - 1000, title: 'En 15 min: Banco', body: '11:00', tag: 't1' }, { at: now + 3600e3, title: 'Luego', body: '', tag: 't2' }] });
console.log('3. sync:', r.status === 200 ? 'OK' : 'FALLÓ ' + r.status);
r = await call('/api/sync', { id: 'abc', secret: 'otra', sub, items: [] }); console.log('4. clave ajena rechazada:', r.status === 403 ? 'OK' : 'FALLÓ');
const n = await runDue(env, now); const got = JSON.parse(await decrypt(new Uint8Array(await new Response(sent[0].o.body).arrayBuffer())));
console.log('5. cron envía lo que toca:', n === 1 && got.title === 'En 15 min: Banco' && sent[0].o.headers['Content-Encoding'] === 'aes128gcm' ? 'OK' : 'FALLÓ');
console.log('6. queda pendiente lo de después:', JSON.parse(kv.get('u:abc')).items.length === 1 ? 'OK' : 'FALLÓ');
r = await call('/api/test', { id: 'abc', secret: 's1' }); console.log('7. aviso de prueba:', r.status === 200 && sent.length === 2 ? 'OK' : 'FALLÓ');
