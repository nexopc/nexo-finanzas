/* NEXO Finanzas — service worker. Cambiar VERSION hace que la app muestre "Actualizar". */
const VERSION='__VERSION__';
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

/*FX*/

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
