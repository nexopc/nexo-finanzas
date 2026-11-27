
/* =============== render principal =============== */
let layer='';
function applyTheme(){const c=cfg()||{};document.documentElement.className='auto'+(c.letra==='Grande'?' grande':'');
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#0F0D0A'}
function render(){
  applyTheme();LSC={};const app=$('#app');
  if(!cfg()&&S.me.view!=='wz'){app.innerHTML=renderWelcome();$('#layer').innerHTML=layer;return}
  if(S.me.view==='wz'&&W){app.innerHTML=renderWizard();$('#layer').innerHTML=layer;enhanceLayer();return}
  if(S.me.view==='wz'&&!W)S.me.view='inicio';
  if(needsLock()){app.innerHTML=renderLock();$('#layer').innerHTML='';return}
  const v=S.me.view||'inicio';let h;
  switch(v){case 'agenda':h=vAgenda();break;case 'prestamos':h=vPrestamos();break;case 'cliente':h=vCliente();break;case 'reportes':h=vReportes();break;case 'mas':h=vMas();break;default:h=vInicio()}
  app.innerHTML=h+tabs(v);
  $('#layer').innerHTML=layer;enhanceLayer();
}
function tabs(v){const t=(id,ico,lab)=>`<button class="${v===id||(id==='prestamos'&&v==='cliente')?'on':''}" data-a="tab" data-v="${id}">${ic(ico)}${lab}</button>`;
  return `<nav class="tabs">${t('inicio','home','Inicio')}${t('agenda','cal','Agenda')}<button class="plus" data-a="plus" aria-label="Nueva acción">${ic('plus')}</button>${t('prestamos','list','Préstamos')}${t('reportes','chart','Reportes')}</nav>`}
const standalone=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
function renderWelcome(){
  const L=S.me.iconL||'';
  return `<div class="lock"><span class="appi xl">${logoSvg()}</span><h1 style="font-size:1.6em;letter-spacing:-.02em">Cobros y Agenda</h1>
  <p class="sub" style="max-width:320px;margin:8px 0 24px;font-size:.92em">Tu agenda del día, tus cobros y tus recordatorios en un solo lugar.</p>
  <button class="bigbtn a-compra" data-a="wzstart">${ic('editar')}Empezar (asistente de inicio)</button>
  <button class="bigbtn a-ver" data-a="demo">${ic('refresh')}Probar con datos de ejemplo</button>
  ${standalone()?'':`<div class="inst"><b>Instálala primero en el iPhone</b><br>1. En Safari toca <b>Compartir</b> (el cuadrito con la flecha).<br>2. Toca <b>Agregar a pantalla de inicio</b>.<br>3. Ábrela desde el ícono y empieza ahí: los datos y los avisos viven en la app instalada.
   <div style="margin-top:10px"><b>Letra del ícono</b> (opcional, antes de instalar):</div>
   <div class="chs" style="margin-top:6px">${['','M','C','A','L','R'].map(x=>`<button class="ch${L===x?' on':''}" data-a="iconl" data-v="${x}">${x||'✓'}</button>`).join('')}<input class="ch" maxlength="1" placeholder="Otra" data-a3="iconlx" style="width:70px" value="${esc(L&&!['M','C','A','L','R'].includes(L)?L:'')}"></div></div>`}
  <p class="sub" style="margin-top:18px">Hecho por NEXO PC · v${APP_VERSION}</p></div>`}

/* ---- Inicio = mi día ---- */
const nextTxt=(arr,d)=>{if(!arr.length)return 'Nada';const p=arr.filter(e=>!isDone(e,d));if(!p.length)return '✓ Todo hecho';const e=p[0];return (e.hora?fmtHs(e.hora)+' · ':'')+evTitle(e)};
function typeCards(D,f){
  const d=D.d;const got=D.cob.reduce((s,x)=>s+Math.min(x.c.got||0,x.c.v),0),tot=D.cob.reduce((s,x)=>s+x.c.v,0);
  const card=(k,icon,g,lab,n,sub)=>`<button class="ty ${k}${f===k?' on':''}" data-a="dayf" data-v="${k}"><span class="t"><svg class="i tile ${g}"><use href="#${icon}"/></svg>${lab}</span><span class="n">${n}</span><span class="d">${esc(sub)}</span></button>`;
  return `<div class="types">${card('cob','coin','g-coin','Cobros',D.cob.length,D.cob.length?`${money(got)} de ${money(tot)}`:'Sin cobros')}${card('cit','cita','g-team','Citas',D.cit.length,nextTxt(D.cit,d))}${card('tar','task','g-task','Tareas',D.tar.length,D.tar.length?`${D.tar.filter(e=>isDone(e,d)).length} de ${D.tar.length} hechas`:'Nada')}${card('ent','hand','g-hand','Entregas',D.ent.length,nextTxt(D.ent,d))}</div>`}
function evRow(e,d){const t=tplOf(e.tipo);const dn=isDone(e,d);
  const sub=[e.nota||'',e.rep&&e.rep!=='no'?REPL[e.rep]:'',e.hora&&e.aviso>=0?'🔔':''].filter(Boolean).join(' · ')||t.l;
  return `<div class="ev${dn?' done':''}"><div class="h">${e.hora?fmtH(e.hora).replace(' ','<br>'):'Todo<br>el día'}</div><svg class="i tl tile ${t.g}"><use href="#${t.i}"/></svg><button class="x" data-a="evopen" data-v="${e.id}" data-d="${d}"><b>${esc(evTitle(e))}</b><span class="sub">${esc(sub)}</span></button><button class="ck${dn?' on':''}" data-a="evdone" data-v="${e.id}" data-d="${d}" aria-label="${dn?'Marcar pendiente':'Marcar hecho'}">${dn?'✓':''}</button></div>`}
function cobRow(x){const late=x.c.st==='n',pend=x.c.st==='pend';
  const right=x.paid?'<span class="chip c-ok">Pagó</span>':x.c.f>today()?`<span class="chip c-gris">${money(x.amt)}</span>`:`<button class="act a-cobra mini" data-a="cobrar1" data-v="${x.p.id}" data-i="${x.c.i}">${ic('check','width:16px;height:16px')}Cobrar</button>`;
  return `<div class="ev"><button class="ini" data-a="cliente" data-v="${x.p.id}" style="${late?'color:var(--badt)':''}">${esc(initials(x.cl.nombre))}</button><button class="x" data-a="cliente" data-v="${x.p.id}"><b>${esc(x.cl.nombre)}</b><span class="sub">Cuota ${x.c.i+1} de ${x.p.n} · ${money(x.c.v)}${x.c.st==='ab'?' · falta '+money(x.c.falta):''}${late?' · atrasada':pend?' · pendiente esta semana':''}${x.paid&&x.c.pf&&x.c.pf!==x.c.f&&x.c.pf!=='0000-00-00'?' · pagó el '+fdate(x.c.pf):''}</span></button>${right}</div>`}
function dayList(D,f){
  const d=D.d;const empty=t=>`<div class="empty" style="padding:14px 8px"><b>${t}</b>Toca <b>Cita rápida</b> para agregar algo en segundos.</div>`;
  const cd=D.cob.length&&pd(d).getDay()===((cfg()||{}).diaCobro??1)?`<div class="cobroday"><svg class="i tile g-coin"><use href="#coin"/></svg><div><b>Día de cobro</b><span class="sub">${D.cob.length} cliente(s) · ${money(D.cob.reduce((s,x)=>s+x.c.v,0))}${D.cob.some(x=>x.paid)?' · cobrado '+money(D.cob.reduce((s,x)=>s+Math.min(x.c.got||0,x.c.v),0)):''}</span></div></div>`:'';
  if(f==='cob'){const pend=D.cob.filter(x=>!x.paid);return cd+`<div class="sec">Cobros <span class="sub">${pend.length?`faltan ${pend.length} · ${money(pend.reduce((s,x)=>s+x.amt,0))}`:D.cob.length?'✓ todos pagaron':''}</span></div><div class="card" style="padding:4px 13px">${D.cob.map(cobRow).join('')||'<div class="empty" style="padding:14px"><b>No hay cobros este día</b></div>'}</div>`}
  const list=f==='cit'?D.cit:f==='tar'?D.tar:f==='ent'?D.ent:D.ev;
  let h=cd+`<div class="sec">${f?({cit:'Citas',tar:'Tareas',ent:'Entregas'})[f]:'Por hora'} <span class="sub">${list.length?`${list.filter(e=>!isDone(e,d)).length} pendiente(s)`:''}</span></div><div class="card" style="padding:4px 13px">`;
  if(!f&&D.cob.length){const pend=D.cob.filter(x=>!x.paid);h+=`<div class="ev"><div class="h">Todo<br>el día</div><svg class="i tl tile g-coin"><use href="#coin"/></svg><button class="x" data-a="dayf" data-v="cob"><b>${D.cob.length} cobro${D.cob.length>1?'s':''}</b><span class="sub">${pend.length?`Faltan ${pend.length} · ${money(pend.reduce((s,x)=>s+x.amt,0))}`:'✓ Todos pagaron'}</span></button>${ic('right')}</div>`}
  h+=list.map(e=>evRow(e,d)).join('');
  if(!list.length&&!(!f&&D.cob.length))h+=empty(f?'Nada aquí':'Día libre');
  return h+`</div>`}
function vInicio(){
  const c=cfg();const t=today();const D=dayData(t);const d0=pd(t);const f=S.me.dayf||'';
  const la=loansActive();const atr=la.filter(x=>x.s.atraso>.5).sort((a,b)=>b.s.lateDays-a.s.lateDays);
  let h=`<div class="top"><div><div class="sub">${cap(DOWL[d0.getDay()])} ${d0.getDate()} de ${MESL[d0.getMonth()].toLowerCase()}</div><h1>Hola, ${esc(c.duena||'')}${c.duena?'':'hoy'}</h1></div><div style="display:flex;gap:8px;align-items:center"><button class="iconbtn" data-a="tab" data-v="mas" aria-label="Ajustes">${ic('gear')}</button><span class="appi av">${logoSvg()}</span></div></div>`;
  if(S.me.demo)h+=`<div class="banner">${ic('refresh')}<span><b>Modo prueba.</b> Datos de ejemplo. Bórralos en ⚙ → Empezar de cero.</span></div>`;
  const ps=Push.status();
  if(ps==='off')h+=`<button class="banner" data-a="pushon" style="width:100%;text-align:left">${ic('bell')}<span><b>Activa los avisos</b> para que te llegue el resumen de la mañana y cada cita. <u>Activar</u></span></button>`;
  else if(ps==='noinst')h+=`<div class="banner">${ic('bell')}<span>Para recibir avisos, instala la app: Safari → Compartir → <b>Agregar a pantalla de inicio</b>.</span></div>`;
  const nItems=Object.keys(S.items).length;
  if(!S.me.demo&&nItems>5&&(!S.me.lastBk||Date.now()-S.me.lastBk>7*864e5))h+=`<button class="banner" data-a="backup" style="width:100%;text-align:left">${ic('caja')}<span><b>Haz tu copia de la semana.</b> Tus datos viven solo en este iPhone. <u>Copiar ahora</u></span></button>`;
  for(const F of festUpcoming())h+=`<button class="banner" data-a="festsheet" data-d="${F.d}" style="width:100%;text-align:left;background:rgba(249,115,22,.14);border-color:rgba(249,115,22,.5)">🎌<span><b>${F.d===t?'Hoy':cap(fdate(F.d))} es festivo</b> y tienes ${F.cs.length} cobro(s). <u>Decidir qué hago</u></span></button>`;
  h+=typeCards(D,f);
  h+=`<div class="quick2"><button class="act a-recor" data-a="quick">${ic('bolt')}Cita rápida</button><button class="act a-cobra" data-a="cobrarpick">${ic('coin')}Cobrar</button></div>`;
  h+=dayList(D,f);
  const pen=la.filter(x=>x.s.pendSem>.5&&x.s.atraso<=.5);
  if(pen.length)h+=`<div class="sec">Pendientes de esta semana <span class="chip c-hoy">${pen.length} · ${money(pen.reduce((s,x)=>s+x.s.pendSem,0))}</span></div><div class="card" style="padding:4px 13px">${pen.map(x=>{const c=x.s.cuotas.find(q=>q.st==='pend');return `<div class="ev"><button class="ini" data-a="cliente" data-v="${x.p.id}" style="color:var(--hoyt)">${esc(initials(x.cl.nombre))}</button><button class="x" data-a="cliente" data-v="${x.p.id}"><b>${esc(x.cl.nombre)}</b><span class="sub">Cuota del ${fdate(c.f)} · ${money(c.rem)} · plazo hasta el ${fdate(addDays(c.f,graceOf(x.p)))}</span></button><button class="act a-cobra mini" data-a="cobrar1" data-v="${x.p.id}" data-i="${c.i}">${ic('check','width:16px;height:16px')}Cobrar</button></div>`}).join('')}</div>`;
  if(atr.length)h+=`<div class="sec">Atrasados <span class="chip c-mal">${atr.length} · ${money(atr.reduce((s,x)=>s+x.s.atraso,0))}</span></div><div class="card" style="padding:4px 13px">${atr.map(x=>`<div class="ev"><button class="ini" data-a="cliente" data-v="${x.p.id}" style="color:var(--badt)">${esc(initials(x.cl.nombre))}</button><button class="x" data-a="cliente" data-v="${x.p.id}"><b>${esc(x.cl.nombre)}</b><span class="sub">${x.s.vencidas} cuota(s) · ${x.s.lateDays} día(s) tarde · ${money(x.s.atraso)}</span></button><button class="act a-enviar mini" data-a="wa" data-k="atraso" data-v="${x.p.id}">${ic('send','width:16px;height:16px')}Avisar</button></div>`).join('')}</div>`;
  return h;
}

/* ---- Agenda: día, semana y mes ---- */
const AM={'Día':'dia','Semana':'semana','Mes':'mes'};
function vAgenda(){
  const m=S.me.am||AM[(cfg()||{}).vista]||'dia';const d=S.me.ad||today();const dt=pd(d);
  let label='';
  if(m==='dia')label=(d===today()?'Hoy · ':'')+fdateW(d);
  else if(m==='semana'){const w0=addDays(d,-((dt.getDay()+6)%7)),w6=addDays(w0,6);label=`${pd(w0).getDate()} ${MES[pd(w0).getMonth()]} – ${pd(w6).getDate()} ${MES[pd(w6).getMonth()]}`}
  else label=`${MESL[dt.getMonth()]} ${dt.getFullYear()}`;
  let h=`<div class="top"><h1>Agenda</h1><div style="display:flex;gap:7px">${d!==today()?`<button class="act a-ver mini" data-a="agoto" data-v="${today()}">Hoy</button>`:''}<button class="act a-recor mini" data-a="quick" data-d="${d}">${ic('bolt','width:15px;height:15px')}Cita</button></div></div>
  <div class="seg">${[['dia','Día'],['semana','Semana'],['mes','Mes']].map(([k,l])=>`<button data-a="am" data-v="${k}" class="${m===k?'on':''}">${l}</button>`).join('')}</div>
  <div class="navrow"><button class="iconbtn" data-a="anav" data-v="-1" aria-label="Anterior">${ic('chev')}</button><b>${esc(label)}</b><button class="iconbtn" data-a="anav" data-v="1" aria-label="Siguiente">${ic('right')}</button></div>`;
  if(m==='dia'){const D=dayData(d);const f=S.me.dayf||'';h+=typeCards(D,f)+dayList(D,f)}
  else if(m==='semana')h+=weekView(d);
  else h+=monthView(d);
  return h;
}
function weekView(d){
  const w0=addDays(d,-((pd(d).getDay()+6)%7));let h=`<div class="card" style="padding:2px 13px">`;
  for(let k=0;k<7;k++){const x=addDays(w0,k);const D=dayData(x);const dt=pd(x);const pend=D.cob.filter(c=>!c.paid);const late=pend.filter(c=>c.c.st==='n');
    let p='';
    if(D.cob.length)p+=`<span class="pill p-cob">${pi('coin')}${D.cob.length} cobro${D.cob.length>1?'s':''}${!pend.length?' ✓':''}</span>`;
    if(late.length)p+=`<span class="pill p-mal">${pi('alert')}${late.length} sin pagar</span>`;if(isHoliday(x))p+=`<span class="pill p-gr">🎌 Festivo</span>`;
    D.ev.slice(0,5).forEach(e=>{const t=tplOf(e.tipo);p+=`<span class="pill ${t.cat==='entrega'?'p-ent':t.cat==='tarea'?'p-tar':'p-rec'}${isDone(e,x)?' dn':''}">${pi(t.i)}${esc(evTitle(e))}${e.hora?' '+fmtHs(e.hora):''}</span>`});
    if(D.ev.length>5)p+=`<span class="pill p-gr">+${D.ev.length-5} más</span>`;
    const isC=D.cob.length&&dt.getDay()===((cfg()||{}).diaCobro??1);if(isC)p=p.replace(/^<span class="pill p-cob">([\s\S]*?)<\/span>/,`<span class="pill p-cob" style="font-size:.74em">${pi('coin')}Día de cobro · ${D.cob.length} · ${money(D.cob.reduce((s,q)=>s+q.c.v,0))}${!pend.length?' ✓':''}</span>`);
    h+=`<button class="wd${x===today()?' today':''}${isC?' cobro':''}" data-a="agoto" data-v="${x}" data-m="dia"><span class="dd"><small>${x===today()?'Hoy':DOW[dt.getDay()]}</small><b>${dt.getDate()}</b></span><span class="es">${p||`<span class="sub">${isHoliday(x)?'Festivo · libre':'Libre'}</span>`}</span></button>`}
  return h+`</div><div class="sub" style="text-align:center;margin-top:-2px">Toca un día para verlo completo</div>`}
function monthView(d){
  const [y,m]=d.split('-').map(Number);const first=new Date(y,m-1,1);const days=new Date(y,m,0).getDate();const off=(first.getDay()+6)%7;const t=today();
  let h=`<div class="card"><div class="mon">${['L','M','M','J','V','S','D'].map(x=>`<span class="wh">${x}</span>`).join('')}`;
  for(let i=0;i<off;i++)h+='<span></span>';
  for(let k=1;k<=days;k++){const x=`${y}-${pad2(m)}-${pad2(k)}`;const D=dayData(x);const dots=[];
    if(D.cob.length)dots.push(D.cob.some(c=>c.c.st==='n')?'dm':'dc');const mc=D.cob.length&&pd(x).getDay()===((cfg()||{}).diaCobro??1);if(D.cit.length)dots.push('dr');if(D.tar.length)dots.push('dt');if(D.ent.length)dots.push('de');
    h+=`<button class="md${x===t?' t':''}${x===d?' s':''}${isHoliday(x)?' fe':''}${mc?' mc':''}" data-a="agsel" data-v="${x}">${k}<span class="mdots">${dots.map(c=>`<i class="${c}"></i>`).join('')}</span></button>`}
  h+=`</div><div class="leg"><span><i style="background:var(--cobra)"></i>Cobros</span><span><i style="background:var(--recor)"></i>Citas</span><span><i style="background:#C026D3"></i>Tareas</span><span><i style="background:var(--presta)"></i>Entregas</span><span><i style="background:var(--mal)"></i>Sin pagar</span></div></div>`;
  const D=dayData(d);
  h+=`<div class="row" style="margin:12px 2px 0"><b style="font-size:.9em">${fdateW(d)}</b><button class="sub" data-a="agoto" data-v="${d}" data-m="dia" style="color:var(--gold2);min-height:36px;font-weight:700">Ver día ›</button></div>`;
  return h+dayList(D,'').replace('<div class="sec">Por hora','<div class="sec" style="display:none">');
}

/* ---- Hoja de un evento ---- */
function sheetEv(id,d){
  const e=S.items[id];if(!e)return;const t=tplOf(e.tipo);const dn=isDone(e,d);const rep=e.rep&&e.rep!=='no';
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div>
  <div class="row" style="justify-content:flex-start;gap:12px;margin-bottom:12px"><svg class="i tile ${t.g}" style="width:54px;height:54px;padding:12px;border-radius:16px"><use href="#${t.i}"/></svg><div style="min-width:0"><div class="mid">${esc(evTitle(e))}</div><div class="sub">${cap(dayWord(d))} · ${e.hora?fmtH(e.hora):'Todo el día'}${rep?' · '+REPL[e.rep]:''}</div>${e.nota?`<div class="sub">${esc(e.nota)}</div>`:''}<div class="sub">${e.hora&&e.aviso>=0?'🔔 '+(e.aviso===0?'A la hora':AVISOS.find(a=>a[0]===e.aviso)[1]+' y a la hora'):'Sin aviso'}</div></div></div>
  <button class="bigbtn ${dn?'a-ver':'a-ok'}" data-a="evdone" data-v="${id}" data-d="${d}" data-close="1">${ic('check')}${dn?'Marcar como pendiente':'Listo, ya lo hice'}</button>
  <div class="qlab">Mover ${rep?'(solo este día)':''}</div>
  <div class="chs">${e.hora?`<button class="ch" data-a="evmove" data-v="${id}" data-d="${d}" data-m="h1">+1 hora</button>`:''}<button class="ch" data-a="evmove" data-v="${id}" data-d="${d}" data-m="d1">Al otro día</button><button class="ch" data-a="evmove" data-v="${id}" data-d="${d}" data-m="d7">En una semana</button><button class="ch" data-a="evpickdate" data-v="${id}" data-d="${d}">${ic('cal','width:15px;height:15px')} Otro día</button></div>
  <div class="f2" style="margin-top:14px"><button class="act a-ver" data-a="evedit" data-v="${id}">${ic('editar')}Editar</button>${e.tipo==='entrega'&&e.prestamo&&S.items[e.prestamo]?`<button class="act a-presta" data-a="cliente" data-v="${e.prestamo}">${ic('list')}Ver préstamo</button>`:`<button class="act a-mal" data-a="evdel" data-v="${id}" data-d="${d}" data-m="${rep?'one':'all'}">${ic('trash')}${rep?'Quitar este día':'Borrar'}</button>`}</div>
  ${rep?`<button class="bigbtn" data-a="evdel" data-v="${id}" data-d="${d}" data-m="all" style="color:var(--badt);font-size:.9em">Borrar todas las repeticiones</button>`:''}
  <button class="bigbtn" data-a="close" style="color:var(--sub)">Cerrar</button></div>`;render();
}
function evMove(id,d,mode,nd){
  const e=S.items[id];let newD=d,newH=e.hora;
  if(mode==='h1'){const [H,M]=e.hora.split(':').map(Number);newH=pad2(Math.min(23,H+1))+':'+pad2(M)}
  else if(mode==='d1')newD=addDays(d,1);else if(mode==='d7')newD=addDays(d,7);else if(mode==='date'){if(!nd)return;newD=nd}
  if(!e.rep||e.rep==='no'){const hd=Object.assign({},e.hechos);if(hd[d]){delete hd[d]}e.hechos=hd;e.fecha=newD;e.hora=newH;put(e,true)}
  else{e.skip=Object.assign({},e.skip,{[d]:1});put(e,true);put({id:uid(),k:'ev',tipo:e.tipo,titulo:e.titulo,nota:e.nota,fecha:newD,hora:newH,aviso:e.aviso,rep:'no',hechos:{},from:e.id},true)}
  layer='';render();toast(`Movido a ${dayWord(newD)}${newH?' · '+fmtH(newH):''}`)}

/* ---- Cita rápida: qué → cuándo → guardar ---- */
let Q=null;
function defHour(){const c=cfg()||{};const ini=c.hIni??8,fin=c.hFin??17;let H=new Date().getHours()+1;if(H<ini)H=ini;if(H>fin)return null;return pad2(H)+':00'}
function favDay(e){if(!e.hora)return today();return e.hora>nowHM()?today():addDays(today(),1)}
function favs(){const m={};for(const e of items('ev')){if(e.tipo==='entrega'||e.tipo==='cumple')continue;const k=e.tipo+'|'+(e.titulo||'')+'|'+(e.hora||'');(m[k]=m[k]||{n:0,e}).n+=(e.rep&&e.rep!=='no')?2:1}
  return Object.values(m).filter(x=>x.n>=2).sort((a,b)=>b.n-a.n).slice(0,4).map(x=>x.e)}
function sheetQuick(o){o=o||{};const c=cfg()||{};const dh=defHour();
  Q=Object.assign({tipo:'',d:dh?today():addDays(today(),1),h:dh||pad2(c.hIni??8)+':00',titulo:'',nota:'',aviso:15,rep:'no',more:false,id:null},o);
  if(o.d&&o.d!==today()&&o.h===undefined)Q.h=pad2(c.hIni??8)+':00';
  renderQuick(true)}
function renderQuick(first){
  const c=cfg()||{};const t=Q.tipo?tplOf(Q.tipo):null;const top=c.top||[];
  const order=[...top,...TPL.map(x=>x.id).filter(id=>!top.includes(id))].map(tplOf);
  const fv=Q.id?[]:favs();const T=today();
  const days=[0,1,2,3,4].map(n=>addDays(T,n));const ini=c.hIni??8,fin=c.hFin??17;const hours=[];for(let H=ini;H<=fin;H++){hours.push(pad2(H)+':00');if(H<fin)hours.push(pad2(H)+':30')}
  const n1=new Date(Date.now()+60*60e3);const inHour=pad2(n1.getHours())+':'+(n1.getMinutes()<30?'00':'30');
  const dayLab=x=>x===T?'Hoy':x===addDays(T,1)?'Mañana':cap(DOW[pd(x).getDay()])+' '+pd(x).getDate();
  const customDay=!days.includes(Q.d),customH=Q.h&&!hours.includes(Q.h);
  const avTxt=Q.h&&Q.aviso>=0?(Q.aviso===0?' · te aviso a la hora':` · te aviso ${AVISOS.find(a=>a[0]===Q.aviso)[1]} y a la hora`):'';
  layer=`<div class="dim" data-a="close"></div><div class="sheet" id="qs"><div class="grab"></div>
  <div class="row" style="padding-right:48px"><h2 style="margin:0;padding-right:0">${Q.id?'Editar':'Cita rápida'}</h2>${Q.id?'':`<span class="badge3">${ic('bolt')}3 toques</span>`}</div>
  ${fv.length?`<div class="qlab">Las de siempre <em>1 toque</em></div><div class="fav">${fv.map(e=>{const tt=tplOf(e.tipo);const dd=favDay(e);return `<button class="fv" data-a="favgo" data-v="${e.id}"><svg class="i tile ${tt.g}"><use href="#${tt.i}"/></svg><span><b>${esc(evTitle(e))}</b><small>${cap(dayWord(dd))}${e.hora?' · '+fmtH(e.hora):''}</small></span></button>`}).join('')}</div>`:''}
  <div class="qlab">1 · ¿Qué es?</div><div class="qg">${order.map(x=>`<button class="qt${Q.tipo===x.id?' on':''}" data-a="qtipo" data-v="${x.id}"><svg class="i tile ${x.g}"><use href="#${x.i}"/></svg>${x.l}</button>`).join('')}</div>
  <div class="qlab">2 · ¿Cuándo?</div>
  <div class="chs">${days.map(x=>`<button class="ch${Q.d===x?' on':''}" data-a="qd" data-v="${x}">${dayLab(x)}</button>`).join('')}<button class="ch${customDay?' on':''}" data-a="qpickdate">${ic('cal','width:15px;height:15px')} ${customDay?dayLab(Q.d):'Otro día'}</button></div>
  <div class="chs" style="margin-top:6px"><button class="ch" data-a="qh" data-v="${inHour}">En 1 hora</button>${hours.map(x=>`<button class="ch${Q.h===x?' on':''}" data-a="qh" data-v="${x}">${fmtHc(x)}</button>`).join('')}<button class="ch${!Q.h?' on':''}" data-a="qh" data-v="">Todo el día</button><button class="ch${customH?' on':''}" data-a="qpicktime">🕐 ${customH?fmtH(Q.h):'Otra hora'}</button></div>
  <label class="opt">${ic('mic')}<input id="qtit" data-q="titulo" autocomplete="off" placeholder="${t?esc(t.l)+': con quién o qué (opcional)':'Nombre o nota (opcional)'}" value="${esc(Q.titulo)}"></label>
  <button class="morebtn" data-a="qmore">${Q.more?'▾':'▸'} Aviso: <b>${Q.h?AVISOS.find(a=>a[0]===Q.aviso)[1]:'en el resumen de la mañana'}</b> · <b>${REPS.find(r=>r[0]===Q.rep)[1]}</b></button>
  ${Q.more?`<div class="chs">${AVISOS.map(([k,l])=>`<button class="ch${Q.aviso===k?' on':''}" data-a="qav" data-v="${k}">${l}</button>`).join('')}</div><div class="chs" style="margin-top:6px">${REPS.map(([k,l])=>`<button class="ch${Q.rep===k?' on':''}" data-a="qrep" data-v="${k}">${l}</button>`).join('')}</div><label class="field" style="margin-top:8px"><span>Nota</span><input id="qnota" data-q="nota" value="${esc(Q.nota)}" placeholder="Ej: llevar extractos"></label>`:''}
  <button class="savebtn${t?'':' off'}" data-a="qsave">${Q.id?'Guardar cambios':(t?'3 · Guardar '+t.l.toLowerCase():'Toca qué es (paso 1)')}<small>${cap(dayWord(Q.d))} · ${Q.h?fmtH(Q.h):'todo el día'}${avTxt}</small></button></div>`;
  if(first){render();return}
  const qs=$('#qs');const st=qs?qs.scrollTop:0;$('#layer').innerHTML=layer;enhanceLayer();const q2=$('#qs');if(q2)q2.scrollTop=st;
}
function saveQuick(){
  if(!Q.tipo){toast('Primero toca qué es');return}
  const base=Q.id&&S.items[Q.id]?S.items[Q.id]:{id:uid(),k:'ev',hechos:{}};
  Object.assign(base,{tipo:Q.tipo,titulo:(Q.titulo||'').trim()||tplOf(Q.tipo).l,nota:(Q.nota||'').trim(),fecha:Q.d,hora:Q.h||'',aviso:Q.aviso,rep:Q.rep});
  put(base,true);const isNew=!Q.id;Q=null;layer='';render();
  toast(`Listo: ${evTitle(base)} · ${dayWord(base.fecha)}${base.hora?' '+fmtH(base.hora):''}`,isNew?()=>{base.del=true;put(base)}:null);
}
