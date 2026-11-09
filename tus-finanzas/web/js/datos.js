/* Tus Finanzas — datos guardados, cálculos de préstamos, capital, reportes y ruta del día. */
'use strict';

/* ---------- puente con el celular (Android) y respaldo para navegador ---------- */
const Nativo = {
  hay: typeof window.Android !== 'undefined',
  _cb: {},
  llamar(fn, ...args) {
    return new Promise(res => {
      const id = uid(); this._cb[id] = res;
      try { window.Android[fn](id, ...args); } catch (e) { delete this._cb[id]; res({ ok: false, error: 'nativo' }); }
    });
  },
  leer(n) { try { return this.hay ? window.Android.readFile(n) : (localStorage.getItem('tf_file_' + n) || ''); } catch (e) { return ''; } },
  escribir(n, txt) {
    try { if (this.hay) return window.Android.writeFile(n, txt); localStorage.setItem('tf_file_' + n, txt); return true; } catch (e) { return false; }
  },
  borrar(n) { try { this.hay ? window.Android.deleteFile(n) : localStorage.removeItem('tf_file_' + n); } catch (e) { } },
  abrir(url) { if (this.hay) window.Android.openUrl(url); else window.open(url, '_blank'); },
  enLinea() { try { return this.hay ? window.Android.isOnline() : navigator.onLine; } catch (e) { return navigator.onLine; } },
  compartir(b64, nombre, mime, texto = '', tel = '') {
    if (this.hay) return window.Android.share(b64, nombre, mime, texto, tel);
    const a = document.createElement('a'); a.href = 'data:' + mime + ';base64,' + b64; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    return true;
  },
  ubicacion() {
    if (this.hay) return this.llamar('requestLocation');
    return new Promise(res => {
      if (!navigator.geolocation) return res({ ok: false, error: 'sin_gps' });
      navigator.geolocation.getCurrentPosition(p => res({ ok: true, lat: p.coords.latitude, lon: p.coords.longitude, acc: Math.round(p.coords.accuracy) }),
        e => res({ ok: false, error: e.code === 1 ? 'permiso' : 'sin_senal' }), { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 });
    });
  },
  agenda(obj) { try { if (this.hay) window.Android.setAgenda(JSON.stringify(obj)); } catch (e) { } },
  pedirAvisos() { try { if (this.hay) window.Android.askNotifications(); } catch (e) { } },
  version() { try { return this.hay ? window.Android.version() : '__APP_VERSION__'; } catch (e) { return ''; } },
};
window.tfNative = (id, json) => { const f = Nativo._cb[id]; if (!f) return; delete Nativo._cb[id]; try { f(JSON.parse(json)); } catch (e) { f({ ok: false }); } };

/* ---------- base de datos ---------- */
const CATS_GASTO = ['Comida', 'Transporte', 'Hogar', 'Servicios', 'Celular', 'Salud', 'Familia', 'Otros'];
const CATS_INGRESO = ['Venta', 'Trabajo extra', 'Regalo', 'Otros'];
const FRECUENCIAS = [
  ['diario', 'Diario'], ['semanal', 'Semanal'], ['quincenal', 'Quincenal'],
  ['mensual', 'Mensual'], ['trimestral', 'Trimestral'], ['semestral', 'Semestral']];
const FREC_TXT = Object.fromEntries(FRECUENCIAS);

function dbNueva() {
  return {
    v: 1, rev: 0,
    config: {
      listo: false, nombre: '', capitalInicial: 0, fechaInicio: hoy(),
      mapa: 'offline', salida: null, avisos: true, horaAviso: '07:00', reinvertir: 50, ultimaCopia: null,
    },
    clientes: [], prestamos: [], movs: [], fijos: [],
    cats: { gasto: CATS_GASTO.slice(), ingreso: CATS_INGRESO.slice() },
  };
}
let DB = dbNueva();

function migrar(d) {
  const base = dbNueva();
  d = Object.assign(base, d || {});
  d.config = Object.assign(dbNueva().config, d.config || {});
  d.cats = Object.assign(dbNueva().cats, d.cats || {});
  ['clientes', 'prestamos', 'movs', 'fijos'].forEach(k => { if (!Array.isArray(d[k])) d[k] = []; });
  d.prestamos.forEach(p => { p.pagos = p.pagos || []; p.moraPct = p.moraPct ?? 0; });
  return d;
}
function cargar() {
  let a = null, b = null;
  try { a = JSON.parse(localStorage.getItem('tf_db') || 'null'); } catch (e) { }
  try { const t = Nativo.leer('datos.json'); b = t ? JSON.parse(t) : null; } catch (e) { }
  const elegida = (a && b) ? ((b.rev || 0) > (a.rev || 0) ? b : a) : (a || b);
  DB = migrar(elegida);
}
function guardar() {
  DB.rev = (DB.rev || 0) + 1;
  const txt = JSON.stringify(DB);
  try { localStorage.setItem('tf_db', txt); } catch (e) { }
  if (Nativo.hay) Nativo.escribir('datos.json', txt);
  enviarAgenda();
}

/* ---------- préstamos y cuotas ---------- */
const cliente = id => DB.clientes.find(c => c.id === id);
const prestamosDe = cid => DB.prestamos.filter(p => p.clienteId === cid);
const prestamoActivo = cid => DB.prestamos.find(p => p.clienteId === cid && !prestamoPagado(p));

function repartir(total, n) { const b = Math.floor(total / n); const a = Array(n).fill(b); a[n - 1] += total - b * n; return a; }
function valores(p) { // valor, capital e interés de cada cuota (en pesos enteros)
  if (p._v && p._vk === p.monto + '|' + p.interes + '|' + p.cuotas) return p._v;
  const tot = repartir(p.monto + p.interes, p.cuotas), capi = repartir(p.monto, p.cuotas);
  const v = tot.map((t, i) => ({ valor: t, capital: capi[i], interes: t - capi[i] }));
  Object.defineProperty(p, '_v', { value: v, writable: true, enumerable: false, configurable: true });
  Object.defineProperty(p, '_vk', { value: p.monto + '|' + p.interes + '|' + p.cuotas, writable: true, enumerable: false, configurable: true });
  return v;
}
const pagada = (p, i) => p.pagos.some(x => x.i === i);
const prestamoPagado = p => p.pagos.length >= p.cuotas;
function proximaCuota(p) { for (let i = 0; i < p.cuotas; i++) if (!pagada(p, i)) return i; return -1; }
function cuotasPendientesHasta(p, d) { const r = []; for (let i = 0; i < p.cuotas; i++) if (!pagada(p, i) && p.fechas[i] <= d) r.push(i); return r; }
function moraDe(p, i, fechaPago) { return fechaPago > p.fechas[i] && p.moraPct > 0 ? Math.round(valores(p)[i].valor * p.moraPct / 100) : 0; }
function saldo(p) { const v = valores(p); let s = 0; for (let i = 0; i < p.cuotas; i++) if (!pagada(p, i)) s += v[i].valor; return s; }
function pagadoTotal(p) { const v = valores(p); return p.pagos.reduce((s, x) => s + v[x.i].valor, 0); }

function estadoPrestamo(p, d = hoy()) {
  if (prestamoPagado(p)) return { tipo: 'pagado' };
  const pend = cuotasPendientesHasta(p, d);
  const venc = pend.filter(i => p.fechas[i] < d);
  if (venc.length) return { tipo: 'atrasado', dias: diffDays(d, p.fechas[venc[0]]), cuotas: pend.length, idx: pend };
  if (pend.length) return { tipo: 'hoy', cuotas: 1, idx: pend };
  return { tipo: 'aldia', proxima: proximaCuota(p) };
}
function estadoCliente(c) {
  const p = prestamoActivo(c.id);
  if (!p) return { tipo: prestamosDe(c.id).length ? 'termino' : 'sin' };
  return Object.assign({ p }, estadoPrestamo(p));
}

/* Fechas de pago: sin domingos ni festivos */
function generarFechas(primera, frec, n) {
  const f = [];
  let d = siguienteHabil(primera);
  for (let k = 0; k < n; k++) {
    if (frec === 'diario') { if (k > 0) d = siguienteHabil(addDays(d, 1)); f.push(d); continue; }
    let base;
    if (frec === 'semanal') base = addDays(primera, 7 * k);
    else if (frec === 'quincenal') base = addDays(primera, 15 * k);
    else if (frec === 'mensual') base = addMonths(primera, k);
    else if (frec === 'trimestral') base = addMonths(primera, 3 * k);
    else base = addMonths(primera, 6 * k);
    let x = siguienteHabil(base);
    if (f.length && x <= f[f.length - 1]) x = siguienteHabil(addDays(f[f.length - 1], 1));
    f.push(x);
  }
  return f;
}

function registrarCobro(p, conMora = true, fecha = hoy()) {
  const i = proximaCuota(p); if (i < 0) return null;
  const mora = conMora ? moraDe(p, i, fecha) : 0;
  const pago = { i, fecha, valor: valores(p)[i].valor, mora, ts: Date.now() };
  p.pagos.push(pago);
  guardar();
  return pago;
}
function deshacerCobro(p) {
  const reales = p.pagos.filter(x => !x.previo);
  if (!reales.length) return false;
  const ult = reales.reduce((a, b) => (b.ts || 0) > (a.ts || 0) ? b : a);
  p.pagos.splice(p.pagos.indexOf(ult), 1);
  guardar();
  return true;
}

/* ---------- capital ---------- */
function plataEnMano(d = hoy()) {
  const c = DB.config;
  let m = c.capitalInicial;
  for (const p of DB.prestamos) {
    if (!p.previo && p.creado <= d) m -= p.monto;
    for (const x of p.pagos) if (!x.previo && x.fecha <= d) m += x.valor + (x.mora || 0);
  }
  for (const x of DB.movs) if (x.fecha <= d) m += x.tipo === 'gasto' ? -x.valor : x.valor; // 'ajuste' trae su signo
  return m;
}
function enLaCalle(d = hoy()) {
  let s = 0;
  for (const p of DB.prestamos) {
    if (!p.previo && p.creado > d) continue;
    const v = valores(p);
    let rec = 0;
    for (const x of p.pagos) if (x.previo || x.fecha <= d) rec += v[x.i].capital;
    s += Math.max(0, p.monto - rec);
  }
  return s;
}
const capitalTotal = (d = hoy()) => plataEnMano(d) + enLaCalle(d);
function porCobrarTotal() { return DB.prestamos.reduce((s, p) => s + saldo(p), 0); }
function interesFuturo() { let s = 0; for (const p of DB.prestamos) { const v = valores(p); for (let i = 0; i < p.cuotas; i++) if (!pagada(p, i)) s += v[i].interes; } return s; }

/* ---------- resumen de un periodo [a, b] ---------- */
function resumenPeriodo(a, b) {
  const r = { intereses: 0, mora: 0, capital: 0, cobrado: 0, prestado: 0, ingresos: 0, gastos: 0, nCobros: 0, nuevos: 0, cobros: [], movs: [], terminados: 0 };
  for (const p of DB.prestamos) {
    const v = valores(p);
    if (!p.previo && p.creado >= a && p.creado <= b) { r.prestado += p.monto; r.nuevos++; }
    for (const x of p.pagos) {
      if (x.previo || x.fecha < a || x.fecha > b) continue;
      r.intereses += v[x.i].interes; r.mora += x.mora || 0; r.capital += v[x.i].capital;
      r.cobrado += x.valor + (x.mora || 0); r.nCobros++;
      r.cobros.push({ fecha: x.fecha, p, x });
    }
    if (prestamoPagado(p)) { const ult = p.pagos.reduce((m, x) => x.fecha > m ? x.fecha : m, ''); if (ult >= a && ult <= b && p.pagos.some(x => !x.previo)) r.terminados++; }
  }
  for (const x of DB.movs) if (x.tipo !== 'ajuste' && x.fecha >= a && x.fecha <= b) { r.movs.push(x); if (x.tipo === 'gasto') r.gastos += x.valor; else r.ingresos += x.valor; }
  r.ganancia = r.intereses + r.mora;
  r.resultado = r.ganancia + r.ingresos - r.gastos;
  r.cobros.sort((m, n) => (m.x.ts || 0) - (n.x.ts || 0));
  r.movs.sort((m, n) => m.fecha < n.fecha ? 1 : -1);
  return r;
}
/* Intereses: lo que podría ganar en el mes, lo que debería llevar a hoy y lo que de verdad cobró */
function interesesMes(d = hoy()) {
  const a = monthStart(d), b = monthEnd(d);
  let potencial = 0, deberia = 0;
  for (const p of DB.prestamos) {
    const v = valores(p);
    p.fechas.forEach((f, i) => { if (f >= a && f <= b) { potencial += v[i].interes; if (f <= d) deberia += v[i].interes; } });
  }
  const real = resumenPeriodo(a, d).ganancia;
  return { potencial, deberia, real };
}
/* Gastos fijos que faltan por pagar este mes */
function fijoPagado(f, d = hoy()) { return DB.movs.some(x => x.fijoId === f.id && x.fecha >= monthStart(d) && x.fecha <= monthEnd(d)); }
function fijosPendientes(d = hoy()) { return DB.fijos.filter(f => !fijoPagado(f, d)).reduce((s, f) => s + f.valor, 0); }
function consejo(d = hoy()) {
  const real = interesesMes(d).real, F = fijosPendientes(d);
  const reinv = Math.round(real * DB.config.reinvertir / 100);
  const libre = real - reinv - F;
  const diasRest = diffDays(monthEnd(d), d) + 1;
  return { real, reinv, F, libre, porDia: libre > 0 ? Math.floor(libre / diasRest / 100) * 100 : 0, diasRest };
}

/* ---------- ruta del día ---------- */
const VEL_M_MIN = 300;   // moto en ciudad ≈ 18 km/h
const FACTOR_CALLE = 1.35; // las calles no son línea recta
const MIN_POR_COBRO = 6;

function paradasDeHoy(d = hoy()) {
  const paradas = [], cobrados = [];
  for (const c of DB.clientes) {
    const p = prestamoActivo(c.id);
    const pagosHoy = DB.prestamos.filter(q => q.clienteId === c.id).flatMap(q => q.pagos.filter(x => !x.previo && x.fecha === d).map(x => ({ q, x })));
    if (pagosHoy.length) cobrados.push({ c, total: pagosHoy.reduce((s, y) => s + y.x.valor + (y.x.mora || 0), 0), ts: Math.max(...pagosHoy.map(y => y.x.ts || 0)) });
    if (!p) continue;
    const pend = cuotasPendientesHasta(p, d);
    if (!pend.length) continue;
    const v = valores(p);
    const deuda = pend.reduce((s, i) => s + v[i].valor + moraDe(p, i, d), 0);
    const est = estadoPrestamo(p, d);
    paradas.push({
      c, p, pend, deuda, cuota: v[pend[0]].valor + moraDe(p, pend[0], d), atrasado: est.tipo === 'atrasado', dias: est.dias || 0,
      desde: hhmmToMin(c.horaDesde || '08:00'), hasta: hhmmToMin(c.horaHasta || '18:00'),
      pos: (c.lat != null && c.lon != null) ? { lat: c.lat, lon: c.lon } : null,
    });
  }
  cobrados.sort((a, b) => a.ts - b.ts);
  return { paradas, cobrados };
}

function planearRuta(paradas, inicio, ahoraMin) {
  const conPos = paradas.filter(s => s.pos), sinPos = paradas.filter(s => !s.pos).sort((a, b) => a.desde - b.desde);
  let pos = inicio || (conPos[0] && conPos[0].pos), t = ahoraMin, totalM = 0;
  const orden = [], tarde = [], quedan = conPos.slice();
  while (quedan.length) {
    let mejor = null;
    for (const s of quedan) {
      const dm = pos ? distM(pos, s.pos) * FACTOR_CALLE : 0;
      const llega = t + dm / VEL_M_MIN, empieza = Math.max(llega, s.desde);
      if (empieza > s.hasta) continue;
      const puntaje = empieza + (s.atrasado ? -10 : 0) + dm / VEL_M_MIN * 0.5;
      if (!mejor || puntaje < mejor.puntaje) mejor = { s, dm, empieza, puntaje };
    }
    if (!mejor) break;
    quedan.splice(quedan.indexOf(mejor.s), 1);
    mejor.s.eta = mejor.empieza; mejor.s.legM = mejor.dm;
    orden.push(mejor.s); totalM += mejor.dm;
    pos = mejor.s.pos; t = mejor.empieza + MIN_POR_COBRO;
  }
  // los que ya no alcanzan en su horario van al final, por cercanía
  while (quedan.length) {
    quedan.sort((a, b) => (pos ? distM(pos, a.pos) - distM(pos, b.pos) : a.desde - b.desde));
    const s = quedan.shift(), dm = pos ? distM(pos, s.pos) * FACTOR_CALLE : 0;
    t += dm / VEL_M_MIN; s.eta = t; s.legM = dm; s.fuera = true; totalM += dm; pos = s.pos; t += MIN_POR_COBRO;
    tarde.push(s);
  }
  return { orden: orden.concat(tarde), sinPos, totalM };
}

/* ---------- aviso diario en el celular ---------- */
function enviarAgenda() {
  if (!Nativo.hay) return;
  const d0 = hoy(), dias = {};
  for (let k = 0; k < 21; k++) {
    const d = addDays(d0, k); let n = 0, total = 0, atr = 0;
    for (const p of DB.prestamos) {
      if (prestamoPagado(p)) continue;
      const v = valores(p);
      const pend = cuotasPendientesHasta(p, d);
      if (!pend.length) continue;
      n++; total += pend.reduce((s, i) => s + v[i].valor, 0);
      if (p.fechas[pend[0]] < d) atr++;
    }
    if (n) dias[d] = { n, total, atrasados: atr };
  }
  Nativo.agenda({ activo: !!DB.config.avisos, hora: DB.config.horaAviso || '07:00', dias });
}
