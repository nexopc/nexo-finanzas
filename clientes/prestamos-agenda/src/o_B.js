function loanSched(p){
  const n=p.n,base=Math.round(p.total/n);const cuotas=p.fechas.map((f,i)=>({i,f,v:i===n-1?p.total-base*(n-1):base}));
  let acc=0;cuotas.forEach(c=>{acc+=c.v;c.cum=acc});return cuotas;
}
function allocate(p){
  const cuotas=loanSched(p);cuotas.forEach(c=>{c.pays=[];c.got=0});
  if(p.previas){let left=cuotas[Math.min(p.previas,p.n)-1].cum;for(const c of cuotas){if(left<=0.5)break;const m=Math.min(c.v,left);c.pays.push({fecha:'0000-00-00',m,prev:1});c.got+=m;left-=m}}
  const pagos=items('pago').filter(x=>x.prestamo===p.id).sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.ts-b.ts);
  for(const x of pagos)if(x.alloc)for(const a of x.alloc){const c=cuotas[a.i];if(c&&a.m>0){c.pays.push({fecha:x.fecha,m:a.m,id:x.id});c.got+=a.m}}
  for(const x of pagos){let left=x.alloc?x.monto-x.alloc.reduce((s,a)=>s+a.m,0):x.monto;
    for(const c of cuotas){if(left<=0.5)break;const rem=c.v-c.got;if(rem<=0.5)continue;const m=Math.min(rem,left);c.pays.push({fecha:x.fecha,m,id:x.id});c.got+=m;left-=m}}
  return {cuotas,pagos};
}
function loanStatus(p,ref){
  ref=ref||today();const g=graceOf(p);const beyond=c=>addDays(c.f,g)<ref;
  const {cuotas,pagos}=allocate(p);let paid=0;
  cuotas.forEach(c=>{paid+=c.got;const rem=c.v-c.got;c.rem=Math.max(0,rem);
    if(rem<=0.5){let acc=0,pf=null;for(const y of c.pays.slice().sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:0)){acc+=y.m;if(acc>=c.v-0.5){pf=y.fecha;break}}c.pf=pf;c.st=(pf<=addDays(c.f,g)||pf==='0000-00-00')?'p':'t';c.rem=0}
    else if(c.got>0.5){c.st='ab';c.falta=rem}
    else c.st=c.f===ref?'hoy':c.f<ref?(beyond(c)?'n':'pend'):'f'});
  const unpaid=c=>c.st!=='p'&&c.st!=='t';
  const debeHoy=cuotas.filter(c=>c.f<=ref).reduce((s,c)=>s+c.rem,0);
  const atraso=cuotas.filter(c=>c.f<ref&&beyond(c)).reduce((s,c)=>s+c.rem,0);
  const pendSem=cuotas.filter(c=>c.f<ref&&!beyond(c)&&unpaid(c)).reduce((s,c)=>s+c.rem,0);
  const vencidas=cuotas.filter(c=>c.f<ref&&beyond(c)&&unpaid(c)).length;
  const lateDays=(()=>{const c=cuotas.find(c=>c.f<ref&&beyond(c)&&unpaid(c));return c?Math.round((pd(ref)-pd(c.f))/864e5):0})();
  const next=cuotas.find(c=>c.f>ref&&unpaid(c));
  const hoy=cuotas.find(c=>c.f===ref);
  const pagadas=cuotas.filter(c=>!unpaid(c)).length;
  const saldo=Math.max(0,p.total-paid);
  const c=cfg()||{};let mora=0;
  if(c.moraTipo&&c.moraTipo!=='No'&&atraso>0){const v=num(c.moraVal);
    if(c.moraTipo.includes('%'))mora=cuotas.filter(x=>x.f<ref&&beyond(x)&&unpaid(x)).reduce((s,x)=>s+x.v*v/100,0);
    else mora=v*lateDays}
  return {cuotas,pagos,paid,debeHoy,atraso,pendSem,vencidas,lateDays,next,hoy,pagadas,saldo,done:saldo<=0.5,mora}
}
/* deja todos los pagos del préstamo amarrados a sus cuotas (para poder corregir una sola) */
function materialize(p){
  const {cuotas,pagos}=allocate(p);
  if(p.previas){cuotas.forEach(c=>{const pv=c.pays.filter(y=>y.prev);if(pv.length){const m=pv.reduce((s,y)=>s+y.m,0);put({id:uid(),k:'pago',prestamo:p.id,fecha:c.f,monto:m,alloc:[{i:c.i,m}],cuaderno:true,pago:p.pago},true)}});p.previas=0;put(p,true)}
  for(const x of pagos){if(x.alloc&&Math.abs(x.alloc.reduce((s,a)=>s+a.m,0)-x.monto)<1)continue;
    const al=[];cuotas.forEach(c=>c.pays.filter(y=>y.id===x.id).forEach(y=>{const e=al.find(a=>a.i===c.i);if(e)e.m+=y.m;else al.push({i:c.i,m:y.m})}));x.alloc=al;put(x,true)}
}
function setCuota(pid,i,mode,fecha,monto,metodo){
  const p=S.items[pid];materialize(p);const c=loanSched(p)[i];
  items('pago').filter(x=>x.prestamo===pid&&x.alloc&&x.alloc.some(a=>a.i===i)).forEach(x=>{const a=x.alloc.find(a=>a.i===i);x.alloc=x.alloc.filter(a=>a.i!==i);x.monto-=a.m;if(x.monto<=0.5&&!x.mora)x.del=true;put(x,true)});
  const m=mode==='ab'?Math.min(monto,c.v):c.v;const f=mode==='p'?c.f:(fecha||today());
  if(mode!=='n'&&m>0)put({id:uid(),k:'pago',prestamo:pid,fecha:f,monto:m,alloc:[{i,m}],pago:metodo||p.pago,manual:true},true);
  render();
}
const loansActive=()=>items('prestamo').map(p=>({p,s:loanStatus(p),cl:S.items[p.cliente]})).filter(x=>!x.s.done&&x.cl&&!x.cl.del);
function interesPart(p,monto){return p.total>0?monto*(p.total-p.monto)/p.total:0}
