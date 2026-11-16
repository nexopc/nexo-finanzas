/* Oro y Préstamos — modo sin internet. La página siempre se pide primero a la red (así llegan las mejoras). */
const VERSION='1.2.0';
const SHELL='oro-shell-'+VERSION;
const FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-180.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('oro-shell-')&&k!==SHELL)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(SHELL).then(c=>c.put('index.html',cp));return r}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
