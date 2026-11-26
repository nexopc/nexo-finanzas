/* Servidor de avisos de "Cobros y Agenda" (NEXO PC) — Cloudflare Worker, plan gratis.
   - La app manda su lista de avisos de los próximos 21 días (POST /api/sync).
   - Cada minuto el cron revisa qué toca y lo manda como notificación Web Push al iPhone.
   Necesita: KV llamado AVISOS, variables VAPID_PUBLIC, VAPID_PRIVATE_JWK y VAPID_SUBJECT, y el cron "* * * * *".
   No guarda nombres de clientes ni montos: solo el texto de cada aviso. */

const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const ub64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
const concat = (...a) => { const out = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let o = 0; for (const x of a) { out.set(x, o); o += x.length; } return out; };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', ...CORS } });

async function hkdf(salt, ikm, info, bytes) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, bytes * 8));
}

/* Cifrado del mensaje (RFC 8291, aes128gcm) */
export async function encryptPayload(sub, text) {
  const uaPublic = ub64u(sub.keys.p256dh), authSecret = ub64u(sub.keys.auth);
  const local = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', local.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, local.privateKey, 256));
  const ikm = await hkdf(authSecret, shared, concat(enc.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, concat(enc.encode(text), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, ct);
}

/* Firma VAPID (JWT ES256) */
export async function vapidAuth(endpoint, env) {
  const aud = new URL(endpoint).origin;
  const header = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || 'mailto:avisos@example.com' })));
  const key = await crypto.subtle.importKey('jwk', JSON.parse(env.VAPID_PRIVATE_JWK), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(header + '.' + payload));
  return `vapid t=${header}.${payload}.${b64u(sig)}, k=${env.VAPID_PUBLIC}`;
}

export async function sendPush(sub, msg, env) {
  const body = await encryptPayload(sub, JSON.stringify(msg));
  return fetch(sub.endpoint, {
    method: 'POST',
    headers: { Authorization: await vapidAuth(sub.endpoint, env), TTL: '43200', Urgency: 'high', 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream' },
    body
  });
}

async function getIds(env) { return JSON.parse((await env.AVISOS.get('ids')) || '[]'); }

async function checkUser(env, id, secret) {
  if (!id || !secret || String(id).length > 80) return null;
  const rec = JSON.parse((await env.AVISOS.get('u:' + id)) || 'null');
  if (rec && rec.secret !== secret) return false;
  return rec || { secret, items: [] };
}

export async function runDue(env, now = Date.now()) {
  const ids = await getIds(env); let sent = 0;
  for (const id of ids) {
    const rec = JSON.parse((await env.AVISOS.get('u:' + id)) || 'null');
    if (!rec || !rec.sub || rec.gone) continue;
    const due = rec.items.filter(x => x.at <= now && x.at > now - 6 * 3600e3);
    if (!due.length) { if (rec.items.some(x => x.at <= now)) { rec.items = rec.items.filter(x => x.at > now); await env.AVISOS.put('u:' + id, JSON.stringify(rec)); } continue; }
    for (const x of due.slice(0, 5)) {
      const r = await sendPush(rec.sub, { title: x.title, body: x.body, tag: x.tag }, env);
      if (r.status === 404 || r.status === 410) { rec.gone = true; break; }
      if (r.ok) sent++;
    }
    rec.items = rec.items.filter(x => x.at > now);
    await env.AVISOS.put('u:' + id, JSON.stringify(rec));
  }
  return sent;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method === 'GET' && url.pathname === '/') return json({ ok: true, app: 'cobros-agenda-avisos' });
    if (req.method !== 'POST') return json({ error: 'método no permitido' }, 405);
    let data; try { data = await req.json(); } catch { return json({ error: 'json inválido' }, 400); }
    const rec = await checkUser(env, data.id, data.secret);
    if (rec === null) return json({ error: 'faltan datos' }, 400);
    if (rec === false) return json({ error: 'clave incorrecta' }, 403);
    if (url.pathname === '/api/sync') {
      if (!data.sub || !data.sub.endpoint || !data.sub.keys) return json({ error: 'falta la suscripción' }, 400);
      if (!/^https:\/\//.test(data.sub.endpoint)) return json({ error: 'suscripción inválida' }, 400);
      const items = (Array.isArray(data.items) ? data.items : []).slice(0, 300)
        .filter(x => x && typeof x.at === 'number')
        .map(x => ({ at: x.at, title: String(x.title || '').slice(0, 120), body: String(x.body || '').slice(0, 240), tag: String(x.tag || '').slice(0, 80) }));
      const out = { secret: rec.secret, sub: data.sub, items, gone: false, at: Date.now() };
      await env.AVISOS.put('u:' + data.id, JSON.stringify(out));
      const ids = await getIds(env);
      if (!ids.includes(data.id)) { ids.push(data.id); await env.AVISOS.put('ids', JSON.stringify(ids.slice(-20))); }
      return json({ ok: true, items: items.length });
    }
    if (url.pathname === '/api/test') {
      if (!rec.sub) return json({ error: 'primero activa los avisos' }, 400);
      const r = await sendPush(rec.sub, { title: '¡Los avisos funcionan! ✅', body: 'Así te van a llegar el resumen de la mañana y tus citas.', tag: 'prueba' }, env);
      return json({ ok: r.ok, status: r.status }, r.ok ? 200 : 502);
    }
    return json({ error: 'no encontrado' }, 404);
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(runDue(env)); }
};
