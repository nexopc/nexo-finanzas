/* Tus Finanzas — minimapa sin internet.
   Las calles de Quibdó se descargan UNA vez de OpenStreetMap (con wifi) y quedan guardadas en el celular.
   Sin mapa descargado se ve un "mapa básico": solo los puntos de los clientes y la ruta. */
'use strict';

const QUIBDO = { lat: 5.6947, lon: -76.6611, caja: [5.655, -76.69, 5.73, -76.61] }; // sur, oeste, norte, este

function consultaMapa() {
  let [s, w, n, e] = QUIBDO.caja;
  for (const c of DB.clientes) if (c.lat != null) {
    s = Math.min(s, c.lat - 0.005); n = Math.max(n, c.lat + 0.005); w = Math.min(w, c.lon - 0.005); e = Math.max(e, c.lon + 0.005);
  }
  // límite para no descargar medio Chocó
  const lat0 = (s + n) / 2, lon0 = (w + e) / 2;
  s = Math.max(s, lat0 - 0.12); n = Math.min(n, lat0 + 0.12); w = Math.max(w, lon0 - 0.12); e = Math.min(e, lon0 + 0.12);
  const b = [s, w, n, e].map(x => x.toFixed(4)).join(',');
  const hw = '^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service|track|pedestrian|footway|path|steps|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$';
  return `[out:json][timeout:90];(way["highway"~"${hw}"](${b});way["waterway"~"^(river|stream|canal)$"](${b});way["natural"="water"](${b});way["waterway"="riverbank"](${b});relation["natural"="water"](${b});node["place"~"^(suburb|neighbourhood|quarter|village|hamlet)$"](${b}););out geom qt;`;
}

/* Convierte la respuesta de OpenStreetMap a un formato pequeño: líneas en metros enteros desde el centro */
function compactarMapa(raw) {
  const els = raw.elements || [];
  let s = 90, n = -90, w = 180, e = -180;
  for (const el of els) for (const g of (el.geometry || (el.lat != null ? [el] : []))) {
    if (g.lat < s) s = g.lat; if (g.lat > n) n = g.lat; if (g.lon < w) w = g.lon; if (g.lon > e) e = g.lon;
  }
  if (s > n) throw new Error('mapa vacío');
  const lat0 = (s + n) / 2, lon0 = (w + e) / 2, kx = Math.cos(lat0 * Math.PI / 180) * 111320, ky = 110540;
  const P = g => [Math.round((g.lon - lon0) * kx), Math.round((lat0 - g.lat) * ky)];
  const flat = geom => { const a = []; for (const g of geom) { const [x, y] = P(g); a.push(x, y); } return a; };
  const MAYOR = /^(motorway|trunk|primary|secondary)(_link)?$/, MEDIA = /^(tertiary|tertiary_link|unclassified|residential|living_street)$/;
  const ways = [], labels = [];
  const anillos = segs => { // une los pedazos de un río/lago en anillos cerrados
    const rings = [], rest = segs.map(x => x.slice());
    while (rest.length) {
      let r = rest.shift();
      let cambio = true;
      while (cambio && !(r[0].lat === r[r.length - 1].lat && r[0].lon === r[r.length - 1].lon)) {
        cambio = false;
        for (let k = 0; k < rest.length; k++) {
          const q = rest[k], a = r[r.length - 1];
          if (q[0].lat === a.lat && q[0].lon === a.lon) { r = r.concat(q.slice(1)); }
          else if (q[q.length - 1].lat === a.lat && q[q.length - 1].lon === a.lon) { r = r.concat(q.slice(0, -1).reverse()); }
          else continue;
          rest.splice(k, 1); cambio = true; break;
        }
      }
      rings.push(r);
    }
    return rings;
  };
  for (const el of els) {
    const t = el.tags || {};
    if (el.type === 'node') { if (t.name) labels.push([t.name, ...P(el)]); continue; }
    if (el.type === 'relation') {
      const outer = (el.members || []).filter(m => m.type === 'way' && m.geometry && m.role !== 'inner').map(m => m.geometry);
      for (const r of anillos(outer)) if (r.length > 2) ways.push([5, flat(r)]);
      continue;
    }
    if (!el.geometry || el.geometry.length < 2) continue;
    let cls;
    if (t.highway) cls = MAYOR.test(t.highway) ? 0 : MEDIA.test(t.highway) ? 1 : 2;
    else if (t.natural === 'water' || t.waterway === 'riverbank') cls = 5;
    else if (t.waterway === 'river' || t.waterway === 'canal') cls = 3;
    else if (t.waterway) cls = 4;
    else continue;
    ways.push([cls, flat(el.geometry)]);
  }
  ways.sort((a, b) => (a[0] === 5 ? -1 : b[0] === 5 ? 1 : b[0] - a[0]));
  return { v: 1, lat0, lon0, caja: [s, w, n, e], ways, labels, fecha: hoy() };
}

let MAPA = null;
/* Primero el mapa que se actualizó desde Ajustes; si no hay, el de Quibdó que viene dentro de la app */
function cargarMapa() {
  if (MAPA) return MAPA;
  try { const t = Nativo.leer('mapa.json'); if (t) MAPA = JSON.parse(t); } catch (e) { MAPA = null; }
  if (!MAPA && window.MAPA_QUIBDO) MAPA = window.MAPA_QUIBDO;
  return MAPA;
}
const mapaIncluido = () => !!window.MAPA_QUIBDO && MAPA === window.MAPA_QUIBDO;

/* ---------- ruta por las calles, sin internet (A* sobre las calles del mapa) ---------- */
let GRAFO = null;
function grafo() {
  const m = cargarMapa(); if (!m) return null;
  if (GRAFO && GRAFO.m === m) return GRAFO;
  const id = new Map(), xs = [], ys = [], adj = [];
  const nodo = (x, y) => { const k = x + ',' + y; let i = id.get(k); if (i === undefined) { i = xs.length; id.set(k, i); xs.push(x); ys.push(y); adj.push([]); } return i; };
  for (const [cls, pts] of m.ways) {
    if (cls > 2) continue;
    let prev = -1;
    for (let k = 0; k < pts.length; k += 2) {
      const i = nodo(pts[k], pts[k + 1]);
      if (prev >= 0 && prev !== i) { const d = Math.hypot(xs[i] - xs[prev], ys[i] - ys[prev]); adj[i].push(prev, d); adj[prev].push(i, d); }
      prev = i;
    }
  }
  // red principal: el grupo de calles conectadas más grande (en OSM hay pedazos sueltos)
  const comp = new Int32Array(xs.length).fill(-1), tam = [];
  for (let i = 0; i < xs.length; i++) {
    if (comp[i] >= 0) continue;
    const c = tam.length, pila = [i]; comp[i] = c; let n = 0;
    while (pila.length) { const u = pila.pop(); n++; const ad = adj[u]; for (let k = 0; k < ad.length; k += 2) if (comp[ad[k]] < 0) { comp[ad[k]] = c; pila.push(ad[k]); } }
    tam.push(n);
  }
  const principal = tam.indexOf(Math.max(...tam));
  const celda = new Map(), C = 150;
  for (let i = 0; i < xs.length; i++) { if (!adj[i].length || comp[i] !== principal) continue; const k = Math.floor(xs[i] / C) + ',' + Math.floor(ys[i] / C); (celda.get(k) || celda.set(k, []).get(k)).push(i); }
  const kx = Math.cos(m.lat0 * Math.PI / 180) * 111320, ky = 110540;
  GRAFO = { m, xs, ys, adj, celda, C, kx, ky, cache: new Map() };
  return GRAFO;
}
function nodoCercano(g, p) {
  const x = (p.lon - g.m.lon0) * g.kx, y = (g.m.lat0 - p.lat) * g.ky;
  const cx = Math.floor(x / g.C), cy = Math.floor(y / g.C);
  let mejor = -1, md = Infinity;
  for (let r = 0; r <= 4 && mejor < 0; r++) for (let a = cx - r; a <= cx + r; a++) for (let b = cy - r; b <= cy + r; b++) {
    for (const i of (g.celda.get(a + ',' + b) || [])) { const d = Math.hypot(g.xs[i] - x, g.ys[i] - y); if (d < md) { md = d; mejor = i; } }
  }
  return mejor >= 0 && md < 600 ? { i: mejor, d: md } : null;
}
function rutaCalles(a, b) {
  const g = grafo(); if (!g || !a || !b) return null;
  const key = a.lat.toFixed(5) + ',' + a.lon.toFixed(5) + '>' + b.lat.toFixed(5) + ',' + b.lon.toFixed(5);
  if (g.cache.has(key)) return g.cache.get(key);
  const na = nodoCercano(g, a), nb = nodoCercano(g, b);
  let res = null;
  if (na && nb) {
    const N = g.xs.length, dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), cerrado = new Uint8Array(N);
    const h = i => Math.hypot(g.xs[i] - g.xs[nb.i], g.ys[i] - g.ys[nb.i]);
    const heap = [[h(na.i), na.i]]; dist[na.i] = 0;
    const push = it => { heap.push(it); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { const l = 2 * c + 1, r = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
    while (heap.length) {
      const [, u] = pop(); if (cerrado[u]) continue; cerrado[u] = 1;
      if (u === nb.i) break;
      const ad = g.adj[u];
      for (let k = 0; k < ad.length; k += 2) { const v = ad[k], nd = dist[u] + ad[k + 1]; if (nd < dist[v]) { dist[v] = nd; prev[v] = u; push([nd + h(v), v]); } }
    }
    if (dist[nb.i] < Infinity) {
      const pts = [];
      for (let u = nb.i; u >= 0; u = prev[u]) pts.push({ lat: g.m.lat0 - g.ys[u] / g.ky, lon: g.m.lon0 + g.xs[u] / g.kx });
      pts.reverse();
      const m = dist[nb.i] + na.d + nb.d;
      // si el camino da una vuelta absurda (calles mal conectadas en el mapa), mejor línea recta
      if (m <= distM(a, b) * 2.6 + 400) res = { pts: [a].concat(pts, [b]), m };
    }
  }
  g.cache.set(key, res);
  return res;
}
async function descargarMapa(progreso) {
  if (!Nativo.hay) {
    // en navegador (pruebas) se intenta directo
    try {
      progreso && progreso('Descargando calles de Quibdó…');
      const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(consultaMapa()), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      if (!r.ok) return { ok: false, error: 'servidor_' + r.status };
      const m = compactarMapa(await r.json());
      Nativo.escribir('mapa.json', JSON.stringify(m)); MAPA = m;
      return { ok: true, bytes: JSON.stringify(m).length };
    } catch (e) { return { ok: false, error: 'sin_internet' }; }
  }
  progreso && progreso('Descargando calles de Quibdó… (puede tardar un minuto)');
  const r = await Nativo.llamar('downloadMap', consultaMapa());
  if (!r.ok) return r;
  progreso && progreso('Guardando el mapa en el celular…');
  try {
    const raw = JSON.parse(Nativo.leer('map_raw.json'));
    const m = compactarMapa(raw);
    const txt = JSON.stringify(m);
    Nativo.escribir('mapa.json', txt); Nativo.borrar('map_raw.json'); MAPA = m;
    return { ok: true, bytes: txt.length };
  } catch (e) { return { ok: false, error: 'mapa_invalido' }; }
}
function borrarMapa() { Nativo.borrar('mapa.json'); MAPA = null; }

/* ---------- dibujo del mapa en un <canvas> ---------- */
class MiniMapa {
  constructor(canvas, onTap) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.onTap = onTap;
    this.m = cargarMapa();
    this.lat0 = this.m ? this.m.lat0 : QUIBDO.lat; this.lon0 = this.m ? this.m.lon0 : QUIBDO.lon;
    this.kx = Math.cos(this.lat0 * Math.PI / 180) * 111320; this.ky = 110540;
    this.cx = 0; this.cy = 0; this.mpp = 6; // metros por pixel
    this.pins = []; this.ruta = []; this.yo = null; this.sel = null;
    this.ptrs = new Map(); this._raf = 0;
    this.resize();
    canvas.addEventListener('pointerdown', e => this.down(e));
    canvas.addEventListener('pointermove', e => this.move(e));
    canvas.addEventListener('pointerup', e => this.up(e));
    canvas.addEventListener('pointercancel', e => this.up(e));
    canvas.addEventListener('wheel', e => { e.preventDefault(); this.zoomEn(e.offsetX, e.offsetY, e.deltaY > 0 ? 1.25 : 0.8); }, { passive: false });
  }
  xy(p) { return [(p.lon - this.lon0) * this.kx, (this.lat0 - p.lat) * this.ky]; }
  aPantalla(x, y) { return [(x - this.cx) / this.mpp + this.w / 2, (y - this.cy) / this.mpp + this.h / 2]; }
  resize() {
    const r = this.cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    this.w = r.width || 358; this.h = r.height || 300; this.dpr = dpr;
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.dibujar();
  }
  poner(pins, ruta, yo) { this.pins = pins; this.ruta = ruta; this.yo = yo; this.dibujar(); }
  encuadrar(puntos) {
    const pts = puntos.filter(Boolean);
    if (!pts.length) { const [x, y] = this.xy(QUIBDO); this.cx = x; this.cy = y; this.mpp = 7; return this.dibujar(); }
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { const [x, y] = this.xy(p); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    // margen: 30 px a la izquierda, 70 px a la derecha (botones del mapa), 40 arriba (etiqueta) y 30 abajo
    this.mpp = Math.min(12, Math.max(1.2, Math.max((x1 - x0) / (this.w - 100), (y1 - y0) / (this.h - 70))));
    this.cx = (x0 + x1) / 2 + 20 * this.mpp; this.cy = (y0 + y1) / 2 - 5 * this.mpp;
    this.dibujar();
  }
  centrarEn(p, mpp = 2) { const [x, y] = this.xy(p); this.cx = x; this.cy = y; this.mpp = mpp; this.dibujar(); }
  zoomEn(sx, sy, f) {
    const mx = this.cx + (sx - this.w / 2) * this.mpp, my = this.cy + (sy - this.h / 2) * this.mpp;
    this.mpp = Math.min(40, Math.max(0.6, this.mpp * f));
    this.cx = mx - (sx - this.w / 2) * this.mpp; this.cy = my - (sy - this.h / 2) * this.mpp;
    this.dibujar();
  }
  down(e) { this.cv.setPointerCapture(e.pointerId); this.ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY, x0: e.offsetX, y0: e.offsetY, t: Date.now() }); }
  move(e) {
    const p = this.ptrs.get(e.pointerId); if (!p) return;
    if (this.ptrs.size === 1) { this.cx -= (e.offsetX - p.x) * this.mpp; this.cy -= (e.offsetY - p.y) * this.mpp; }
    else if (this.ptrs.size === 2) {
      const [a, b] = [...this.ptrs.values()];
      const d0 = Math.hypot(a.x - b.x, a.y - b.y);
      p.x = e.offsetX; p.y = e.offsetY;
      const d1 = Math.hypot(a.x - b.x, a.y - b.y);
      if (d0 > 10 && d1 > 10) this.zoomEn((a.x + b.x) / 2, (a.y + b.y) / 2, d0 / d1);
      return;
    }
    p.x = e.offsetX; p.y = e.offsetY;
    this.pedir();
  }
  up(e) {
    const p = this.ptrs.get(e.pointerId); this.ptrs.delete(e.pointerId);
    if (p && this.ptrs.size === 0 && Math.hypot(e.offsetX - p.x0, e.offsetY - p.y0) < 8 && Date.now() - p.t < 400) this.tap(e.offsetX, e.offsetY);
  }
  tap(sx, sy) {
    let mejor = null, md = 30;
    for (const pin of this.pins) { if (!pin.pos) continue; const [x, y] = this.aPantalla(...this.xy(pin.pos)); const d = Math.hypot(x - sx, y - sy); if (d < md) { md = d; mejor = pin; } }
    if (mejor && this.onTap) this.onTap(mejor);
  }
  pedir() { if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = 0; this.dibujar(); }); }
  dibujar() {
    const c = this.ctx, dpr = this.dpr || 1;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = '#E9EDE6'; c.fillRect(0, 0, this.w, this.h);
    const tx = x => (x - this.cx) / this.mpp + this.w / 2, ty = y => (y - this.cy) / this.mpp + this.h / 2;
    if (this.m) {
      // las coordenadas del mapa guardado están en metros desde su propio centro
      const ox = (this.m.lon0 - this.lon0) * this.kx, oy = (this.lat0 - this.m.lat0) * this.ky;
      const ancho = { 0: Math.max(3, 14 / this.mpp), 1: Math.max(1.6, 9 / this.mpp), 2: Math.max(0.8, 4 / this.mpp), 3: Math.max(3, 60 / this.mpp), 4: Math.max(1, 6 / this.mpp) };
      const vx0 = this.cx - this.w / 2 * this.mpp - ox, vx1 = this.cx + this.w / 2 * this.mpp - ox;
      const vy0 = this.cy - this.h / 2 * this.mpp - oy, vy1 = this.cy + this.h / 2 * this.mpp - oy;
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const wy of this.m.ways) {
        const [cls, pts] = wy;
        if (cls === 2 && this.mpp > 8) continue;
        let fuera = true;
        for (let i = 0; i < pts.length; i += 2) if (pts[i] > vx0 - 200 && pts[i] < vx1 + 200 && pts[i + 1] > vy0 - 200 && pts[i + 1] < vy1 + 200) { fuera = false; break; }
        if (fuera) continue;
        c.beginPath();
        for (let i = 0; i < pts.length; i += 2) { const X = tx(pts[i] + ox), Y = ty(pts[i + 1] + oy); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }
        if (cls === 5) { c.closePath(); c.fillStyle = '#BCD6EA'; c.fill(); continue; }
        if (cls >= 3) { c.strokeStyle = '#BCD6EA'; c.lineWidth = ancho[cls]; c.stroke(); continue; }
        c.strokeStyle = cls === 0 ? '#F7E7B5' : '#FFFFFF'; c.lineWidth = ancho[cls]; c.stroke();
      }
      if (this.mpp < 9) {
        c.font = '600 11px system-ui, sans-serif'; c.fillStyle = '#6B7280'; c.textAlign = 'center';
        for (const [name, x, y] of this.m.labels) { const X = tx(x + ox), Y = ty(y + oy); if (X > -40 && X < this.w + 40 && Y > 0 && Y < this.h) c.fillText(name, X, Y); }
      }
    } else {
      // mapa básico: cuadrícula de 500 m
      c.strokeStyle = '#DDE3D9'; c.lineWidth = 1;
      const paso = 500 / this.mpp;
      const offx = ((-this.cx / this.mpp + this.w / 2) % paso + paso) % paso, offy = ((-this.cy / this.mpp + this.h / 2) % paso + paso) % paso;
      for (let x = offx; x < this.w; x += paso) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, this.h); c.stroke(); }
      for (let y = offy; y < this.h; y += paso) { c.beginPath(); c.moveTo(0, y); c.lineTo(this.w, y); c.stroke(); }
    }
    // ruta
    const rp = this.ruta.filter(Boolean);
    if (rp.length > 1) {
      c.strokeStyle = '#1D4ED8'; c.lineWidth = 4; c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([]);
      c.beginPath(); rp.forEach((p, i) => { const [x, y] = this.aPantalla(...this.xy(p)); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
    }
    // yo
    if (this.yo) {
      const [x, y] = this.aPantalla(...this.xy(this.yo));
      c.beginPath(); c.arc(x, y, 9, 0, 7); c.fillStyle = '#111827'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke();
      c.font = '800 11px system-ui, sans-serif'; c.fillStyle = '#111827'; c.textAlign = 'center'; c.fillText('Tú', x, y - 14);
    }
    // pines (los de atrás primero)
    const orden = this.pins.filter(p => p.pos).sort((a, b) => (a === this.sel) - (b === this.sel));
    for (const pin of orden) {
      const [x, y] = this.aPantalla(...this.xy(pin.pos));
      const big = pin === this.sel, r = big ? 18 : 14;
      c.beginPath(); c.arc(x, y, r, 0, 7);
      c.fillStyle = pin.color; c.fill();
      c.lineWidth = 3; c.strokeStyle = big ? '#111827' : '#FFFFFF'; c.stroke();
      c.fillStyle = pin.texto; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (pin.label === '✓') {
        c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x - 1.5, y + 4.5); c.lineTo(x + 6.5, y - 4.5); c.stroke();
      } else { c.font = '800 ' + (big ? 16 : 13) + 'px system-ui, sans-serif'; c.fillText(pin.label, x, y + 1); }
      c.textBaseline = 'alphabetic';
    }
  }
}
