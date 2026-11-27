
/* =============== eventos =============== */
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,v=el.dataset.v;
  if(el.tagName==='INPUT')return;
  switch(a){
/*@OLD1*/
/*@OLD2*/
    case 'wzstart':startWizard(false);break;
    case 'wzedit':startWizard(true);break;
    case 'wzclose':W=null;S.me.view='mas';render();break;
    case 'wzback':if(W.i>0){W.i--;render();scrollTo(0,0)}else{const ed=W.edit;W=null;S.me.view=ed?'mas':'inicio';render()}break;
    case 'wznext':wzNext();break;
    case 'wzopt':{const q=WZ.flatMap(s=>s.qs).find(x=>x.id===el.dataset.q);
      if(q.multi){let arr=W.a[q.id]||[];if(arr.includes(v))arr=arr.filter(x=>x!==v);else{if(q.max&&arr.length>=q.max)arr.shift();arr.push(v)}W.a[q.id]=arr;
        el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',arr.includes(b.dataset.v)))}
      else{W.a[q.id]=W.a[q.id]===v?'':v;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===W.a[q.id]))}break}
    case 'demo':loadDemo();break;
    case 'tab':layer='';S.me.view=v;S.me.dayf='';if(v==='agenda'&&!S.me.ad)S.me.ad=today();persist();render();scrollTo(0,0);break;
    case 'plus':sheetPlus();break;
    case 'close':requestClose();break;
    case 'chpick':{const o=CH&&CH[+v];closeChoice();if(o&&o.f)o.f();break}
    case 'chno':closeChoice();break;
    case 'pkopen':{const inp=document.getElementById(el.dataset.for);if(inp)openPicker(el.dataset.kind,inp.value,el.closest('.field')?.querySelector('span')?.textContent||'',pkInput(inp.id));break}
    case 'pkclose':PK=null;renderPicker();break;
    case 'pkd':pkDone(v);break;
    case 'pkm':{const [y,m]=PK.m.split('-').map(Number);const d=new Date(y,m-1+(+v),1);PK.m=ymd(d).slice(0,7);renderPicker();break}
    case 'pkh':{const M=(PK.v||'08:00').split(':')[1];PK.v=pad2(+v)+':'+M;renderPicker();break}
    case 'pkmin':{const H=(PK.v||'08:00').split(':')[0];PK.v=H+':'+pad2(+v);renderPicker();break}
    case 'pkok':pkDone(PK.v||'08:00');break;
    case 'qpickdate':openPicker('date',Q.d,'¿Qué día?',v2=>{Q.d=v2;renderQuick()});break;
    case 'qpicktime':openPicker('time',Q.h||defHour()||'08:00','¿A qué hora?',v2=>{Q.h=v2;renderQuick()});break;
    case 'evpickdate':{const id=v,d=el.dataset.d;openPicker('date',d,'¿Para qué día?',v2=>evMove(id,d,'date',v2));break}
    /* préstamo nuevo */
    case 'pfrec':{const f=$('#fp');f.frec.value=v;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));f.n.value=defN(v);const fi=document.getElementById(f.first.id);pkInput(fi.id)(firstFor(v,+f.wd.value,f.inicio.value||today()));f._fest={};f._mano=null;f._paid=null;pWd();pCalc();break}
    case 'pwdd':{const f=$('#fp');f.wd.value=v;pWd();pkInput(f.first.id)(firstFor(f.frec.value,+v,f.inicio.value||today()));f._fest={};f._mano=null;f._paid=null;pCalc();break}
    case 'pdias':{const f=$('#fp');f.dias.value=v;pWd();pCalc();break}
    case 'pn':{const f=$('#fp');f.n.value=Math.max(1,(intv(f.n.value)||1)+(+v));f._paid=null;pCalc();break}
    case 'pfest':{const f=$('#fp');f._fest[el.dataset.d]=v;pCalc();break}
    case 'pmano':{const f=$('#fp');const i=+el.dataset.i;openPicker('date',f._mano[i],'Fecha de la cuota '+(i+1),v2=>{f._mano[i]=v2;pCalc()});break}
    case 'cpaid':{const f=$('#fp');const x=f._calc;const idx=x.fechas.map((d,i)=>({d,i})).sort((a,b)=>a.d<b.d?-1:1);f._paid=Math.max(0,Math.min(x.n,f._paid+(+v)));
      idx.forEach((o,k)=>{const m=f._cm[o.i]||{};f._cm[o.i]=Object.assign(m,{st:k<f._paid?(m.st&&m.st!=='n'?m.st:'p'):'n'})});cuadRender(f);break}
    case 'copen':{const f=$('#fp');f._open=+el.dataset.i;cuadRender(f);break}
    case 'cst':{const f=$('#fp');const i=+el.dataset.i;f._cm[i]=Object.assign(f._cm[i]||{},{st:v});f._paid=Object.values(f._cm).filter(m=>m.st!=='n').length;cuadRender(f);break}
    case 'cmet':{const f=$('#fp');const i=+el.dataset.i;f._cm[i].met=v;cuadRender(f);break}
    case 'cfecha':{const f=$('#fp');const i=+el.dataset.i;const d0=f._cm[i].fecha||addDays(f._calc.fechas[i],1);openPicker('date',d0>today()?today():d0,'¿Qué día pagó la cuota '+(i+1)+'?',v2=>{f._cm[i].fecha=v2;cuadRender(f)});break}
    /* cuotas */
    case 'correr':{const pid=v,i=+el.dataset.i;withLock(()=>showChoice('¿Qué se corre?','La cuota '+(i+1)+' pasa al '+fdate(stepDate(S.items[pid],S.items[pid].fechas[i]))+'.',[{l:'Esta y todas las siguientes',c:'a-cobra',f:()=>shiftLoan(pid,i,true)},{l:'Solo esta cuota',c:'a-ver',f:()=>shiftLoan(pid,i,false)},{l:'Cancelar',c:'',f:()=>{}}]));break}
    case 'delcuopay':{const pid=v,i=+el.dataset.i;withLock(()=>showChoice('¿Borrar los pagos de esta cuota?','La cuota queda como no pagada.',[{l:'Sí, borrar',c:'a-mal',f:()=>{setCuota(pid,i,'n');layer='';render();toast('Pagos borrados')}},{l:'No',c:'a-ver',f:()=>{}}]));break}
    case 'festsheet':sheetFestivo(el.dataset.d);break;
    case 'festall':festAll(el.dataset.d,v);break;
    case 'undo':if(UNDO){const f=UNDO;UNDO=null;f();$('#toast').classList.remove('show');toast('Deshecho')}break;
    /* agenda */
    case 'dayf':S.me.dayf=S.me.dayf===v?'':v;render();break;
    case 'am':S.me.am=v;S.me.dayf='';render();break;
    case 'anav':{const m=S.me.am||AM[(cfg()||{}).vista]||'dia';const d=S.me.ad||today();const n=+v;
      if(m==='dia')S.me.ad=addDays(d,n);else if(m==='semana')S.me.ad=addDays(d,7*n);else{const x=pd(d);const nx=new Date(x.getFullYear(),x.getMonth()+n,1);S.me.ad=ymd(nx)}S.me.dayf='';render();break}
    case 'agoto':S.me.ad=v;if(el.dataset.m)S.me.am=el.dataset.m;S.me.view='agenda';S.me.dayf='';layer='';render();scrollTo(0,0);break;
    case 'agsel':if(S.me.ad===v){S.me.am='dia'}S.me.ad=v;render();break;
    case 'evopen':sheetEv(v,el.dataset.d);break;
    case 'evdone':{const ev=S.items[v];const d=el.dataset.d;const hd=Object.assign({},ev.hechos);if(hd[d])delete hd[d];else hd[d]=1;ev.hechos=hd;if(el.dataset.close)layer='';put(ev);if(hd[d])toast('✓ Hecho: '+evTitle(ev));break}
    case 'evmove':evMove(v,el.dataset.d,el.dataset.m);break;
    case 'evedit':{const ev=S.items[v];sheetQuick({id:v,tipo:ev.tipo,d:ev.fecha,h:ev.hora||'',titulo:ev.titulo===tplOf(ev.tipo).l?'':ev.titulo,nota:ev.nota||'',aviso:ev.aviso??15,rep:ev.rep||'no',more:true});break}
    case 'evdel':{const ev=S.items[v];if(el.dataset.m==='one'){ev.skip=Object.assign({},ev.skip,{[el.dataset.d]:1});layer='';put(ev);toast('Quitado de este día',()=>{delete ev.skip[el.dataset.d];put(ev)})}
      else{layer='';ev.del=true;put(ev);toast('Borrado: '+evTitle(ev),()=>{ev.del=false;put(ev)})}break}
    /* cita rápida */
    case 'quick':sheetQuick(Object.assign({},el.dataset.d?{d:el.dataset.d}:{},el.dataset.t?{tipo:el.dataset.t}:{}));if(el.dataset.t)setTimeout(()=>{const i=$('#qtit');i&&i.focus()},350);break;
    case 'qtipo':Q.tipo=v;if(v==='cumple'){Q.rep='ano';Q.h=''}renderQuick();if(v==='recordar'||v==='otro'){const i=$('#qtit');i&&i.focus()}break;
    case 'qd':Q.d=v;if(Q.d===today()&&Q.h&&Q.h<nowHM()){const dh=defHour();if(dh)Q.h=dh}renderQuick();break;
    case 'qh':Q.h=v;renderQuick();break;
    case 'qav':Q.aviso=+v;renderQuick();break;
    case 'qrep':Q.rep=v;renderQuick();break;
    case 'qmore':Q.more=!Q.more;renderQuick();break;
    case 'qsave':saveQuick();Push.flush();break;
    case 'favgo':{const f=S.items[v];const d=favDay(f);const ne={id:uid(),k:'ev',tipo:f.tipo,titulo:f.titulo,nota:'',fecha:d,hora:f.hora||'',aviso:f.aviso??15,rep:'no',hechos:{}};put(ne,true);Q=null;layer='';render();
      toast(`Listo: ${evTitle(ne)} · ${dayWord(d)}${ne.hora?' '+fmtH(ne.hora):''}`,()=>{ne.del=true;put(ne)});break}
    /* préstamos y reportes */
    case 'goatr':S.me.pf='atr';S.me.view='prestamos';render();scrollTo(0,0);break;
    case 'rp':S.me.rp=v;render();break;
    case 'pdf':printReport();break;
    case 'cierre':sheetCierre();break;
    /* ajustes */
    case 'colors':showColors();break;
    case 'avisos':sheetAvisos();break;
    case 'pushon':await Push.enable();if(layer)sheetAvisos();break;
    case 'pushtest':Push.test();break;
    case 'iconl':S.me.iconL=v;persist();setTouchIcon(v);render();toast(v?`Ícono con la letra ${v}. Ahora: Compartir → Agregar a inicio`:'Ícono con el ✓ dorado');break;
    case 'backup':sheetBackup();break;
    case 'export':{const data=JSON.stringify({app:'cobros-agenda',v:1,fecha:new Date().toISOString(),items:S.items},null,1);const name=`copia-${(cfg().nombre||'cobros').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\W+/g,'-')}-${today()}.json`;
      const file=new File([data],name,{type:'application/json'});
      if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});S.me.lastBk=Date.now();persist();toast('Copia lista. Guárdala en Archivos o envíala a tu WhatsApp')}catch(e){}}
      else{const u=URL.createObjectURL(file);const l=document.createElement('a');l.href=u;l.download=name;l.click();setTimeout(()=>URL.revokeObjectURL(u),1000);S.me.lastBk=Date.now();persist()}render();break}
    case 'reset':if(confirm(S.me.demo?'¿Borrar los datos de prueba y empezar con tu negocio?':'¿Borrar TODO en este celular? Haz una copia antes.')){S={v:1,items:{},me:{push:S.me.push,pushUrl:S.me.pushUrl,pushKey:S.me.pushKey,iconL:S.me.iconL}};persist();layer='';render()}break;
  }
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.money){const pos=t.value.length-t.selectionStart;const n=intv(t.value);t.value=n?thou(n):'';try{const p=Math.max(0,t.value.length-pos);t.setSelectionRange(p,p)}catch(_){}}
  if(t.dataset.w!==undefined&&W){W.a[t.dataset.w]=t.value}
  if(t.dataset.wo!==undefined&&W){W.a[t.dataset.wo+'Val']=t.value}
  if(t.dataset.q&&Q){Q[t.dataset.q]=t.value}
  if(t.dataset.cm!==undefined){const f=$('#fp');const i=+t.dataset.cm;f._cm[i]=Object.assign(f._cm[i]||{},{monto:intv(t.value)})}
  else if(t.closest('#fp')&&t.name!=='n')pCalc();
  if(t.closest('#fp')&&t.name==='n'){$('#fp')._paid=null;pCalc()}
  if(t.closest('#fcob')){if(t.name==='monto'||t.name==='mora')cobCalc(false)}
  if(t.dataset.a2==='pq'){S.me.pq=t.value;const pos=t.selectionStart;render();const x=document.querySelector('[data-a2=pq]');if(x){x.focus();x.setSelectionRange(pos,pos)}}
  if(t.dataset.a3==='iconlx'){const L=t.value.trim().slice(0,1);S.me.iconL=L;persist();setTouchIcon(L)}
});
document.addEventListener('change',e=>{const t=e.target;
  if(t.closest('#fp')&&!t.dataset.cm&&t.type!=='checkbox'&&t.type!=='hidden')pCalc();
  if(t.closest('#fp')&&t.name==='cuaderno'){const f=$('#fp');f._paid=null;cuadRender(f)}
  if(t.dataset.a3==='qdate'&&t.value&&Q){Q.d=t.value;renderQuick()}
  if(t.dataset.a3==='qtime'&&t.value&&Q){Q.h=t.value;renderQuick()}
  if(t.dataset.a3==='evmovedate'&&t.value)evMove(t.dataset.v,t.dataset.d,'date',t.value);
  if(t.id==='impfile'&&t.files[0]){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(d.app!=='cobros-agenda'||!d.items)throw 0;if(!confirm('¿Reemplazar los datos de este celular con la copia?'))return;
    S.items=d.items;S.me.demo=false;persist();layer='';render();toast('Copia recuperada')}catch(_){toast('Ese archivo no es una copia válida')}};r.readAsText(t.files[0])}
});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target;
  if(f.id==='fp')savePrestamo(f);
  else if(f.id==='fcob')saveCobro(f);
  else if(f.id==='fcl'){const cl=S.items[f.dataset.id];['nombre','cel','cedula','dir','barrio','codeudor','notas'].forEach(k=>{if(f[k])cl[k]=f[k].value.trim()});layer='';put(cl);toast('Datos guardados')}
  else if(f.id==='fpin'){if(!/^\d{4}$/.test(f.pin.value)){toast('El PIN debe tener 4 números');return}S.me.pin=f.pin.value;persist();toast('PIN cambiado');layer='';render()}
  else if(f.id==='fauth'){if(f.pin.value===S.me.pin)authOK();else{toast('PIN incorrecto');f.pin.value=''}}
  else if(f.id==='ffix'){const mode=f.mode.value,pid=f.dataset.p,i=+f.dataset.i;const fecha=f.fecha?f.fecha.value:'';const monto=f.monto?intv(f.monto.value):0;const met=f.metodo?f.metodo.value:'';
    if(mode==='ab'&&!monto){toast('Escribe cuánto abonó');return}
    withLock(()=>{setCuota(pid,i,mode,fecha,monto,met);layer='';render();toast('Cuota corregida')})}
  else if(f.id==='fcie'){const contado=intv(f.contado.value);const esp=+f.dataset.esp;layer='';put({id:uid(),k:'cierre',fecha:today(),contado,esperado:esp,diff:contado-esp});toast(contado===esp?'¡Cuadró perfecto!':'Cierre guardado · diferencia '+money(contado-esp))}
  else if(f.id==='fpcfg'){S.me.pushUrl=f.url.value.trim();S.me.pushKey=f.key.value.trim();persist();toast('Servidor guardado');sheetAvisos()}
});

/* =============== arranque =============== */
if(S.me.pin&&cfg()){S.me.unlocked=false;chooseLockMode()}
if(S.me.view==='wz')S.me.view='inicio';
if(S.me.iconL)setTouchIcon(S.me.iconL);
let lastDay=today();
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){S.me.hiddenAt=Date.now();persist();Push.flush();return}
  if(S.me.pin&&S.me.hiddenAt&&Date.now()-S.me.hiddenAt>3*60e3){S.me.unlocked=false;chooseLockMode()}
  if(lastDay!==today()){lastDay=today();S.me.ad=today()}
  if(!layer)render();Push.later()});
render();
setInterval(inAppAlerts,30e3);
if('serviceWorker' in navigator&&location.protocol==='https:'){navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{const w=r.installing;w&&w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)toast('Hay una versión nueva: cierra y abre la app')})})}).catch(()=>{})}
setTimeout(()=>Push.sync().catch(()=>{}),3000);
</script>
</body>
</html>
