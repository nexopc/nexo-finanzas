/* Tus Finanzas — pantallas y botones. */
'use strict';

/* ---------- íconos (trazo, sin emojis) ---------- */
const ICO = {
  check: '<path d="m5 12 5 5 9-10"/>',
  menos: '<path d="M5 12h14"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-5A8 8 0 1 1 21 12z"/>',
  recibo: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6"/>',
  ir: '<path d="m3 11 19-9-9 19-2-8z"/>',
  atras: '<path d="m15 18-6-6 6-6"/>',
  sig: '<path d="m9 18 6-6-6-6"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  moto: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h3l3 8M5.5 17.5 9 10h6l3.5 7.5"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  casa: '<path d="m3 11 9-8 9 8v10H3z"/>',
  ruta: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H17a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.5"/>',
  clientes: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  billete: '<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="3"/>',
  barras: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  lapiz: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  nube: '<path d="M17.5 19a4.5 4.5 0 1 0-1.3-8.8A6 6 0 0 0 4.5 12 3.5 3.5 0 0 0 6 19z"/><path d="M12 12v6"/><path d="m9 15 3-3 3 3"/>',
  pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 12v6M9 15l3 3 3-3"/>',
  basura: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
  deshacer: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  tel: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  foco: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>',
  idea: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>',
  sube: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  baja: '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  candado: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
};
const I = (n, cls = 'i', extra = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" ${extra}>${ICO[n] || ''}</svg>`;

/* ---------- estado de la pantalla ---------- */
const UI = { tab: 'ruta', sel: null, yo: null, mapaVista: null, filtro: 'todos', q: '', rep: { tipo: 'mes', off: 0 }, hojas: [] };
let mapa = null;

function toast(t, ms = 2600) {
  const el = $('#toast'); el.textContent = t; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), ms);
}

/* ---------- hojas (ventanas) ---------- */
function abrirHoja(html, { completa = false, montar } = {}) {
  const h = document.createElement('div');
  h.className = 'hoja' + (completa ? ' completa' : '');
  h.setAttribute('role', 'dialog');
  h.innerHTML = (completa ? '' : '<div class="agarre"></div>') + html;
  $('#hojas').appendChild(h);
  $('#capa').classList.add('on');
  UI.hojas.push(h);
  document.body.style.overflow = 'hidden';
  if (montar) montar(h);
  return h;
}
function cerrarHoja() {
  const h = UI.hojas.pop(); if (h) h.remove();
  if (!UI.hojas.length) { $('#capa').classList.remove('on'); document.body.style.overflow = ''; }
}
function cerrarTodas() { while (UI.hojas.length) cerrarHoja(); }
function refrescarHoja(h, html) { const ag = h.querySelector('.agarre'); h.innerHTML = (ag ? '<div class="agarre"></div>' : '') + html; }
$('#capa').addEventListener('click', cerrarHoja);
window.tfBack = () => {
  if (bloqueada) return false;
  if (UI.hojas.length) { cerrarHoja(); return true; }
  if (DB.config.listo && UI.tab !== 'ruta') { irA('ruta'); return true; }
  return false;
};
window.tfResume = () => {
  if (DB.config.pin && !bloqueada && pausaDesde && Date.now() - pausaDesde > 60000) bloquear();
  pausaDesde = 0;
  if (!UI.hojas.length && DB.config.listo) render();
};

function confirmar(titulo, texto, boton = 'Sí', color = 'rojo') {
  return new Promise(res => {
    abrirHoja(`<div class="card" style="margin-top:14px"><h2 style="font-size:19px">${esc(titulo)}</h2>
      <p class="muted" style="margin:8px 0 16px;font-size:14px;line-height:1.45">${texto}</p>
      <div class="form"><button class="btn ${color}" data-si>${esc(boton)}</button><button class="btn gris bajo" data-no>Cancelar</button></div></div>`,
      { montar: h => { h.querySelector('[data-si]').onclick = () => { cerrarHoja(); res(true); }; h.querySelector('[data-no]').onclick = () => { cerrarHoja(); res(false); }; } });
  });
}

/* ---------- campos de plata con puntos de miles ---------- */
document.addEventListener('input', e => {
  const el = e.target;
  if (!el.classList || !el.classList.contains('plata')) return;
  const n = parseMoney(el.value);
  el.value = n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
});
const valorDe = (h, sel) => parseMoney(h.querySelector(sel).value);
const plataAttr = n => n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

/* ---------- navegación ---------- */
const TABS = [['ruta', 'Ruta', 'ruta'], ['resumen', 'Resumen', 'casa'], ['clientes', 'Clientes', 'clientes'], ['gastos', 'Gastos', 'billete'], ['reportes', 'Reportes', 'barras']];
function irA(t) { UI.tab = t; window.scrollTo(0, 0); render(); }

function render() {
  const v = $('#vista'), menu = $('#menu'), fab = $('#fab');
  if (!DB.config.listo) { menu.classList.add('oculto'); fab.classList.add('oculto'); v.innerHTML = vistaBienvenida(); montarBienvenida(); return; }
  menu.classList.remove('oculto');
  menu.innerHTML = TABS.map(([k, t, ic]) => `<button type="button" class="${UI.tab === k ? 'on' : ''}" data-tab="${k}" aria-current="${UI.tab === k ? 'page' : 'false'}">${I(ic)}${t}</button>`).join('');
  const conFab = ['ruta', 'resumen', 'clientes'].includes(UI.tab);
  fab.classList.toggle('oculto', !conFab);
  fab.innerHTML = I('mas', 'i', 'style="stroke-width:2.8"') + 'Prestar';
  if (mapa && UI.tab !== 'ruta') mapa = null;
  ({ ruta: vistaRuta, resumen: vistaResumen, clientes: vistaClientes, gastos: vistaGastos, reportes: vistaReportes })[UI.tab]();
}
$('#menu').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) irA(b.dataset.tab); });
$('#fab').addEventListener('click', () => hojaPrestamo());

/* acciones con data-acc en cualquier botón */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-acc]'); if (!b) return;
  const f = ACC[b.dataset.acc]; if (f) { e.preventDefault(); f(b.dataset.id, b); }
});

/* ======================================================================
   BIENVENIDA
   ====================================================================== */
function vistaBienvenida() {
  return `<div class="bienvenida">
    <div class="logo"><span>$</span></div>
    <div><h1 style="font-size:30px;font-weight:800">Tus Finanzas</h1>
    <p class="muted" style="font-size:15px;margin-top:6px;line-height:1.45">Tus préstamos, cobros y ganancias en un solo lugar. Funciona sin internet.</p></div>
    <div class="form">
      <label class="campo">¿Cómo te llamas?<input id="b-nombre" autocomplete="off" placeholder="Tu nombre"></label>
      <label class="campo">¿Cuánta plata tienes hoy en mano para prestar?<input id="b-capital" class="plata" inputmode="numeric" placeholder="$0"></label>
      <p class="muted">No cuentes lo que ya está prestado: eso lo agregas después, cliente por cliente.</p>
    </div>
    <div><p class="b" style="font-size:14px;margin-bottom:8px">Cada color hace siempre lo mismo:</p>
    <div class="leyenda">
      <div><i style="background:var(--verde)"></i>Verde: entra plata</div><div><i style="background:var(--rojo)"></i>Rojo: sale o atraso</div>
      <div><i style="background:var(--ambar)"></i>Amarillo: toca hoy</div><div><i style="background:var(--azul)"></i>Azul: crear nuevo</div>
      <div><i style="background:var(--morado)"></i>Morado: enviar</div><div><i style="background:var(--gris)"></i>Gris: ver o editar</div>
    </div></div>
    <button class="btn verde alto" id="b-ok" style="margin-top:auto">${I('check')}Empezar</button>
    <p class="muted" style="text-align:center">¿Ya tenías la app? <button class="btn gris bajo" style="width:auto;display:inline-flex;margin-left:6px" data-acc="restaurar">Restaurar copia</button></p>
  </div>`;
}
function montarBienvenida() {
  $('#b-ok').onclick = () => {
    const n = $('#b-nombre').value.trim();
    DB.config.nombre = n; DB.config.capitalInicial = parseMoney($('#b-capital').value);
    DB.config.fechaInicio = hoy(); DB.config.listo = true;
    guardar(); Nativo.pedirAvisos(); UI.tab = 'ruta'; render();
  };
}

/* ======================================================================
   RUTA DE HOY (pantalla principal)
   ====================================================================== */
function puntoDeInicio(cobrados) {
  if (UI.yo) return UI.yo;
  const ult = cobrados.filter(o => o.c.lat != null).slice(-1)[0];
  if (ult) return { lat: ult.c.lat, lon: ult.c.lon };
  return DB.config.salida || null;
}
function vistaRuta() {
  const d = hoy();
  const { paradas, cobrados } = paradasDeHoy(d);
  const inicio = puntoDeInicio(cobrados);
  const plan = planearRuta(paradas, inicio, minutosAhora());
  // trazado por las calles (sin internet); si no hay calle cerca, línea recta
  const tramos = [], puntosRuta = [inicio].concat(plan.orden.map(s => s.pos)).filter(Boolean);
  let mCalles = 0, todasPorCalle = puntosRuta.length > 1;
  for (let k = 1; k < puntosRuta.length; k++) {
    const r = DB.config.mapa !== 'off' ? rutaCalles(puntosRuta[k - 1], puntosRuta[k]) : null;
    if (r) { tramos.push(...r.pts); mCalles += r.m; } else { tramos.push(puntosRuta[k - 1], puntosRuta[k]); mCalles += distM(puntosRuta[k - 1], puntosRuta[k]) * FACTOR_CALLE; todasPorCalle = false; }
  }
  if (puntosRuta.length > 1) plan.totalM = mCalles;
  const todos = plan.orden.concat(plan.sinPos);
  const total = paradas.reduce((s, p) => s + p.deuda, 0);
  if (!todos.some(s => s.c.id === UI.sel)) UI.sel = todos[0] ? todos[0].c.id : null;
  const sel = todos.find(s => s.c.id === UI.sel);
  const modo = DB.config.mapa;
  const hayMapa = !!cargarMapa();
  const nCob = cobrados.length;
  let h = `<div class="top"><div><h1>Ruta de hoy</h1><p class="sub">${fechaLarga(d)} · ${paradas.length} ${paradas.length === 1 ? 'cobro' : 'cobros'}${total ? ' · ' + money(total) : ''}</p></div>
    <div class="top-acc">${plan.totalM > 0 ? `<span class="chip">${I('moto', 'i', 'style="width:18px;height:18px"')}≈ ${km(plan.totalM)}</span>` : ''}
    <button class="icono-btn" data-acc="ajustes" aria-label="Ajustes">${I('ajustes')}</button></div></div>`;

  h += avisoActualizacion();
  if (!DB.config.tipCuaderno && DB.clientes.length < 3)
    h += `<div class="aviso azul">${I('idea')}<span><b>Pasa tus clientes del cuaderno:</b> toca <b>+ Prestar</b> y marca "Ya venía del cuaderno".</span><button class="icono-btn" style="width:36px;height:36px" data-acc="cerrarTip" aria-label="Cerrar">✕</button></div>`;

  if (!paradas.length && !cobrados.length) {
    h += `<div class="card vacio"><b>Hoy no tienes cobros</b>${DB.clientes.length ? 'Ningún cliente tiene cuotas para hoy ni atrasadas.' : 'Empieza agregando tu primer cliente con el botón azul <b>+ Prestar</b>.'}</div>`;
    $('#vista').innerHTML = h; mapa = null; return;
  }

  if (modo !== 'off') {
    const chip = hayMapa ? `${I('check', 'i', 'style="width:14px;height:14px;color:var(--verde);stroke-width:3.2"')}Sin internet${todasPorCalle ? ' · ruta por calles' : ''}`
      : `Mapa básico · <button data-acc="ajustes" style="border:0;background:none;padding:0;color:var(--azul);font-weight:800;font-size:11px">descargar calles</button>`;
    h += `<div class="mapa-box"><canvas id="mapa" aria-label="Mapa de la ruta de cobro"></canvas><div class="mapa-chip">${chip}</div>
      <div class="mapa-ctrl"><button data-acc="zoomMas" aria-label="Acercar">+</button><button data-acc="zoomMenos" aria-label="Alejar">−</button>
      <button data-acc="miUbicacion" aria-label="Usar mi ubicación">${I('foco', 'i', 'style="width:20px;height:20px"')}</button></div></div>`;
  }

  if (sel) {
    const pos = todos.indexOf(sel), num = nCob + pos + 1;
    const est = sel.atrasado ? `<span class="eti rojo">ATRASADO ${sel.dias} ${sel.dias === 1 ? 'DÍA' : 'DÍAS'} · PARADA ${num}</span>` : `<span class="eti ambar">SIGUIENTE · PARADA ${num}</span>`;
    const deb = sel.pend.length > 1 ? `<p class="muted rojo b" style="margin-top:2px">Debe ${sel.pend.length} cuotas · ${money(sel.deuda)}</p>` : '';
    h += `<div class="card sig ${sel.atrasado ? 'atr' : ''}">
      <div class="fila" style="align-items:flex-start"><div style="min-width:0">${est}
        <h2 style="font-size:20px;font-weight:800;margin-top:3px">${esc(sel.c.nombre)}</h2>
        <p class="muted">${esc(sel.c.dir || 'Sin dirección')}</p>${deb}</div>
        <div style="text-align:right"><b style="font-size:20px">${money(sel.cuota)}</b>${sel.cuota > valores(sel.p)[sel.pend[0]].valor ? '<p class="peq rojo">con mora</p>' : ''}</div></div>
      <div style="height:12px"></div>
      <div class="botones">
        <button class="btn verde" data-acc="cobrar" data-id="${sel.c.id}">${I('check', 'i', 'style="stroke-width:3"')}Cobrar</button>
        <button class="btn gris" data-acc="comoLlegar" data-id="${sel.c.id}">${I('ir')}Cómo llegar</button>
      </div>
      <div class="botones" style="margin-top:8px">
        <button class="btn morado bajo" data-acc="recordar" data-id="${sel.c.id}">${I('chat')}Recordar</button>
        <button class="btn borde bajo" data-acc="googleMaps" data-id="${sel.c.id}">${I('pin')}Google Maps</button>
      </div>
      <div style="margin-top:8px"><button class="btn borde bajo" data-acc="ficha" data-id="${sel.c.id}">Ver cliente ${I('sig', 'i', 'style="width:18px;height:18px"')}</button>
      </div></div>`;
  } else {
    h += `<div class="card vacio"><b>¡Terminaste la ruta de hoy!</b>Cobraste ${money(cobrados.reduce((s, o) => s + o.total, 0))} en ${nCob} ${nCob === 1 ? 'cobro' : 'cobros'}.</div>`;
  }

  // lista completa
  h += '<div class="lista">';
  for (const o of cobrados) h += `<button class="item" data-acc="ficha" data-id="${o.c.id}"><span class="num verde">${I('check', 'i', 'style="width:15px;height:15px;stroke-width:3.4"')}</span>
      <span class="cuerpo"><b style="text-decoration:line-through;color:var(--suave)">${esc(o.c.nombre)}</b><span>${esc(o.c.dir || '')}</span></span><span class="der verde">Cobrado<br><small>${money(o.total)}</small></span></button>`;
  plan.orden.forEach((s, k) => {
    h += itemParada(s, nCob + k + 1, false);
  });
  if (plan.sinPos.length) {
    h += '<div class="separador">Sin ubicación en el mapa</div>';
    plan.sinPos.forEach((s, k) => { h += itemParada(s, nCob + plan.orden.length + k + 1, true); });
  }
  h += '</div>';
  if (plan.sinPos.length) h += `<p class="muted" style="margin:8px 20px 0">Cuando estés en la casa de un cliente sin ubicación, toca el botón ${I('pin', 'i', 'style="width:14px;height:14px;vertical-align:-2px"')} para guardarla.</p>`;
  $('#vista').innerHTML = h;

  if (modo !== 'off') {
    const cv = $('#mapa');
    const vistaPrev = mapa && UI.mapaVista;
    mapa = new MiniMapa(cv, pin => { UI.sel = pin.id; guardarVistaMapa(); render(); });
    const pins = cobrados.filter(o => o.c.lat != null).map(o => ({ id: o.c.id, pos: { lat: o.c.lat, lon: o.c.lon }, color: '#0E7A45', texto: '#fff', label: '✓' }))
      .concat(plan.orden.map((s, k) => ({ id: s.c.id, pos: s.pos, color: s.atrasado ? '#C62828' : '#F5A524', texto: s.atrasado ? '#fff' : '#111827', label: String(nCob + k + 1) })));
    mapa.sel = pins.find(p => p.id === UI.sel) || null;
    mapa.poner(pins, tramos.length ? tramos : puntosRuta, UI.yo || (DB.config.salida && !cobrados.length ? DB.config.salida : null));
    if (UI.mapaVista && UI.mapaVista.dia === d) Object.assign(mapa, UI.mapaVista.v), mapa.dibujar();
    else mapa.encuadrar(pins.map(p => p.pos).concat(inicio ? [inicio] : []));
    if (!vistaPrev) guardarVistaMapa();
  }
}
function guardarVistaMapa() { if (mapa) UI.mapaVista = { dia: hoy(), v: { cx: mapa.cx, cy: mapa.cy, mpp: mapa.mpp } }; }
window.addEventListener('pointerup', () => { if (mapa) guardarVistaMapa(); });
window.addEventListener('resize', () => { if (mapa) mapa.resize(); });

function itemParada(s, num, sinPos) {
  const color = s.atrasado ? 'rojo' : 'ambar';
  const det = esc(s.c.dir || 'Sin dirección') + (s.atrasado ? ' · <b class="rojo">atrasado</b>' : '') + (s.pend.length > 1 ? ' · ' + s.pend.length + ' cuotas' : '');
  const der = sinPos ? `<span class="der"><button class="icono-btn" style="width:40px;height:40px" data-acc="ubicar" data-id="${s.c.id}" aria-label="Guardar ubicación de ${esc(s.c.nombre)}">${I('pin', 'i', 'style="width:19px;height:19px"')}</button></span>`
    : `<span class="der">${money(s.deuda)}${s.legM ? '<br><small class="muted">' + km(s.legM) + '</small>' : ''}</span>`;
  return `<div class="item" style="${s.c.id === UI.sel ? 'background:#FFFBEB;margin:0 -12px;padding:11px 12px;width:calc(100% + 24px)' : ''}">
    <span class="num ${color}">${num}</span>
    <button class="cuerpo" style="border:0;background:none;padding:0;text-align:left" data-acc="elegir" data-id="${s.c.id}"><b>${esc(s.c.nombre)}</b><span>${det}</span></button>${der}</div>`;
}

/* ======================================================================
   RESUMEN
   ====================================================================== */
function vistaResumen() {
  const d = hoy(), capHoy = capitalTotal(d), capIni = capitalTotal(addDays(monthStart(d), -1));
  const gan = capHoy - capIni, pc = capIni > 0 ? gan / capIni * 100 : 0;
  const im = interesesMes(d), co = consejo(d);
  const { paradas } = paradasDeHoy(d);
  const atr = DB.clientes.filter(c => estadoCliente(c).tipo === 'atrasado').length;
  const maxBar = Math.max(im.potencial, im.deberia, im.real, 1);
  let h = `<div class="top"><div><p class="sub" style="margin:0">Hola${DB.config.nombre ? ', ' + esc(DB.config.nombre) : ''}</p><h1>Resumen</h1></div>
    <div class="top-acc"><button class="icono-btn" data-acc="ajustes" aria-label="Ajustes">${I('ajustes')}</button></div></div>`;
  h += avisoActualizacion();
  const dCopia = DB.config.ultimaCopia ? diffDays(d, DB.config.ultimaCopia) : 999;
  if (DB.clientes.length && dCopia > 7)
    h += `<div class="aviso morado">${I('nube')}<span>${DB.config.ultimaCopia ? 'Tu última copia fue hace ' + dCopia + ' días.' : 'Aún no tienes copia de seguridad.'} Guárdala en Drive por si pierdes el celular.</span><button class="btn morado bajo" style="width:auto" data-acc="copia">Copiar</button></div>`;
  h += `<div class="card capital"><span style="font-size:13px;color:#D1D5DB">Mi capital total</span><div class="grande">${money(capHoy)}</div>
    <div class="grid2" style="margin-top:12px"><div class="mini"><span>Prestado en la calle</span><b>${money(enLaCalle(d))}</b></div><div class="mini"><span>Plata en mano</span><b>${money(plataEnMano(d))}</b></div></div>
    <div class="ganancia ${gan >= 0 ? 'mas' : 'menos'}">${I(gan >= 0 ? 'sube' : 'baja', 'i', 'style="width:20px;height:20px;stroke-width:2.4"')}
      <div><b style="font-size:15px">${money(gan, true)} este mes (${gan >= 0 ? '+' : ''}${pct(pc)} %)</b><span style="display:block;font-size:12px;opacity:.9">El 1 de ${MESES[fromISO(d).getMonth()]} tenías ${money(capIni)}</span></div></div></div>`;

  // consejo
  h += `<div class="card"><div class="tit">${I('idea', 'i', 'style="width:20px;height:20px"')}<h2>Consejo del mes</h2></div>`;
  if (co.real <= 0) h += `<p class="muted" style="font-size:14px;line-height:1.45">Aún no has cobrado intereses este mes. Cuando cobres, aquí te digo cuánto volver a prestar y cuánto puedes gastar.</p>${co.F ? `<div class="reparto" style="background:var(--rojo-bg)">Gastos fijos que faltan<b class="rojo">${money(co.F)}</b></div>` : ''}`;
  else {
    h += `<p class="muted" style="font-size:14px;line-height:1.45">Este mes llevas ${money(co.real)} en intereses cobrados. Así te recomiendo repartirlos:</p>
      <div class="reparto" style="background:var(--azul-bg)">Volver a prestar (${DB.config.reinvertir} %)<b class="azul">${money(co.reinv)}</b></div>
      <div class="reparto" style="background:var(--rojo-bg)">Gastos fijos que faltan<b class="rojo">${money(co.F)}</b></div>
      <div class="reparto" style="background:var(--verde-bg)"><b>Puedes gastar en ti</b><b class="verde" style="font-size:17px">${money(Math.max(0, co.libre))}</b></div>
      <p class="muted" style="margin-top:8px">${co.libre > 0 ? '≈ ' + money(co.porDia) + ' por día hasta fin de mes.' : 'Por ahora no gastes en ti: primero cubre los gastos fijos.'}</p>`;
  }
  h += '</div>';

  // gráfica
  const barra = (t, v, color, b) => `<div style="margin-top:12px"><div class="fila"><span style="font-size:13px;color:#374151">${t}</span><span style="font-size:13px" class="b ${b || ''}">${money(v)}</span></div>
    <div class="barra"><div style="width:${Math.round(v / maxBar * 100)}%;background:${color}"></div></div></div>`;
  h += `<div class="card"><h2>Intereses de ${MESES[fromISO(d).getMonth()]}</h2>
    ${barra('Potencial con clientes actuales', im.potencial, '#93A3B8')}
    ${barra('Lo que debería llevar hoy', im.deberia, 'var(--ambar)')}
    ${barra('Lo que de verdad cobré', im.real, 'var(--verde)', 'verde')}
    <p class="muted peq" style="margin-top:12px">${im.deberia > im.real ? 'Te faltan ' + money(im.deberia - im.real) + ' de intereses en cuotas que ya vencieron.' : 'Vas al día con lo que deberías llevar.'}
    En total tus clientes actuales te van a dejar <b>${money(interesFuturo())}</b> más de ganancia.</p></div>`;

  h += `<div class="grid2" style="margin:12px 16px 0">
    <button class="btn" style="height:auto;flex-direction:column;align-items:flex-start;padding:14px;background:var(--ambar);color:var(--texto)" data-acc="tab" data-id="ruta"><span style="font-size:26px">${paradas.length}</span><span style="font-size:13px;font-weight:600">cobros hoy</span></button>
    <button class="btn" style="height:auto;flex-direction:column;align-items:flex-start;padding:14px;background:var(--rojo);color:#fff" data-acc="verAtrasados"><span style="font-size:26px">${atr}</span><span style="font-size:13px;font-weight:600">atrasados</span></button></div>`;
  $('#vista').innerHTML = h;
}

/* ======================================================================
   CLIENTES
   ====================================================================== */
function vistaClientes() {
  const F = [['todos', 'Todos'], ['atrasado', 'Atrasados'], ['aldia', 'Al día'], ['termino', 'Terminaron']];
  let h = `<div class="top"><div><h1>Clientes</h1><p class="sub">${DB.clientes.length} ${DB.clientes.length === 1 ? 'cliente' : 'clientes'} · ${money(porCobrarTotal())} por cobrar</p></div></div>
    <label class="buscar">${I('buscar', 'i', 'style="color:var(--suave)"')}<input id="q" type="search" placeholder="Buscar por nombre o barrio" value="${esc(UI.q)}" aria-label="Buscar cliente"></label>
    <div class="filtros">${F.map(([k, t]) => `<button data-acc="filtro" data-id="${k}" class="${UI.filtro === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div id="lista-clientes"></div>`;
  $('#vista').innerHTML = h;
  $('#q').addEventListener('input', e => { UI.q = e.target.value; pintarClientes(); });
  pintarClientes();
}
function pintarClientes() {
  const q = UI.q.trim().toLowerCase();
  const filas = DB.clientes.map(c => ({ c, e: estadoCliente(c) })).filter(({ c, e }) => {
    if (q && !(c.nombre.toLowerCase().includes(q) || (c.dir || '').toLowerCase().includes(q))) return false;
    if (UI.filtro === 'todos') return true;
    if (UI.filtro === 'aldia') return e.tipo === 'aldia' || e.tipo === 'hoy';
    if (UI.filtro === 'termino') return e.tipo === 'termino';
    return e.tipo === UI.filtro;
  });
  const peso = { atrasado: 0, hoy: 1, aldia: 2, sin: 3, termino: 4 };
  filas.sort((a, b) => peso[a.e.tipo] - peso[b.e.tipo] || a.c.nombre.localeCompare(b.c.nombre));
  const el = $('#lista-clientes'); if (!el) return;
  if (!filas.length) { el.innerHTML = `<div class="card vacio"><b>${DB.clientes.length ? 'No hay clientes aquí' : 'Aún no tienes clientes'}</b>${DB.clientes.length ? 'Prueba con otro filtro.' : 'Toca el botón azul <b>+ Prestar</b> para crear el primero.'}</div>`; return; }
  el.innerHTML = '<div class="lista">' + filas.map(({ c, e }) => {
    let col, txt;
    if (e.tipo === 'atrasado') { col = ['var(--rojo-bg)', 'var(--rojo-t)']; txt = `<b class="rojo">Atrasado ${e.dias} ${e.dias === 1 ? 'día' : 'días'}</b> · debe ${money(saldo(e.p))}`; }
    else if (e.tipo === 'hoy') { col = ['var(--ambar-bg)', 'var(--ambar-t)']; txt = `<b class="ambar">Paga hoy</b> · debe ${money(saldo(e.p))}`; }
    else if (e.tipo === 'aldia') { col = ['var(--verde-bg)', 'var(--verde)']; txt = `Al día · próxima ${fechaCorta(e.p.fechas[e.proxima])} · debe ${money(saldo(e.p))}`; }
    else { col = ['var(--gris)', 'var(--suave)']; txt = e.tipo === 'termino' ? 'Terminó de pagar' : 'Sin préstamo'; }
    const prog = e.p ? `<span class="der" style="font-size:13px">${e.p.pagos.length}/${e.p.cuotas}</span>` : '';
    return `<button class="item" data-acc="ficha" data-id="${c.id}"><span class="avatar" style="background:${col[0]};color:${col[1]}">${esc(c.nombre.trim().charAt(0).toUpperCase())}</span>
      <span class="cuerpo"><b>${esc(c.nombre)}</b><span>${txt}</span></span>${prog}${I('sig', 'i', 'style="width:18px;height:18px;color:var(--suave)"')}</button>`;
  }).join('') + '</div>';
}

/* ---------- ficha del cliente ---------- */
function hojaFicha(cid) {
  const h = abrirHoja('', { completa: true });
  pintarFicha(h, cid);
}
function pintarFicha(h, cid) {
  const c = cliente(cid); if (!c) { cerrarHoja(); return; }
  const p = prestamoActivo(cid), d = hoy();
  h._cal = h._cal || {};
  let x = `<div class="top" style="align-items:center"><button class="atras" data-acc="cerrar" aria-label="Volver">${I('atras', 'i', 'style="width:26px;height:26px"')}</button>
    <div style="flex:1;min-width:0"><h1 style="font-size:21px">${esc(c.nombre)}</h1><p class="sub">${esc(telBonito(c.cel) || 'Sin celular')}${c.dir ? ' · ' + esc(c.dir) : ''}</p></div>
    <button class="icono-btn" style="background:var(--gris);border:0" data-acc="editarCliente" data-id="${cid}" aria-label="Editar datos del cliente">${I('lapiz')}</button></div>`;
  if (p) {
    const v = valores(p), completas = cuotasCompletas(p);
    const pend = cuotasPendientesHasta(p, d), abonos = cuotasPendientes(p).filter(i => pagadoCuota(p, i) > 0);
    x += `<div class="card"><div class="fila" style="align-items:flex-end"><div><span class="muted">Le falta pagar</span><div style="font-size:28px;font-weight:800">${money(saldo(p))}</div></div>
      <b class="verde" style="font-size:14px">${completas} de ${p.cuotas} cuotas</b></div>
      <div class="barra" style="height:12px"><div style="width:${Math.round(pagadoTotal(p) / (p.monto + p.interes) * 100)}%;background:var(--verde)"></div></div>
      <div class="grid3" style="margin-top:12px"><div><span class="muted peq">Le presté</span><br><b style="font-size:14px">${money(p.monto)}</b></div>
      <div><span class="muted peq">Ya pagó</span><br><b class="verde" style="font-size:14px">${money(pagadoTotal(p))}</b></div>
      <div><span class="muted peq">Ganancia total</span><br><b style="font-size:14px">${money(p.interes)}</b></div></div>
      <p class="muted peq" style="margin-top:10px">${FREC_TXT[p.frecuencia]} · ${money(v[0].valor)} por cuota${p.tasa != null ? ' · ' + pct(p.tasa, p.tasa % 1 ? 1 : 0) + ' % mensual × ' + mesesTexto(p.meses) : ''}${p.previo ? ' · venía del cuaderno' : ''}</p>
      ${pend.length ? `<div class="aviso" style="margin:10px 0 0;background:var(--rojo-bg);color:#450a0a">${I('reloj', 'i', 'style="color:var(--rojo-t);width:18px;height:18px"')}<span><b class="rojo">Debe ${pend.length} ${pend.length === 1 ? 'cuota' : 'cuotas'}</b> · ${money(pend.reduce((s, i) => s + faltaCuota(p, i), 0))}</span></div>` : ''}
      ${abonos.length ? `<p class="muted peq" style="margin-top:6px">Tiene ${abonos.length === 1 ? 'un abono' : abonos.length + ' abonos'}: falta completar ${abonos.map(i => fechaSimple(p.fechas[i])).join(', ')}.</p>` : ''}</div>
      <div style="margin:12px 16px 0" class="form">
        <button class="btn verde alto" data-acc="cobrar" data-id="${cid}">${I('check', 'i', 'style="stroke-width:3"')}Registrar pago</button>
        <div class="botones"><button class="btn morado bajo" data-acc="recordar" data-id="${cid}">${I('chat')}Recordar</button>
        <button class="btn morado bajo" data-acc="recibo" data-id="${cid}" ${grupos(p).length ? '' : 'disabled'}>${I('recibo')}Enviar recibo</button></div></div>`;
    // calendario (o lista completa)
    if (!h._cal.mes || h._cal.cid !== cid) {
      const ref = pend[0] != null ? p.fechas[pend[0]] : (proximaCuota(p) >= 0 ? p.fechas[proximaCuota(p)] : d);
      h._cal = { cid, mes: monthStart(ref < p.fechas[0] ? p.fechas[0] : (ref > p.fechas[p.cuotas - 1] ? p.fechas[p.cuotas - 1] : (d >= p.fechas[0] && d <= p.fechas[p.cuotas - 1] ? d : ref))), todas: false };
    }
    x += `<div class="card">${h._cal.todas ? listaCuotas(p, d) : calendarioCuotas(p, h._cal.mes, d)}
      ${grupos(p).length ? `<button class="btn gris bajo" style="margin-top:10px" data-acc="deshacer" data-id="${cid}">${I('deshacer')}Deshacer el último pago</button>` : ''}</div>`;
  } else {
    x += `<div class="card vacio"><b>${prestamosDe(cid).length ? 'Terminó de pagar' : 'No tiene préstamo'}</b>¿Le vas a prestar otra vez?</div>
      <div style="margin:12px 16px 0"><button class="btn azul alto" data-acc="prestarA" data-id="${cid}">${I('mas', 'i', 'style="stroke-width:2.8"')}Nuevo préstamo para ${esc(c.nombre.split(' ')[0])}</button></div>`;
  }
  x += `<div class="card"><h2 style="margin-bottom:10px">Datos</h2><div class="form" style="gap:10px;font-size:14px">
    ${c.cedula ? `<div class="fila"><span class="muted">Cédula</span><b>${esc(c.cedula)}</b></div>` : ''}
    <div class="fila"><span class="muted">Ubicación</span><b class="${c.lat != null ? 'verde' : 'rojo'}">${c.lat != null ? 'Guardada' + (c.acc ? ' (±' + c.acc + ' m)' : '') : 'Sin guardar'}</b></div>
    ${c.notas ? `<div><span class="muted">Notas</span><p style="margin-top:2px">${esc(c.notas)}</p></div>` : ''}
    <div class="botones"><button class="btn gris bajo" data-acc="ubicar" data-id="${cid}">${I('pin')}${c.lat != null ? 'Cambiar ubicación' : 'Estoy aquí: guardar'}</button>
    <button class="btn gris bajo" data-acc="llamar" data-id="${cid}" ${c.cel ? '' : 'disabled'}>${I('tel')}Llamar</button></div></div></div>`;
  const viejos = prestamosDe(cid).filter(q => q !== p);
  if (viejos.length) x += `<div class="card"><h2 style="margin-bottom:8px">Préstamos anteriores</h2>${viejos.map(q => `<div class="fila" style="font-size:14px;padding:6px 0"><span>${fechaSimple(q.creado)} · ${money(q.monto)} en ${q.cuotas} cuotas</span><b class="verde">+${money(q.interes)}</b></div>`).join('')}</div>`;
  x += `<div style="margin:16px 16px 24px"><button class="btn borde-rojo bajo" data-acc="borrarCliente" data-id="${cid}">${I('basura')}Eliminar cliente</button></div>`;
  const y = h.scrollTop;
  refrescarHoja(h, x);
  h.scrollTop = y;
  h.dataset.ficha = cid;
  h.onclick = e => {
    const b = e.target.closest('[data-cal]'); if (!b || !p) return;
    const a = b.dataset.cal;
    if (a === 'ant') h._cal.mes = addMonths(h._cal.mes, -1);
    else if (a === 'sig') h._cal.mes = addMonths(h._cal.mes, 1);
    else if (a === 'todas') h._cal.todas = true;
    else if (a === 'cal') h._cal.todas = false;
    else { hojaCuota(p, +a); return; }
    pintarFicha(h, cid);
  };
}
const ESTADO_TXT = { pagada: 'Pagó a tiempo', tarde: 'Pagó otro día (tarde)', vencida: 'No pagó', abono: 'Abono (pagó una parte)', hoy: 'Hoy', futura: 'Falta (próximas)' };
function leyendaCuotas() {
  return `<div class="leyenda-cal">${['pagada', 'tarde', 'vencida', 'abono', 'hoy', 'futura'].map(k => `<span><i class="dia ${k}"></i>${ESTADO_TXT[k]}</span>`).join('')}</div>`;
}
function calendarioCuotas(p, mes, d) {
  const porDia = {};
  p.fechas.forEach((f, i) => { if (f.slice(0, 7) === mes.slice(0, 7)) (porDia[f] = porDia[f] || []).push(i); });
  const primero = fromISO(mes), vacios = (primero.getDay() + 6) % 7, dias = fromISO(monthEnd(mes)).getDate();
  const hayAntes = p.fechas[0] < mes, hayDespues = p.fechas[p.cuotas - 1] > monthEnd(mes);
  let g = '';
  for (let k = 0; k < vacios; k++) g += '<span></span>';
  for (let n = 1; n <= dias; n++) {
    const f = mes.slice(0, 8) + pad2(n), idx = porDia[f];
    if (idx) {
      const i = idx[0], e = estadoCuota(p, i, d);
      g += `<button type="button" class="dia ${e}" data-cal="${i}" aria-label="Cuota ${i + 1}, ${fechaCorta(f)}: ${ESTADO_TXT[e]}"><span>${n}</span>${idx.length > 1 ? '<small>×' + idx.length + '</small>' : ''}</button>`;
    } else g += `<span class="dia nada">${n}${esFestivo(f) ? '<small>festivo</small>' : ''}</span>`;
  }
  return `<div class="fila" style="margin-bottom:8px"><button class="icono-btn" style="width:40px;height:40px" data-cal="ant" ${hayAntes ? '' : 'disabled style="width:40px;height:40px;opacity:.3"'} aria-label="Mes anterior">${I('atras', 'i', 'style="width:20px;height:20px"')}</button>
    <b style="font-size:16px">${cap(MESES[primero.getMonth()])} ${primero.getFullYear()}</b>
    <button class="icono-btn" style="width:40px;height:40px" data-cal="sig" ${hayDespues ? '' : 'disabled style="width:40px;height:40px;opacity:.3"'} aria-label="Mes siguiente">${I('sig', 'i', 'style="width:20px;height:20px"')}</button></div>
    <div class="cal cab"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
    <div class="cal">${g}</div>${leyendaCuotas()}
    <p class="muted peq" style="margin:8px 0">Toca un día para editar esa cuota.</p>
    <button class="btn borde bajo" data-cal="todas">Mostrar todas las cuotas (${p.cuotas})</button>`;
}
function listaCuotas(p, d) {
  const v = valores(p);
  let x = `<div class="fila" style="margin-bottom:8px"><h2>Todas las cuotas</h2><button class="btn borde bajo" style="width:auto;height:38px" data-cal="cal">${I('cal', 'i', 'style="width:18px;height:18px"')}Calendario</button></div><div class="form" style="gap:6px">`;
  for (let i = 0; i < p.cuotas; i++) {
    const e = estadoCuota(p, i, d), pag = pagadoCuota(p, i), fp = fechaPagoCuota(p, i);
    const der = { pagada: 'Pagada' + (fp && !p.pagos.some(q => q.i === i && q.previo) ? ' ' + fechaSimple(fp) : ''), tarde: 'Pagó ' + fechaSimple(fp), abono: 'Abonó ' + money(pag), vencida: 'Debe ' + money(v[i].valor), hoy: 'HOY ' + money(v[i].valor), futura: money(v[i].valor) }[e];
    x += `<button type="button" class="cuota-fila" data-cal="${i}"><i class="dia ${e}" style="width:30px;height:30px;font-size:12px"><span>${fromISO(p.fechas[i]).getDate()}</span></i>
      <span class="c1"><b>${i + 1} · ${fechaCorta(p.fechas[i])}</b></span><span class="b">${der}</span>${I('sig', 'i', 'style="width:16px;height:16px;color:var(--suave)"')}</button>`;
  }
  return x + '</div>';
}
/* Al tocar una cuota: botones con formas distintas para cada acción */
function hojaCuota(p, i) {
  const d = hoy(), e = estadoCuota(p, i, d), v = valores(p)[i], pag = pagadoCuota(p, i), fp = fechaPagoCuota(p, i);
  const color = { pagada: 'var(--verde)', tarde: '#C2410C', vencida: 'var(--rojo)', abono: 'var(--verde)', hoy: 'var(--ambar)', futura: 'var(--gris)' }[e];
  const estado = {
    pagada: `<b class="verde">Pagada</b>${fp && !p.pagos.some(q => q.i === i && q.previo) ? ' el ' + fechaCorta(fp).toLowerCase() : ''}`,
    tarde: `<b style="color:#9A3412">Pagada tarde:</b> no pagó ese día, pagó el ${fechaCorta(fp).toLowerCase()}`,
    abono: `<b class="verde">Abonó ${money(pag)}</b> · falta ${money(v.valor - pag)}`,
    vencida: '<b class="rojo">No pagó</b>', hoy: '<b class="ambar">Le toca hoy</b>', futura: 'Próxima cuota',
  }[e];
  const btnFecha = (id, cls, icono, titulo, sub, valor) => `<label class="btn-accion ${cls}">${I(icono)}<span class="t"><b>${titulo}</b><span>${sub}</span></span><input type="date" id="${id}" value="${valor}" tabindex="-1"></label>`;
  abrirHoja(`<div class="card" style="margin-top:14px">
      <div style="display:flex;align-items:center;gap:12px"><span class="dia ${e}" style="width:52px;height:52px;font-size:22px;flex-shrink:0"><span>${fromISO(p.fechas[i]).getDate()}</span></span>
      <div><h2 style="font-size:19px;font-weight:800">Cuota ${i + 1} · ${fechaCorta(p.fechas[i]).toLowerCase()}</h2><span class="muted" style="font-size:14px">${money(v.valor)}</span></div></div>
      <div class="aviso" style="margin:12px 0 0;background:#F9FAFB;border-left:4px solid ${color}"><span>${estado}</span></div></div>
    <p class="b muted" style="margin:14px 20px 6px;font-size:13px">¿Qué quieres hacer?</p>
    <div class="form" style="margin:0 16px 20px;gap:10px">
      ${pag < v.valor ? `<div class="botones"><button class="btn verde" id="q-pagar">${I('check', 'i', 'style="stroke-width:3"')}Marcar pagada</button><button class="btn borde-verde" id="q-abono">Registrar abono</button></div>
        <div id="q-abono-box" class="card form oculto" style="margin:0"><label class="campo">¿Cuánto abonó?<input id="q-abono-v" class="plata" inputmode="numeric" placeholder="$0"></label><button class="btn verde bajo" id="q-abono-ok">Guardar abono</button></div>` : ''}
      ${pag > 0 ? btnFecha('q-fpago', 'gris', 'cal', 'Cambiar el día en que pagó', 'Ahora: ' + fechaCorta(fp).toLowerCase(), fp) : ''}
      ${btnFecha('q-fcobro', 'punteado', 'ir', 'Mover la fecha de cobro', 'El día en que le toca pagar esta cuota', p.fechas[i])}
      ${pag > 0 ? `<button class="btn-accion rojo" id="q-desmarcar">${I('deshacer')}<span class="t"><b>Desmarcar el pago</b><span>La cuota vuelve a quedar sin pagar</span></span></button>` : ''}
      <button class="btn gris bajo" data-acc="cerrar">Cerrar</button></div>`, {
    montar: h => {
      const listo = msg => { cerrarHoja(); toast(msg); refrescarTodo(); };
      h.querySelectorAll('label.btn-accion').forEach(l => l.addEventListener('click', ev => { const inp = l.querySelector('input'); ev.preventDefault(); try { inp.showPicker(); } catch (er) { inp.focus(); } }));
      const q = s => h.querySelector(s);
      if (q('#q-pagar')) q('#q-pagar').onclick = () => { pagarCuota(p, i); listo('Cuota ' + (i + 1) + ' marcada pagada'); };
      if (q('#q-abono')) q('#q-abono').onclick = () => { q('#q-abono-box').classList.remove('oculto'); q('#q-abono-v').focus(); };
      if (q('#q-abono-ok')) q('#q-abono-ok').onclick = () => {
        const m = Math.min(valorDe(h, '#q-abono-v'), v.valor - pag); if (!m) return;
        registrarPago(p, [i], m); listo('Abono de ' + money(m) + ' guardado');
      };
      if (q('#q-fpago')) q('#q-fpago').onchange = ev => { if (!ev.target.value) return; cambiarFechaPago(p, i, ev.target.value); listo('Pago de la cuota ' + (i + 1) + ': ' + fechaCorta(ev.target.value)); };
      q('#q-fcobro').onchange = ev => { if (!ev.target.value) return; p.fechas[i] = ev.target.value; guardar(); listo('Cuota ' + (i + 1) + ' ahora se cobra el ' + fechaCorta(ev.target.value).toLowerCase() + (esHabil(ev.target.value) ? '' : ' (no es día hábil)')); };
      if (q('#q-desmarcar')) q('#q-desmarcar').onclick = async () => {
        if (!await confirmar('¿Desmarcar el pago de la cuota ' + (i + 1) + '?', 'Se borra lo que pagó en esta cuota (' + money(pag) + ') y vuelve a quedar sin pagar.', 'Sí, desmarcar')) return;
        desmarcarCuota(p, i); listo('Cuota ' + (i + 1) + ' sin pagar');
      };
    }
  });
}
function refrescarTodo() {
  UI.hojas.forEach(h => { if (h.dataset.ficha) pintarFicha(h, h.dataset.ficha); });
  render();
}

/* ---------- editar cliente ---------- */
function camposCliente(c = {}) {
  return `<label class="campo">Nombre<input id="c-nombre" value="${esc(c.nombre || '')}" autocomplete="off" placeholder="Nombre del cliente"></label>
    <div class="grid2"><label class="campo">Celular<input id="c-cel" inputmode="tel" value="${esc(c.cel || '')}" placeholder="300 000 0000"></label>
    <label class="campo">Cédula<input id="c-ced" inputmode="numeric" value="${esc(c.cedula || '')}" placeholder="Opcional"></label></div>
    <label class="campo">Dirección o barrio<input id="c-dir" value="${esc(c.dir || '')}" placeholder="Barrio, casa, referencia"></label>
    <button type="button" class="btn gris bajo" id="c-gps">${I('pin')}<span id="c-gps-t">${c.lat != null ? 'Ubicación guardada ✓ · tocar para cambiar' : 'Marcar su casa en el mapa (estando allá)'}</span></button>
    <label class="campo">Notas (opcional)<input id="c-notas" value="${esc(c.notas || '')}" placeholder="Ej: cobrar en el negocio"></label>`;
}
function leerCliente(h, c) {
  c.nombre = h.querySelector('#c-nombre').value.trim();
  c.cel = h.querySelector('#c-cel').value.trim();
  c.cedula = h.querySelector('#c-ced').value.trim();
  c.dir = h.querySelector('#c-dir').value.trim();
  c.notas = h.querySelector('#c-notas').value.trim();
  return c;
}
function montarGPS(h, destino) {
  h.querySelector('#c-gps').onclick = async () => {
    const t = h.querySelector('#c-gps-t'); t.textContent = 'Buscando tu ubicación…';
    const r = await Nativo.ubicacion();
    if (r.ok) { destino.lat = r.lat; destino.lon = r.lon; destino.acc = r.acc; t.textContent = 'Ubicación guardada ✓ (±' + r.acc + ' m)'; }
    else t.textContent = errorGPS(r.error);
  };
}
function errorGPS(e) {
  return { permiso: 'Activa el permiso de ubicación para Tus Finanzas', gps_apagado: 'Prende la ubicación (GPS) del celular', sin_senal: 'No hay señal de GPS. Intenta al aire libre' }[e] || 'No se pudo obtener la ubicación';
}
function hojaEditarCliente(cid) {
  const c = cliente(cid), tmp = { lat: c.lat, lon: c.lon, acc: c.acc };
  abrirHoja(`<div class="top" style="align-items:center"><button class="atras" data-acc="cerrar" aria-label="Volver">${I('atras', 'i', 'style="width:26px;height:26px"')}</button><h1 style="flex:1;font-size:20px">Editar cliente</h1></div>
    <div class="card form">${camposCliente(c)}<p class="error" id="c-err"></p><button class="btn azul" id="c-ok">${I('check')}Guardar cambios</button></div>`, {
    completa: true, montar: h => {
      montarGPS(h, tmp);
      h.querySelector('#c-ok').onclick = () => {
        const n = h.querySelector('#c-nombre').value.trim();
        if (!n) { h.querySelector('#c-err').textContent = 'Escribe el nombre.'; return; }
        leerCliente(h, c); Object.assign(c, tmp); guardar(); cerrarHoja(); toast('Datos guardados'); refrescarTodo();
      };
    }
  });
}

/* ======================================================================
   NUEVO PRÉSTAMO
   ====================================================================== */
function hojaPrestamo(cid) {
  const existente = cid ? cliente(cid) : null;
  if (existente && prestamoActivo(cid)) { toast('Este cliente ya tiene un préstamo activo'); return; }
  const F = { frec: 'diario', primera: primeraSugerida('diario'), fechas: [], previo: false, gps: {}, modo: DB.config.modoCalculo || 'cuota' };
  const tasaIni = DB.config.tasaMensual;
  const html = `<div class="top" style="align-items:center"><button class="atras" data-acc="cerrar" aria-label="Volver">${I('atras', 'i', 'style="width:26px;height:26px"')}</button><h1 style="flex:1;font-size:20px">Nuevo préstamo</h1></div>
    <div class="card form"><div class="tit" style="margin:0"><span class="paso">1</span><h2>¿A quién le prestas?</h2></div>
      ${existente ? `<div class="fila"><b style="font-size:17px">${esc(existente.nombre)}</b><span class="muted">${esc(existente.dir || '')}</span></div>` : camposCliente()}</div>
    <div class="card form"><div class="tit" style="margin:0"><span class="paso">2</span><h2>¿Cuánto y cómo paga?</h2></div>
      <label class="campo">Le presto<input id="p-monto" class="plata tuyo" inputmode="numeric" placeholder="$0"></label>
      <span class="b" style="font-size:13px;color:#374151">Cada cuánto paga</span>
      <div class="chips" id="p-frec">${FRECUENCIAS.map(([k, t]) => `<button type="button" data-f="${k}" class="${k === F.frec ? 'on' : ''}">${t}</button>`).join('')}</div>
      <label class="campo">Número de cuotas<input id="p-cuotas" class="tuyo" type="number" inputmode="numeric" min="1" max="400" placeholder="Ej: 24"></label>
      <span class="b" style="font-size:13px;color:#374151">¿Cómo lo calculas?</span>
      <div class="segmento" id="p-modo"><button type="button" data-m="cuota" class="${F.modo === 'cuota' ? 'on' : ''}">Por valor de cuota</button><button type="button" data-m="pct" class="${F.modo === 'pct' ? 'on' : ''}">Por porcentaje</button></div>
      <label class="campo ${F.modo === 'cuota' ? '' : 'oculto'}" id="p-cuota-box">Valor de cada cuota<input id="p-valcuota" class="plata tuyo" inputmode="numeric" placeholder="$0" style="color:var(--verde)"></label>
      <label class="campo ${F.modo === 'pct' ? '' : 'oculto'}" id="p-pct-box">Interés mensual (%)<input id="p-tasa" class="tuyo" type="number" inputmode="decimal" min="0" max="100" step="0.5" value="${tasaIni}" style="color:var(--verde)"></label>
      <div class="total-box form" style="gap:10px">
        <span class="calculado">${I('check', 'i', 'style="width:16px;height:16px;stroke-width:3"')}CALCULADO SOLO</span>
        <div class="fila"><span id="p-otro-l">${F.modo === 'cuota' ? 'Interés mensual' : 'Valor de cada cuota'}</span><b id="p-otro">—</b></div>
        <div class="fila"><span>Gano</span><b id="p-int" class="verde">—</b></div>
        <div class="fila"><span>Me debe en total</span><b id="p-total">—</b></div>
      </div>
      <p class="muted peq" style="line-height:1.45">Los recuadros con borde negro los llenas tú. Lo verde lo calcula la app.</p>
      <label class="switch"><span><b style="font-size:14px">Ya venía del cuaderno</b><br><span class="muted peq">Es un préstamo que hiciste antes de usar la app</span></span><input type="checkbox" id="p-previo"></label>
      <label class="campo oculto" id="p-pagadas-box">¿Cuántas cuotas ya pagó?<input id="p-pagadas" type="number" inputmode="numeric" min="0" value="0"></label></div>
    <div class="card form"><div class="tit" style="margin:0"><span class="paso">3</span><h2>Fechas de pago</h2></div>
      <label class="campo" id="p-primera-l">Primera cuota<input id="p-primera" type="date" value="${F.primera}"></label>
      <p class="muted" style="line-height:1.4">Sin domingos ni festivos. Puedes cambiar cualquier fecha tocándola.</p>
      <div class="fechas-lista" id="p-fechas"><p class="muted">Escribe el número de cuotas para ver las fechas.</p></div></div>
    <div style="margin:14px 16px 24px" class="form"><p class="error" id="p-err"></p><button class="btn azul alto" id="p-ok">${I('mas', 'i', 'style="stroke-width:2.8"')}Crear préstamo</button></div>`;
  abrirHoja(html, {
    completa: true, montar: h => {
      if (!existente) montarGPS(h, F.gps);
      const q = s => h.querySelector(s);
      const n = () => Math.min(400, Math.max(0, parseInt(q('#p-cuotas').value, 10) || 0));
      const tasaCampo = () => Math.min(100, Math.max(0, parseFloat(String(q('#p-tasa').value).replace(',', '.')) || 0));
      /* Calcula lo que falta con lo que ya se llenó */
      const calc = () => {
        const monto = valorDe(h, '#p-monto'), k = n();
        if (!monto || !k) return null;
        const meses = mesesPrestamo(k, F.frec);
        if (F.modo === 'cuota') {
          const vc = valorDe(h, '#p-valcuota'); if (!vc) return null;
          const interes = vc * k - monto;
          return { monto, k, meses, cuota: vc, interes, total: vc * k, tasa: Math.round(interes / monto / meses * 1000) / 10 };
        }
        const tasa = tasaCampo(), it = interesAuto(monto, k, F.frec, tasa);
        return { monto, k, meses, cuota: Math.ceil((monto + it.interes) / k), interes: it.interes, total: monto + it.interes, tasa };
      };
      const totales = () => {
        const r = calc();
        if (!r) { ['#p-otro', '#p-int', '#p-total'].forEach(s => q(s).textContent = '—'); return; }
        q('#p-otro').innerHTML = F.modo === 'cuota' ? `${pct(r.tasa, r.tasa % 1 ? 1 : 0)} % <span class="muted peq" style="font-weight:500">(${mesesTexto(r.meses)})</span>` : money(r.cuota);
        q('#p-int').textContent = money(r.interes); q('#p-int').className = r.interes < 0 ? 'rojo' : 'verde';
        q('#p-total').textContent = money(r.total);
      };
      const recalc = (regen = true) => {
        if (regen) { F.fechas = n() ? generarFechas(q('#p-primera').value || F.primera, F.frec, n()) : []; pintarFechas(); }
        totales();
      };
      const pintarFechas = () => {
        const box = q('#p-fechas'), pag = F.previo ? (parseInt(q('#p-pagadas').value, 10) || 0) : 0;
        if (!F.fechas.length) { box.innerHTML = '<p class="muted">Escribe el número de cuotas para ver las fechas.</p>'; return; }
        box.innerHTML = F.fechas.map((f, i) => `<div class="fecha-fila" style="${i < pag ? 'background:var(--verde-bg)' : ''}"><span class="muted" style="width:26px">${i + 1}</span>
          <input type="date" value="${f}" data-i="${i}" aria-label="Fecha de la cuota ${i + 1}"><span class="peq ${i < pag ? 'verde b' : 'muted'}" style="width:66px;text-align:right">${i < pag ? 'Pagada' : DIAS_C[fromISO(f).getDay()]}</span>${I('lapiz', 'i', 'style="width:17px;height:17px;color:var(--suave);margin-right:8px"')}</div>`).join('')
          + `<p class="muted peq" style="padding:4px 2px">Última cuota: ${fechaLarga(F.fechas[F.fechas.length - 1])}</p>`;
        box.querySelectorAll('input[type=date]').forEach(inp => inp.addEventListener('change', () => {
          if (!inp.value) return; F.fechas[+inp.dataset.i] = inp.value; pintarFechas();
        }));
      };
      ['#p-monto', '#p-valcuota', '#p-tasa'].forEach(s => q(s).addEventListener('input', () => recalc(false)));
      q('#p-modo').addEventListener('click', e => {
        const b = e.target.closest('[data-m]'); if (!b || b.dataset.m === F.modo) return;
        const r = calc(); // lo calculado pasa al otro modo para no volver a escribir
        F.modo = b.dataset.m; q('#p-modo').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
        q('#p-cuota-box').classList.toggle('oculto', F.modo !== 'cuota'); q('#p-pct-box').classList.toggle('oculto', F.modo !== 'pct');
        q('#p-otro-l').textContent = F.modo === 'cuota' ? 'Interés mensual' : 'Valor de cada cuota';
        if (r && F.modo === 'cuota') q('#p-valcuota').value = plataAttr(Math.ceil(r.cuota / 100) * 100);
        if (r && F.modo === 'pct' && r.tasa >= 0) q('#p-tasa').value = r.tasa;
        totales();
      });
      q('#p-cuotas').addEventListener('input', () => recalc());
      q('#p-primera').addEventListener('change', () => { F.primeraManual = true; recalc(); });
      q('#p-pagadas').addEventListener('input', pintarFechas);
      q('#p-frec').addEventListener('click', e => {
        const b = e.target.closest('[data-f]'); if (!b) return;
        F.frec = b.dataset.f; q('#p-frec').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
        if (!F.primeraManual && !F.previo) q('#p-primera').value = primeraSugerida(F.frec);
        recalc();
      });
      q('#p-previo').addEventListener('change', e => {
        F.previo = e.target.checked; q('#p-pagadas-box').classList.toggle('oculto', !F.previo);
        q('#p-primera-l').firstChild.textContent = F.previo ? 'Fecha de la primera cuota (aunque ya haya pasado)' : 'Primera cuota';
        pintarFechas();
      });
      q('#p-ok').onclick = async () => {
        const err = m => { q('#p-err').textContent = m; q('#p-err').scrollIntoView({ block: 'center' }); };
        const k = n(), r = calc();
        const pag = F.previo ? Math.max(0, parseInt(q('#p-pagadas').value, 10) || 0) : 0;
        if (!existente && !q('#c-nombre').value.trim()) return err('Escribe el nombre del cliente.');
        if (!valorDe(h, '#p-monto')) return err('Escribe cuánto le vas a prestar.');
        if (!k) return err('Escribe en cuántas cuotas va a pagar.');
        if (!r) return err(F.modo === 'cuota' ? 'Escribe el valor de cada cuota.' : 'Escribe el porcentaje.');
        if (r.interes < 0) return err('Con esas cuotas no alcanza a devolver lo que le prestas. Sube el valor de la cuota.');
        if (F.fechas.length !== k) return err('Revisa las fechas de pago.');
        if (pag >= k) return err('Las cuotas pagadas deben ser menos que el total.');
        if (!F.previo && r.monto > plataEnMano()) {
          const ok = await confirmar('No te alcanza la plata en mano', `Tienes ${money(plataEnMano())} en mano y vas a prestar ${money(r.monto)}. ¿Igual lo creas?`, 'Sí, crear préstamo', 'azul');
          if (!ok) return;
        }
        let c = existente;
        if (!c) { c = leerCliente(h, { id: uid(), creado: hoy() }); Object.assign(c, F.gps); DB.clientes.push(c); }
        const p = { id: uid(), clienteId: c.id, monto: r.monto, interes: r.interes, cuotas: k, frecuencia: F.frec, moraPct: 0, fechas: F.fechas.slice().sort(), creado: hoy(), previo: F.previo, pagos: [], modo: F.modo, tasa: r.tasa, meses: r.meses };
        const v = valores(p);
        for (let i = 0; i < pag; i++) p.pagos.push({ i, fecha: p.fechas[i] < hoy() ? p.fechas[i] : hoy(), valor: v[i].valor, previo: true, g: 'previo', ts: 0 });
        DB.config.modoCalculo = F.modo;
        DB.prestamos.push(p); guardar();
        cerrarTodas(); toast('Préstamo creado para ' + c.nombre.split(' ')[0]);
        UI.tab = 'clientes'; render(); hojaFicha(c.id);
      };
    }
  });
}

/* ======================================================================
   COBRAR
   ====================================================================== */
function hojaCobro(cid) {
  const c = cliente(cid), p = prestamoActivo(cid);
  if (!p) { toast('Este cliente no tiene cuotas pendientes'); return; }
  const d = hoy(), pend = cuotasPendientes(p);
  let n = Math.min(pend.length, Math.max(1, cuotasPendientesHasta(p, d).length));
  let sel = new Set(pend.slice(0, n)), verTodas = false;
  const h = abrirHoja('');
  const total = () => [...sel].reduce((s, i) => s + faltaCuota(p, i), 0);
  const pintar = () => {
    const mostrar = verTodas ? pend : pend.slice(0, Math.max(6, Math.max(...sel, pend[0]) - pend[0] + 3));
    const filas = mostrar.map(i => {
      const e = estadoCuota(p, i, d), pag = pagadoCuota(p, i);
      const sub = { vencida: '<span class="rojo b">No pagó ese día → quedará naranja</span>', abono: 'Abonó ' + money(pag) + ' · falta el resto', hoy: '<span class="ambar b">Hoy</span>', futura: 'Adelantada' }[e] || '';
      return `<label class="pago-fila"><input type="checkbox" data-i="${i}" ${sel.has(i) ? 'checked' : ''}><i class="barrita ${e}"></i>
        <span class="c1"><b>${fechaCorta(p.fechas[i])} · cuota ${i + 1}</b><span>${sub}</span></span><b class="${sel.has(i) ? '' : 'muted'}">${money(faltaCuota(p, i))}</b></label>`;
    }).join('');
    refrescarHoja(h, `<div style="padding:4px 16px 20px" class="form">
      <div style="text-align:center"><p class="muted">Registrar pago de</p><h2 style="font-size:21px;font-weight:800">${esc(c.nombre)}</h2></div>
      <div class="card fila" style="margin:0"><b style="font-size:15px">¿Cuántas cuotas te pagó?</b>
        <div style="display:flex;align-items:center;gap:10px"><button type="button" class="paso-btn" id="k-menos" aria-label="Una cuota menos">−</button><b style="font-size:26px;min-width:26px;text-align:center" id="k-n">${sel.size}</b><button type="button" class="paso-btn on" id="k-mas" aria-label="Una cuota más">+</button></div></div>
      <div class="card" style="margin:0;padding:6px 12px"><p class="muted peq" style="padding:8px 0 4px">Se marcan en orden. Si es un caso especial, toca las que quieras.</p>${filas}
        ${!verTodas && mostrar.length < pend.length ? `<button type="button" class="btn borde bajo" style="margin:8px 0" id="k-mas-filas">Ver más cuotas (${pend.length - mostrar.length})</button>` : ''}</div>
      <div class="card form" style="margin:0;gap:8px"><label class="campo">¿Cuánto recibiste?<input id="k-monto" class="plata" inputmode="numeric" value="${plataAttr(total())}" style="height:56px;font-size:24px;border:2px solid var(--verde);color:var(--verde)"></label>
        <span class="muted peq" id="k-nota">Se llena solo con lo marcado. Si te dio menos, escribe lo que recibiste: lo que falte queda como <b>abono</b>.</span>
        <label class="campo">Fecha del pago<input id="k-fecha" type="date" value="${d}"></label></div>
      <p class="error" id="k-err"></p>
      <button class="btn verde alto" id="k-ok">${I('check', 'i', 'style="stroke-width:3"')}<span id="k-ok-t">Confirmar pago · ${money(total())}</span></button>
      <button class="btn gris bajo" data-acc="cerrar">Cancelar</button></div>`);
    const q = s => h.querySelector(s);
    const nota = () => {
      const m = valorDe(h, '#k-monto'), t = total();
      q('#k-ok-t').textContent = 'Confirmar pago · ' + money(m);
      q('#k-nota').innerHTML = m < t ? `Queda como <b>abono</b>: faltarán ${money(t - m)} de lo marcado.` : m > t ? `Sobran ${money(m - t)}: se abonan a las siguientes cuotas.` : 'Se llena solo con lo marcado. Si te dio menos, escribe lo que recibiste: lo que falte queda como <b>abono</b>.';
    };
    q('#k-monto').addEventListener('input', nota);
    const cambiarN = k => { n = Math.max(1, Math.min(pend.length, k)); sel = new Set(pend.slice(0, n)); pintar(); };
    q('#k-menos').onclick = () => cambiarN(sel.size - 1);
    q('#k-mas').onclick = () => cambiarN(sel.size + 1);
    if (q('#k-mas-filas')) q('#k-mas-filas').onclick = () => { verTodas = true; pintar(); };
    h.querySelectorAll('input[data-i]').forEach(ch => ch.addEventListener('change', () => {
      const i = +ch.dataset.i; ch.checked ? sel.add(i) : sel.delete(i); pintar();
    }));
    q('#k-ok').onclick = () => {
      const m = valorDe(h, '#k-monto');
      if (!m) { q('#k-err').textContent = 'Escribe cuánto recibiste.'; return; }
      if (!sel.size) { q('#k-err').textContent = 'Marca al menos una cuota.'; return; }
      const res = registrarPago(p, [...sel], m, q('#k-fecha').value || d);
      cerrarHoja(); refrescarTodo(); hojaCobrado(c, p, res);
    };
  };
  pintar();
}
function hojaCobrado(c, p, res) {
  const completas = res.regs.filter(r => pagada(p, r.i)).length, abono = res.regs.find(r => !pagada(p, r.i));
  const quedan = cuotasPendientesHasta(p, hoy()).length, termino = prestamoPagado(p);
  abrirHoja(`<div class="card" style="margin-top:14px;text-align:center">
    <div style="width:64px;height:64px;border-radius:32px;background:var(--verde);display:flex;align-items:center;justify-content:center;margin:0 auto 10px">${I('check', 'i', 'style="width:34px;height:34px;color:#fff;stroke-width:3"')}</div>
    <h2 style="font-size:20px;font-weight:800">Pago guardado</h2>
    <div class="cobro-grande verde">${money(res.total)}</div>
    <p class="muted">${completas ? completas + (completas === 1 ? ' cuota pagada' : ' cuotas pagadas') : ''}${completas && abono ? ' + ' : ''}${abono ? 'abono a la cuota ' + (abono.i + 1) : ''}</p>
    <p class="muted" style="margin-top:4px">${termino ? '<b class="verde">¡' + esc(c.nombre.split(' ')[0]) + ' terminó de pagar!</b>' : 'Le falta ' + money(saldo(p))}</p>
    ${quedan ? `<p class="rojo b" style="margin-top:6px">Todavía debe ${quedan} ${quedan === 1 ? 'cuota' : 'cuotas'} hasta hoy</p>` : ''}
    <div class="form" style="margin-top:16px">
      <button class="btn morado" data-acc="recibo" data-id="${c.id}">${I('recibo')}Enviar recibo por WhatsApp</button>
      <button class="btn gris bajo" data-acc="cerrar">Listo</button></div></div>`);
}

/* ======================================================================
   GASTOS E INGRESOS
   ====================================================================== */
function vistaGastos() {
  const d = hoy(), a = monthStart(d), r = resumenPeriodo(a, monthEnd(d));
  let h = `<div class="top"><div><h1>Gastos e ingresos</h1><p class="sub">${cap(MESES[fromISO(d).getMonth()])}: gastos <b class="rojo">${money(r.gastos)}</b> · ingresos <b class="verde">${money(r.ingresos)}</b></p></div></div>
    <div class="grid2" style="margin:0 16px">
      <button class="btn rojo" style="height:88px;flex-direction:column;border-radius:18px" data-acc="mov" data-id="gasto">${I('menos', 'i', 'style="width:28px;height:28px;stroke-width:3"')}Gasto</button>
      <button class="btn verde" style="height:88px;flex-direction:column;border-radius:18px" data-acc="mov" data-id="ingreso">${I('mas', 'i', 'style="width:28px;height:28px;stroke-width:3"')}Ingreso</button></div>
    <div class="card"><div class="fila" style="margin-bottom:10px"><h2>Gastos fijos del mes</h2><button class="btn azul bajo" style="width:auto;height:38px;border-radius:19px" data-acc="fijo">${I('mas', 'i', 'style="width:16px;height:16px;stroke-width:3"')}Nuevo</button></div>`;
  if (!DB.fijos.length) h += '<p class="muted">Agrega tu arriendo, servicios, plan del celular… La app los tiene en cuenta en el consejo del mes.</p>';
  for (const f of DB.fijos.slice().sort((x, y) => x.dia - y.dia)) {
    const ok = fijoPagado(f, d);
    h += `<div class="fila" style="padding:10px;border-radius:12px;margin-top:6px;background:${ok ? 'var(--verde-bg)' : 'var(--rojo-bg)'}">
      <button style="border:0;background:none;padding:0;text-align:left;flex:1;min-width:0" data-acc="fijo" data-id="${f.id}"><b style="font-size:14px">${esc(f.nombre)}</b><br><span class="muted peq">${esc(f.cat)} · día ${f.dia} · ${ok ? 'pagado' : 'falta'}</span></button>
      <b class="${ok ? '' : 'rojo'}" style="font-size:15px">${money(f.valor)}</b>
      ${ok ? `<span class="verde b peq" style="width:64px;text-align:right">${I('check', 'i', 'style="width:18px;height:18px;stroke-width:3"')}</span>` : `<button class="btn rojo bajo" style="width:64px;height:38px;padding:0" data-acc="pagarFijo" data-id="${f.id}">Pagar</button>`}</div>`;
  }
  const F = fijosPendientes(d);
  if (DB.fijos.length) h += `<div class="fila" style="padding:8px 2px 0;font-size:13px"><span class="muted">Faltan por pagar</span><b class="${F ? 'rojo' : 'verde'}">${money(F)}</b></div>`;
  h += '</div>';
  h += `<div class="card"><h2 style="margin-bottom:6px">Movimientos de ${MESES[fromISO(d).getMonth()]}</h2>`;
  if (!r.movs.length) h += '<p class="muted">Aún no hay gastos ni ingresos este mes.</p>';
  for (const m of r.movs) {
    const g = m.tipo === 'gasto';
    h += `<button class="item" data-acc="verMov" data-id="${m.id}"><span class="num" style="background:${g ? 'var(--rojo-bg)' : 'var(--verde-bg)'};color:${g ? 'var(--rojo-t)' : 'var(--verde)'};border-radius:10px">${I(g ? 'menos' : 'mas', 'i', 'style="width:16px;height:16px;stroke-width:3"')}</span>
      <span class="cuerpo"><b>${esc(m.nota || m.cat)}</b><span>${esc(m.cat)} · ${fechaCorta(m.fecha)}</span></span><span class="der ${g ? 'rojo' : 'verde'}">${g ? '−' : '+'}${money(m.valor)}</span></button>`;
  }
  h += '</div>';
  $('#vista').innerHTML = h;
}
function hojaMov(tipo, mov) {
  const g = tipo === 'gasto';
  let cat = mov ? mov.cat : null;
  const pintar = h => {
    const cats = DB.cats[tipo];
    h.querySelector('#m-cats').innerHTML = cats.map(c => `<button type="button" data-c="${esc(c)}" class="${c === cat ? 'on' : ''}">${esc(c)}</button>`).join('') + '<button type="button" class="nueva" data-nueva>+ Mi categoría</button>';
  };
  abrirHoja(`<div class="card" style="margin-top:14px"><h2 style="font-size:20px;font-weight:800;margin-bottom:12px" class="${g ? 'rojo' : 'verde'}">${mov ? 'Editar' : 'Nuevo'} ${g ? 'gasto' : 'ingreso'}</h2>
    <div class="form"><label class="campo">Valor<input id="m-valor" class="plata" inputmode="numeric" placeholder="$0" value="${mov ? plataAttr(mov.valor) : ''}"></label>
    <span class="b" style="font-size:13px;color:#374151">Categoría</span><div class="chips libre" id="m-cats"></div>
    <label class="campo">Nota (opcional)<input id="m-nota" value="${esc(mov ? mov.nota || '' : '')}" placeholder="${g ? 'Ej: almuerzo' : 'Ej: venta de un celular'}"></label>
    <label class="campo">Fecha<input id="m-fecha" type="date" value="${mov ? mov.fecha : hoy()}"></label>
    <p class="error" id="m-err"></p>
    <button class="btn ${g ? 'rojo' : 'verde'}" id="m-ok">${I(g ? 'menos' : 'mas', 'i', 'style="stroke-width:3"')}Guardar ${g ? 'gasto' : 'ingreso'}</button>
    ${mov ? '<button class="btn borde-rojo bajo" id="m-borrar">' + I('basura') + 'Eliminar</button>' : ''}
    <button class="btn gris bajo" data-acc="cerrar">Cancelar</button></div></div>`, {
    montar: h => {
      pintar(h);
      if (!mov) setTimeout(() => h.querySelector('#m-valor').focus(), 150);
      h.querySelector('#m-cats').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-nueva')) {
          const box = h.querySelector('#m-cats');
          box.insertAdjacentHTML('beforeend', '<div style="display:flex;gap:6px;width:100%"><input id="m-nueva" placeholder="Nombre de la categoría" style="flex:1;height:44px;border:1px solid var(--borde);border-radius:12px;padding:0 10px;min-width:0"><button type="button" class="on" id="m-nueva-ok" style="background:var(--azul);border-color:var(--azul);color:#fff">Crear</button></div>');
          b.remove(); h.querySelector('#m-nueva').focus();
          h.querySelector('#m-nueva-ok').onclick = ev => {
            ev.stopPropagation();
            const n = h.querySelector('#m-nueva').value.trim(); if (!n) return;
            if (!DB.cats[tipo].includes(n)) { DB.cats[tipo].push(n); guardar(); }
            cat = n; pintar(h);
          };
          return;
        }
        if (b.dataset.c) { cat = b.dataset.c; pintar(h); }
      });
      h.querySelector('#m-ok').onclick = () => {
        const valor = valorDe(h, '#m-valor');
        if (!valor) { h.querySelector('#m-err').textContent = 'Escribe el valor.'; return; }
        if (!cat) { h.querySelector('#m-err').textContent = 'Elige una categoría.'; return; }
        const datos = { tipo, valor, cat, nota: h.querySelector('#m-nota').value.trim(), fecha: h.querySelector('#m-fecha').value || hoy() };
        if (mov) Object.assign(mov, datos); else DB.movs.push(Object.assign({ id: uid() }, datos));
        guardar(); cerrarHoja(); toast(g ? 'Gasto guardado' : 'Ingreso guardado'); render();
      };
      const br = h.querySelector('#m-borrar');
      if (br) br.onclick = async () => {
        if (!await confirmar('¿Eliminar este movimiento?', esc((mov.nota || mov.cat) + ' · ' + money(mov.valor)), 'Sí, eliminar')) return;
        DB.movs.splice(DB.movs.indexOf(mov), 1); guardar(); cerrarHoja(); toast('Eliminado'); render();
      };
    }
  });
}
function hojaFijo(fid) {
  const f = fid ? DB.fijos.find(x => x.id === fid) : null;
  let cat = f ? f.cat : 'Hogar';
  const cats = () => DB.cats.gasto.map(c => `<button type="button" data-c="${esc(c)}" class="${c === cat ? 'on' : ''}">${esc(c)}</button>`).join('');
  abrirHoja(`<div class="card" style="margin-top:14px"><h2 style="font-size:20px;font-weight:800;margin-bottom:12px">${f ? 'Editar' : 'Nuevo'} gasto fijo</h2>
    <div class="form"><label class="campo">Nombre<input id="f-nombre" value="${esc(f ? f.nombre : '')}" placeholder="Ej: Arriendo"></label>
    <div class="grid2"><label class="campo">Valor al mes<input id="f-valor" class="plata" inputmode="numeric" value="${f ? plataAttr(f.valor) : ''}" placeholder="$0"></label>
    <label class="campo">Día de pago<input id="f-dia" type="number" min="1" max="31" inputmode="numeric" value="${f ? f.dia : 5}"></label></div>
    <span class="b" style="font-size:13px;color:#374151">Categoría</span><div class="chips libre" id="f-cats">${cats()}</div>
    <p class="error" id="f-err"></p>
    <button class="btn azul" id="f-ok">${I('check')}${f ? 'Guardar cambios' : 'Crear gasto fijo'}</button>
    ${f ? '<button class="btn borde-rojo bajo" id="f-borrar">' + I('basura') + 'Eliminar gasto fijo</button>' : ''}
    <button class="btn gris bajo" data-acc="cerrar">Cancelar</button></div></div>`, {
    montar: h => {
      h.querySelector('#f-cats').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; h.querySelector('#f-cats').innerHTML = cats(); });
      h.querySelector('#f-ok').onclick = () => {
        const nombre = h.querySelector('#f-nombre').value.trim(), valor = valorDe(h, '#f-valor'), dia = Math.min(31, Math.max(1, parseInt(h.querySelector('#f-dia').value, 10) || 1));
        if (!nombre || !valor) { h.querySelector('#f-err').textContent = 'Escribe el nombre y el valor.'; return; }
        if (f) Object.assign(f, { nombre, valor, dia, cat }); else DB.fijos.push({ id: uid(), nombre, valor, dia, cat });
        guardar(); cerrarHoja(); render();
      };
      const br = h.querySelector('#f-borrar');
      if (br) br.onclick = async () => {
        if (!await confirmar('¿Eliminar ' + f.nombre + '?', 'Los pagos que ya registraste se quedan en tus movimientos.', 'Sí, eliminar')) return;
        DB.fijos.splice(DB.fijos.indexOf(f), 1); guardar(); cerrarHoja(); render();
      };
    }
  });
}

/* ======================================================================
   REPORTES
   ====================================================================== */
function rangoReporte() {
  const { tipo, off } = UI.rep, d = hoy();
  if (tipo === 'dia') { const x = addDays(d, off); return { a: x, b: x, titulo: fechaLarga(x), corto: 'del ' + fechaSimple(x) }; }
  if (tipo === 'semana') { const a = addDays(weekStart(d), 7 * off), b = addDays(a, 6); return { a, b, titulo: 'Semana ' + fechaSimple(a) + ' – ' + fechaSimple(b), corto: 'semana ' + fechaSimple(a) }; }
  if (tipo === 'mes') { const a = addMonths(monthStart(d), off), b = monthEnd(a); return { a, b, titulo: cap(MESES[fromISO(a).getMonth()]) + ' ' + a.slice(0, 4), corto: MESES[fromISO(a).getMonth()] + ' ' + a.slice(0, 4) }; }
  const y = +d.slice(0, 4) + off; return { a: y + '-01-01', b: y + '-12-31', titulo: 'Año ' + y, corto: 'año ' + y };
}
function vistaReportes() {
  const R = rangoReporte(), r = resumenPeriodo(R.a, R.b), d = hoy();
  const T = [['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes'], ['anio', 'Año']];
  let h = `<div class="top"><div><h1>Reportes</h1><p class="sub">${R.b >= d && R.a <= d ? 'Hasta hoy' : 'Periodo cerrado'}</p></div></div>
    <div class="tabs">${T.map(([k, t]) => `<button data-acc="repTipo" data-id="${k}" class="${UI.rep.tipo === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="periodo"><button class="icono-btn" data-acc="repMov" data-id="-1" aria-label="Anterior">${I('atras')}</button><b>${R.titulo}</b>
      <button class="icono-btn" data-acc="repMov" data-id="1" aria-label="Siguiente" ${UI.rep.off >= 0 ? 'disabled style="opacity:.3"' : ''}>${I('sig')}</button></div>
    <div class="card capital"><span style="font-size:13px;color:#D1D5DB">Resultado</span><div class="grande" style="color:${r.resultado >= 0 ? 'var(--verde-claro)' : '#FCA5A5'}">${money(r.resultado, true)}</div>
      <span style="font-size:12px;color:#D1D5DB">Intereses + otros ingresos − gastos</span></div>
    <div class="grid2" style="margin:12px 16px 0">
      <div class="stat v"><span>Intereses cobrados</span><b class="verde">${money(r.ganancia)}</b></div>
      <div class="stat v"><span>Otros ingresos</span><b class="verde">${money(r.ingresos)}</b></div>
      <div class="stat r"><span>Gastos</span><b class="rojo">${money(r.gastos)}</b></div>
      <div class="stat a"><span>Prestado nuevo</span><b class="azul">${money(r.prestado)}</b></div>
      <div class="stat g"><span>Total cobrado (${r.nCobros})</span><b>${money(r.cobrado)}</b></div>
      <div class="stat g"><span>Capital recuperado</span><b>${money(r.capital)}</b></div></div>`;
  // gráfica de intereses
  let cols = [];
  if (UI.rep.tipo === 'semana') for (let k = 0; k < 7; k++) { const x = addDays(R.a, k); cols.push({ t: DIAS_C[fromISO(x).getDay()], v: resumenPeriodo(x, x).ganancia, act: x === d }); }
  if (UI.rep.tipo === 'mes') for (let k = 5; k >= 0; k--) { const a = addMonths(R.a, -k); cols.push({ t: cap(MESES_C[fromISO(a).getMonth()]), v: resumenPeriodo(a, monthEnd(a)).ganancia, act: a === monthStart(d) }); }
  if (UI.rep.tipo === 'anio') for (let k = 0; k < 12; k++) { const a = R.a.slice(0, 4) + '-' + pad2(k + 1) + '-01'; cols.push({ t: cap(MESES_C[k]).charAt(0), v: resumenPeriodo(a, monthEnd(a)).ganancia, act: a === monthStart(d) }); }
  if (cols.length) {
    const mx = Math.max(1, ...cols.map(c => c.v));
    h += `<div class="card"><h2 style="margin-bottom:12px">Intereses ${UI.rep.tipo === 'semana' ? 'por día' : UI.rep.tipo === 'mes' ? 'de los últimos 6 meses' : 'por mes'}</h2>
      <div class="grafica">${cols.map(c => `<div class="col ${c.act ? 'actual' : ''}"><small>${c.v ? moneyShort(c.v) : ''}</small><i style="height:${Math.round(c.v / mx * 115)}px"></i></div>`).join('')}</div>
      <div class="ejes">${cols.map(c => `<span style="${c.act ? 'font-weight:800;color:var(--texto)' : ''}">${c.t}</span>`).join('')}</div></div>`;
  }
  const activos = DB.clientes.filter(c => prestamoActivo(c.id)).length, atr = DB.clientes.filter(c => estadoCliente(c).tipo === 'atrasado').length;
  h += `<div class="card grid3"><div><b style="font-size:21px">${activos}</b><br><span class="muted peq">clientes activos</span></div>
    <div><b style="font-size:21px" class="verde">${r.terminados}</b><br><span class="muted peq">terminaron de pagar</span></div>
    <div><b style="font-size:21px" class="rojo">${atr}</b><br><span class="muted peq">atrasados hoy</span></div></div>`;
  if (UI.rep.tipo === 'dia' || UI.rep.tipo === 'semana') {
    h += `<div class="card"><h2 style="margin-bottom:4px">Cobros (${r.nCobros})</h2>${r.cobros.length ? '' : '<p class="muted">No hubo cobros.</p>'}`;
    for (const o of r.cobros.slice().reverse()) { const c = cliente(o.p.clienteId); h += `<div class="item"><span class="num verde">${I('check', 'i', 'style="width:15px;height:15px;stroke-width:3.4"')}</span><span class="cuerpo"><b>${esc(c ? c.nombre : '—')}</b><span>Cuota ${o.x.i + 1}/${o.p.cuotas} · ${fechaCorta(o.fecha)}${o.x.valor < valores(o.p)[o.x.i].valor ? ' · abono' : ''}</span></span><span class="der verde">${money(o.x.valor + (o.x.mora || 0))}</span></div>`; }
    h += '</div>';
  }
  h += `<div style="margin:12px 16px 0"><button class="btn morado" data-acc="pdf">${I('pdf')}Descargar reporte en PDF</button></div>`;
  $('#vista').innerHTML = h;
}

/* ======================================================================
   AJUSTES
   ====================================================================== */
const tamano = b => b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
function hojaAjustes() {
  const h = abrirHoja('', { completa: true });
  pintarAjustes(h);
}
function pintarAjustes(h) {
  const c = DB.config, m = cargarMapa();
  const radio = (k, t, s) => `<label class="radio ${c.mapa === k ? 'on' : ''}"><input type="radio" name="mapa" value="${k}" ${c.mapa === k ? 'checked' : ''}><span><b style="font-size:15px">${t}</b><br><span class="muted peq">${s}</span></span></label>`;
  refrescarHoja(h, `<div class="top" style="align-items:center"><button class="atras" data-acc="cerrar" aria-label="Volver">${I('atras', 'i', 'style="width:26px;height:26px"')}</button><h1 style="flex:1;font-size:21px">Ajustes</h1></div>
    <div class="card form" style="gap:10px"><div class="tit" style="margin:0">${I('pin', 'i', 'style="width:20px;height:20px"')}<h2>Mapa de la ruta</h2></div>
      <p class="muted">Puedes cambiar esto cuando quieras. Tus clientes y cobros no se pierden.</p>
      ${radio('offline', 'Mostrar mapa (sin internet)', m ? (mapaIncluido() ? 'Calles de Quibdó incluidas en la app' : 'Calles actualizadas el ' + fechaSimple(m.fecha)) + ' · la ruta se marca por las calles' : 'Mapa básico (solo puntos)')}
      ${radio('off', 'Apagado', 'La ruta se ve solo como lista')}
      <p class="muted peq">El botón <b>Google Maps</b> de cada cliente siempre está: abre la guía calle por calle cuando tengas datos.</p>
      <button class="btn gris bajo" data-acc="bajarMapa">${I('nube')}Actualizar calles de Quibdó (con wifi)</button>
      <p class="muted peq" id="mapa-estado">Solo hace falta si abren calles nuevas. Datos © colaboradores de OpenStreetMap.</p></div>
    <div class="card form" style="gap:10px"><div class="tit" style="margin:0">${I('casa', 'i', 'style="width:20px;height:20px"')}<h2>Punto de salida</h2></div>
      <p class="muted">Desde dónde arranca la ruta cada mañana (tu casa).</p>
      <button class="btn gris bajo" data-acc="salida">${I('pin')}${c.salida ? 'Guardada ✓ · cambiar a donde estoy' : 'Estoy en mi casa: guardar'}</button></div>
    <div class="card form" style="gap:10px"><div class="tit" style="margin:0">${I('reloj', 'i', 'style="width:20px;height:20px"')}<h2>Aviso diario</h2></div>
      <label class="switch"><span><b style="font-size:14px">Avisarme los cobros del día</b><br><span class="muted peq">"Hoy tienes 7 cobros · 2 atrasados"</span></span><input type="checkbox" id="a-avisos" ${c.avisos ? 'checked' : ''}></label>
      <label class="campo">Hora del aviso<input type="time" id="a-hora" value="${c.horaAviso || '07:00'}"></label></div>
    <div class="card form" style="gap:10px"><div class="tit" style="margin:0">${I('sube', 'i', 'style="width:20px;height:20px"')}<h2>Interés de los préstamos</h2></div>
      <label class="campo">Interés mensual (%)<input type="number" id="a-tasa" min="0" max="100" step="0.5" inputmode="decimal" value="${c.tasaMensual}"></label>
      <p class="muted" id="a-tasa-ej">Ejemplo: ${money(1000000)} a 1 mes = ${money(Math.round(1000000 * c.tasaMensual / 100))} de interés. Solo cambia los préstamos nuevos; los que ya tienes siguen igual.</p></div>
    <div class="card form" style="gap:10px"><div class="tit" style="margin:0">${I('idea', 'i', 'style="width:20px;height:20px"')}<h2>Consejo del mes</h2></div>
      <label class="campo">De los intereses, ¿qué porcentaje vuelves a prestar?<input type="number" id="a-reinv" min="0" max="100" inputmode="numeric" value="${c.reinvertir}"></label>
      <label class="campo">Tu nombre<input id="a-nombre" value="${esc(c.nombre)}"></label>
      <div class="fila"><span class="muted">Plata en mano según la app</span><b>${money(plataEnMano())}</b></div>
      <button class="btn gris bajo" data-acc="corregirMano">${I('lapiz')}Corregir plata en mano</button></div>
    <div class="card form" style="gap:10px"><div class="tit" style="margin:0">${I('candado', 'i', 'style="width:20px;height:20px"')}<h2>Clave de la app</h2></div>
      <p class="muted">${c.pin ? 'La app pide tu clave de 4 números al abrirla y si la dejas más de 1 minuto.' : 'Pon una clave de 4 números para que nadie más vea tus cuentas.'}</p>
      ${c.pin ? `<div class="botones"><button class="btn gris bajo" data-acc="pin" data-id="cambiar">${I('lapiz')}Cambiar clave</button><button class="btn borde-rojo bajo" data-acc="pin" data-id="quitar">Quitar clave</button></div>`
        : `<button class="btn azul" data-acc="pin" data-id="nueva">${I('candado')}Poner clave de 4 números</button>`}</div>
    <div class="card form" style="gap:10px"><div class="tit" style="margin:0">${I('nube', 'i', 'style="width:20px;height:20px"')}<h2>Copia de seguridad</h2></div>
      <p class="muted">${c.ultimaCopia ? 'Última copia: ' + fechaLarga(c.ultimaCopia) : 'Aún no has hecho ninguna copia'}. Guárdala en Google Drive: si pierdes o cambias el celular, la restauras y no pierdes nada.</p>
      <button class="btn morado" data-acc="copia">${I('nube')}Hacer copia ahora</button>
      <button class="btn gris bajo" data-acc="restaurar">Restaurar una copia</button></div>
    <div class="card form" style="gap:10px"><div class="tit" style="margin:0">${I('nube', 'i', 'style="width:20px;height:20px;transform:rotate(180deg)"')}<h2>Actualizar la app</h2></div>
      <p class="muted">Tienes la versión <b>${esc(Nativo.version() || window.APP_VERSION)}</b>. ${UI.nueva ? '<b class="azul">Hay una versión nueva: ' + esc(UI.nueva.version) + '</b>' : 'Busca si hay una versión nueva (necesita internet).'}</p>
      <p class="muted peq" id="act-estado"></p>
      ${UI.nueva ? `<button class="btn azul" data-acc="actualizar">${I('nube', 'i', 'style="transform:rotate(180deg)"')}Actualizar a la ${esc(UI.nueva.version)}</button>` : `<button class="btn gris bajo" data-acc="buscarAct">${I('nube', 'i', 'style="transform:rotate(180deg)"')}Buscar actualización</button>`}</div>
    <p class="muted peq" style="text-align:center;margin:18px 0 28px">Tus Finanzas ${esc(Nativo.version() || window.APP_VERSION)} · Funciona sin internet<br>Tus datos están solo en este celular.</p>`);
  h.querySelectorAll('input[name=mapa]').forEach(r => r.addEventListener('change', () => { c.mapa = r.value; guardar(); pintarAjustes(h); render(); }));
  h.querySelector('#a-avisos').addEventListener('change', e => { c.avisos = e.target.checked; guardar(); if (c.avisos) Nativo.pedirAvisos(); });
  h.querySelector('#a-hora').addEventListener('change', e => { c.horaAviso = e.target.value || '07:00'; guardar(); toast('Aviso a las ' + horaTexto(c.horaAviso)); });
  h.querySelector('#a-tasa').addEventListener('change', e => {
    const t = Math.min(100, Math.max(0, parseFloat(String(e.target.value).replace(',', '.')) || 0));
    c.tasaMensual = Math.round(t * 10) / 10; e.target.value = c.tasaMensual; guardar();
    h.querySelector('#a-tasa-ej').textContent = 'Ejemplo: ' + money(1000000) + ' a 1 mes = ' + money(Math.round(1000000 * c.tasaMensual / 100)) + ' de interés. Solo cambia los préstamos nuevos; los que ya tienes siguen igual.';
    toast('Interés de los préstamos nuevos: ' + pct(c.tasaMensual, c.tasaMensual % 1 ? 1 : 0) + ' % mensual');
  });
  h.querySelector('#a-reinv').addEventListener('change', e => { c.reinvertir = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)); guardar(); });
  h.querySelector('#a-nombre').addEventListener('change', e => { c.nombre = e.target.value.trim(); guardar(); });
}
function hojaCorregirMano() {
  abrirHoja(`<div class="card" style="margin-top:14px"><h2 style="font-size:19px;font-weight:800">Corregir plata en mano</h2>
    <p class="muted" style="margin:6px 0 12px">Según la app tienes ${money(plataEnMano())}. Cuenta tu plata y escribe cuánto tienes de verdad.</p>
    <div class="form"><label class="campo">Plata en mano de verdad<input id="x-real" class="plata" inputmode="numeric" placeholder="$0"></label>
    <button class="btn azul" id="x-ok">${I('check')}Guardar</button><button class="btn gris bajo" data-acc="cerrar">Cancelar</button></div></div>`, {
    montar: h => {
      h.querySelector('#x-ok').onclick = () => {
        const real = valorDe(h, '#x-real'), dif = real - plataEnMano();
        if (dif) DB.movs.push({ id: uid(), tipo: 'ajuste', valor: dif, cat: 'Ajuste', nota: 'Corrección de plata en mano', fecha: hoy() });
        guardar(); cerrarHoja(); toast('Plata en mano: ' + money(real));
        UI.hojas.forEach(x => { if (x.querySelector('#a-reinv')) pintarAjustes(x); }); render();
      };
    }
  });
}

/* ---------- copia de seguridad ---------- */
const b64utf8 = s => btoa(unescape(encodeURIComponent(s)));
function hacerCopia() {
  DB.config.ultimaCopia = hoy();
  const copia = JSON.parse(JSON.stringify(DB)); copia.config.pin = null; copia.config.pinSal = '';
  const txt = JSON.stringify({ app: 'tusfinanzas', v: 1, fecha: hoy(), db: copia });
  const ok = Nativo.compartir(b64utf8(txt), 'tusfinanzas-copia-' + hoy() + '.json', 'application/json', 'Copia de seguridad de Tus Finanzas (' + fechaSimple(hoy()) + ')');
  if (ok) { guardar(); toast('Elige "Drive" para guardar la copia'); } else toast('No se pudo crear la copia');
  UI.hojas.forEach(x => { if (x.querySelector('#a-reinv')) pintarAjustes(x); }); if (!UI.hojas.length) render();
}
function restaurarCopia() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,application/json,text/plain,*/*';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = async () => {
      let data;
      try { data = JSON.parse(rd.result); } catch (e) { toast('Ese archivo no es una copia de Tus Finanzas'); return; }
      if (!data || data.app !== 'tusfinanzas' || !data.db) { toast('Ese archivo no es una copia de Tus Finanzas'); return; }
      const n = (data.db.clientes || []).length;
      if (!await confirmar('¿Restaurar la copia?', `Copia del ${esc(fechaSimple(data.fecha || hoy()))} con ${n} ${n === 1 ? 'cliente' : 'clientes'}. Reemplaza lo que hay ahora en la app.`, 'Sí, restaurar', 'morado')) return;
      const pin = DB.config.pin, sal = DB.config.pinSal;
      DB = migrar(data.db); DB.config.listo = true; DB.config.pin = pin; DB.config.pinSal = sal; guardar(); cerrarTodas(); UI.tab = 'ruta'; render(); toast('Copia restaurada');
    };
    rd.readAsText(f);
  };
  inp.click();
}

/* ======================================================================
   CLAVE DE 4 NÚMEROS
   ====================================================================== */
const teclado = () => `<div class="teclado">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-n="${n}">${n}</button>`).join('')}
  <button type="button" class="vacio" tabindex="-1" aria-hidden="true"></button><button type="button" data-n="0">0</button><button type="button" class="borrar" data-n="x" aria-label="Borrar">Borrar</button></div>`;
const puntos = n => [0, 1, 2, 3].map(i => `<i class="${i < n ? 'lleno' : ''}"></i>`).join('');
/* Pide 4 números en un contenedor; cuando se completan llama a listo(pin) y si devuelve false tiembla y limpia */
function pedirPin(el, listo) {
  let v = '';
  const dots = el.querySelector('.pin-puntos');
  el.querySelector('.teclado').addEventListener('click', e => {
    const b = e.target.closest('[data-n]'); if (!b || el.dataset.espera) return;
    if (b.dataset.n === 'x') v = v.slice(0, -1); else if (v.length < 4) v += b.dataset.n;
    dots.innerHTML = puntos(v.length); dots.classList.remove('mal');
    if (v.length === 4) {
      const pin = v;
      setTimeout(() => { if (listo(pin) === false) { dots.classList.add('mal'); v = ''; dots.innerHTML = puntos(0); } }, 120);
    }
  });
}
let bloqueada = false, fallos = 0, pausaDesde = 0;
function bloquear() {
  if (!DB.config.pin) return;
  bloqueada = true;
  const el = $('#bloqueo');
  el.innerHTML = `<div class="logo"><span>$</span></div><h1 style="font-size:22px;font-weight:800">Tus Finanzas</h1>
    <p class="muted" id="pin-msg" style="font-size:15px">Escribe tu clave</p><div class="pin-puntos">${puntos(0)}</div>${teclado()}
    <button type="button" class="btn gris bajo" style="width:auto;margin-top:6px" id="pin-olvide">¿Olvidaste la clave?</button>`;
  el.classList.remove('oculto');
  pedirPin(el, pin => {
    if (pinCorrecto(pin)) { fallos = 0; bloqueada = false; el.classList.add('oculto'); el.innerHTML = ''; return true; }
    fallos++;
    const msg = $('#pin-msg');
    if (fallos >= 5) {
      el.dataset.espera = '1'; let s = 30;
      const t = setInterval(() => { msg.textContent = 'Demasiados intentos. Espera ' + s + ' s'; if (--s < 0) { clearInterval(t); delete el.dataset.espera; fallos = 3; msg.textContent = 'Escribe tu clave'; } }, 1000);
    } else msg.innerHTML = '<b class="rojo">Clave incorrecta</b>';
    return false;
  });
  $('#pin-olvide').onclick = () => {
    $('#pin-msg').innerHTML = 'Por seguridad la clave no se puede ver. Para entrar sin ella: en el celular ve a <b>Ajustes → Aplicaciones → Tus Finanzas → Almacenamiento → Borrar datos</b> y luego restaura tu copia de seguridad de Drive (la copia no guarda la clave).';
    $('#pin-msg').style.cssText = 'font-size:13px;text-align:center;max-width:340px;line-height:1.45';
  };
}
window.tfPause = () => { pausaDesde = Date.now(); };
function hojaPin(modo) { // modo: 'nueva' | 'cambiar' | 'quitar'
  let paso = modo === 'nueva' ? 'nueva' : 'actual', primera = '';
  const titulos = { actual: 'Escribe tu clave actual', nueva: 'Escribe la clave nueva (4 números)', repetir: 'Repite la clave nueva' };
  const h = abrirHoja('');
  const pintar = (msg = '') => {
    refrescarHoja(h, `<div class="card" style="margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:14px">
      <h2 style="font-size:19px;font-weight:800;text-align:center">${titulos[paso]}</h2><p class="muted" style="min-height:18px">${msg}</p>
      <div class="pin-puntos">${puntos(0)}</div>${teclado()}<button class="btn gris bajo" data-acc="cerrar">Cancelar</button></div>`);
    pedirPin(h, pin => {
      if (paso === 'actual') {
        if (!pinCorrecto(pin)) return false;
        if (modo === 'quitar') { DB.config.pin = null; DB.config.pinSal = ''; guardar(); cerrarHoja(); toast('Clave quitada'); refrescarAjustes(); return true; }
        paso = 'nueva'; pintar(); return true;
      }
      if (paso === 'nueva') { primera = pin; paso = 'repetir'; pintar(); return true; }
      if (pin !== primera) { paso = 'nueva'; pintar('<b class="rojo">No coinciden. Empieza otra vez.</b>'); return true; }
      ponerPin(pin); cerrarHoja(); toast('Clave guardada: la app la pedirá al abrir'); refrescarAjustes(); return true;
    });
  };
  pintar();
}
function refrescarAjustes() { UI.hojas.forEach(x => { if (x.querySelector('#a-reinv')) pintarAjustes(x); }); }

/* ======================================================================
   ACTUALIZAR LA APP (se publica en GitHub: carpeta tus-finanzas/ de la rama main)
   ====================================================================== */
const URL_ACT = 'https://raw.githubusercontent.com/nexopc/nexo-finanzas/main/tus-finanzas/';
function avisoActualizacion() {
  if (!UI.nueva) return '';
  return `<div class="aviso azul">${I('nube', 'i', 'style="transform:rotate(180deg)"')}<span><b>Hay una versión nueva (${esc(UI.nueva.version)})</b><br>Tus datos no se borran.</span><button class="btn azul bajo" style="width:auto" data-acc="actualizar">Actualizar</button></div>`;
}
async function buscarActualizacion() {
  const r = await Nativo.texto(URL_ACT + 'version.json?t=' + Date.now());
  if (!r.ok) return { ok: false, error: r.error };
  let v; try { v = JSON.parse(r.text); } catch (e) { return { ok: false, error: 'archivo' }; }
  DB.config.ultimaRevision = Date.now();
  try { localStorage.setItem('tf_db', JSON.stringify(DB)); } catch (e) { }
  UI.nueva = (v && v.code > Nativo.versionCode()) ? v : null;
  return { ok: true, nueva: UI.nueva };
}
function hojaActualizar() {
  const v = UI.nueva; if (!v) return;
  const nota = (v.notas || []).find(x => x.v === v.version);
  abrirHoja(`<div class="card" style="margin-top:14px"><h2 style="font-size:20px;font-weight:800">Versión nueva ${esc(v.version)}</h2>
    <p class="muted" style="margin:4px 0 10px">Tienes la ${esc(Nativo.version() || window.APP_VERSION)}.</p>
    ${nota ? '<ul style="margin:0 0 12px;padding-left:20px;font-size:14px;line-height:1.5">' + nota.cambios.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : ''}
    <div class="aviso verde" style="margin:0 0 12px;background:var(--verde-bg);color:#052e16">${I('check', 'i', 'style="color:var(--verde)"')}<span>Tus clientes, cobros y gastos <b>no se borran</b>.</span></div>
    <p class="muted peq" style="margin-bottom:12px">Se descarga la app nueva y Android te pregunta: toca <b>Actualizar</b> o <b>Instalar</b>.</p>
    <p class="error" id="act-err"></p>
    <div class="form"><button class="btn azul" id="act-ok">${I('nube', 'i', 'style="transform:rotate(180deg)"')}Actualizar ahora</button><button class="btn gris bajo" data-acc="cerrar">Ahora no</button></div></div>`, {
    montar: h => {
      h.querySelector('#act-ok').onclick = async () => {
        const b = h.querySelector('#act-ok'); b.disabled = true; b.lastChild.textContent = 'Descargando…';
        guardar();
        const r = await Nativo.instalar(URL_ACT + (v.apk || 'TusFinanzas.apk') + '?t=' + Date.now());
        b.disabled = false; b.lastChild.textContent = 'Actualizar ahora';
        if (r.ok) { cerrarHoja(); return; }
        h.querySelector('#act-err').innerHTML = r.error === 'permiso_instalar'
          ? 'Android pide permiso: activa <b>"Permitir de esta fuente"</b> para Tus Finanzas, vuelve aquí y toca otra vez <b>Actualizar ahora</b>.'
          : 'No se pudo descargar. Revisa el internet e intenta otra vez.';
      };
    }
  });
}

/* ======================================================================
   ACCIONES DE LOS BOTONES
   ====================================================================== */
const ACC = {
  cerrar: () => cerrarHoja(),
  tab: id => irA(id),
  ajustes: () => hojaAjustes(),
  cerrarTip: () => { DB.config.tipCuaderno = true; guardar(); render(); },
  elegir: id => { UI.sel = id; guardarVistaMapa(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  ficha: id => hojaFicha(id),
  editarCliente: id => hojaEditarCliente(id),
  prestarA: id => { hojaPrestamo(id); },
  cobrar: id => hojaCobro(id),
  cobrarOtra: id => { cerrarHoja(); hojaCobro(id); },
  filtro: id => { UI.filtro = id; vistaClientes(); },
  verAtrasados: () => { UI.filtro = 'atrasado'; irA('clientes'); },
  mov: tipo => hojaMov(tipo),
  verMov: id => { const m = DB.movs.find(x => x.id === id); if (m) hojaMov(m.tipo, m); },
  fijo: id => hojaFijo(id),
  pagarFijo: id => {
    const f = DB.fijos.find(x => x.id === id); if (!f) return;
    DB.movs.push({ id: uid(), tipo: 'gasto', valor: f.valor, cat: f.cat, nota: f.nombre, fecha: hoy(), fijoId: f.id });
    guardar(); toast(f.nombre + ' pagado: ' + money(f.valor)); render();
  },
  repTipo: id => { UI.rep = { tipo: id, off: 0 }; vistaReportes(); },
  repMov: id => { UI.rep.off = Math.min(0, UI.rep.off + Number(id)); vistaReportes(); },
  pdf: () => {
    const R = rangoReporte(), r = resumenPeriodo(R.a, R.b);
    const ok = Nativo.compartir(reportePDF(R.titulo, R.a, R.b, r), 'reporte-' + R.a + '.pdf', 'application/pdf', 'Reporte de Tus Finanzas · ' + R.titulo);
    toast(ok ? 'Reporte listo: elige dónde guardarlo o enviarlo' : 'No se pudo crear el PDF');
  },
  recordar: id => {
    const c = cliente(id), p = prestamoActivo(id);
    const tel = telWA(c && c.cel);
    if (!tel) { toast('Este cliente no tiene celular guardado'); return; }
    if (!p) { toast('No tiene cuotas pendientes'); return; }
    const d = hoy(), pend = cuotasPendientesHasta(p, d), i = pend.length ? pend[0] : proximaCuota(p), v = valores(p);
    const nombre = c.nombre.split(' ')[0];
    let t;
    if (pend.length > 1 || (pend.length && p.fechas[i] < d)) {
      const deuda = pend.reduce((s, k) => s + faltaCuota(p, k), 0);
      t = `Hola ${nombre}, te recuerdo que tienes ${pend.length} ${pend.length === 1 ? 'cuota pendiente' : 'cuotas pendientes'} por ${money(deuda)}. ¿Hoy a qué hora paso? Gracias.`;
    } else if (p.fechas[i] === d) t = `Hola ${nombre}, hoy te toca la cuota ${i + 1} de ${p.cuotas} por ${money(v[i].valor)}. ¿A qué hora paso? Gracias.`;
    else t = `Hola ${nombre}, te recuerdo que tu cuota ${i + 1} de ${p.cuotas} por ${money(v[i].valor)} vence el ${fechaLarga(p.fechas[i]).toLowerCase()}. Gracias.`;
    Nativo.abrir('https://wa.me/' + tel + '?text=' + encodeURIComponent(t));
  },
  recibo: id => {
    const c = cliente(id);
    const ps = prestamosDe(id).map(p => ({ p, g: grupos(p).slice(-1)[0] })).filter(o => o.g).sort((a, b) => (b.g[0].ts || 0) - (a.g[0].ts || 0));
    if (!ps.length) { toast('Aún no hay pagos para este cliente'); return; }
    const { p, g } = ps[0];
    const ok = Nativo.compartir(reciboPNG(c, p, g), 'recibo-' + g[0].fecha + '-' + (g[0].i + 1) + '.png', 'image/png', 'Recibo de pago · ' + money(g.reduce((s, x) => s + x.valor, 0)), telWA(c.cel));
    if (!ok) toast('No se pudo crear el recibo');
  },
  deshacer: async id => {
    const p = prestamoActivo(id) || prestamosDe(id).slice(-1)[0];
    if (!p) return;
    const g = grupos(p).slice(-1)[0]; if (!g) return;
    if (!await confirmar('¿Deshacer el último pago?', `${money(g.reduce((s, x) => s + x.valor, 0))} del ${fechaSimple(g[0].fecha)} (cuota ${g.map(x => x.i + 1).join(', ')}). Úsalo solo si lo registraste por error.`, 'Sí, deshacer')) return;
    deshacerCobro(p); toast('Pago deshecho'); refrescarTodo();
  },
  borrarCliente: async id => {
    const c = cliente(id);
    if (!await confirmar('¿Eliminar a ' + c.nombre + '?', 'Se borran el cliente, sus préstamos y sus cobros. Esto cambia tus reportes y no se puede deshacer.', 'Sí, eliminar')) return;
    DB.prestamos = DB.prestamos.filter(p => p.clienteId !== id); DB.clientes = DB.clientes.filter(x => x.id !== id);
    guardar(); cerrarTodas(); toast('Cliente eliminado'); render();
  },
  llamar: id => { const c = cliente(id); if (c && c.cel) Nativo.abrir('tel:' + String(c.cel).replace(/[^\d+]/g, '')); },
  ubicar: async id => {
    const c = cliente(id); toast('Buscando tu ubicación…', 30000);
    const r = await Nativo.ubicacion();
    if (!r.ok) { toast(errorGPS(r.error)); return; }
    c.lat = r.lat; c.lon = r.lon; c.acc = r.acc; guardar();
    toast('Ubicación de ' + c.nombre.split(' ')[0] + ' guardada (±' + r.acc + ' m)'); UI.mapaVista = null; refrescarTodo();
  },
  salida: async () => {
    toast('Buscando tu ubicación…', 30000);
    const r = await Nativo.ubicacion();
    if (!r.ok) { toast(errorGPS(r.error)); return; }
    DB.config.salida = { lat: r.lat, lon: r.lon }; guardar(); toast('Punto de salida guardado');
    UI.hojas.forEach(x => { if (x.querySelector('#a-reinv')) pintarAjustes(x); });
  },
  miUbicacion: async () => {
    toast('Buscando tu ubicación…', 30000);
    const r = await Nativo.ubicacion();
    if (!r.ok) { toast(errorGPS(r.error)); return; }
    UI.yo = { lat: r.lat, lon: r.lon }; UI.mapaVista = null; toast('Ruta calculada desde donde estás'); render();
  },
  zoomMas: () => { if (mapa) { mapa.zoomEn(mapa.w / 2, mapa.h / 2, 0.6); guardarVistaMapa(); } },
  zoomMenos: () => { if (mapa) { mapa.zoomEn(mapa.w / 2, mapa.h / 2, 1.6); guardarVistaMapa(); } },
  comoLlegar: id => {
    const c = cliente(id);
    if (c.lat == null) { toast('Este cliente no tiene ubicación. Cuando estés en su casa toca el botón del pin para guardarla.', 4000); return; }
    const desde = UI.yo || DB.config.salida;
    const r = desde ? rutaCalles(desde, c) : null;
    if (mapa) {
      if (r) { mapa.ruta = r.pts; mapa.encuadrar(r.pts); } else mapa.centrarEn({ lat: c.lat, lon: c.lon }, 1.8);
      guardarVistaMapa(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (!desde) { toast('Toca el botón de ubicación del mapa para trazar el camino desde donde estás', 4000); return; }
    toast((r ? 'Camino marcado: ' + km(r.m) + ' por calles' : 'Está a ' + km(distM(desde, c) * FACTOR_CALLE)) + ' hacia ' + rumbo(desde, c) + '. Para guía calle por calle usa Google Maps.', 4500);
  },
  googleMaps: id => {
    const c = cliente(id);
    const q = c.lat != null ? c.lat + ',' + c.lon : encodeURIComponent((c.dir || c.nombre) + ', Quibdó, Chocó');
    if (!Nativo.enLinea()) toast('Google Maps necesita internet para guiarte', 3500);
    Nativo.abrir(`https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=two-wheeler`);
  },
  bajarMapa: async (_, btn) => {
    btn.disabled = true;
    const est = $('#mapa-estado');
    const r = await descargarMapa(t => { if (est) est.textContent = t; });
    btn.disabled = false;
    if (r.ok) { toast('Mapa guardado: ya funciona sin internet'); UI.mapaVista = null; UI.hojas.forEach(x => { if (x.querySelector('#a-reinv')) pintarAjustes(x); }); }
    else if (est) est.textContent = r.error === 'sin_internet' ? 'Sin internet. Conéctate a wifi o datos e intenta otra vez.' : 'No se pudo descargar ahora (' + r.error + '). Intenta más tarde.';
  },
  corregirMano: () => hojaCorregirMano(),
  pin: modo => hojaPin(modo),
  actualizar: () => hojaActualizar(),
  buscarAct: async (_, btn) => {
    btn.disabled = true; const est = $('#act-estado'); if (est) est.textContent = 'Buscando…';
    const r = await buscarActualizacion();
    btn.disabled = false;
    if (!r.ok) { if (est) est.textContent = r.error === 'sin_internet' ? 'Sin internet. Conéctate e intenta otra vez.' : 'No se pudo revisar ahora (' + r.error + '). Intenta más tarde.'; return; }
    UI.hojas.forEach(x => { if (x.querySelector('#a-reinv')) pintarAjustes(x); });
    if (r.nueva) hojaActualizar(); else { const e2 = $('#act-estado'); if (e2) e2.textContent = 'Ya tienes la versión más nueva.'; }
  },
  copia: () => hacerCopia(),
  restaurar: () => restaurarCopia(),
};

/* ---------- arranque ---------- */
cargar();
render();
bloquear();
enviarAgenda();
// revisa actualizaciones sola (máximo cada 6 horas y solo con internet)
setTimeout(async () => {
  if (!Nativo.hay || !Nativo.enLinea() || Date.now() - (DB.config.ultimaRevision || 0) < 6 * 3600e3) return;
  const r = await buscarActualizacion();
  if (r.ok && r.nueva && !UI.hojas.length && DB.config.listo) render();
}, 2500);
