
/* =============== 1.1.0 · ventanas que siempre se pueden cerrar =============== */
function isDirty(){
  if(Q&&!Q.id&&(Q.tipo||(Q.titulo||'').trim()||(Q.nota||'').trim()))return true;
  return [...document.querySelectorAll('#layer .sheet input,#layer .sheet textarea,#layer .sheet select')].some(i=>{
    if(i.type==='hidden'||i.type==='file'||i.dataset.nodirty)return false;
    if(i.type==='checkbox'||i.type==='radio')return i.checked!==i.defaultChecked;
    if(i.tagName==='SELECT')return [...i.options].some(o=>o.selected!==o.defaultSelected);
    return i.value!==i.defaultValue})||!!(document.querySelector('#fp')&&$('#fp')._touched);
}
function closeLayer(){layer='';Q=null;PK=null;renderPicker();render()}
function requestClose(){if(isDirty())showChoice('¿Salir sin guardar?','Lo que escribiste en esta ventana se pierde.',[{l:'Sí, salir',c:'a-mal',f:closeLayer},{l:'No, seguir aquí',c:'a-ver',f:()=>{}}]);else closeLayer()}
let CH=null;
function showChoice(title,text,opts){CH=opts;$('#confirm').innerHTML=`<div class="cf-dim" data-a="chno"></div><div class="cf"><b>${esc(title)}</b>${text?`<p class="sub">${esc(text)}</p>`:''}${opts.map((o,i)=>`<button class="bigbtn ${o.c||'a-ver'}" data-a="chpick" data-v="${i}">${esc(o.l)}</button>`).join('')}</div>`}
function closeChoice(){CH=null;$('#confirm').innerHTML=''}
/* después de cada render: ✕ en cada ventana, fechas y horas con nuestro selector */
let PKN=0;
function enhanceLayer(){
  document.querySelectorAll('#layer .sheet').forEach(sh=>{if(!sh.querySelector(':scope > .xclose')){const b=document.createElement('button');b.className='xclose';b.dataset.a='close';b.setAttribute('aria-label','Cerrar');b.innerHTML='✕';sh.prepend(b)}});
  document.querySelectorAll('#app input[type=date],#app input[type=time],#layer input[type=date],#layer input[type=time]').forEach(inp=>{
    const kind=inp.type==='date'?'date':'time';if(!inp.id)inp.id='pk'+(++PKN);inp.type='hidden';inp.dataset.pk=kind;
    const b=document.createElement('button');b.type='button';b.className='pkbtn';b.dataset.a='pkopen';b.dataset.for=inp.id;b.dataset.kind=kind;
    b.innerHTML=pkLabel(kind,inp.value);inp.after(b)});
}
const pkLabel=(k,v)=>k==='date'?(v?`${ic('cal','width:16px;height:16px')} ${cap(dayWord(v))}${v!==today()&&v!==addDays(today(),1)?'':' · '+fdate(v)}`:`${ic('cal','width:16px;height:16px')} Escoger fecha`):(v?`🕐 ${fmtH(v)}`:'🕐 Escoger hora');
/* deslizar hacia abajo para cerrar */
let SW=null;
document.addEventListener('touchstart',e=>{const sh=e.target.closest('#layer .sheet');if(!sh||e.target.closest('input,textarea,select,.qg,.fav,.chs'))return;if(sh.scrollTop>2)return;SW={sh,y:e.touches[0].clientY,dy:0}},{passive:true});
document.addEventListener('touchmove',e=>{if(!SW)return;SW.dy=e.touches[0].clientY-SW.y;if(SW.dy>0){SW.sh.style.transform=`translateY(${SW.dy}px)`;SW.sh.style.transition='none'}},{passive:true});
document.addEventListener('touchend',()=>{if(!SW)return;const {sh,dy}=SW;SW=null;sh.style.transition='transform .2s';if(dy>110){sh.style.transform='';requestClose()}else sh.style.transform=''});

/* =============== selector de fecha (calendario) y de hora (botones) =============== */
let PK=null;
function openPicker(kind,value,title,cb){PK={kind,v:value||'',m:(value||today()).slice(0,7),title,cb};if(kind==='time'&&!PK.v)PK.v='';renderPicker()}
function nextWd(wd,from){let d=addDays(from||today(),1);while(pd(d).getDay()!==wd)d=addDays(d,1);return d}
function renderPicker(){
  const el=$('#picker');if(!el)return;if(!PK){el.innerHTML='';return}
  let h=`<div class="pk-dim" data-a="pkclose"></div><div class="pk"><div class="row" style="margin-bottom:8px"><b>${esc(PK.title||(PK.kind==='date'?'Escoge el día':'Escoge la hora'))}</b><button class="xclose" style="position:static" data-a="pkclose" aria-label="Cerrar">✕</button></div>`;
  if(PK.kind==='date'){
    const wd=(cfg()||{}).diaCobro??1;const t=today();
    h+=`<div class="chs" style="margin-bottom:10px"><button class="ch" data-a="pkd" data-v="${t}">Hoy</button><button class="ch" data-a="pkd" data-v="${addDays(t,1)}">Mañana</button><button class="ch" data-a="pkd" data-v="${nextWd(wd)}">Próximo ${DOWL[wd]}</button><button class="ch" data-a="pkd" data-v="${addDays(t,7)}">En una semana</button></div>`;
    const [y,m]=PK.m.split('-').map(Number);const first=new Date(y,m-1,1);const days=new Date(y,m,0).getDate();const off=(first.getDay()+6)%7;
    h+=`<div class="navrow"><button class="iconbtn" data-a="pkm" data-v="-1" aria-label="Mes anterior">${ic('chev')}</button><b>${MESL[m-1]} ${y}</b><button class="iconbtn" data-a="pkm" data-v="1" aria-label="Mes siguiente">${ic('right')}</button></div><div class="mon">${['L','M','M','J','V','S','D'].map(x=>`<span class="wh">${x}</span>`).join('')}`;
    for(let i=0;i<off;i++)h+='<span></span>';
    for(let k=1;k<=days;k++){const x=`${y}-${pad2(m)}-${pad2(k)}`;h+=`<button class="md${x===t?' t':''}${x===PK.v?' s':''}${isHoliday(x)||pd(x).getDay()===0?' fe':''}" data-a="pkd" data-v="${x}">${k}${isHoliday(x)?'<span class="mdots"><i class="dm"></i></span>':''}</button>`}
    h+=`</div><div class="sub" style="margin-top:8px">En rojo: domingos y festivos de Colombia.</div>`;
  }else{
    const v=PK.v||'08:00';const [H,M]=v.split(':').map(Number);
    h+=`<div class="big" style="text-align:center;margin:2px 0 10px">${fmtH(v)}</div><div class="qlab" style="margin-top:0">Hora</div><div class="pkgrid">${Array.from({length:18},(_,i)=>i+5).map(x=>`<button class="ch${x===H?' on':''}" data-a="pkh" data-v="${x}">${x%12||12} ${x<12?'a. m.':'p. m.'}</button>`).join('')}</div>
    <div class="qlab">Minutos</div><div class="pkgrid">${[0,5,10,15,20,25,30,35,40,45,50,55].map(x=>`<button class="ch${x===M?' on':''}" data-a="pkmin" data-v="${x}">:${pad2(x)}</button>`).join('')}</div>
    <button class="bigbtn a-compra" data-a="pkok">Listo · ${fmtH(v)}</button>`;
  }
  el.innerHTML=h+'</div>';
}
function pkDone(v){const cb=PK&&PK.cb;PK=null;renderPicker();if(cb)cb(v)}
function pkInput(id){return v=>{const inp=document.getElementById(id);if(!inp)return;inp.value=v;const b=document.querySelector(`[data-for="${id}"]`);if(b)b.innerHTML=pkLabel(inp.dataset.pk,v);
  inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}))}}

/* =============== préstamos: frecuencia, día de cobro, festivos, fechas a mano =============== */
const graceOf=p=>p.frec==='Semanal'?6:0;
const frecTxt=p=>p.frec==='Semanal'?'cada '+DOWL[p.wd??pd(p.fechas[0]).getDay()]:p.frec==='A mano'?'fechas a mano':String(p.frec||'').toLowerCase();
const FRECS=['Semanal','Diario','Quincenal','Mensual','A mano'];
const defN=fr=>fr==='Semanal'||fr==='A mano'?((cfg()||{}).semanas||8):fr==='Diario'?24:fr==='Quincenal'?6:4;
function firstFor(fr,wd,base){base=base||today();return fr==='Semanal'||fr==='A mano'?nextWd(wd,base):fr==='Diario'?addDays(base,1):fr==='Quincenal'?addDays(base,15):(()=>{const d=pd(base);d.setMonth(d.getMonth()+1);return ymd(d)})()}
function baseDates(first,fr,n,dias){
  if(fr==='Diario')return makeDates(first,'Diario',n,dias);
  if(fr==='Semanal'||fr==='A mano'){const o=[];for(let k=0;k<n;k++)o.push(addDays(first,7*k));return o}
  return makeDates(first,fr,n,'todos');
}
const prevWork=d=>{let x=addDays(d,-1);while(pd(x).getDay()===0||isHoliday(x))x=addDays(x,-1);return x};
const nextWork=d=>{let x=addDays(d,1);while(pd(x).getDay()===0||isHoliday(x))x=addDays(x,1);return x};
const festApply=(d,ch)=>ch==='sig'?nextWork(d):ch==='ant'?prevWork(d):d;
function stepDate(p,d){return p.frec==='Diario'?(()=>{let x=addDays(d,1);while(!(p.dias==='todos'||(p.dias==='sindom'?pd(x).getDay()!==0:!isOff(x))))x=addDays(x,1);return x})():p.frec==='Quincenal'?addDays(d,15):p.frec==='Mensual'?(()=>{const x=pd(d);x.setMonth(x.getMonth()+1);return ymd(x)})():addDays(d,7)}

function sheetPrestar(){
  const c=cfg();const fr0=(c.frecs||[]).includes('Semanal')||!(c.frecs||[]).length?'Semanal':c.frecs[0];const wd=c.diaCobro??1;const dc=c.datosCliente||[];const dd=diasDef();
  const frs=[...new Set([...(c.frecs&&c.frecs.length?c.frecs:['Semanal']),'Semanal','A mano'])].sort((a,b)=>FRECS.indexOf(a)-FRECS.indexOf(b));
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><h2 style="color:var(--entt)">${ic('presta')}Nuevo préstamo</h2><form id="fp">
  <div class="card"><div class="step"><em>1</em>¿A quién le prestas?</div>
   <label class="field"><span>Nombre</span><input name="nombre" list="dl-cl" placeholder="Nombre y apellido" autocomplete="off"></label>
   <datalist id="dl-cl">${items('cliente').map(x=>`<option value="${esc(x.nombre)}">`).join('')}</datalist>
   <div class="f2">${dc.includes('Celular')?`<label class="field"><span>Celular (WhatsApp)</span><input name="cel" inputmode="tel" placeholder="310 000 0000"></label>`:''}${dc.includes('Cédula')?`<label class="field"><span>Cédula (número)</span><input name="cedula" inputmode="numeric"></label>`:''}</div>
   ${dc.includes('Barrio')?`<label class="field"><span>Barrio</span><input name="barrio"></label>`:''}${dc.includes('Dirección')?`<label class="field"><span>Dirección</span><input name="dir"></label>`:''}${dc.includes('Fiador')?`<label class="field"><span>Fiador</span><input name="codeudor" placeholder="Nombre y celular"></label>`:''}${dc.includes('Notas')?`<label class="field"><span>Notas</span><input name="notas"></label>`:''}</div>
  <div class="card"><div class="step"><em>2</em>¿Cuánto y cómo paga?</div>
   <div class="f2"><label class="field"><span>Le presto</span><input name="monto" inputmode="numeric" data-money="1" placeholder="500.000"></label><label class="field"><span>Interés % ${c.interesTipo==='Un % cada mes'?'mensual':'total'}</span><input name="pct" inputmode="decimal" value="${String(c.interesPct).replace('.',',')}"></label></div>
   <div class="sub" style="margin:0 2px 6px;font-weight:700">¿Cada cuánto paga?</div>
   <div class="seg">${frs.map(x=>`<button type="button" data-a="pfrec" data-v="${x}" class="${x===fr0?'on':''}">${x==='A mano'?'Fechas a mano':x}</button>`).join('')}</div><input type="hidden" name="frec" value="${fr0}">
   <div id="pwd"></div><input type="hidden" name="wd" value="${wd}"><input type="hidden" name="dias" value="${dd}">
   <div class="f2"><div class="field"><span>Número de cuotas</span><div class="row" style="margin-top:2px"><button type="button" class="act a-ver mini" data-a="pn" data-v="-1" style="width:40px">−</button><input name="n" inputmode="numeric" value="${defN(fr0)}" style="text-align:center"><button type="button" class="act a-ver mini" data-a="pn" data-v="1" style="width:40px">+</button></div></div><label class="field"><span>Primera cuota</span><input name="first" type="date" value="${firstFor(fr0,wd)}"></label></div>
   <div class="f2"><label class="field"><span>Entrego con</span><select name="pago">${(c.pagos||['Efectivo']).map(m=>`<option>${esc(m)}</option>`).join('')}</select></label><label class="field"><span>Fecha del préstamo</span><input name="inicio" type="date" value="${today()}"></label></div>
   <label class="field"><span>Hora de entrega (opcional · sale en tu agenda)</span><input name="hent" type="time"></label>
   <div class="sum" id="psum"></div></div>
  <div class="card"><div class="step"><em>3</em>Fechas de cobro</div><div class="sub" id="pfechas"></div><div id="pfest"></div><div id="pmano"></div>
   <label class="row" style="margin-top:12px;justify-content:flex-start;gap:10px;font-size:.9em"><input type="checkbox" name="cuaderno" style="width:24px;height:24px;accent-color:var(--presta)"> Ya venía de antes (del cuaderno)</label>
   <div id="cuad" style="display:none;margin-top:8px"></div></div>
  <button class="bigbtn a-presta" type="submit">${ic('presta')}Crear préstamo</button></form></div>`;
  render();const f=$('#fp');f._fest={};f._mano=null;f._cm={};f._open=-1;f._paid=null;pWd();pCalc();
}
function pWd(){const f=$('#fp');if(!f)return;const fr=f.frec.value;
  $('#pwd').innerHTML=fr==='Semanal'||fr==='A mano'?`<div class="sub" style="margin:0 2px 6px;font-weight:700">¿Qué día ${fr==='A mano'?'se sugieren las fechas':'cobras'}?</div><div class="seg wdseg">${[1,2,3,4,5,6,0].map(d=>`<button type="button" data-a="pwdd" data-v="${d}" class="${+f.wd.value===d?'on':''}">${cap(DOWL[d]).slice(0,3)}</button>`).join('')}</div>`
   :fr==='Diario'?`<div class="sub" style="margin:0 2px 6px;font-weight:700">¿Qué días se le cobra?</div><div class="seg">${DIAS.map(([k,l])=>`<button type="button" data-a="pdias" data-v="${k}" class="${k===f.dias.value?'on':''}">${l}</button>`).join('')}</div>`:''}
function pCalc(){
  const f=$('#fp');if(!f)return;const c=cfg();const monto=intv(f.monto.value),pct=num(f.pct.value),n=Math.max(1,Math.min(200,intv(f.n.value)||1)),fr=f.frec.value;
  let fechas=f.first.value?baseDates(f.first.value,fr,n,f.dias.value):[];
  // festivos (semanal, quincenal, mensual): preguntar qué hacer
  const fest=fr==='Diario'?[]:fechas.filter(d=>isHoliday(d));
  if(fr==='A mano'){if(!f._mano||f._mano.length!==n){const old=f._mano||[];f._mano=fechas.map((d,i)=>old[i]||d)}fechas=f._mano.slice()}
  else fechas=fechas.map(d=>f._fest[d]?festApply(d,f._fest[d]):d);
  let total=monto*(1+pct/100);if(c.interesTipo==='Un % cada mes'&&fechas.length){const months=Math.max(1,Math.round((pd(fechas[fechas.length-1])-pd(f.inicio.value||today()))/864e5/30));total=monto*(1+pct/100*months)}
  total=Math.round(total);
  $('#psum').innerHTML=`<div><span class="sub">Me debe en total</span><div class="mid">${money(total)}</div></div><div><span class="sub">Cada cuota</span><div class="mid ok">${money(Math.round(total/n))}</div></div><div style="grid-column:1/3"><span class="sub">Ganancia: ${money(total-monto)} · ${n} cuota(s) ${fr==='Semanal'?'cada '+DOWL[+f.wd.value]:fr==='A mano'?'con fechas a mano':fr.toLowerCase()}</span></div>`;
  const fs=fechas.slice().sort();
  $('#pfechas').innerHTML=fs.length?`Desde <b>${fdate(fs[0])}</b> hasta <b>${fdate(fs[fs.length-1])}</b>${fr==='Semanal'?' · plazo para pagar: toda la semana':''}`:'';
  $('#pfest').innerHTML=fest.length&&fr!=='A mano'?`<div class="festbox"><b>🎌 ${fest.length===1?'Hay un festivo':'Hay '+fest.length+' festivos'} en las fechas de cobro</b><div class="sub">¿Qué hago con esa cuota?</div>${fest.map(d=>`<div class="festrow"><span>${cap(fdate(d))}</span><div class="chs">${[['igual',`Cobrar igual (${DOW[pd(d).getDay()]})`],['sig',cap(fdate(nextWork(d)))],['ant',cap(fdate(prevWork(d)))]].map(([k,l])=>`<button type="button" class="ch${f._fest[d]===k?' on':''}" data-a="pfest" data-d="${d}" data-v="${k}">${l}</button>`).join('')}</div></div>`).join('')}</div>`:'';
  $('#pmano').innerHTML=fr==='A mano'?`<div class="sub" style="margin:8px 2px 6px">Toca una fecha para cambiarla:</div><div class="manolist">${f._mano.map((d,i)=>`<button type="button" class="ch" data-a="pmano" data-i="${i}"><b>${i+1}.</b> ${cap(fdate(d))}${isHoliday(d)?' 🎌':''}</button>`).join('')}</div>`:'';
  f._calc={monto,pct,n,frec:fr,fechas,total,dias:f.dias.value,wd:+f.wd.value,festPend:fr!=='A mano'?fest.filter(d=>!f._fest[d]):[]};
  cuadRender(f);
}
/* préstamo que venía de antes: cuántas pagó + ajustar cada una */
const CMS={p:['A tiempo','var(--venta)'],t:['Tarde','var(--hoy)'],ab:['Abono','linear-gradient(180deg,var(--venta) 55%,#7F1D1D 55%)'],n:['No pagó','var(--mal)']};
function cuadRender(f){
  const box=$('#cuad');if(!f.cuaderno.checked){box.style.display='none';return}box.style.display='block';
  const x=f._calc;const t=today();const per=Math.round(x.total/x.n);
  const idx=x.fechas.map((d,i)=>({d,i})).sort((a,b)=>a.d<b.d?-1:1);const past=idx.filter(o=>o.d<=t).length;
  if(f._paid===null){f._paid=past;idx.forEach((o,k)=>f._cm[o.i]={st:k<past?'p':'n',met:(cfg().pagos||['Efectivo'])[0]})}
  const met0=(cfg().pagos||['Efectivo']);const shown=idx.slice(0,Math.max(past,f._paid));
  if(!shown.length){box.innerHTML=`<div class="sub">Pon la <b>fecha del préstamo</b> y la <b>primera cuota</b> en los días en que de verdad fueron (en el pasado). Así salen aquí las cuotas para marcar.</div>`;return}
  const tot={p:0,t:0,ab:0,n:0};shown.forEach(o=>tot[(f._cm[o.i]||{}).st||'n']++);
  box.innerHTML=`<div class="field"><span>¿Cuántas cuotas te ha pagado?</span><div class="row" style="margin-top:4px"><button type="button" class="act a-ver mini" data-a="cpaid" data-v="-1" style="width:44px">−</button><b class="big" style="font-size:1.5em">${f._paid}</b><button type="button" class="act a-cobra mini" data-a="cpaid" data-v="1" style="width:44px">+</button></div><div class="sub">de ${x.n} · ${past} ya pasaron</div></div>
  <div class="sub" style="margin:4px 2px 6px"><b style="color:var(--ink)">Toca una cuota para ajustarla</b> (tarde, abono, por dónde pagó).</div>
  <div class="card" style="padding:4px 12px">${shown.map((o,k)=>{const m=f._cm[o.i]||{st:'n'};const lab=m.st==='t'?`Tarde · ${fdate(m.fecha||addDays(o.d,1))}`:m.st==='ab'?`Abono ${money(m.monto||0)}`:CMS[m.st][0];
    let row=`<button type="button" class="q" data-a="copen" data-i="${o.i}" style="width:100%;text-align:left"><span class="bar" style="background:${CMS[m.st][1]}"></span><span style="flex:1"><b>Cuota ${k+1} · ${fdate(o.d)}</b><br><span class="sub">${lab}${m.st!=='n'?' · '+esc(m.met||met0[0]):''}</span></span><b>${money(per)}</b></button>`;
    if(f._open===o.i)row+=`<div class="cmed"><div class="seg">${Object.entries(CMS).map(([k2,v])=>`<button type="button" data-a="cst" data-i="${o.i}" data-v="${k2}" class="${m.st===k2?'on':''}">${v[0]}</button>`).join('')}</div>
      ${m.st==='t'?`<button type="button" class="pkbtn" data-a="cfecha" data-i="${o.i}">${ic('cal','width:16px;height:16px')} Pagó el ${fdate(m.fecha||addDays(o.d,1))} · cambiar</button>`:''}
      ${m.st==='ab'?`<label class="field"><span>¿Cuánto abonó?</span><input inputmode="numeric" data-money="1" data-cm="${o.i}" value="${m.monto?thou(m.monto):''}" placeholder="${thou(Math.round(per/2))}"></label>`:''}
      ${m.st!=='n'?`<div class="chs">${met0.map(mm=>`<button type="button" class="ch${(m.met||met0[0])===mm?' on':''}" data-a="cmet" data-i="${o.i}" data-v="${esc(mm)}">${esc(mm)}</button>`).join('')}</div>`:''}
      <button type="button" class="act a-ver mini" data-a="copen" data-i="-1" style="margin-top:8px;width:100%">Listo</button></div>`;
    return row}).join('')}</div>
  <div class="sub" style="margin-top:6px">${tot.p} a tiempo · ${tot.t} tarde · ${tot.ab} abono · ${tot.n} sin pagar. Estos pagos sí cuentan en los reportes.</div>`;
}
function savePrestamo(f){
  const x=f._calc;const nombre=f.nombre.value.trim();if(!nombre){toast('Falta el nombre');return}if(!x.monto){toast('Falta cuánto le prestas');return}
  if(x.festPend.length){toast('Escoge qué hacer con '+(x.festPend.length>1?'los festivos':'el festivo')+' (paso 3)');$('#pfest').scrollIntoView({behavior:'smooth',block:'center'});return}
  let cl=items('cliente').find(c=>c.nombre.toLowerCase()===nombre.toLowerCase());const g=k=>f[k]?f[k].value.trim():'';
  if(!cl){cl={id:uid(),k:'cliente',nombre,cel:g('cel'),cedula:g('cedula'),dir:g('dir'),barrio:g('barrio'),codeudor:g('codeudor'),notas:g('notas')};put(cl,true)}
  else{let ch=false;['cel','cedula','dir','barrio','codeudor','notas'].forEach(k=>{if(g(k)){cl[k]=g(k);ch=true}});if(ch)put(cl,true)}
  const cuaderno=f.cuaderno.checked;const fest={};Object.entries(f._fest).forEach(([d,v])=>{if(x.fechas.length)fest[d]=v});
  const p={id:uid(),k:'prestamo',cliente:cl.id,monto:x.monto,pct:x.pct,tipo:cfg().interesTipo,frec:x.frec,wd:x.wd,dias:x.dias,n:x.n,total:x.total,cuota:Math.round(x.total/x.n),inicio:f.inicio.value||today(),fechas:x.fechas.slice(),fest,previas:0,cuaderno,pago:f.pago.value};
  put(p,true);
  const hent=f.hent?f.hent.value:'';if(hent&&!cuaderno)put({id:uid(),k:'ev',tipo:'entrega',titulo:'Entregar a '+nombre,nota:money(x.monto),fecha:p.inicio,hora:hent,aviso:15,rep:'no',hechos:{},prestamo:p.id},true);
  if(cuaderno){const sch=loanSched(p);const t=today();sch.forEach(c=>{const m=f._cm[c.i];if(!m||m.st==='n')return;
    let fe=m.st==='p'?c.f:m.st==='t'?(m.fecha||addDays(c.f,1)):(m.fecha||c.f);if(fe>t)fe=t;const mon=m.st==='ab'?Math.min(m.monto||0,c.v):c.v;if(mon<=0)return;
    put({id:uid(),k:'pago',prestamo:p.id,fecha:fe,monto:mon,alloc:[{i:c.i,m:mon}],cuaderno:true,pago:m.met||p.pago},true)})}
  layer='';S.me.view='cliente';S.me.loan=p.id;S.me.calm=null;render();toast('Préstamo creado');
}
/* calendario del cliente */
function calendar(s,p){
  const months=[...new Set(s.cuotas.map(c=>c.f.slice(0,7)))].sort();
  let cur=S.me.calm&&months.includes(S.me.calm)?S.me.calm:(months.find(m=>m===today().slice(0,7))||months.find(m=>m>today().slice(0,7))||months[months.length-1]);
  const mi=months.indexOf(cur);const [y,m]=cur.split('-').map(Number);const first=new Date(y,m-1,1);const days=new Date(y,m,0).getDate();
  const byDate={};s.cuotas.forEach(c=>(byDate[c.f]=byDate[c.f]||[]).push(c));const off=(first.getDay()+6)%7;const t=today();
  const pri=a=>a.find(c=>c.st!=='p'&&c.st!=='t')||a[0];
  let h=`<div class="card"><div class="row"><button data-a="calm" data-v="${months[mi-1]||''}" ${mi>0?'':'disabled style="opacity:.3"'} class="iconbtn" aria-label="Mes anterior">${ic('chev')}</button><b>${MESL[m-1]} ${y}</b><button data-a="calm" data-v="${months[mi+1]||''}" ${mi<months.length-1?'':'disabled style="opacity:.3"'} class="iconbtn" aria-label="Mes siguiente">${ic('right')}</button></div><div class="cal">${['L','M','M','J','V','S','D'].map(d=>`<span class="h">${d}</span>`).join('')}`;
  for(let i=0;i<off;i++)h+=`<span class="e"></span>`;
  for(let d=1;d<=days;d++){const ds=`${y}-${pad2(m)}-${pad2(d)}`;const arr=byDate[ds];const c=arr&&pri(arr);
    let cls=c?({p:'p',t:'t',n:'n',ab:'ab',hoy:'hy',f:'f',pend:'pe'})[c.st]:(isOff(ds)?'x':'');if(ds===t&&!(c&&c.st==='hoy'))cls+=' hy';
    h+=c?`<button class="${cls}" data-a="cuota" data-v="${p.id}" data-i="${c.i}" aria-label="Cuota ${c.i+1}">${d}${arr.length>1?`<sup>×${arr.length}</sup>`:''}</button>`:`<span class="${cls}">${d}</span>`}
  h+=`</div><div class="leg"><span><i style="background:var(--venta)"></i>Pagó</span><span><i style="background:rgba(249,115,22,.35);border:1.5px solid var(--hoy)"></i>Pendiente</span><span><i style="background:var(--hoy)"></i>Pagó tarde</span><span><i style="background:var(--mal)"></i>Atrasada</span><span><i style="background:linear-gradient(180deg,var(--venta) 55%,#7F1D1D 55%)"></i>Abono</span><span><i style="border:1.5px dashed var(--sub)"></i>Falta</span></div></div>`;
  return h;
}
/* una cuota: cobrar, corregir, correr la fecha */
function sheetCuota(pid,i){
  const p=S.items[pid];const s=loanStatus(p);const c=s.cuotas[i];
  const txt={p:'Pagada',t:`Pagada tarde`,n:'Atrasada',pend:'Pendiente de esta semana',ab:`Abono: falta ${money(c.falta||0)}`,hoy:'Se cobra hoy',f:'Falta (próxima)'}[c.st];
  const pays=c.pays.filter(y=>!y.prev).map(y=>`${money(y.m)} el ${fdate(y.fecha)}${S.items[y.id]&&S.items[y.id].cuaderno?' (de antes)':''}`);
  const mode=c.st==='p'||c.st==='t'?c.st:c.st==='ab'?'ab':'n';const nx=stepDate(p,c.f);
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><div class="card"><div class="row" style="justify-content:flex-start;gap:12px"><span class="ini" style="width:52px;height:52px;border-radius:14px;font-size:1.2em;background:var(--card2)">${c.i+1}</span><div><div class="mid">Cuota ${c.i+1} · ${fdate(c.f)}</div><div class="sub">${money(c.v)} · ${txt}</div>${pays.length?`<div class="sub">Pagos: ${pays.map(esc).join(' · ')}</div>`:''}</div></div></div>
  ${c.st!=='p'&&c.st!=='t'?`<button class="bigbtn a-cobra" data-a="cobrar1" data-v="${pid}" data-i="${i}">${ic('cobra')}Cobrar esta cuota</button>`:''}
  ${c.st!=='p'&&c.st!=='t'?`<button class="bigbtn a-ver" data-a="correr" data-v="${pid}" data-i="${i}">${ic('right')}Correr al ${fdate(nx)} <span class="sub" style="margin-left:4px">🔒</span></button>`:''}
  <div class="card" style="margin-top:10px"><div class="row"><b>🔒 Corregir esta cuota</b><span class="sub">pide PIN o Face ID</span></div>
   <form id="ffix" data-p="${pid}" data-i="${i}" style="margin-top:9px"><div class="seg">${[['p','Pagó ese día'],['t','Pagó otro día'],['ab','Abonó'],['n','No pagó']].map(([k,l])=>`<button type="button" data-a="fixmode" data-v="${k}" class="${k===mode?'on':''}">${l}</button>`).join('')}</div><input type="hidden" name="mode" value="${mode}">
   <div id="fixextra"></div><button class="bigbtn a-ver" type="submit">Guardar corrección</button></form>
   <label class="field" style="margin-top:12px"><span>Mover esta cuota a otra fecha</span><input type="date" id="mvdate" value="${c.f}" data-nodirty="1"></label><button class="bigbtn a-ver" data-a="mvcuota" data-v="${pid}" data-i="${i}">${ic('editar')}Guardar nueva fecha</button></div>
  ${pays.length?`<button class="bigbtn" data-a="delcuopay" data-v="${pid}" data-i="${i}" style="color:var(--badt)">${ic('trash')}Borrar los pagos de esta cuota</button>`:''}</div>`;
  render();fixExtra();
}
function shiftLoan(pid,i,all){const p=S.items[pid];materialize(p);const f=p.fechas.slice();
  if(all){for(let j=i;j<f.length;j++)f[j]=stepDate(p,f[j])}else f[i]=stepDate(p,f[i]);
  p.fechas=f;layer='';put(p);toast(all?`Se corrieron ${f.length-i} cuota(s)`:`Cuota ${i+1} movida al ${fdate(f[i])}`)}

/* =============== festivos que vienen (aviso en Inicio) =============== */
function festUpcoming(){const t=today();const out=[];
  for(let k=0;k<=4;k++){const d=addDays(t,k);if(!isHoliday(d)||(S.me.festOk||{})[d])continue;
    const cs=[];for(const p of items('prestamo')){const cl=S.items[p.cliente];if(!cl||cl.del)continue;const s=lsOf(p);p.fechas.forEach((f,i)=>{if(f===d&&s.cuotas[i]&&s.cuotas[i].st!=='p'&&s.cuotas[i].st!=='t')cs.push({p,i,cl})})}
    if(cs.length)out.push({d,cs})}
  return out}
function sheetFestivo(d){const F=festUpcoming().find(x=>x.d===d);if(!F)return;
  layer=`<div class="dim" data-a="close"></div><div class="sheet"><div class="grab"></div><h2>🎌 ${cap(fdateW(d))} es festivo</h2><p class="sub" style="margin:-6px 0 12px">Tienes ${F.cs.length} cobro(s) ese día. ¿Qué hago?</p>
  <div class="acts" style="grid-template-columns:1fr 1fr 1fr"><button class="act a-cobra" data-a="festall" data-d="${d}" data-v="sig">${cap(fdate(nextWork(d)))}</button><button class="act a-cobra" data-a="festall" data-d="${d}" data-v="ant">${cap(fdate(prevWork(d)))}</button><button class="act a-ver" data-a="festall" data-d="${d}" data-v="igual">Cobrar igual</button></div>
  <div class="sub" style="margin:4px 2px 8px">Esto aplica a todos. Si quieres algo distinto para alguien, abre su préstamo y usa "Mover esta cuota".</div>
  <div class="card" style="padding:4px 12px">${F.cs.map(x=>`<button class="ev" data-a="cliente" data-v="${x.p.id}"><span class="ini">${esc(initials(x.cl.nombre))}</span><span class="x"><b>${esc(x.cl.nombre)}</b><span class="sub">Cuota ${x.i+1} · ${money(loanSched(x.p)[x.i].v)}</span></span>${ic('right')}</button>`).join('')}</div></div>`;render()}
function festAll(d,ch){const F=festUpcoming().find(x=>x.d===d);S.me.festOk=Object.assign({},S.me.festOk,{[d]:1});
  if(F&&ch!=='igual')F.cs.forEach(x=>{const p=S.items[x.p.id];materialize(p);const f=p.fechas.slice();f[x.i]=festApply(d,ch);p.fechas=f;p.fest=Object.assign({},p.fest,{[d]:ch});put(p,true)});
  persist();layer='';render();toast(ch==='igual'?'Listo: se cobra igual ese día':`Cobros movidos al ${fdate(festApply(d,ch))}`)}
