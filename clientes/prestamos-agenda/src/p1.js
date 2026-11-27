/* =============== Cobros y Agenda · NEXO PC =============== */
const APP_VERSION='1.0.2';
/* Servidor de avisos (Cloudflare Worker). Se llenan al publicar; también se pueden poner en Ajustes → Avisos. */
const PUSH_URL='https://avisos-cobros.nexopc2.workers.dev';
const PUSH_KEY='BDByMhR_ZXytK35XVfBvh4x4ct1BRnoc4fTryHHrqYWY4F5cBo_8orkzzrwy8Lw9PbOz4CQjwmNsPgKYfAtkuSA';
/*@A*/
const DOWL=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const cap=s=>String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1);
const fdateW=s=>{const d=pd(s);return `${cap(DOWL[d.getDay()])} ${d.getDate()} de ${MESL[d.getMonth()].toLowerCase()}`};
const fmtH=h=>{if(!h)return 'Todo el día';const [H,M]=h.split(':').map(Number);return `${H%12||12}:${pad2(M)} ${H<12?'a. m.':'p. m.'}`};
const fmtHs=h=>{if(!h)return '';const [H,M]=h.split(':').map(Number);return `${H%12||12}:${pad2(M)}`};
const fmtHc=h=>{const [H,M]=h.split(':').map(Number);return `${H%12||12}${M?':'+pad2(M):''} ${H<12?'a. m.':'p. m.'}`};
const atTime=(d,h)=>{const [y,m,dd]=d.split('-').map(Number);const [H,M]=(h||'00:00').split(':').map(Number);return new Date(y,m-1,dd,H,M).getTime()};
const dayWord=d=>d===today()?'hoy':d===addDays(today(),1)?'mañana':fdate(d);
const nowHM=()=>{const n=new Date();return pad2(n.getHours())+':'+pad2(n.getMinutes())};
const pi=n=>`<svg class="pi"><use href="#${n}"/></svg>`;
const logoSvg=()=>`<svg viewBox="0 0 100 100"><use href="#logo"/></svg>`;
let UNDO=null;
function toast(m,undo){const t=$('#toast');UNDO=undo||null;t.innerHTML=esc(m)+(undo?'<button data-a="undo">Deshacer</button>':'');t.classList.toggle('undo',!!undo);t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>{t.classList.remove('show');t.classList.remove('undo');UNDO=null},undo?4500:2300)}

/* =============== estado =============== */
const KEY='cobros-agenda-v1';
let mem=null;
function load(){try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}return mem}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){mem=S}}
let S=load()||{v:1,items:{},me:{}};
S.items=S.items||{};S.me=S.me||{};
const cfg=()=>S.items.cfg||null;
const items=k=>Object.values(S.items).filter(x=>x&&x.k===k&&!x.del);
let LSC={};
function put(it,silent){it.ts=Date.now();S.items[it.id]=it;LSC={};persist();if(typeof Push!=='undefined')Push.later();if(!silent)render()}
function del(id){const it=S.items[id];if(!it)return;it.del=true;put(it,true);render()}
const meName=()=>{const c=cfg();return (c&&c.duena)||'de nuevo'};
const canEdit=()=>true;
const Cloud={push(){},badge(){return ''}};
const lsOf=p=>LSC[p.id]||(LSC[p.id]=loanStatus(p));

/* =============== plantillas de la agenda =============== */
const TPL=[
 {id:'reunion',l:'Reunión',i:'team',g:'g-team',cat:'cita'},
 {id:'llamada',l:'Llamada',i:'phone',g:'g-phone',cat:'cita'},
 {id:'cliente',l:'Cliente',i:'brief',g:'g-brief',cat:'cita'},
 {id:'informe',l:'Informe',i:'doc',g:'g-doc',cat:'tarea'},
 {id:'almuerzo',l:'Almuerzo',i:'food',g:'g-food',cat:'cita'},
 {id:'medico',l:'Médico',i:'med',g:'g-med',cat:'cita'},
 {id:'banco',l:'Banco',i:'bank',g:'g-bank',cat:'cita'},
 {id:'pagar',l:'Pagar',i:'bill',g:'g-bill',cat:'tarea'},
 {id:'cumple',l:'Cumpleaños',i:'cake',g:'g-cake',cat:'cita'},
 {id:'cobro',l:'Cobro',i:'coin',g:'g-coin',cat:'tarea'},
 {id:'recordar',l:'Recordar',i:'bell',g:'g-bell',cat:'tarea'},
 {id:'otro',l:'Otro',i:'dots',g:'g-more',cat:'tarea'},
];
const TPL_ENT={id:'entrega',l:'Entrega',i:'hand',g:'g-hand',cat:'entrega'};
const tplOf=id=>id==='entrega'?TPL_ENT:(TPL.find(t=>t.id===id)||TPL[11]);
const evTitle=e=>e.titulo||tplOf(e.tipo).l;
const AVISOS=[[-1,'Sin aviso'],[0,'A la hora'],[15,'15 min antes'],[30,'30 min antes'],[60,'1 hora antes'],[1440,'1 día antes']];
const REPS=[['no','No se repite'],['lab','Lunes a viernes'],['sem','Cada semana'],['mes','Cada mes'],['ano','Cada año']];
const REPL={lab:'lunes a viernes',sem:'cada semana',mes:'cada mes',ano:'cada año'};
function occurs(e,d){
  if(d<e.fecha)return false;if(e.skip&&e.skip[d])return false;
  switch(e.rep||'no'){case 'no':return d===e.fecha;case 'lab':{const w=pd(d).getDay();return w>=1&&w<=5}
    case 'sem':return pd(d).getDay()===pd(e.fecha).getDay();case 'mes':return d.slice(8)===e.fecha.slice(8);case 'ano':return d.slice(5)===e.fecha.slice(5)}
  return false}
const eventsOn=d=>items('ev').filter(e=>occurs(e,d)).sort((a,b)=>(a.hora||'')<(b.hora||'')?-1:(a.hora||'')>(b.hora||'')?1:0);
const isDone=(e,d)=>!!(e.hechos&&e.hechos[d]);
function cobrosOn(d){const out=[];
  for(const p of items('prestamo')){const cl=S.items[p.cliente];if(!cl||cl.del)continue;
    p.fechas.forEach((f,i)=>{if(f!==d)return;const s=lsOf(p);const c=s.cuotas[i];if(!c)return;const paid=c.st==='p'||c.st==='t';
      out.push({p,cl,c,s,paid,amt:paid?0:(c.rem||c.v)})})}
  return out.sort((a,b)=>a.paid-b.paid||a.cl.nombre.localeCompare(b.cl.nombre))}
function dayData(d){const ev=eventsOn(d);const cat=k=>ev.filter(e=>tplOf(e.tipo).cat===k);
  return {d,ev,cob:cobrosOn(d),cit:cat('cita'),tar:cat('tarea'),ent:cat('entrega')}}

/* =============== cálculos de préstamos (de la app de oro) =============== */
/*@B*/
/*@C*/

/* =============== asistente de inicio (lo responde la clienta) =============== */
const HORAS=['5:00 a. m.','6:00 a. m.','7:00 a. m.','8:00 a. m.','9:00 a. m.','10:00 a. m.'];
const WZ=[
 {s:'Tu negocio',qs:[
  {id:'nombre',t:'¿Qué nombre sale en la app?',type:'text',ph:'Ej: Cobros Martha',req:1,hint:'Va arriba en la app, en los recibos y en los reportes.'},
  {id:'duena',t:'¿Cómo te llamas?',type:'text',ph:'Ej: Martha',hint:'Para saludarte.'},
  {id:'letra',t:'¿Tamaño de la letra?',opts:['Normal*','Grande']},
 ]},
 {s:'Tus préstamos',qs:[
  {id:'frecs',t:'¿Cada cuánto te pagan?',multi:1,opts:['Diario','Semanal','Quincenal','Mensual']},
  {id:'interesTipo',t:'¿Cómo cobras el interés?',opts:['Un % fijo sobre lo prestado*','Un % cada mes'],ex:'Fijo: prestas $500.000 al 20 % → te pagan $600.000 en cuotas.'},
  {id:'interesPct',t:'¿Qué % usas casi siempre?',type:'num',ph:'20'},
  {id:'moraTipo',t:'Si un cliente se atrasa, ¿cobras mora?',opts:['No*','Sí, un % de la cuota','Sí, un valor fijo por día'],other:'¿Cuánto? (ej. 5 o 2.000)'},
  {id:'domingos',t:'¿Qué días cobras normalmente?',opts:['Todos los días','Sin domingos*','Sin domingos ni festivos'],hint:'Es lo que viene marcado; en cada préstamo se puede cambiar.'},
 ]},
 {s:'La plata',qs:[
  {id:'pagos',t:'¿Por dónde recibes y entregas la plata?',multi:1,opts:['Efectivo','Nequi','Daviplata','Bancolombia','Otro banco']},
  {id:'tono',t:'¿Cómo suena el mensaje de cobro por WhatsApp?',opts:['Amable*','Formal','Directo'],ex:'Amable: "Buenos días, Luis 😊 Le recuerdo su cuota de $25.000 de hoy. ¡Muchas gracias!"'},
 ]},
 {s:'Tus avisos',qs:[
  {id:'avisos',t:'¿Qué avisos quieres en el celular?',multi:1,opts:['Resumen de la mañana','Citas y tareas','Préstamo por terminar']},
  {id:'horaAviso',t:'¿A qué hora el resumen de la mañana?',opts:HORAS.slice(1,5).map(h=>h==='7:00 a. m.'?h+'*':h)},
 ]},
 {s:'Tu agenda',qs:[
  {id:'vista',t:'¿Qué ves primero al abrir la agenda?',opts:['Día*','Semana','Mes']},
  {id:'hIni',t:'¿A qué hora empieza tu día?',opts:['6 a. m.','7 a. m.','8 a. m.*','9 a. m.'],hint:'Así la cita rápida te muestra solo tus horas.'},
  {id:'hFin',t:'¿A qué hora termina?',opts:['4 p. m.','5 p. m.*','6 p. m.','7 p. m.']},
  {id:'top',t:'¿Qué citas pones más? (escoge hasta 4)',multi:1,max:4,opts:TPL.map(t=>t.l),hint:'Salen de primeras en la cita rápida.'},
 ]},
 {s:'Tus clientes',qs:[
  {id:'datosCliente',t:'¿Qué datos le pides a cada cliente?',multi:1,opts:['Celular','Cédula','Dirección','Barrio','Fiador','Notas'],hint:'De la cédula solo se guarda el número.'},
 ]},
 {s:'Tu seguridad',qs:[
  {id:'pin',t:'Crea un PIN de 4 números para entrar',type:'pin',ph:'••••',req:1,hint:'Después puedes activar Face ID en Ajustes.'},
 ]},
];
const DEF={letra:'Normal',frecs:['Diario','Semanal'],interesTipo:'Un % fijo sobre lo prestado',interesPct:20,moraTipo:'No',domingos:'Sin domingos',pagos:['Efectivo','Nequi'],tono:'Amable',
  avisos:['Resumen de la mañana','Citas y tareas','Préstamo por terminar'],horaAviso:'7:00 a. m.',vista:'Día',hIni:'8 a. m.',hFin:'5 p. m.',top:['Reunión','Llamada','Banco','Recordar'],datosCliente:['Celular','Cédula','Barrio']};
const h24=s=>{const m=String(s||'').match(/(\d+)(?::(\d+))?\s*([ap])/i);if(!m)return 8;let H=+m[1]%12;if(m[3].toLowerCase()==='p')H+=12;return H};
let W=null;
function startWizard(edit){const c=cfg();const a={};if(edit&&c)Object.assign(a,c.ans||{});W={i:0,a,edit:!!edit};S.me.view='wz';layer='';render()}
function wzAnswered(q){const v=W.a[q.id];return Array.isArray(v)?v.length>0:v!==undefined&&String(v).trim()!==''}
function renderWizard(){
  const st=WZ[W.i];const pct=Math.round(W.i/WZ.length*100);
  let h=`<div class="wz"><div class="top"><div><div class="sub">Paso ${W.i+1} de ${WZ.length}${W.edit?' · Ajustes':''}</div><h2>${esc(st.s)}</h2></div>${W.edit?`<button class="iconbtn" data-a="wzclose" aria-label="Cerrar">✕</button>`:''}</div><div class="prog"><i style="width:${pct}%"></i></div>`;
  if(W.i===0&&!W.edit)h+=`<div class="banner">${ic('editar')}<span>Con estas preguntas la app queda a tu medida. Lo que no sepas, déjalo como viene: después se cambia en Ajustes.</span></div>`;
  for(const q of st.qs){
    if(q.id==='pin'&&W.edit&&S.me.pin)continue;
    const v=W.a[q.id];
    h+=`<div class="wq"><b>${esc(q.t)}${q.req?' <span class="bad">*</span>':''}</b>${q.hint?`<div class="hint">${esc(q.hint)}</div>`:''}`;
    if(q.opts){h+=`<div class="chips">`;for(const o of q.opts){const rec=o.endsWith('*'),lab=o.replace('*','');
        const on=q.multi?(v||[]).includes(lab):v===lab;h+=`<button data-a="wzopt" data-q="${q.id}" data-v="${esc(lab)}" class="${on?'on':''}">${esc(lab)}${rec?'<small>· sugerido</small>':''}</button>`}
      h+=`</div>`;if(q.other)h+=`<input class="tin" data-wo="${q.id}" inputmode="decimal" placeholder="${esc(q.other)}" value="${esc(W.a[q.id+'Val']||'')}">`}
    else if(q.type==='pin')h+=`<input class="tin" data-w="${q.id}" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" placeholder="${q.ph}" value="${esc(v||'')}" style="letter-spacing:.5em;font-size:1.4em;text-align:center">`;
    else h+=`<input class="tin" data-w="${q.id}" ${q.type==='num'?'inputmode="decimal"':''} placeholder="${esc(q.ph||'')}" value="${esc(v??'')}">`;
    if(q.ex)h+=`<div class="ex">${esc(q.ex)}</div>`;
    h+=`</div>`;
  }
  h+=`</div><div class="wznav"><div><button class="a-ver" data-a="wzback">${W.i?'Atrás':(W.edit?'Cancelar':'Inicio')}</button><button class="a-compra" data-a="wznext">${W.i===WZ.length-1?'Terminar':'Siguiente'}</button></div></div>`;
  return h;
}
function wzNext(){
  const st=WZ[W.i];
  for(const q of st.qs){if(q.id==='pin'&&W.edit&&S.me.pin)continue;
    if(q.req&&!wzAnswered(q)){toast('Falta: '+q.t);return}
    if(q.id==='pin'&&!/^\d{4}$/.test(W.a.pin||'')){toast('El PIN debe tener 4 números');return}}
  if(W.i<WZ.length-1){W.i++;render();scrollTo(0,0);return}
  finishWizard();
}
function finishWizard(){
  const a=W.a,g=k=>{const v=a[k];return (Array.isArray(v)?v.length:v!==undefined&&v!=='')?v:DEF[k]};
  const old=cfg()||{};
  const c=Object.assign({},old,{id:'cfg',k:'cfg',ans:Object.assign({},a),nombre:String(a.nombre||'Mi negocio').trim(),duena:String(a.duena||'').trim(),letra:g('letra'),
    frecs:g('frecs'),interesTipo:g('interesTipo'),interesPct:num(g('interesPct'))||20,moraTipo:g('moraTipo'),moraVal:a.moraTipoVal||'',domingos:g('domingos'),
    pagos:g('pagos'),tono:g('tono'),avisos:g('avisos'),horaAviso:pad2(h24(g('horaAviso')))+':00',vista:g('vista'),hIni:h24(g('hIni')),hFin:h24(g('hFin')),
    top:g('top').map(l=>(TPL.find(t=>t.l===l)||{}).id).filter(Boolean),datosCliente:g('datosCliente')});
  if(a.pin&&/^\d{4}$/.test(a.pin))S.me.pin=a.pin;
  delete c.ans.pin;
  const first=!old.nombre;
  put(c,true);S.me.view='inicio';S.me.unlocked=true;S.me.demo=false;W=null;persist();
  if(first)sheetListo();else{render();toast('Ajustes guardados')}
}
function sheetListo(){
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><div class="empty" style="padding-bottom:6px"><span class="appi xl" style="margin:0 auto 12px">${logoSvg()}</span><b>¡Tu app está lista!</b>Tres cosas para empezar:</div>
  <div class="lg"><span class="act a-recor">${ic('bolt')}</span><div><b>Cita rápida</b><span class="sub">Qué → cuándo → Guardar. Sin escribir.</span></div></div>
  <div class="lg"><span class="act a-presta">${ic('presta')}</span><div><b>Botón + dorado</b><span class="sub">Prestar, cobrar, recordatorio o cita.</span></div></div>
  <div class="lg"><span class="act a-ok">${ic('bell')}</span><div><b>Avisos</b><span class="sub">El resumen de la mañana y 15 min antes de cada cita.</span></div></div>
  ${Push.status()==='off'?`<button class="bigbtn a-ok" data-a="pushon">${ic('bell')}Activar avisos ahora</button>`:''}
  <button class="bigbtn a-ver" data-a="close">Empezar</button></div>`;render()}

/* =============== datos de prueba =============== */
function loadDemo(){
  S={v:1,items:{},me:{pin:'1234',demo:true,view:'inicio',unlocked:true,push:S.me.push,pushUrl:S.me.pushUrl,pushKey:S.me.pushKey,iconL:S.me.iconL}};
  const t=today();const D=n=>addDays(t,n);
  const c={id:'cfg',k:'cfg',ans:{},nombre:'Cobros Martha',duena:'Martha',letra:'Normal',frecs:['Diario','Semanal'],interesTipo:'Un % fijo sobre lo prestado',interesPct:20,moraTipo:'No',moraVal:'',domingos:'Sin domingos',
    pagos:['Efectivo','Nequi'],tono:'Amable',avisos:DEF.avisos,horaAviso:'07:00',vista:'Día',hIni:8,hFin:17,top:['reunion','llamada','banco','recordar'],datosCliente:['Celular','Cédula','Barrio']};
  c.ans={nombre:c.nombre,duena:'Martha',interesPct:20,frecs:c.frecs,pagos:c.pagos,tono:'Amable',letra:'Normal',avisos:c.avisos,vista:'Día',hIni:'8 a. m.',hFin:'5 p. m.',top:['Reunión','Llamada','Banco','Recordar'],datosCliente:c.datosCliente,domingos:'Sin domingos'};
  const add=o=>{o.id=o.id||uid();o.ts=Date.now()-Math.random()*1e5;S.items[o.id]=o;return o};
  add(c);
  const mk=(nombre,cel,barrio,monto,pct,frec,n,startOff,payPlan)=>{const cl=add({k:'cliente',nombre,cel,cedula:String(1077400000+Math.floor(Math.random()*99999)),barrio,dir:'',notas:''});
    const ini=D(startOff);const fechas=makeDates(addDays(ini,frec==='Diario'?1:7),frec,n,'sindom');const total=Math.round(monto*(1+pct/100));
    const p=add({k:'prestamo',cliente:cl.id,monto,pct,tipo:'fijo',frec,dias:'sindom',n,total,cuota:Math.round(total/n),inicio:ini,fechas,previas:0,pago:'Efectivo'});
    const sch=loanSched(p);payPlan(sch).forEach(([i,fecha,m])=>add({k:'pago',prestamo:p.id,fecha,monto:m,alloc:[{i,m}],pago:Math.random()<.7?'Efectivo':'Nequi'}));return p};
  const upTo=s=>s.filter(c=>c.f<t);
  mk('Ana Mosquera','3105550101','Yesca Grande',500000,20,'Diario',24,-10,s=>upTo(s).map(c=>[c.i,c.f,c.v]));
  mk('Jorge Palacios','3105550142','Kennedy',800000,20,'Diario',24,-6,s=>upTo(s).map(c=>[c.i,c.f,c.v]));
  mk('Rosa Perea','3105550177','Cristo Rey',500000,20,'Diario',24,-27,s=>upTo(s).map(c=>[c.i,c.f,c.v]));
  mk('Diana Valencia','3105550188','La Aurora',1000000,20,'Semanal',10,-22,s=>upTo(s).map(c=>[c.i,c.f,c.v]));
  mk('Luis Rentería','3105550199','Pandeyuca',600000,20,'Diario',24,-12,s=>upTo(s).filter((c,i,a)=>i<a.length-2).map(c=>[c.i,c.f,c.v]));
  mk('Mario Torres','3105550111','Niño Jesús',800000,20,'Diario',20,-5,s=>upTo(s).map(c=>[c.i,c.f,c.v]));
  const mon=addDays(t,-((pd(t).getDay()+6)%7)),thu=addDays(mon,3);
  const ev=(tipo,titulo,fecha,hora,o={})=>add(Object.assign({k:'ev',tipo,titulo,fecha,hora,aviso:15,rep:'no',nota:'',hechos:{}},o));
  ev('reunion','Reunión de equipo',mon,'09:00',{rep:'sem',nota:'Sala 2'});ev('reunion','Reunión de equipo',thu,'09:00',{rep:'sem',nota:'Sala 2'});
  ev('banco','Banco',t,'11:00',{nota:'Llevar extractos'});ev('informe','Informe de ventas',t,'16:30');
  ev('llamada','Llamar al proveedor',D(1),'15:00');ev('pagar','Pagar la luz',D(1),'');ev('medico','Médico',D(2),'09:00');
  ev('cumple','Cumpleaños de mamá',D(3),'',{rep:'ano',aviso:-1});ev('almuerzo','Almuerzo con Claudia',D(-1),'12:30',{hechos:{[D(-1)]:1}});
  ev('entrega','Entregar a Carlos Mena',t,'14:00',{nota:'$ 500.000'});
  persist();layer='';render();toast('Modo prueba: datos de ejemplo (PIN 1234)');
}

/* =============== fechas y bloqueo (de la app de oro) =============== */
/*@D*/
