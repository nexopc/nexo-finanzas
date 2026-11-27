    case 'prestar':sheetPrestar();break;
    case 'frec':{const f=$('#fp');f.frec.value=v;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));f.n.value=v==='Diario'?24:v==='Semanal'?10:v==='Quincenal'?6:4;f.first.value=firstDue(v);pCalc();break}
    case 'dias':{const f=$('#fp');f.dias.value=v;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));pCalc();break}
    case 'cuad':{const f=$('#fp');const i=+el.dataset.i;const cur=f._cm[i]||'p';f._cm[i]=cur==='p'?'t':cur==='t'?'n':'p';cuadRender(f);break}
    case 'cuadall':{const f=$('#fp');f._calc.fechas.forEach((d,i)=>f._cm[i]=v);cuadRender(f);break}
    case 'fixmode':{const f=$('#ffix');f.mode.value=v;el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));fixExtra();break}
    case 'cobrar1':sheetCobrar(v,+el.dataset.i);break;
    case 'csel':{const f=$('#fcob');const i=+el.dataset.i;if(f._sel.has(i))f._sel.delete(i);else f._sel.add(i);cobCalc(true);break}
    case 'authface':{if(await faceVerify())authOK();else toast('No se pudo con Face ID: usa el PIN');break}
    case 'cliente':layer='';S.me.view='cliente';S.me.loan=v;S.me.calm=null;persist();render();scrollTo(0,0);break;
    case 'pf':S.me.pf=v;render();break;
    case 'calm':if(v){S.me.calm=v;render()}break;
    case 'cuota':sheetCuota(v,+el.dataset.i);break;
    case 'mvcuota':{const p=S.items[v];const nd=$('#mvdate').value;const i=+el.dataset.i;if(nd)withLock(()=>{materialize(p);p.fechas=p.fechas.slice();p.fechas[i]=nd;layer='';put(p);toast('Fecha cambiada')});break}
    case 'cobrarpick':sheetPickCobro();break;
    case 'cobrar':sheetCobrar(v);break;
    case 'ncuo':{const f=$('#fcob');const p=S.items[f.dataset.p];const pend=loanStatus(p).cuotas.filter(x=>x.st!=='p'&&x.st!=='t');const n=Math.max(1,Math.min(pend.length,f._sel.size+(+v)));f._sel=new Set(pend.slice(0,n).map(x=>x.i));cobCalc(true);break}
    case 'wa':{const p=S.items[v];const cl=S.items[p.cliente];const s=loanStatus(p);if(el.dataset.k==='prox'&&!s.next){toast('No tiene cuotas pendientes');break}if(!cl.cel){toast('Este cliente no tiene celular guardado');}waOpen(cl.cel,waMsg(el.dataset.k,cl,s,p));break}
    case 'recibo':{const p=S.items[v];const s=loanStatus(p);const last=s.pagos[s.pagos.length-1];if(!last){toast('Aún no hay pagos para el recibo');break}const cl=S.items[p.cliente];waOpen(cl.cel,waMsg('recibo',cl,s,{pago:last,s,loan:p}));break}
    case 'sendrecibo':{const pg=S.items[v];const p=S.items[pg.prestamo];const cl=S.items[p.cliente];const s=loanStatus(p);layer='';render();waOpen(cl.cel,waMsg('recibo',cl,s,{pago:pg,s,loan:p}));break}
    case 'delpago':withLock(()=>{if(confirm('¿Borrar este pago?')){const pg=S.items[v];layer='';del(v,`pago de ${money(pg.monto)}`)}else render()});break;
    case 'delloan':withLock(()=>{layer='';if(confirm('¿Borrar este préstamo y sus pagos?')){items('pago').filter(x=>x.prestamo===v).forEach(x=>{x.del=true;put(x,true)});del(v,'un préstamo');S.me.view='prestamos'}render()});break;
    case 'editcl':sheetEditCl(v);break;
