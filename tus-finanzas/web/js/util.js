/* Tus Finanzas — utilidades: plata, fechas, festivos de Colombia, distancias. */
'use strict';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- plata ---------- */
function money(n, sign = false) {
  n = Math.round(Number(n) || 0);
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '−$' : (sign && n > 0 ? '+$' : '$')) + s;
}
function moneyShort(n) {
  n = Math.round(n || 0);
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.', ',').replace(',0', '') + 'M';
  if (a >= 1e3) return Math.round(n / 1e3) + 'k';
  return String(n);
}
const parseMoney = s => parseInt(String(s ?? '').replace(/[^\d]/g, ''), 10) || 0;
function pct(n, d = 1) { return (Number(n) || 0).toFixed(d).replace('.', ','); }

/* ---------- fechas (siempre texto 'AAAA-MM-DD', hora local) ---------- */
const pad2 = n => String(n).padStart(2, '0');
const toISO = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const fromISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = fromISO(s); d.setDate(d.getDate() + n); return toISO(d); };
function addMonths(s, n) {
  const d = fromISO(s), day = d.getDate();
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  t.setDate(Math.min(day, last));
  return toISO(t);
}
const diffDays = (a, b) => Math.round((fromISO(a) - fromISO(b)) / 864e5); // a - b
const monthStart = s => s.slice(0, 8) + '01';
const monthEnd = s => { const d = fromISO(s); return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
function weekStart(s) { const d = fromISO(s); const w = (d.getDay() + 6) % 7; return addDays(s, -w); } // lunes
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_C = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function fechaCorta(s) { const d = fromISO(s); return DIAS_C[d.getDay()] + ' ' + d.getDate() + ' ' + MESES_C[d.getMonth()]; }
function fechaLarga(s) { const d = fromISO(s); return cap(DIAS[d.getDay()]) + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
function fechaSimple(s) { const d = fromISO(s); return d.getDate() + ' ' + MESES_C[d.getMonth()] + (d.getFullYear() !== fromISO(hoy()).getFullYear() ? ' ' + d.getFullYear() : ''); }

/* "hoy" se puede fijar para pruebas con ?hoy=AAAA-MM-DD&hora=HH:MM */
const _qs = new URLSearchParams(location.search);
function hoy() { return _qs.get('hoy') || toISO(new Date()); }
function minutosAhora() {
  if (_qs.get('hora')) { const [h, m] = _qs.get('hora').split(':').map(Number); return h * 60 + m; }
  const d = new Date(); return d.getHours() * 60 + d.getMinutes();
}
const hhmmToMin = s => { const [h, m] = String(s || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
function minToHora(m) {
  m = Math.max(0, Math.round(m)); let h = Math.floor(m / 60) % 24; const mm = m % 60;
  const ap = h < 12 ? 'am' : 'pm'; const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ':' + pad2(mm) + ' ' + ap;
}
const horaTexto = s => minToHora(hhmmToMin(s));

/* ---------- festivos de Colombia (Ley Emiliani) ---------- */
const _fest = {};
function pascua(y) { // algoritmo de Butcher
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
    f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return toISO(new Date(y, mes - 1, dia));
}
function aLunes(s) { const d = fromISO(s).getDay(); return d === 1 ? s : addDays(s, (8 - d) % 7); }
function festivos(y) {
  if (_fest[y]) return _fest[y];
  const f = (m, d) => y + '-' + pad2(m) + '-' + pad2(d);
  const set = new Set([f(1, 1), f(5, 1), f(7, 20), f(8, 7), f(12, 8), f(12, 25)]);
  [[1, 6], [3, 19], [6, 29], [8, 15], [10, 12], [11, 1], [11, 11]].forEach(([m, d]) => set.add(aLunes(f(m, d))));
  const p = pascua(y);
  [-3, -2].forEach(n => set.add(addDays(p, n)));            // jueves y viernes santo
  [43, 64, 71].forEach(n => set.add(addDays(p, n)));        // Ascensión, Corpus, Sagrado Corazón (lunes)
  return (_fest[y] = set);
}
const esFestivo = s => festivos(+s.slice(0, 4)).has(s);
const esDomingo = s => fromISO(s).getDay() === 0;
const esHabil = s => !esDomingo(s) && !esFestivo(s);
function siguienteHabil(s) { while (!esHabil(s)) s = addDays(s, 1); return s; }

/* ---------- distancias ---------- */
function distM(a, b) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function rumbo(a, b) {
  const y = b.lat - a.lat, x = (b.lon - a.lon) * Math.cos(a.lat * Math.PI / 180);
  const ang = (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
  return ['el norte', 'el noreste', 'el oriente', 'el sureste', 'el sur', 'el suroeste', 'el occidente', 'el noroeste'][Math.round(ang / 45) % 8];
}
const km = m => m < 1000 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km';

/* ---------- celular ---------- */
function telWA(cel) {
  let d = String(cel || '').replace(/\D/g, '');
  if (d.length === 10 && d[0] === '3') d = '57' + d;
  return d.length >= 11 ? d : '';
}
const telBonito = cel => { const d = String(cel || '').replace(/\D/g, ''); return d.length === 10 ? d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6) : (cel || ''); };
