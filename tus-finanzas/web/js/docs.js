/* Tus Finanzas — recibo de pago (imagen) y reporte en PDF, hechos dentro del celular sin internet. */
'use strict';

/* ---------- recibo como imagen PNG ---------- */
function reciboPNG(c, p, pago) {
  const W = 720, H = 980, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#111827'; x.fillRect(0, 0, W, 170);
  x.fillStyle = '#0E7A45'; x.beginPath(); x.arc(84, 85, 42, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.font = '800 48px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('$', 84, 88);
  x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  x.font = '800 40px system-ui, sans-serif'; x.fillText('Recibo de pago', 150, 80);
  x.font = '500 26px system-ui, sans-serif'; x.fillStyle = '#D1D5DB'; x.fillText((DB.config.nombre || 'Tus Finanzas') + ' · Tus Finanzas', 150, 122);

  const v = valores(p);
  const fila = (y, a, b, color = '#111827', peso = 600) => {
    x.font = '500 28px system-ui, sans-serif'; x.fillStyle = '#4B5563'; x.fillText(a, 56, y);
    x.font = peso + ' 30px system-ui, sans-serif'; x.fillStyle = color; x.textAlign = 'right'; x.fillText(b, W - 56, y); x.textAlign = 'left';
  };
  let y = 250;
  fila(y, 'Cliente', c.nombre, '#111827', 800); y += 60;
  fila(y, 'Fecha', fechaLarga(pago.fecha)); y += 60;
  fila(y, 'Cuota', (pago.i + 1) + ' de ' + p.cuotas); y += 60;
  fila(y, 'Valor de la cuota', money(pago.valor)); y += 60;
  if (pago.mora) { fila(y, 'Mora por atraso', money(pago.mora), '#B91C1C'); y += 60; }
  x.strokeStyle = '#E5E7EB'; x.lineWidth = 2; x.beginPath(); x.moveTo(56, y - 20); x.lineTo(W - 56, y - 20); x.stroke(); y += 30;
  x.font = '600 28px system-ui, sans-serif'; x.fillStyle = '#4B5563'; x.fillText('Total pagado', 56, y);
  x.font = '800 54px system-ui, sans-serif'; x.fillStyle = '#0E7A45'; x.textAlign = 'right'; x.fillText(money(pago.valor + (pago.mora || 0)), W - 56, y + 8); x.textAlign = 'left';
  y += 90;
  x.fillStyle = '#F3F4F6'; x.fillRect(40, y, W - 80, 190);
  y += 55;
  const pend = p.cuotas - p.pagos.filter(q => q.ts <= pago.ts || q.previo).length;
  const saldoTras = p.fechas.reduce((s, f, i) => s + (p.pagos.some(q => q.i === i && (q.previo || q.ts <= pago.ts)) ? 0 : v[i].valor), 0);
  fila(y, 'Le falta pagar', money(saldoTras), '#111827', 800); y += 55;
  fila(y, 'Cuotas que faltan', String(pend)); y += 55;
  const sig = p.fechas.find((f, i) => !p.pagos.some(q => q.i === i && (q.previo || q.ts <= pago.ts)));
  fila(y, 'Próxima cuota', sig ? fechaCorta(sig) : '¡Préstamo pagado!', sig ? '#111827' : '#0E7A45');
  x.font = '500 22px system-ui, sans-serif'; x.fillStyle = '#6B7280'; x.textAlign = 'center';
  x.fillText('Gracias por tu pago.', W / 2, H - 50);
  return cv.toDataURL('image/png').split(',')[1];
}

/* ---------- PDF mínimo (Helvetica, tildes y ñ incluidas) ---------- */
class PDF {
  constructor() { this.pags = []; this.nueva(); }
  nueva() { this.ops = []; this.pags.push(this.ops); this.y = 790; }
  static t(s) {
    s = String(s).replace(/−/g, '-').replace(/[≈~]/g, '~').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/·/g, '·').replace(/…/g, '...');
    let o = '';
    for (const ch of s) { const c = ch.charCodeAt(0); o += c < 256 ? ch : '?'; }
    return o.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }
  color(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255].map(v => v.toFixed(3)).join(' '); }
  texto(x, y, s, size = 10, bold = false, color = '#111827', alinear = 'left') {
    let xx = x;
    if (alinear === 'right') xx = x - PDF.ancho(s, size, bold);
    this.ops.push(`BT ${this.color(color)} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${xx.toFixed(1)} ${y.toFixed(1)} Td (${PDF.t(s)}) Tj ET`);
  }
  static ancho(s, size, bold) { return String(s).length * size * (bold ? 0.56 : 0.5); }
  rect(x, y, w, h, color) { this.ops.push(`${this.color(color)} rg ${x} ${y} ${w} ${h} re f`); }
  linea(x1, y1, x2, y2, color = '#E5E7EB') { this.ops.push(`${this.color(color)} RG 0.8 w ${x1} ${y1} m ${x2} ${y2} l S`); }
  espacio(h) { if (this.y - h < 50) this.nueva(); this.y -= h; return this.y; }
  base64() {
    const objs = [];
    const add = s => { objs.push(s); return objs.length; };
    const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const pagesId = objs.length + 1; objs.push(null);
    const kids = [];
    for (const ops of this.pags) {
      const cont = ops.join('\n');
      const cid = add(`<< /Length ${cont.length} >>\nstream\n${cont}\nendstream`);
      kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cid} 0 R >>`));
    }
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
    const cat = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    let out = '%PDF-1.4\n%âãÏÓ\n';
    const offs = [];
    objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return btoa(out);
  }
}

function reportePDF(titulo, a, b, r) {
  const d = new PDF();
  const L = 50, R = 545;
  d.rect(0, 772, 595, 70, '#111827');
  d.texto(L, 812, 'Tus Finanzas', 18, true, '#FFFFFF');
  d.texto(L, 790, 'Reporte ' + titulo + (DB.config.nombre ? ' · ' + DB.config.nombre : ''), 11, false, '#D1D5DB');
  d.texto(R, 790, 'Generado: ' + fechaSimple(hoy()), 9, false, '#D1D5DB', 'right');
  d.y = 745;
  const fila = (a1, b1, color = '#111827', bold = false) => { const y = d.espacio(20); d.texto(L, y, a1, 11, false, '#374151'); d.texto(R, y, b1, 11, bold, color, 'right'); d.linea(L, y - 6, R, y - 6); };
  d.texto(L, d.y, 'Resumen', 13, true); d.espacio(8);
  fila('Intereses cobrados', money(r.intereses), '#0E7A45');
  fila('Mora cobrada', money(r.mora), '#0E7A45');
  fila('Capital recuperado', money(r.capital));
  fila('Total cobrado', money(r.cobrado), '#111827', true);
  fila('Prestado nuevo', money(r.prestado), '#1D4ED8');
  fila('Otros ingresos', money(r.ingresos), '#0E7A45');
  fila('Gastos', money(r.gastos), '#B91C1C');
  fila('Resultado (intereses + ingresos - gastos)', money(r.resultado, true), r.resultado >= 0 ? '#0E7A45' : '#B91C1C', true);
  d.espacio(14);
  fila('Capital total hoy', money(capitalTotal()), '#111827', true);
  fila('Prestado en la calle', money(enLaCalle()));
  fila('Plata en mano', money(plataEnMano()));

  const atr = DB.clientes.map(c => ({ c, e: estadoCliente(c) })).filter(o => o.e.tipo === 'atrasado');
  if (atr.length) {
    d.espacio(26); d.texto(L, d.y, 'Clientes atrasados (' + atr.length + ')', 13, true, '#B91C1C'); d.espacio(6);
    for (const o of atr) fila(o.c.nombre + ' · ' + o.e.dias + (o.e.dias === 1 ? ' día' : ' días') + ' · ' + o.e.cuotas + ' cuota(s)', money(saldo(o.e.p)), '#B91C1C');
  }
  d.espacio(26); d.texto(L, d.y, 'Cobros (' + r.nCobros + ')', 13, true); d.espacio(6);
  if (!r.cobros.length) fila('Sin cobros en este periodo', '');
  for (const o of r.cobros) { const c = cliente(o.p.clienteId); fila(fechaSimple(o.fecha) + ' · ' + (c ? c.nombre : '—') + ' · cuota ' + (o.x.i + 1) + '/' + o.p.cuotas + (o.x.mora ? ' (+mora ' + money(o.x.mora) + ')' : ''), money(o.x.valor + (o.x.mora || 0))); }
  if (r.movs.length) {
    d.espacio(26); d.texto(L, d.y, 'Gastos e ingresos (' + r.movs.length + ')', 13, true); d.espacio(6);
    for (const m of r.movs) fila(fechaSimple(m.fecha) + ' · ' + m.cat + (m.nota ? ' · ' + m.nota : ''), (m.tipo === 'gasto' ? '-' : '+') + money(m.valor), m.tipo === 'gasto' ? '#B91C1C' : '#0E7A45');
  }
  return d.base64();
}
