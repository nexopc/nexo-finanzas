function vPrestamos(){
  const la=loansActive();const f=S.me.pf||'todos';
  const all=items('prestamo').map(p=>({p,s:loanStatus(p),cl:S.items[p.cliente]})).filter(x=>x.cl&&!x.cl.del);
  const prest=la.reduce((s,x)=>s+x.p.monto*(x.s.saldo/x.p.total),0);const porCobrar=la.reduce((s,x)=>s+x.s.saldo,0);
  const m0=today().slice(0,7);const intMes=items('pago').filter(x=>x.fecha.startsWith(m0)&&!x.cuaderno).reduce((s,x)=>{const p=S.items[x.prestamo];return s+(p?interesPart(p,x.monto):0)+(x.mora||0)},0);
  let list=f==='hoy'?la.filter(x=>x.s.debeHoy>0&&x.s.atraso<=.5):f==='atr'?la.filter(x=>x.s.atraso>.5):f==='pag'?all.filter(x=>x.s.done):la;
  const q=(S.me.pq||'').toLowerCase();if(q)list=list.filter(x=>x.cl.nombre.toLowerCase().includes(q));
  list.sort((a,b)=>(b.s.atraso>0)-(a.s.atraso>0)||(b.s.debeHoy>0)-(a.s.debeHoy>0)||a.cl.nombre.localeCompare(b.cl.nombre));
  let h=`<div class="top"><h1>Préstamos</h1>${canEdit()?`<button class="act a-presta mini" data-a="prestar">${ic('presta','width:16px;height:16px')}Prestar</button>`:''}</div>
  <div class="card"><div class="k2" style="margin-top:0"><div><span class="lbl">Prestado (capital)</span><div class="v">${moneyS(prest)}</div></div><div><span class="lbl">Por cobrar</span><div class="v">${moneyS(porCobrar)}</div></div>
  <div><span class="lbl">Intereses este mes</span><div class="v ok">+ ${moneyS(intMes)}</div></div><div><span class="lbl">Clientes</span><div class="v">${la.length} activos</div></div></div></div>
  <div class="seg">${[['todos','Todos'],['hoy','Hoy'],['atr','Atrasados'],['pag','Pagados']].map(([k,l])=>`<button data-a="pf" data-v="${k}" class="${f===k?'on':''}">${l}</button>`).join('')}</div>
  ${all.length>8?`<input class="tin" style="margin:0 0 9px" placeholder="Buscar cliente" value="${esc(S.me.pq||'')}" data-a2="pq">`:''}
  <div class="card">`;
  if(!list.length)h+=`<div class="empty"><b>${all.length?'Nadie en esta lista':'Aún no hay préstamos'}</b>${all.length?'':'Toca el botón azul "Prestar" para crear el primero.'}</div>`;
  for(const x of list){const ch=x.s.done?'<span class="chip c-gris">Pagado</span>':x.s.atraso>.5?`<span class="chip c-mal">${x.s.lateDays} d tarde</span>`:x.s.pendSem>.5?'<span class="chip c-hoy">Pendiente</span>':x.s.debeHoy>0?'<span class="chip c-hoy">Hoy</span>':'<span class="chip c-ok">Al día</span>';
    h+=`<button class="pp" data-a="cliente" data-v="${x.p.id}"><span class="ini">${esc(initials(x.cl.nombre))}</span><span class="t"><b>${esc(x.cl.nombre)}</b><span class="sub">Debe ${money(x.s.saldo)} · ${frecTxt(x.p)}</span></span>${ch}</button>`}
  return h+`</div>`;
}
const DIAS=[['todos','Todos los días'],['sindom','Sin domingos'],['sinfest','Sin domingos ni festivos']];
const diasDef=()=>{const d=(cfg()||{}).domingos||'';return d.startsWith('Todos')||d==='Sí'?'todos':d==='Sin domingos'?'sindom':'sinfest'};
function vCliente(){
  const p=S.items[S.me.loan];if(!p||p.del){S.me.view='prestamos';return vPrestamos()}
  const cl=S.items[p.cliente]||{nombre:'?'};const s=loanStatus(p);
  const others=items('prestamo').filter(x=>x.cliente===p.cliente&&x.id!==p.id);
  let h=`<div class="top"><button class="row" data-a="tab" data-v="prestamos" style="gap:4px;justify-content:flex-start;min-height:44px">${ic('chev')}<h1 style="font-size:1.3em">${esc(cl.nombre)}</h1></button>${s.done?'<span class="chip c-gris">Pagado</span>':s.atraso>.5?`<span class="chip c-mal">Atrasado</span>`:s.pendSem>.5?'<span class="chip c-hoy">Pendiente</span>':s.debeHoy>0?'<span class="chip c-hoy">Paga hoy</span>':'<span class="chip c-ok">Al día</span>'}</div>
  <div class="card hero"><span class="lbl">Le falta pagar</span><div class="big">${money(s.saldo)}</div><div class="sub">Pagó ${s.pagadas} de ${p.n} cuotas de ${money(p.cuota)} · ${frecTxt(p)}</div>
   ${s.atraso>.5?`<div class="sub bad" style="margin-top:4px">Atrasado: ${money(s.atraso)}${s.mora?` + mora sugerida ${money(s.mora)}`:''}</div>`:''}
   <div class="k2"><div><span class="lbl">Le presté</span><div class="v">${money(p.monto)}</div></div><div><span class="lbl">Me paga en total</span><div class="v">${money(p.total)}</div></div></div></div>
  <div class="acts" style="grid-template-columns:1fr 1fr 1fr">${canEdit()&&!s.done?`<button class="act a-cobra" data-a="cobrar" data-v="${p.id}">${ic('cobra')}Cobrar</button>`:''}
   <button class="act a-enviar" data-a="wa" data-k="${s.atraso>.5?'atraso':s.debeHoy>0?'hoy':'prox'}" data-v="${p.id}">${ic('enviar')}Recordar</button>
   <button class="act a-enviar" data-a="recibo" data-v="${p.id}">${ic('enviar')}Recibo</button></div>`;
  h+=calendar(s,p);
  h+=`<div class="sec">Pagos</div><div class="card">`;
  if(p.previas)h+=`<div class="pp"><span class="ini">${ic('editar','width:16px;height:16px')}</span><span class="t"><b>${p.previas} cuotas del cuaderno</b><span class="sub">Antes de usar la app</span></span></div>`;
  if(!s.pagos.length&&!p.previas)h+=`<div class="empty" style="padding:12px">Aún no hay pagos</div>`;
  s.pagos.slice().reverse().forEach(x=>{h+=`<div class="pp"><span class="ini" style="background:var(--cobra);color:#042420">${ic('cobra','width:16px;height:16px')}</span><span class="t"><b>${money(x.monto+(x.mora||0))}</b><span class="sub">${fdate(x.fecha)} · ${x.cuaderno?'del cuaderno':esc(x.pago||'')}${x.manual?' · corregido':''}${x.mora?' · mora '+money(x.mora):''}${x.alloc&&x.alloc.length?' · cuota '+x.alloc.map(a=>a.i+1).join(', '):''}</span></span>${canEdit()?`<button class="act a-ver mini" data-a="delpago" data-v="${x.id}" aria-label="Borrar pago">${ic('trash','width:16px;height:16px')}</button>`:''}</div>`});
  h+=`</div><div class="sec">Datos del cliente</div><div class="card">
   ${[['Celular',cl.cel],['Cédula',cl.cedula],['Barrio',cl.barrio],['Dirección',cl.dir],['Fiador',cl.codeudor],['Notas',cl.notas]].filter(x=>x[1]).map(([k,v])=>`<div class="row" style="padding:5px 0"><span class="sub">${k}</span><b style="font-size:.9em;text-align:right">${esc(v)}</b></div>`).join('')||'<div class="sub">Sin datos</div>'}
   <div class="sub" style="margin-top:6px">Préstamo del ${fdate(p.inicio)}${others.length?` · ${others.length} préstamo(s) más`:''}</div>
   ${canEdit()?`<div class="f2" style="margin-top:10px"><button class="act a-ver mini" data-a="editcl" data-v="${cl.id}">${ic('editar','width:16px;height:16px')}Editar datos</button><button class="act a-ver mini" data-a="delloan" data-v="${p.id}">${ic('trash','width:16px;height:16px')}Borrar préstamo</button></div>`:''}</div>`;
  if(others.length)h+=`<div class="card">${others.map(o=>{const so=loanStatus(o);return `<button class="pp" data-a="cliente" data-v="${o.id}"><span class="t"><b>Préstamo del ${fdate(o.inicio)}</b><span class="sub">${so.done?'Pagado':'Debe '+money(so.saldo)}</span></span>${ic('right')}</button>`}).join('')}</div>`;
  return h;
}
let LOCKU=0,LOCKCB=null;
function withLock(cb){if(!S.me.pin||LOCKU>Date.now())return cb();LOCKCB=cb;sheetAuth()}
function sheetAuth(){
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><h2 style="justify-content:center">🔒 Confirma que eres tú</h2>
  <p class="sub" style="text-align:center;margin:-4px 0 12px">Para cambiar un préstamo ya creado se pide tu PIN o Face ID. Queda abierto 5 minutos.</p>
  <form id="fauth"><input class="tin" name="pin" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" placeholder="PIN ••••" autofocus style="letter-spacing:.5em;font-size:1.4em;text-align:center;margin-top:0">
  <button class="bigbtn a-ver" type="submit">Desbloquear</button></form>
  ${S.me.face&&faceOK()?`<button class="bigbtn a-presta" data-a="authface">${ic('face')}Usar Face ID</button>`:''}
  <button class="bigbtn" data-a="close" style="color:var(--sub)">Cancelar</button></div>`;render();
}
function authOK(){LOCKU=Date.now()+5*60e3;const cb=LOCKCB;LOCKCB=null;layer='';render();if(cb)cb()}
async function faceVerify(){try{await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{type:'public-key',id:ub64(S.me.face)}],userVerification:'required',timeout:60000}});return true}catch(e){return false}}
function fixExtra(){const f=$('#ffix');if(!f)return;const m=f.mode.value;const p=S.items[f.dataset.p];const c=loanSched(p)[+f.dataset.i];const methods=(cfg().pagos||['Efectivo']);
  $('#fixextra').innerHTML=(m==='t'||m==='ab'?`<label class="field"><span>¿Qué día pagó?</span><input type="date" name="fecha" value="${m==='t'?addDays(c.f,1)>today()?today():addDays(c.f,1):today()}"></label>`:'')+
   (m==='ab'?`<label class="field"><span>¿Cuánto abonó?</span><input name="monto" inputmode="numeric" data-money="1" placeholder="${thou(Math.round(c.v/2))}"></label>`:'')+
   (m!=='n'?`<label class="field"><span>Recibí en</span><select name="metodo">${methods.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>`:'')+
   `<div class="sub" style="margin:-2px 2px 4px">${m==='n'?'Se quita cualquier pago de esta cuota.':m==='p'?`Queda pagada el ${fdate(c.f)}.`:'Reemplaza lo que tenía esta cuota.'}</div>`}
function sheetCobrar(pid,only){
  const p=S.items[pid];const s=loanStatus(p);const cl=S.items[p.cliente];const c=cfg();
  const pend=s.cuotas.filter(x=>x.st!=='p'&&x.st!=='t');const due=pend.filter(x=>x.f<=today());
  const sel=only!==undefined?[only]:(due.length?due:pend.slice(0,1)).map(x=>x.i);
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><div style="text-align:center"><span class="sub">Cobrar a</span><div class="mid">${esc(cl.nombre)}</div></div>
  <form id="fcob" data-p="${pid}"><div class="card" style="margin-top:10px"><div class="row"><b style="font-size:.92em">¿Cuántas cuotas pagó?</b><div class="row" style="gap:12px"><button type="button" class="act a-ver mini" data-a="ncuo" data-v="-1" style="width:42px">−</button><b class="mid" id="ncuo"></b><button type="button" class="act a-cobra mini" data-a="ncuo" data-v="1" style="width:42px">+</button></div></div>
  <div class="sub" style="margin-top:6px">Se marcan en orden. Si es un caso especial (ej. "hoy me pagó la de ayer"), toca las cuotas que quieras.</div></div>
  <div class="card" id="cuolist"></div>
  <label class="field" style="border:2px solid var(--cobra)"><span>¿Cuánto recibiste?</span><input name="monto" inputmode="numeric" data-money="1" style="font-size:1.5em;color:var(--cobra)"></label>
  <div class="sub" style="margin:-3px 2px 8px">Si te dio menos, lo que falte queda como abono en la última marcada.</div>
  ${c.moraTipo&&c.moraTipo!=='No'?`<label class="field"><span>Mora cobrada ${s.mora?`(sugerida ${money(s.mora)})`:''}</span><input name="mora" inputmode="numeric" data-money="1" value="${s.mora?thou(s.mora):''}" placeholder="0"></label>`:''}
  <div class="f2"><label class="field"><span>Recibí en</span><select name="pago">${(c.pagos||['Efectivo']).map(m=>`<option>${esc(m)}</option>`).join('')}</select></label><label class="field"><span>Fecha del pago</span><input name="fecha" type="date" value="${today()}"></label></div>
  <button class="bigbtn a-cobra" type="submit" id="cobbtn">${ic('cobra')}Confirmar cobro</button></form></div>`;
  render();const f=$('#fcob');f._sel=new Set(sel);cobCalc(true);
}
function cobCalc(setMonto){
  const f=$('#fcob');if(!f)return;const p=S.items[f.dataset.p];const s=loanStatus(p);const pend=s.cuotas.filter(x=>x.st!=='p'&&x.st!=='t');
  const sel=f._sel;$('#ncuo').textContent=sel.size;
  const colors={n:'var(--mal)',pend:'var(--hoy)',ab:'linear-gradient(180deg,var(--venta) 55%,#7F1D1D 55%)',hoy:'var(--hoy)',f:'var(--card2)'};
  const maxShown=Math.max(...[...sel].map(i=>pend.findIndex(c=>c.i===i)),0)+3;
  let amt=0;$('#cuolist').innerHTML=pend.slice(0,Math.max(maxShown,4)).map(c=>{const v=c.rem;const on=sel.has(c.i);if(on)amt+=v;
    return `<button type="button" class="q" data-a="csel" data-i="${c.i}" style="width:100%;text-align:left"><span style="width:24px;height:24px;border-radius:7px;border:2px solid var(--cobra);display:grid;place-items:center;background:${on?'var(--cobra)':'transparent'};color:#042420;flex:none">${on?'✓':''}</span><span class="bar" style="background:${colors[c.st]||'var(--card2)'}"></span><span style="flex:1"><b>${fdate(c.f)} · cuota ${c.i+1}</b><br><span class="sub">${{n:'Atrasada',pend:'Pendiente de esta semana',ab:'Falta resto del abono',hoy:'Hoy',f:'Adelantada'}[c.st]}</span></span><b style="${on?'':'opacity:.5'}">${money(v)}</b></button>`}).join('')||'<div class="empty">No hay cuotas pendientes</div>';
  if(setMonto!==false){f.monto.value=amt?thou(amt):'';f.monto.defaultValue=f.monto.value}
  $('#cobbtn').innerHTML=`${ic('cobra')}Confirmar cobro · ${money(intv(f.monto.value)+(f.mora?intv(f.mora.value):0))}`;
}
function saveCobro(f){
  const p=S.items[f.dataset.p];const monto=intv(f.monto.value);const mora=f.mora?intv(f.mora.value):0;if(!monto&&!mora){toast('Escribe cuánto recibiste');return}
  const s0=loanStatus(p);const m=Math.min(monto,s0.saldo);
  const order=s0.cuotas.filter(c=>f._sel.has(c.i));let left=m;const alloc=[];
  for(const c of order){if(left<=0.5)break;const a=Math.min(c.rem,left);alloc.push({i:c.i,m:a});left-=a}
  const pago={id:uid(),k:'pago',prestamo:p.id,fecha:f.fecha.value||today(),monto:m,alloc,mora,pago:f.pago.value};put(pago,true);
  const s=loanStatus(p);const cl=S.items[p.cliente];
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><div class="empty"><div style="font-size:2.4em;color:var(--cobra)">✓</div><b>Cobro guardado: ${money(m+mora)}</b>${s.done?'¡Terminó de pagar el préstamo!':`Le falta ${money(s.saldo)}`}</div>
  ${cl.cel?`<button class="bigbtn a-enviar" data-a="sendrecibo" data-v="${pago.id}">${ic('enviar')}Enviar recibo por WhatsApp</button>`:''}<button class="bigbtn a-ver" data-a="close">Listo</button></div>`;render();
}
