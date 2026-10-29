/* NEXO Finanzas — service worker. Cambiar VERSION hace que la app muestre "Actualizar". */
const VERSION='1.2.0';
const SHELL='nf-shell-'+VERSION, FONTS='nf-fonts', DATA='nf-data';
const FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-180.png'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys()){if(k.startsWith('nf-shell-')&&k!==SHELL)await caches.delete(k);}
  await self.clients.claim();})());});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.origin===location.origin){
    if(u.pathname.endsWith('version.json'))return;           // siempre de la red
    e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).catch(()=>caches.match('index.html'))));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(FONTS).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r;}));
  }
});

/*FX-START*/
/* Tasas: Coinbase se actualiza varias veces por hora; open.er-api.com (1 vez al día) queda de respaldo */
async function fetchRateData(){
  try{const r=await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD',{cache:'no-store'});
    if(r.ok){const j=await r.json();const cop=+j.data.rates.COP, eur=+j.data.rates.EUR; if(cop>1000&&eur>0)return {USD:Math.round(cop*100)/100,EUR:Math.round(cop/eur*100)/100,src:'Coinbase'};}}catch(e){}
  try{const r=await fetch('https://open.er-api.com/v6/latest/USD',{cache:'no-store'});
    if(r.ok){const j=await r.json();const cop=+j.rates.COP, eur=+j.rates.EUR; if(cop>1000&&eur>0)return {USD:Math.round(cop*100)/100,EUR:Math.round(cop/eur*100)/100,src:'open.er-api.com'};}}catch(e){}
  return null;
}
function addHistPoint(hist,p){
  if(!p||!(p.USD>0))return hist;
  if(hist.some(x=>Math.abs(x.ts-p.ts)<20*60e3))return hist;
  hist.push({ts:p.ts,USD:p.USD,EUR:p.EUR}); hist.sort((a,b)=>a.ts-b.ts);
  const lim=p.ts-60*864e5; while(hist.length&&(hist[0].ts<lim||hist.length>500))hist.shift();
  return hist;
}
/* Alertas: comparan el precio de ahora con el promedio de los últimos 7 días.
   Solo sugieren comprar lo que necesitas cuando está barato y vender lo que te sobra cuando está caro. */
function fxSignals(hist,sum){
  const out=[], now=Date.now(), day=new Date().toISOString().slice(0,10);
  const n0=v=>'$'+Math.round(v).toLocaleString('es-CO'), p1=v=>(Math.abs(v)*100).toFixed(1).replace('.',',');
  for(const cur of ['USD','EUR']){
    const name=cur==='USD'?'dólar':'euro', sym=cur==='USD'?'US$':'€';
    const fc=v=>sym+v.toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2});
    const pts=hist.filter(p=>p[cur]>0&&p.ts>=now-7*864e5);
    if(pts.length<4||(pts[pts.length-1].ts-pts[0].ts)<2*864e5)continue;
    const last=pts[pts.length-1][cur], avg=pts.reduce((a,p)=>a+p[cur],0)/pts.length, ch=last/avg-1;
    const s=(sum&&sum[cur])||{bal:0,need:0,basis:0};
    if(ch<=-0.015&&s.need>s.bal+0.5){const falta=s.need-s.bal;
      out.push({key:cur+'-compra-'+day,lv:'good',ic:'💱',ti:`El ${name} está ${p1(ch)} % más barato que su promedio de 7 días`,
        tx:`Buen momento para pasar unos ${n0(falta*last)} a ARQ (${fc(falta)}) para tus suscripciones del próximo mes. Compra solo lo que vas a usar.`});}
    else if(ch>=0.015&&s.bal>s.need+1){const sobra=s.bal-s.need, val=sobra*last, cost=s.bal>0?s.basis*sobra/s.bal:0;
      out.push({key:cur+'-venta-'+day,lv:'good',ic:'💱',ti:`El ${name} está ${p1(ch)} % más caro que su promedio de 7 días`,
        tx:`Tienes ${fc(sobra)} que no necesitas para suscripciones. Si los pasas a pesos recibes cerca de ${n0(val)}`+(cost>0?` (te costaron ${n0(cost)}: ${val>=cost?'ganas':'pierdes'} ${n0(Math.abs(val-cost))})`:'')+'. Esa plata puede ir a tus metas.'});}
  }
  return out;
}


/* Revisión del dólar/euro con la app cerrada (Android decide la hora exacta) */
self.addEventListener('periodicsync',e=>{if(e.tag==='tasas')e.waitUntil(bgRates());});
async function readJSON(c,k,def){try{const r=await c.match(k);return r?await r.json():def;}catch(e){return def;}}
async function bgRates(){
  const d=await fetchRateData(); if(!d)return;
  const c=await caches.open(DATA); const st=await readJSON(c,'rates.json',{hist:[],seen:{}});
  const ts=Date.now(); st.latest={ts,USD:d.USD,EUR:d.EUR,src:d.src}; st.hist=addHistPoint(st.hist||[],{ts,USD:d.USD,EUR:d.EUR}); st.seen=st.seen||{};
  const sum=await readJSON(c,'resumen.json',null);
  if(sum&&sum.notif){for(const x of fxSignals(st.hist,sum)){if(st.seen[x.key])continue;
    await self.registration.showNotification(x.ti,{body:x.tx,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:x.key}); st.seen[x.key]=ts;}}
  await c.put('rates.json',new Response(JSON.stringify(st),{headers:{'content-type':'application/json'}}));
}
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{
  const all=await self.clients.matchAll({type:'window'}); if(all[0])return all[0].focus(); return self.clients.openWindow('./');})());});
