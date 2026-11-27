
/* =============== préstamos, cliente y cobros (de la app de oro) =============== */
/*@E*/

/* ---- Reportes ---- */
let REP=null;
function donut(parts,pct){const tot=parts.reduce((s,p)=>s+p.v,0)||1;let off=25;
  return `<svg viewBox="0 0 42 42" role="img" aria-label="${pct}% cobrado"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--card2)" stroke-width="6"/>${parts.map(p=>{const len=p.v/tot*100;if(len<=0)return '';const s=`<circle cx="21" cy="21" r="15.9155" fill="none" stroke="${p.c}" stroke-width="6" stroke-dasharray="${len} ${100-len}" stroke-dashoffset="${off}"/>`;off-=len;return s}).join('')}<text x="21" y="23.3" text-anchor="middle" font-size="7.2" font-weight="800" fill="var(--ink)">${pct}%</text></svg>`}
function vReportes(){
  const per=S.me.rp||'semana';const t=today();const wd=(pd(t).getDay()+6)%7;
  const range=per==='dia'?[t,t]:per==='semana'?[addDays(t,-wd),addDays(t,6-wd)]:[t.slice(0,8)+'01',ymd(new Date(+t.slice(0,4),+t.slice(5,7),0))];
  const inR=f=>f>=range[0]&&f<=range[1];
  const all=items('prestamo').map(p=>({p,s:lsOf(p),cl:S.items[p.cliente]})).filter(x=>x.cl&&!x.cl.del);
  let esperado=0,falto=0;all.forEach(x=>x.s.cuotas.forEach(c=>{if(inR(c.f)){esperado+=c.v;if(c.f<=t)falto+=c.rem||0}}));
  const P=items('pago').filter(x=>inR(x.fecha)&&!x.cuaderno);const cob=P.reduce((s,x)=>s+x.monto+(x.mora||0),0);
  const intr=P.reduce((s,x)=>{const p=S.items[x.prestamo];return s+(p?interesPart(p,x.monto):0)+(x.mora||0)},0);const capi=cob-intr;
  const pct=cob+falto>0?Math.round(cob/(cob+falto)*100):0;
  const la=all.filter(x=>!x.s.done);const calle=la.reduce((s,x)=>s+x.p.monto*(x.s.saldo/x.p.total),0);const porCob=la.reduce((s,x)=>s+x.s.saldo,0);
  const atr=la.filter(x=>x.s.atraso>.5).sort((a,b)=>b.s.atraso-a.s.atraso);
  const nx7=la.reduce((s,x)=>s+x.s.cuotas.filter(c=>c.f>t&&c.f<=addDays(t,7)).reduce((a,c)=>a+(c.rem||0),0),0);
  const prest=items('prestamo').filter(x=>inR(x.inicio)&&!x.cuaderno).reduce((s,x)=>s+x.monto,0);
  const best=la.filter(x=>x.s.atraso<=.5&&x.s.pagadas>0).sort((a,b)=>b.s.pagadas-a.s.pagadas).slice(0,3);
  const lbl={dia:'Hoy',semana:`${pd(range[0]).getDate()} – ${pd(range[1]).getDate()} ${MES[pd(range[1]).getMonth()]}`,mes:MESL[pd(t).getMonth()]}[per];
  REP={range,cob,capi,intr,falto,esperado,pct,calle,porCob,atr,nx7,prest,P,lbl};
  let h=`<div class="top"><h1>Reportes</h1><button class="act a-enviar mini" data-a="pdf">${ic('send','width:16px;height:16px')}PDF</button></div>
  <div class="seg">${[['dia','Día'],['semana','Semana'],['mes','Mes']].map(([k,l])=>`<button data-a="rp" data-v="${k}" class="${per===k?'on':''}">${l}</button>`).join('')}</div>
  <div class="card hero"><span class="lbl">Cobrado · ${esc(lbl)}</span><div class="big">${money(cob)}</div><div class="sub">de ${money(esperado)} que tocaba cobrar en el periodo</div>
   <div class="donut">${donut([{v:capi,c:'var(--cobra)'},{v:intr,c:'var(--compra)'},{v:falto,c:'#7A6F5C'}],pct)}<div class="lgd"><span><i style="background:var(--cobra)"></i>Capital ${money(capi)}</span><span><i style="background:var(--compra)"></i>Interés ${money(intr)}</span><span><i style="background:#7A6F5C"></i>Faltó ${money(falto)}</span></div></div></div>
  <div class="card" style="padding:4px 13px">
   <div class="ev"><span class="x"><b>Plata en la calle</b><span class="sub">Capital que falta por volver</span></span><b>${money(calle)}</b></div>
   <div class="ev"><span class="x"><b>Por cobrar en total</b><span class="sub">Capital + interés</span></span><b>${money(porCob)}</b></div>
   <div class="ev"><span class="x"><b>Préstamos activos</b></span><b>${la.length}</b></div>
   <button class="ev" data-a="goatr"><span class="x"><b>Clientes atrasados</b><span class="sub">${money(atr.reduce((s,x)=>s+x.s.atraso,0))}</span></span><span class="chip ${atr.length?'c-mal':'c-ok'}">${atr.length}</span></button>
   <div class="ev"><span class="x"><b>Entra los próximos 7 días</b></span><b>${money(nx7)}</b></div>
   <div class="ev"><span class="x"><b>Prestado nuevo · ${esc(lbl)}</b></span><b>${money(prest)}</b></div>
  </div>`;
  if(atr.length)h+=`<div class="sec">Más atrasados</div><div class="card" style="padding:4px 13px">${atr.slice(0,3).map(x=>`<button class="ev" data-a="cliente" data-v="${x.p.id}"><span class="ini" style="color:var(--badt)">${esc(initials(x.cl.nombre))}</span><span class="x"><b>${esc(x.cl.nombre)}</b><span class="sub">${x.s.lateDays} día(s) tarde</span></span><b class="bad">${money(x.s.atraso)}</b></button>`).join('')}</div>`;
  if(best.length)h+=`<div class="sec">Mejores pagadores</div><div class="card" style="padding:4px 13px">${best.map(x=>`<button class="ev" data-a="cliente" data-v="${x.p.id}"><span class="ini" style="color:var(--okt)">${esc(initials(x.cl.nombre))}</span><span class="x"><b>${esc(x.cl.nombre)}</b><span class="sub">${x.s.pagadas} de ${x.p.n} cuotas al día</span></span><span class="chip c-ok">Al día</span></button>`).join('')}</div>`;
  h+=`<button class="bigbtn a-ver" data-a="cierre">${ic('caja')}Cierre del día de hoy</button>`;
  return h;
}
function printReport(){
  const r=REP;if(!r)return;const c=cfg();
  $('#print').innerHTML=`<h2>${esc(c.nombre)} – Reporte de préstamos</h2><p>Del ${fdate(r.range[0])} al ${fdate(r.range[1])}</p>
  <table><tr><th>Concepto</th><th>Valor</th></tr><tr><td>Tocaba cobrar</td><td>${money(r.esperado)}</td></tr><tr><td>Cobrado</td><td>${money(r.cob)} (${r.pct} %)</td></tr><tr><td>· Capital</td><td>${money(r.capi)}</td></tr><tr><td>· Interés</td><td>${money(r.intr)}</td></tr><tr><td>Faltó</td><td>${money(r.falto)}</td></tr><tr><td>Prestado nuevo</td><td>${money(r.prest)}</td></tr><tr><td>Plata en la calle</td><td>${money(r.calle)}</td></tr><tr><td>Por cobrar en total</td><td>${money(r.porCob)}</td></tr><tr><td>Entra los próximos 7 días</td><td>${money(r.nx7)}</td></tr></table>
  <h3>Atrasados</h3><table>${r.atr.map(x=>`<tr><td>${esc(x.cl.nombre)}</td><td>${x.s.vencidas} cuota(s)</td><td>${x.s.lateDays} día(s)</td><td>${money(x.s.atraso)}</td></tr>`).join('')||'<tr><td>Nadie atrasado</td></tr>'}</table>
  <h3>Pagos del periodo</h3><table>${r.P.sort((a,b)=>a.fecha<b.fecha?-1:1).map(x=>{const p=S.items[x.prestamo];const cl=p&&S.items[p.cliente];return `<tr><td>${fdate(x.fecha)}</td><td>${esc(cl?cl.nombre:'')}</td><td>${esc(x.pago||'')}</td><td>${money(x.monto+(x.mora||0))}</td></tr>`}).join('')||'<tr><td>Sin pagos</td></tr>'}</table>
  <p style="margin-top:14px;font-size:9pt">Generado con la app Cobros y Agenda · NEXO PC</p>`;
  setTimeout(()=>window.print(),100);
}
/* ---- Cierre del día ---- */
function sheetCierre(){
  const t=today();const P=items('pago').filter(x=>x.fecha===t&&!x.cuaderno);const by={};let cob=0,intr=0;
  P.forEach(x=>{const m=x.monto+(x.mora||0);const k=x.pago||'Efectivo';by[k]=(by[k]||0)+m;cob+=m;const p=S.items[x.prestamo];intr+=(p?interesPart(p,x.monto):0)+(x.mora||0)});
  const PR=items('prestamo').filter(x=>x.inicio===t&&!x.cuaderno);const prest=PR.reduce((s,x)=>s+x.monto,0);
  const efeIn=by['Efectivo']||0,efeOut=PR.filter(x=>(x.pago||'Efectivo')==='Efectivo').reduce((s,x)=>s+x.monto,0);
  const last=items('cierre').filter(x=>x.fecha===t).sort((a,b)=>b.ts-a.ts)[0];const pend=cobrosOn(t).filter(x=>!x.paid);
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><h2>${ic('caja')}Cierre del día</h2>
  <div class="env" style="background:rgba(34,165,91,.12)"><div class="row"><b class="ok">Entró</b><b class="ok">+ ${money(cob)}</b></div>
   ${Object.entries(by).map(([k,v])=>`<div class="row sub"><span>${esc(k)}</span><span>${money(v)}</span></div>`).join('')||'<div class="sub">Aún no hay cobros hoy</div>'}
   ${cob?`<div class="sub" style="font-size:.72em;margin-top:3px">Capital ${money(cob-intr)} · interés ${money(intr)}</div>`:''}</div>
  <div class="env" style="background:rgba(59,123,246,.12)"><div class="row"><b style="color:var(--entt)">Salió (préstamos nuevos)</b><b>− ${money(prest)}</b></div>${PR.map(x=>`<div class="row sub"><span>${esc((S.items[x.cliente]||{}).nombre||'')}</span><span>${money(x.monto)}</span></div>`).join('')}</div>
  ${pend.length?`<div class="sub hoyc" style="margin:0 2px 8px">Faltan ${pend.length} cobro(s) de hoy: ${money(pend.reduce((s,x)=>s+x.amt,0))}</div>`:''}
  <div class="card"><div class="row"><span class="sub">En efectivo deberías tener de hoy</span><b>${money(efeIn-efeOut)}</b></div></div>
  ${last?`<div class="banner">${ic('check')}<span>Contaste ${money(last.contado)}${last.diff?` · diferencia ${last.diff>0?'+':'−'}${money(Math.abs(last.diff))}`:' · ¡cuadró perfecto!'}</span></div>`:''}
  <form id="fcie" data-esp="${efeIn-efeOut}"><label class="field"><span>¿Cuánto efectivo contaste?</span><input name="contado" inputmode="numeric" data-money="1"></label><button class="bigbtn a-ver" type="submit">Guardar cierre</button></form>
  <button class="bigbtn" data-a="close" style="color:var(--sub)">Cerrar</button></div>`;render();
}

/* ---- Más / Ajustes ---- */
function vMas(){
  const b=(a,ico,t,s,col='a-ver')=>`<button class="list-btn" data-a="${a}"><span class="act ${col}" style="width:42px;height:42px;padding:0;border-radius:12px">${ic(ico)}</span><span class="t"><b>${t}</b><span class="sub">${s}</span></span>${ic('right')}</button>`;
  const ps={on:'Activados',off:'Sin activar',noinst:'Instala la app para activarlos',nocfg:'Falta configurar el servidor',denied:'Bloqueados en Ajustes del iPhone',nosup:'Este iPhone no los permite (iOS 16.4+)'}[Push.status()];
  return `<div class="top"><button class="row" data-a="tab" data-v="inicio" style="gap:4px;min-height:44px">${ic('chev')}<h1 style="font-size:1.3em">Ajustes</h1></button></div>
  <div class="card">${b('avisos','bell','Avisos',ps,'a-ok')}${b('wzedit','editar','Ajustes del negocio','Las respuestas del asistente de inicio')}${b('colors','presta','Código de colores','Qué significa cada color')}</div>
  <div class="card">${b('security','face','PIN y Face ID',S.me.face?'Face ID activado':'Solo PIN')}${b('backup','caja','Copia de seguridad',S.me.lastBk?'Última: '+fdate(ymd(new Date(S.me.lastBk))):'Aún no has hecho copia')}</div>
  <div class="card">${b('reset','trash','Empezar de cero',S.me.demo?'Borra los datos de prueba':'Borra todo en este celular','a-mal')}</div>
  <p class="sub" style="text-align:center;margin-top:10px">Versión ${APP_VERSION} · Hecho por NEXO PC</p>`;
}
function showColors(){
  const L=[['a-presta','presta','AZUL · Prestar','Nuevo préstamo o entrega'],['a-cobra','coin','TURQUESA · Cobrar','Cuota, varias cuotas o abono'],['a-recor','bolt','ROSA · Citas y recordatorios','Cita rápida, aviso, tarea'],['a-enviar','send','MORADO · Enviar','WhatsApp, recibo, reporte PDF'],['a-ok','check','VERDE · Listo','Pagó, hecho, avisos activos'],['a-mal','alert','ROJO · Atraso o borrar','Algo no está bien'],['a-ver','editar','GRIS · Ver o editar','Cambiar datos, contar, ajustar']];
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><h2>Un color = una acción</h2>${L.map(([cl,i,t,s])=>`<div class="lg"><span class="act ${cl}">${ic(i)}</span><div><b>${t}</b><span class="sub">${s}</span></div></div>`).join('')}<button class="bigbtn a-ver" data-a="close">Entendido</button></div>`;render()}

/* =============== avisos (Web Push con el servidor de NEXO PC) =============== */
const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const ub64u=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
const Push={
  url:()=>(S.me.pushUrl||PUSH_URL||'').replace(/\/+$/,''),key:()=>S.me.pushKey||PUSH_KEY,
  supported:()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window,
  status(){if(!this.url()||!this.key())return 'nocfg';if(!standalone())return 'noinst';if(!this.supported())return 'nosup';
    if(Notification.permission==='denied')return 'denied';return S.me.push&&S.me.push.on&&Notification.permission==='granted'?'on':'off'},
  async enable(){
    if(!this.url()||!this.key()){toast('Falta configurar el servidor de avisos (NEXO PC)');return false}
    if(!standalone()){toast('Primero instala la app en la pantalla de inicio');return false}
    if(!this.supported()){toast('Este iPhone necesita iOS 16.4 o más nuevo');return false}
    const perm=await Notification.requestPermission();
    if(perm!=='granted'){toast('No diste permiso. Se activa en Ajustes del iPhone → Notificaciones');render();return false}
    try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
      if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:ub64u(this.key())});
      const r=crypto.getRandomValues(new Uint8Array(18));S.me.push={on:true,id:(S.me.push&&S.me.push.id)||uid()+uid(),secret:(S.me.push&&S.me.push.secret)||b64u(r)};persist();
      await this.sync(sub);toast('¡Avisos activados!');render();return true}
    catch(e){S.me.pushDiag='Error al activar: '+(e.message||e);persist();toast(S.me.pushDiag);return false}
  },
  async sync(sub,strict){
    if(!S.me.push||!S.me.push.on||!this.url()||!this.supported()||Notification.permission!=='granted'){if(strict)throw new Error('permiso '+(window.Notification?Notification.permission:'no disponible'));return}
    if(!sub){const reg=await navigator.serviceWorker.ready;sub=await reg.pushManager.getSubscription()}
    if(!sub){if(strict)throw new Error('no hay suscripción: toca Activar avisos otra vez');return}
    const r=await fetch(this.url()+'/api/sync',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:S.me.push.id,secret:S.me.push.secret,sub:sub.toJSON(),items:buildSchedule()})});
    if(r.ok){S.me.pushAt=Date.now();persist()}else if(strict){const j=await r.json().catch(()=>({}));throw new Error('servidor '+r.status+(j.error?' '+j.error:''))}
  },
  later(){clearTimeout(this._t);this._t=setTimeout(()=>this.sync().catch(()=>{}),2500)},
  async test(){let paso='sincronizar';try{await this.sync(null,true);paso='enviar';const r=await fetch(this.url()+'/api/test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:S.me.push.id,secret:S.me.push.secret})});const j=await r.json().catch(()=>({}));
    S.me.pushDiag=`Prueba: HTTP ${r.status}${j.status?' · Apple '+j.status:''}${j.error?' · '+j.error:''}`;persist();toast(r.ok?'Enviado: te llega en unos segundos. Bloquea la pantalla para verlo':'Falló: '+S.me.pushDiag);if(layer)sheetAvisos()}
    catch(e){S.me.pushDiag=`Error al ${paso}: ${e.message||e}`;persist();toast(S.me.pushDiag);if(layer)sheetAvisos()}}
};
function summaryText(d,isToday){
  const D=dayData(d);const parts=[];const pl=(n,a,b)=>`${n} ${n===1?a:b}`;
  if(D.cob.length)parts.push(pl(D.cob.length,'cobro','cobros'));if(D.cit.length)parts.push(pl(D.cit.length,'cita','citas'));
  if(D.tar.length)parts.push(pl(D.tar.length,'tarea','tareas'));if(D.ent.length)parts.push(pl(D.ent.length,'entrega','entregas'));
  if(isToday){const n=loansActive().filter(x=>x.s.atraso>.5).length;if(n)parts.push(pl(n,'atrasado','atrasados'))}
  const c=cfg()||{};if((c.avisos||[]).includes('Préstamo por terminar')){const n=loansActive().filter(x=>{const left=x.s.cuotas.filter(q=>q.st!=='p'&&q.st!=='t');return left.length===2&&left[0].f===d}).length;if(n)parts.push(pl(n,'préstamo por terminar','préstamos por terminar'))}
  const first=D.ev.find(e=>e.hora);
  let txt=parts.length?parts.join(' · '):'No tienes nada en la agenda 🙌';
  if(first)txt+=`. Primero: ${fmtH(first.hora)} ${evTitle(first)}`;
  const cumple=D.ev.filter(e=>e.tipo==='cumple');if(cumple.length)txt+=`. 🎂 ${cumple.map(evTitle).join(', ')}`;
  return txt}
function buildSchedule(){
  const c=cfg();if(!c)return [];const av=c.avisos||[];const out=[];const now=Date.now();
  for(let k=0;k<21;k++){const d=addDays(today(),k);
    if(av.includes('Resumen de la mañana')){const at=atTime(d,c.horaAviso||'07:00');if(at>now)out.push({at,title:k===0?'Tu día de hoy':'Tu día · '+fdate(d),body:summaryText(d,k===0),tag:'dia-'+d})}
    if(av.includes('Citas y tareas'))for(const e of eventsOn(d)){if(!e.hora||e.aviso<0||isDone(e,d))continue;const at=atTime(d,e.hora)-(e.aviso||0)*60e3;
      if(at>now)out.push({at,title:(e.aviso===0?'Ahora: ':e.aviso>=1440?'Mañana: ':`En ${e.aviso>=60?e.aviso/60+' h':e.aviso+' min'}: `)+evTitle(e),body:[fmtH(e.hora),e.nota].filter(Boolean).join(' · '),tag:'ev-'+e.id+'-'+d})}}
  return out.sort((a,b)=>a.at-b.at).slice(0,250)}
let lastAlert=Date.now();
function inAppAlerts(){if(document.hidden||!cfg())return;const now=Date.now();
  for(const x of buildScheduleWindow(lastAlert,now))toast('⏰ '+x.title+(x.body?' · '+x.body:''));lastAlert=now}
function buildScheduleWindow(a,b){if(Push.status()==='on')return [];const out=[];const d=today();
  for(const e of eventsOn(d)){if(!e.hora||e.aviso<0||isDone(e,d))continue;const at=atTime(d,e.hora)-(e.aviso||0)*60e3;if(at>a&&at<=b)out.push({title:evTitle(e),body:fmtH(e.hora)})}return out}
function sheetAvisos(){
  const st=Push.status();const msg={on:'Los avisos están activos. Te llega el resumen de la mañana y el aviso antes de cada cita, aunque la app esté cerrada.',off:'Toca el botón y luego Permitir.',noinst:'Primero instala la app: Safari → Compartir → Agregar a pantalla de inicio. Luego ábrela desde el ícono.',nocfg:'NEXO PC tiene que configurar el servidor de avisos (abajo, en Configuración técnica).',denied:'Los bloqueaste. Ve a Ajustes del iPhone → Notificaciones → Cobros y actívalos.',nosup:'Este iPhone necesita iOS 16.4 o más nuevo para los avisos.'}[st];
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><h2>${ic('bell')}Avisos</h2>
  <div class="card"><div class="row"><b>Estado</b><span class="chip ${st==='on'?'c-ok':'c-hoy'}">${st==='on'?'Activos':'Inactivos'}</span></div><div class="sub" style="margin-top:6px">${msg}</div>${S.me.pushAt?`<div class="sub" style="margin-top:4px">Última sincronización: ${ago(S.me.pushAt)}</div>`:''}<div class="sub" style="margin-top:4px">Diagnóstico: ${esc(st)} · permiso ${window.Notification?Notification.permission:'—'} · ${standalone()?'instalada':'en navegador'}${S.me.pushDiag?' · '+esc(S.me.pushDiag):''}</div></div>
  ${st==='on'?`<button class="bigbtn a-ver" data-a="pushon">${ic('refresh')}Volver a activar avisos</button>`:''}
  ${st==='off'?`<button class="bigbtn a-ok" data-a="pushon">${ic('bell')}Activar avisos</button>`:''}
  ${st==='on'?`<button class="bigbtn a-ok" data-a="pushtest">${ic('bell')}Enviarme un aviso de prueba</button>`:''}
  <div class="sub" style="margin:10px 2px">Qué avisos y a qué hora se cambian en Ajustes del negocio → Tus avisos.</div>
  <details style="margin-top:6px"><summary class="sub" style="min-height:40px;padding:8px 2px">Configuración técnica (NEXO PC)</summary>
   <form id="fpcfg"><label class="field"><span>Dirección del servidor</span><input name="url" value="${esc(Push.url())}" placeholder="https://avisos.tu-cuenta.workers.dev" autocapitalize="off"></label><label class="field"><span>Clave pública (VAPID)</span><input name="key" value="${esc(Push.key())}" autocapitalize="off"></label><button class="bigbtn a-ver" type="submit">Guardar</button></form></details>
  <button class="bigbtn" data-a="close" style="color:var(--sub)">Cerrar</button></div>`;render()}
function ago(ts){const m=Math.round((Date.now()-ts)/60e3);return m<1?'ahora':m<60?`hace ${m} min`:m<1440?`hace ${Math.round(m/60)} h`:`hace ${Math.round(m/1440)} d`}

/* ícono con la letra del negocio (Safari lo toma al "Agregar a pantalla de inicio") */
function setTouchIcon(L){const link=$('#touchicon');if(!link)return;if(!L){link.href='icons/apple-180.png';return}
  const cv=document.createElement('canvas');cv.width=cv.height=180;const x=cv.getContext('2d');
  const g=x.createRadialGradient(45,27,10,70,60,190);g.addColorStop(0,'#3D3018');g.addColorStop(.55,'#16120B');g.addColorStop(1,'#070605');x.fillStyle=g;x.fillRect(0,0,180,180);
  const gold=x.createLinearGradient(30,30,150,150);gold.addColorStop(0,'#FFF1C2');gold.addColorStop(.45,'#F1C75B');gold.addColorStop(1,'#A8741A');
  x.strokeStyle=gold;x.lineWidth=4;x.beginPath();x.arc(90,90,68,0,Math.PI*2);x.stroke();x.lineWidth=1.5;x.globalAlpha=.55;x.beginPath();x.arc(90,90,58,0,Math.PI*2);x.stroke();x.globalAlpha=1;
  x.lineWidth=4;x.lineCap='round';[[90,16,90,25],[164,90,155,90],[90,164,90,155],[16,90,25,90]].forEach(([a,b,c,d])=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()});
  x.fillStyle=gold;x.font='600 82px Georgia, "Times New Roman", serif';x.textAlign='center';x.textBaseline='middle';x.fillText(L.toUpperCase(),90,96);
  link.href=cv.toDataURL('image/png')}

/* =============== otras hojas =============== */
function sheetPlus(){layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><h2 style="justify-content:center">¿Qué vas a hacer?</h2><div class="acts">
  <button class="act a-presta" data-a="prestar">${ic('presta')}Prestar</button><button class="act a-cobra" data-a="cobrarpick">${ic('coin')}Cobrar</button>
  <button class="act a-recor" data-a="quick" data-t="recordar">${ic('bell')}Recordatorio</button><button class="act a-recor" data-a="quick">${ic('cita')}Cita rápida</button></div></div>`;render()}
/*@F*/
