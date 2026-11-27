function waMsg(kind,cl,s,p){
  const c=cfg()||{};const tono=c.tono||'Amable';const nom=(cl.nombre||'').split(' ')[0];const neg=c.nombre||'';
  if(kind==='hoy'){const m=money(s.debeHoy||s.hoy?.v||p.cuota);
    if(tono==='Formal')return `Buen día, ${cl.nombre}. Le recordamos el pago de su cuota por ${m}, con vencimiento hoy. Atentamente, ${neg}.`;
    if(tono==='Directo')return `${nom}, hoy vence su cuota de ${m}. Quedo atento al pago.`;
    return `Buenos días, ${nom} 😊 Le recuerdo su cuota de ${m} de hoy. ¡Muchas gracias!`}
  if(kind==='atraso'){const m=money(s.atraso+s.mora);const n=s.vencidas;
    if(tono==='Formal')return `Buen día, ${cl.nombre}. Su préstamo presenta ${n} cuota(s) vencida(s) por un total de ${m}. Le agradecemos ponerse al día. ${neg}.`;
    if(tono==='Directo')return `${nom}, tiene ${n} cuota(s) atrasada(s): ${m}. Necesito el pago hoy, por favor.`;
    return `Hola, ${nom}. Le escribo porque tiene ${n} cuota(s) pendiente(s) por ${m}. ¿Me confirma cuándo puede ponerse al día? Gracias 🙏`}
  if(kind==='prox'){const m=money(s.next.st==='ab'?s.next.falta:s.next.v);const f=fdate(s.next.f);
    if(tono==='Formal')return `Buen día, ${cl.nombre}. Le recordamos que el ${f} vence su cuota por ${m}. ${neg}.`;
    if(tono==='Directo')return `${nom}, el ${f} vence su cuota de ${m}.`;
    return `Hola, ${nom} 😊 Le recuerdo que el ${f} vence su cuota de ${m}. ¡Gracias!`}
  if(kind==='recibo'){const x=p;return `🧾 *Recibo – ${neg}*\nCliente: ${cl.nombre}\nFecha: ${fdate(x.pago.fecha)}\nRecibido: ${money(x.pago.monto+(x.pago.mora||0))}${x.pago.mora?` (incluye mora ${money(x.pago.mora)})`:''}\nCuotas pagadas: ${x.s.pagadas} de ${x.loan.n}\nSaldo pendiente: ${money(x.s.saldo)}\n¡Gracias por su pago!`}
  return ''
}
function waOpen(cel,txt){const d=digits(cel);const num=d?(d.length===10?'57'+d:d):'';location.href=`https://wa.me/${num}?text=${encodeURIComponent(txt)}`}
